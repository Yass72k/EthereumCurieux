import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Crypto {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  priceUsd: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  changePercent24Hr: string;
}

export interface CryptoHistoryPoint {
  priceUsd: string;
  time: number;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private baseUrl = 'https://api.coincap.io/v2';

  constructor(private http: HttpClient) { }

  getTopCryptos(limit: number = 100): Observable<Crypto[]> {
    return this.http.get<{data: Crypto[]}>(`${this.baseUrl}/assets?limit=${limit}`)
      .pipe(
        map(response => response.data)
      );
  }

  getCryptoById(id: string): Observable<Crypto> {
    return this.http.get<{data: Crypto}>(`${this.baseUrl}/assets/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  getCryptoHistory(id: string, interval: string): Observable<CryptoHistoryPoint[]> {
    return this.http.get<{data: CryptoHistoryPoint[]}>(`${this.baseUrl}/assets/${id}/history?interval=${interval}`)
      .pipe(
        map(response => response.data)
      );
  }

  getCryptoImageUrl(symbol: string): string {
    return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
  }
}