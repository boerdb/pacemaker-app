import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { informationCircle, bug, codeWorking, shareSocial } from 'ionicons/icons';
import { PwaUpdateService } from '../../core/services/pwa-update'; // Die maken we zo af
import { APP_ICONS } from '../../shared/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SettingsPage {
installPwa() {
  this.pwaService.installPwa();
}
  // We injecteren de update service (die maken we in stap 2)
  pwaService = inject(PwaUpdateService);

  appVersion = '1.0.3 Beta';
  buildDate = new Date().toLocaleDateString();

  constructor() {
    addIcons({ informationCircle, bug, codeWorking, shareSocial });
    addIcons(APP_ICONS);
  }

  checkForUpdates() {
    this.pwaService.checkForUpdates();
  }
}
