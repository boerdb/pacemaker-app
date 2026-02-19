import { Injectable, ApplicationRef, signal, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ToastController, Platform } from '@ionic/angular/standalone';
import { first, filter } from 'rxjs/operators';
import { concat, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  // We gebruiken een Signal zodat de UI direct weet of de knop zichtbaar moet zijn
  installPrompt = signal<any>(null);

  // Moderne injectie in plaats van een volle constructor
  private appRef = inject(ApplicationRef);
  private updates = inject(SwUpdate);
  private toastCtrl = inject(ToastController);
  private platform = inject(Platform);

  constructor() {
    // 1. Luister naar installatie mogelijkheid (Android/Chrome)
    this.initInstallPrompt();

    // 2. Update logica
    if (this.updates.isEnabled) {
      this.checkForUpdates();

      const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
      const everySixHours$ = interval(6 * 60 * 60 * 1000);

      concat(appIsStable$, everySixHours$).subscribe(() => this.updates.checkForUpdate());

      this.listenForUpdates();
    }
  }

  // --- INSTALL LOGICA ---

  private initInstallPrompt() {
    // Dit event wordt gevuurd door Chrome net voordat de banner zou verschijnen
    window.addEventListener('beforeinstallprompt', (e) => {
      // Voorkom dat Chrome de mini-infobar toont (we willen onze eigen knop)
      e.preventDefault();
      console.log('✨ PWA Install event gevangen!');

      // Bewaar het event zodat we het later kunnen activeren
      this.installPrompt.set(e);
    });
  }

  public async installPwa() {
    const promptEvent = this.installPrompt();
    if (!promptEvent) {
      return;
    }

    // Toon de native Android/Chrome prompt
    promptEvent.prompt();

    // Wacht op de keuze van de gebruiker
    const { outcome } = await promptEvent.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // Reset het event (je kunt het maar 1x gebruiken)
    this.installPrompt.set(null);
  }

  // --- UPDATE LOGICA ---

  public checkForUpdates() {
    if (this.updates.isEnabled) {
      this.updates.checkForUpdate();
    }
  }

  private listenForUpdates() {
    this.updates.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.presentUpdateToast();
      });
  }

  private async presentUpdateToast() {
    const toast = await this.toastCtrl.create({
      header: 'Update beschikbaar',
      message: 'Een nieuwe, verbeterde versie is gedownload. Installeer nu.',
      position: 'bottom',
      color: 'primary',
      duration: 0, // Belangrijk: De melding blijft nu staan tot er geklikt wordt!
      buttons: [{
        text: 'UPDATE NU',
        role: 'cancel', // Verbergt de toast na de klik
        handler: () => {
          this.updates.activateUpdate().then(() => document.location.reload());
        }
      }]
    });
    await toast.present();
  }
}
