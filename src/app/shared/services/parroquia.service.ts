import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Parroquia } from '../interfaces/entities/parroquia.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParroquiaService extends BaseService<Parroquia> {

  protected override endpoint = `${environment.apiUrl}/parroquias`;

  constructor(http: HttpClient) {
    super(http);
  }
}
