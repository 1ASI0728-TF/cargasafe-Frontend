import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import {
  FAKE_DB_STORAGE_KEY,
  getDb,
  IOT_SIM_STORAGE_PREFIX,
  nextId,
  nowIso,
  onDbChange,
  saveDb,
} from '../fake-backend/fake-db';

export type SensorStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface SensorTickPoint {
  /** epoch milliseconds — used to slice the history by time window */
  timestamp: number;
  /** pre-formatted local time, handy for tables/tooltips */
  time: string;
  temperature: number;
  humidity: number;
  vibration: number;
}

export interface VehicleSimState {
  temperature: number;
  humidity: number;
  vibration: number;
  tempBaseline: number;
  humidityBaseline: number;
  vibrationBaseline: number;
  history: SensorTickPoint[];
  updatedAt: string;
}

export interface TemperatureRules {
  minTemperature: number;
  maxTemperature: number;
  minHumidity: number;
  maxHumidity: number;
  maxVibration: number;
  /** whether these thresholds come from the vehicle's active trip cargo parameters, or a generic ambient default */
  source: 'trip' | 'ambient';
  tripId?: number;
}

const TICK_INTERVAL_MS = 2000;
// 200 points * 2s = ~6.6 minutes of buffered history, comfortably covers the
// 10s / 1m / 5m timeline options in the Monitoring detail view.
const HISTORY_MAX_POINTS = 200;

const DEFAULT_TEMP_BASELINE = 20;
const DEFAULT_HUMIDITY_BASELINE = 84;
const DEFAULT_VIBRATION_BASELINE = 0.6;

// Ambient (no active trip) safe ranges, used both for status colouring and
// for the automatic-alert rule when a vehicle isn't carrying temperature-
// sensitive cargo right now.
const AMBIENT_TEMP_MIN = 15;
const AMBIENT_TEMP_MAX = 25;
const AMBIENT_HUMIDITY_MIN = 75;
const AMBIENT_HUMIDITY_MAX = 92;
const AMBIENT_MAX_VIBRATION = 3.5;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatTime(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * IOT SIMULATION SERVICE
 * ------------------------------------------------------------------
 * Centralises the "fake IoT device" that used to live only inside the
 * Monitoring screen. It now runs as a single global loop (started the
 * moment the app boots, see `app.ts`) so that:
 *
 *  - The Monitoring screen, the Dashboard's "Recent Trips" detail chart,
 *    and any other screen all read the exact same live numbers for a
 *    given vehicle.
 *  - Sensor data keeps flowing (and can keep raising alerts) even while
 *    the operator is on a different screen.
 *  - Only vehicles with an assigned IoT device ever produce readings —
 *    with the demo seed (1 device / 2 trucks) that means exactly one
 *    vehicle is "live" at a time, which is what makes the "no device
 *    assigned" / "trip not started" / "trip completed" states possible.
 */
@Injectable({ providedIn: 'root' })
export class IotSimulationService {
  private stateSignals = new Map<number, WritableSignal<VehicleSimState>>();
  private criticalFlags = new Map<number, boolean>();
  private intervalId?: ReturnType<typeof setInterval>;

  constructor() {
    this.startLoop();
    // If the database gets reset (e.g. via the hidden long-press trick),
    // drop any in-memory state so the next tick reloads fresh defaults.
    onDbChange(() => {
      // Only react to resets, which wipe the DB storage key; cheap check:
      // if a vehicle we track no longer exists, forget its signal.
      const db = getDb();
      const validIds = new Set(db.vehicles.map((v) => v.id));
      for (const id of Array.from(this.stateSignals.keys())) {
        if (!validIds.has(id)) {
          this.stateSignals.delete(id);
          this.criticalFlags.delete(id);
        }
      }
    });
  }

  private startLoop(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tickAllDevices(), TICK_INTERVAL_MS);
  }

  private tickAllDevices(): void {
    const db = getDb();
    for (const vehicle of db.vehicles) {
      if (vehicle.deviceImeis?.length) {
        this.tickVehicle(vehicle.id);
      }
    }
  }

  // ---------------- Public API ----------------

  /** Whether the given vehicle currently has an IoT device assigned. */
  hasDevice(vehicleId: number): boolean {
    const vehicle = getDb().vehicles.find((v) => v.id === vehicleId);
    return !!vehicle?.deviceImeis?.length;
  }

  /** Reactive signal with the vehicle's current reading + rolling history. Safe to call even without a device. */
  getState(vehicleId: number): Signal<VehicleSimState> {
    return this.ensureSignal(vehicleId).asReadonly();
  }

  /** Synchronous snapshot, handy outside of a reactive context. */
  getSnapshot(vehicleId: number): VehicleSimState {
    return this.ensureSignal(vehicleId)();
  }

  /** History points within the last `windowMs` milliseconds. */
  historyWindow(vehicleId: number, windowMs: number): SensorTickPoint[] {
    const cutoff = Date.now() - windowMs;
    return this.getSnapshot(vehicleId).history.filter((p) => p.timestamp >= cutoff);
  }

  computeStatus(temperature: number, rules: TemperatureRules): SensorStatus {
    return this.rangeStatus(temperature, rules.minTemperature, rules.maxTemperature);
  }

  /** Generic threshold check reused for both temperature and humidity: NORMAL / WARNING (near the edge) / CRITICAL (out of range). */
  rangeStatus(value: number, min: number, max: number): SensorStatus {
    const span = Math.max(max - min, 0.1);
    const warnMargin = span * 0.15;
    if (value < min || value > max) return 'CRITICAL';
    if (value < min + warnMargin || value > max - warnMargin) return 'WARNING';
    return 'NORMAL';
  }

  /**
   * Temperature/humidity thresholds that apply right now for this vehicle:
   * the configured cargo parameters of its active trip if it has one,
   * otherwise a generic ambient safe range.
   */
  getRules(vehicleId: number): TemperatureRules {
    const db = getDb();
    const activeTrip = db.trips.find((t) => t.vehicleId === vehicleId && t.status === 'IN_PROGRESS');
    const params = activeTrip ? db.tripParameters.find((p) => p.tripId === activeTrip.id) : undefined;

    if (activeTrip && params) {
      return {
        minTemperature: params.minTemperature ?? AMBIENT_TEMP_MIN,
        maxTemperature: params.maxTemperature ?? AMBIENT_TEMP_MAX,
        minHumidity: params.minHumidity ?? AMBIENT_HUMIDITY_MIN,
        maxHumidity: params.maxHumidity ?? AMBIENT_HUMIDITY_MAX,
        maxVibration: params.maxVibration ?? AMBIENT_MAX_VIBRATION,
        source: 'trip',
        tripId: activeTrip.id,
      };
    }

    return {
      minTemperature: AMBIENT_TEMP_MIN,
      maxTemperature: AMBIENT_TEMP_MAX,
      minHumidity: AMBIENT_HUMIDITY_MIN,
      maxHumidity: AMBIENT_HUMIDITY_MAX,
      maxVibration: AMBIENT_MAX_VIBRATION,
      source: 'ambient',
    };
  }

  /** Hidden test hook (kept for parity with the previous Monitoring shortcut): nudges the baseline and ticks immediately. */
  nudgeTemperatureBaseline(vehicleId: number, delta: number): void {
    const sig = this.ensureSignal(vehicleId);
    const prev = sig();
    sig.set({ ...prev, tempBaseline: round1(prev.tempBaseline + delta) });
    this.tickVehicle(vehicleId);
  }

  // ---------------- Internal ----------------

  private ensureSignal(vehicleId: number): WritableSignal<VehicleSimState> {
    let sig = this.stateSignals.get(vehicleId);
    if (!sig) {
      sig = signal<VehicleSimState>(this.loadInitialState(vehicleId));
      this.stateSignals.set(vehicleId, sig);
    }
    return sig;
  }

  private storageKey(vehicleId: number): string {
    return `${IOT_SIM_STORAGE_PREFIX}${vehicleId}`;
  }

  private loadInitialState(vehicleId: number): VehicleSimState {
    try {
      const raw = localStorage.getItem(this.storageKey(vehicleId));
      if (raw) {
        const parsed = JSON.parse(raw) as VehicleSimState;
        if (parsed && Array.isArray(parsed.history)) return parsed;
      }
    } catch {
      // fall through to defaults if the stored snapshot is corrupted
    }

    return {
      temperature: DEFAULT_TEMP_BASELINE,
      humidity: DEFAULT_HUMIDITY_BASELINE,
      vibration: DEFAULT_VIBRATION_BASELINE,
      tempBaseline: DEFAULT_TEMP_BASELINE,
      humidityBaseline: DEFAULT_HUMIDITY_BASELINE,
      vibrationBaseline: DEFAULT_VIBRATION_BASELINE,
      history: [],
      updatedAt: nowIso(),
    };
  }

  private persist(vehicleId: number, state: VehicleSimState): void {
    try {
      localStorage.setItem(this.storageKey(vehicleId), JSON.stringify(state));
    } catch {
      // localStorage might be unavailable (e.g. private browsing quota) — safe to ignore in a demo
    }
  }

  private tickVehicle(vehicleId: number): void {
    const sig = this.ensureSignal(vehicleId);
    const prev = sig();

    const tempNoise = Math.random() * 2 - 1; // ±1°C
    const humidityNoise = Math.random() * 2 - 1; // ±1%
    const vibrationNoise = Math.random() * 0.6 - 0.3; // ±0.3g
    const vibrationSpike = Math.random() < 0.05 ? Math.random() * 2.2 : 0; // occasional bump/pothole

    const now = Date.now();
    const point: SensorTickPoint = {
      timestamp: now,
      time: formatTime(now),
      temperature: round1(prev.tempBaseline + tempNoise),
      humidity: round1(clamp(prev.humidityBaseline + humidityNoise, 0, 100)),
      vibration: round2(Math.max(0, prev.vibrationBaseline + vibrationNoise + vibrationSpike)),
    };

    const next: VehicleSimState = {
      ...prev,
      temperature: point.temperature,
      humidity: point.humidity,
      vibration: point.vibration,
      history: [...prev.history, point].slice(-HISTORY_MAX_POINTS),
      updatedAt: new Date(now).toISOString(),
    };

    sig.set(next);
    this.persist(vehicleId, next);
    this.maybeRaiseAlert(vehicleId, next);
  }

  private maybeRaiseAlert(vehicleId: number, state: VehicleSimState): void {
    const db = getDb();
    const vehicle = db.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    const rules = this.getRules(vehicleId);
    const status = this.computeStatus(state.temperature, rules);
    const wasCritical = this.criticalFlags.get(vehicleId) ?? false;

    if (status !== 'CRITICAL') {
      this.criticalFlags.set(vehicleId, false);
      return;
    }
    if (wasCritical) return; // already raised, wait until it recovers before raising again
    this.criticalFlags.set(vehicleId, true);

    const isHigh = state.temperature > rules.maxTemperature;
    const rangeText = `${rules.minTemperature}°C–${rules.maxTemperature}°C`;
    const description = isHigh
      ? `Temperatura de ${state.temperature}°C detectada en ${vehicle.plate} — por encima del rango permitido (${rangeText}).`
      : `Temperatura de ${state.temperature}°C detectada en ${vehicle.plate} — por debajo del rango permitido (${rangeText}).`;

    db.alerts.unshift({
      id: nextId(db.alerts),
      alertType: isHigh ? 'High Temperature' : 'Low Temperature',
      alertStatus: 'OPEN',
      createdAt: nowIso(),
      closedAt: null,
      description,
      incidents: [],
      notifications: [],
    });
    saveDb(db);
  }
}

// Re-exported so components/tests can reference the storage key without a
// second hard-coded string, without pulling in the whole fake-db module.
export { FAKE_DB_STORAGE_KEY };
