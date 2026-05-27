import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alert } from '../domain/models/alert.model';
import { AlertResource } from './alert-response';
import { AlertAssembler } from './alert-assembler';

@Injectable({ providedIn: 'root' })
export class AlertsApi {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;
  private alertsEndpoint = environment.alertsEndpointPath;

  /** Get all alerts */
  getAlerts(): Observable<Alert[]> {
    return this.http
      .get<AlertResource[]>(`${this.baseUrl}${this.alertsEndpoint}`)
      .pipe(map(res => res.map(r => AlertAssembler.toEntityFromResource(r))));
  }

  /** Acknowledge an alert */
  acknowledgeAlert(id: number): Observable<Alert> {
    console.log('Calling API to acknowledge alert:', id);
    const url = `${this.baseUrl}${this.alertsEndpoint}/${id}/acknowledgment`;
    return this.http.patch<AlertResource>(url, {}).pipe(
      map(r => AlertAssembler.toEntityFromResource(r))
    );
  }

  /** Close an alert */
  closeAlert(id: number): Observable<Alert> {
    const url = `${this.baseUrl}${this.alertsEndpoint}/${id}/closure`;
    return this.http
      .patch<AlertResource>(url, {})
      .pipe(map(r => AlertAssembler.toEntityFromResource(r)));
  }

}
