import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

// 1. Importeer de iconen
import { addIcons } from 'ionicons';
import { chevronBack, arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-mode-detail',
  templateUrl: './mode-detail.page.html',
  styleUrls: ['./mode-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ModeDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  modeId: string = '';

  // Decoded letters
  pos1 = { code: '', meaning: '', area: '' }; // Pacing
  pos2 = { code: '', meaning: '', area: '' }; // Sensing
  pos3 = { code: '', meaning: '', area: '' }; // Response

  definitions: any = {
    'A': { mean: 'Atrium', area: 'Boezem' },
    'V': { mean: 'Ventricle', area: 'Kamer' },
    'D': { mean: 'Dual (A+V)', area: 'Beide' },
    'O': { mean: 'None', area: '-' },
    'I': { mean: 'Inhibited', area: 'Onderdrukt puls bij eigen slag' },
    'T': { mean: 'Triggered', area: 'Vuurt puls bij detectie' }
  };

  constructor() {
    // 2. Registreer de back-iconen
    addIcons({ chevronBack, arrowBack });
  }

  ngOnInit() {
    this.modeId = this.route.snapshot.paramMap.get('id') || 'VOO';
    this.decodeMode(this.modeId);
  }

  decodeMode(code: string) {
    const chars = code.split('');
    this.pos1 = { code: chars[0], meaning: this.definitions[chars[0]]?.mean || 'Unknown', area: 'Waar wordt gestimuleerd?' };
    this.pos2 = { code: chars[1], meaning: this.definitions[chars[1]]?.mean || 'Unknown', area: 'Waar wordt geluisterd?' };
    this.pos3 = { code: chars[2], meaning: this.definitions[chars[2]]?.mean || 'Unknown', area: 'Wat doet hij bij detectie?' };
  }

  openSimulator() {
    this.router.navigate(['/simulation'], {
      state: { mode: this.modeId }
    });
  }
}
