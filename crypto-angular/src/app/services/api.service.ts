import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, timeout, retry } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private isBrowser: boolean;
  
  // Configuration par défaut
  private defaultTimeout = 10000; // 10 secondes
  private maxRetries = 2;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Méthode générique pour les appels GET
   */
  get<T>(url: string, options: {
    timeoutMs?: number,
    retries?: number,
    fallbackData?: T
  } = {}): Observable<T> {
    // Si nous ne sommes pas dans un navigateur et qu'il y a des données de fallback, renvoyer ces données
    if (!this.isBrowser && options.fallbackData) {
      return of(options.fallbackData);
    }

    const timeoutMs = options.timeoutMs || this.defaultTimeout;
    const retries = options.retries || this.maxRetries;

    return this.http.get<T>(url).pipe(
      timeout(timeoutMs),
      retry(retries),
      catchError(error => {
        console.error(`Erreur lors de l'appel API à ${url}:`, error);
        
        // Si des données de fallback sont fournies, les utiliser en cas d'erreur
        if (options.fallbackData !== undefined) {
          return of(options.fallbackData);
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Méthode pour les appels API aux cryptos
   */
  getCryptoData(limit: number = 100): Observable<any> {
    return this.get(`https://api.coincap.io/v2/assets?limit=${limit}`, {
      timeoutMs: 15000,
      retries: 3,
      fallbackData: { data: [] }
    });
  }

  /**
   * Méthode pour obtenir les détails d'une crypto
   */
  getCryptoDetails(id: string): Observable<any> {
    return this.get(`https://api.coincap.io/v2/assets/${id}`, {
      timeoutMs: 15000,
      retries: 3,
      fallbackData: { data: {} }
    });
  }

  /**
   * Méthode pour obtenir l'historique des prix d'une crypto
   */
  getCryptoHistory(id: string, interval: string = 'h1'): Observable<any> {
    return this.get(`https://api.coincap.io/v2/assets/${id}/history?interval=${interval}`, {
      timeoutMs: 15000,
      retries: 3,
      fallbackData: { data: [] }
    });
  }

  /**
   * Méthode pour obtenir les news crypto
   */
  getCryptoNews(query: string = 'cryptocurrency OR bitcoin OR ethereum', maxResults: number = 5): Observable<any> {
    const apiKey = "d17cbf8a4455d94299d04b2dd49e19f7"; // À déplacer dans un environnement sécurisé
    
    return this.get(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=fr&country=fr&max=${maxResults}&apikey=${apiKey}`, {
      timeoutMs: 15000,
      retries: 2,
      fallbackData: { 
        articles: []
      }
    });
  }
}