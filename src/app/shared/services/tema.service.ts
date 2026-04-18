import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Tema } from '../interfaces/entities/tema.entity';
import { environment } from 'src/app/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiListResponse, ApiErrorResponse } from '../interfaces/reponses/response.types';

@Injectable({
  providedIn: 'root'
})
export class TemaService extends BaseService<Tema> {
  protected override endpoint = `${environment.apiUrl}/temas`;

  constructor(http: HttpClient) {
    super(http);
  }

  getByLibro(libroId: number): Observable<ApiListResponse<Tema> | ApiErrorResponse> {
    return this.getAll({ libro_id: libroId });
  }
}
