import { TripParameter } from '../domain/model/trip-parameter.entity';
import { TripParameterResource } from './trip-parameter-response';

export class TripParameterAssembler {
  static toEntitiesFromResources(resources: TripParameterResource[]): TripParameter[] {
    return resources.map((resource: TripParameterResource) => this.toEntityFromResource(resource));
  }

  static toEntityFromResource(resource: TripParameterResource): TripParameter {
    return new TripParameter({
      id: resource.id,
      tripId: resource.tripId,
      minTemperature: resource.minTemperature,
      maxTemperature: resource.maxTemperature,
      minHumidity: resource.minHumidity,
      maxHumidity: resource.maxHumidity,
      maxVibration: resource.maxVibration,
      trip: null,
    });
  }
}
