# RISING SWELL

- **Date:** 2026-08-15 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `rising-swell` — target folder `games/rising-swell/`
- **Genre:** Arcade · physics gesture runner (control-the-medium): you don't steer the boat — you control the sea itself.
- **Pitch:** Swipe to raise waves and fling a paper boat off their crests — over mines, through parabolic orb arcs, out of whirlpools. A 60–120 s one-more-try loop with airtime combos, real-time spring-cloth water physics, and 100% procedural WebAudio.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Dậy Sóng".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Rising Swell — an H5 arcade physics gesture-runner that meets this
repo's shipping bar: games/rising-swell/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: swipe to pump energy into a spring-cloth
water surface, launch the paper boat off wave crests, catch orb arcs, dodge
bobbing mines, escape whirlpools. USP (must keep): the player controls the
ENVIRONMENT (the water), never the character — do not turn this into a
boat-driving or tap-to-jump game. Tagline: "You don't steer the boat. You are
the sea." All UI copy in English, served from an STR i18n table with reserved
'vi'/'lo' slots (pattern: games/gravity-juggle) so the game ships
multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'RISING-SWELL READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/rising-swell/ from templates/game-starter/ via /game:new
  rising-swell. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: mobile portrait-first, responsive letterbox fit-scale, DPR clamped
  ×2, single canvas layer; transform set once per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state. All physics in px/s.
- Water — 1D spring cloth (the core system): N = 160 columns spanning viewport
  + margin; each column has y (offset from rest level) and v, in Float32Arrays.
  Per substep: v += (0 − y)·tension; v ×= damping; y += v with tension = 0.022,
  damping = 0.985. Propagation: 3 passes (L→R→L), spread = 0.18:
  dv[i] = spread · (y[i] − y[i±1]) added to the neighbor's v.
- Swipe impulse: pointer world-x, delta dy → for each column j within a radius
  of 16 columns: v[j] += A · exp(−d²/(2σ²)) · sign(dy) with σ = 6 columns,
  A = clamp(|dy| × 14, 0, 900). Energy cost = |dy| × 0.06. Insufficient energy
  → weaker wave proportional to what remains + HUD flashes red.
- Tide Energy: max 100, regen 12/s, shown as a vertical bar.
- Whirlpool: per frame subtracts v[j] following a gaussian-pit profile
  (radius 120 px, depth −240/frame · falloff); simultaneously pulls the boat
  along the tangent around its center (320 px/s²) plus a slight downward
  suction. A whirlpool lives 9 s, then dissolves.
- Boat — 2D rigid body: x, y, vx, vy, angle, angularVel; 64×22 px folded-paper
  hull. Buoyancy: sample water level at bow and stern (lerp between 2
  columns); submerged depth d → lift F = 2600 × d (clamped); torque aligns
  angle to the water-surface tangent (constant 18/s²). Gravity 1900 px/s².
  Drag: ×6.5 in water, ×0.2 in air. The boat receives NO direct input — it
  interacts only through the water.
- Collisions: orb circle r15 × hull OBB (closest-point circle-OBB); mine
  circle r16, bobbing with its water column; explodes when hull–mine distance
  < 10 px.
- Second-to-second loop: boat auto-runs right (speed ramp 240→560 px/s);
  player swipes vertically to compress energy into the water; the boat rides
  the surface and launches off crests on parabolic arcs; in the air, collect
  orb arcs (combo grows), hear the whoosh; water contact = splash + airtime
  bonus, combo window 1.8 s; on the surface, dodge mines (geiger tick warns on
  approach) and escape whirlpools by pushing waves at them.
- Fail states: mine contact → explosion, hit-stop, slow-mo, game over; pulled
  under by a whirlpool for > 1.6 s → sinks, game over. Instant restart:
  game-over → running again < 400 ms, same setup, new seed.
- Input: engine/input.js unified pointer/touch + keyboard fallback — one
  finger, vertical drag anywhere (raycast x down to the water) makes waves;
  Pointer Events unified (mouse/touch/pen), use coalesced events when
  available (120 Hz screens). touch-action: none on canvas. 44 px pause
  button; desktop drag equivalent.
- Scoring skeleton: distance +1 pt / 12 px; orbs 25 × combo; airtime bonus on
  landing — full formulas in TECHNICAL BLUEPRINT.
- All randomness through engine/rng.js createRng(seed) — per-run seed from
  Date.now(), ?seed= URL override to reproduce a run. No Math.random() in
  gameplay code.
- C1: (1) physics/render separation holds, measured step ≈ 8.33 ms ±5%;
  (2) water sim ≤ 1.2 ms/frame (160 columns × 3 passes × 2 substeps);
  (3) a strong swipe jumps the boat ≥ 120 px; Tide Energy depletion matches
  the HUD; (4) the boat never receives direct input — it moves only via the
  water.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 320 (Float32Array x, y, vx, vy, life, size, type) —
  droplet (gravity, fade), foam (floats on the water surface, drifts down the
  slope), spark (orbs, additive 'lighter'), ripple ring (water decal), smoke
  (mines). Over budget → drop the oldest. Follow engine/particles.js pool
  semantics; NO new/closures in the hot loop.
- Splash: 6–26 droplets in a 30–75° fan, tinted by impact; foam trail from the
  stern while hull touches water (24 ms gap); speed lines at high flight
  (alpha ∝ vy); floating score text +25×c (pool of 12).
- Juice: screen shake trauma ∈ [0,1], decay 1.8/s, offset = trauma² × 14 px
  (multi-frequency noise), rotation = trauma² × 0.015 rad; hit-stop 80 ms on
  explosion (world dt = 0, render continues); death slow-mo timescale 0.25 →
  1 over 900 ms; near-miss: passing a mine < 40 px away → white ring flash +
  small chime (dopamine near-miss); milestone combo 5/10/20 → badge pop +
  arpeggio + screen-rim flash. Reduced motion: no shake/speedlines, replaced
  by the rim flash.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture (pointerdown), suspend on pause, mute
  state persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor (threshold −18 dB, knee 24) → destination; one shared 2 s
  noise buffer built at boot. Master never starts > 0.5. Max 12 simultaneous
  voices; compressor guards clipping when explosion + milestone overlap.
- SFX recipes (all procedural): splash = 180 ms noise burst through bandpass
  f = 600 + impact×2 Hz, Q=1, exp decay + sine 90 Hz thump 60 ms, gain ∝ |vy|;
  orb pluck = triangle osc, pentatonic [523, 587, 659, 784, 880] Hz picked by
  combo mod 5, 250 ms decay, feedback delay 120 ms gain 0.25; whoosh = looped
  noise, lowpass 300–1200 Hz sweep by altitude, gain by airtime, stops on
  water contact; milestone = 3-note square arpeggio (attack 8 ms), 70 ms
  apart + highpass noise sparkle; mine geiger = 8 ms noise highpass 4 kHz,
  interval tightening 500 ms → 90 ms by proximity; explosion = 400 ms noise
  lowpass sweep 2400→120 Hz + sine 55 Hz decay + soft-clip waveshaper; game-
  over sting = 2 falling minor notes, sine + triangle; UI click = 4 ms blip
  noise highpass; ambient = 2 noise loops (brown lowpass 220 Hz with 0.1 Hz
  LFO; bandpass 900 Hz with 0.23 Hz LFO), gain −26 dB, 2 s fade-in.
- C2: (1) 60 fps with full VFX active; (2) network panel shows zero requests
  beyond the document; (3) audio unlocks on first pointerdown, ≤ 12 voices, no
  clipping when explosion + milestone stack; (4) hit-stop/slow-mo/shake do not
  break interpolation; (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause (RAF halted, ambient
  suspended — battery-friendly); resume with a 3-2-1 countdown; loop.js stall
  clamp guarantees no time-jump on resume.
- Saves via engine/storage.js createStorage('rising-swell', 1, defaults,
  migrate): schema v1 = { best, runs, totalOrbs, settings {sound, vibrate,
  reducedMotion, lang} }. try/catch tolerant to corrupt/cleared storage;
  migration hook wired. Never raw localStorage. No online leaderboard.
- Spawner fairness: no mine spawns within 260 px after the moment the boat
  lands (grace window) — must hold under the ramping curves in BLUEPRINT.
- Debug overlay: ?debug=1 shows a 120-frame frame-time graph, particle count,
  water-sim ms, current seed.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  typed arrays + pooled text/particles everywhere; verify via Chrome
  allocation profiler: 10 s of gameplay = zero steady-state heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics, no time-jump on resume;
  (2) whirlpool sink triggers exactly at > 1.6 s submerged; (3) storage
  survives a corrupt payload; (4) profiler shows zero RAF allocations;
  (5) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/rising-swell/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests (playable with the network cut after load), procedural
   assets only, total payload ≤ 5 MB. Ships README.md (how to run, controls,
   tuning table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked on SD660-class mid-range: p95 frame ≤ 18 ms, p99 ≤ 33 ms over
   3 minutes of continuous play; water sim ≤ 1.2 ms/frame.
3. Zero GC in RAF steady state; heap drift ≤ 2 MB after 10 minutes.
4. One-finger fully playable: touch-action none, response ≤ 1 frame,
   scroll/zoom/double-tap-zoom fully blocked; strong swipe → boat launch
   ≥ 120 px; Tide Energy HUD reflects every cost.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Mechanics verify: rolling score matches the formulas; combo resets after
   1.8 s without an orb; geiger frequency rises near mines; best score
   persists across reload; whirlpool escapable within 1.6 s when energy ≥ 30.
7. Console self-test: C1/C2/C3 all PASS + 'RISING-SWELL READY'.
8. Definition of done: /game:qa rising-swell against
   docs/production-checklist.md, then /game:release gates.
9. Extras: layout correct with zero text overflow from iPhone SE 375×667 to
   desktop 1440p; reduced-motion swaps shake/speedlines for a rim flash;
   console 100% clean for the whole session.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         RISING SWELL
  tagline       YOU DON'T STEER THE BOAT. YOU ARE THE SEA.
  bootTap       TAP TO START
  scoreCap      SCORE      bestCap BEST      orbsCap ORBS
  comboCap      COMBO      distCap DISTANCE
  newBest       NEW RECORD!
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  btnRetry      PLAY AGAIN      btnShare SHARE
  copied        RESULT COPIED!      copyFail COPY FAILED
  setSound      SOUND      setVibrate VIBRATION      setMotion REDUCED MOTION

=== TECHNICAL BLUEPRINT ===
- Palette (deliberate sunset, not sea-blue): water vertical gradient
  #0E3A5C → #1B6E8C; foam #EAF6F9; boat #F4F7F2 with outline #16232B; orb
  #FFC64D; mine #2A2E33 with blinking red core #FF4B4B; whirlpool #0B2537
  with foam spiral; sky gradient #F2A65A → #D96C3F; sun #FFD9A0; mountain
  silhouettes, 2-layer parallax #8C4A3C / #5C2E35. System font stack,
  tabular-nums for scores; safe-area env(safe-area-inset-*); tap targets
  ≥ 44 px; text ≥ 12 px.
- Difficulty/spawn curves: orb clusters of 5–9 laid on a parabola suggesting
  the flight arc, cluster gap 900 px → 520 px by distance; mines single or
  chains of 3, frequency 1/1400 px → 1/700 px; whirlpools from 600 m, every
  ~3800 px, random center in the middle lane; boat speed v(d) = 240 + 320 ×
  (1 − e^(−d/9000)).
- Scoring: distance +1 pt / 12 px; orb = 25 × combo; combo +1 per orb, resets
  after 1.8 s of water contact without a new orb, or on hit; safe-landing
  airtime bonus = floor(hangMs / 40), × (1 + 0.1 × combo) if ≥ 1 orb was
  collected during the flight arc; score display rolls (200 ms tween,
  tabular-nums).
- HUD: score top-left (rolling), combo badge beneath (pop scale 1.35 → 1),
  vertical Tide Energy bar on the right (fill #7FD1E8, flashes red < 20%),
  pause button; start screen = wordmark + tagline + swiping-hand animation +
  best score + full-screen tap-to-start; game-over card = score, best (NEW
  RECORD ribbon on record), orbs, max combo, distance, Play Again (< 400 ms
  into gameplay) + Share (clipboard copy); settings popover = sound,
  vibration (navigator.vibrate), reduced motion.
- State machine: BOOT → MENU → RUNNING → PAUSED → GAMEOVER; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: ≤ 320 particles, ≤ 12 audio voices, DPR ×2, 1 canvas layer;
  JS frame ≤ 8 ms mid-tier; batched canvas ops, no redundant state changes
  between draw calls; all tunable constants centralized in one CONFIG object
  with per-line comments.
- Non-goals (v1): no online leaderboard, no IAP, no characters/skins, no
  night mode, no PWA install prompt.
```
