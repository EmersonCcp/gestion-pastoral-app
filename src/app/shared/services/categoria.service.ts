import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ICategoria } from '../interfaces/entities/categoria.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService extends BaseService<ICategoria> {

  protected endpoint = `${environment.apiUrl}/categorias`;
  
    constructor(http: HttpClient) {
      super(http);
    }
}
