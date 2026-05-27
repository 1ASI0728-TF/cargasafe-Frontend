import { VehicleType } from './vehicle-type.vo';
import { VehicleStatus } from './vehicle-status.vo';

export interface Vehicle {
  id?: number;
  plate: string;
  type: VehicleType;
  capabilities: string[];
  status: VehicleStatus;
  odometerKm: number;
  deviceImeis: string[];
}

export const defaultVehicle: Vehicle = {
  plate: '',
  type: VehicleType.TRUCK,
  capabilities: [],
  status: VehicleStatus.IN_SERVICE,
  odometerKm: 0,
  deviceImeis: [],
};
