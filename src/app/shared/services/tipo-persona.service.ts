import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { TipoPersona } from '../interfaces/entities/persona.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoPersonaService extends BaseService<TipoPersona> {
  protected override endpoint = `${environment.apiUrl}/tipos-personas`;
  constructor(http: HttpClient) { super(http); }
}
