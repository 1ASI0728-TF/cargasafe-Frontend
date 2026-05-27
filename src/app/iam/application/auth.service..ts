import { inject, Injectable } from '@angular/core';
import { AuthenticationApi } from '../infrastructure/authentication-api';
import { TokenRepository } from '../infrastructure/token-repository';
import { tap } from 'rxjs';
import { UserStore } from './user.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authApi = inject(AuthenticationApi);
  private tokenRepository = inject(TokenRepository);
  private userStore = inject(UserStore);

  signIn(email: string, password: string) {
    return this.authApi.signIn(email, password).pipe(
      tap((response) => {
        console.log('Sign-in response:', response);
        this.tokenRepository.save(response.accessToken, response.refreshToken);
        console.log('Tokens saved, loading user...');
        this.userStore.loadUser();
      })
    );
  }

  signUp(email: string, password: string, profile: { firstName: string; lastName: string }, roles: string[] = ['CLIENT']) {
    return this.authApi.signUp(email, password, profile, roles);
  }

  logout() {
    return this.authApi.logout().pipe(
      tap(() => {
        this.tokenRepository.clear();
        this.userStore.user.set(null);
      })
    );
  }
}
