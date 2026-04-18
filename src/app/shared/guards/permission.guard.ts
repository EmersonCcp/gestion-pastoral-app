import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { hasPermission } from "../utils/auth.utils";

export const permissionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const requiredPermissions = route.data['permissions'] as string | string[];

  if (!requiredPermissions) {
    return true;
  }

  if (hasPermission(requiredPermissions)) {
    return true;
  }

  // Si no tiene permiso, lo mandamos al dashboard por defecto
  router.navigate(['/admin/dashboard']);
  return false;
};
