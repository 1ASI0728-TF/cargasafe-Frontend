import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ProfileResource } from './profile-resources';
import { map } from 'rxjs';
import { ProfileAssembler } from './profile-assembler';
import { Profile } from '../domain/model/profile.entity';

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private profileEndpoint = environment.profileEndpointPath;
  private baseUrl = `${environment.baseUrl}${this.profileEndpoint}`;
  private http = inject(HttpClient);

  getProfileByUserId(userId: number) {
    return this.http
      .get<ProfileResource>(`${this.baseUrl}/user/${userId}`)
      .pipe(map(ProfileAssembler.toEntityFromResource));
  }

  updateProfile(profile: Profile) {
    const updateProfileResource = ProfileAssembler.toUpdateProfileResourceFromEntity(profile);

    return this.http
      .put<ProfileResource>(`${this.baseUrl}/${profile.id}`, updateProfileResource)
      .pipe(map(ProfileAssembler.toEntityFromResource));
  }
}
