import { Component } from '@angular/core';
import {
  IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, pulseOutline, schoolOutline,
  medkitOutline, informationCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon]
})
export class TabsPage {
  constructor() {
    addIcons({
      homeOutline, pulseOutline, schoolOutline,
      medkitOutline, informationCircleOutline
    });
  }
}
