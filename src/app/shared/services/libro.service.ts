import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Libro } from '../interfaces/entities/libro.entity';
import { environment } from 'src/app/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LibroService extends BaseService<Libro> {
  protected override endpoint = `${environment.apiUrl}/libros`;

  constructor(http: HttpClient) {
    super(http);
  }
}
