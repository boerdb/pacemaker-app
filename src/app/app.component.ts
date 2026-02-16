/* src/app/app.component.ts */
import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { APP_ICONS } from './shared/icons';
// Importeer de service
import { PwaUpdateService } from './core/services/pwa-update';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  // Injecteer hem (hierdoor start hij direct op)
  private pwaUpdate = inject(PwaUpdateService);

  constructor() {
    addIcons(APP_ICONS);
    console.log('App started & PWA Service listening...');
  }
}
