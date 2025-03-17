import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { routes } from './app.routes';

import { ApiService } from './services/api.service';
import { CryptoService } from './services/crypto.service';

// Intercepteur pour augmenter la limite de MaxListeners et handle les erreurs
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  declarations: [
    // AppComponent a été retiré car c'est un composant standalone
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ApiService,
    CryptoService
  ]
})
export class AppModule { }