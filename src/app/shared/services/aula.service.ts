import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Aula } from '../interfaces/entities/aula.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AulaService extends BaseService<Aula> {
  protected override endpoint = `${environment.apiUrl}/aulas`;
  constructor(http: HttpClient) { super(http); }
}
