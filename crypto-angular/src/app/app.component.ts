import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule,
    HttpClientModule,
    HeaderComponent,
    FooterComponent
  ],
  template: `
    <div class="bg-custom">
      <app-header></app-header>
      <router-outlet></router-outlet>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .bg-custom {
      min-height: 100vh;
      background: linear-gradient(135deg, #2A1D62 0%, #0F0B33 100%);
    }
  `]
})
export class AppComponent {
  title = 'Ethereum Curieux';
}