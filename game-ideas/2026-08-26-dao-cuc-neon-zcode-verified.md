# POLAR NEON

- **Date:** 2026-08-26 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `polar-neon` — target folder `games/polar-neon/`
- **Genre:** Arcade / hyper-casual score-attacker — one-thumb gravity-flip infinite runner; core mechanics: one-button polarity flip, rail-glide magnetism, graze combos, heat management, daily-seed challenge.
- **Pitch:** One thumb-tap flips polarity — gravity inverts and you spring between two magnetized neon rails, gliding along the rail face and "shaving" through laser beams to push the multiplier to x8 inside a pipe that gets faster and faster. The feel: finger-snaps like drum hits, and every death is one heartbeat away from retry — "one more run" never stops.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Đảo Cực Neon".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build POLAR NEON — an H5 one-thumb gravity-flip infinite runner that
meets this repo's shipping bar: games/polar-neon/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Commercial targets: runs of 45–90 s, death→retry
< 1.5 s, D1 retention > 40%, 8+ runs/session, ad slots between runs (never
blocking the core loop, no backend). Technical bar: deterministic fixed-step
120 Hz physics, procedural WebAudio synthesis, zero-GC steady state,
fair-first hitboxes (−20%), identical daily seed on every platform, a juice
framework (hitstop/shake/pooled particles), and a ?debug=1 self-audit that
grades 8 criteria. Forbidden: frameworks, build steps, CDNs, external assets,
Math.random() in gameplay. All UI copy in English, served from an STR i18n
table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the
game ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 stages, strictly sequential. At the
end of each stage open ?debug=1 and console.table() the checklist; advance
only on 100% PASS; on FAIL stay at scope and fix until PASS — no new features
while anything FAILs. End each iteration with a short report: [DONE / VERIFIED
/ STILL OWED]. Log 'POLARNEON READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/polar-neon/ from templates/game-starter/ via /game:new
  polar-neon. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1920x1080 reference space, CSS letterbox 16:9; HiDPI: canvas.width =
  viewport x min(DPR, 2); ctx alpha:false for cheaper compositing.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation:
  pos = prev + (curr − prev) x alpha. Entities move in update() only.
- Physics (px, px/s, px/s² — fully framerate-independent):
  - Player anchored at x = 480 px; top rail y = 240 px, bottom rail y = 840 px.
  - polarity ∈ {−1, +1}; gravity g = polarity x 3400 px/s².
  - FLIP (pointerdown): polarity x= −1; vy += polarity x 520 (a kick toward
    the new gravity); heat += 14.
  - Rail-snap: within 8 px of the target rail and |vy| < 120 → y := rail,
    vy := 0, frictionless GLIDE until the next flip.
  - World scroll: v_scroll(t) = 320 + 46 x t^0.62 px/s, clamp 980.
- Input: engine/input.js unified pointer/touch + keyboard fallback. Absolute
  one-thumb: pointerdown anywhere = flip (touch + mouse + Space fallback);
  every UI button ≥ 64 px in the right/bottom thumb zone; input is buffered
  through hitstop (1-flip buffer). touch-action: none on canvas.
- State machine: BOOT → TITLE → RUN → PAUSE → DEATH → REPLAY → RUN; each
  state a plain {enter, update, draw, exit} object, no nested classes.
- Spawner: engine/rng.js createRng(dailySeed) with dailySeed = hash(YYYYMMDD)
  → Daily Challenge: same day, same layout on every device. 3 hazard types:
  RAIL-WALL (blocks one rail, forces rhythm flips), LASER-GATE (mid-pipe,
  open/close cycle 2.4 s, phase derived from the seed), ION-SPARK (pickup
  that reduces heat). No Math.random() in gameplay code.
- C1: (1) playable grey-box through the full loop live → die → retry;
  (2) F1 toggles debug hitboxes; (3) flip/glide/snap smooth without jitter;
  (4) death→retry < 1.5 s; (5) grey-box holds 60 FPS.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: zero-alloc SoA pool of 2048 — Float32Array (x, y, vx, vy, life,
  maxLife, size, hueIdx) + ring pointer overwriting the oldest slot; spawn =
  field assignment, no new; particle gravity 900 px/s²; alpha = life/maxLife;
  composite 'lighter'. Follow engine/particles.js pool semantics.
- Juice: screen shake via trauma — shake = trauma²; offset = shake x 26 px x
  noise(t x 72 Hz); decay 2.2/s; rail-snap +0.05, graze +0.15, death = 1.0;
  reduced-motion setting disables shake. Hitstop: timeScale = 0 for 42 ms at
  graze tier ≥ 3, 118 ms on death; ease-out cubic 180 ms back to 1.0; inputs
  never swallowed (buffered).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on the first pointerdown (ctx.resume() + graph built once:
  masterGain → WaveShaper soft-clip → DynamicsCompressor → destination),
  suspend on pause, mute state persisted, all nodes reused. Master never
  starts > 0.5.
- SFX: flip = square osc 220 → 110 Hz exponential sweep 90 ms through lowpass
  900 Hz; rail-snap = sine sub-thump 55 Hz, 140 ms, gain 0.5 → 0; graze =
  sine arpeggio on C pentatonic [261.63, 293.66, 329.63, 392.00, 440.00,
  523.25] Hz — higher tier plays higher notes, decay 180 ms; ion pickup =
  triangle 660 → 880 Hz, 120 ms; death = 2 saws detuned 110 Hz + 116 Hz
  pitch-drop to 40 Hz over 600 ms + 80 ms white-noise burst (noise buffer
  created exactly once at boot).
- Generative music: 8-step bass sequencer, root C2 = 65.41 Hz, semitone
  pattern [0,0,3,0,5,0,3,7], tempo = 128 + ((v_scroll − 320)/660) x 48 BPM;
  hi-hat = 30 ms noise burst every even beat.
- Trail ribbon: 24-point player position history, stroke gradient hue
  190 → 320 by combo, lineWidth taper 18 → 2.
- C2: (1) flip/graze/bass clearly audible on beat; (2) shake + hitstop +
  2048 particles without frame drops; (3) ?debug=1 confirms 0 pool
  allocations; (4) zero network requests beyond the document;
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: visibilitychange hidden → pause in the current frame +
  audio.suspend; returning to the tab shows the manual PAUSE screen — only a
  pointerdown resumes gameplay (no auto-resume killing the player mid-hazard);
  loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('polar-neon', 1, defaults,
  migrate): schema v1 = { best, runs, sound, reducedMotion, lang }. try/catch
  on every access (Safari private mode); migrate by version. Never raw
  localStorage.
- Near-miss, enterprise-grade: hazard LETHAL hitbox shrunk −20% (fair-first);
  player graze ring = 52 px (core 26 px); when the band between [real hitbox −
  lethal hitbox] touches the ring → GRAZE: +50 x multiplier points, heat −7,
  trauma +0.15, combo tier +1.
- Instant replay: ring buffer of the last 150 frames (typed arrays: y, vy,
  worldX, active-hazard table offsets — reused, zero allocation); death →
  hitstop 118 ms → slow-mo playback at 0.35x, total replay-start latency
  < 150 ms; the DEATH screen + score appear only after the replay.
- Combo/heat complete: a flip within the 1.2 s window keeps the chain;
  multiplier = 1 + 0.25 x min(chain, 28), cap x8; heat 0–100: +14 per flip,
  −9/s passive, −7 per graze, −12 per pickup; heat ≥ 100 → OVERHEAT locks
  flipping for 0.6 s (red feedback + warning sound, chain reset) — at
  v_scroll 700+ that is a death sentence: the risk/profit loop.
- Newbie protection: no hazard spawns during the first 1.2 s of a run;
  difficulty ramp softened for the first 3 runs.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) mid-run tab switch never kills unfairly; (2) replay smooth with
  start < 150 ms; (3) save survives reload; (4) F1 confirms the lethal hitbox
  is exactly −20% vs the drawn sprite; (5) live language switch rebuilds all
  labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL — ship gate, 8/8 PASS) ===
1. Repo-standard layout: games/polar-neon/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, no CDNs/fonts/images/audio files, offline-capable, total
   payload ≤ 5 MB with game code ≤ 120 KB. Ships README.md (how to run,
   controls, tuning table) + GDD.md from docs/game-design-template.md.
2. Zero external assets: 100% of visuals = procedural Canvas2D; 100% of audio
   = WebAudio synthesis.
3. 60 fps locked: fixed-step 120 Hz accumulator + interpolated render; 60 s
   benchmark ≥ 59.4 FPS average under 4x CPU throttle; no frame > 20 ms
   outside deliberate hitstop.
4. Zero GC allocation in RAF steady state: every entity/particle/buffer
   pooled from boot; hot path forbids new, .map/.filter/.concat, string
   templates; 60 s allocation timeline = 0 new objects in the loop.
5. Determinism: same daily seed → identical hazard sequence on every platform
   (mulberry32 via engine/rng.js; Math.random banned in gameplay).
6. Input → response ≤ 1 frame; hitstop never swallows input; one-thumb
   playable end-to-end, touch-action none, scroll/zoom fully blocked.
7. Palette brand-locked (exactly these gradients): bg vertical #05060F →
   #0B1026; ANOD rail #00F0FF → #0066FF; CATHOD rail #FF2E88 → #7A00FF;
   player core #FFFFFF + glow; trail hue 190 → 320 by combo; lethal hazard
   #FF3355; graze ring #FFAA00; ion pickup #7CFF4D.
8. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
9. Console self-test: ?debug=1 console.table() prints every criterion
   PASS/FAIL with measured numbers (FPS min/avg, alloc count, replay latency
   ms) — ship only at 8/8 PASS + 'POLARNEON READY'.
10. Definition of done: /game:qa polar-neon against
    docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      POLAR NEON / GRAVITY FLIP RUNNER
  bootTap       TAP TO FLIP
  tut0          TAP ANYWHERE TO FLIP GRAVITY
  tut1          GLIDE THE RAIL — GRAZE LASERS FOR COMBO
  tut2          WATCH YOUR HEAT — OVERHEAT LOCKS YOUR FLIP
  scoreCap      SCORE      bestCap BEST      comboCap COMBO
  heatCap       HEAT       dailyCap DAILY CHALLENGE
  grazeCap      GRAZE!     overheatCap OVERHEAT!
  replayCap     REPLAY
  pausedCap     PAUSED      pauseTap TAP TO RESUME
  deathCap      POLARITY LOST
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU
  setCap        SETTINGS    setSound SOUND      setMotion REDUCED MOTION

=== TECHNICAL BLUEPRINT ===
- Architecture: template scaffold only — game code in src/; all constants in
  one CONFIG object (tuning touches CONFIG only, never logic). Modules map to
  the template engines: RNG → engine/rng.js · Input → engine/input.js ·
  AudioEngine → engine/audio.js (unlock once, graph built once) · Physics →
  fixed-step via engine/loop.js · Spawner (seeded) · Particles → SoA pool via
  engine/particles.js · Shake (trauma) · Replay (150-frame ring) · Save →
  engine/storage.js v1 · FSM · Renderer (alpha interpolation).
- Loop frame: engine/loop.js owns the accumulator (frame delta clamp 250 ms,
  step 1/120, alpha = acc/8.333).
- Physics numbers: rails y 240/840, player x 480; g = polarity x 3400 px/s²;
  flip kick 520 px/s; snap 8 px & |vy| < 120; v_scroll = 320 + 46 x t^0.62
  clamp 980 px/s.
- Heat economy: +14/flip, −9/s passive, −7/graze, −12/pickup; OVERHEAT at 100
  locks flip 0.6 s; multiplier = 1 + 0.25 x min(chain, 28), cap x8, chain
  window 1.2 s; graze +50 x multiplier, combo tier +1.
- Music: bass root C2 65.41 Hz, pattern [0,0,3,0,5,0,3,7] semitones, tempo =
  128 + ((v_scroll − 320)/660) x 48 BPM; hi-hat 30 ms every even beat.
- SFX frequencies: flip 220 → 110 Hz / 90 ms LP900; snap 55 Hz / 140 ms;
  graze C-pentatonic [261.63, 293.66, 329.63, 392.00, 440.00, 523.25] Hz;
  ion 660 → 880 Hz / 120 ms; death saws 110 + 116 Hz → 40 Hz / 600 ms.
- State machine: BOOT → TITLE → RUN → PAUSE → DEATH → REPLAY → RUN; PAUSE
  overlay anytime (button + visibilitychange).
- Tuning tolerance: ±15% on CONFIG values, formula structure unchanged.
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier.
```
