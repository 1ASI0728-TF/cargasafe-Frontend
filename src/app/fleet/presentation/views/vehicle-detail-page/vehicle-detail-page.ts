import { Component, ChangeDetectionStrategy, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Vehicle } from '../../../domain/model/vehicle.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { AssignDeviceDialogComponent } from '../../components/assign-device-dialog/assign-device-dialog';
import { MatDialog } from '@angular/material/dialog';
import { UnassignDeviceDialogComponent } from '../../components/unassign-device-dialog/unassign-device-dialog';
import { FleetStore } from '../../../application/fleet.store';
import { VehicleStatus } from '../../../domain/model/vehicle-status.vo';
import {
  ConfirmRetireVehicleDialogComponent
} from '../../components/confirm-retire-vehicle-dialog/confirm-retire-vehicle-dialog';

@Component({
  selector: 'app-vehicle-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  templateUrl: './vehicle-detail-page.html',
  styleUrls: ['./vehicle-detail-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(FleetStore);
  private snack = inject(MatSnackBar, { optional: true });
  private dialog = inject(MatDialog);

  // Computed signals (como en trips)
  vehicleState = computed(() => this.store.vehicleState);
  vehicle = computed(() => this.vehicleState().data() as Vehicle);

  ngOnInit(): void {
    const vehicleId = Number(this.route.snapshot.params['id']);
    this.store.loadVehicleById(vehicleId);
  }

  back() {
    void this.router.navigate(['/fleet/vehicles']);
  }

  edit(v?: Vehicle | null) {
    if (v?.id) {
      void this.router.navigate(['/fleet/vehicles'], { queryParams: { edit: v.id } });
    }
  }

  setAvailable(v: Vehicle) {
    if (!v?.id) return;
    this.store.updateVehicleStatus(v.id, VehicleStatus.IN_SERVICE);
    this.snack?.open('Vehicle set to IN_SERVICE', 'OK', { duration: 2000 });
    this.store.loadVehicleById(v.id);
  }

  setOutOfService(v: Vehicle) {
    if (!v?.id) return;
    this.store.updateVehicleStatus(v.id, VehicleStatus.OUT_OF_SERVICE);
    this.snack?.open('Vehicle set to OUT_OF_SERVICE', 'OK', { duration: 2000 });
    this.store.loadVehicleById(v.id);
  }

  setMaintenance(v: Vehicle) {
    if (!v?.id) return;
    this.store.updateVehicleStatus(v.id, VehicleStatus.MAINTENANCE);
    this.snack?.open('Vehicle set to MAINTENANCE', 'OK', { duration: 2000 });
    this.store.loadVehicleById(v.id);
  }

  setRetired(v: Vehicle) {
    if (!v?.id) return;
    this.store.updateVehicleStatus(v.id, VehicleStatus.RETIRED);
    this.snack?.open('Vehicle set to RETIRED', 'OK', { duration: 2000 });
    this.store.loadVehicleById(v.id);
  }

  trackByValue = (_: number, val: string) => val;

  openAssignDialog(v: Vehicle) {
    if (!v?.id) return;

    const ref = this.dialog.open(AssignDeviceDialogComponent, {
      width: '920px',
      maxWidth: '95vw',
      data: { vehicleId: v.id },
    });

    ref.afterClosed().subscribe((res) => {
      if (res?.imei) {
        this.store.assignDeviceToVehicle(v.id!, res.imei);
        this.snack?.open(`Assigned ${res.imei}`, 'OK', { duration: 1800 });
        this.store.loadVehicleById(v.id!);
      }
    });
  }

  openUnassignDialog(v: Vehicle) {
    if (!v?.id || !v.deviceImeis?.length) return;

    const ref = this.dialog.open(UnassignDeviceDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { imeis: v.deviceImeis },
    });

    ref.afterClosed().subscribe((res) => {
      if (res?.imei) {
        this.store.unassignDeviceFromVehicle(v.id!, res.imei);
        this.snack?.open(`Unassigned ${res.imei}`, 'OK', { duration: 1800 });
        this.store.loadVehicleById(v.id!);
      }
    });
  }

  unassignAll(v: Vehicle) {
    if (!v?.id || !v.deviceImeis?.length) return;

    for (const imei of v.deviceImeis) {
      this.store.unassignDeviceFromVehicle(v.id, imei);
    }
    this.snack?.open('Unassigned all devices', 'OK', { duration: 1800 });
    this.store.loadVehicleById(v.id);
  }

  openRetireDialog(v: Vehicle) {
    if (!v?.id) return;

    const ref = this.dialog.open(ConfirmRetireVehicleDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: {plate: v.plate},
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.setRetired(v);
      }
    });
  }
}
