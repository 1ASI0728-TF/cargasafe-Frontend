import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Trip, IncidentsByMonthData, Alert } from '../../domain/entities';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly API_URL = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http
      .get<any[]>(`${this.API_URL}/analytics/trips`)
      .pipe(map((trips) => trips.map((trip) => Trip.fromJson(trip))));
  }

  getAlerts(): Observable<Alert[]> {
    return this.http
      .get<any[]>(`${this.API_URL}/analytics/alerts`)
      .pipe(map((alerts) => alerts.map((alert) => Alert.fromJson(alert))));
  }

  getIncidentsByMonth(): Observable<IncidentsByMonthData[]> {
    return this.http.get<IncidentsByMonthData[]>(`${this.API_URL}/analytics/incidents-by-month`);
  }

  getTripById(id: string): Observable<Trip> {
    return this.http
      .get<any>(`${this.API_URL}/analytics/trips/${id}`)
      .pipe(map((trip) => Trip.fromJson(trip)));
  }

  getAlertsByTripId(tripId: string): Observable<Alert[]> {
    return this.http
      .get<any[]>(`${this.API_URL}/analytics/alerts?tripId=${tripId}`)
      .pipe(map((alerts) => alerts.map((alert) => Alert.fromJson(alert))));
  }
}
