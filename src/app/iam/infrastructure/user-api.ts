import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserResource } from './user-resources';
import { map } from 'rxjs';
import { UserAssembler } from './user-assembler';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private http = inject(HttpClient);
  private base = `${environment.baseUrl}/users`;

  getUserById(userId: string) {
    return this.http
      .get<UserResource>(`${this.base}/${userId}`)
      .pipe(map(UserAssembler.toEntityFromResource));
  }
}
