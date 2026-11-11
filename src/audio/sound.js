// ============================================================================
// REALM OF THE SHATTERED CREST — WEBAUDIO 16-BIT CHIPTUNE SOUND ENGINE
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.35;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      // Ignore audio errors in headless environments
    }
  }

  playTone(freq, type = 'square', duration = 0.1, delay = 0, vol = 0.25, slideTo = null) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
      }
      gain.gain.setValueAtTime(vol * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch (e) {}
  }

  playSfx(name) {
    if (this.muted) return;
    switch (name) {
      case 'slash':
        this.playTone(320, 'triangle', 0.08, 0, 0.3, 110);
        this.playTone(680, 'sawtooth', 0.05, 0.01, 0.15, 220);
        break;
      case 'beam':
        this.playTone(880, 'square', 0.06, 0, 0.2, 1320);
        this.playTone(1320, 'triangle', 0.09, 0.05, 0.2, 660);
        break;
      case 'spin_ready':
        this.playTone(587.33, 'triangle', 0.07, 0, 0.25);
        this.playTone(880, 'triangle', 0.14, 0.06, 0.3);
        break;
      case 'spin_attack':
        for (let i = 0; i < 5; i++) {
          this.playTone(260 + i * 95, 'sawtooth', 0.07, i * 0.035, 0.28, 150 + i * 50);
        }
        break;
      case 'parry':
        // Golden shield reflect clang!
        this.playTone(1046.5, 'triangle', 0.18, 0, 0.4);
        this.playTone(1567.98, 'sine', 0.28, 0.03, 0.38);
        this.playTone(2093.0, 'triangle', 0.32, 0.06, 0.3);
        break;
      case 'block':
        this.playTone(190, 'square', 0.07, 0, 0.25, 90);
        break;
      case 'dash':
        this.playTone(240, 'triangle', 0.09, 0, 0.22, 480);
        break;
      case 'boomerang':
        this.playTone(420, 'triangle', 0.08, 0, 0.22, 620);
        this.playTone(620, 'triangle', 0.08, 0.08, 0.22, 420);
        break;
      case 'hookshot':
        this.playTone(520, 'sawtooth', 0.05, 0, 0.25, 780);
        this.playTone(780, 'square', 0.07, 0.05, 0.25, 980);
        break;
      case 'bomb_place':
        this.playTone(180, 'triangle', 0.08, 0, 0.25, 290);
        break;
      case 'bomb_explode':
        this.playTone(110, 'sawtooth', 0.28, 0, 0.45, 32);
        this.playTone(75, 'square', 0.32, 0.02, 0.4, 24);
        break;
      case 'ocarina':
        // Sacred Warhorn Triad (D5 - F#5 - A5 - D6)
        [587.33, 739.99, 880.0, 1174.66].forEach((f, idx) => {
          this.playTone(f, 'sine', 0.22, idx * 0.08, 0.32);
        });
        break;
      case 'secret':
        // 8-note Secret Passage Discovered Jingle!
        [783.99, 739.99, 622.25, 440.0, 415.3, 659.25, 830.61, 1046.5].forEach((f, idx) => {
          this.playTone(f, 'triangle', 0.13, idx * 0.10, 0.34);
        });
        break;
      case 'bush':
        this.playTone(340, 'sawtooth', 0.05, 0, 0.15, 180);
        break;
      case 'pot':
        this.playTone(480, 'square', 0.06, 0, 0.22, 160);
        this.playTone(720, 'triangle', 0.05, 0.03, 0.18, 240);
        break;
      case 'rupee':
        this.playTone(987.77, 'sine', 0.06, 0, 0.25);
        this.playTone(1318.51, 'sine', 0.14, 0.05, 0.28);
        break;
      case 'heart':
        this.playTone(659.25, 'triangle', 0.07, 0, 0.25);
        this.playTone(880.0, 'triangle', 0.12, 0.06, 0.28);
        break;
      case 'potion':
        [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
          this.playTone(f, 'triangle', 0.11, idx * 0.06, 0.3);
        });
        break;
      case 'blue_bag':
        [440, 554.37, 659.25, 880].forEach((f, idx) => {
          this.playTone(f, 'triangle', 0.16, idx * 0.07, 0.34);
        });
        break;
      case 'white_bag':
        // Heavenly Legendary White Bag Fanfare!
        [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51, 1567.98].forEach((f, idx) => {
          this.playTone(f, 'triangle', 0.24, idx * 0.075, 0.4);
        });
        break;
      case 'levelup':
        [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((f, idx) => {
          this.playTone(f, 'square', 0.15, idx * 0.07, 0.28);
        });
        break;
      case 'hit_enemy':
        this.playTone(165, 'square', 0.045, 0, 0.18, 85);
        break;
      case 'hit_player':
        this.playTone(135, 'sawtooth', 0.08, 0, 0.28, 65);
        break;
      case 'death':
        [392, 349.23, 329.63, 261.63, 196].forEach((f, idx) => {
          this.playTone(f, 'sawtooth', 0.22, idx * 0.14, 0.35);
        });
        break;
    }
  }
}

export const sound = new SoundEngine();
