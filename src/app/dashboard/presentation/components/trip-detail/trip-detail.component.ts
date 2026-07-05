import { Component, OnInit, ChangeDetectorRef, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../../application/services/dashboard.service';
import { IotSimulationService, VehicleSimState } from '../../../../core/iot-simulation/iot-simulation.service';

type ViewMode = 'LIVE' | 'HISTORY' | 'NOT_STARTED' | 'CANCELLED' | 'NO_DEVICE';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, MatIconModule],
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.css']
})
export class TripDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  private iot = inject(IotSimulationService);

  /** Raw analytics-trip JSON (includes vehicleId/deviceId/hasDevice, unlike the strongly-typed Trip model). */
  trip: any = null;
  loading = true;

  // Datos de temperatura
  temperatureData: any[] = [];
  temperatureChartData: any[] = [];

  // Datos de vibración
  vibrationData: any[] = [];
  vibrationChartData: any[] = [];

  // Configuración de gráficos
  view: [number, number] = [600, 350];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Time';
  yAxisLabelTemp = 'Temperature (°C)';
  yAxisLabelVib = 'Vibration (g)';
  timeline = true;
  autoScale = true;

  // Esquemas de colores personalizados
  temperatureColorScheme: any = {
    domain: ['#3b82f6', '#ef4444', '#f59e0b']
  };

  vibrationColorScheme: any = {
    domain: ['#E7F7DD', '#9263F8']
  };

  // Límites de temperatura y vibración (se cargan desde los parámetros reales del viaje)
  tempUpperLimit = 8;
  tempLowerLimit = 2;
  vibrationSafeLimit = 2.0;

  // Estadísticas
  stats = {
    temperature: { min: 0, max: 0, avg: 0 },
    vibration: { min: 0, max: 0, avg: 0, alertCount: 0 }
  };

  lastLiveUpdate: Date | null = null;

  /** Vehicle currently streaming live data into this view (null while HISTORY/NOT_STARTED/etc). */
  private liveVehicleId = signal<number | null>(null);

  // Reacts to every tick of the shared IoT simulation for the trip's vehicle, as
  // long as this trip is IN_PROGRESS and has a device assigned (see loadTrip()).
  private liveEffect = effect(() => {
    const vehicleId = this.liveVehicleId();
    if (vehicleId == null) return;
    const state = this.iot.getState(vehicleId)();
    this.updateLiveCharts(state);
  });

  get viewMode(): ViewMode {
    if (!this.trip) return 'NOT_STARTED';
    switch (this.trip.status) {
      case 'CANCELLED':
        return 'CANCELLED';
      case 'CREATED':
        return 'NOT_STARTED';
      case 'COMPLETED':
        return 'HISTORY';
      case 'IN_PROGRESS':
        return this.trip.hasDevice ? 'LIVE' : 'NO_DEVICE';
      default:
        return 'HISTORY';
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const tripId = params['id'];
      this.loadTrip(tripId);
    });
  }

  loadTrip(tripId: string) {
    this.loading = true;
    this.liveVehicleId.set(null); // stop any previous live subscription before loading the new trip
    this.cdr.detectChanges();

    this.dashboardService.getTripRawById(tripId).subscribe({
      next: (trip) => {
        this.trip = trip;
        this.loading = false;
        this.temperatureData = [];
        this.vibrationData = [];
        this.temperatureChartData = [];
        this.vibrationChartData = [];

        const mode = this.viewMode;

        if (mode === 'HISTORY') {
          this.dashboardService.getTripParameters(String(trip.id)).subscribe((params) => {
            this.applyLimits(params);
            this.generateHistoricalData();
            this.prepareChartData();
            this.calculateStats();
            this.cdr.detectChanges();
          });
        } else if (mode === 'LIVE') {
          this.dashboardService.getTripParameters(String(trip.id)).subscribe((params) => {
            this.applyLimits(params);
            // Setting this signal is what kicks off `liveEffect` above, which then
            // keeps redrawing the chart on every tick of the shared IoT simulation.
            this.liveVehicleId.set(trip.vehicleId);
            this.cdr.detectChanges();
          });
        } else {
          // NOT_STARTED / CANCELLED / NO_DEVICE: nothing to chart, just show the empty state.
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('❌ Error loading trip:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private applyLimits(params: { minTemperature: number; maxTemperature: number; maxVibration: number } | null): void {
    this.tempUpperLimit = params?.maxTemperature ?? 8;
    this.tempLowerLimit = params?.minTemperature ?? 2;
    this.vibrationSafeLimit = params?.maxVibration ?? 2.0;
  }

  /** Builds a one-time, frozen dataset for a COMPLETED trip — this view never ticks live again. */
  private generateHistoricalData() {
    const start = new Date(this.trip.startDate).getTime();
    const end = this.trip.endDate ? new Date(this.trip.endDate).getTime() : start + 12 * 60 * 60 * 1000;
    const span = Math.max(end - start, 30 * 60 * 1000);
    const intervals = 24;
    const step = span / intervals;

    for (let i = 0; i < intervals; i++) {
      const time = new Date(start + i * step);
      const temp = this.tempLowerLimit + Math.random() * (this.tempUpperLimit - this.tempLowerLimit);
      const isOutOfRange = temp > this.tempUpperLimit || temp < this.tempLowerLimit;

      this.temperatureData.push({
        timestamp: time,
        temperature: parseFloat(temp.toFixed(1)),
        upperLimit: this.tempUpperLimit,
        lowerLimit: this.tempLowerLimit,
        alert: isOutOfRange
      });
    }

    for (let i = 0; i < intervals; i++) {
      const time = new Date(start + i * step);
      const vib = Math.random() * (this.vibrationSafeLimit + 1.5);
      const isAlert = vib > this.vibrationSafeLimit;

      this.vibrationData.push({
        timestamp: time,
        vibration: parseFloat(vib.toFixed(1)),
        safeZone: this.vibrationSafeLimit,
        alert: isAlert
      });
    }
  }

  /** Redraws the charts from the shared IoT simulation's rolling history — called on every ~2s tick while LIVE. */
  private updateLiveCharts(state: VehicleSimState): void {
    this.temperatureData = state.history.map((p) => ({
      timestamp: new Date(p.timestamp),
      temperature: p.temperature,
      upperLimit: this.tempUpperLimit,
      lowerLimit: this.tempLowerLimit,
      alert: p.temperature > this.tempUpperLimit || p.temperature < this.tempLowerLimit
    }));

    this.vibrationData = state.history.map((p) => ({
      timestamp: new Date(p.timestamp),
      vibration: p.vibration,
      safeZone: this.vibrationSafeLimit,
      alert: p.vibration > this.vibrationSafeLimit
    }));

    this.prepareChartData();
    this.calculateStats();
    this.lastLiveUpdate = new Date(state.updatedAt);
    this.cdr.detectChanges();
  }

  private prepareChartData() {
    this.temperatureChartData = [
      {
        name: 'Temperatura (°C)',
        series: this.temperatureData.map(d => ({
          name: this.formatTime(d.timestamp),
          value: d.temperature,
          extra: { alert: d.alert }
        }))
      },
      {
        name: `Límite Superior (${this.tempUpperLimit}°C)`,
        series: this.temperatureData.map(d => ({
          name: this.formatTime(d.timestamp),
          value: this.tempUpperLimit
        }))
      },
      {
        name: `Límite Inferior (${this.tempLowerLimit}°C)`,
        series: this.temperatureData.map(d => ({
          name: this.formatTime(d.timestamp),
          value: this.tempLowerLimit
        }))
      }
    ];

    this.vibrationChartData = [
      {
        name: 'Zona Segura',
        series: this.vibrationData.map(d => ({
          name: this.formatTime(d.timestamp),
          value: this.vibrationSafeLimit
        }))
      },
      {
        name: 'Vibración Detectada (g)',
        series: this.vibrationData.map(d => ({
          name: this.formatTime(d.timestamp),
          value: d.vibration,
          extra: { alert: d.alert }
        }))
      }
    ];
  }

  private calculateStats() {
    if (this.temperatureData.length === 0) return;

    const temps = this.temperatureData.map(d => d.temperature);
    this.stats.temperature.min = Math.min(...temps);
    this.stats.temperature.max = Math.max(...temps);
    this.stats.temperature.avg = parseFloat((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1));

    const vibs = this.vibrationData.map(d => d.vibration);
    this.stats.vibration.min = Math.min(...vibs);
    this.stats.vibration.max = Math.max(...vibs);
    this.stats.vibration.avg = parseFloat((vibs.reduce((a, b) => a + b, 0) / vibs.length).toFixed(1));
    this.stats.vibration.alertCount = this.vibrationData.filter(d => d.alert).length;
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return this.viewMode === 'LIVE' ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTemperatureAlerts() {
    return this.temperatureData.filter(d => d.alert);
  }

  getVibrationAlerts() {
    return this.vibrationData.filter(d => d.alert);
  }

  onChartSelect(event: any) {
    console.log('Chart selection:', event);
  }
}
