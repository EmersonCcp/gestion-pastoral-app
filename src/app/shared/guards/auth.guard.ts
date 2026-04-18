import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { isTokenValid } from "../utils/auth.utils";

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  if (isTokenValid()) {
    return true;
  }


  router.navigate(['/auth/login']);
  return false;

  
};