import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CryptoService, Crypto } from '../../services/crypto.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid px-4 px-lg-5">
      <header class="bg-custom py-5">
        <div class="container px-4 px-lg-5 my-5">
          <div class="text-center text-white header-content">
            <h1 class="display-4 fw-bolder header-title">Ethereum Curieux</h1>
            <p class="lead fw-normal text-white-50 mb-0 header-subtitle">
              Le site des cryptos préféré de ton site des cryptos préféré
            </p>
          </div>
        </div>
      </header>

      <section class="py-5">
        <div class="container-fluid px-4 px-lg-5">
          <h2 class="section-title mb-4 text-center">Top 100 Cryptomonnaies</h2>
          
          <div *ngIf="isLoading" class="loading-spinner">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
            <p>Chargement des données...</p>
          </div>

          <div *ngIf="error" class="alert alert-danger text-center">
            {{ error }}
          </div>

          <div 
            *ngIf="!isLoading && !error" 
            class="crypto-grid row g-4 justify-content-center"
          >
            <div 
              *ngFor="let crypto of cryptos; let i = index" 
              class="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <div class="crypto-card">
                <div *ngIf="i < 3" class="featured-badge">
                  <i class="fas fa-star me-1"></i>En vedette
                </div>
                
                <div class="crypto-rank">{{ i + 1 }}</div>
                
                <div class="crypto-card-content">
                  <img 
                    [src]="getCryptoImage(crypto.symbol)" 
                    [alt]="crypto.name"
                    (error)="handleImageError($event)"
                    class="crypto-logo"
                  />
                  
                  <h5 class="crypto-name">
                    {{ crypto.name }} 
                    <span class="crypto-symbol">{{ crypto.symbol }}</span>
                  </h5>
                  
                  <div class="crypto-price">
                    {{ formatPrice(crypto.priceUsd) }}
                  </div>
                  
                  <div 
                    class="crypto-change" 
                    [ngClass]="getPriceChangeClass(crypto.changePercent24Hr)"
                  >
                    <i [ngClass]="getPriceChangeIcon(crypto.changePercent24Hr)"></i>
                    {{ formatPriceChange(crypto.changePercent24Hr) }}
                  </div>
                  
                  <div class="crypto-stats">
                    <div class="stat">
                      <i class="fas fa-chart-line"></i>
                      {{ formatMarketCap(crypto.marketCapUsd) }}
                    </div>
                    <div class="stat">
                      <i class="fas fa-exchange-alt"></i>
                      {{ formatMarketCap(crypto.volumeUsd24Hr) }}
                    </div>
                  </div>
                  
                  <a 
                    class="btn-details" 
                    [routerLink]="['/crypto', crypto.id]"
                  >
                    Détails <i class="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .crypto-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
    }

    .crypto-card {
      background-color: #252A41;
      border-radius: 15px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .crypto-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    }

    .crypto-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      text-align: center;
    }

    .crypto-logo {
      width: 100px;
      height: 100px;
      object-fit: contain;
      margin-bottom: 15px;
    }

    .crypto-name {
      font-weight: 600;
      margin-bottom: 10px;
    }

    .crypto-symbol {
      color: #a8b2c0;
      font-size: 0.8em;
    }

    .crypto-price {
      font-size: 1.5em;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .crypto-change {
      margin-bottom: 15px;
      font-weight: 600;
    }

    .crypto-stats {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 15px;
      color: #a8b2c0;
    }

    .btn-details {
      background: linear-gradient(135deg, #4B7DAE 0%, #4D80B2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 25px;
      text-decoration: none;
      transition: transform 0.3s ease;
    }

    .btn-details:hover {
      transform: scale(1.05);
    }

    .featured-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      background: linear-gradient(135deg, #4B7DAE 0%, #6BDCF9 100%);
      color: white;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.8em;
      z-index: 10;
    }

    .crypto-rank {
      position: absolute;
      top: 15px;
      left: 15px;
      background: rgba(42, 29, 98, 0.85);
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      z-index: 10;
    }
  `]
})
export class HomeComponent implements OnInit {
  cryptos: Crypto[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private cryptoService: CryptoService) {}

  ngOnInit() {
    this.loadCryptos();
  }

  loadCryptos() {
    this.cryptoService.getTopCryptos().subscribe({
      next: (cryptos) => {
        this.cryptos = cryptos;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des cryptomonnaies';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  getCryptoImage(symbol: string): string {
    return this.cryptoService.getCryptoImageUrl(symbol);
  }

  handleImageError(event: any) {
    event.target.src = 'assets/crypto-default.png';
  }

  formatPrice(price: string): string {
    const numPrice = parseFloat(price);
    if (numPrice < 0.01) {
      return `$${numPrice.toFixed(6)}`;
    } else if (numPrice < 1) {
      return `$${numPrice.toFixed(4)}`;
    } else {
      return `$${numPrice.toFixed(2)}`;
    }
  }

  formatMarketCap(marketCap: string): string {
    const num = parseFloat(marketCap);
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)} Mrd`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)} M`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  }

  getPriceChangeClass(change: string): string {
    return parseFloat(change) >= 0 ? 'price-up' : 'price-down';
  }

  getPriceChangeIcon(change: string): string {
    return parseFloat(change) >= 0 
      ? 'fas fa-caret-up' 
      : 'fas fa-caret-down';
  }

  formatPriceChange(change: string): string {
    return `${Math.abs(parseFloat(change)).toFixed(2)}%`;
  }
}