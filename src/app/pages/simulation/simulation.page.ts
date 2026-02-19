import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// 1. Expliciete imports voor standalone
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonButton, IonIcon, IonBackButton, IonRange
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
// 2. Iconen registreren
import { pause, play, flask, flaskOutline, pulse, chevronBack, arrowBack, square } from 'ionicons/icons';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.page.html',
  styleUrls: ['./simulation.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonIcon, IonBackButton, IonRange
  ]
})
export class SimulationPage implements OnDestroy {
  @ViewChild('ecgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Instellingen
  bpm = 60;
  output = 5;
  sensitivity = 2;
  realismMode = false;

  // Status
  mode: 'SIM' | 'VVI' | 'VOO' | 'AAI' | 'DDD' | 'DOO' = 'SIM';
  isRunning = true;
  isTesting = false;
  eventLabel = '';
  private eventTimeout: any;

  // Canvas & Loop
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: any;
  private dataPoints: number[] = [];
  private beatQueue: number[] = [];
  private lastBeatTime = 0;

  private highlightSpike = false;
  private highlightQRS = false;

  // Threshold Test
  captureThreshold = 0;
  private testInterval: any;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['mode']) {
      this.mode = nav.extras.state['mode'];
    }

    addIcons({ pause, play, flask, flaskOutline, pulse, chevronBack, arrowBack, square });
  }

  // JOUW geniale fix voor Ionic canvas sizing!
  ionViewDidEnter() {
    setTimeout(() => {
      this.initCanvas();
      this.startLoop();
    }, 100);
  }

  ngOnDestroy() {
    this.stopTest();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  toggleRun(): void {
    this.isRunning = !this.isRunning;
  }

  // ======================
  // Threshold test logic
  // ======================

  toggleThresholdTest() {
    if (this.isTesting) {
      this.stopTest();
      return;
    }

    this.showEvent('THRESHOLD TEST STARTED');
    this.isTesting = true;
    this.output = 5.0;

    this.captureThreshold = 3 + Math.random() * 2;
    const interval = (60000 / this.bpm) * 2;

    this.testInterval = setInterval(() => {
      this.output -= 0.5;
      this.output = Math.round(this.output * 10) / 10;

      if (this.output <= 0) {
        this.stopTest();
      }
    }, interval);
  }

  stopTest() {
    if (this.testInterval) {
      clearInterval(this.testInterval);
      this.testInterval = null;
    }
    this.isTesting = false;
    this.showEvent('TEST STOPPED');
  }

  // ======================
  // Canvas + loop
  // ======================

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;

    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const context = canvas.getContext('2d');
    if (context) {
      this.ctx = context;
      const mid = canvas.height / 2;
      this.dataPoints = new Array(canvas.width).fill(mid);
    }
  }

  private startLoop() {
    const loop = (timestamp: number) => {
      if (this.isRunning) {
        this.updatePhysics(timestamp);
        this.draw();
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private updatePhysics(timestamp: number) {
    const baseInterval = 60000 / this.bpm;
    const intervalMs = baseInterval + (Math.random() - 0.5) * 120;

    const mid = this.canvasRef.nativeElement.height / 2;
    let newValue = mid;

    if (timestamp - this.lastBeatTime > intervalMs) {
      this.decideBeatType(timestamp);
    }

    this.dataPoints.shift();

    if (this.beatQueue.length > 0) {
      newValue = this.beatQueue.shift() || mid;
    }

    newValue += (Math.random() - 0.5) * 1.2;

    const last = this.dataPoints[this.dataPoints.length - 1];
    newValue = last + (newValue - last) * 0.35;

    this.dataPoints.push(newValue);
  }

  // ======================
  // Beat logic
  // ======================

  private decideBeatType(time: number) {
    this.lastBeatTime = time;

    // Threshold test override
    if (this.isTesting) {
      if (this.output >= this.captureThreshold) {
        this.triggerPace();
        this.flashSpike();
      } else {
        this.captureFailure();
        this.flashSpike();
        this.showEvent('LOSS OF CAPTURE');
      }
      return;
    }

    switch (this.mode) {
      case 'SIM': {
        const intrinsicRate = this.bpm - 5 + Math.random() * 10;
        const rateDiff = Math.abs(intrinsicRate - this.bpm);

        if (intrinsicRate > this.bpm) {
          this.sensedBeat();
          this.flashQRS();
          this.showEvent('SENSED BEAT');
          return;
        }

        if (rateDiff < 3) {
          const r = Math.random();
          if (r < 0.35) {
            this.fusionBeat();
            this.flashQRS();
            this.showEvent('FUSION BEAT');
            return;
          }
          if (r < 0.5) {
            this.pseudoFusionBeat();
            this.flashQRS();
            this.showEvent('PSEUDOFUSION');
            return;
          }
        }

        if (this.output < 3 || Math.random() < 0.12) {
          this.captureFailure();
          this.flashSpike();
          this.showEvent('LOSS OF CAPTURE');
          return;
        }

        this.triggerPace();
        this.flashSpike();
        this.showEvent('VENTRICULAR PACING');
        return;
      }

      case 'VOO':
        this.triggerPace();
        this.flashSpike();
        this.showEvent('ASYNC PACING');
        return;

      case 'VVI': {
        const intrinsicBeatOccurs = Math.random() > (this.sensitivity / 3);
        if (intrinsicBeatOccurs) {
          this.sensedBeat();
          this.flashQRS();
          this.showEvent('SENSED BEAT');
          return;
        }
        this.triggerPace();
        this.flashSpike();
        this.showEvent('VENTRICULAR PACING');
        return;
      }

      case 'AAI': {
        const intrinsicBeatOccurs = Math.random() > 0.5;
        if (intrinsicBeatOccurs) {
          this.sensedBeat();
          this.flashQRS();
          this.showEvent('ATRIAL SENSED');
        } else {
          this.atrialPace();
          this.flashSpike();
          this.showEvent('ATRIAL PACING');
        }
        return;
      }

      // HIER IS DE DOO MODUS TOEGEVOEGD!
      case 'DOO': {
        // 1. Pace blind in het Atrium
        this.atrialPace();
        this.flashSpike();
        this.showEvent('A-PACE (DOO)');

        // 2. Wacht 150ms (AV-delay) en pace dan blind in het Ventrikel
        setTimeout(() => {
          this.triggerPace();
          this.flashSpike();
          this.showEvent('V-PACE (DOO)');
        }, 150);
        return;
      }

      case 'DDD': {
        const intrinsicAtrial = Math.random() > 0.4;
        if (intrinsicAtrial) {
          this.sensedBeat();
          this.flashQRS();
          this.showEvent('ATRIAL SENSED');
        } else {
          this.atrialPace();
          this.flashSpike();
          this.showEvent('ATRIAL PACING');
        }

        setTimeout(() => {
          if (Math.random() > 0.5) {
            this.triggerPace();
            this.flashSpike();
            this.showEvent('VENTRICULAR PACING');
          }
        }, 120);
        return;
      }
    }
  }

  private showEvent(text: string) {
    this.eventLabel = text;
    clearTimeout(this.eventTimeout);
    this.eventTimeout = setTimeout(() => this.eventLabel = '', 1500);
  }

  private flashSpike() {
    this.highlightSpike = true;
    setTimeout(() => this.highlightSpike = false, 150);
  }

  private flashQRS() {
    this.highlightQRS = true;
    setTimeout(() => this.highlightQRS = false, 150);
  }

  // ======================
  // ECG morphology
  // ======================

  private pushTWave(mid: number) {
    const tAmp = 16 + Math.random() * 4;
    this.beatQueue.push(mid - tAmp * 0.2);
    this.beatQueue.push(mid - tAmp * 0.5);
    this.beatQueue.push(mid - tAmp * 0.8);
    this.beatQueue.push(mid - tAmp);
    this.beatQueue.push(mid - tAmp * 0.9);
    this.beatQueue.push(mid - tAmp * 0.6);
    this.beatQueue.push(mid - tAmp * 0.3);
    this.beatQueue.push(mid);
  }

  private triggerPace() {
    const mid = this.canvasRef.nativeElement.height / 2;
    this.beatQueue.push(mid - 120);
    this.beatQueue.push(mid + 120);
    this.beatQueue.push(mid);
    this.beatQueue.push(mid);
    this.beatQueue.push(mid);
    this.beatQueue.push(mid + 20);
    this.beatQueue.push(mid + 70);
    this.beatQueue.push(mid + 90);
    this.beatQueue.push(mid + 60);
    this.beatQueue.push(mid + 30);
    this.beatQueue.push(mid + 10);
    this.beatQueue.push(mid);
    for (let i = 0; i < 8; i++) this.beatQueue.push(mid);
    this.pushTWave(mid);
  }

  private sensedBeat() {
    const mid = this.canvasRef.nativeElement.height / 2;
    this.beatQueue.push(mid - 2);
    this.beatQueue.push(mid - 10);
    this.beatQueue.push(mid - 4);
    this.beatQueue.push(mid);
    for (let i = 0; i < 5; i++) this.beatQueue.push(mid);
    this.beatQueue.push(mid + 5);
    this.beatQueue.push(mid - 20);
    this.beatQueue.push(mid - 65);
    this.beatQueue.push(mid - 30);
    this.beatQueue.push(mid + 15);
    this.beatQueue.push(mid);
    for (let i = 0; i < 14; i++) this.beatQueue.push(mid);
    this.pushTWave(mid);
  }

  private fusionBeat() { this.triggerPace(); }
  private pseudoFusionBeat() { this.triggerPace(); }

  private atrialPace() {
    const mid = this.canvasRef.nativeElement.height / 2;
    this.beatQueue.push(mid - 60);
    this.beatQueue.push(mid + 60);
    this.beatQueue.push(mid);
    this.beatQueue.push(mid - 2);
    this.beatQueue.push(mid - 8);
    this.beatQueue.push(mid - 4);
    this.beatQueue.push(mid);
    this.pushTWave(mid);
  }

  private captureFailure() {
    const mid = this.canvasRef.nativeElement.height / 2;
    this.beatQueue.push(mid - 120);
    this.beatQueue.push(mid + 120);
    this.beatQueue.push(mid);
    for (let i = 0; i < 20; i++) this.beatQueue.push(mid);
  }

  private draw() {
    if (!this.ctx) return;

    const w = this.canvasRef.nativeElement.width;
    const h = this.canvasRef.nativeElement.height;

    this.ctx.clearRect(0, 0, w, h);

    this.ctx.beginPath();
    this.ctx.lineWidth = this.highlightQRS ? 3 : 2;
    this.ctx.strokeStyle = this.highlightQRS ? '#00ffff' : '#00ff00';

    this.ctx.moveTo(0, this.dataPoints[0]);
    for (let i = 1; i < this.dataPoints.length; i++) {
      this.ctx.lineTo(i, this.dataPoints[i]);
    }

    this.ctx.shadowBlur = this.highlightSpike ? 15 : 6;
    this.ctx.shadowColor = '#00ff00';
    this.ctx.stroke();
  }
}
