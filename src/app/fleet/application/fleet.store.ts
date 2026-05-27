import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, finalize, tap } from 'rxjs';

import { Device } from '../domain/model/device.model';
import { Vehicle } from '../domain/model/vehicle.model';
import { DevicesApi } from '../infrastructure/devices-api';
import { VehiclesApi } from '../infrastructure/vehicles-api';
import { createAsyncState } from '../../shared/helpers/async-state';
import { NotificationService } from '../../shared/presentation/services/notification.service';
import { mapFleetError } from './fleet-error.mapper';
import { ErrorDialogService } from '../../shared/presentation/services/error-dialog.service';

type ErrorContext = 'device' | 'vehicle';
type ErrorTarget = 'list' | 'detail';

@Injectable({ providedIn: 'root' })
export class FleetStore {
  private devicesApi = inject(DevicesApi);
  private vehiclesApi = inject(VehiclesApi);
  private notificationService = inject(NotificationService);
  private errorDialog = inject(ErrorDialogService);


  readonly devicesState  = createAsyncState<Device[]>([]);
  readonly deviceState   = createAsyncState<Device | null>(null);
  readonly vehiclesState = createAsyncState<Vehicle[]>([]);
  readonly vehicleState  = createAsyncState<Vehicle | null>(null);


  private readonly devicesSubject  = new BehaviorSubject<Device[]>([]);
  private readonly vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);


  readonly devices$  = this.devicesSubject.asObservable();
  readonly vehicles$ = this.vehiclesSubject.asObservable();


  readonly devicesSig  = this.devicesState.data;
  readonly vehiclesSig = this.vehiclesState.data;



  private handleError(error: unknown, context: ErrorContext, target: ErrorTarget = 'list'): void {
    // message from mapper
    const message = mapFleetError(error, context);

    // status HTTP (si es HttpErrorResponse)
    let status: number | undefined;
    if (error && typeof error === 'object' && 'status' in error) {
      const maybeStatus = (error as { status?: number }).status;
      if (typeof maybeStatus === 'number') status = maybeStatus;
    }


    const title =
      context === 'device'
        ? 'IoT Device Management Error'
        : 'Fleet Vehicle Management Error';


    this.errorDialog.showError({ title, message, status });


    if (context === 'device') {
      if (target === 'detail') {
        this.deviceState.setError(message);
      } else {
        this.devicesState.setError(message);
      }
    } else {
      if (target === 'detail') {
        this.vehicleState.setError(message);
      } else {
        this.vehiclesState.setError(message);
      }
    }
  }


  loadDevices() {
    this.devicesState.setLoading(true);

    const request$ = this.devicesApi
      .getAll()
      .pipe(
        tap({
          next: (devices) => {
            this.devicesState.setData(devices);
            this.devicesSubject.next(devices);
          },
          error: (err) => this.handleError(err, 'device', 'list'),
        }),
        finalize(() => this.devicesState.setLoading(false))
      );

    request$.subscribe();
    return request$;
  }

  loadDeviceById(id: number) {
    this.deviceState.setLoading(true);

    const request$ = this.devicesApi
      .getById(id)
      .pipe(
        tap({
          next: (device) => this.deviceState.setData(device),
          error: (err) => this.handleError(err, 'device', 'detail'),
        }),
        finalize(() => this.deviceState.setLoading(false))
      );

    request$.subscribe();
    return request$;
  }

  createDevice(device: Device) {
    const request$ = this.devicesApi.create(device).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Dispositivo creado correctamente.');
          this.loadDevices();
        },
        error: (err) => this.handleError(err, 'device', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  updateDevice(device: Device) {
    const request$ = this.devicesApi.update(device).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Dispositivo actualizado correctamente.');
          this.loadDevices();
        },
        error: (err) => this.handleError(err, 'device', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  deleteDevice(id: number) {
    const request$ = this.devicesApi.delete(id).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Dispositivo eliminado correctamente.');
          this.loadDevices();
        },
        error: (err) => this.handleError(err, 'device', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  updateDeviceOnline(id: number, online: boolean) {
    const request$ = this.devicesApi.updateOnline(id, online).pipe(
      tap({
        next: () => {
          const statusText = online ? 'en línea' : 'fuera de línea';
          this.notificationService.showSuccess(`El dispositivo ahora está ${statusText}.`);
          this.loadDevices();
        },
        error: (err) => this.handleError(err, 'device', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  updateDeviceFirmware(id: number, firmware: string) {
    const request$ = this.devicesApi.updateFirmware(id, firmware).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Firmware del dispositivo actualizado correctamente.');
          this.loadDevices();
        },
        error: (err) => this.handleError(err, 'device', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  findDevicesByOnline(online: boolean) {
    this.devicesState.setLoading(true);

    this.devicesApi
      .findByOnline(online)
      .pipe(
        tap({
          next: (devices) => this.devicesState.setData(devices),
          error: (err) => this.handleError(err, 'device', 'list'),
        }),
        finalize(() => this.devicesState.setLoading(false))
      )
      .subscribe();
  }

  findDeviceByImei(imei: string) {
    this.deviceState.setLoading(true);

    const request$ = this.devicesApi
      .findByImei(imei)
      .pipe(
        tap({
          next: (device) => this.deviceState.setData(device),
          error: (err) => this.handleError(err, 'device', 'detail'),
        }),
        finalize(() => this.deviceState.setLoading(false))
      );

    request$.subscribe();
    return request$;
  }


  loadVehicles() {
    this.vehiclesState.setLoading(true);

    const request$ = this.vehiclesApi
      .getAll()
      .pipe(
        tap({
          next: (vehicles) => {
            this.vehiclesState.setData(vehicles);
            this.vehiclesSubject.next(vehicles);
          },
          error: (err) => this.handleError(err, 'vehicle', 'list'),
        }),
        finalize(() => this.vehiclesState.setLoading(false))
      );

    request$.subscribe();
    return request$;
  }

  loadVehicleById(id: number) {
    this.vehicleState.setLoading(true);

    const request$ = this.vehiclesApi
      .getById(id)
      .pipe(
        tap({
          next: (vehicle) => this.vehicleState.setData(vehicle),
          error: (err) => this.handleError(err, 'vehicle', 'detail'),
        }),
        finalize(() => this.vehicleState.setLoading(false))
      );

    request$.subscribe();
    return request$;
  }

  createVehicle(vehicle: Vehicle) {
    const request$ = this.vehiclesApi.create(vehicle).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Vehículo creado correctamente.');
          this.loadVehicles();
        },
        error: (err) => this.handleError(err, 'vehicle', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  updateVehicle(vehicle: Vehicle) {
    const request$ = this.vehiclesApi.update(vehicle).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Vehículo actualizado correctamente.');
          this.loadVehicles();
        },
        error: (err) => this.handleError(err, 'vehicle', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  deleteVehicle(id: number) {
    const request$ = this.vehiclesApi.delete(id).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Vehículo eliminado correctamente.');
          this.loadVehicles();
        },
        error: (err) => this.handleError(err, 'vehicle', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  assignDeviceToVehicle(vehicleId: number, imei: string) {
    const request$ = this.vehiclesApi.assignDevice(vehicleId, imei).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Dispositivo asignado al vehículo correctamente.');
          this.loadVehicles();
        },
        error: (err) => this.handleError(err, 'vehicle', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  unassignDeviceFromVehicle(vehicleId: number, imei: string) {
    const request$ = this.vehiclesApi.unassignDevice(vehicleId, imei).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Dispositivo desasignado del vehículo correctamente.');
          this.loadVehicles();
        },
        error: (err) => this.handleError(err, 'vehicle', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  updateVehicleStatus(id: number, status: Vehicle['status']) {
    const request$ = this.vehiclesApi.updateStatus(id, status).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccess('Estado del vehículo actualizado correctamente.');
          this.loadVehicles();
        },
        error: (err) => this.handleError(err, 'vehicle', 'list'),
      })
    );

    request$.subscribe();
    return request$;
  }

  findVehiclesByType(type: Vehicle['type'] | string) {
    this.vehiclesState.setLoading(true);

    this.vehiclesApi
      .findByType(type)
      .pipe(
        tap({
          next: (vehicles) => this.vehiclesState.setData(vehicles),
          error: (err) => this.handleError(err, 'vehicle', 'list'),
        }),
        finalize(() => this.vehiclesState.setLoading(false))
      )
      .subscribe();
  }

  findVehiclesByStatus(status: Vehicle['status'] | string) {
    this.vehiclesState.setLoading(true);

    this.vehiclesApi
      .findByStatus(status)
      .pipe(
        tap({
          next: (vehicles) => this.vehiclesState.setData(vehicles),
          error: (err) => this.handleError(err, 'vehicle', 'list'),
        }),
        finalize(() => this.vehiclesState.setLoading(false))
      )
      .subscribe();
  }

  findVehicleByPlate(plate: string) {
    this.vehicleState.setLoading(true);

    const request$ = this.vehiclesApi
      .findByPlate(plate)
      .pipe(
        tap({
          next: (vehicle) => this.vehicleState.setData(vehicle),
          error: (err) => this.handleError(err, 'vehicle', 'detail'),
        }),
        finalize(() => this.vehicleState.setLoading(false))
      );

    request$.subscribe();
    return request$;
  }
}
