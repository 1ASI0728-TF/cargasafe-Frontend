import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Vehicle } from '../domain/model/vehicle.model';
import { toVehicle, fromVehicleCreate, fromVehicleUpdate } from './vehicle-assembler';
import { VehicleStatus } from '../domain/model/vehicle-status.vo';
import { VehicleType } from '../domain/model/vehicle-type.vo';

@Injectable({ providedIn: 'root' })
export class VehiclesApi {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;


  private vehiclesUrl(): string {
    return `${this.baseUrl}/fleet/vehicles`;
  }

  private vehicleByIdUrl(id: number): string {
    return `${this.baseUrl}/fleet/vehicles/${id}`;
  }

  private vehicleAssignUrl(id: number, imei: string): string {
    return `${this.baseUrl}/fleet/vehicles/${id}/assign-device/${encodeURIComponent(imei)}`;
  }

  private vehicleUnassignUrl(id: number, imei: string): string {
    return `${this.baseUrl}/fleet/vehicles/${id}/unassign-device/${encodeURIComponent(imei)}`;
  }

  private vehicleStatusUrl(id: number): string {
    return `${this.baseUrl}/fleet/vehicles/${id}/status`;
  }

  private vehiclesByTypeUrl(type: string): string {
    return `${this.baseUrl}/fleet/vehicles/by-type/${encodeURIComponent(type)}`;
  }

  private vehiclesByStatusUrl(status: string): string {
    return `${this.baseUrl}/fleet/vehicles/by-status/${encodeURIComponent(status)}`;
  }

  private vehicleByPlateUrl(plate: string): string {
    return `${this.baseUrl}/fleet/vehicles/by-plate/${encodeURIComponent(plate)}`;
  }


  getAll(): Observable<Vehicle[]> {
    return this.http
      .get<any[]>(this.vehiclesUrl())
      .pipe(map(list => list.map(toVehicle)));
  }

  getById(id: number): Observable<Vehicle> {
    return this.http
      .get<any>(this.vehicleByIdUrl(id))
      .pipe(map(toVehicle));
  }

  create(payload: Vehicle): Observable<Vehicle> {
    return this.http
      .post<any>(this.vehiclesUrl(), fromVehicleCreate(payload))
      .pipe(map(toVehicle));
  }

  update(payload: Vehicle): Observable<Vehicle> {
    return this.http
      .put<any>(this.vehicleByIdUrl(payload.id!), fromVehicleUpdate(payload))
      .pipe(map(toVehicle));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.vehicleByIdUrl(id));
  }

  assignDevice(vehicleId: number, imei: string): Observable<Vehicle> {
    return this.http
      .post<any>(this.vehicleAssignUrl(vehicleId, imei), {})
      .pipe(map(toVehicle));
  }

  unassignDevice(vehicleId: number, imei: string): Observable<void> {
    return this.http.post<void>(this.vehicleUnassignUrl(vehicleId, imei), {});
  }

  updateStatus(id: number, status: VehicleStatus | Vehicle['status']): Observable<Vehicle> {
    return this.http
      .patch<any>(this.vehicleStatusUrl(id), { status })
      .pipe(map(toVehicle));
  }

  findByType(type: VehicleType | Vehicle['type'] | string): Observable<Vehicle[]> {
    const upper = String(type).toUpperCase();
    return this.http
      .get<any[]>(this.vehiclesByTypeUrl(upper))
      .pipe(map(list => list.map(toVehicle)));
  }

  findByStatus(status: VehicleStatus | Vehicle['status'] | string): Observable<Vehicle[]> {
    const upper = String(status).toUpperCase();
    return this.http
      .get<any[]>(this.vehiclesByStatusUrl(upper))
      .pipe(map(list => list.map(toVehicle)));
  }

  findByPlate(plate: string): Observable<Vehicle> {
    return this.http
      .get<any>(this.vehicleByPlateUrl(plate))
      .pipe(map(toVehicle));
  }
}
