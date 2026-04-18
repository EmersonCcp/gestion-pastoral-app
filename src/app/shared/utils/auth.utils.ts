import { jwtDecode } from 'jwt-decode';

export function isTokenValid(): boolean {
  const token = localStorage.getItem('accessToken');

  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);

    return (
      decoded && typeof decoded.id !== 'undefined' && 'isSuperAdmin' in decoded
    );
  } catch {
    return false;
  }
}

export function hasPermission(requiredPermissions: string | string[]): boolean {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    
    // Si es SuperAdmin, tiene todos los permisos
    if (decoded && decoded.isSuperAdmin) {
      return true;
    }

    const permisosStr = localStorage.getItem('permisos');
    if (!permisosStr) return false;

    let userPermissions: string[] = [];
    try {
      userPermissions = JSON.parse(permisosStr);
    } catch {
      userPermissions = permisosStr.split(',');
    }

    const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    
    return required.some(p => {
      // Si el usuario tiene el permiso exacto
      if (userPermissions.includes(p)) return true;

      // Soporte para comodín '*' (ej: 'libros.*' permite 'libros.read')
      const [entity] = p.split('.');
      if (entity && userPermissions.includes(`${entity}.*`)) return true;

      // Soporte para '*' global (aunque isSuperAdmin ya lo cubre)
      if (userPermissions.includes('*')) return true;

      return false;
    });

  } catch {
    return false;
  }
}

export function getDecodedToken(): any {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}
