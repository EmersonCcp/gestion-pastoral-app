import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventarioService extends BaseService<any> {
  protected endpoint = `${environment.apiUrl}/libros-inventario`;

  constructor(http: HttpClient) {
    super(http);
  }

  registrarMovimiento(dto: any): Observable<any> {
    const movementId = this.authService.getSelectedMovimientoId();
    if (movementId && !dto.movimiento_id) dto.movimiento_id = movementId;
    return this.http.post(`${this.endpoint}/movimiento`, dto);
  }

  asignarLibro(dto: any): Observable<any> {
    const movementId = this.authService.getSelectedMovimientoId();
    if (movementId && !dto.movimiento_id) dto.movimiento_id = movementId;
    return this.http.post(`${this.endpoint}/asignar`, dto);
  }

  devolverLibro(id: number, dto: any): Observable<any> {
    return this.http.post(`${this.endpoint}/devolver/${id}`, dto);
  }

  getHistorial(paramsData: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(paramsData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value as any);
      }
    });

    const movementId = this.authService.getSelectedMovimientoId();
    if (movementId && !params.has('movimiento_id')) {
      params = params.set('movimiento_id', movementId.toString());
    }

    return this.http.get(`${this.endpoint}/historial`, { params });
  }

  getAsignaciones(paramsData: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(paramsData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value as any);
      }
    });

    const movementId = this.authService.getSelectedMovimientoId();
    if (movementId && !params.has('movimiento_id')) {
      params = params.set('movimiento_id', movementId.toString());
    }

    return this.http.get(`${this.endpoint}/asignaciones`, { params });
  }
}
