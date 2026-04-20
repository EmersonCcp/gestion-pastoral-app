import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { DocumentoPersona } from '../interfaces/entities/persona.entity';
import { Observable } from 'rxjs';
import { ApiListResponse, ApiResponse, ApiErrorResponse } from '../interfaces/reponses/response.types';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentoPersonaService extends BaseService<DocumentoPersona> {
  protected override endpoint = `${environment.apiUrl}/documentos-persona`;

  getByPersona(personaId: number): Observable<ApiResponse<DocumentoPersona[]> | ApiErrorResponse> {
    return this.http.get<ApiResponse<DocumentoPersona[]>>(`${this.endpoint}/persona/${personaId}`);
  }
}
