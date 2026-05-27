import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { Trip } from '../domain/model/trip.entity';
import { HttpClient } from '@angular/common/http';
import { TripAssembler } from './trip-assembler';
import { CreateTripResource, TripResource } from './trip-response';
import { TotalTripSummary } from '../application/dto/trip-summary.dto';

@Injectable({ providedIn: 'root' })
export class TripsApi {
  private baseUrl = environment.baseUrl;
  private tripsEndpoint = environment.tripsEndpointPath;
  private http = inject(HttpClient);

  getTrips(): Observable<Trip[]> {
    return this.http
      .get<TripResource[]>(`${this.baseUrl}${this.tripsEndpoint}`)
      .pipe(map((items) => items.map(TripAssembler.toEntityFromResource)));
  }

  getTripById(id: string | number): Observable<Trip> {
    return this.http
      .get<TripResource>(`${this.baseUrl}${this.tripsEndpoint}/${id}`)
      .pipe(map((resource) => TripAssembler.toEntityFromResource(resource)));
  }

  getTotalTripsSummary(): Observable<TotalTripSummary> {
    console.log('TripsApi: getTotalTripsSummary called');

    return new Observable<TotalTripSummary>((subscriber) => {
      const fake: TotalTripSummary = {
        totalTrips: {
          today: 5,
          yesterday: 8,
          last7Days: 45,
          lastYear: 520,
        },
      };

      // simulate async response
      setTimeout(() => {
        subscriber.next(fake);
        subscriber.complete();
      }, 300);
    });
  }

  createTrip(trip: Trip): Observable<unknown> {
    const resource = TripAssembler.toCreateResourceFromEntity(trip);

    return this.http.post<unknown>(`${this.baseUrl}${this.tripsEndpoint}`, resource);
  }

  executeTrip(tripId: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}${this.tripsEndpoint}/${tripId}/start`, {});
  }
}
