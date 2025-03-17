import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  constructor() {}

  ngOnInit(): void {
    // Rien à initialiser ici car nous utiliserons directement le script depuis index.html
  }

  ngAfterViewInit(): void {
    // Initialiser les fonctions de index.html
    this.initializeIndexScripts();
  }

  initializeIndexScripts(): void {
    // Fonction pour formater le prix avec deux décimales
    function formatPrice(price: string | number): string {
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
    function formatMarketCap(marketCap: string | number): string {
      const num = typeof marketCap === 'string' ? parseFloat(marketCap) : marketCap;
      if (num >= 1e9) {
          return '$' + (num / 1e9).toFixed(2) + ' Mrd';
      } else if (num >= 1e6) {
          return '$' + (num / 1e6).toFixed(2) + ' M';
      } else {
          return '$' + num.toFixed(2);
      }
    }

    // Fonction pour obtenir l'URL de l'image de la crypto
    function getCryptoImageUrl(id: string): string {
      return `https://assets.coincap.io/assets/icons/${id.toLowerCase()}@2x.png`;
    }

    // Fonction pour créer une carte de crypto
    function createCryptoCard(crypto: any, index: number): string {
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

      const marketCap = formatMarketCap(crypto.marketCapUsd);
      const volume = formatMarketCap(crypto.volumeUsd24Hr);

      return `
      <div class="col mb-5">
          <div class="card h-100">
              ${featured}
              <div class="crypto-rank">${index + 1}</div>
              <img class="card-img-top" src="${getCryptoImageUrl(crypto.symbol)}" alt="${crypto.name}" onerror="this.src='assets/crypto-default.png';" />
              <div class="card-body p-4">
                  <div class="text-center">
                      <h5 class="fw-bolder mb-3">${crypto.name} <span style="color: #a8b2c0;">${crypto.symbol}</span></h5>
                      <div class="d-flex justify-content-center small text-warning mb-3">
                          ${starElements.join('')}
                      </div>
                      <h3 id="${crypto.id}-price" class="mb-2">${formatPrice(crypto.priceUsd)}</h3>
                      <p class="mb-3">${priceChange}</p>
                      <div class="crypto-stats">
                          <span><i class="fas fa-chart-line"></i> ${marketCap}</span>
                          <span><i class="fas fa-exchange-alt"></i> ${volume}</span>
                      </div>
                  </div>
              </div>
              <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                  <div class="text-center"><a class="btn btn-details mt-auto" href="../crypto-detail/${crypto.id}">Détails <i class="fas fa-arrow-right"></i></a></div>
              </div>
          </div>
      </div>`;
    }

    // Fonction pour charger les 100 premières cryptos
    async function loadTop100Cryptos(): Promise<void> {
      try {
          const response = await fetch('https://api.coincap.io/v2/assets?limit=100');
          const data = await response.json();
          
          // Cacher le spinner de chargement
          const loadingElement = document.getElementById('loading');
          if (loadingElement) {
              loadingElement.style.display = 'none';
          }
          
          // Conteneur pour les cartes crypto
          const container = document.getElementById('crypto-container');
          if (container) {
              container.innerHTML = '';
              
              // Créer et ajouter chaque carte de crypto
              data.data.forEach((crypto: any, index: number) => {
                  container.innerHTML += createCryptoCard(crypto, index);
              });
          }

          // Mettre à jour les prix périodiquement
          setInterval(updatePrices, 60000); // Mise à jour toutes les minutes
      } catch (error) {
          console.error('Erreur lors du chargement des cryptos:', error);
          const loadingElement = document.getElementById('loading');
          if (loadingElement) {
              loadingElement.innerHTML = '<div class="alert alert-danger" style="background-color: #3A2F62; color: #fff; border-color: #4B7DAE;">Erreur lors du chargement des données. Veuillez réessayer.</div>';
          }
      }
    }

    // Fonction pour mettre à jour les prix
    async function updatePrices(): Promise<void> {
      try {
          const response = await fetch('https://api.coincap.io/v2/assets?limit=100');
          const data = await response.json();
          
          data.data.forEach((crypto: any) => {
              const priceElement = document.getElementById(`${crypto.id}-price`);
              if (priceElement) {
                  priceElement.textContent = formatPrice(crypto.priceUsd);
              }
          });
      } catch (error) {
          console.error('Erreur lors de la mise à jour des prix:', error);
      }
    }

    // Fonction pour charger les actualités crypto générales
    async function loadCryptoNews(): Promise<void> {
      try {
          // Utilisation de Gnews API au lieu de NewsAPI
          const apiKey = "d17cbf8a4455d94299d04b2dd49e19f7"; // Remplacez par votre clé Gnews
          const response = await fetch(`https://gnews.io/api/v4/search?q=cryptocurrency%20OR%20bitcoin%20OR%20ethereum&lang=fr&country=fr&max=5&apikey=${apiKey}`);
          const data = await response.json();
          
          // Vérifier si des articles ont été trouvés
          if (data.articles && data.articles.length > 0) {
              const carouselInner = document.getElementById('carousel-inner');
              const carouselIndicators = document.getElementById('carousel-indicators');
              
              if (carouselInner && carouselIndicators) {
                  // Vider le carrousel
                  carouselInner.innerHTML = '';
                  carouselIndicators.innerHTML = '';
                  
                  // Ajouter chaque article au carrousel
                  data.articles.forEach((article: any, index: number) => {
                      // Créer l'indicateur
                      const indicator = document.createElement('button');
                      indicator.setAttribute('type', 'button');
                      indicator.setAttribute('data-bs-target', '#newsCarousel');
                      indicator.setAttribute('data-bs-slide-to', index.toString());
                      if (index === 0) indicator.classList.add('active');
                      carouselIndicators.appendChild(indicator);
                      
                      // Créer l'élément du carrousel
                      const carouselItem = document.createElement('div');
                      carouselItem.classList.add('carousel-item');
                      if (index === 0) carouselItem.classList.add('active');
                      
                      // Formater la date
                      const pubDate = new Date(article.publishedAt);
                      const formattedDate = pubDate.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                      });
                      
                      // Ajouter le contenu
                      carouselItem.innerHTML = `
                          <div class="news-carousel-item" style="background-image: url('${article.image || 'assets/news-default.jpg'}')">
                              <div class="news-overlay">
                                  <div class="news-carousel-caption">
                                      <h5>${article.title}</h5>
                                      <p>${article.description || 'Cliquez pour en savoir plus'}</p>
                                      <p class="news-date"><i class="far fa-calendar-alt"></i> Publié le ${formattedDate}</p>
                                      <a href="${article.url}" target="_blank" class="btn btn-read">Lire l'article <i class="fas fa-external-link-alt ms-1"></i></a>
                                  </div>
                              </div>
                          </div>
                      `;
                      carouselInner.appendChild(carouselItem);
                  });
              }
          } else {
              const carouselInner = document.getElementById('carousel-inner');
              if (carouselInner) {
                  carouselInner.innerHTML = `
                      <div class="carousel-item active">
                          <div class="news-carousel-item" style="background-image: url('assets/news-default.jpg')">
                              <div class="news-overlay">
                                  <div class="news-carousel-caption">
                                      <h5>Aucune actualité disponible</h5>
                                      <p>Nous n'avons pas pu récupérer les dernières actualités sur les cryptomonnaies.</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  `;
              }
          }
      } catch (error) {
          console.error('Erreur lors du chargement des actualités:', error);
          const carouselInner = document.getElementById('carousel-inner');
          if (carouselInner) {
              carouselInner.innerHTML = `
                  <div class="carousel-item active">
                      <div class="news-carousel-item" style="background-image: url('assets/news-default.jpg')">
                          <div class="news-overlay">
                              <div class="news-carousel-caption">
                                  <h5>Erreur de chargement</h5>
                                  <p>Une erreur s'est produite lors du chargement des actualités. Veuillez réessayer ultérieurement.</p>
                              </div>
                          </div>
                      </div>
                  </div>
              `;
          }
      }
    }

    // Charger les cryptos et les actualités
    loadTop100Cryptos();
    loadCryptoNews();

    // Initialiser le carousel Bootstrap
    setTimeout(() => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.bootstrap) {
        // @ts-ignore
        const carousel = new window.bootstrap.Carousel(document.getElementById('newsCarousel'), {
          interval: 5000,
          wrap: true
        });
      }
    }, 500);
  }
}