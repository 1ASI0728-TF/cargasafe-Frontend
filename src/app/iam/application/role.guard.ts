import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from './user.store';


export const roleGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  const user = userStore.user(); // signal<User | null>

  if (!user || !allowedRoles || allowedRoles.length === 0) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  const hasRole = user.roles?.some((r) => allowedRoles.includes(r));

  if (!hasRole) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
