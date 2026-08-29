# STARLIGHT SWING

- **Date:** 2026-08-14 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `starlight-swing` — target folder `games/starlight-swing/`
- **Genre:** Arcade / physics-swing endless runner (one-touch): pump a banyan-tree swing on a moonlit night, launch between swings, catch stars, dodge branches and drifting lanterns.
- **Pitch:** Pump the swing hanging from the great banyan tree in the moonlit temple yard, arc through the mist to catch falling stars, then land on the next swing down the line — the longer your 'Perfect' streak, the crueler the night wind. One finger, true pendulum physics, 100% procedural sound and graphics.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Đu Sao — Đêm Trăng Cây Đa".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Starlight Swing — an H5 arcade one-touch physics-swing endless
runner that meets this repo's shipping bar: games/starlight-swing/ static site
scaffolded from templates/game-starter/ via /game:new, template engines
unmodified, zero build step, zero runtime network. Core loop: pump the swing in
phase, launch at ≥ 55° amplitude, glide through the night to catch stars and
dodge branches/lanterns, grab the next banyan swing — endless by distance with
a Moon-Phase difficulty system. All UI copy in English, served from an STR
i18n table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the
game ships multi-language-ready. Highscore + best distance persist. No stubs,
no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'STARLIGHT-SWING READY' only when FINAL
ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/starlight-swing/ from templates/game-starter/ via /game:new
  starlight-swing. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Theme/art direction: a Vietnamese village night festival — the great banyan
  tree, temple yard (sân đình), paper lanterns, fireflies, ground mist, a moon
  tracking the real lunar phase. Emotional loop: hold your breath and pump →
  launch in an adrenaline burst → weightless glide → relief on landing →
  instantly want to go farther.
- Stage: portrait-first full-screen canvas (100dvh), responsive letterbox
  fit-scale; HiDPI: canvas.width = viewport x min(DPR, 2); set transform once
  per resize; desktop capped at 560 px wide, centered, with vignette.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- World units: all physics in meters, rendered through a camera scale of
  96 px/m — never compute gameplay in px.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-touch
  model — TAP on the swing = Pump; SWIPE UP on the swing at amplitude ≥ 55° =
  Launch; HOLD in flight = Glide; TAP = start/retry. Reaction-window target
  250–350 ms. touch-action: none on canvas.
- Damped pendulum: θ'' = −(g/L)·sinθ − c·θ' + τ_pump, semi-implicit Euler;
  constants L = 2.6 m, g = 9.81, damping c = 0.06 s⁻¹.
- Pump timing (ω > 0 = forward phase past the bottom of the arc): |θ| ≤ 15° →
  PERFECT, Δω = +0.85 rad/s, +1 streak, text VFX + pentatonic chime;
  15° < |θ| ≤ 35° → GOOD, Δω = +0.45; wrong phase or |θ| > 35° → MISS,
  Δω = −0.30, streak resets. PERFECT window ≥ 180 ms at the starting swing
  frequency (≈ 0.62 Hz).
- Launch: requires |θ| ≥ 55°; a 'LAUNCH!' hint lights up at threshold; release
  velocity v = L·ω along the tangent, momentum conserved on release.
- Flight: gravity 9.81; holding the finger glides (a_y × 0.55, release = free
  fall); air drag 0.02·v²; wind W(t) = 1D smooth noise (cos-interpolated from
  seeded values), amplitude 0 → 6 m/s by Moon Phase, acting both in flight and
  while on the swing.
- Grab assist: the next swing's seat has a grab radius of 1.3 m (15% wider
  than visual — fair, never cheap); entering it auto-snaps with a 120 ms lerp;
  incoming momentum converts into initial ω. A missed grab falls into the mist
  → Game Over → tap to retry within ≤ 400 ms.
- Procedural spacing: banyan gap 55 m → 130 m, height delta ±3 m, density
  follows Moon Phase; run segments run 20–60 s.
- Near-miss: every fatal hitbox is 20% smaller than its visual bounds; passing
  through the near-miss band awards +50, 120 ms slow-mo, whoosh SFX.
- Scoring skeleton: distance = 1 m = 1 point (big center HUD); stars, pump
  streaks and multiplier — full formulas in TECHNICAL BLUEPRINT.
- All randomness through engine/rng.js createRng(seed); wind noise and spawn
  variation draw from it. No Math.random() in gameplay code.
- C1: (1) physics/render separation holds, measured step ≈ 8.33 ms ±5%;
  (2) one-thumb plays smoothly from 320 px to 1920 px wide, no page
  scroll/zoom; (3) PERFECT window measures ≥ 180 ms at first-phase frequency;
  (4) 60 fps desktop.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 300 — stardust burst (12) on star pickup, falling leaves
  (8) on grab, speed-lines when |v| > 14 m/s, shockwave ring on launch, mist
  splash on near-miss. Follow engine/particles.js pool semantics; NO
  new/closures in the hot loop.
- Parallax, 5 layers (0.05/0.12/0.25/0.5/1.0): 140 twinkling stars (sin-phase)
  → far mountain silhouettes → bamboo grove → temple roof/columns/lanterns →
  rolling mist underfoot (sin-scroll, alpha 0.25). Sky/moon/mountains/bamboo
  pre-rendered to an offscreen canvas, redrawn only on resize; twinkling stars
  and fireflies draw live; imageSmoothingEnabled = true, quality 'high'.
- Moon drawn with the correct current phase (procedural gradient + craters),
  brightening toward full.
- Swing & rider: vector subpixel AA — rope in 2 layers (core + glow), wood-
  grain gradient seat, child rider in áo bà ba with legs tucking/stretching
  across 3 procedural keyframes; seat trail ribbon of the last 20 positions,
  gradient alpha with a golden edge.
- Fireflies: 40 pooled sprites, 'lighter' blend, wander steering + sin alpha
  flicker.
- Juice: slow-mo timescale 0.35 for 120 ms on near-miss, ease-out back to 1;
  camera follow lerp 0.08 — zooms out slightly on fast flight, in while
  seated; haptics navigator.vibrate?.(15) on PERFECT streak milestones and on
  grabs (silent-fail).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state persisted;
  master chain masterGain → WaveShaper soft-clip → DynamicsCompressor →
  destination; one shared 1 s white-noise buffer. Master never starts > 0.5.
  Node cap ≤ 12 simultaneous.
- SFX (lazy-inited and reused, never created inside RAF): rope creak =
  sawtooth 80–140 Hz through bandpass Q=8, slow random wobble, gain mapped to
  |ω|; pump grunt = triangle 180→120 Hz, 90 ms + noise burst lowpass 300 Hz,
  gain 0.25; PERFECT chime = FM bell (carrier 880·2^(n/12), mod ratio 2.2,
  index 3) climbing an A-minor pentatonic scale (A C D E G) with the streak;
  MISS = sine 220→160 Hz, 120 ms, slightly sad detune; launch = sine glide
  300→900 Hz, 250 ms + white-noise highpass sweep + shockwave ring; glide wind
  = looped brown-noise buffer, lowpass cutoff mapped to |v|; star pickup =
  sine pluck, 180 ms decay + harmonic ×2.01 offset, pitch rises with chain;
  near-miss whoosh = bandpass noise sweep 400→2000 Hz, 180 ms, StereoPanner by
  travel direction; grab thud = sine 55 Hz, 250 ms decay + lowpass noise
  60 ms; game over = FM gong 110 Hz, 2.5 s decay + cricket fade-out.
- Night ambience: crickets = pulsed 4.2 kHz bursts, random detune, every
  1.2–2.4 s, panned across 2 channels; bed = brown noise + 0.1 Hz LFO on a
  lowpass. All SFX go through one sfx.play(name) helper with debounce/
  voice-limit; full silence when muted.
- C2: (1) 60 fps with the full scene (300 particles + 40 fireflies + 5
  parallax layers); (2) network panel shows zero requests beyond the document;
  (3) audio unlocks on first touch, no click-pop (5 ms ramps), no sound leak
  after game over; (4) ≤ 12 simultaneous audio nodes;
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause (RAF halted) +
  audio.suspend; resume with a 3-2-1 countdown; loop.js stall clamp guards
  time jumps.
- Saves via engine/storage.js createStorage('starlight-swing', 1, defaults,
  migrate): schema v1 = { best, bestDistance, settings {muted, lang} }.
  try/catch tolerant to corrupt/cleared storage; migration hook wired. Never
  raw localStorage.
- Debug overlay: ?debug=1 draws fatal hitboxes (red outline) and the PERFECT
  ring.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- Retry soak: 50 consecutive retries leave listener and particle-pool counts
  flat, heap stable ±5%.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) 50 retries show zero
  listener/pool growth, heap ±5%; (3) profiler shows zero RAF allocations;
  (4) storage survives a corrupt payload; (5) live language switch rebuilds
  all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/starlight-swing/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: never below 55 fps in a 5-minute soak at 4x CPU throttle;
   frame p99 ≤ 20 ms; JS ≤ 8 ms/frame on a 3 GB-RAM-class phone; no visible GC
   pauses.
3. Zero GC in RAF steady state (allocations allowed only at boot/state change).
4. Perfect one-thumb: touch-action none, response ≤ 1 frame, scroll/zoom/
   double-tap-zoom fully blocked, playable from 320 px to 1920 px wide.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Audio plays after the first touch (autoplay unlock); mute persists across
   reloads; no sound leak after game over.
7. Measured feel: PERFECT window ≥ 180 ms at first-phase frequency; fatal
   hitboxes exactly 20% under visual size (verify via ?debug=1).
8. Every screen (boot/how-to/pause/game-over) renders correctly at 360×640;
   zero console errors.
9. Console self-test: C1/C2/C3 all PASS + 'STARLIGHT-SWING READY'.
10. Definition of done: /game:qa starlight-swing against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         STARLIGHT SWING
  tagline       PUMP — LAUNCH — GRAB
  bootTap       TAP TO START
  howtoCap      HOW TO PLAY
  tut0          TAP IN RHYTHM TO PUMP THE SWING HIGHER
  tut1          AT THE PEAK, SWIPE UP TO LAUNCH
  tut2          HOLD TO GLIDE — CATCH STARS, DODGE BRANCHES
  hintLaunch    LAUNCH!
  perfect       PERFECT      good GOOD      miss MISS
  nearMiss      NEAR MISS!
  distUnit      m
  scoreCap      SCORE      distCap DISTANCE      starCap STARS
  nearCap       NEAR MISSES      bestCap BEST
  newBest       NEW BEST!
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  overTap       TAP TO SWING AGAIN
  puWings       WINGS      puMagnet STAR MAGNET      puRhythm NIGHT RHYTHM

=== TECHNICAL BLUEPRINT ===
- Palette: night-sky gradient #050718 → #1a1f4a; moon #f5f0dc with radial
  glow; warm gold stars #ffd98a; fireflies #c8ff8a; mist blue #3a4a7a; system
  font stack, weight 700, letter-spacing 0.02em (no remote fonts).
- Moon-Phase difficulty (advances every 400 m):
  NEW MOON — damping c = 0.06, wind max 1.5 m/s, gaps 55–75 m (gentle
    tutorial, dense stars);
  CRESCENT — c = 0.08, wind 3 m/s, gaps 70–95 m (horizontal branches appear);
  HALF MOON — c = 0.10, wind 4.5 m/s, gaps 85–110 m (drifting lanterns cross
    on a sin path);
  FULL MOON — c = 0.13, wind 6 m/s, gaps 100–130 m (branches + lanterns +
    sudden wind reversals, telegraphed 2 s ahead by falling leaves).
- Scoring: distance 1 m = 1 point (large center HUD); stars 25 × multiplier,
  star chains held by pickups within 1.2 s of each other; PERFECT pump
  10 × multiplier + streak; near-miss +50, tallied separately; multiplier from
  streak 3/6/10/15 → ×2/×3/×5/×8, decaying to ×1 after 4 s without an event —
  HUD flame meter heats up and flickers when about to die.
- Power-ups (golden lantern, 12–18% spawn chance per tree): WINGS — 2 s glide
  boost (gravity ×0.3); STAR MAGNET — pulls stars within 6 m for 3 s (bezier
  attraction); NIGHT RHYTHM — auto-PERFECT for 5 s (widened perfect ring,
  auto-chime).
- HUD: distance "1234 m" center-top (weight 700, neon text-shadow), star count
  left, multiplier flame + streak at the bottom, pause + sound buttons
  top-right; safe-area-inset respected for notches.
- State machine: BOOT → TITLE → HOWTO (first run only) → RUN → GAMEOVER → RUN;
  PAUSE overlay anytime (button + visibilitychange).
- Perf budget: ≤ 300 particles, 40 fireflies, 140 stars, 5 parallax layers,
  ≤ 12 audio nodes; JS ≤ 8 ms/frame @DPR2 mid-tier; batched canvas ops, no
  redundant state changes between draw calls.
- All magic numbers centralized in one TUNING object at the top, tuned around
  the 250–350 ms reaction-window feel.
```
