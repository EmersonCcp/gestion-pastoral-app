import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Periodo } from '../interfaces/entities/periodo.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService extends BaseService<Periodo> {

  protected override endpoint = `${environment.apiUrl}/periodos`;

  constructor(http: HttpClient) {
    super(http);
  }
}
