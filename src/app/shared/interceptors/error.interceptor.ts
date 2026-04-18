import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertService } from '../services/alert.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private alertService: AlertService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = 'Ocurrió un error inesperado';

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMsg = error.error.message;
        } else {
          // Error del lado del servidor
          errorMsg = error.error?.error?.message || error.error?.message || error.message || error.statusText;
          
          if (error.status === 401) {
            this.alertService.successOrError('Acceso Denegado', 'No tienes permiso para esta operación.', 'warning');
          } else {
            this.alertService.successOrError('Error', errorMsg, 'error');
          }
        }

        console.error('HTTP Error:', error);
        return throwError(() => error);
      })
    );
  }
}
