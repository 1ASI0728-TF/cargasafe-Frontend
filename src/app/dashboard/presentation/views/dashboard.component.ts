import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { forkJoin, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Trip, IncidentsByMonthData, Alert, AlertType } from '../../domain/entities';
import { DashboardService, FleetSummary } from '../../application/services/dashboard.service';
import { IncidentsChartComponent } from '../components/incidents-chart/incidents-chart.component';
import { FakeDbEventsService } from '../../../core/fake-backend/fake-db-events.service';

// Interfaz extendida para el tooltip con información de incidencias
interface TripWithIncidents extends Trip {
  incidentCount: number;
  temperatureIncidents?: number;
  movementIncidents?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, IncidentsChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  trips: Trip[] = [];
  alerts: Alert[] = [];
  incidentsData: IncidentsByMonthData[] = [];
  fleetSummary: FleetSummary = { totalVehicles: 0, totalDevices: 0, onlineDevices: 0, vehiclesWithDevice: 0 };
  loading = true;

  private dbEventsSub?: Subscription;

  // ngx-charts data
  chartData: any[] = [];
  
  // Chart configuration
  view: [number, number] = [800, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Mes';
  showYAxisLabel = true;
  yAxisLabel = 'Número de Incidencias';
  
  // Color scheme
  colorScheme: Color = {
    name: 'myScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4']
  };

  // Custom tooltip properties
  showCustomTooltip = false;
  tooltipX = 0;
  tooltipY = 0;
  tooltipData: IncidentsByMonthData | null = null;
  tooltipTrips: TripWithIncidents[] = [];

  get activeTrips(): number {
    return this.trips.filter(trip => trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED').length;
  }

  get totalAlerts(): number {
    return this.alerts.length;
  }

  get pendingAlerts(): number {
    return this.alerts.filter(alert => !alert.resolved).length;
  }

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fakeDbEvents: FakeDbEventsService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();

    // Live updates: whenever the fake DB changes (new IoT alert, a trip
    // starting/finishing, a vehicle added from Fleet, etc.) refresh the
    // Dashboard without showing the initial full-page loading state.
    this.dbEventsSub = this.fakeDbEvents.changes$.pipe(debounceTime(700)).subscribe(() => {
      this.loadDashboardData(false);
    });
  }

  ngOnDestroy(): void {
    this.dbEventsSub?.unsubscribe();
  }

  // ngx-charts event handlers
  onSelect(data: any): void {
    console.log('📊 Item clicked:', JSON.parse(JSON.stringify(data)));
    
    // Usar el evento click para mostrar el tooltip también
    if (data && data.name) {
      const monthData = this.incidentsData.find(item => item.month === data.name);
      
      if (monthData) {
        this.tooltipTrips = this.getTripsForMonth(monthData);
        this.tooltipData = monthData;
        
        // Posicionar el tooltip
        this.tooltipX = 300;
        this.tooltipY = 200;
        this.showCustomTooltip = true;
        
        console.log('📊 Tooltip activated via click:', {
          month: monthData.month,
          trips: this.tooltipTrips.length
        });
      }
    }
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  // Custom tooltip event handlers (solo para barras específicas)
  onBarHover(event: any): void {
    console.log('🎯 Bar hover (activate):', event);
    
    if (event && event.name) {
      // Encontrar los datos del mes seleccionado
      const monthData = this.incidentsData.find(item => item.month === event.name);
      
      if (monthData) {
        // Filtrar viajes que tuvieron incidencias en este mes
        this.tooltipTrips = this.getTripsForMonth(monthData);
        this.tooltipData = monthData;
        
        // Activar el tooltip (la posición se actualizará con mousemove)
        this.showCustomTooltip = true;
        
        console.log('📊 Tooltip activado para:', {
          month: monthData.month,
          trips: this.tooltipTrips.length,
          tooltipVisible: this.showCustomTooltip
        });
      }
    }
  }



  // Método de prueba para verificar que el tooltip funciona
  testTooltip(): void {
    console.log('🧪 Testing tooltip...');
    
    if (this.incidentsData.length > 0) {
      const testMonth = this.incidentsData[0]; // Usar el primer mes como prueba
      this.tooltipData = testMonth;
      this.tooltipTrips = this.getTripsForMonth(testMonth);
      
      // Posicionar cerca del centro de la pantalla
      this.tooltipX = window.innerWidth / 2 - 200; // Centrado horizontalmente
      this.tooltipY = window.innerHeight / 2 - 125; // Centrado verticalmente
      this.adjustTooltipPosition();
      this.showCustomTooltip = true;
      
      console.log('✅ Tooltip test activated:', {
        month: testMonth.month,
        tripsCount: this.tooltipTrips.length,
        visible: this.showCustomTooltip,
        position: { x: this.tooltipX, y: this.tooltipY }
      });
      
      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        this.showCustomTooltip = false;
        console.log('⏰ Tooltip auto-hidden after 5 seconds');
      }, 5000);
    } else {
      console.warn('⚠️ No incidents data available for testing');
    }
  }



  onBarLeave(event: any): void {
    console.log('👋 Bar leave (deactivate):', event);
    this.showCustomTooltip = false;
    this.tooltipData = null;
    this.tooltipTrips = [];
  }

  // Método para actualizar la posición del mouse en tiempo real
  updateMousePosition(event: MouseEvent): void {
    if (this.showCustomTooltip) {
      // Actualizar posición del tooltip en tiempo real mientras está visible
      this.tooltipX = event.clientX + 15; // 15px offset del cursor
      this.tooltipY = event.clientY - 10; // 10px arriba del cursor
      
      // Asegurar que no se salga de la pantalla
      this.adjustTooltipPosition();
    }
  }

  private adjustTooltipPosition(): void {
    const tooltipWidth = 400;
    const tooltipHeight = 250;
    
    // Ajustar horizontalmente
    if (this.tooltipX + tooltipWidth > window.innerWidth) {
      this.tooltipX = window.innerWidth - tooltipWidth - 10;
    }
    if (this.tooltipX < 10) {
      this.tooltipX = 10;
    }
    
    // Ajustar verticalmente
    if (this.tooltipY + tooltipHeight > window.innerHeight) {
      this.tooltipY = window.innerHeight - tooltipHeight - 10;
    }
    if (this.tooltipY < 10) {
      this.tooltipY = 10;
    }
  }

  // Método para obtener viajes que tuvieron incidencias en un mes específico
  private getTripsForMonth(monthData: IncidentsByMonthData): TripWithIncidents[] {
    // Simulamos viajes que tuvieron incidencias en este mes
    const tripsWithIncidents: TripWithIncidents[] = this.trips.map(trip => {
      // Simulamos el número de incidencias basado en los datos del mes
      const tempIncidents = Math.floor((monthData.temperatureIncidents / this.trips.length) + Math.random() * 2);
      const movIncidents = Math.floor((monthData.movementIncidents / this.trips.length) + Math.random() * 2);
      const totalIncidents = tempIncidents + movIncidents;
      
      // Crear un objeto extendido manteniendo la referencia al trip original
      return Object.assign(trip, {
        incidentCount: totalIncidents,
        temperatureIncidents: tempIncidents,
        movementIncidents: movIncidents
      }) as TripWithIncidents;
    })
    .filter(trip => trip.incidentCount > 0) // Solo viajes con incidencias
    .sort((a, b) => b.incidentCount - a.incidentCount) // Ordenar por más incidencias primero
    .slice(0, 4); // Limitar a 4 viajes para no saturar el tooltip
    
    console.log('🚛 Trips for month:', monthData.month, tripsWithIncidents);
    return tripsWithIncidents;
  }

  // Métodos auxiliares para el tooltip
  getStatusColor(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return '#f59e0b'; // Amarillo para en progreso
      case 'COMPLETED':
        return '#10b981'; // Verde para completado
      case 'DELAYED':
        return '#ef4444'; // Rojo para retrasado
      case 'CANCELLED':
        return '#6b7280'; // Gris para cancelado
      default:
        return '#6b7280';
    }
  }



  navigateToTripDetail(tripId: number): void {
    this.router.navigate(['/dashboard/trips', tripId.toString()]);
    console.log('🚗 Navigating to trip detail:', tripId);
  }

  private loadDashboardData(showLoading = true): void {
    if (showLoading) this.loading = true;
    console.log('🚀 Loading dashboard data...');

    forkJoin({
      trips: this.dashboardService.getTrips(),
      alerts: this.dashboardService.getAlerts(),
      incidentsData: this.dashboardService.getIncidentsByMonth(),
      fleetSummary: this.dashboardService.getFleetSummary()
    }).subscribe({
      next: (data) => {
        console.log('✅ Data loaded successfully:', data);
        
        this.trips = [...(data.trips || [])];
        this.alerts = [...(data.alerts || [])];
        this.incidentsData = [...(data.incidentsData || [])];
        this.fleetSummary = data.fleetSummary;
        
        console.log('📊 Trips:', this.trips.length, this.trips);
        console.log('🚨 Alerts:', this.alerts.length, this.alerts);
        console.log('📈 Incidents by month:', this.incidentsData.length, this.incidentsData);
        
        // Preparar datos para ngx-charts
        this.prepareChartData();
        
        this.loading = false;
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'DELAYED':
        return 'status-delayed';
      case 'CREATED':
        return 'status-created';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'DELAYED':
        return 'Delayed';
      case 'CREATED':
        return 'Not started';
      default:
        return status;
    }
  }

  // Chart data preparation for ngx-charts
  private prepareChartData(): void {
    console.log('📊 Preparing chart data for ngx-charts...');
    
    this.chartData = this.incidentsData.map(monthData => ({
      name: monthData.month,
      series: [
        {
          name: 'Temperatura',
          value: monthData.temperatureIncidents
        },
        {
          name: 'Movimiento', 
          value: monthData.movementIncidents
        }
      ]
    }));
    
    console.log('✅ Chart data prepared:', this.chartData);
  }

  getAlertTypeText(type: AlertType): string {
    switch (type) {
      case AlertType.TEMPERATURE:
        return 'Temperature';
      case AlertType.MOVEMENT:
        return 'Movement';
      default:
        return type;
    }
  }
}