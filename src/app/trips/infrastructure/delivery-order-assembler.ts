import { __disposeResources } from 'tslib';
import { DeliveryOrderStatus } from '../domain/model/delivery-order-status.vo';
import { DeliveryOrder } from '../domain/model/delivery-order.entity';
import { DeliveryOrderResource } from './delivery-order-response';

export class DeliveryOrderAssembler {
  static toEntitiesFromResources(resources: DeliveryOrderResource[]): DeliveryOrder[] {
    return resources.map((resource: DeliveryOrderResource) => this.toEntityFromResource(resource));
  }

  static toEntityFromResource(resource: DeliveryOrderResource): DeliveryOrder {
    return new DeliveryOrder({
      id: resource.id,
      clientEmail: resource.clientEmail,
      address: resource.address,
      latitude: resource.latitude,
      longitude: resource.longitude,
      sequenceOrder: resource.sequenceOrder,
      arrivalAt: resource.arrivalAt ? new Date(resource.arrivalAt) : null,
      notes: '',
      maxHumidity: resource.maxHumidity,
      minHumidity: resource.minHumidity,
      maxTemperature: resource.maxTemperature,
      minTemperature: resource.minTemperature,
      maxVibration: resource.maxVibration,
      tripId: resource.tripId,
      trip: null,
      status: DeliveryOrderAssembler.parseStatus(resource.status),
    });
  }

  private static parseStatus(status: string): DeliveryOrderStatus {
    switch (status) {
      case 'PENDING':
        return DeliveryOrderStatus.PENDING;
      case 'IN_PROGRESS':
        return DeliveryOrderStatus.IN_PROGRESS;
      case 'DELIVERED':
        return DeliveryOrderStatus.DELIVERED;
      case 'CANCELLED':
        return DeliveryOrderStatus.CANCELLED;
      default:
        throw new Error(`Unknown delivery order status: ${status}`);
    }
  }
}
