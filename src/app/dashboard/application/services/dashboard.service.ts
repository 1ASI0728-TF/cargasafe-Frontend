import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Trip, IncidentsByMonthData, Alert } from '../../domain/entities';
import { environment } from '../../../../environments/environment';

export interface FleetSummary {
  totalVehicles: number;
  totalDevices: number;
  onlineDevices: number;
  vehiclesWithDevice: number;
}

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

  /** Same trip, but as the raw JSON (with vehicleId/deviceId/hasDevice) — used by the live IoT chart. */
  getTripRawById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/analytics/trips/${id}`);
  }

  /** Cargo temperature/humidity/vibration thresholds configured for a trip, if any. */
  getTripParameters(tripId: string): Observable<{ minTemperature: number; maxTemperature: number; maxVibration: number } | null> {
    return this.http
      .get<any[]>(`${this.API_URL}/trip_parameters?tripId=${tripId}`)
      .pipe(map((list) => (list && list.length ? list[0] : null)));
  }

  getAlertsByTripId(tripId: string): Observable<Alert[]> {
    return this.http
      .get<any[]>(`${this.API_URL}/analytics/alerts?tripId=${tripId}`)
      .pipe(map((alerts) => alerts.map((alert) => Alert.fromJson(alert))));
  }

  /** Live fleet counters (vehicles / devices) so the Dashboard reflects fleet changes immediately. */
  getFleetSummary(): Observable<FleetSummary> {
    return this.http.get<FleetSummary>(`${this.API_URL}/analytics/fleet-summary`);
  }
}
