# Neon Fireflies

- **Date:** 2026-08-20 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `neon-fireflies` — target folder `games/neon-fireflies/`
- **Genre:** Arcade one-thumb grappling-swing infinite climber (Latch-Polarity Swing + rhythm combo + Near-Miss Heat).
- **Pitch:** You are the last firefly of the eternal Lantern Festival: hold your finger to swing yourself around a lantern, release at the exact tangential apex to soar into the endless sky. Every perfect release is a note climbing the pentatonic scale; every graze past the deadly silk is a Near-Miss heartbeat stoking your Overdrive.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Đom Đóm Neon".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Neon Fireflies — an H5 arcade game that meets this repo's shipping
bar: games/neon-fireflies/ static site scaffolded from templates/game-starter/
via /game:new, template engines unmodified, zero build step, zero runtime
network. Core loop: latch-polarity grappling swing (hold to reel around a
lantern, release at the tangent apex) with rhythm combos and Near-Miss Heat.
All UI copy in English, served from an STR i18n table with reserved 'vi'/'lo'
slots (pattern: games/gravity-juggle) so the game ships multi-language-ready.
Five standing pillars: (1) RETENTION — time-to-first-fun < 3 s from first tap,
death→retry in < 400 ms (one tap), target average session ≥ 4 min;
(2) FEEL — swing weight must be heavy and legible: every latch has reel-in
weight, every release has a whoosh (tangent boost), never a floaty drift;
(3) ORIGINALITY — the Latch-Polarity mechanic (you can only latch lanterns of
your CURRENT polarity; polarity flips with each spark collected) creates an
instant routing problem at high speed — this is the gameplay fingerprint, do
not blur it for difficulty; (4) MONETIZATION-READY — the scoring stream
(Perfect chains, Near-Miss Heat, Overdrive x2) and the Daily Seed
(deterministic RNG) must be measurable and surfaced, ready to bolt on a
leaderboard/rewarded ads later without architecture changes; (5) procedural
discipline — every visual Canvas2D, every sound WebAudio synth. No stubs, no
TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'NEON-FIREFLIES READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/neon-fireflies/ from templates/game-starter/ via /game:new
  neon-fireflies. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: 1080x1920 logical design space, responsive letterbox fit-scale, DPR
  clamp ≤ 2 (sharp HiDPI but protects weak mobile GPUs); set transform once per
  resize.
- Sim: engine/loop.js fixed timestep — stepHz 120 (dt = 1/120 s), maxSubSteps 4
  (surplus discarded, spiral-of-death guarded), render(alpha) interpolation for
  perfectly smooth motion at any refresh rate. Entities move in update() only;
  render code never mutates state.
- Input: engine/input.js unified pointer events (touch/mouse/pen) + keyboard
  fallback; whole screen is the touch zone; HOLD = latch the nearest
  same-polarity lantern (auto-selected by score position), RELEASE = fly off
  tangentially. No buttons, no mandatory HUD during play. touch-action: none on
  canvas.
- Scene FSM: BOOT → MENU → RUN → REPLAY → GAMEOVER, zero-allocation state
  transitions.
- Physics blueprint (virtual-px units):
  · Tether pendulum: ω' = ω + (−(g/L)·sin θ)·dt; g = 2200; L shortens while
    held (reel-in): L' = L − 90·dt, floor 210 px → 'the longer you swing, the
    faster you whip'.
  · Tangential release: v = ω·L perpendicular to the radius, +15% impulse if
    released inside the Perfect Window of 12° around the upward tangent apex.
  · Free-fall gravity 2200 px/s², air drag v ×= (1 − 0.9·dt), terminal
    ~2600 px/s.
  · Collision: swept circle-circle (relative motion segment × circle) — no
    tunneling at 120 Hz.
- Lantern spawn director: gap lerp(420 → 680, t/90 s), lantern sine-path
  amplitude grows with altitude, deterministic mulberry32(seed = dailySeed) for
  the Daily Run — via engine/rng.js createRng(dailySeed).
- All randomness through engine/rng.js createRng(seed). No Math.random() in
  gameplay code.
- C1: (1) 60 consecutive seconds playable; (2) scoring/latch works;
  (3) death → retry in < 400 ms; (4) physics/render separation holds at 60 fps.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: full pooling — ParticlePool 512 (ring buffer), TrailPool 64
  firefly points, SparkPool 48, FloatTextPool 24 — all created once at BOOT,
  RAF loop 0 allocations, 0 array.push/grow, 0 new closures. Follow
  engine/particles.js pool semantics.
- Juice: trauma-model screen shake — offset = maxOffset x trauma², decay
  1.6/s, rotational shake ≤ 1.2°. Hitstop timeScale 0 for 90 ms on Near-Miss
  and 140 ms on Perfect chain ≥ 5 (frozen frames = weight; juice timers run on
  a separate clock so interpolation survives). Firefly squash & stretch:
  scale 1.25/0.8 along the velocity direction on latch, recover lerp 8/s.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture (pointerdown), suspend on pause, mute
  state persisted; master chain masterGain → DynamicsCompressor → destination.
  Master never starts > 0.5.
  · Latch = triangle pluck, 220 Hz base, exp decay 0.18 s. Release = whoosh
    (0.4 s noise buffer through bandpass sweep 300 → 2400 Hz). Perfect =
    2-tier fifth chime. Death = saw glissando down 3 semitones + light
    waveshaper distortion.
  · Combo ladder: C#-minor pentatonic scale (C#, E, F#, G#, B) — each Perfect
    chain +1 rung, pitch = base x 2^(n/12) up the scale; a broken chain resets
    to rung 0.
  · Overdrive active: extra 16th-note arpeggio layer with 0.22 s delay
    feedback.
- Palette (brand-locked, do not change): vertical twilight bg #0B1026 →
  #1B1035 → #2E1A47; WARM polarity #FFC94D → #FF4D9D; COOL polarity #3DFFB4 →
  #4DE8FF; player firefly core warm-white #FFF6E0 rimmed in the current
  polarity; deadly silk red #FF3355 alpha 0.9.
- C2: (1) every game event (latch/release/perfect/spark/near-miss/death) has
  ≥ 2 feedback layers (visual + audio, plus shake/haptic navigator.vibrate(8)
  when available); (2) 60 fps with full pools active; (3) network panel shows
  zero requests beyond the document; (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend; resume
  only via an explicit tap (protects the swing rhythm when returning to the
  tab); loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('neon-fireflies', 1, defaults,
  migrate): schema v1 = { best, totalRuns, settings {sfx, haptic, lang},
  dailySeed }. try/catch tolerant to quota/blocking/corrupt storage; migration
  hook wired. Never raw localStorage.
- Near-miss hitbox −20%: fatal hitbox = visualR x 0.80 (player-favoring,
  enterprise courtesy); Near-Miss zone = visualR x 1.35: graze without dying →
  +Heat 12%, Heat 100% = Overdrive 6 s (score x2, arpeggio layer on).
- Instant replay < 150 ms: ring buffer of 9 state snapshots (pos, vel, trail
  segment) @60 Hz, allocated once at boot; on death play back at timeScale
  0.35 with dark vignette + red streak, total duration ≤ 1.2 s before
  GAMEOVER — the player understands WHY they died.
- Resize/orientationchange/safe-area-inset: re-layout letterbox without losing
  the run; block pull-to-refresh and double-tap-zoom (touch-action: none,
  user-select: none).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) kill the app mid-run → relaunch without crash; (2) 10 consecutive
  deaths all get a smooth replay; (3) tab hide/show keeps audio in sync;
  (4) storage survives a corrupt payload; (5) live language switch rebuilds
  all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/neon-fireflies/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: logic + render ≤ 12 ms budget on a mid-range device; dev HUD
   (F3) shows FPS/ms/frame-allocations for self-verification.
3. Zero GC in RAF steady state (allocations allowed only at boot/state change):
   every vector/message/object preallocated at BOOT and reused; no string
   concat, array literal, new closure, or DOM write inside the RAF loop.
4. One-thumb fully playable: coalesced PointerEvents, perceived latency < 1
   frame, a stray tap at the screen edge can never cause an unfair death
   (−20% hitbox guarantees it); touch-action none, scroll/zoom/double-tap-zoom
   fully blocked.
5. Audio: unlocked on the first gesture, no click-pop (envelope attack
   ≥ 5 ms), absolute silence when the tab is hidden.
6. Fairness: every death is visible in the Instant Replay; deterministic RNG
   for the Daily Seed (two players with the same seed see the same layout).
7. Retention loop: death → retry in one tap < 400 ms; BEST and 'X to next
   score milestone' shown on the death screen.
8. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
9. Console self-test: C1/C2/C3 all PASS + 'NEON-FIREFLIES READY'.
10. Definition of done: /game:qa neon-fireflies against
    docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         NEON FIREFLIES
  bootTap       TAP TO START
  tut0          HOLD TO SWING — RELEASE TO FLY
  tut1          MATCH THE LANTERN'S COLOR TO LATCH
  tut2          GRAZE THE SILK — NEVER TOUCH IT
  scoreCap      SCORE      bestCap BEST
  heatCap       HEAT      overdriveCap OVERDRIVE x2
  perfectCap    PERFECT!      nearMissCap NEAR MISS!
  milestone     {n} TO NEXT MILESTONE
  dailyCap      DAILY RUN
  replayCap     WHY YOU DIED      replaySkip TAP TO SKIP
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: bg #0B1026 → #1B1035 → #2E1A47; warm polarity #FFC94D → #FF4D9D;
  cool polarity #3DFFB4 → #4DE8FF; firefly core #FFF6E0; silk #FF3355
  (alpha 0.9).
- Scoring: latch 10 pts, Perfect 25 pts x chain multiplier (1 + 0.25·chain,
  cap x8), spark 5 pts, height tick 1 pt / 40 px, Near-Miss 15 pts. Floating
  text drawn from the pooled FloatTextPool; number grouping follows the active
  locale (en default).
- Difficulty curve: lanternGap = lerp(420, 680, min(1, t/90)); silk-hazard
  density starts at second 20, rate = 0.15 + 0.002·t; lantern sine-path speed
  = 30 + 0.8·t px/s, cap 140.
- Overdrive: Heat +12 per near-miss, −4/s decay; at 100 → 6 s of x2 score and
  Heat resets.
- Trail render: gradient polyline colored by polarity + additive
  globalCompositeOperation 'lighter'; shadowBlur enabled ONLY for the player
  (mobile GPU optimization).
- Architecture: template scaffold (engine/ modules own loop/input/audio/
  storage/rng/particles); gameplay systems as plain objects over preallocated
  SoA arrays (x, y, vx, vy, life… Float32Array) — no class instantiation in
  the gameplay loop.
- Fonts: 'Segoe UI', system-ui, sans-serif — weight 600 for numbers, 800 for
  title; all text Canvas fillText, measureText cached outside RAF.
- State machine: BOOT → MENU → RUN → REPLAY → GAMEOVER; PAUSE overlay anytime
  (button + visibilitychange).
- Perf budget: logic + render ≤ 12 ms on mid-tier; deterministic daily seed
  drives the whole spawn layout.
```
