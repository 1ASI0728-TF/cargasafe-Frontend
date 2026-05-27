import { CreateDeviceDto, DeviceResponse, UpdateDeviceDto } from './device-response';
import {Device} from '../domain/model/device.model';

const toNum = (v: unknown): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};


export const toDevice = (dto: DeviceResponse): Device => ({
  id: toNum(dto.id),
  imei: String(dto.imei ?? '').trim(),
  firmware: String(dto.firmware ?? 'v1.0.0'),
  online: !!dto.online,
  vehiclePlate: dto.vehiclePlate ?? null
});


export const fromDeviceCreate = (m: Device): CreateDeviceDto => ({
  imei: m.imei,
  firmware: m.firmware,
  online: m.online,
  vehiclePlate: m.vehiclePlate ?? null
});

export const fromDeviceUpdate = (m: Device): UpdateDeviceDto => ({
  imei: m.imei,
  firmware: m.firmware,
  online: m.online,
  vehiclePlate: m.vehiclePlate ?? null
});
