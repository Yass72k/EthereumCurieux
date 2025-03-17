import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

export interface Crypto {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

export interface CryptoHistoryPoint {
  priceUsd: string;
  time: number;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  
  constructor(private apiService: ApiService) {}

  // Récupérer toutes les cryptos
  getAllCryptos(limit: number = 100): Observable<Crypto[]> {
    return this.apiService.getCryptoData(limit).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Erreur lors de la récupération des cryptomonnaies:', error);
        return of([]);
      })
    );
  }

  // Récupérer une crypto par ID
  getCryptoById(id: string): Observable<Crypto> {
    return this.apiService.getCryptoDetails(id).pipe(
      map(response => response.data || {}),
      catchError(error => {
        console.error(`Erreur lors de la récupération de la crypto ${id}:`, error);
        // Retourner un objet crypto vide en cas d'erreur
        return of({
          id: id,
          rank: '0',
          symbol: 'ERROR',
          name: 'Erreur de chargement',
          supply: '0',
          maxSupply: null,
          marketCapUsd: '0',
          volumeUsd24Hr: '0',
          priceUsd: '0',
          changePercent24Hr: '0',
          vwap24Hr: '0'
        });
      })
    );
  }

  // Récupérer l'historique des prix d'une crypto
  getCryptoHistory(id: string, interval: string = 'h1'): Observable<CryptoHistoryPoint[]> {
    return this.apiService.getCryptoHistory(id, interval).pipe(
      map(response => {
        if (!response.data || !Array.isArray(response.data)) {
          return [];
        }
        
        return response.data.map((point: any) => ({
          priceUsd: point.priceUsd,
          time: point.time,
          date: new Date(point.time).toISOString()
        }));
      }),
      catchError(error => {
        console.error(`Erreur lors de la récupération de l'historique pour ${id}:`, error);
        return of([]);
      })
    );
  }

  // Récupérer les news des cryptos
  getCryptoNews(query: string = 'cryptocurrency', maxResults: number = 5): Observable<any[]> {
    return this.apiService.getCryptoNews(query, maxResults).pipe(
      map(response => response.articles || []),
      catchError(error => {
        console.error('Erreur lors de la récupération des actualités:', error);
        return of([]);
      })
    );
  }
}