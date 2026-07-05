import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FleetStore } from '../../../../fleet/application/fleet.store';
import { Vehicle } from '../../../../fleet/domain/model/vehicle.model';
import { Device } from '../../../../fleet/domain/model/device.model';
import { getDb, nextId, nowIso, saveDb } from '../../../../core/fake-backend/fake-db';

type SensorStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

interface HistoryPoint {
  time: string;
  temperature: number;
  humidity: number;
}

interface SimulationSnapshot {
  temperature: number;
  humidity: number;
  tempBaseline: number;
  humidityBaseline: number;
  history: HistoryPoint[];
  updatedAt: string;
}

const TEMP_BASELINE_DEFAULT = 20;
const HUMIDITY_BASELINE_DEFAULT = 84;
const TICK_INTERVAL_MS = 2500;
const HISTORY_LIMIT = 24;
const SIM_STORAGE_PREFIX = 'cargasafe_iot_sim::';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getTemperatureStatus(temp: number): SensorStatus {
  if (temp < 15 || temp > 25) return 'CRITICAL';
  if (temp < 18 || temp > 22) return 'WARNING';
  return 'NORMAL';
}

function getHumidityStatus(humidity: number): SensorStatus {
  if (humidity < 75 || humidity > 92) return 'CRITICAL';
  if (humidity < 80 || humidity > 88) return 'WARNING';
  return 'NORMAL';
}

function worstStatus(a: SensorStatus, b: SensorStatus): SensorStatus {
  const rank: Record<SensorStatus, number> = { NORMAL: 0, WARNING: 1, CRITICAL: 2 };
  return rank[a] >= rank[b] ? a : b;
}

@Component({
  selector: 'app-vehicle-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './vehicle-monitoring.component.html',
  styleUrls: ['./vehicle-monitoring.component.css'],
})
export class VehicleMonitoringComponent implements OnInit, OnDestroy {
  private fleetStore = inject(FleetStore);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  private intervalId?: ReturnType<typeof setInterval>;
  private initialStateLoaded = false;
  private criticalAlertRaised = false;

  // ---------------- Fleet data ----------------
  vehicles = computed<Vehicle[]>(() => this.fleetStore.vehiclesSig());
  devices = computed<Device[]>(() => this.fleetStore.devicesSig());
  vehiclesLoading = computed(() => this.fleetStore.vehiclesState.loading());

  selectedVehicleId = signal<number | null>(null);

  selectedVehicle = computed<Vehicle | null>(
    () => this.vehicles().find((v) => v.id === this.selectedVehicleId()) ?? null
  );

  selectedDevice = computed<Device | null>(() => {
    const vehicle = this.selectedVehicle();
    if (!vehicle || !vehicle.deviceImeis?.length) return null;
    return this.devices().find((d) => vehicle.deviceImeis.includes(d.imei)) ?? null;
  });

  // ---------------- Live simulated sensor data ----------------
  temperature = signal(TEMP_BASELINE_DEFAULT);
  humidity = signal(HUMIDITY_BASELINE_DEFAULT);
  lastUpdate = signal<Date>(new Date());
  history = signal<HistoryPoint[]>([]);
  alertBanner = signal<string | null>(null);

  private tempBaseline = TEMP_BASELINE_DEFAULT;
  private humidityBaseline = HUMIDITY_BASELINE_DEFAULT;

  temperatureStatus = computed<SensorStatus>(() => getTemperatureStatus(this.temperature()));
  humidityStatus = computed<SensorStatus>(() => getHumidityStatus(this.humidity()));
  overallStatus = computed<SensorStatus>(() =>
    worstStatus(this.temperatureStatus(), this.humidityStatus())
  );

  // Auto-selects the first vehicle with an assigned IoT device once the fleet loads.
  private autoSelectEffect = effect(() => {
    const vehicles = this.vehicles();
    if (vehicles.length === 0) return;

    if (this.selectedVehicleId() == null) {
      const withDevice = vehicles.find((v) => (v.deviceImeis?.length ?? 0) > 0);
      const fallback = withDevice ?? vehicles[0];
      this.selectedVehicleId.set(fallback.id ?? null);
    }

    if (!this.initialStateLoaded) {
      this.initialStateLoaded = true;
      this.loadSimulationState();
    }
  });

  ngOnInit(): void {
    this.fleetStore.loadVehicles();
    this.fleetStore.loadDevices();

    const queryVehicleId = Number(this.route.snapshot.queryParamMap.get('vehicleId'));
    if (queryVehicleId) {
      this.selectedVehicleId.set(queryVehicleId);
    }

    this.intervalId = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // ---------------- Hidden test shortcut: N = -1°C, M = +1°C ----------------
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === 'n') {
      this.tempBaseline = round1(this.tempBaseline - 1);
      this.tick();
    } else if (key === 'm') {
      this.tempBaseline = round1(this.tempBaseline + 1);
      this.tick();
    }
  }

  selectVehicle(vehicleId: number): void {
    if (vehicleId === this.selectedVehicleId()) return;
    this.selectedVehicleId.set(vehicleId);
    this.loadSimulationState();
    this.cdr.detectChanges();
  }

  private storageKeyForSelectedVehicle(): string | null {
    const id = this.selectedVehicleId();
    return id == null ? null : `${SIM_STORAGE_PREFIX}${id}`;
  }

  private loadSimulationState(): void {
    const key = this.storageKeyForSelectedVehicle();
    this.criticalAlertRaised = false;
    this.alertBanner.set(null);

    if (key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const snapshot = JSON.parse(raw) as SimulationSnapshot;
          this.tempBaseline = snapshot.tempBaseline ?? TEMP_BASELINE_DEFAULT;
          this.humidityBaseline = snapshot.humidityBaseline ?? HUMIDITY_BASELINE_DEFAULT;
          this.temperature.set(snapshot.temperature ?? TEMP_BASELINE_DEFAULT);
          this.humidity.set(snapshot.humidity ?? HUMIDITY_BASELINE_DEFAULT);
          this.history.set(snapshot.history ?? []);
          this.lastUpdate.set(new Date(snapshot.updatedAt ?? nowIso()));
          this.cdr.detectChanges();
          return;
        }
      } catch {
        // fall through to defaults if the stored snapshot is corrupted
      }
    }

    this.tempBaseline = TEMP_BASELINE_DEFAULT;
    this.humidityBaseline = HUMIDITY_BASELINE_DEFAULT;
    this.temperature.set(TEMP_BASELINE_DEFAULT);
    this.humidity.set(HUMIDITY_BASELINE_DEFAULT);
    this.history.set([]);
    this.tick();
  }

  private persistState(): void {
    const key = this.storageKeyForSelectedVehicle();
    if (!key) return;
    const snapshot: SimulationSnapshot = {
      temperature: this.temperature(),
      humidity: this.humidity(),
      tempBaseline: this.tempBaseline,
      humidityBaseline: this.humidityBaseline,
      history: this.history(),
      updatedAt: this.lastUpdate().toISOString(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(snapshot));
    } catch {
      // localStorage might be unavailable (e.g. private browsing quota) — safe to ignore in a demo
    }
  }

  private tick(): void {
    if (this.selectedVehicleId() == null) return;

    const tempNoise = Math.random() * 2 - 1; // ±1°C
    const humidityNoise = Math.random() * 2 - 1; // ±1%

    const nextTemp = round1(this.tempBaseline + tempNoise);
    const nextHumidity = round1(clamp(this.humidityBaseline + humidityNoise, 0, 100));
    const now = new Date();

    this.temperature.set(nextTemp);
    this.humidity.set(nextHumidity);
    this.lastUpdate.set(now);
    this.history.update((points) =>
      [
        ...points,
        {
          time: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          temperature: nextTemp,
          humidity: nextHumidity,
        },
      ].slice(-HISTORY_LIMIT)
    );

    this.checkForAutomaticAlert(nextTemp);
    this.persistState();
    this.cdr.detectChanges();
  }

  private checkForAutomaticAlert(temp: number): void {
    const status = getTemperatureStatus(temp);

    if (status !== 'CRITICAL') {
      this.criticalAlertRaised = false;
      return;
    }

    if (this.criticalAlertRaised) return;
    this.criticalAlertRaised = true;

    const vehicle = this.selectedVehicle();
    const plate = vehicle?.plate ?? 'vehículo';
    const isHigh = temp > 25;
    const description = isHigh
      ? `Temperatura simulada de ${temp}°C en ${plate} supera el máximo esperado (IoT monitoring).`
      : `Temperatura simulada de ${temp}°C en ${plate} está por debajo del mínimo esperado (IoT monitoring).`;

    const db = getDb();
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

    this.alertBanner.set('⚠️ Se generó una alerta automáticamente. Revisa la sección "Alerts".');
    setTimeout(() => {
      this.alertBanner.set(null);
      this.cdr.detectChanges();
    }, 5000);
  }

  trackByTime = (_: number, point: HistoryPoint) => point.time;

  /** Builds an SVG polyline `points` attribute from the recent history, for a tiny inline sparkline. */
  sparklinePoints(metric: 'temperature' | 'humidity'): string {
    const points = this.history();
    if (points.length < 2) return '';

    const width = 260;
    const height = 56;
    const values = points.map((p) => (metric === 'temperature' ? p.temperature : p.humidity));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step = width / (points.length - 1);

    return values
      .map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }
}
