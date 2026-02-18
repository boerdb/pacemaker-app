import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// 1. We importeren de specifieke Ionic modules vanuit 'standalone'
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
// 2. We importeren de specifieke iconen
import { addIcons } from 'ionicons';
import { heart, arrowForward, settings } from 'ionicons/icons';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  // 3. We zetten ze hier in de imports array, zodat de compiler ze NIET kan verwijderen!
  imports: [CommonModule, RouterModule, IonContent, IonButton, IonIcon]
})
export class LandingPage {
  constructor() {
    // 4. Iconen registreren
    addIcons({ heart, arrowForward, settings });
  }
}
