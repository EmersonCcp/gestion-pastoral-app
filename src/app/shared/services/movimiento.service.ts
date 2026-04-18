import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Movimiento } from '../interfaces/entities/movimiento.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService extends BaseService<Movimiento> {

  protected override endpoint = `${environment.apiUrl}/movimientos`;

  constructor(http: HttpClient) {
    super(http);
  }
}
