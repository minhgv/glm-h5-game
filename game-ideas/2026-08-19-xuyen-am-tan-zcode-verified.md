# Resonance Drift

- **Date:** 2026-08-19 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `resonance-drift` — target folder `games/resonance-drift/`
- **Genre:** Arcade rhythm-survival one-thumb — 'theremin' pitch control: slide a plasma orb's frequency to phase through oncoming resonance gates.
- **Pitch:** You don't jump, you don't shoot — you TUNE. Hold to slide the plasma orb up the scale, release to let it fall; match the frequency of the resonance gate rocketing toward you to phase through it like a ghost. Every clean phase is a note in a melody you are composing — miss the note and you burst in a firework of light.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Xuyên Âm Tần".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Resonance Drift — an H5 arcade rhythm-survival game that meets this
repo's shipping bar: games/resonance-drift/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: the signature FREQUENCY-PHASING mechanic
— the player tunes a plasma orb's pitch with real procedural audio (WebAudio is
the GAMEPLAY MECHANIC, not decoration) to phase through resonance gates. All UI
copy in English, served from an STR i18n table with reserved 'vi'/'lo' slots
(pattern: games/gravity-juggle) so the game ships multi-language-ready.
Commercial bar: playable read in 3 s (no tutorial text — the first touch
teaches), mastery in 30 min, conquest in 30 h; average session ≥ 4 min;
tilt-retry < 2 s after death. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'RESONANCE-DRIFT READY' only when FINAL
ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/resonance-drift/ from templates/game-starter/ via /game:new
  resonance-drift. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: 1920x1080 logical, HiDPI scale by devicePixelRatio (cap 2.0),
  responsive letterbox fit-scale; set transform once per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  HOLD = pitch slides UP, RELEASE = pitch falls DOWN (formulas in Blueprint);
  input → world response within the same logic step, no delayed buffering.
  touch-action: none on canvas.
- Core loop complete: gate spawning, 3 judgment windows (PERFECT / PASS /
  DEAD), base score, restart ≤ 2 s.
- Debug overlay on ?debug=1: FPS, frame-time p99, step count, pitch cents.
- Determinism: fixed-step sim; gameplay logic never reads Date.now()/
  performance.now() (only RAF does). Same input seed → identical trajectory.
- All randomness through engine/rng.js createRng(seed). No Math.random() in
  gameplay code.
- C1: (1) full 5-minute loop with zero crashes; (2) same seed → same
  trajectory 100%; (3) logic step measured ≈ 8.33 ms, no time-of-day reads;
  (4) 60 fps desktop.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 pre-allocated, SoA layout (Float32Array x/y/vx/vy/
  life/size/hueIdx), swap-remove on death — NO new/[] literals in the loop.
  Follow engine/particles.js pool semantics.
- Juice: trauma-model screen shake — shake = trauma², offset = shake x 14 px x
  perlin-noise(t), decay 1.4/s; trauma += 0.4 on PERFECT, += 1.0 on DEAD.
  Hitstop freeze-frames: PERFECT = 40 ms; NEAR-MISS = 90 ms + timeScale 0.3x
  for 140 ms; DEAD = 220 ms (juice timers run on a separate clock so
  interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted. Master never starts > 0.5. Audio-reactive core: the orb's drone
  always sounds at the CURRENT pitch — the player HEARS which frequency
  they're on; each gate hums its exact target frequency — match by ear = match
  by eye = match by color.
- Trail: 24-point ribbon on the orb, drawn as one gradient path; background =
  2-layer parallax pre-rendered offscreen tiles that pulse with the current
  gain envelope.
- Full synth spec in TECHNICAL BLUEPRINT; all audio nodes created ONCE at
  unlock and reused; NO node creation inside RAF.
- C2: (1) the 8-feel checklist passes: weight / anticipation / impact /
  recovery / audio-visual sync / readability / escalation / tilt-retry;
  (2) 60 fps with 300 particles + shake + full audio; (3) network panel shows
  zero requests beyond the document; (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend; resume
  resets the accumulator (NO fast-forward catch-up for hidden-tab time —
  anti-cheat + anti-jank); loop.js stall clamp (250 ms) guards time jumps.
- Saves via engine/storage.js createStorage('resonance-drift', 1, defaults,
  migrate): schema v1 = { best, runs, totalScore, muted, cal, lang }. try/catch
  tolerant to quota/serialization/corrupt storage; migration hook wired. Never
  raw localStorage.
- Near-miss hitbox −20%: fatal collision radius = r x 0.8; passing through the
  'near-death' band (between the pass-window and the dead-window) triggers
  NEAR MISS: +bonus, slow-mo, screen-rim flash.
- Instant replay < 150 ms: ring buffer of 90 snapshots (3 s @ 30 Hz) holding
  {orbY, pitch, gateOffset, coarseParticles}, allocated once at boot; on death
  the replay starts at most 150 ms after impact: final 1.2 s at 0.5x speed
  with desaturate overlay + cents-deviation readout; tap-to-skip → results
  screen within 60 ms.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth. Score buffer as integers only; preallocated typed arrays.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics (accumulator reset, no catch-up);
  (2) replay starts ≤ 150 ms after impact, results ≤ 60 ms after skip;
  (3) profiler shows zero RAF allocations; (4) storage survives a corrupt
  payload; (5) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/resonance-drift/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only (all graphics Canvas2D at runtime,
   all sound from OscillatorNode/noise buffers, system font stack), total
   payload ≤ 5 MB. Ships README.md (how to run, controls, tuning table) +
   GDD.md from docs/game-design-template.md.
2. 60 fps locked: Chrome DevTools 4x CPU throttle on a mid-range phone — no
   frame > 20 ms (including 300 particles + shake + replay); internal frame
   budget render ≤ 6 ms, logic ≤ 2 ms, audio param ≤ 1 ms.
3. Zero GC in RAF steady state (allocations allowed only at boot/state change).
4. One-thumb fully playable: touch-action none, touch → visual ≤ 1 frame,
   touch → audio ≤ 20 ms, scroll/zoom/double-tap-zoom fully blocked; portrait
   + landscape, min viewport 320 px.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Determinism: fixed-step + no wall-clock in logic; the replay ring buffer
   reproduces the run frame-for-frame.
7. Console self-test: C1/C2/C3 all PASS + 'RESONANCE-DRIFT READY'.
8. Definition of done: /game:qa resonance-drift against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         RESONANCE DRIFT
  bootTap       TAP TO START
  tut0          HOLD TO RISE — RELEASE TO FALL
  tut1          MATCH THE GATE'S PITCH TO PHASE THROUGH
  judgePerfect  PERFECT      judgePass PASS      judgeDead DEAD
  nearMiss      NEAR MISS!
  scoreCap      SCORE      bestCap BEST      comboCap COMBO
  flowCap       FLOW x1.5
  shieldCap     SHIELD
  hudHint       FREQUENCY
  replayCap     REPLAY      replaySkip TAP TO SKIP
  muteOn        SOUND ON    muteOff SOUND OFF
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette — 'Boundless Frequency': bg vertical gradient #060913 → #0D1B2A;
  2-layer starfield parallax at alpha 0.35/0.6 pre-rendered offscreen.
  Frequency→color mapping is core feedback: pitch s ∈ [0,1] → hue =
  190 + 170·s, i.e. cyan #00E5FF → violet #7B2EFF → pink #FF2E88; saturation
  95%, lightness 60%. Orb glow, gate ring, particles, trail ALL use this exact
  hue → the eye reads frequency as color. As orb and gate hues converge, a
  third sense 'feels' the match coming (anticipation). PERFECT flash: white
  #F8FDFF fast lerp; DEAD: split-complement of the current hue for maximum
  sting. Neon text: 3-layer fillText with decreasing alpha (0.45/0.25/0.1)
  instead of expensive shadowBlur. UI: system-ui, wide tracking, uppercase HUD.
- Physics (fixed-step): pitch integrator s += (held ? +1.35 : −1.90) · dt,
  clamp [0,1] — falling is 40% faster than rising for the familiar
  'release-drop' feel. Frequency: f = 110 · 2^(4s) Hz — a 4-octave exponential
  sweep (A2 → A6, 110 → 1760 Hz) so glides are even in cents (human hearing is
  log-linear). Judgment in cents: c = |1200 · log2(f / f_gate)|; PERFECT:
  c ≤ 45; PASS: c ≤ 140; otherwise DEAD when the gate edge touches the hitbox.
  Gate frequencies quantized to A minor pentatonic {A, C, D, E, G}; random-walk
  ±1..2 scale steps per gate → the gate chain becomes a MELODY good players can
  hum. World speed v = 320 + 42·√score px/s, cap 1200; gate spacing =
  420 + 0.35·v px; difficulty ramp: window starts ±70 cents narrowing to ±45
  over the first 15 gates; every 15 gates adds a DOUBLE-GATE (2 frequencies
  ≤ 0.9 s apart).
- Synth (0 assets): master chain [saw osc @f] + [sine osc @2.01f, gain 0.4] →
  BiquadFilter lowpass (fc = 200 + 4500·s, Q = 6 — the filter opens as pitch
  rises, natural as a singing voice) → GainNode 0.16 → DynamicsCompressor
  (threshold −18 dB, ratio 6) → destination. Frequency set via
  exponentialRampToValueAtTime each step with a small timeConstant (smooth
  glide, zero zipper noise). Gate hum: triangle @f_gate + 5 Hz tremolo LFO
  depth 0.3, gain 0.05, StereoPanner by gate x-position → the ear locates the
  incoming gate. SFX: PERFECT = 3-note pentatonic arpeggio rising (attack 2 ms,
  decay 180 ms, each note +1 scale step per combo → higher combos sing higher);
  NEAR-MISS = 60 Hz sub thump + highpass noise woosh; DEAD = 0.3 s white-noise
  burst + osc pitch-drop 220 → 40 Hz; combo milestone every 8 = octave chime.
  Audio nodes created ONCE at unlock, reused forever; nothing allocated in RAF.
- Scoring & combo: PERFECT +100 · mult · (1 + v/1200), combo += 1; NEAR MISS
  +25 · mult (maintains, does not raise combo); mult = min(8, 1 + floor(combo/
  4)); mismatch/DEAD resets combo to 0. FLOW BONUS x1.5 only when |ds/dt|
  ≥ 0.25 at the moment of phasing (hands are moving) — anti-camping, forces
  fluent play. Shield: every 10 combo earns 1 rescue (smash through a gate by
  force), max 2 banked — a light decision layer for casuals.
- HUD: vertical frequency ruler on the right edge (minimap of all incoming
  gates + current pitch cursor) — guarantees 3-second readability for new
  players.
- State machine: BOOT → TITLE → RUN → REPLAY → RESULTS → RUN; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: logic ≤ 2 ms, render ≤ 6 ms, audio param ≤ 1 ms; replay mode
  shares the exact same render function fed a snapshot instead of world state
  (zero code duplication).
```
