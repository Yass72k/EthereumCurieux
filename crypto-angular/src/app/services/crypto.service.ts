import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Crypto {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string;
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

interface CryptoResponse {
  data: Crypto[];
  timestamp: number;
}

interface HistoryResponse {
  data: CryptoHistoryPoint[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private apiUrl = 'https://api.coincap.io/v2/assets';

  constructor(private http: HttpClient) { }

  getTopCryptos(limit: number = 100): Observable<Crypto[]> {
    // Cette requête est directement basée sur l'index.html
    return this.http.get<CryptoResponse>(`${this.apiUrl}?limit=${limit}`)
      .pipe(
        map(response => response.data)
      );
  }

  getCryptoById(id: string): Observable<Crypto> {
    return this.http.get<{ data: Crypto }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  getCryptoImageUrl(symbol: string): string {
    // Comme dans la fonction getCryptoImageUrl de index.html
    return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
  }

  getCryptoHistory(id: string, interval: string = 'd1'): Observable<CryptoHistoryPoint[]> {
    return this.http.get<HistoryResponse>(`${this.apiUrl}/${id}/history?interval=${interval}`)
      .pipe(
        map(response => response.data)
      );
  }
}