import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

if (typeof process !== 'undefined' && process.setMaxListeners) {
  process.setMaxListeners(20);
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.activeRequests++;
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error instanceof HttpErrorResponse && error.message && error.message.includes('timeout')) {
          console.warn(`La requête vers ${request.url} a expiré.`);
        }
        
        if (error.error instanceof Error) {
          console.error('Erreur de connexion:', error.error.message);
        }
        
        if (error.status >= 500) {
          console.error('Erreur serveur:', error.message);
        }
        
        return throwError(() => error);
      }),
      finalize(() => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          
        }
      })
    );
  }
}