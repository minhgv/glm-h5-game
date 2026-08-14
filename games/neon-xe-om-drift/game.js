/**
 * Neon Xe Ôm: Sài Gòn 2087
 * High-performance Canvas 2D Engine with WebAudio Procedural SFX & Music
 */

(function () {
  'use strict';

  // --- CONFIGURATION CONSTANTS ---
  const CONFIG = {
    CANVAS_WIDTH: 450,
    CANVAS_HEIGHT: 800,
    HORIZON_Y: 0.16, // y = 16% height
    LANES: 3,
    LANE_WIDTH_BOTTOM: 110,
    LANE_WIDTH_TOP: 28,
    PLAYER_RADIUS: 15,
    PLAYER_Y: 0.82,
    PHYSICS_HZ: 120,
    ACCEL: 3400,
    DRAG: 6.5,
    MAX_LATERAL_SPEED: 640,
    INITIAL_WORLD_SPEED: 320,
    SPEED_GROWTH: 8, // +8 u/s per 10s
    MAX_WORLD_SPEED: 950,
    TURBO_MULTIPLIER: 1.75,
    TURBO_DURATION: 3.2,
    NEAR_MISS_DISTANCE: 25,
    COMBO_TIMEOUT: 4.0,
    STORAGE_KEY: 'neonxeom_best',
    STORAGE_TOTAL_NM: 'neonxeom_nm_total',
    AUDIO_MUTED_KEY: 'neonxeom_muted'
  };

  // --- AUDIO SYSTEM (WebAudio Procedural 100%) ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.compressor = null;
      this.isMuted = localStorage.getItem(CONFIG.AUDIO_MUTED_KEY) === 'true';
      this.musicInterval = null;
      this.beatStep = 0;
      this.bpm = 120;
      this.isUnlocked = false;

      // Engine node references
      this.engineOsc1 = null;
      this.engineOsc2 = null;
      this.engineFilter = null;
      this.engineGain = null;
      this.engineRunning = false;
    }

    unlock() {
      if (this.isUnlocked) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.initEngineAudio();
        this.startMusicLoop();
        this.isUnlocked = true;
      } catch (e) {
        console.warn('WebAudio failed to initialize:', e);
      }
    }

    setMute(mute) {
      this.isMuted = mute;
      localStorage.setItem(CONFIG.AUDIO_MUTED_KEY, mute);
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
      }
    }

    initEngineAudio() {
      if (!this.ctx || this.engineRunning) return;
      const t = this.ctx.currentTime;
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineGain = this.ctx.createGain();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.setValueAtTime(55, t);

      this.engineOsc2.type = 'square';
      this.engineOsc2.frequency.setValueAtTime(110, t);
      this.engineOsc2.detune.setValueAtTime(7, t);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(450, t);

      this.engineGain.gain.setValueAtTime(0.001, t);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.compressor);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.engineRunning = true;
    }

    updateEngine(speedRatio, isTurbo) {
      if (!this.engineRunning || !this.ctx) return;
      const t = this.ctx.currentTime;
      const targetFreq = 50 + speedRatio * 90 + (isTurbo ? 45 : 0);
      const targetCutoff = 400 + speedRatio * 1800 + (isTurbo ? 800 : 0);
      const targetGain = isTurbo ? 0.09 : (0.04 + speedRatio * 0.03);

      this.engineOsc1.frequency.setTargetAtTime(targetFreq, t, 0.08);
      this.engineOsc2.frequency.setTargetAtTime(targetFreq * 2, t, 0.08);
      this.engineFilter.frequency.setTargetAtTime(targetCutoff, t, 0.08);
      this.engineGain.gain.setTargetAtTime(this.isMuted ? 0 : targetGain, t, 0.05);
    }

    stopEngine() {
      if (!this.engineRunning || !this.ctx) return;
      const t = this.ctx.currentTime;
      this.engineGain.gain.setTargetAtTime(0.0001, t, 0.1);
    }

    playNearMiss(combo) {
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const duration = 0.22;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const startF = 300 * (1 + Math.min(combo, 15) * 0.03);
      const endF = 3800 * (1 + Math.min(combo, 15) * 0.03);
      filter.frequency.setValueAtTime(startF, t);
      filter.frequency.exponentialRampToValueAtTime(endF, t + duration * 0.8);
      filter.Q.setValueAtTime(3.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      whiteNoise.start(t);
      whiteNoise.stop(t + duration);

      // Pentatonic pitch confirmation
      this.playPentatonicNote(combo);
    }

    playPentatonicNote(index) {
      if (!this.ctx || this.isMuted) return;
      const pentatonic = [220, 261.63, 293.66, 329.63, 392.00, 440, 523.25, 587.33, 659.25, 783.99];
      const freq = pentatonic[index % pentatonic.length];
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(t);
      osc.stop(t + 0.35);
    }

    playTurbo() {
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(950, t + 0.4);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(t);
      osc.stop(t + 0.6);
    }

    playCrash() {
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const duration = 0.6;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * (i / bufferSize));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.linearRampToValueAtTime(100, t + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      noise.start(t);
      noise.stop(t + duration);
    }

    startMusicLoop() {
      if (this.musicInterval) clearInterval(this.musicInterval);
      const chords = [
        [220, 261.63, 329.63], // Am
        [174.61, 220, 261.63], // F
        [130.81, 164.81, 196.0], // C
        [196.0, 246.94, 293.66]  // G
      ];

      const stepTimeMs = 125; // 120 BPM 16th notes approx
      this.musicInterval = setInterval(() => {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime + 0.05;
        const bar = Math.floor(this.beatStep / 16) % chords.length;
        const stepInBar = this.beatStep % 16;

        // Kick on 0, 4, 8, 12
        if (stepInBar % 4 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.frequency.setValueAtTime(140, t);
          kickOsc.frequency.exponentialRampToValueAtTime(38, t + 0.09);
          kickGain.gain.setValueAtTime(0.25, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          kickOsc.connect(kickGain);
          kickGain.connect(this.compressor);
          kickOsc.start(t);
          kickOsc.stop(t + 0.12);
        }

        // Hi-Hat on offbeats 2, 6, 10, 14
        if (stepInBar % 4 === 2) {
          const hhBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
          const out = hhBuffer.getChannelData(0);
          for (let i = 0; i < out.length; i++) out[i] = Math.random() * 2 - 1;
          const hh = this.ctx.createBufferSource();
          hh.buffer = hhBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(6500, t);
          const hhGain = this.ctx.createGain();
          hhGain.gain.setValueAtTime(0.08, t);
          hhGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
          hh.connect(filter);
          filter.connect(hhGain);
          hhGain.connect(this.compressor);
          hh.start(t);
          hh.stop(t + 0.03);
        }

        // Bass 8-note synthwave pattern
        if (stepInBar % 2 === 0) {
          const bassNote = chords[bar][0] / 2;
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          const bassFilter = this.ctx.createBiquadFilter();

          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(bassNote, t);

          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(650, t);
          bassFilter.frequency.exponentialRampToValueAtTime(200, t + 0.12);

          bassGain.gain.setValueAtTime(0.12, t);
          bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(this.compressor);

          bassOsc.start(t);
          bassOsc.stop(t + 0.14);
        }

        this.beatStep++;
      }, stepTimeMs);
    }
  }

  // --- ENTITY POOLS ---
  class ObjectPool {
    constructor(createFn, initialSize = 30) {
      this.createFn = createFn;
      this.pool = [];
      for (let i = 0; i < initialSize; i++) {
        this.pool.push(this.createFn());
      }
    }

    get() {
      if (this.pool.length > 0) {
        const item = this.pool.pop();
        item.active = true;
        return item;
      }
      const item = this.createFn();
      item.active = true;
      return item;
    }

    release(item) {
      item.active = false;
      this.pool.push(item);
    }
  }

  // --- GAME ENGINE ---
  class NeonXeOmGame {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.sound = new SoundManager();

      // UI Elements
      this.menuScreen = document.getElementById('screen-menu');
      this.gameoverScreen = document.getElementById('screen-gameover');
      this.countdownOverlay = document.getElementById('countdown-overlay');
      this.countdownText = document.getElementById('countdown-text');
      this.pauseOverlay = document.getElementById('pause-overlay');

      this.btnStart = document.getElementById('btn-start');
      this.btnRestart = document.getElementById('btn-restart');
      this.btnToMenu = document.getElementById('btn-to-menu');
      this.btnSound = document.getElementById('btn-sound-toggle');

      this.menuHighscore = document.getElementById('menu-highscore');
      this.menuTotalNM = document.getElementById('menu-total-nearmiss');

      this.goScore = document.getElementById('go-score');
      this.goDistance = document.getElementById('go-distance');
      this.goNearmiss = document.getElementById('go-nearmiss');
      this.goMaxCombo = document.getElementById('go-maxcombo');
      this.goBest = document.getElementById('go-best');
      this.medalBadge = document.getElementById('medal-badge');

      // State variables
      this.state = 'MENU'; // MENU, COUNTDOWN, PLAYING, GAMEOVER, PAUSED
      this.score = 0;
      this.distance = 0;
      this.worldSpeed = CONFIG.INITIAL_WORLD_SPEED;
      this.targetWorldSpeed = CONFIG.INITIAL_WORLD_SPEED;
      this.elapsedTime = 0;
      this.difficulty = 1.0;

      // Player lateral state
      this.playerX = CONFIG.CANVAS_WIDTH / 2;
      this.playerVelX = 0;
      this.playerLean = 0;
      this.inputSteer = 0; // -1: left, 1: right, 0: neutral

      // Turbo
      this.turboMeter = 0; // 0 to 100
      this.isTurbo = false;
      this.turboTimer = 0;

      // Combo & Near-miss
      this.combo = 0;
      this.maxCombo = 0;
      this.comboTimer = 0;
      this.sessionNearMisses = 0;

      // Visuals & Effects
      this.screenShake = 0;
      this.chromaticAberration = 0;
      this.roadScrollY = 0;
      this.skylineScrollX = 0;
      this.lastFrameTime = performance.now();
      this.accumulator = 0;
      this.dtPhysics = 1 / CONFIG.PHYSICS_HZ;

      // Touch & Key Tracking
      this.keys = {};
      this.touchLeft = false;
      this.touchRight = false;
      this.lastTapTime = 0;

      // Pools
      this.trafficPool = new ObjectPool(() => ({
        active: false,
        x: 0,
        y: 0,
        lane: 1,
        speed: 0,
        type: 'scooter', // scooter, car, truck, barrier
        width: 32,
        height: 60,
        color: '#ff2fb9',
        nearMissTriggered: false
      }), 40);

      this.particlePool = new ObjectPool(() => ({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        color: '#00f0ff',
        size: 2,
        alpha: 1,
        life: 0.5,
        maxLife: 0.5
      }), 120);

      this.floatingTextPool = new ObjectPool(() => ({
        active: false,
        x: 0,
        y: 0,
        text: '',
        color: '#ffb800',
        alpha: 1,
        life: 0.8
      }), 15);

      this.activeTraffic = [];
      this.activeParticles = [];
      this.activeFloatingTexts = [];

      this.spawnTimer = 0;
      this.rainTimer = 0;

      this.initResize();
      this.initEvents();
      this.updateMenuStats();

      // Start rendering loop
      requestAnimationFrame((t) => this.loop(t));
    }

    initResize() {
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = CONFIG.CANVAS_WIDTH * dpr;
        this.canvas.height = CONFIG.CANVAS_HEIGHT * dpr;
        this.ctx.scale(dpr, dpr);
      };
      window.addEventListener('resize', resize);
      resize();
    }

    initEvents() {
      // Button listeners
      this.btnStart.addEventListener('click', () => {
        this.sound.unlock();
        this.startCountdown();
      });

      this.btnRestart.addEventListener('click', () => {
        this.sound.unlock();
        this.startCountdown();
      });

      this.btnToMenu.addEventListener('click', () => {
        this.state = 'MENU';
        this.gameoverScreen.classList.add('hidden');
        this.gameoverScreen.classList.remove('active');
        this.menuScreen.classList.remove('hidden');
        this.menuScreen.classList.add('active');
        this.updateMenuStats();
      });

      this.btnSound.addEventListener('click', () => {
        const nextMute = !this.sound.isMuted;
        this.sound.setMute(nextMute);
        this.btnSound.textContent = nextMute ? '🔇' : '🔊';
      });
      this.btnSound.textContent = this.sound.isMuted ? '🔇' : '🔊';

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        this.keys[e.code] = true;
        if (e.code === 'Space') {
          this.activateTurbo();
        }
        if (e.code === 'KeyP' || e.code === 'Escape') {
          this.togglePause();
        }
        if (e.code === 'KeyM') {
          this.btnSound.click();
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;
      });

      // Touch Controls (One-thumb left/right steering, double-tap turbo)
      const container = document.getElementById('game-container');
      container.addEventListener('pointerdown', (e) => {
        this.sound.unlock();
        if (this.state !== 'PLAYING') return;

        const rect = this.canvas.getBoundingClientRect();
        const touchX = e.clientX - rect.left;
        const now = performance.now();

        if (now - this.lastTapTime < 280) {
          this.activateTurbo();
        }
        this.lastTapTime = now;

        if (touchX < rect.width * 0.5) {
          this.touchLeft = true;
        } else {
          this.touchRight = true;
        }
      });

      window.addEventListener('pointerup', () => {
        this.touchLeft = false;
        this.touchRight = false;
      });

      window.addEventListener('pointercancel', () => {
        this.touchLeft = false;
        this.touchRight = false;
      });

      // Tab visibility pause
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.state === 'PLAYING') {
          this.togglePause(true);
        }
      });
    }

    updateMenuStats() {
      const best = localStorage.getItem(CONFIG.STORAGE_KEY) || 0;
      const totalNM = localStorage.getItem(CONFIG.STORAGE_TOTAL_NM) || 0;
      this.menuHighscore.textContent = Number(best).toLocaleString();
      this.menuTotalNM.textContent = Number(totalNM).toLocaleString();
    }

    startCountdown() {
      this.menuScreen.classList.add('hidden');
      this.menuScreen.classList.remove('active');
      this.gameoverScreen.classList.add('hidden');
      this.gameoverScreen.classList.remove('active');
      this.countdownOverlay.classList.remove('hidden');

      this.resetGameState();
      this.state = 'COUNTDOWN';
      let count = 3;
      this.countdownText.textContent = count;

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          this.countdownText.textContent = count;
        } else if (count === 0) {
          this.countdownText.textContent = 'GO!';
        } else {
          clearInterval(interval);
          this.countdownOverlay.classList.add('hidden');
          this.state = 'PLAYING';
        }
      }, 700);
    }

    resetGameState() {
      this.score = 0;
      this.distance = 0;
      this.worldSpeed = CONFIG.INITIAL_WORLD_SPEED;
      this.targetWorldSpeed = CONFIG.INITIAL_WORLD_SPEED;
      this.elapsedTime = 0;
      this.difficulty = 1.0;
      this.playerX = CONFIG.CANVAS_WIDTH / 2;
      this.playerVelX = 0;
      this.playerLean = 0;
      this.turboMeter = 0;
      this.isTurbo = false;
      this.turboTimer = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.comboTimer = 0;
      this.sessionNearMisses = 0;
      this.screenShake = 0;
      this.chromaticAberration = 0;
      this.spawnTimer = 0;

      // Clean active traffic & particles
      while (this.activeTraffic.length > 0) {
        this.trafficPool.release(this.activeTraffic.pop());
      }
      while (this.activeParticles.length > 0) {
        this.particlePool.release(this.activeParticles.pop());
      }
      while (this.activeFloatingTexts.length > 0) {
        this.floatingTextPool.release(this.activeFloatingTexts.pop());
      }
    }

    togglePause(forcePause = false) {
      if (this.state === 'PLAYING' || forcePause) {
        this.state = 'PAUSED';
        this.pauseOverlay.classList.remove('hidden');
        this.sound.stopEngine();
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.pauseOverlay.classList.add('hidden');
        this.lastFrameTime = performance.now();
      }
    }

    activateTurbo() {
      if (this.turboMeter >= 100 && !this.isTurbo) {
        this.isTurbo = true;
        this.turboTimer = CONFIG.TURBO_DURATION;
        this.sound.playTurbo();
        this.screenShake = 8;
      }
    }

    // --- GAME LOOP ---
    loop(timestamp) {
      const delta = Math.min((timestamp - this.lastFrameTime) / 1000, 0.05);
      this.lastFrameTime = timestamp;

      if (this.state === 'PLAYING') {
        this.accumulator += delta;
        while (this.accumulator >= this.dtPhysics) {
          this.updatePhysics(this.dtPhysics);
          this.accumulator -= this.dtPhysics;
        }
      }

      this.render();
      requestAnimationFrame((t) => this.loop(t));
    }

    // --- PHYSICS & LOGIC UPDATE ---
    updatePhysics(dt) {
      this.elapsedTime += dt;
      this.difficulty = Math.min(1 + this.elapsedTime / 45, 2.3);

      // Speed progression
      this.targetWorldSpeed = Math.min(CONFIG.INITIAL_WORLD_SPEED + (this.elapsedTime / 10) * CONFIG.SPEED_GROWTH, CONFIG.MAX_WORLD_SPEED);
      let currentSpeed = this.targetWorldSpeed;

      if (this.isTurbo) {
        currentSpeed *= CONFIG.TURBO_MULTIPLIER;
        this.turboTimer -= dt;
        this.turboMeter = (this.turboTimer / CONFIG.TURBO_DURATION) * 100;
        if (this.turboTimer <= 0) {
          this.isTurbo = false;
          this.turboMeter = 0;
        }
      }
      this.worldSpeed += (currentSpeed - this.worldSpeed) * 0.1;

      // Distance & Base Score
      this.distance += (this.worldSpeed * dt) / 10;
      this.score += (this.worldSpeed * dt * (this.isTurbo ? 2 : 1)) / 8;

      // Steering Input
      this.inputSteer = 0;
      if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchLeft) this.inputSteer -= 1;
      if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchRight) this.inputSteer += 1;

      // Lateral Acceleration & Drag
      this.playerVelX += this.inputSteer * CONFIG.ACCEL * dt;
      this.playerVelX *= Math.exp(-CONFIG.DRAG * dt);
      this.playerVelX = Math.max(-CONFIG.MAX_LATERAL_SPEED, Math.min(CONFIG.MAX_LATERAL_SPEED, this.playerVelX));

      this.playerX += this.playerVelX * dt;

      // Boundary clamp (road edges)
      const minX = CONFIG.CANVAS_WIDTH * 0.12;
      const maxX = CONFIG.CANVAS_WIDTH * 0.88;
      if (this.playerX < minX) {
        this.playerX = minX;
        this.playerVelX = 0;
      } else if (this.playerX > maxX) {
        this.playerX = maxX;
        this.playerVelX = 0;
      }

      // Lean calculation
      const targetLean = (-this.playerVelX / CONFIG.MAX_LATERAL_SPEED) * 0.48;
      this.playerLean += (targetLean - this.playerLean) * 0.25;

      // Engine Sound update
      const speedRatio = (this.worldSpeed - CONFIG.INITIAL_WORLD_SPEED) / (CONFIG.MAX_WORLD_SPEED - CONFIG.INITIAL_WORLD_SPEED);
      this.sound.updateEngine(speedRatio, this.isTurbo);

      // Combo decay timer
      if (this.combo > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.combo = 0;
        }
      }

      // Camera Shake & Chromatic Aberration decay
      if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 18);
      if (this.chromaticAberration > 0) this.chromaticAberration = Math.max(0, this.chromaticAberration - dt * 2.5);

      // Spawn traffic waves
      this.updateTrafficSpawning(dt);

      // Update traffic entities & collisions
      this.updateTraffic(dt);

      // Update particles
      this.updateParticles(dt);

      // Update floating texts
      this.updateFloatingTexts(dt);

      // Engine light-trail particles
      if (Math.random() < (this.isTurbo ? 0.9 : 0.4)) {
        this.spawnExhaustParticle();
      }
    }

    updateTrafficSpawning(dt) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTrafficWave();
        const baseInterval = Math.max(0.65, 1.6 / this.difficulty);
        this.spawnTimer = baseInterval * (0.8 + Math.random() * 0.4);
      }
    }

    spawnTrafficWave() {
      const types = ['scooter', 'car', 'truck', 'barrier'];
      const patternRand = Math.random();

      if (patternRand < 0.65) {
        // Single vehicle in random lane
        const lane = Math.floor(Math.random() * CONFIG.LANES);
        const type = types[Math.floor(Math.random() * (types.length - 1))];
        this.createTrafficEntity(lane, type);
      } else if (patternRand < 0.88) {
        // Double vehicle leaving 1 escape gap
        const freeLane = Math.floor(Math.random() * CONFIG.LANES);
        for (let l = 0; l < CONFIG.LANES; l++) {
          if (l !== freeLane) {
            this.createTrafficEntity(l, 'scooter');
          }
        }
      } else {
        // Moving barrier or truck
        const lane = Math.floor(Math.random() * 2);
        this.createTrafficEntity(lane, 'truck');
      }
    }

    createTrafficEntity(lane, type) {
      const t = this.trafficPool.get();
      t.lane = lane;
      t.type = type;
      t.nearMissTriggered = false;

      // Calculate initial X based on horizon lane position
      t.x = this.getLaneXAt(lane, CONFIG.HORIZON_Y);
      t.y = CONFIG.CANVAS_HEIGHT * CONFIG.HORIZON_Y;

      // Speed relative to world speed (0.45 to 0.75x)
      const speedMult = type === 'truck' ? 0.45 : type === 'barrier' ? 0.35 : 0.65;
      t.speed = this.worldSpeed * speedMult;

      if (type === 'scooter') {
        t.width = 24;
        t.height = 48;
        t.color = '#ff2fb9';
      } else if (type === 'car') {
        t.width = 38;
        t.height = 70;
        t.color = '#00f0ff';
      } else if (type === 'truck') {
        t.width = 54;
        t.height = 110;
        t.color = '#ffb800';
      } else if (type === 'barrier') {
        t.width = 44;
        t.height = 28;
        t.color = '#ff3366';
      }

      this.activeTraffic.push(t);
    }

    getLaneXAt(lane, normY) {
      const progress = (normY - CONFIG.HORIZON_Y) / (1.0 - CONFIG.HORIZON_Y);
      const roadWidth = (CONFIG.CANVAS_WIDTH * 0.3) + progress * (CONFIG.CANVAS_WIDTH * 0.6);
      const roadLeft = (CONFIG.CANVAS_WIDTH - roadWidth) / 2;
      const laneStep = roadWidth / CONFIG.LANES;
      return roadLeft + laneStep * (lane + 0.5);
    }

    updateTraffic(dt) {
      const playerY = CONFIG.CANVAS_HEIGHT * CONFIG.PLAYER_Y;
      const playerBox = {
        x: this.playerX,
        y: playerY,
        r: CONFIG.PLAYER_RADIUS
      };

      for (let i = this.activeTraffic.length - 1; i >= 0; i--) {
        const t = this.activeTraffic[i];

        // Move down towards player as player is moving faster
        const relativeSpeed = this.worldSpeed - t.speed;
        t.y += relativeSpeed * dt;

        // Dynamic perspective scaling & lane positioning
        const normY = t.y / CONFIG.CANVAS_HEIGHT;
        const laneCenterX = this.getLaneXAt(t.lane, normY);
        t.x += (laneCenterX - t.x) * 0.15;

        // Perspective scale factor
        const scale = 0.4 + 0.6 * Math.max(0, normY);
        const w = t.width * scale;
        const h = t.height * scale;

        // Collision Box (12% fair reduction)
        const hitW = w * 0.88;
        const hitH = h * 0.88;
        const hitLeft = t.x - hitW / 2;
        const hitRight = t.x + hitW / 2;
        const hitTop = t.y - hitH / 2;
        const hitBottom = t.y + hitH / 2;

        // Distance from player center to vehicle bounding box
        const closestX = Math.max(hitLeft, Math.min(playerBox.x, hitRight));
        const closestY = Math.max(hitTop, Math.min(playerBox.y, hitBottom));
        const dx = playerBox.x - closestX;
        const dy = playerBox.y - closestY;
        const distSq = dx * dx + dy * dy;

        // 1. Check Collision
        if (distSq < playerBox.r * playerBox.r) {
          if (this.isTurbo) {
            // Turbo destruction mode (photon smash)
            this.activeTraffic.splice(i, 1);
            this.trafficPool.release(t);
            this.spawnExplosion(t.x, t.y, '#00f0ff', 24);
            this.score += 200;
            this.addFloatingText('+200 PHOTON KILL', t.x, t.y, '#00f0ff');
            this.sound.playNearMiss(10);
            continue;
          } else {
            // Fatal Crash
            this.triggerGameOver();
            return;
          }
        }

        // 2. Check Near-Miss (within distance, vehicle passing player without hit)
        const edgeDist = Math.sqrt(distSq) - playerBox.r;
        if (!t.nearMissTriggered && edgeDist <= CONFIG.NEAR_MISS_DISTANCE && t.y > playerY - 30 && t.y < playerY + 50) {
          t.nearMissTriggered = true;
          this.triggerNearMiss(t.x, t.y);
        }

        // Remove off-screen
        if (t.y > CONFIG.CANVAS_HEIGHT + 100) {
          this.activeTraffic.splice(i, 1);
          this.trafficPool.release(t);
        }
      }
    }

    triggerNearMiss(x, y) {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.comboTimer = CONFIG.COMBO_TIMEOUT;
      this.sessionNearMisses++;

      const comboMult = 1 + Math.min(7, Math.floor(this.combo / 5));
      const points = 50 * comboMult;
      this.score += points;

      // Recharge Turbo meter
      this.turboMeter = Math.min(100, this.turboMeter + 16);

      // Effects
      this.sound.playNearMiss(this.combo);
      this.addFloatingText(`+${points} NEAR-MISS x${comboMult}`, x, y - 20, '#ffb800');
      this.spawnExplosion(x, y, '#ffb800', 8);

      if (this.combo >= 8) {
        this.chromaticAberration = 3.5;
      }
    }

    triggerGameOver() {
      this.state = 'GAMEOVER';
      this.sound.playCrash();
      this.sound.stopEngine();
      this.screenShake = 16;
      this.spawnExplosion(this.playerX, CONFIG.CANVAS_HEIGHT * CONFIG.PLAYER_Y, '#ff3366', 45);

      const finalScore = Math.floor(this.score);
      const highscore = Number(localStorage.getItem(CONFIG.STORAGE_KEY) || 0);
      if (finalScore > highscore) {
        localStorage.setItem(CONFIG.STORAGE_KEY, finalScore);
      }

      const totalNM = Number(localStorage.getItem(CONFIG.STORAGE_TOTAL_NM) || 0) + this.sessionNearMisses;
      localStorage.setItem(CONFIG.STORAGE_TOTAL_NM, totalNM);

      // Populate Game Over modal
      this.goScore.textContent = finalScore.toLocaleString();
      this.goDistance.textContent = `${Math.floor(this.distance)}m`;
      this.goNearmiss.textContent = this.sessionNearMisses;
      this.goMaxCombo.textContent = `x${this.maxCombo}`;
      this.goBest.textContent = Math.max(finalScore, highscore).toLocaleString();

      // Medal check
      this.medalBadge.className = 'medal-badge';
      if (finalScore < 2000) {
        this.medalBadge.classList.add('medal-bronze');
        this.medalBadge.textContent = 'ĐỒNG';
      } else if (finalScore < 6000) {
        this.medalBadge.classList.add('medal-silver');
        this.medalBadge.textContent = 'BẠC';
      } else if (finalScore < 15000) {
        this.medalBadge.classList.add('medal-gold');
        this.medalBadge.textContent = 'VÀNG';
      } else {
        this.medalBadge.classList.add('medal-diamond');
        this.medalBadge.textContent = 'KIM CƯƠNG';
      }

      setTimeout(() => {
        this.gameoverScreen.classList.remove('hidden');
        this.gameoverScreen.classList.add('active');
      }, 500);
    }

    // --- PARTICLES & VFX ---
    spawnExhaustParticle() {
      const p = this.particlePool.get();
      p.x = this.playerX + (Math.random() * 8 - 4);
      p.y = CONFIG.CANVAS_HEIGHT * CONFIG.PLAYER_Y + 24;
      p.vx = (Math.random() * 40 - 20) - this.playerVelX * 0.15;
      p.vy = 80 + Math.random() * 100;
      p.color = this.isTurbo ? '#00f0ff' : '#ff2fb9';
      p.size = this.isTurbo ? 3.5 : 2.2;
      p.alpha = 1;
      p.life = 0.35;
      p.maxLife = 0.35;
      this.activeParticles.push(p);
    }

    spawnExplosion(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        const p = this.particlePool.get();
        p.x = x;
        p.y = y;
        const angle = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 180;
        p.vx = Math.cos(angle) * spd;
        p.vy = Math.sin(angle) * spd;
        p.color = color;
        p.size = 2 + Math.random() * 3.5;
        p.alpha = 1;
        p.life = 0.5 + Math.random() * 0.3;
        p.maxLife = p.life;
        this.activeParticles.push(p);
      }
    }

    updateParticles(dt) {
      for (let i = this.activeParticles.length - 1; i >= 0; i--) {
        const p = this.activeParticles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          this.activeParticles.splice(i, 1);
          this.particlePool.release(p);
        }
      }
    }

    addFloatingText(text, x, y, color) {
      const ft = this.floatingTextPool.get();
      ft.x = x;
      ft.y = y;
      ft.text = text;
      ft.color = color;
      ft.alpha = 1;
      ft.life = 0.85;
      this.activeFloatingTexts.push(ft);
    }

    updateFloatingTexts(dt) {
      for (let i = this.activeFloatingTexts.length - 1; i >= 0; i--) {
        const ft = this.activeFloatingTexts[i];
        ft.y -= 45 * dt;
        ft.life -= dt;
        ft.alpha = Math.max(0, ft.life / 0.85);

        if (ft.life <= 0) {
          this.activeFloatingTexts.splice(i, 1);
          this.floatingTextPool.release(ft);
        }
      }
    }

    // --- RENDERING PIPELINE ---
    render() {
      const ctx = this.ctx;
      ctx.save();

      // Screen Shake
      if (this.screenShake > 0) {
        const sx = (Math.random() * 2 - 1) * this.screenShake;
        const sy = (Math.random() * 2 - 1) * this.screenShake;
        ctx.translate(sx, sy);
      }

      // Background Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT * CONFIG.HORIZON_Y);
      skyGrad.addColorStop(0, '#0a0618');
      skyGrad.addColorStop(1, '#1a0b2e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

      // Layer 1: Parallax Skyline Silhouette & Ben Thanh Tower
      this.renderCyberpunkSkyline(ctx);

      // Layer 2: Neon Highway Perspective Floor & Grid
      this.renderNeonHighway(ctx);

      // Layer 3: Traffic Entities
      this.renderTrafficEntities(ctx);

      // Layer 4: Player Xe Om & Underglow
      if (this.state !== 'GAMEOVER') {
        this.renderPlayer(ctx);
      }

      // Layer 5: VFX Particles & Floating Texts
      this.renderParticles(ctx);
      this.renderFloatingTexts(ctx);

      // Layer 6: Speedlines when Turbo
      if (this.isTurbo) {
        this.renderSpeedLines(ctx);
      }

      // Layer 7: HUD Canvas Overlay
      if (this.state === 'PLAYING' || this.state === 'COUNTDOWN' || this.state === 'PAUSED') {
        this.renderHUD(ctx);
      }

      // Chromatic Aberration Post-Processing (Fast Pseudo-RGB Split)
      if (this.chromaticAberration > 0.5) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 0, 120, 0.15)';
        ctx.fillRect(-2, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.fillRect(2, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.restore();
    }

    renderCyberpunkSkyline(ctx) {
      const horizonY = CONFIG.CANVAS_HEIGHT * CONFIG.HORIZON_Y;
      ctx.save();

      // Distant Towers
      ctx.fillStyle = '#120826';
      ctx.fillRect(20, horizonY - 55, 35, 55);
      ctx.fillRect(75, horizonY - 80, 45, 80);
      ctx.fillRect(145, horizonY - 45, 30, 45);
      ctx.fillRect(270, horizonY - 95, 50, 95);
      ctx.fillRect(340, horizonY - 60, 40, 60);

      // Bitexco silhouette style spike
      ctx.beginPath();
      ctx.moveTo(375, horizonY);
      ctx.lineTo(395, horizonY - 110);
      ctx.lineTo(415, horizonY);
      ctx.closePath();
      ctx.fillStyle = '#0f0520';
      ctx.fill();

      // Ben Thanh Market Flying Roof Silhouette
      ctx.beginPath();
      ctx.moveTo(185, horizonY);
      ctx.lineTo(195, horizonY - 30);
      ctx.lineTo(245, horizonY - 30);
      ctx.lineTo(255, horizonY);
      ctx.closePath();
      ctx.fillStyle = '#1f0d3d';
      ctx.fill();

      // Neon Billboards
      ctx.font = 'bold 9px system-ui';
      ctx.fillStyle = '#ff2fb9';
      ctx.shadowColor = '#ff2fb9';
      ctx.shadowBlur = 6;
      ctx.fillText('PHỞ 24/7', 82, horizonY - 62);

      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.fillText('CÀ PHÊ MŨ', 276, horizonY - 78);
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    renderNeonHighway(ctx) {
      const horizonY = CONFIG.CANVAS_HEIGHT * CONFIG.HORIZON_Y;
      const bottomY = CONFIG.CANVAS_HEIGHT;

      ctx.save();
      // Ground plane gradient
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, bottomY);
      groundGrad.addColorStop(0, '#0f0724');
      groundGrad.addColorStop(1, '#05020a');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, CONFIG.CANVAS_WIDTH, bottomY - horizonY);

      // Road Trapezoid
      const topWidth = CONFIG.CANVAS_WIDTH * 0.28;
      const botWidth = CONFIG.CANVAS_WIDTH * 0.88;
      const topLeft = (CONFIG.CANVAS_WIDTH - topWidth) / 2;
      const topRight = topLeft + topWidth;
      const botLeft = (CONFIG.CANVAS_WIDTH - botWidth) / 2;
      const botRight = botLeft + botWidth;

      ctx.beginPath();
      ctx.moveTo(topLeft, horizonY);
      ctx.lineTo(topRight, horizonY);
      ctx.lineTo(botRight, bottomY);
      ctx.lineTo(botLeft, bottomY);
      ctx.closePath();
      ctx.fillStyle = '#090414';
      ctx.fill();

      // Outer Neon Road Edges
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(topLeft, horizonY);
      ctx.lineTo(botLeft, bottomY);
      ctx.moveTo(topRight, horizonY);
      ctx.lineTo(botRight, bottomY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Animated Longitudinal Grid lines (moving toward camera)
      this.roadScrollY = (this.roadScrollY + this.worldSpeed * 0.002) % 1.0;
      const numLines = 9;
      ctx.strokeStyle = 'rgba(255, 47, 185, 0.4)';
      ctx.lineWidth = 1.5;

      for (let i = 0; i < numLines; i++) {
        const t = ((i / numLines) + this.roadScrollY) % 1.0;
        // Non-linear perspective spacing
        const y = horizonY + Math.pow(t, 2.2) * (bottomY - horizonY);
        const w = topWidth + Math.pow(t, 2.2) * (botWidth - topWidth);
        const x1 = (CONFIG.CANVAS_WIDTH - w) / 2;
        const x2 = x1 + w;

        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }

      // Lane dividers (dashed lines)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.setLineDash([12, 16]);
      for (let l = 1; l < CONFIG.LANES; l++) {
        const topLaneX = topLeft + (topWidth / CONFIG.LANES) * l;
        const botLaneX = botLeft + (botWidth / CONFIG.LANES) * l;
        ctx.beginPath();
        ctx.moveTo(topLaneX, horizonY);
        ctx.lineTo(botLaneX, bottomY);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    renderPlayer(ctx) {
      const y = CONFIG.CANVAS_HEIGHT * CONFIG.PLAYER_Y;
      const x = this.playerX;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(this.playerLean);

      // Underglow Neon Shadow
      ctx.fillStyle = this.isTurbo ? '#00f0ff' : '#ff2fb9';
      ctx.shadowColor = this.isTurbo ? '#00f0ff' : '#ff2fb9';
      ctx.shadowBlur = this.isTurbo ? 25 : 15;
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Xe Ôm Cyber Body
      ctx.fillStyle = '#1b1b2f';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-10, -22, 20, 44, 6);
      ctx.fill();
      ctx.stroke();

      // Driver Helmet (Neon Amber visor)
      ctx.fillStyle = '#0a0618';
      ctx.beginPath();
      ctx.arc(0, -2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffb800';
      ctx.fillRect(-5, -6, 10, 3);

      // Rear Passenger seat / Delivery thermal box ('XE ÔM')
      ctx.fillStyle = '#ff2fb9';
      ctx.fillRect(-7, 7, 14, 12);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('2087', 0, 16);

      // Front Headlight Beam
      const beamGrad = ctx.createLinearGradient(0, -24, 0, -110);
      beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-6, -22);
      ctx.lineTo(-30, -110);
      ctx.lineTo(30, -110);
      ctx.lineTo(6, -22);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    renderTrafficEntities(ctx) {
      for (const t of this.activeTraffic) {
        const normY = t.y / CONFIG.CANVAS_HEIGHT;
        const scale = 0.4 + 0.6 * Math.max(0, normY);
        const w = t.width * scale;
        const h = t.height * scale;

        ctx.save();
        ctx.translate(t.x, t.y);

        // Shadow & Underglow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 3, w * 0.6, h * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = t.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#161226';
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 4 * scale);
        ctx.fill();
        ctx.stroke();

        // Tail Lights (facing player)
        ctx.fillStyle = '#ff3366';
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 6;
        ctx.fillRect(-w * 0.35, h * 0.35, w * 0.25, h * 0.1);
        ctx.fillRect(w * 0.1, h * 0.35, w * 0.25, h * 0.1);

        ctx.restore();
      }
    }

    renderParticles(ctx) {
      for (const p of this.activeParticles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    renderFloatingTexts(ctx) {
      for (const ft of this.activeFloatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = '900 13px system-ui';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }
    }

    renderSpeedLines(ctx) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        const x = Math.random() * CONFIG.CANVAS_WIDTH;
        const y = Math.random() * CONFIG.CANVAS_HEIGHT;
        const len = 40 + Math.random() * 80;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + len);
        ctx.stroke();
      }
      ctx.restore();
    }

    renderHUD(ctx) {
      ctx.save();

      // Top Left Score
      ctx.textAlign = 'left';
      ctx.font = '900 20px system-ui';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.fillText(Math.floor(this.score).toLocaleString(), 18, 36);

      ctx.font = '700 11px system-ui';
      ctx.fillStyle = '#a09cb0';
      ctx.shadowBlur = 0;
      ctx.fillText(`CỰ LY: ${Math.floor(this.distance)}m`, 18, 52);

      // Top Right Speed Indicator
      ctx.textAlign = 'right';
      const speedKmH = Math.floor(this.worldSpeed / 3.2);
      ctx.font = '900 18px system-ui';
      ctx.fillStyle = this.isTurbo ? '#39ff88' : '#ffb800';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 6;
      ctx.fillText(`${speedKmH} KM/H`, CONFIG.CANVAS_WIDTH - 18, 36);

      if (this.combo > 1) {
        ctx.font = '800 13px system-ui';
        ctx.fillStyle = '#ff2fb9';
        ctx.shadowColor = '#ff2fb9';
        ctx.shadowBlur = 6;
        ctx.fillText(`COMBO x${this.combo}`, CONFIG.CANVAS_WIDTH - 18, 54);
      }

      // Bottom Turbo Meter Bar
      const meterW = CONFIG.CANVAS_WIDTH - 48;
      const meterH = 12;
      const meterX = 24;
      const meterY = CONFIG.CANVAS_HEIGHT - 26;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(meterX, meterY, meterW, meterH, 6);
      ctx.fill();

      const fillW = (meterW * Math.min(100, this.turboMeter)) / 100;
      if (fillW > 0) {
        const grad = ctx.createLinearGradient(meterX, 0, meterX + meterW, 0);
        grad.addColorStop(0, '#ff2fb9');
        grad.addColorStop(1, '#ffb800');
        ctx.fillStyle = grad;
        ctx.shadowColor = this.turboMeter >= 100 ? '#ffb800' : '#ff2fb9';
        ctx.shadowBlur = this.turboMeter >= 100 ? 12 : 4;
        ctx.beginPath();
        ctx.roundRect(meterX, meterY, fillW, meterH, 6);
        ctx.fill();
      }

      if (this.turboMeter >= 100 && !this.isTurbo) {
        ctx.textAlign = 'center';
        ctx.font = 'bold 9px system-ui';
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.fillText('⚡ TURBO SẴN SÀNG (NHẤN ĐÚP / SPACE)', CONFIG.CANVAS_WIDTH / 2, meterY - 6);
      }

      ctx.restore();
    }
  }

  // Auto initialize on DOMContentLoaded
  window.addEventListener('DOMContentLoaded', () => {
    new NeonXeOmGame();
  });
})();
