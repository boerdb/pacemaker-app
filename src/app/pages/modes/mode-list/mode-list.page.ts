import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

// 1. Importeer de iconen expliciet
import { addIcons } from 'ionicons';
import { chevronBack, arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-mode-list',
  templateUrl: './mode-list.page.html',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class ModeListPage {
  // Gebruik de moderne inject() methode
  private router = inject(Router);

  constructor() {
    // 2. Registreer de back-iconen zodat de compiler ze niet weggooit
    addIcons({ chevronBack, arrowBack });
  }

  openSimulator() {
    this.router.navigate(['/simulation'], { state: { mode: 'SIM' } });
  }

  // De data voor onze lijst
  modes = [
    { id: 'VVI', name: 'Ventricular Demand', desc: 'Pacet alleen in de kamer als er geen eigen ritme is.', risk: 'Laag' },
    { id: 'AAI', name: 'Atrial Demand', desc: 'Pacet alleen in de boezem. Vereist goede AV-geleiding.', risk: 'Gemiddeld' },
    { id: 'DDD', name: 'Dual Chamber', desc: 'Volledige functionaliteit: Ziet en pacet beide kamers.', risk: 'Standaard' },
    { id: 'DOO', name: 'Asynchronous', desc: 'Pacet blind op een vast ritme. Negeert eigen signalen.', risk: 'Hoog (R-on-T)' },
    { id: 'VOO', name: 'Ventricular Async', desc: 'Oud of noodloop mode. Pacet blind in de kamer.', risk: 'Hoog' }
  ];
}
