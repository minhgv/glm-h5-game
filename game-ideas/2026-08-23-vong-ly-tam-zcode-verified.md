# CENTRIFUGAL

- **Date:** 2026-08-23 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `centrifugal` — target folder `games/centrifugal/`
- **Genre:** Arcade one-thumb orbital climber — hold to tether and swing around an anchor, release to fling along the tangent, climbing an infinite tower on pure momentum.
- **Pitch:** You are a plasma pellet falling into an infinite neon tower: hold one finger to hook a centrifugal tether and sling yourself between anchors, release within ±12° of the tangent for a Perfect Release, and ride the combo ladder to infinity — one half-second misjudgment and you fall into the void.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Vòng Ly Tâm".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build CENTRIFUGAL — a commercial-grade one-thumb H5 arcade that meets
this repo's shipping bar: games/centrifugal/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. 60 FPS locked on mid-range Chrome Android, short
45–90 s runs, instant restart < 400 ms, Triple-i-mobile juice density (every
input gets audio + visual feedback in < 50 ms). Amateur-vs-studio line:
fixed-step physics determinism, zero-GC render loop, procedural 0-asset
WebAudio, a combo system with depth (Perfect Chain x Grazing x Risk-Reward for
tethering to FARTHER anchors), analytics hooks ready (run_start / run_end /
revive_offer). Retention target: D1 ≥ 35% through a loop where you lose to
player error, never to the game. All UI copy in English, served from an STR
i18n table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so
the game ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order, self-verifying
each loop (C1.x, C2.x, C3.x) before advancing to the next. Log
'CENTRIFUGAL READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/centrifugal/ from templates/game-starter/ via /game:new
  centrifugal. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080-px-wide logical HiDPI, DPR capped 2.0, resize observer, letterbox
  keeps 9:16, ctx.imageSmoothingEnabled = false for procedural UI sprites.
- Sim: engine/loop.js fixed timestep — accumulator, SIM_DT = 1/120 s,
  maxSubSteps 4 (frame dt clamp ≤ 50 ms, surplus discarded, spiral-of-death
  guarded), render(alpha) interpolation. Entities move in update() only;
  render code never mutates state.
- Physics core: free-fall g = 2400 px/s² (+Y down); on Hold: snap the tether
  to the nearest anchor ABOVE within 420 px, converting linear → angular
  speed ω = |v|/r (momentum conserved); in swing only gravity applies torque:
  ω += (g·cos(θ)/r)·dt, damping ω x= (1 − 0.8·dt); on Release:
  v_tangential = ω·r along the tangent vector, |v| preserved.
- Input: engine/input.js unified pointer/touch + keyboard fallback (Pointer
  Events unify touch/mouse/Space); only 2 states (DOWN = attached,
  UP = flung); latency target < 50 ms; block scroll/zoom/long-press
  (touch-action:none, user-select:none, -webkit-touch-callout:none);
  touch-action: none on canvas.
- Camera: follow Y with exp smoothing camY += (targetY − camY)·(1 − e^(−8·dt)).
  Anchor spawning: procedural, vertical spacing 260–340 px, horizontal offset
  ±40% of screen, gap difficulty = 1 − e^(−0.035·height/100).
- All randomness through engine/rng.js createRng(seed). No Math.random() in
  gameplay code.
- C1: (1) a full 60 s loop is playable; (2) death when falling ≥ 1200 px below
  the screen; (3) restart < 400 ms; (4) no jank with 50 anchors on-screen.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: ring buffer of 512 particles as struct-of-arrays (Float32Array
  x/y/vx/vy/life/size/hue), zero alloc in RAF; emits: tether-snap spark
  24 particles, perfect-release burst 48 radial, graze trail 2 particles/frame,
  death shatter 96. Follow engine/particles.js pool semantics.
- Juice: trauma shake (0..1) — shake = trauma², offset = shake x 14 px x
  noise(t·35), decay 1.6/s; add 0.3 on attach, 0.5 on graze, 0.7 on death.
  Hitstop: freeze 45 ms on Perfect Release (+3/5/8/12 ms co-scale by combo
  tier 1–4), 90 ms on death — it lets the player's brain 'photograph' the
  moment (juice timers on a separate clock so interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture (resume inside the gesture), suspend on
  pause, mute state persisted; master gain + WaveShaper soft-clip;
  DynamicsCompressor → destination. Master never starts > 0.5.
- Synth set: bgm = 2-osc drone (sine 55 Hz + triangle 110.07 Hz, beat
  frequency 0.07 Hz) + hi-hat noise bursts on 16th notes when combo ≥ x5;
  SFX pentatonic ladder C-major [C5 523.25, D5 587.33, E5 659.25, G5 783.99,
  A5 880.00] — each attach plays the combo%5 degree, square osc, envelope
  attack 5 ms / decay 180 ms; Perfect Release = 2 sawtooth oscs detuned
  ±12 cents + a pitch rise of +3 semitones; death = glide 220 → 55 Hz
  exponentially over 600 ms + lowpass sweep 8000 → 200 Hz.
- C2: (1) no frame suffers an audio hitch and every SFX is built in < 2 ms;
  (2) 10 consecutive playtest runs confirm the juice makes gameplay feel
  'meatier'; (3) network panel shows zero requests beyond the document;
  (4) audio unlocks on the first gesture, no click-pop;
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + mute; resume via a
  3-2-1 countdown overlay (500 ms per number + tick SFX) so the player can
  re-sync — anti 'resume-death'; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('centrifugal', 1, defaults,
  migrate) (replaces the original 'vlt_' namespace): schema v1 = { bestScore,
  bestCombo, totalRuns, settings { mute, lang } }; try/catch on every
  quota/private-mode failure with graceful defaults; migration hook wired.
  Never raw localStorage.
- Near-miss system: graze hitbox = player hitbox shrunk −20% (14.4 px vs the
  18 px radius) sweeping an outer ring band 30–48 px around hazards; graze
  trigger: +50 pts x multiplier, trauma 0.15, tick SFX 1318.5 Hz (E6), no
  spam — 150 ms cooldown per hazard.
- Instant replay < 150 ms: ring buffer of 3 s of game-state (60 snapshots/s x
  pos/rot of player + anchors + particle meta); on death, replay the 3 s at
  0.5x with a vignette + REPLAY watermark, THEN the death screen; the buffer
  is a pre-allocated Float32Array, circular overwrite.
- Anti-frustration: 'SECOND WIND' revive 1x/run when combo ≥ x8 (checkpoint =
  the highest anchor reached), keeping 50% of the multiplier.
- Anti-GC: no object literals or allocating array methods
  (map/filter/concat/spread), no string concat in the hot path, no closure
  creation in RAF; verify via Chrome Allocation Timeline: heap flat over
  3 minutes.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) killing the tab mid-run → reload without errors; (2) Safari private
  mode OK; (3) replay is frame-perfect and starts < 150 ms after death;
  (4) storage survives a corrupt payload; (5) live language switch rebuilds
  all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/centrifugal/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, zero external assets (visuals = canvas path + gradients,
   audio = WebAudio oscillators/noise buffers), total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: JS budget ≤ 8 ms/frame (performance.now inside RAF, a
   self-instrumented FPS counter via ?debug=1), no frame > 20 ms in a standard
   5-minute run; frame p99 ≤ 20 ms; ≥ 58 fps worst-case (50 anchors + full
   particles + replay recording).
3. Zero GC in RAF steady state (allocations allowed only at boot/state
   change): heap flat across a 3-minute allocation timeline.
4. One-thumb fully playable: input latency < 50 ms, touch-action none,
   scroll/zoom/double-tap-zoom fully blocked, all hit targets ≥ 48 px.
5. Physics determinism: the same input seed → the same trajectory (fixed-step
   guarantees replays match).
6. UX: first-meaningful-play < 3 s from load (no deep menus), death → restart
   < 400 ms.
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'CENTRIFUGAL READY'.
9. Definition of done: /game:qa centrifugal against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         CENTRIFUGAL
  bootTap       TAP TO START
  tut0          HOLD TO TETHER — RELEASE TO SLING
  tut1          RELEASE WITHIN ±12° FOR A PERFECT RELEASE
  tut2          GRAZE THE LASERS — RIDE THE MULTIPLIER
  scoreCap      SCORE      bestCap BEST      comboCap COMBO      heightCap HEIGHT
  perfectCap    PERFECT!   grazeCap GRAZE!
  secondWindCap SECOND WIND
  readyCap      GET READY
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  soundOn       SOUND ON    soundOff SOUND OFF
  btnRetry      RETRY       btnMenu MENU
  shareHead     CENTRIFUGAL —

=== TECHNICAL BLUEPRINT ===
- Palette: vertical-gradient bg #050816 → #0B1E3A → #122B4F; player plasma
  core radial #FFFFFF → #00F0FF → transparent; anchor ring #FFD166 normal,
  #00F0FF when in range, 2 Hz pulse when it is the nearest target; hazard
  laser #FF2E63 core + #FF8FA3 glow; graze flash #7CFF6B; UI typography
  'Courier New' monospace, tracking +2 px, HUD alpha 0.9; everything on
  additive blend (globalCompositeOperation = 'lighter') for neon depth.
- Combo system: multiplier ladder x1 → x2 → x3 → x5 → x8 (cap), one step per
  consecutive Perfect Release (release within ±12° of the optimal upward
  tangent); reset when: an anchor is missed (no attach within 4 s) or a
  graze-fail; score = height·0.1 + perfect·500·mult + graze·50·mult; the
  multiplier pops scale 1.4 → 1.0 over 200 ms with a chromatic tint per tier
  (tier 1 white, 2 gold, 3 orange, 5 red-orange, 8 electric white-blue).
- Difficulty curve: hazard density 0% (0–2000 px) rising on a logistic curve
  to 45% (12000 px+); anchor spacing widens 260 → 340 px; natural swing speed
  rises as r gets longer → the skill ceiling is reading trajectories several
  rotations ahead.
- Game-feel constants (tuning table): g = 2400, tether_snap_radius = 420,
  release_angle_window = 12°, graze_ring = [30, 48] px, hitbox = 18 px (graze
  14.4 px), trauma_decay = 1.6/s, hitstop_ms = [45, 48, 53, 57] by tier,
  camera_stiffness = 8, sim_hz = 120, replay_seconds = 3, replay_speed = 0.5.
- HUD: score + best, combo multiplier (pop + tint), height meter; state
  machine BOOT → MENU → RUN → REPLAY → GAMEOVER; PAUSE overlay anytime
  (button + visibilitychange).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier; batched
  canvas ops, no redundant state changes between draw calls.
```
