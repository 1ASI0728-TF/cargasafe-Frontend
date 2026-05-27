import { inject, Injectable, signal } from '@angular/core';
import { User } from '../domain/models/user.entity';
import { TokenRepository } from '../infrastructure/token-repository';
import { UserApi } from '../infrastructure/user-api';

@Injectable({ providedIn: 'root' })
export class UserStore {
  user = signal<User | null>(null);
  loadingUser = signal<boolean>(false);
  userApi = inject(UserApi);
  tokenRepository = inject(TokenRepository);

  loadUser() {
    const payload = this.tokenRepository.parseToken();

    if (!payload) {
      this.user.set(null);
      console.warn('No valid token found, cannot load user.');
      return;
    }

    console.log('Full token payload:', payload);
    
    // Try to extract user info from token
    const userId = (payload as any).uid || (payload as any).sub || (payload as any).userId || (payload as any).id;
    const email = (payload as any).email || (payload as any).username || (payload as any).sub;
    const roles = (payload as any).roles || (payload as any).authorities || [];
    
    console.log('Extracted from token - userId:', userId, 'email:', email, 'roles:', roles);
    
    // If token contains roles, create user directly from token
    if (roles && roles.length > 0 && userId) {
      console.log('Creating user from token data');
      const user = new User({
        id: parseInt(userId),
        email: email,
        roles: roles
      });
      this.user.set(user);
      console.log('User created from token:', user);
      return;
    }
    
    // Otherwise, fetch from API
    if (!userId) {
      console.error('Could not extract userId from token. Available keys:', Object.keys(payload));
      this.user.set(null);
      return;
    }

    console.log('Fetching user from API...');
    this.loadingUser.set(true);

    this.userApi.getUserById(userId).subscribe({
      next: (user) => {
        console.log('User loaded from API:', user);
        console.log('User roles:', user.roles);
        this.user.set(user);
        this.loadingUser.set(false);
      },
      error: (err) => {
        this.user.set(null);
        console.error('Failed to load user from API:', err);
        this.loadingUser.set(false);
      },
    });
  }
}
