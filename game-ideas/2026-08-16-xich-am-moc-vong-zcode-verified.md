# ECHO HOOK

- **Date:** 2026-08-16 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `echo-hook` — target folder `games/echo-hook/`
- **Genre:** One-thumb arcade physics-swing (portrait) + chain-combo + procedural rhythm scoring.
- **Pitch:** One-thumb neon grappling: throw your energy line to anchors drifting upward and swing a ball of light through the endless night. Every clean hook strikes a pentatonic note — the more skillfully you play, the more you are composing your own rising tune.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Xích Âm: Móc Vọng Cộng Hưởng".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Echo Hook — an H5 arcade one-thumb physics-swing climber that
meets this repo's shipping bar: games/echo-hook/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: tap to hook the nearest anchor above,
swing the orb, release at the right beat — every latch plays a pentatonic
note, so skilled play composes a rising tune. Studio-commercial bar: a 30-
second hook loop for D1 retention, game-feel indistinguishable from a funded
studio product. Three pillars govern every technical decision: responsive
input < 16 ms, readable motion @ 60 fps, addictive 30 s loop. All UI copy in
English, served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. No stubs, no
TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. Per iteration:
BUILD → VERIFY (run that iteration's checklist) → SELF-SCORE each item 0–10;
any item below 9 → patch and repeat the iteration (max 5 cycles) before
advancing. Log 'ECHO-HOOK READY' only when every FINAL ACCEPTANCE criterion
scores 10/10.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/echo-hook/ from templates/game-starter/ via /game:new
  echo-hook. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: logical 1920×1080, HiDPI scale by devicePixelRatio (cap 2.0) with
  safe letterbox; transform set once per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state. At a 30 fps
  fallback the sim stays stable (substeps self-split, no tunneling).
- Input: engine/input.js unified pointer/touch + keyboard fallback — one
  thumb: pointerdown = throw the rope to the nearest anchor above;
  pointerup = release; hold = reel-in. Pointer events + touch-action: none +
  preventDefault + double-tap-zoom blocked.
- Orb: Verlet integration; rigid rope constraint of length L:
  p = anchor + normalize(p − anchor) × L, relaxed 8× per substep.
- Anchors spawn procedurally via engine/rng.js createRng(seed) (seeded
  mulberry32 layout); auto-scroll speed rises over the run. No Math.random()
  in gameplay code.
- C1: (1) physics/render separation holds, step ≈ 8.33 ms ±5%;
  (2) rope constraint never stretches or tunnels at any framerate;
  (3) input→response ≤ 1 frame; (4) 60 fps desktop.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 pre-allocated — zero new in RAF. Follow
  engine/particles.js pool semantics.
- Juice: trauma-based screen shake (shake = trauma², decay 1.8/s, noise
  offset); hitstop timeScale = 0 for 70–120 ms on near-miss/chord events.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination. Master never starts > 0.5.
- Rhythm system (0 assets): latch note = C pentatonic [261.63, 293.66,
  329.63, 392.00, 440.00] Hz — one note per anchor (mapped by anchor color),
  shifted +1 octave every 4 combo (cap +3); voice = triangle osc + sine sub,
  ADSR 5/60/250/180 ms; a lowpass opens 600→1800 Hz as the multiplier grows;
  chain-break percussion = a 0.2 s noise buffer through a bandpass. Haptics
  navigator.vibrate(8) on every latch (feature-detected).
- C2: (1) every latch/chord/break event is audible and correct pitch;
  (2) network panel shows zero requests beyond the document; (3) hitstop and
  shake do not break interpolation; (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document hidden → pause the whole loop + audio.suspend(); on
  resume a 300 ms gain-ramp prevents clipping.
- Saves via engine/storage.js createStorage('echo-hook', 1, defaults,
  migrate): schema v1 = { best, runs, tutorialDone, leaderboard [10],
  settings {muted, lang} }. try/catch tolerant to quota/corrupt storage;
  migration hook wired. Never raw localStorage.
- Near-miss fairness: danger hitbox shrunk 20% vs visual — PERFECT counts
  only when the orb passes through the outer ring without touching the core.
- Instant replay: starts < 150 ms after death — a ring buffer of 540 state
  snapshots (9 s @ 60 Hz, packed Float32Array) plays back at 0.5× speed with
  trail alpha + vignette; tap skips straight to the score card; the whole
  Death → Instant Replay → Score Card transition chain stays < 150 ms.
- Death screen extras: REPLAY NOW (restart < 50 ms) and EXPORT SCORE PNG
  (render a canvas → download).
- Anti-GC: no object/array/closure/string creation on the frame path — pools
  + reused scalars only; verified with Chrome DevTools allocation
  instrumentation.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives
  in STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read
  via t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) replay starts < 150 ms after
  death; (3) storage survives a corrupt payload; (4) profiler shows zero RAF
  allocations; (5) live language switch rebuilds all labels, en table
  complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/echo-hook/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only (all graphics Canvas2D, all audio
   WebAudio node graphs), total payload ≤ 5 MB. Ships README.md (how to run,
   controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked: RAF delta histogram over a 5-minute soak — p95 ≤ 16.7 ms,
   p99 ≤ 33 ms, no frame > 100 ms; physics stable at a 30 fps fallback.
3. Zero GC in RAF steady state (allocation instrumentation clean).
4. One-thumb fully playable: touch-action none, response < 16 ms, every tap
   target ≥ 48 px, scroll/zoom/double-tap fully blocked.
5. Determinism: same seed + same input sequence = same result (verified via
   the replay system).
6. Audio never plays before the first gesture (autoplay policy respected).
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all scored and PASS + 'ECHO-HOOK READY'.
9. Definition of done: /game:qa echo-hook against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         ECHO HOOK
  bootTap       TAP TO START
  tutHook       TAP TO HOOK THE NEAREST ANCHOR — HOLD TO REEL IN
  tutRelease    RELEASE AT THE BEAT TO SWING UPWARD
  scoreCap      SCORE      bestCap BEST      comboCap COMBO
  perfectCap    PERFECT
  chordCap      RESONANCE CHORD
  newBest       NEW BEST!
  replayCap     REPLAY      replaySkip TAP TO SKIP
  btnReplayNow  REPLAY NOW      btnExport EXPORT PNG
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS      runsCap RUNS
  setSound      SOUND

=== TECHNICAL BLUEPRINT ===
- Palette: radial 3-stop background gradient #0B0E1A → #1A1033 → #2D1B4E +
  nebula vignette alpha 0.35; orb core #FFE066, glow #FF6B9D with a 24 px
  blur halo (pre-rendered glow sprite — shadowBlur forbidden in the hot
  loop), pulsing 0.8–1.0 with the beat; rope linear gradient #21D4FD →
  #B537F2 mapped by tension; hazard #FF3B5C with outline #FF8FA3; anchors in
  5 HSL colors (hue 190/265/320/45/110, s90 l60), each color mapping to one
  pentatonic note. System font stack.
- Physics: scale S = canvasHeight/1080; gravity 2200·S px/s²; a latch keeps
  80% of tangential velocity + a 15% boost along the swing direction;
  reel-in 240·S px/s while held; auto-scroll 140 → 420·S px/s (+8% per 10 s,
  smoothstep); anchor spawn — vertical gap 260–420·S, horizontal offset
  within [−0.38, 0.38]×width; the probability of a hazard adjacent to an
  anchor rises with depth tier (0% → 45% cap).
- Combo: chain window 1.8 s; multiplier ×1 → ×8 (+1 every 3 latches);
  PERFECT near-miss +250 points, hitstop, trauma +0.4; a chain of ≥ 4
  same-color anchors triggers a RESONANCE CHORD: a 260·S-radius shockwave
  destroys every hazard, +1000 × multiplier, 60 ms white flash; breaking the
  chain resets the multiplier with a 220→110 Hz pitch-drop over 300 ms.
- Scoring: depth (1 pt/px) + 100 × multiplier per latch + near-miss + chord
  bonuses; local leaderboard top-10.
- Death: the orb falls 120·S px below the viewport bottom; sequence
  Death → Instant Replay → Score Card with total transition overhead
  < 150 ms (replay itself is the buffered 9 s at 0.5×, skippable).
- State machine: BOOT → MENU → RUN → REPLAY → GAMEOVER (→ RUN); PAUSE
  overlay anytime (button + visibilitychange).
- Perf budget: input < 16 ms, JS ≤ 8 ms/frame @DPR2 mid-tier; 512-particle
  pool + 540-snapshot replay buffer allocated once at boot; batched canvas
  ops, no redundant state changes between draw calls.
```
