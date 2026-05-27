import { CreateVehicleDto, UpdateVehicleDto, VehicleResponse } from './vehicle-response';
import { Vehicle } from '../domain/model/vehicle.model';
import { VehicleStatus } from '../domain/model/vehicle-status.vo';
import { VehicleType } from '../domain/model/vehicle-type.vo';


export const UA = (arr: unknown[], fallback: string[] = []) =>
  (Array.isArray(arr) ? arr : fallback).map(U);

export const toNum = (v: unknown): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export const U = (s: unknown) => String(s ?? '').trim().toUpperCase();



const parseVehicleType = (value: unknown): VehicleType => {
  const upper = U(value);
  switch (upper) {
    case VehicleType.TRUCK:
    case VehicleType.VAN:
    case VehicleType.CAR:
    case VehicleType.MOTORCYCLE:
      return upper as VehicleType;
    default:
      throw new Error(`Unknown vehicle type: ${upper}`);
  }
};

const parseVehicleStatus = (value: unknown): VehicleStatus => {
  const upper = U(value);
  switch (upper) {
    case VehicleStatus.IN_SERVICE:
    case VehicleStatus.OUT_OF_SERVICE:
    case VehicleStatus.MAINTENANCE:
    case VehicleStatus.RETIRED:
      return upper as VehicleStatus;
    default:
      throw new Error(`Unknown vehicle status: ${upper}`);
  }
};



export const toVehicle = (dto: VehicleResponse): Vehicle => ({
  id: toNum(dto.id),
  plate: String(dto.plate ?? '').trim(),
  type: parseVehicleType(dto.type),
  capabilities: UA(dto.capabilities ?? []),
  status: parseVehicleStatus(dto.status),
  odometerKm: Number(dto.odometerKm ?? 0),
  deviceImeis: Array.isArray(dto.deviceImeis) ? dto.deviceImeis : [],
});



export const fromVehicleCreate = (m: Vehicle): CreateVehicleDto => ({
  plate: String(m.plate ?? '').trim(),
  type: U(m.type),
  capabilities: UA(m.capabilities ?? []),
  status: U(m.status),
  odometerKm: Number(m.odometerKm ?? 0),
  deviceImeis: Array.isArray(m.deviceImeis) ? m.deviceImeis : [],
});

export const fromVehicleUpdate = (m: Vehicle): UpdateVehicleDto =>
  fromVehicleCreate(m);
