import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenRepository } from './token-repository';

export const authInterceptors: HttpInterceptorFn = (req, next) => {
  // Inject repository from Infrastructure layer
  const tokenRepository = inject(TokenRepository);

  // Retrieve access token from localStorage through the repository
  const accessToken = tokenRepository.getAccessToken();

  // If no token exists, forward the request without modifications
  if (!accessToken) {
    return next(req);
  }

  // Clone the request and attach the Authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Forward the modified request
  return next(authReq);
};
