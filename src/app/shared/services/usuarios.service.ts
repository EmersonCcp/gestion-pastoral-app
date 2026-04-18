import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { IUsuario } from '../interfaces/entities/usuario.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseService<IUsuario>{

  protected endpoint = `${environment.apiUrl}/usuarios`;
  
  constructor(http: HttpClient) {
    super(http);
  }
}
