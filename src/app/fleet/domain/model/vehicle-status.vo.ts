export enum VehicleStatus {
  IN_SERVICE = 'IN_SERVICE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}


export const ALL_VEHICLE_STATUSES: VehicleStatus[] = [
  VehicleStatus.IN_SERVICE,
  VehicleStatus.OUT_OF_SERVICE,
  VehicleStatus.MAINTENANCE,
  VehicleStatus.RETIRED,
];
