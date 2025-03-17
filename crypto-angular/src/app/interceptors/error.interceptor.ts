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

// Solution pour l'erreur MaxListenersExceededWarning
if (typeof process !== 'undefined' && process.setMaxListeners) {
  // Augmenter la limite à 20 ou plus selon les besoins
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
        // Vérifier si c'est une erreur de timeout (méthode compatible avec TypeScript)
        if (error instanceof HttpErrorResponse && error.message && error.message.includes('timeout')) {
          console.warn(`La requête vers ${request.url} a expiré.`);
        }
        
        // Gérer les erreurs de connexion
        if (error.error instanceof Error) {
          console.error('Erreur de connexion:', error.error.message);
        }
        
        // Gérer les erreurs de serveur
        if (error.status >= 500) {
          console.error('Erreur serveur:', error.message);
        }
        
        return throwError(() => error);
      }),
      finalize(() => {
        this.activeRequests--;
        // Libérer les ressources si c'est la dernière requête active
        if (this.activeRequests === 0) {
          // Ici, on pourrait libérer des ressources si nécessaire
        }
      })
    );
  }
}