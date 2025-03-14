import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CryptoService, Crypto, CryptoHistoryPoint } from '../../services/crypto.service';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

Chart.register(...registerables);

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
}

@Component({
  selector: 'app-crypto-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './crypto-detail.component.html',
  styleUrls: ['./crypto-detail.component.css']
})
export class CryptoDetailComponent implements OnInit, OnDestroy {
  @ViewChild('cryptoChart', { static: false }) cryptoChartRef!: ElementRef;

  cryptoId: string = '';
  cryptoData: Crypto | null = null;
  loading = true;
  error: string | null = null;
  chart: Chart | null = null;
  interval = 'h1';
  
  // Variables pour la gestion des actualités
  news: NewsArticle[] = [];
  loadingNews = true;
  newsError: string | null = null;
  
  // Pour la mise à jour périodique
  updateSubscription?: Subscription;
  updateInterval = 600000; // 10 minutes en millisecondes

  periods = [
    { label: '1 Jour', interval: 'm1' },
    { label: '1 Semaine', interval: 'm15' },
    { label: '1 Mois', interval: 'h1' },
    { label: '6 Mois', interval: 'h6' },
    { label: '1 An', interval: 'h12' }
  ];

  constructor(
    private route: ActivatedRoute, 
    private cryptoService: CryptoService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.cryptoId = params.get('id') || 'bitcoin';
      this.loadCryptoDetails();
      
      // Configuration de la mise à jour périodique
      this.setupPeriodicUpdates();
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    
    // Désabonnement pour éviter les fuites de mémoire
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  setupPeriodicUpdates() {
    this.updateSubscription = interval(this.updateInterval)
      .pipe(
        switchMap(() => this.cryptoService.getCryptoById(this.cryptoId))
      )
      .subscribe({
        next: (crypto) => {
          this.cryptoData = crypto;
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour périodique:', err);
        }
      });
  }

  loadCryptoDetails() {
    this.loading = true;
    this.cryptoService.getCryptoById(this.cryptoId).subscribe({
      next: (crypto) => {
        this.cryptoData = crypto;
        this.fetchCryptoHistory(this.interval);
        this.fetchCryptoNews(crypto.name, crypto.symbol);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des détails de la cryptomonnaie';
        this.loading = false;
        console.error(err);
      }
    });
  }

  fetchCryptoHistory(interval: string) {
    if (!this.cryptoData) {
      console.warn('Impossible de charger l\'historique : pas de données crypto disponibles');
      return;
    }

    this.interval = interval;
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

  fetchCryptoNews(name: string, symbol: string) {
    this.loadingNews = true;
    this.newsError = null;
    
    const apiKey = "d17cbf8a4455d94299d04b2dd49e19f7"; // Idéalement, cela devrait être stocké de manière sécurisée
    const searchQuery = `${name} OR ${symbol} cryptocurrency`;
    
    this.http.get<any>(`https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=fr&country=fr&max=6&apikey=${apiKey}`)
      .subscribe({
        next: (data) => {
          if (data.articles && data.articles.length > 0) {
            this.news = data.articles;
          } else {
            this.news = [];
          }
          this.loadingNews = false;
        },
        error: (err) => {
          this.newsError = err.message || 'Erreur inconnue';
          this.loadingNews = false;
          console.error('Erreur lors de la récupération des actualités:', err);
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
  parseFloat(value: string | undefined | null): number {
    if (!value) return 0;
    return parseFloat(value);
  }

  formatPrice(price: string | undefined | null): string {
    if (!price) return '$0.00';
    
    const numPrice = parseFloat(price);
    if (numPrice < 0.01) {
      return `${numPrice.toFixed(6)}`;
    } else if (numPrice < 1) {
      return `${numPrice.toFixed(4)}`;
    } else {
      return `${numPrice.toFixed(2)}`;
    }
  }

  formatMarketCap(marketCap: string | undefined | null): string {
    if (!marketCap) return '$0.00';
    
    const num = parseFloat(marketCap);
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)} Mrd`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)} M`;
    } else {
      return `${num.toFixed(2)}`;
    }
  }

  getPriceChangeClass(change: string | undefined | null): string {
    if (!change) return 'stat-up';
    return parseFloat(change) >= 0 ? 'stat-up' : 'stat-down';
  }

  getPriceChangeIcon(change: string | undefined | null): string {
    if (!change) return 'fas fa-caret-up';
    return parseFloat(change) >= 0 
      ? 'fas fa-caret-up' 
      : 'fas fa-caret-down';
  }

  formatPriceChange(change: string | undefined | null): string {
    if (!change) return '0.00%';
    return `${Math.abs(parseFloat(change)).toFixed(2)}%`;
  }
  
  // Gestionnaire d'erreur pour les images
  handleImageError(event: any) {
    event.target.src = 'assets/news-default.jpg';
  }
}