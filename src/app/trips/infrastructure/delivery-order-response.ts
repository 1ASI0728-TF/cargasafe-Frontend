export interface DeliveryOrderResource {
  id: number;
  tripId: number;
  clientEmail: string;
  sequenceOrder: number;
  address: string;
  latitude: number;
  longitude: number;
  maxHumidity: number | null;
  minHumidity: number | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  maxVibration: number | null;
  arrivalAt: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
}
