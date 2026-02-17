import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'; // Nodig voor de knop naar dashboard
import { addIcons } from 'ionicons';
import { heart, arrowForward, settings } from 'ionicons/icons';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule] // RouterModule zorgt dat routerLink werkt
})
export class LandingPage {

  constructor() {
    // We registreren de iconen die we in de CSS-versie gebruiken
    addIcons({ heart, arrowForward, settings });
  }

}
