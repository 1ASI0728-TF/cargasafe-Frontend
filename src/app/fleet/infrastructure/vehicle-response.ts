export interface VehicleResponse {
  id: number;
  plate: string;
  type: string;
  capabilities: string[] | null;
  status: string;
  odometerKm: number;
  deviceImeis: string[] | null;
}

export interface CreateVehicleDto {
  plate: string;
  type: string;
  capabilities: string[];
  status: string;
  odometerKm: number;
  deviceImeis: string[];
}


export interface UpdateVehicleDto extends CreateVehicleDto {}

export interface UpdateVehicleStatusDto {
  status: string;
}
