import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Device } from '../domain/model/device.model';
import { toDevice, fromDeviceCreate, fromDeviceUpdate } from './device-assembler';

@Injectable({ providedIn: 'root' })
export class DevicesApi {
  private http = inject(HttpClient);


  private baseUrl = environment.baseUrl;

  private devicesUrl(): string {
    return `${this.baseUrl}/fleet/devices`;
  }

  private deviceByIdUrl(id: number): string {
    return `${this.baseUrl}/fleet/devices/${id}`;
  }

  private deviceFirmwareUrl(id: number): string {
    return `${this.baseUrl}/fleet/devices/${id}/firmware`;
  }

  private deviceOnlineUrl(id: number): string {
    return `${this.baseUrl}/fleet/devices/${id}/online`;
  }

  private devicesByOnlineUrl(online: boolean): string {
    return `${this.baseUrl}/fleet/devices/by-online/${online}`;
  }

  private deviceByImeiUrl(imei: string): string {
    return `${this.baseUrl}/fleet/devices/by-imei/${encodeURIComponent(imei)}`;
  }

  getAll(): Observable<Device[]> {
    return this.http.get<any[]>(this.devicesUrl()).pipe(
      map(list => list.map(toDevice))
    );
  }

  getById(id: number): Observable<Device> {
    return this.http.get<any>(this.deviceByIdUrl(id)).pipe(
      map(toDevice)
    );
  }

  create(payload: Device): Observable<Device> {
    return this.http.post<any>(this.devicesUrl(), fromDeviceCreate(payload)).pipe(
      map(toDevice)
    );
  }

  update(payload: Device): Observable<Device> {
    return this.http.put<any>(this.deviceByIdUrl(payload.id!), fromDeviceUpdate(payload)).pipe(
      map(toDevice)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.deviceByIdUrl(id));
  }

  updateFirmware(id: number, firmware: string): Observable<Device> {
    const params = new HttpParams().set('firmware', (firmware ?? '').trim());
    return this.http
      .post<any>(this.deviceFirmwareUrl(id), null, { params })
      .pipe(map(toDevice));
  }

  updateOnline(id: number, online: boolean): Observable<Device> {
    return this.http
      .patch<any>(this.deviceOnlineUrl(id), { online })
      .pipe(map(toDevice));
  }

  findByOnline(online: boolean): Observable<Device[]> {
    return this.http
      .get<any[]>(this.devicesByOnlineUrl(online))
      .pipe(map(list => list.map(toDevice)));
  }

  findByImei(imei: string): Observable<Device> {
    return this.http
      .get<any>(this.deviceByImeiUrl(imei))
      .pipe(map(toDevice));
  }
}
