import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header class="bg-custom py-5">
      <div class="container px-4 px-lg-5 my-5">
        <div class="text-center text-white header-content">
          <h1 class="display-4 fw-bolder header-title main-title">
            Ethereum Curieux
          </h1>
          <p class="lead fw-normal text-white-50 mb-0 header-subtitle">
            Le site des cryptos préféré de ton site des cryptos préféré
          </p>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .main-title {
      display: inline-block;
      width: auto;
      text-align: center;
      margin: 0 auto;
      font-size: 3.5rem; /* Augmentation de la taille du titre */
      font-weight: 800; /* Augmentation du poids de la police pour la rendre plus visible */
      letter-spacing: -1px; /* Légère diminution de l'espacement des lettres pour un look premium */
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* Ombre légère pour améliorer la lisibilité */
      margin-bottom: 20px; /* Espace supplémentaire sous le titre */
    }
  `]
})
export class HeaderComponent {}