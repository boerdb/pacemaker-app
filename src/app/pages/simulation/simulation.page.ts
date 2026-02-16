import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ViewDidEnter } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { pause, play, walk, bicycle, flask, flaskOutline, pulse } from 'ionicons/icons';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.page.html',
  styleUrls: ['./simulation.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class SimulationPage implements ViewDidEnter, OnDestroy {

  @ViewChild('ecgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  bpm = 60;
  output = 5;
  sensitivity = 2;

  isRunning = true;
  realismMode = true;

  eventLabel = '';
  private eventTimeout: any;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: any;
  private dataPoints: number[] = [];
  private lastBeatTime = 0;
  private beatQueue: number[] = [];

  private highlightSpike = false;
  private highlightQRS = false;

  // threshold test
  private captureThreshold = 4;
  private thresholdTestActive = false;
  private thresholdCaptured = false;

  constructor() {
    addIcons({ pause, play, walk, bicycle, flask, flaskOutline, pulse });
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.initCanvas();
      this.startLoop();
    }, 100);
  }

  ngOnDestroy() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

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
      const middle = canvas.height / 2;
      this.dataPoints = new Array(canvas.width).fill(middle);
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

    const middle = this.canvasRef.nativeElement.height / 2;
    let newValue = middle;

    if (timestamp - this.lastBeatTime > intervalMs) {
      this.decideBeatType(timestamp);
    }

    this.dataPoints.shift();

    if (this.beatQueue.length > 0) {
      newValue = this.beatQueue.shift() || middle;
    }

    newValue += (Math.random() - 0.5) * 1.2;

    const last = this.dataPoints[this.dataPoints.length - 1];
    newValue = last + (newValue - last) * 0.35;

    this.dataPoints.push(newValue);
  }

  private decideBeatType(time: number) {

    this.lastBeatTime = time;

    // threshold test actief?
    if (this.thresholdTestActive) {

      if (this.output >= this.captureThreshold) {
        this.triggerPace();
        this.flashSpike();

        if (!this.thresholdCaptured) {
          this.showEvent(`CAPTURE RESTORED (≈ ${this.captureThreshold.toFixed(1)} mA)`);
          this.thresholdCaptured = true;
        }
      } else {
        this.captureFailure();
        this.flashSpike();
        this.showEvent('LOSS OF CAPTURE');
      }

      return;
    }

    // normaal gedrag
    const intrinsicBeatOccurs = Math.random() > (this.sensitivity / 5);

    if (intrinsicBeatOccurs) {
      this.sensedBeat();
      this.flashQRS();
      this.showEvent('SENSED BEAT');
      return;
    }

    if (this.output < 3) {
      this.captureFailure();
      this.flashSpike();
      this.showEvent('LOSS OF CAPTURE');
      return;
    }

    this.triggerPace();
    this.flashSpike();
    this.showEvent('VENTRICULAR PACING');
  }

  // knop
  startThresholdTest() {
    this.captureThreshold = 3 + Math.random() * 3; // 3–6 mA
    this.thresholdTestActive = true;
    this.thresholdCaptured = false;
    this.showEvent('THRESHOLD TEST – INCREASE OUTPUT');
  }

  private showEvent(text: string) {
    this.eventLabel = text;

    if (this.eventTimeout) clearTimeout(this.eventTimeout);

    this.eventTimeout = setTimeout(() => {
      this.eventLabel = '';
    }, 1800);
  }

  private flashSpike() {
    this.highlightSpike = true;
    setTimeout(() => this.highlightSpike = false, 150);
  }

  private flashQRS() {
    this.highlightQRS = true;
    setTimeout(() => this.highlightQRS = false, 150);
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

    for (let i = 0; i < 6; i++) this.beatQueue.push(mid - 2);

    this.beatQueue.push(mid - 5);
    this.beatQueue.push(mid - 18);
    this.beatQueue.push(mid - 8);
    this.beatQueue.push(mid);
  }

  private captureFailure() {
    const mid = this.canvasRef.nativeElement.height / 2;

    this.beatQueue.push(mid - 120);
    this.beatQueue.push(mid + 120);
    this.beatQueue.push(mid);

    for (let i = 0; i < 20; i++) this.beatQueue.push(mid);
  }

  private sensedBeat() {
    const mid = this.canvasRef.nativeElement.height / 2;

    this.beatQueue.push(mid - 2);
    this.beatQueue.push(mid - 10);
    this.beatQueue.push(mid - 4);
    this.beatQueue.push(mid);

    for (let i = 0; i < 8; i++) this.beatQueue.push(mid);

    this.beatQueue.push(mid + 5);
    this.beatQueue.push(mid - 20);
    this.beatQueue.push(mid - 65);
    this.beatQueue.push(mid - 30);
    this.beatQueue.push(mid + 15);
    this.beatQueue.push(mid);

    for (let i = 0; i < 8; i++) this.beatQueue.push(mid - 1);

    this.beatQueue.push(mid - 5);
    this.beatQueue.push(mid - 20);
    this.beatQueue.push(mid - 6);
    this.beatQueue.push(mid);
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
