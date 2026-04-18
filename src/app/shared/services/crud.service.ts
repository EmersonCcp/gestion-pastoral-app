import { Inject, inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiErrorResponse, ApiListResponse, ApiResponse } from '../interfaces/reponses/response.types';
import { FindAllQuery } from '../interfaces/querys/find-all-query.interface';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { AuthService } from './auth.service';

@Injectable()
export class CrudService<T> {
  constructor(
    public http: HttpClient,
    @Inject(API_BASE_URL) public baseUrl: string
  ) {}

  private authService = inject(AuthService);

  /**
   * Crear
   */
  create(dto: any): Observable<ApiResponse<T> | ApiErrorResponse> {
    const movementId = this.authService.getSelectedMovimientoId();
    if (movementId && !dto.movimiento_id) {
      dto.movimiento_id = movementId;
    }
    return this.http.post<ApiResponse<T> | ApiErrorResponse>(this.baseUrl, dto);
  }

  /**
   * Obtener listado con paginado, búsqueda, orden, filtros
   */
  findAll<F extends Record<string, any> = Record<string, any>>(
    query: FindAllQuery<F>
  ) {
    let params = new HttpParams();

    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        params = params.set(key, value.join(','));
        return;
      }

      if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
          if (v != null) {
            params = params.set(k, String(v));
          }
        });
        return;
      }

      params = params.set(key, String(value));
    });

    const movementId = this.authService.getSelectedMovimientoId();
    if (movementId && !params.has('movimiento_id')) {
      params = params.set('movimiento_id', movementId.toString());
    }

    return this.http.get<ApiListResponse<T> | ApiErrorResponse>(this.baseUrl, {
      params,
    });
  }

  /**
   * Obtener único
   */
  findOne(id: number): Observable<ApiResponse<T> | ApiErrorResponse> {
    return this.http.get<ApiResponse<T> | ApiErrorResponse>(
      `${this.baseUrl}/${id}`
    );
  }

  /**
   * Actualizar
   */
  update(id: number, dto: any): Observable<ApiResponse<T> | ApiErrorResponse> {
    return this.http.patch<ApiResponse<T> | ApiErrorResponse>(
      `${this.baseUrl}/${id}`,
      dto
    );
  }

  /**
   * Eliminar
   */
  remove(
    id: number
  ): Observable<ApiResponse<{ deleted: true }> | ApiErrorResponse> {
    return this.http.delete<ApiResponse<{ deleted: true }> | ApiErrorResponse>(
      `${this.baseUrl}/${id}`
    );
  }
}