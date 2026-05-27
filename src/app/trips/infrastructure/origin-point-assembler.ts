import { OriginPoint } from '../domain/model/origin-point.entity';
import { OriginPointResource } from './origin-point-response';

export class OriginPointAssembler {
  static toEntitiesFromResources(resources: OriginPointResource[]): OriginPoint[] {
    return resources.map((resource: OriginPointResource) => this.toEntityFromResource(resource));
  }

  static toEntityFromResource(resource: OriginPointResource): OriginPoint {
    return new OriginPoint({
      id: resource.id,
      name: resource.name,
      address: resource.address,
      latitude: resource.latitude,
      longitude: resource.longitude,
    });
  }
}
