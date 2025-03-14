import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CryptoDetailComponent } from './pages/crypto-detail/crypto-detail.component';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent,
    title: 'Ethereum Curieux - Top Cryptos' 
  },
  { 
    path: 'crypto/:id', 
    component: CryptoDetailComponent,
    title: 'Détails de la Cryptomonnaie' 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];