import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Persona } from '../interfaces/entities/persona.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonaService extends BaseService<Persona> {
  protected override endpoint = `${environment.apiUrl}/personas`;
  constructor(http: HttpClient) { super(http); }

  addRelacion(dto: any) {
    return this.http.post(`${this.endpoint}/relaciones`, dto);
  }

  removeRelacion(id: number) {
    return this.http.delete(`${this.endpoint}/relaciones/${id}`);
  }
}
