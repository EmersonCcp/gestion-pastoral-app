import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { IPermiso } from '../interfaces/entities/permiso.entity';
import {
  ApiErrorResponse,
  ApiListResponse,
} from '../interfaces/reponses/response.types';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PermisoService extends BaseService<IPermiso> {
  protected endpoint = `${environment.apiUrl}/permisos`;

  constructor(http: HttpClient) {
    super(http);
  }

  getPermisosByUsuario(
    usu_codigo: number,
  ): Observable<ApiListResponse<string[]> | ApiErrorResponse> {
    return this.http.get<ApiListResponse<string[]> | ApiErrorResponse>(
      `${this.endpoint}/permisos/by-user/${usu_codigo}`,
    );
  }
}
