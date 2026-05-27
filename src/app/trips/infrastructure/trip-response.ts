import { DeliveryOrderResource } from './delivery-order-response';
import { OriginPointResource } from './origin-point-response';

export interface TripResource {
  id: number;
  statusId: number;
  driverId: number;
  driverName: string;
  deviceId: number;
  vehicleId: number;
  departureAt: string | null;
  merchantId: number;
  originPoint: OriginPointResource;
  deliveryOrders: DeliveryOrderResource[];
  startedAt: string | null;
  completedAt: string | null;
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface TripsResponse {
  trips: TripResource[];
}

export interface CreateTripResource {
  driverId: number;
  deviceId: number;
  vehicleId: number;
  merchantId: number;
  deliveryOrders: CreateTripDeliveryOrderResource[];
  originPointId: number;
}

export interface CreateTripDeliveryOrderResource {
  clientEmail: string;
  address: string;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
  maxHumidity?: number | null;
  minHumidity?: number | null;
  maxTemperature?: number | null;
  minTemperature?: number | null;
  maxVibration?: number | null;
}
