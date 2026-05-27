import { TripStatus } from '../domain/model/trip-status.vo';
import { Trip } from '../domain/model/trip.entity';
import { DeliveryOrderAssembler } from './delivery-order-assembler';
import { OriginPointAssembler } from './origin-point-assembler';
import {
  CreateTripDeliveryOrderResource,
  CreateTripResource,
  TripResource,
  TripsResponse,
} from './trip-response';

export class TripAssembler {
  static toEntitiesFromResponse(responses: TripsResponse): Trip[] {
    return responses.trips.map((response) => this.toEntityFromResource(response));
  }

  static toEntityFromResource(resource: TripResource): Trip {
    const status = TripAssembler.parseStatus(resource.status);
    const trip = new Trip({
      id: Number.isFinite(resource.id as any) ? (resource.id as any as number) : 0,
      driverId: resource.driverId,
      deviceId: resource.deviceId,
      vehicleId: resource.vehicleId,
      createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt),
      completedAt: resource.completedAt ? new Date(resource.completedAt) : null,
      startedAt: resource.startedAt ? new Date(resource.startedAt) : null,
      driverName: resource.driverName,
      originPointId: resource.originPoint.id,
      originPoint: OriginPointAssembler.toEntityFromResource(resource.originPoint),
      deliveryOrders: resource.deliveryOrders.map(DeliveryOrderAssembler.toEntityFromResource),
      status,
    });

    return trip;
  }

  private static parseStatus(status: string): TripStatus {
    switch (status) {
      case 'CREATED':
        return TripStatus.CREATED;
      case 'IN_PROGRESS':
        return TripStatus.IN_PROGRESS;
      case 'COMPLETED':
        return TripStatus.COMPLETED;
      case 'CANCELLED':
        return TripStatus.CANCELLED;
      default:
        throw new Error(`Unknown trip status: ${status}`);
    }
  }

  static toCreateResourceFromEntity(entity: Trip): CreateTripResource {
    return {
      driverId: entity.driverId,
      deviceId: entity.deviceId,
      merchantId: 1,
      vehicleId: entity.vehicleId,
      originPointId: entity.originPointId,
      deliveryOrders: entity.deliveryOrders.map<CreateTripDeliveryOrderResource>((o) => ({
        address: o.address,
        clientEmail: o.clientEmail,
        latitude: o.latitude,
        longitude: o.longitude,
        sequenceOrder: o.sequenceOrder,
        maxHumidity: o.maxHumidity,
        minHumidity: o.minHumidity,
        maxTemperature: o.maxTemperature,
        minTemperature: o.minTemperature,
      })),
    };
  }
}
