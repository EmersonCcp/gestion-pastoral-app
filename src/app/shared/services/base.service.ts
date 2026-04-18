import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiErrorResponse, ApiListResponse, ApiResponse } from '../interfaces/reponses/response.types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T, TList = T> {
  protected abstract endpoint: string;
  protected authService = inject(AuthService);

  constructor(protected http: HttpClient) { }

  getAll(paramsData?: Record<string, any>): Observable<ApiListResponse<TList> | ApiErrorResponse> {
    let params = new HttpParams();

    if (paramsData) {
      Object.entries(paramsData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value);
        }
      });
    }

    const movementId = this.authService.getSelectedMovimientoId();
    if (movementId && !params.has('movimiento_id')) {
      params = params.set('movimiento_id', movementId.toString());
    }

    return this.http.get<ApiListResponse<TList>>(this.endpoint, { params });
  }

  getById(id: number): Observable<ApiResponse<T> | ApiErrorResponse> {
    return this.http.get<ApiResponse<T> | ApiErrorResponse>(`${this.endpoint}/${id}`);
  }

  create(data: any): Observable<ApiResponse<T> | ApiErrorResponse> {
    const movementId = this.authService.getSelectedMovimientoId();
    if (movementId && !data.movimiento_id) {
      data.movimiento_id = movementId;
    }
    return this.http.post<ApiResponse<T> | ApiErrorResponse>(this.endpoint, data);
  }

  update(id: number, data: Partial<T>): Observable<ApiResponse<T> | ApiErrorResponse> {
    return this.http.put<ApiResponse<T> | ApiErrorResponse>(`${this.endpoint}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<null> | ApiErrorResponse> {
    return this.http.delete<ApiResponse<null> | ApiErrorResponse>(`${this.endpoint}/${id}`);
  }
}