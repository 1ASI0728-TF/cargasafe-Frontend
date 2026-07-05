import {
  Component,
  OnInit,
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
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { FleetStore } from '../../../../fleet/application/fleet.store';
import { Vehicle } from '../../../../fleet/domain/model/vehicle.model';
import { Device } from '../../../../fleet/domain/model/device.model';
import {
  IotSimulationService,
  SensorStatus,
  SensorTickPoint,
  TemperatureRules,
} from '../../../../core/iot-simulation/iot-simulation.service';

type TimelineWindow = '10s' | '1m' | '5m';

const WINDOW_MS: Record<TimelineWindow, number> = {
  '10s': 10_000,
  '1m': 60_000,
  '5m': 5 * 60_000,
};

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
    MatButtonModule,
    MatButtonToggleModule,
  ],
  templateUrl: './vehicle-monitoring.component.html',
  styleUrls: ['./vehicle-monitoring.component.css'],
})
export class VehicleMonitoringComponent implements OnInit {
  private fleetStore = inject(FleetStore);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private iot = inject(IotSimulationService);

  private initialVehiclePicked = false;

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

  hasDevice = computed(() => {
    const vehicle = this.selectedVehicle();
    return !!vehicle?.id && this.iot.hasDevice(vehicle.id);
  });

  // ---------------- Live sensor data (shared engine, ticks in the background app-wide) ----------------
  private simState = computed(() => {
    const vehicle = this.selectedVehicle();
    if (!vehicle?.id) return null;
    return this.iot.getState(vehicle.id)();
  });

  temperature = computed(() => this.simState()?.temperature ?? 0);
  humidity = computed(() => this.simState()?.humidity ?? 0);
  history = computed<SensorTickPoint[]>(() => this.simState()?.history ?? []);
  lastUpdate = computed(() => new Date(this.simState()?.updatedAt ?? Date.now()));

  rules = computed<TemperatureRules>(() => {
    const vehicle = this.selectedVehicle();
    return this.iot.getRules(vehicle?.id ?? -1);
  });

  temperatureStatus = computed<SensorStatus>(() =>
    this.iot.rangeStatus(this.temperature(), this.rules().minTemperature, this.rules().maxTemperature)
  );
  humidityStatus = computed<SensorStatus>(() =>
    this.iot.rangeStatus(this.humidity(), this.rules().minHumidity, this.rules().maxHumidity)
  );
  overallStatus = computed<SensorStatus>(() => worstStatus(this.temperatureStatus(), this.humidityStatus()));

  alertBanner = computed<string | null>(() =>
    this.hasDevice() && this.temperatureStatus() === 'CRITICAL'
      ? '⚠️ Temperatura fuera de rango — se generó una alerta automática. Revisa la sección "Alerts".'
      : null
  );

  // ---------------- Temperature detail overlay (click-to-expand) ----------------
  showTempDetail = signal(false);
  timelineWindow = signal<TimelineWindow>('1m');

  private windowMs = computed(() => WINDOW_MS[this.timelineWindow()]);

  detailHistory = computed<SensorTickPoint[]>(() => {
    const cutoff = Date.now() - this.windowMs();
    return this.history().filter((p) => p.timestamp >= cutoff);
  });

  // Auto-selects the first vehicle with an assigned IoT device once the fleet loads.
  private autoSelectEffect = effect(() => {
    const vehicles = this.vehicles();
    if (vehicles.length === 0 || this.initialVehiclePicked) return;

    if (this.selectedVehicleId() == null) {
      const withDevice = vehicles.find((v) => (v.deviceImeis?.length ?? 0) > 0);
      const fallback = withDevice ?? vehicles[0];
      this.selectedVehicleId.set(fallback.id ?? null);
    }
    this.initialVehiclePicked = true;
  });

  ngOnInit(): void {
    this.fleetStore.loadVehicles();
    this.fleetStore.loadDevices();

    const queryVehicleId = Number(this.route.snapshot.queryParamMap.get('vehicleId'));
    if (queryVehicleId) {
      this.selectedVehicleId.set(queryVehicleId);
      this.initialVehiclePicked = true;
    }
  }

  // ---------------- Hidden test shortcut: N = -1°C, M = +1°C ----------------
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
      return;
    }

    const vehicle = this.selectedVehicle();
    if (!vehicle?.id || !this.hasDevice()) return;

    const key = event.key.toLowerCase();
    if (key === 'n') {
      this.iot.nudgeTemperatureBaseline(vehicle.id, -1);
    } else if (key === 'm') {
      this.iot.nudgeTemperatureBaseline(vehicle.id, 1);
    }
  }

  selectVehicle(vehicleId: number): void {
    if (vehicleId === this.selectedVehicleId()) return;
    this.selectedVehicleId.set(vehicleId);
    this.showTempDetail.set(false);
    this.cdr.detectChanges();
  }

  openTempDetail(): void {
    if (!this.hasDevice()) return;
    this.showTempDetail.set(true);
  }

  closeTempDetail(): void {
    this.showTempDetail.set(false);
  }

  selectTimelineWindow(window: TimelineWindow): void {
    this.timelineWindow.set(window);
  }

  trackByTime = (_: number, point: SensorTickPoint) => point.timestamp;

  /** Builds an SVG polyline `points` attribute for a small inline sparkline. */
  sparklinePoints(metric: 'temperature' | 'humidity'): string {
    return this.buildPolyline(this.history(), metric, 260, 56);
  }

  /** Same idea but larger, and scoped to the selected timeline window, for the expanded detail view. */
  detailChartPoints(): string {
    return this.buildPolyline(this.detailHistory(), 'temperature', 640, 220);
  }

  /** Y position (in the detail chart's coordinate space) of a threshold line, for min/max rule markers. */
  detailThresholdY(value: number): number {
    const points = this.detailHistory();
    const height = 220;
    if (points.length === 0) return height / 2;
    const values = points.map((p) => p.temperature);
    const min = Math.min(...values, this.rules().minTemperature);
    const max = Math.max(...values, this.rules().maxTemperature);
    const range = max - min || 1;
    return height - ((value - min) / range) * height;
  }

  private buildPolyline(
    points: SensorTickPoint[],
    metric: 'temperature' | 'humidity',
    width: number,
    height: number
  ): string {
    if (points.length < 2) return '';

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
