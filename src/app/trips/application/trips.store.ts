import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { Trip } from '../domain/model/trip.entity';
import { TripsApi } from '../infrastructure/trips-api';
import { TotalTripSummary } from './dto/trip-summary.dto';
import { finalize, firstValueFrom, tap } from 'rxjs';
import { createAsyncState } from '../../shared/helpers/async-state';
import { DeliveryOrderStatus } from '../domain/model/delivery-order-status.vo';
import { DeliveryOrdersApi } from '../infrastructure/delivery-order-api';
import { TripStatus } from '../domain/model/trip-status.vo';

@Injectable({ providedIn: 'root' })
export class TripsStore {
  private tripsApi = inject(TripsApi);
  private deliveryOrdersApi = inject(DeliveryOrdersApi);
  readonly tripsState = createAsyncState<Trip[]>([]);
  readonly tripState = createAsyncState<Trip | null>(null);
  readonly totalTripsSummaryState = createAsyncState<TotalTripSummary | null>(null);

  loadTrips() {
    this.tripsState.setLoading(true);
    this.tripsApi
      .getTrips()
      .pipe(
        tap({
          next: (trips) => {
            this.tripsState.setData(trips);
            console.log('TripsStore: loaded trips', trips);
          },
          error: () => {
            this.tripsState.setError('Failed to load trips');
          },
        }),
        finalize(() => {
          this.tripsState.setLoading(false);
        })
      )
      .subscribe();
  }

  loadTotalTripsSummary() {
    this.totalTripsSummaryState.setLoading(true);

    this.tripsApi
      .getTotalTripsSummary()
      .pipe(
        tap({
          next: (summary) => {
            this.totalTripsSummaryState.setData(summary);
          },
          error: () => {
            this.totalTripsSummaryState.setError('Failed to load total trips summary');
          },
        }),
        finalize(() => {
          this.totalTripsSummaryState.setLoading(false);
        })
      )
      .subscribe();
  }

  loadTripById(id: Trip['_id'] | number) {
    this.tripState.setLoading(true);
    const request$ = this.tripsApi.getTripById(id).pipe(
      tap({
        next: (trip) => {
          this.tripState.setData(trip);
          console.log('TripsStore: loaded trip', trip);
        },
        error: () => {
          this.tripState.setError('Failed to load trip');
        },
      }),
      finalize(() => {
        this.tripState.setLoading(false);
      })
    );
    request$.subscribe();

    return request$;
  }

  markOrderAsDelivered(orderId: number) {
    const trip = this.tripState.data();
    if (!trip) {
      console.error('No trip loaded');
      return;
    }
    const order = trip.deliveryOrders.find((o) => o.id === orderId);
    if (!order) {
      console.error(`Order with id ${orderId} not found in trip ${trip.id}`);
      return;
    }

    const request$ = this.deliveryOrdersApi.markAsDelivered(orderId).pipe(
      tap(() => {
        order.markAsDelivered();
        this.tripState.setData(new Trip(this.tripState.data()!));
      })
    );
    request$.subscribe();

    return request$;
  }

  createTrip(trip: Trip) {
    const request$ = this.tripsApi.createTrip(trip);
    return request$;
  }

  executeTrip(tripId: Trip['_id'] | number) {
    const currentTrips = this.tripsState.data();
    const trip = currentTrips.find((t) => t.id === tripId);

    if (!trip) {
      console.error(`Trip with id ${tripId} not found`);
      return;
    }

    const request$ = this.tripsApi.executeTrip(tripId).pipe(
      tap(() => {
        // ⚠️ DO NOT mutate the original trip — create a new object
        const updatedTrip = Trip.createFrom(trip);
        updatedTrip.status = TripStatus.IN_PROGRESS;
        updatedTrip.startedAt = new Date();

        // Create NEW array reference
        const newTrips = currentTrips.map((t) => (t.id === tripId ? updatedTrip : t));

        this.tripsState.setData(newTrips);
      })
    );

    return request$;
  }
}
