import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Augmenter la limite d'écouteurs d'événements si EventEmitter est disponible
if (typeof process !== 'undefined' && process.env) {
  try {
    const EventEmitter = require('events');
    if (EventEmitter && EventEmitter.defaultMaxListeners) {
      EventEmitter.defaultMaxListeners = 20;
    }
  } catch (e) {
    console.warn('Impossible de configurer EventEmitter:', e);
  }
}

// Démarrer l'application Angular
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));