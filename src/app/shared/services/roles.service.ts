import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { IRol } from '../interfaces/entities/rol.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService extends BaseService<IRol>{

  protected endpoint = `${environment.apiUrl}/roles`;
  
    constructor(http: HttpClient) {
      super(http);
    }

}
