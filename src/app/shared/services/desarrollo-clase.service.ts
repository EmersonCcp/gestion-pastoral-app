import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { DesarrolloClase } from '../interfaces/entities/desarrollo-clase.entity';
import { environment } from 'src/app/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DesarrolloClaseService extends BaseService<DesarrolloClase> {
  protected override endpoint = `${environment.apiUrl}/desarrollo-clases`;

  constructor(http: HttpClient) {
    super(http);
  }
}
