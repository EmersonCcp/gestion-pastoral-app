import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Asignacion } from '../interfaces/entities/asignacion.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService extends BaseService<Asignacion> {
  protected override endpoint = `${environment.apiUrl}/asignaciones`;
  constructor(http: HttpClient) { super(http); }

  clonar(dto: { periodo_origen_id: number; periodo_destino_id: number; copiar_personas?: boolean; movimiento_id: number }) {
    return this.http.post<any>(`${this.endpoint}/clonar`, dto);
  }
}
