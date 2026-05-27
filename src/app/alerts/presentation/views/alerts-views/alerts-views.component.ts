import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertStore } from '../../../application/alert.store';
import { AlertTableComponent } from '../../components/alert-table/alert-table.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [CommonModule, AlertTableComponent, MatIconModule],
  templateUrl: './alerts-views.component.html',
  styleUrls: ['./alerts-views.component.css'],
})
export class AlertsViewsComponent {
  private alertStore = inject(AlertStore);

  alerts = computed(() => this.alertStore.alerts());

  activeCount = computed(() =>
    this.alertStore.alerts().filter(a => a.alertStatus === 'OPEN').length
  );

  resolvedCount = computed(() =>
    this.alertStore.alerts().filter(a => a.alertStatus === 'CLOSED').length
  );

  onCloseAlert(id: number) {
    this.alertStore.closeAlert(id).subscribe({
      next: (updatedAlert) => {
        console.log('Alert closed:', updatedAlert);
      },
      error: (err) => console.error('Error closing alert', err),
    });
  }

  onAcknowledgeAlert(id: number) {
    this.alertStore.acknowledgeAlert(id).subscribe({
      next: updatedAlert => {
      },
      error: err => console.error('Error acknowledging alert:', err)
    });
  }
}
