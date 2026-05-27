import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { TripParameter } from '../domain/model/trip-parameter.entity';
import { HttpClient } from '@angular/common/http';
import { TripParameterAssembler } from './trip-parameter-assembler';
import { TripParameterResource } from './trip-parameter-response';

@Injectable({ providedIn: 'root' })
export class TripParametersApi {
  private baseUrl = environment.baseUrl;
  private tripParametersEndpoint = `/trip_parameters`;
  private http = inject(HttpClient);

  getTripParametersByTripId(tripId?: number): Observable<TripParameter[]> {
    const url = tripId
      ? `${this.baseUrl}${this.tripParametersEndpoint}?tripId=${tripId}`
      : `${this.baseUrl}${this.tripParametersEndpoint}`;

    return this.http
      .get<TripParameterResource[]>(url)
      .pipe(map((resources) => TripParameterAssembler.toEntitiesFromResources(resources)));
  }
}
