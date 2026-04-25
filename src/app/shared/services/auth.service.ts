import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { LoginResponse } from 'src/app/modules/auth/interfaces/auth.interface';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'accessToken';
  private userKey = 'current_user';
  private movimientoKey = 'selected_movimiento_id';
  private permissionsSubject = new BehaviorSubject<string[]>(this.getPermissionsFromStorage());
  public permissions$ = this.permissionsSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response: any) => {
          // 🔴 Si el backend responde ok=false → lanzamos error
          if (!response.ok) {
            throw new Error(
              response.error?.message || 'Credenciales inválidas'
            );
          }

          // ✅ Solo si ok === true
          localStorage.setItem(this.tokenKey, response.data.accessToken);
          localStorage.setItem('permisos', response.data.usuario.permissions);
          this.encriptarUsuario(response.data.usuario);
        }),
        catchError((error) => {
          // Re-lanzamos el error para que lo maneje el componente
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<any> {
    const token = this.getToken();

    return this.http
      .post(`${this.apiUrl}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap(() => {
          // 🔥 Limpiar storage después de logout en backend
          localStorage.removeItem('accessToken');
          localStorage.removeItem('current_user');
          localStorage.removeItem('permisos');

          this.router.navigate(['/auth/login']);
        }),
        catchError((error) => {
          // ⚠️ Aunque falle el backend, igual cerramos sesión en frontend
          localStorage.removeItem('accessToken');
          localStorage.removeItem('current_user');
          localStorage.removeItem('permisos');

          this.router.navigate(['/auth/login']);

          return throwError(() => error);
        })
      );
  }

  encriptarUsuario(usuario: any) {
    const encryptedUser = CryptoJS.AES.encrypt(
      JSON.stringify(usuario),
      'tangamandapio'
    ).toString();

    localStorage.setItem(this.userKey, encryptedUser);
  }

  desencriptarUsuario() {
    const encrypted = localStorage.getItem(this.userKey);

    if (encrypted) {
      const bytes = CryptoJS.AES.decrypt(encrypted, 'tangamandapio');
      const decryptedUser = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedUser;
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  changePassword(
    dto: any
  ): Observable<{ ok: boolean; message: string; item?: any }> {
    return this.http.post<{ ok: boolean; message: string; item?: any }>(
      `${this.apiUrl}/change-password`,
      dto
    );
  }

  refreshPermissions(): Observable<any> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('No token found'));

    return this.http.get<any>(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(response => {
        if (response.ok && response.data) {
          if (response.data.accessToken) {
            localStorage.setItem(this.tokenKey, response.data.accessToken);
          }
          localStorage.setItem('permisos', JSON.stringify(response.data.permissions));
          // También actualizamos el usuario encriptado
          this.encriptarUsuario(response.data);
          
          // Notificar cambios de permisos
          this.permissionsSubject.next(response.data.permissions || []);
        }
      })
    );
  }

  private getPermissionsFromStorage(): string[] {
    const permisosStr = localStorage.getItem('permisos');
    if (!permisosStr) return [];
    try {
      return JSON.parse(permisosStr);
    } catch {
      return permisosStr.split(',');
    }
  }

  getSelectedMovimientoId(): number | null {
    const id = localStorage.getItem(this.movimientoKey);
    return id ? parseInt(id, 10) : null;
  }

  setSelectedMovimientoId(id: number) {
    localStorage.setItem(this.movimientoKey, id.toString());
  }

  getUserMovimientos(): any[] {
    const user = this.desencriptarUsuario();
    if (user?.is_super_user) {
      // SuperAdmin case: we might need a separate call to get all movements
      // or assume the movements are already in the user object if assigned.
      // But for SuperAdmin, we usually show all.
      return user.movimientos || [];
    }
    return user?.movimientos || [];
  }
}
