import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {TokenRepository} from './token-repository';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenRepository = inject(TokenRepository);
  const router = inject(Router);

  const accessToken = tokenRepository.getAccessToken();

  if (!accessToken) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  return true;
};
