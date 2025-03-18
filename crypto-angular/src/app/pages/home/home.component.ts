import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CryptoService, Crypto } from '../../services/crypto.service';

// Interface pour Window avec Bootstrap
interface CustomWindow extends Window {
  bootstrap?: any;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  private isBrowser: boolean;
  loading = true;
  newsLoading = true;
  
  cryptoList: Crypto[] = [];
  cryptoNews: any[] = [];
  newsCarousel: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cryptoService: CryptoService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Charger les données uniquement côté navigateur
    if (this.isBrowser) {
      this.loadCryptoData();
      this.loadCryptoNews();
    }
  }

  ngAfterViewInit(): void {
    // Initialiser le carrousel après le rendu des composants
    if (this.isBrowser) {
      setTimeout(() => {
        const customWindow = window as unknown as CustomWindow;
        if (customWindow.bootstrap) {
          const carouselElement = document.getElementById('newsCarousel');
          if (carouselElement) {
            this.newsCarousel = new customWindow.bootstrap.Carousel(carouselElement, {
              interval: 7000,  // Plus de temps pour lire
              wrap: true,
              pause: 'hover'  // Pause au survol
            });
            
            // Ajouter l'écouteur d'événements pour arrêter le défilement au survol
            carouselElement.addEventListener('mouseenter', () => {
              this.newsCarousel.pause();
            });
            
            carouselElement.addEventListener('mouseleave', () => {
              this.newsCarousel.cycle();
            });
          }
        }
      }, 1000);
    }
  }

  loadCryptoData(): void {
    this.loading = true;
    this.cryptoService.getAllCryptos(100).subscribe({
      next: (data) => {
        this.cryptoList = data;
        this.loading = false;
        this.updateUI();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cryptos:', error);
        this.loading = false;
        this.showLoadingError();
      }
    });
  }

  loadCryptoNews(): void {
    this.newsLoading = true;
    this.cryptoService.getCryptoNews('cryptocurrency OR bitcoin OR ethereum', 5).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.cryptoNews = data;
          this.newsLoading = false;
          this.updateNewsCarousel();
        } else {
          this.showNewsError('Aucune actualité disponible');
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des actualités:', error);
        this.showNewsError('Erreur de chargement');
      }
    });
  }

  updateNewsCarousel(): void {
    if (!this.isBrowser) return;
    
    const carouselInner = document.getElementById('carousel-inner');
    const carouselIndicators = document.getElementById('carousel-indicators');
    
    if (carouselInner && carouselIndicators) {
      // Vider le carrousel
      carouselInner.innerHTML = '';
      carouselIndicators.innerHTML = '';
      
      // Ajouter chaque article au carrousel
      this.cryptoNews.forEach((article, index) => {
        // Créer l'indicateur
        const indicator = document.createElement('button');
        indicator.setAttribute('type', 'button');
        indicator.setAttribute('data-bs-target', '#newsCarousel');
        indicator.setAttribute('data-bs-slide-to', index.toString());
        indicator.setAttribute('aria-label', `Article ${index + 1}`);
        if (index === 0) {
          indicator.classList.add('active');
          indicator.setAttribute('aria-current', 'true');
        }
        carouselIndicators.appendChild(indicator);
        
        // Créer l'élément du carrousel
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) carouselItem.classList.add('active');
        
        // Formater la date de manière plus lisible
        const pubDate = new Date(article.publishedAt);
        const now = new Date();
        let formattedDate;
        
        // Afficher "Aujourd'hui" ou "Hier" pour une meilleure lisibilité
        const isToday = pubDate.toDateString() === now.toDateString();
        const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === pubDate.toDateString();
        
        if (isToday) {
          formattedDate = `Aujourd'hui à ${pubDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (isYesterday) {
          formattedDate = `Hier à ${pubDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          formattedDate = pubDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        
        // Améliorer la description pour une meilleure lisibilité
        let description = article.description || 'Cliquez pour en savoir plus';
        if (description.length > 180) {
          description = description.substring(0, 177) + '...';
        }
        
        // Ajouter le contenu en simplifiant la structure
        carouselItem.innerHTML = `
          <div class="news-carousel-item" style="background-image: url('${article.image || 'assets/news-default.jpg'}')">
            <div class="news-overlay">
              <div class="news-carousel-caption" id="caption-${index}">
                <h5>${article.title}</h5>
                <p>${description}</p>
                <p class="news-date"><i class="far fa-calendar-alt"></i> Publié le ${formattedDate}</p>
                <a href="${article.url}" target="_blank" class="btn btn-read">
                  Lire l'article <i class="fas fa-external-link-alt ms-2"></i>
                </a>
              </div>
            </div>
          </div>
        `;
        carouselInner.appendChild(carouselItem);
        
        // Adapter la couleur du texte en fonction de l'image
        if (article.image) {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = article.image;
          
          img.onload = () => {
            try {
              // Créer un canvas pour extraire la couleur dominante
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              if (!context) {
                console.error('Impossible de récupérer le contexte 2D du canvas');
                return;
              }
              const width = 50;  // Taille réduite pour la performance
              const height = 50;
              
              canvas.width = width;
              canvas.height = height;
              
              context.drawImage(img, 0, 0, width, height);
              
              // Extraire les données de pixels
              const imgData = context.getImageData(0, 0, width, height);
              const pixelData = imgData.data;
              
              // Calculer la luminosité moyenne
              let totalR = 0, totalG = 0, totalB = 0;
              for (let i = 0; i < pixelData.length; i += 4) {
                totalR += pixelData[i];
                totalG += pixelData[i+1];
                totalB += pixelData[i+2];
              }
              
              const pixelCount = pixelData.length / 4;
              const avgR = totalR / pixelCount;
              const avgG = totalG / pixelCount;
              const avgB = totalB / pixelCount;
              
              // Calculer la luminosité
              const luminance = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;
              
              // Appliquer la couleur de texte
              const caption = document.getElementById(`caption-${index}`);
              if (caption) {
                caption.style.color = luminance < 128 ? 'white' : 'black';
              }
            } catch (error) {
              console.error('Erreur lors de l\'analyse des couleurs:', error);
            }
          };
          
          img.onerror = () => {
            console.error('Erreur lors du chargement de l\'image pour analyse des couleurs');
            // En cas d'erreur, garder la couleur de texte par défaut
          };
        }
      });
      
      // Réinitialiser le carrousel
      const customWindow = window as unknown as CustomWindow;
      if (customWindow.bootstrap && carouselInner.children.length > 0) {
        const carouselElement = document.getElementById('newsCarousel');
        if (carouselElement) {
          this.newsCarousel = new customWindow.bootstrap.Carousel(carouselElement, {
            interval: 7000,
            wrap: true,
            pause: 'hover'
          });
        }
      }
    }
  }

  showNewsError(message: string): void {
    if (!this.isBrowser) return;
    
    const carouselInner = document.getElementById('carousel-inner');
    if (carouselInner) {
      carouselInner.innerHTML = `
        <div class="carousel-item active">
          <div class="news-carousel-item" style="background-image: linear-gradient(135deg, #252A41 0%, #1A1A2E 100%)">
            <div class="news-overlay" style="background: rgba(42, 29, 98, 0.3)">
              <div class="news-carousel-caption text-center">
                <i class="fas fa-exclamation-circle fa-3x mb-4" style="color: var(--light-blue)"></i>
                <h5>${message}</h5>
                <p>Nous n'avons pas pu récupérer les dernières actualités sur les cryptomonnaies.</p>
                <button class="btn btn-read mt-4" onclick="window.location.reload()">
                  <i class="fas fa-sync-alt me-2"></i> Actualiser la page
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    this.newsLoading = false;
  }
  
  // Mettre à jour l'interface utilisateur avec les données de crypto
  updateUI(): void {
    if (!this.isBrowser) return;

    // Cacher le spinner de chargement
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    // Conteneur pour les cartes crypto
    const container = document.getElementById('crypto-container');
    if (container && this.cryptoList.length > 0) {
      container.innerHTML = '';
      
      // Créer et ajouter chaque carte de crypto
      this.cryptoList.forEach((crypto, index) => {
        container.innerHTML += this.createCryptoCard(crypto, index);
      });
    }

    // Mettre à jour les prix périodiquement
    setInterval(() => this.updatePrices(), 60000); // Mise à jour toutes les minutes
  }

  // Mettre à jour les prix des cryptos
  updatePrices(): void {
    if (!this.isBrowser) return;
    
    this.cryptoService.getAllCryptos(100).subscribe({
      next: (data) => {
        data.forEach((crypto) => {
          const priceElement = document.getElementById(`${crypto.id}-price`);
          if (priceElement) {
            priceElement.textContent = this.formatPrice(crypto.priceUsd);
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour des prix:', error);
      }
    });
  }

  // Afficher une erreur lors du chargement des cryptos
  showLoadingError(): void {
    if (!this.isBrowser) return;
    
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.innerHTML = `
        <div class="alert alert-danger" style="background-color: #3A2F62; color: #fff; border-color: #4B7DAE;">
          <i class="fas fa-exclamation-circle me-2"></i>
          Erreur lors du chargement des données. Veuillez réessayer.
        </div>
      `;
    }
  }

  // Fonction pour créer une carte de crypto
  createCryptoCard(crypto: Crypto, index: number): string {
    const featured = index < 3 ? '<div class="featured-badge"><i class="fas fa-star me-1"></i>En vedette</div>' : '';
    const stars = 5 - Math.floor(index / 20); // Diminuer les étoiles en fonction du rang
    const starElements: string[] = [];
    
    for (let i = 0; i < 5; i++) {
        if (i < stars) {
            starElements.push('<div class="bi-star-fill"></div>');
        } else {
            starElements.push('<div class="bi-star"></div>');
        }
    }

    const priceChangeClass = parseFloat(crypto.changePercent24Hr) >= 0 ? 'price-up' : 'price-down';
    const priceChangeSymbol = parseFloat(crypto.changePercent24Hr) >= 0 ? '<i class="fas fa-caret-up"></i>' : '<i class="fas fa-caret-down"></i>';
    const priceChange = `<span class="${priceChangeClass}">${priceChangeSymbol} ${Math.abs(parseFloat(crypto.changePercent24Hr)).toFixed(2)}%</span>`;

    const marketCap = this.formatMarketCap(crypto.marketCapUsd);
    const volume = this.formatMarketCap(crypto.volumeUsd24Hr);

    return `
    <div class="col mb-5">
        <div class="card h-100">
            ${featured}
            <div class="crypto-rank">${index + 1}</div>
            <img class="card-img-top" src="${this.getCryptoImageUrl(crypto.symbol)}" alt="${crypto.name}" onerror="this.src='assets/crypto-default.png';" />
            <div class="card-body p-4">
                <div class="text-center">
                    <h5 class="fw-bolder mb-3">${crypto.name} <span style="color: #a8b2c0;">${crypto.symbol}</span></h5>
                    <div class="d-flex justify-content-center small text-warning mb-3">
                        ${starElements.join('')}
                    </div>
                    <h3 id="${crypto.id}-price" class="mb-2">${this.formatPrice(crypto.priceUsd)}</h3>
                    <p class="mb-3">${priceChange}</p>
                    <div class="crypto-stats">
                        <span><i class="fas fa-chart-line"></i> ${marketCap}</span>
                        <span><i class="fas fa-exchange-alt"></i> ${volume}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                <div class="text-center"><a class="btn btn-details mt-auto" href="/crypto/${crypto.id}">Détails <i class="fas fa-arrow-right"></i></a></div>
            </div>
        </div>
    </div>`;
  }

  // Fonction pour obtenir l'URL de l'image de la crypto
  getCryptoImageUrl(id: string): string {
    return `https://assets.coincap.io/assets/icons/${id.toLowerCase()}@2x.png`;
  }

  // Fonction pour formater le prix avec deux décimales
  formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice < 0.01) {
      return '$' + numPrice.toFixed(6);
    } else if (numPrice < 1) {
      return '$' + numPrice.toFixed(4);
    } else {
      return '$' + numPrice.toFixed(2);
    }
  }

  // Fonction pour formater les grands nombres
  formatMarketCap(marketCap: string | number): string {
    const num = typeof marketCap === 'string' ? parseFloat(marketCap) : marketCap;
    if (num >= 1e9) {
      return '$' + (num / 1e9).toFixed(2) + ' Mrd';
    } else if (num >= 1e6) {
      return '$' + (num / 1e6).toFixed(2) + ' M';
    } else {
      return '$' + num.toFixed(2);
    }
  }
}