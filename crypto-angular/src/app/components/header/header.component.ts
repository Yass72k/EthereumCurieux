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
          <h1 class="display-4 fw-bolder header-title">
            <a [routerLink]="['']" class="text-white text-decoration-none">
              Ethereum Curieux
            </a>
          </h1>
          <p class="lead fw-normal text-white-50 mb-0 header-subtitle">
            Le site des cryptos préféré de ton site des cryptos préféré
          </p>
        </div>
      </div>
    </header>
  `,
  styles: [`
    a:hover {
      color: var(--light-blue);
    }
  `]
})
export class HeaderComponent {}