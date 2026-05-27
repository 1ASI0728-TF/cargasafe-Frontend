import { Profile } from '../domain/model/profile.entity';
import { ProfileResource, UpdateProfileResource } from './profile-resources';

export class ProfileAssembler {
  static toEntityFromResource(resource: ProfileResource): Profile {
    return new Profile({
      id: resource.id,
      firstName: resource.firstName,
      lastName: resource.lastName,
      phoneNumber: resource.phoneNumber,
      documentType: resource.documentType,
      document: resource.document,
      userId: resource.userId,
      birthDate: resource.birthDate ? new Date(resource.birthDate) : null,
    });
  }

  static toUpdateProfileResourceFromEntity(entity: Profile): UpdateProfileResource {
    return {
      firstName: entity.firstName,
      lastName: entity.lastName,
      phoneNumber: entity.phoneNumber,
      documentType: entity.documentType,
      document: entity.document,
      birthDate: entity.birthDate ? entity.birthDate.toISOString().split('T')[0] : null,
    };
  }
}
