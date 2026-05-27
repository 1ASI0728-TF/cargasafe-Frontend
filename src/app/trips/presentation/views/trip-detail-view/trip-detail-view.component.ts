import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Trip } from '../../../domain/model/trip.entity';
import { Alert } from '../../../../alerts/domain/models/alert.model';
import { TripsStore } from '../../../application/trips.store';

@Component({
  selector: 'app-trip-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GoogleMapsModule,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './trip-detail-view.component.html',
  styleUrls: ['./trip-detail-view.component.css'],
})
export class TripDetailViewComponent implements OnInit {
  // ------------------------
  // 🧩 Dependencies
  // ------------------------
  private route = inject(ActivatedRoute);
  private store = inject(TripsStore);

  tripState = computed(() => this.store.tripState);
  trip = computed(() => this.tripState().data() as Trip);

  // ------------------------
  // 🗺️ Google Maps
  // ------------------------
  center: google.maps.LatLngLiteral = { lat: -12.072847, lng: -77.080581 };
  zoom = 12;
  orderMarkers = computed(() =>
    this.trip().deliveryOrders.map<google.maps.LatLngLiteral>((order) => ({
      lat: order.latitude,
      lng: order.longitude,
    }))
  );
  originMarker = computed<google.maps.LatLngLiteral>(() => ({
    lat: this.trip().originPoint?.latitude ?? 0,
    lng: this.trip().originPoint?.longitude ?? 0,
  }));
  // markers: google.maps.LatLngLiteral[] = [];

  // ------------------------
  // ⚡ Reactive state (signals)
  // ------------------------
  totalDistance = signal(0);
  totalDuration = signal(0);
  alerts = signal<Alert[]>([]);

  // ------------------------
  // 📋 Table
  // ------------------------
  displayedColumns = [
    'id',
    'sequenceOrder',
    'clientEmail',
    'address',
    'temperatureThreshold',
    'humidityThreshold',
    'arrivalAt',
    'status',
    'actions',
  ];

  // ------------------------
  // 🚀 Lifecycle
  // ------------------------
  ngOnInit(): void {
    const tripId = Number(this.route.snapshot.params['id']);
    this.store.loadTripById(tripId);
  }

  getIncidentsNumberByOrderId(orderId: number): number {
    return this.alerts().filter((alert) => alert.deliveryOrderId === orderId).length;
  }

  markOrderAsDelivered(orderId: number) {
    console.log('Marking order as delivered:', orderId);
    this.store.markOrderAsDelivered(orderId);
  }
}
