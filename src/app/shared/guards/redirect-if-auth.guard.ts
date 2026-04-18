import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { isTokenValid } from '../utils/auth.utils';

export const redirectIfAuthenticated: CanActivateFn = () => {
  const router = inject(Router);

  if (isTokenValid()) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};