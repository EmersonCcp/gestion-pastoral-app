import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Asistencia } from '../interfaces/entities/asistencia.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, ApiErrorResponse } from '../interfaces/reponses/response.types';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService extends BaseService<Asistencia> {
  protected override endpoint = `${environment.apiUrl}/asistencias`;

  constructor(http: HttpClient) {
    super(http);
  }

  getPersonaSummary(personaId: number): Observable<ApiResponse<any> | ApiErrorResponse> {
    return this.http.get<ApiResponse<any> | ApiErrorResponse>(`${this.endpoint}/resumen-persona/${personaId}`);
  }
}
