import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-pm-skill-lab',
  templateUrl: './pm-skill-lab.page.html',
  styleUrls: ['./pm-skill-lab.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PmSkillLabPage implements AfterViewInit, OnDestroy {

  @ViewChild('ecgCanvas') ecgCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('artCanvas') artCanvas!: ElementRef<HTMLCanvasElement>;

  // ================= UI PROPERTIES =================
  currentObjective = 'Train capture en sensing correct.';
  feedbackMessage = 'Skill Lab actief';
  feedbackType: 'neutral' | 'error' | 'success' = 'neutral';
  selectedScenario = 'vvi_brady';

  lowerRate = 70;
  output = 10;
  sensitivity = 2.5;
  mode: 'VVI' | 'DDD' = 'VVI';

  displayedHR = 70;
  displayedMAP = 75;
  isRunning = true;

  // ================= SCENARIO PARAMETERS =================
  intrinsicRate = 40;
  intrinsicRwave = 5;
  threshold = 3;
  atrialRate = 70;
  ventricularEscapeRate = 30;

  // ================= ENGINE =================
  private ecgCtx!: CanvasRenderingContext2D;
  private artCtx!: CanvasRenderingContext2D;

  private sweepX = 0;
  private lastEcgX = 0;
  private lastEcgY = 0;
  private lastArtX = 0;
  private lastArtY = 0;

  private pixelsPerSecond = 125;
  private pixelsPermV = 12;

  // Timers
  private lastIntrinsicTime = 0;
  private lastPacemakerTimer = 0;
  private lastNoiseTime = 0;
  private lastPWaveTime = 0;
  private ventricleRefractoryUntil = 0;

  private beatQueue: {
    type: 'intrinsic' | 'paced' | 'loss' | 'atrial_sensed' | 'atrial_paced';
    time: number;
    spikeDrawn?: boolean;
  }[] = [];

  private animationFrameId: any;

  // ================= INIT =================
  ngAfterViewInit() {
    setTimeout(() => {
      this.setupCanvas();
      this.loadScenario();
      this.loop();
    }, 100);
  }

  ngOnDestroy() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  setupCanvas() {
    const ecg = this.ecgCanvas.nativeElement;
    const art = this.artCanvas.nativeElement;

    ecg.width = ecg.clientWidth;
    ecg.height = 240;

    art.width = art.clientWidth;
    art.height = 120;

    this.ecgCtx = ecg.getContext('2d')!;
    this.artCtx = art.getContext('2d')!;

    this.ecgCtx.fillStyle = 'black';
    this.ecgCtx.fillRect(0, 0, ecg.width, ecg.height);
    this.artCtx.fillStyle = 'black';
    this.artCtx.fillRect(0, 0, art.width, art.height);

    this.lastEcgY = ecg.height / 2;
    this.lastArtY = art.height / 2;
  }

  toggleRun() {
    this.isRunning = !this.isRunning;
  }

  // ================= HELPER FUNCTIES =================
  getScenarioLabel(value: string): string {
    const labels: { [key: string]: string } = {
      'vvi_brady': 'VVI: Brady',
      'vvi_under': 'VVI: Under',
      'vvi_over': 'VVI: Over',
      'ddd_p': 'DDD: P-Top',
      'asystole': 'Asystolie',
      'total_block': 'Totaal AV',
      'unpaced_total_block': 'Ongepaced Totaal Blok'
    };
    return labels[value] || value;
  }

  loadScenario() {
    this.feedbackType = 'neutral';
    this.feedbackMessage = 'Scenario starten...';
    this.beatQueue = [];

    switch (this.selectedScenario) {
      case 'vvi_brady':
        this.mode = 'VVI';
        this.lowerRate = 70;
        this.intrinsicRate = 30;
        this.threshold = 3.0;
        this.output = 2.5;
        this.currentObjective = 'Bradycardie: Zoek capture-drempel en stel 2x marge in.';
        break;

      case 'vvi_under':
        this.mode = 'VVI';
        this.lowerRate = 60;
        this.intrinsicRate = 75;
        this.intrinsicRwave = 1.5;
        this.sensitivity = 4.0;
        this.output = 5.0;
        this.threshold = 1.0;
        this.currentObjective = 'Herken undersensing (competitie) en verlaag de mV grens.';
        break;

      case 'vvi_over':
        this.mode = 'VVI';
        this.lowerRate = 70;
        this.intrinsicRate = 30;
        this.intrinsicRwave = 3.0;
        this.sensitivity = 1.0;
        this.output = 5.0;
        this.threshold = 1.0;
        this.currentObjective = 'Oversensing: Pacemaker ziet ruis. Maak pacemaker DOVER (hogere mV).';
        break;

      case 'ddd_p':
        this.mode = 'DDD';
        this.lowerRate = 60;
        this.intrinsicRate = 70;
        this.intrinsicRwave = 3.0;
        this.sensitivity = 2.0;
        this.output = 5.0;
        this.threshold = 1.0;
        this.currentObjective = 'DDD: Speel met de Lower Rate om AS-VP en AP-VP te forceren.';
        break;

      case 'asystole':
        this.mode = 'VVI';
        this.lowerRate = 60;
        this.intrinsicRate = 0;
        this.intrinsicRwave = 0;
        this.sensitivity = 2.0;
        this.output = 0.0;
        this.threshold = 3.0;
        this.currentObjective = 'Patiënt heeft asystolie. Verhoog direct de output om capture te krijgen.';
        break;

      case 'total_block':
        this.mode = 'DDD';
        this.lowerRate = 50;
        this.intrinsicRate = 85;
        this.intrinsicRwave = 0;
        this.sensitivity = 2.0;
        this.output = 5.0;
        this.threshold = 1.0;
        this.currentObjective = 'Totaal AV-Blok. Boezem is 85 bpm, kamer staat stil. Laat de pacemaker de P-toppen volgen.';
        break;

      case 'unpaced_total_block':
        this.mode = 'VVI';
        this.lowerRate = 60;
        this.atrialRate = 85;
        this.ventricularEscapeRate = 30;
        this.intrinsicRate = this.ventricularEscapeRate;
        this.intrinsicRwave = 3.0;
        this.sensitivity = 2.0;
        this.output = 0;
        this.threshold = 2.0;
        this.currentObjective = 'Ongepaced Totaal Blok. P-toppen (85/min) en kamers (30/min) zijn gedissocieerd. Activeer pacing.';
        break;
    }
  }

  loop = () => {
    if (this.isRunning) {
      this.tick();
      this.draw();
    }
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  // ================= PHYSIOLOGIE LOGICA =================
  tick() {
    const now = Date.now();

    // --- P-Wave generator for Unpaced Total Block ---
    if (this.selectedScenario === 'unpaced_total_block') {
      const atrialInterval = 60000 / this.atrialRate;
      if (now - this.lastPWaveTime >= atrialInterval) {
        this.beatQueue.push({ type: 'atrial_sensed', time: now });
        this.lastPWaveTime = now;
      }
    }

    const LRI = 60000 / this.lowerRate;

    // Voorkom delen door 0 bij asystolie
    const intrinsicInterval = this.intrinsicRate > 0 ? (60000 / this.intrinsicRate) : Infinity;

    // --- 0. OVERSENSING (RUIS) ---
    if (this.selectedScenario === 'vvi_over') {
      if (now - this.lastNoiseTime >= 350) {
        this.lastNoiseTime = now;
        if (this.sensitivity < 2.0) {
          this.lastPacemakerTimer = now;
          this.feedbackType = 'error';
          this.feedbackMessage = 'GEVAAR: Oversensing! Ruis inhibeert pacing. Verhoog mV.';
        } else {
          this.feedbackType = 'success';
          this.feedbackMessage = 'Correct: Ruis wordt genegeerd. Pacing is stabiel.';
        }
      }
    }

    // --- 1. EIGEN RITME (SINUSKNOOP) ---
    if (now - this.lastIntrinsicTime >= intrinsicInterval) {
      this.lastIntrinsicTime = now;

      if (this.mode === 'DDD') {
        const pWaveAmplitude = 2.5;
        const atrialSensed = pWaveAmplitude >= this.sensitivity;

        this.beatQueue.push({ type: 'atrial_sensed', time: now });

        if (atrialSensed) {
          this.lastPacemakerTimer = now;

          setTimeout(() => {
            if (Date.now() >= this.ventricleRefractoryUntil) {
              const capture = this.output >= this.threshold;
              if (capture) {
                this.beatQueue.push({ type: 'paced', time: Date.now() });
                this.ventricleRefractoryUntil = Date.now() + 300;

                if (this.selectedScenario === 'ddd_p') {
                  this.feedbackType = 'success';
                  this.feedbackMessage = 'AS-VP: Eigen P-top triggert de V-puls.';
                } else if (this.selectedScenario === 'total_block') {
                  this.feedbackType = 'success';
                  this.feedbackMessage = 'Perfect AS-VP! De pacemaker volgt netjes het eigen ritme.';
                }
              } else {
                this.beatQueue.push({ type: 'loss', time: Date.now() });

                if (this.selectedScenario === 'total_block') {
                  this.feedbackType = 'error';
                  this.feedbackMessage = 'ALARM: Wel P-sensed, maar géén V-Capture! Verhoog de Output (mA) direct.';
                }
              }
            }
          }, 160);

          this.displayedHR = this.intrinsicRate;
          this.displayedMAP = 75;

        } else {
          if (this.selectedScenario === 'total_block') {
            this.feedbackType = 'error';
            this.feedbackMessage = 'Atriale Undersensing! Pacemaker mist de P-top. Verlaag Sensitivity (mV).';
          }
        }

      } else {
        // HIER ZIT DE P-TOP FIX VOOR VVI
        this.beatQueue.push({ type: 'atrial_sensed', time: now });

        setTimeout(() => {
          if (Date.now() >= this.ventricleRefractoryUntil) {

            this.beatQueue.push({ type: 'intrinsic', time: Date.now() });
            this.ventricleRefractoryUntil = Date.now() + 300;

            const sensed = this.intrinsicRwave >= this.sensitivity;
            if (sensed) {
              this.lastPacemakerTimer = Date.now(); // Inhibit!

              if (this.selectedScenario === 'vvi_under') {
                this.feedbackType = 'success';
                this.feedbackMessage = 'Correct: Pacemaker ziet eigen ritme (Inhibit).';
              }
            } else {
              if (this.selectedScenario === 'vvi_under') {
                this.feedbackType = 'error';
                this.feedbackMessage = 'GEVAAR: Undersensing (Competitie)! Verlaag mV.';
              }
            }
            this.displayedHR = this.intrinsicRate;
            this.displayedMAP = 70;
          }
        }, 160);
      }
    }

   // --- 2. PACEMAKER ESCAPE TIMER (Lower Rate) ---
    if (now - this.lastPacemakerTimer >= LRI) {
      this.lastPacemakerTimer = now;
      // Let op: we resetten lastIntrinsicTime hier NIET zomaar.
      // Een spike zonder capture reset de sinusknop namelijk niet!

      const outputSufficient = this.output >= this.threshold;

      if (this.mode === 'DDD') {
        // Lower rate grens is bereikt: we pacen de boezem! (AP)
        this.beatQueue.push({ type: 'atrial_paced', time: now });
        this.lastIntrinsicTime = now; // Boezem-pacing reset de sinusknop wel

        setTimeout(() => {
          if (Date.now() >= this.ventricleRefractoryUntil) {
            if (outputSufficient) {
              this.beatQueue.push({ type: 'paced', time: Date.now() });
              this.ventricleRefractoryUntil = Date.now() + 300;

              if (this.selectedScenario === 'ddd_p') {
                this.feedbackType = 'neutral';
                this.feedbackMessage = 'AP-VP: Zowel boezem als kamer worden gepaced (Lower Rate actief).';
              } else if (this.selectedScenario === 'total_block') {
                this.feedbackType = 'neutral';
                this.feedbackMessage = 'AP-VP: De pacemaker is sneller dan de patiënt. Verlaag de Lower Rate.';
              }

            } else {
              this.beatQueue.push({ type: 'loss', time: Date.now() });

              if (this.selectedScenario === 'total_block') {
                this.feedbackType = 'error';
                this.feedbackMessage = 'ALARM: Geen V-Capture in DDD! Patiënt heeft een AV-blok. Verhoog Output.';
              }
            }
          }
        }, 160);

        this.displayedHR = this.lowerRate;
        this.displayedMAP = 75;

      } else {
        // VVI Pacing
        const isRefractory = now < this.ventricleRefractoryUntil;

        if (outputSufficient && !isRefractory) {
          this.lastIntrinsicTime = now; // HIER pas het eigen ritme resetten, we hebben immers V-Capture!
          this.beatQueue.push({ type: 'paced', time: now });
          this.ventricleRefractoryUntil = now + 300;
          this.displayedMAP = 75;
          this.displayedHR = this.lowerRate;

          if (this.selectedScenario === 'unpaced_total_block') {
            this.feedbackType = 'success';
            this.feedbackMessage = 'Goed zo! De pacemaker neemt het over van het trage escaperitme.';
          } else if (this.selectedScenario === 'vvi_brady') {
            if (this.output >= this.threshold * 2) {
              this.feedbackType = 'success';
              this.feedbackMessage = 'PERFECT: Veiligheidsmarge (2x) ingesteld.';
            } else {
              this.feedbackType = 'neutral';
              this.feedbackMessage = 'Capture OK. Nu nog veiligheidsmarge (x2).';
            }
          } else if (this.selectedScenario === 'asystole') {
            this.feedbackType = 'success';
            this.feedbackMessage = 'Levensreddend: Capture bereikt! Patiënt is stabiel.';
          }
        } else {
          // LOSS OF CAPTURE
          this.beatQueue.push({ type: 'loss', time: now });

          if (!isRefractory) {
             this.displayedMAP = 0;
             this.displayedHR = this.intrinsicRate;
          }

          if (this.selectedScenario === 'unpaced_total_block' && !isRefractory) {
            this.feedbackType = 'error';
            this.feedbackMessage = 'Geen capture. Het eigen ritme is te traag. Verhoog de output (mA).';
          } else if (this.selectedScenario === 'vvi_brady' && !isRefractory) {
            this.feedbackType = 'error';
            this.feedbackMessage = 'ALARM: Loss of Capture! Verhoog mA.';
          } else if (this.selectedScenario === 'asystole' && !isRefractory) {
            this.feedbackType = 'error';
            this.feedbackMessage = 'ALARM: Asystolie! Geen Capture. Verhoog direct de Output (mA).';
          }
        }
      }
    }
  }

  // ================= MORFOLOGIE =================
  intrinsicQRS(t: number): number {
    const q = -0.3 * Math.exp(-Math.pow((t - 0.3) / 0.03, 2));
    const r = 2.0 * Math.exp(-Math.pow((t - 0.45) / 0.04, 2));
    const s = -1.0 * Math.exp(-Math.pow((t - 0.6) / 0.06, 2));
    return q + r + s;
  }

  pacedQRS(t: number): number {
    const r1 = 1.0 * Math.exp(-Math.pow((t - 0.2) / 0.08, 2));
    const s = -1.5 * Math.exp(-Math.pow((t - 0.4) / 0.1, 2));
    const r2 = 1.2 * Math.exp(-Math.pow((t - 0.7) / 0.15, 2));
    return r1 + s + r2;
  }

  pWave(t: number): number {
    return 0.5 * Math.exp(-Math.pow((t - 0.5) / 0.12, 2)) - 0.1 * Math.exp(-Math.pow((t - 0.6) / 0.08, 2));
  }

  tWave(t: number): number {
    return 0.7 * Math.pow(t, 0.5) * Math.exp(-Math.pow(t / 0.3, 2));
  }

  arterialWave(t: number): number {
    if (t < 0.15) {
      return Math.sin((t / 0.15) * (Math.PI / 2));
    } else if (t < 0.35) {
      return 1.0 - ((t - 0.15) / 0.20) * 0.5;
    } else if (t < 0.45) {
      return 0.5 + Math.sin(((t - 0.35) / 0.10) * Math.PI) * 0.1;
    } else {
      const remainingTime = (t - 0.45) / 0.55;
      return 0.5 * (1 - Math.pow(remainingTime, 1.5));
    }
  }

  // ================= TEKENEN OP CANVAS =================
  draw() {
    const ecg = this.ecgCanvas.nativeElement;
    const art = this.artCanvas.nativeElement;
    const mid = ecg.height / 2;
    const now = Date.now();

    // Reset X als hij het scherm uitloopt
    if (this.sweepX >= ecg.width) {
      this.sweepX = 0;
      this.lastEcgX = 0;
      this.lastArtX = 0;
    }

    // De "Wisser"
    this.ecgCtx.fillStyle = '#000000';
    this.ecgCtx.fillRect(this.sweepX, 0, 15, ecg.height);
    this.artCtx.fillStyle = '#000000';
    this.artCtx.fillRect(this.sweepX, 0, 15, art.height);

    // BEREKEN Y-AS ECG
    let y = mid;
    if (this.selectedScenario === 'vvi_over') {
      y += (Math.random() - 0.5) * 8;
    }

    this.beatQueue.forEach(beat => {
      const age = now - beat.time;

      if ((beat.type === 'atrial_sensed' || beat.type === 'atrial_paced') && age < 120) {
        y -= this.pWave(age / 120) * this.pixelsPermV;
      }

      if (age >= 0 && age < 140) {
        const t = age / 140;
        if (beat.type === 'intrinsic') y -= this.intrinsicQRS(t) * this.pixelsPermV;
        if (beat.type === 'paced') y -= this.pacedQRS(t) * this.pixelsPermV;
      }

      if (age >= 140 && age < 300) {
        y += this.tWave((age - 140) / 160) * this.pixelsPermV;
        y += (Math.random() - 0.5) * 1;
      }
    });

    // TEKEN ECG LIJN
    this.ecgCtx.strokeStyle = '#00ff66';
    this.ecgCtx.lineWidth = 2;
    this.ecgCtx.beginPath();

    if (this.sweepX === 0) {
      this.ecgCtx.moveTo(0, y);
    } else {
      this.ecgCtx.moveTo(this.lastEcgX, this.lastEcgY);
    }

    this.ecgCtx.lineTo(this.sweepX, y);
    this.ecgCtx.stroke();

    this.lastEcgX = this.sweepX;
    this.lastEcgY = y;

    // TEKEN WITTE SPIKES
    this.beatQueue.forEach(beat => {
      const age = now - beat.time;
      if ((beat.type === 'paced' || beat.type === 'loss' || beat.type === 'atrial_paced') && age >= 0 && age < 25) {
        if (!beat.spikeDrawn) {
          this.ecgCtx.strokeStyle = '#ffffff';
          this.ecgCtx.lineWidth = 2;
          this.ecgCtx.beginPath();
          this.ecgCtx.moveTo(this.sweepX, mid - 40);
          this.ecgCtx.lineTo(this.sweepX, mid + 40);
          this.ecgCtx.stroke();

          beat.spikeDrawn = true;
        }
      }
    });

    // ================= BLOEDDRUK =================
    const artMid = art.height / 2;
    let artY = artMid + 20 + (Math.random() - 0.5) * 1.5;

    let maxArtDisplacement = 0;

    this.beatQueue.forEach(beat => {
      if (beat.type === 'loss' || beat.type === 'atrial_paced' || beat.type === 'atrial_sensed') return;

      const age = now - beat.time;
      const delay = 120;
      const duration = 550;

      if (age > delay && age < (delay + duration)) {
        const displacement = this.arterialWave((age - delay) / duration) * 45;
        if (displacement > maxArtDisplacement) {
            maxArtDisplacement = displacement;
        }
      }
    });

    artY -= maxArtDisplacement;

    // TEKEN BLOEDDRUK LIJN
    this.artCtx.strokeStyle = '#ff1744';
    this.artCtx.lineWidth = 2.5;
    this.artCtx.beginPath();

    if (this.sweepX === 0) {
      this.artCtx.moveTo(0, artY);
    } else {
      this.artCtx.moveTo(this.lastArtX, this.lastArtY);
    }

    this.artCtx.lineTo(this.sweepX, artY);
    this.artCtx.stroke();

    this.lastArtX = this.sweepX;
    this.lastArtY = artY;

    // SCHUIF DE PEN OP
    this.sweepX += this.pixelsPerSecond / 60;
  }
}
