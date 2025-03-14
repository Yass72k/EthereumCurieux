import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CryptoService, Crypto, CryptoHistoryPoint } from '../../services/crypto.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-crypto-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-custom py-5">
      <div class="container px-4 px-lg-5 my-5">
        <div class="text-center text-white header-content">
          <h1 class="display-4 fw-bolder header-title">Historique des Cryptos</h1>
          <p class="lead fw-normal text-white-50 mb-0">
            Suivez l'évolution des prix en temps réel avec CoinCap API
          </p>
        </div>
      </div>
    </header>

    <div class="container" *ngIf="crypto">
      <h2 id="crypto-name">{{ crypto.name }} ({{ crypto.symbol }})</h2>
      <p id="crypto-price">💰 Prix actuel : {{ formatPrice(crypto.priceUsd) }}</p>
      
      <!-- Informations de marché -->
      <div class="market-info">
        <div class="market-stat">
          <div class="market-stat-label">
            <i class="fas fa-chart-line me-1"></i> Capitalisation
          </div>
          <div id="market-cap" class="market-stat-value">
            {{ formatMarketCap(crypto.marketCapUsd) }}
          </div>
        </div>
        <div class="market-stat">
          <div class="market-stat-label">
            <i class="fas fa-exchange-alt me-1"></i> Volume (24h)
          </div>
          <div id="volume" class="market-stat-value">
            {{ formatMarketCap(crypto.volumeUsd24Hr) }}
          </div>
        </div>
        <div class="market-stat">
          <div class="market-stat-label">
            <i class="fas fa-percentage me-1"></i> Variation (24h)
          </div>
          <div 
            id="percent-change" 
            class="market-stat-value" 
            [ngClass]="getPriceChangeClass(crypto.changePercent24Hr)"
          >
            <i [ngClass]="getPriceChangeIcon(crypto.changePercent24Hr)"></i>
            {{ formatPriceChange(crypto.changePercent24Hr) }}
          </div>
        </div>
        <div class="market-stat">
          <div class="market-stat-label">
            <i class="fas fa-sort-amount-up me-1"></i> Rang
          </div>
          <div id="rank" class="market-stat-value">
            #{{ crypto.rank }}
          </div>
        </div>
      </div>
      
      <!-- Boutons pour choisir la période -->
      <div class="btn-group" role="group">
        <button 
          *ngFor="let period of periods" 
          class="btn" 
          [ngClass]="{'active': selectedPeriod === period.interval}"
          (click)="fetchCryptoHistory(period.interval)"
        >
          {{ period.label }}
        </button>
      </div>

      <div class="chart-container">
        <canvas #cryptoChart></canvas>
      </div>
    </div>

    <div *ngIf="loading" class="loading-spinner">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <p>Chargement des données...</p>
    </div>

    <div *ngIf="error" class="alert alert-danger">
      {{ error }}
    </div>
  `,
  styleUrls: ['../../styles.css']
})
export class CryptoDetailComponent implements OnInit, OnDestroy {
  @ViewChild('cryptoChart', { static: false }) cryptoChartRef!: ElementRef;

  cryptoId: string = '';
  crypto: Crypto | null = null;
  loading = true;
  error: string | null = null;
  chart: Chart | null = null;
  selectedPeriod = 'h1';

  periods = [
    { label: '1 Jour', interval: 'm1' },
    { label: '1 Semaine', interval: 'm15' },
    { label: '1 Mois', interval: 'h1' },
    { label: '6 Mois', interval: 'h6' },
    { label: '1 An', interval: 'h12' }
  ];

  constructor(
    private route: ActivatedRoute, 
    private cryptoService: CryptoService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.cryptoId = params.get('id') || 'bitcoin';
      this.loadCryptoDetails();
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadCryptoDetails() {
    this.loading = true;
    this.cryptoService.getCryptoById(this.cryptoId).subscribe({
      next: (crypto) => {
        this.crypto = crypto;
        this.fetchCryptoHistory(this.selectedPeriod);
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des détails de la cryptomonnaie';
        this.loading = false;
        console.error(err);
      }
    });
  }

  fetchCryptoHistory(interval: string) {
    if (!this.crypto) return;

    this.selectedPeriod = interval;
    this.loading = true;

    this.cryptoService.getCryptoHistory(this.cryptoId, interval).subscribe({
      next: (historyPoints) => {
        this.updateChart(historyPoints, interval);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de l\'historique';
        this.loading = false;
        console.error(err);
      }
    });
  }

  updateChart(historyPoints: CryptoHistoryPoint[], interval: string) {
    // Détruire le graphique précédent s'il existe
    if (this.chart) {
      this.chart.destroy();
    }

    // Préparer les données pour le graphique
    const prices = historyPoints.map(point => parseFloat(point.priceUsd));
    const labels = historyPoints.map(point => {
      const date = new Date(point.time);
      
      // Formater la date en fonction de l'intervalle
      if (interval === 'm1' || interval === 'm15') {
        // Pour 1 jour ou 1 semaine, afficher l'heure
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        // Pour des périodes plus longues, afficher la date
        return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
      }
    });

    // Créer le nouveau graphique
    this.chart = new Chart(this.cryptoChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Prix en USD',
          data: prices,
          borderColor: '#6BDCF9',
          backgroundColor: 'rgba(107, 220, 249, 0.2)',
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: '#4B7DAE',
          pointBorderColor: '#fff',
          pointRadius: 0.5,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { 
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: { 
              color: '#ffffff',
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: { 
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: { 
              color: '#ffffff',
              callback: function(value) {
                return '$' + (value as number).toLocaleString();
              }
            }
          }
        },
        plugins: {
          legend: { 
            labels: { 
              color: '#ffffff',
              font: {
                family: 'Poppins',
                size: 14
              }
            } 
          },
          tooltip: {
            backgroundColor: 'rgba(42, 29, 98, 0.9)',
            titleFont: {
              family: 'Poppins',
              size: 14
            },
            bodyFont: {
              family: 'Poppins',
              size: 13
            },
            callbacks: {
              label: function(context) {
                return 'Prix: $' + (context.parsed.y as number).toLocaleString();
              }
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        elements: {
          line: {
            capBezierPoints: true
          }
        }
      }
    });
  }

  // Méthodes utilitaires de formatage

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