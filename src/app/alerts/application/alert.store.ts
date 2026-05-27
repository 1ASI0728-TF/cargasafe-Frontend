import { Injectable, computed, inject, signal } from '@angular/core';
import { Alert } from '../domain/models/alert.model';
import { AlertsApi } from '../infrastructure/alerts-api';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertStore {
  private alertsSignal = signal<Alert[]>([]);
  private alertsApi = inject(AlertsApi);

  readonly alerts = computed(() => this.alertsSignal());

  constructor() {
    this.loadAlerts();
  }

  /** Load all alerts */
  loadAlerts() {
    this.alertsApi.getAlerts().subscribe({
      next: (alerts) => this.alertsSignal.set(alerts),
      error: (err) => console.error('Error loading alerts:', err),
    });
  }

  /** Acknowledge alert */
  acknowledgeAlert(id: number): Observable<Alert> {
    return this.alertsApi.acknowledgeAlert(id).pipe(
      tap(updatedAlert => this.updateAlert(updatedAlert))
    );
  }

  /** Close alert */
  closeAlert(id: number): Observable<Alert> {
    return this.alertsApi.closeAlert(id).pipe(
      tap(updatedAlert => this.updateAlert(updatedAlert))
    );
  }

  private updateAlert(updatedAlert: Alert) {
    const alerts = [...this.alertsSignal()];
    const index = alerts.findIndex(a => a.id === updatedAlert.id);
    if (index !== -1) {
      alerts[index] = updatedAlert;
      this.alertsSignal.set(alerts);
    }
  }
}
