
export interface DeviceResponse {
  id: number;                 // Long -> number
  imei: string;
  firmware: string;
  online: boolean;
  vehiclePlate?: string | null;
}


export interface CreateDeviceDto {
  imei: string;
  firmware: string;
  online: boolean;
  vehiclePlate?: string | null;
}


export interface UpdateDeviceDto {
  imei: string;
  firmware: string;
  online: boolean;
  vehiclePlate?: string | null;
}


export interface UpdateDeviceFirmwareDto { firmware: string; }
export interface UpdateDeviceOnlineDto   { online: boolean;   }
