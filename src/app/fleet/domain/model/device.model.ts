export interface Device {
  id?: number;
  imei: string;
  firmware: string;
  online: boolean;
  vehiclePlate?: string | null;
}

export const defaultDevice: Device = {
  imei: '',
  firmware: 'v1.0.0',
  online: false,
  vehiclePlate: null
};
