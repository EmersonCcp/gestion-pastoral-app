import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Grupo } from '../interfaces/entities/grupo.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GrupoService extends BaseService<Grupo> {

  protected override endpoint = `${environment.apiUrl}/grupos`;

  constructor(http: HttpClient) {
    super(http);
  }

  getEstadisticas(id: number): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/${id}/estadisticas`);
  }
}
