import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  batteryCharging,
  pulse,
  flash,
  analytics,
  wifi,
  settings,
  list,
  chevronForward,
  medkit
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class DashboardPage {
  // Gesimuleerde apparaat data
  deviceInfo = {
    model: 'PaceMaster Pro VR',
    serial: 'SN-8849201',
    mode: 'VVI' // <--- We tonen hier alvast de huidige modus
  };

  batteryStatus = {
    voltage: 2.98,
    status: 'OK',
    eol: '7.2 years'
  };

  leadStatus = {
    impedance: 480,
    sensing: 2.5,
    threshold: 0.75
  };

  constructor() {
    addIcons({
      batteryCharging,
      pulse,
      flash,
      analytics,
      wifi,
      settings,
      list,
      chevronForward,
      medkit
    });
  }
}
