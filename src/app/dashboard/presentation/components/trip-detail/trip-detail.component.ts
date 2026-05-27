import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Trip } from '../../../domain/entities';
import { DashboardService } from '../../../application/services/dashboard.service';

interface SensorData {
  name: string;
  value: number;
  timestamp: string;
  alert?: boolean;
}

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, MatIconModule],
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.css']
})
export class TripDetailComponent implements OnInit {
  trip!: Trip;
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
    // domain: ['#9263F8', '#E7F7DD']
    domain: ['#E7F7DD', '#9263F8']
  };

  // Límites de temperatura
  tempUpperLimit = 8;
  tempLowerLimit = 2;

  // Límite de vibración
  vibrationSafeLimit = 2.0;

  // Estadísticas
  stats = {
    temperature: {
      min: 0,
      max: 0,
      avg: 0
    },
    vibration: {
      min: 0,
      max: 0,
      avg: 0,
      alertCount: 0
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🔍 TripDetailComponent ngOnInit');
    this.route.params.subscribe(params => {
      const tripId = params['id'];
      console.log('🚗 Trip ID from route:', tripId);
      this.loadTrip(tripId);
    });
  }

  loadTrip(tripId: string) {
    console.log('📡 Loading trip with ID:', tripId);
    this.loading = true;
    this.cdr.detectChanges();
    
    this.dashboardService.getTripById(tripId).subscribe({
      next: (trip) => {
        console.log('✅ Trip loaded successfully:', trip);
        this.trip = trip;
        this.loading = false;
        this.generateMockData();
        this.prepareChartData();
        this.calculateStats();
        console.log('📊 Data generated and charts prepared');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading trip:', error);
        this.loading = false;
        this.cdr.detectChanges();
        // Redirect back to dashboard if trip not found
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private generateMockData() {
    // Generar datos de temperatura
    const startTime = new Date(this.trip.startDate);
    const hours = 12;
    const intervals = 24; // Cada 30 minutos

    for (let i = 0; i < intervals; i++) {
      const time = new Date(startTime.getTime() + (i * 30 * 60 * 1000));
      const temp = 2 + Math.random() * 6; // Entre 2°C y 8°C
      const isOutOfRange = temp > this.tempUpperLimit || temp < this.tempLowerLimit;

      this.temperatureData.push({
        timestamp: time,
        temperature: parseFloat(temp.toFixed(1)),
        upperLimit: this.tempUpperLimit,
        lowerLimit: this.tempLowerLimit,
        alert: isOutOfRange
      });
    }

    // Generar datos de vibración
    for (let i = 0; i < intervals; i++) {
      const time = new Date(startTime.getTime() + (i * 30 * 60 * 1000));
      const vib = Math.random() * 3.5; // Entre 0 y 3.5g
      const isAlert = vib > this.vibrationSafeLimit;

      this.vibrationData.push({
        timestamp: time,
        vibration: parseFloat(vib.toFixed(1)),
        safeZone: this.vibrationSafeLimit,
        alert: isAlert
      });
    }
  }

  private prepareChartData() {
    // Preparar datos para gráfico de temperatura
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
        name: 'Límite Superior (8°C)',
        series: this.temperatureData.map(d => ({
          name: this.formatTime(d.timestamp),
          value: this.tempUpperLimit
        }))
      },
      {
        name: 'Límite Inferior (2°C)',
        series: this.temperatureData.map(d => ({
          name: this.formatTime(d.timestamp),
          value: this.tempLowerLimit
        }))
      }
    ];

    // Preparar datos para gráfico de vibración
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
    // Estadísticas de temperatura
    const temps = this.temperatureData.map(d => d.temperature);
    this.stats.temperature.min = Math.min(...temps);
    this.stats.temperature.max = Math.max(...temps);
    this.stats.temperature.avg = parseFloat((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1));

    // Estadísticas de vibración
    const vibs = this.vibrationData.map(d => d.vibration);
    this.stats.vibration.min = Math.min(...vibs);
    this.stats.vibration.max = Math.max(...vibs);
    this.stats.vibration.avg = parseFloat((vibs.reduce((a, b) => a + b, 0) / vibs.length).toFixed(1));
    this.stats.vibration.alertCount = this.vibrationData.filter(d => d.alert).length;
  }

  formatTime(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
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
