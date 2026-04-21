import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, ApiErrorResponse } from '../interfaces/reponses/response.types';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private endpoint = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getStats(movimientoId?: number): Observable<ApiResponse<any> | ApiErrorResponse> {
    return this.http.get<ApiResponse<any> | ApiErrorResponse>(`${this.endpoint}/stats?movimientoId=${movimientoId}`);
  }

  getBirthdays(month: number, movimientoId?: number, page: number = 1, perPage: number = 8): Observable<ApiResponse<any> | ApiErrorResponse> {
    return this.http.get<ApiResponse<any> | ApiErrorResponse>(`${this.endpoint}/birthdays?month=${month}&movimientoId=${movimientoId}&page=${page}&per_page=${perPage}`);
  }
}
