import { User } from '../domain/models/user.entity';
import { UserResource } from './user-resources';

export class UserAssembler {
  static toEntityFromResource(resource: UserResource): User {
    return new User({
      id: resource.id,
      email: resource.username,
      roles: resource.roles,
    });
  }
}
