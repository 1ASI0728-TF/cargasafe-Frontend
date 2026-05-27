import { inject, Injectable } from '@angular/core';
import { createAsyncState } from '../../shared/helpers/async-state';
import { Profile } from '../domain/model/profile.entity';
import { ProfileApi } from '../infrastructure/profile-api';
import { finalize, tap, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  readonly profileState = createAsyncState<Profile | null>(null);
  readonly profileApi = inject(ProfileApi);

  loadProfileByUserId(userId: number) {
    return this.profileApi.getProfileByUserId(userId).pipe(
      // todo: remove delay before release
      delay(1000), // Simulate network delay
      tap({
        subscribe: () => {
          this.profileState.setLoading(true);
          console.log('Loading profile...');
        },
        next: (profile) => {
          this.profileState.setData(profile);
        },
        error: () => {
          this.profileState.setError('Failed to load profile');
        },
      }),
      finalize(() => {
        console.log('Profile load attempt finished');
        this.profileState.setLoading(false);
      })
    );
  }

  updateProfile(profile: Profile) {
    return this.profileApi.updateProfile(profile);
  }
}
