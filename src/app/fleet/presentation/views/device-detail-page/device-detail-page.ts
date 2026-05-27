import { Component, inject, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Device } from '../../../domain/model/device.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { FirmwareDialogComponent } from '../../components/update-firmware-dialog/update-firmware-dialog';
import { AssignVehicleDialogComponent } from '../../components/assign-vehicle-dialog/assign-vehicle-dialog';
import { FleetStore } from '../../../application/fleet.store';

@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatListModule, MatChipsModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './device-detail-page.html',
  styleUrls: ['./device-detail-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(FleetStore);
  private snack = inject(MatSnackBar, { optional: true });
  private dialog = inject(MatDialog);

  // Computed signals (como en trips)
  deviceState = computed(() => this.store.deviceState);
  device = computed(() => this.deviceState().data() as Device);

  ngOnInit(): void {
    const deviceId = Number(this.route.snapshot.params['id']);
    this.store.loadDeviceById(deviceId);
  }

  back() { this.router.navigate(['/fleet/devices']); }
  edit(d?: Device | null) {
    if (d?.id) this.router.navigate(['/fleet/devices'], { queryParams: { edit: d.id } });
  }

  testPing(d: Device) {
    this.snack?.open(`Ping sent to ${d.imei}`, 'OK', { duration: 1800 });
  }

  unlink(d: Device) {
    if (!d?.imei || !d?.vehiclePlate) return;
    this.store.findVehicleByPlate(d.vehiclePlate).subscribe(v => {
      if (!v?.id) return;
      this.store.unassignDeviceFromVehicle(v.id!, d.imei);
      this.snack?.open('Device unassigned', 'OK', { duration: 1600 });
      this.store.loadDeviceById(d.id!);
    });
  }

  toggleOnline(d: Device) {
    if (!d?.id) return;
    const next = !d.online;
    this.store.updateDeviceOnline(d.id, next);
    this.snack?.open(`Device set ${next ? 'Online' : 'Offline'}`, 'OK', { duration: 1600 });
    this.store.loadDeviceById(d.id);
  }

  openUpdateFirmwareDialog(d: Device) {
    this.dialog.open(FirmwareDialogComponent, {
      width: '480px',
      data: { current: d.firmware },
    }).afterClosed().subscribe((version?: string) => {
      if (version && d.id) {
        this.store.updateDeviceFirmware(d.id, version);
        this.snack?.open('Firmware updated', 'OK', { duration: 1600 });
        this.store.loadDeviceById(d.id);
      }
    });
  }

  openAssignVehicleDialog(d: Device) {
    this.dialog.open(AssignVehicleDialogComponent, {
      width: '520px',
    }).afterClosed().subscribe((vehicleId?: number) => {
      if (vehicleId) {
        this.store.assignDeviceToVehicle(vehicleId, d.imei);
        this.snack?.open('Device assigned to vehicle', 'OK', { duration: 1600 });
        this.store.loadDeviceById(d.id!);
      }
    });
  }
}
