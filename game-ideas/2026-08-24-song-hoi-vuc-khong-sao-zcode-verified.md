# STARLESS ECHO

- **Date:** 2026-08-24 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `starless-echo` — target folder `games/starless-echo/`
- **Genre:** One-thumb arcade survival-scroller — exclusive Sonar-Vision risk/reward hook: seeing an enemy means waking it ("vision is ammunition").
- **Pitch:** Dive into an abyss without a single ray of light, where seeing is ammo wasted: every sonar ping that lights your way also summons the ravenous Listeners to the exact spot you pinged from. One finger, thousands of ping-or-don't-ping decisions per minute — the bolder you look, the richer the score, the closer death.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Sóng Hồi: Vực Không Sao".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build STARLESS ECHO — an H5 one-thumb arcade survival-scroller that meets
this repo's shipping bar: games/starless-echo/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core hook: VISION-IS-AMMUNITION — the sonar ring
reveals the cave but awakens every predator within 900 px, which home to the
ping origin; players must ping-then-move and bait Listeners into walls
(bait-kill +50). Single-resource economy: only the echo meter (drained by
pings) — no oxygen; pearls refill echo and feed the combo. One-line economy,
understood in 3 seconds. Every death SHOWS its cause (replay + light streak) —
never an unfair death. All UI copy in English, served from an STR i18n table
with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the game
ships multi-language-ready. Portal-commercial, studio-grade juice and meta.
Agent may tune technical constants but must NOT change the core hook. No
stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify against that iteration's checklist (C1.x, C2.x, C3.x);
only advance on absolute PASS. Never merge iterations, never skip QC. Log
'ECHOABYSS READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/starless-echo/ from templates/game-starter/ via /game:new
  starless-echo. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 logical (9:16), responsive letterbox fit-scale
  min(innerW/1080, innerH/1920); HiDPI: canvas.width = viewport x
  min(DPR, 3); set transform once per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation
  (x_r = x_prev + (x − x_prev) x alpha). Entities move in update() only;
  render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  pointer-x maps to targetX; the pod follows spring-damper
  ax = k x (targetX − x) − c x vx with k = 180, c = 14 (ζ = c/(2 sqrt(k)) ≈
  0.52, slightly underdamped for a bouncy feel). touch-action: none on canvas.
- Descent: vertical speed vy = 220 + depth x 0.02, clamp 640 px/s.
- Cave: value noise, 4 octaves (deterministic hash from the run seed,
  lacunarity 2.0, gain 0.5); corridor width W(d) = 360 − clamp(d x 0.03, 0,
  160) px. Collision: capsule-vs-wall via closest-point-on-segment.
- Sonar: ring radius r(t) = 560 x (1 − e^(−t x 3.2)) px; revealed geometry
  alpha = max(0, 1 − (now − tReveal)/1.2), fading to dark. Pearls arranged in
  arcs along the corridor.
- Death → tap to restart. State machine BOOT → MENU → RUN → DEAD → REPLAY.
- All randomness (run seeds, cave hashing) through engine/rng.js
  createRng(seed). No Math.random() in gameplay code.
- C1: (1) full run playable end-to-end; (2) fixed-step sim verified
  (step ≈ 8.33 ms); (3) one-thumb steering responsive ≤ 1 frame;
  (4) scroll/zoom never swallowed by the canvas.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 1024, structure-of-arrays (8 Float32Arrays: x, y, vx, vy,
  life, maxLife, size, type + free-list index), zero object allocation. Follow
  engine/particles.js pool semantics. NO new/closures in the hot loop.
- Juice: screen shake via trauma model — amplitude = trauma² x 26 px, decay
  1.6/s, rotational jitter ±2.1° driven by 1D Perlin noise; hitstop on
  near-miss 60 ms at timeScale 0.35, on death 180 ms full stop.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination. Master never starts > 0.5.
- Ping = sine sweep 1400 → 320 Hz over 0.18 s through a real feedback delay
  (DelayNode 0.21 s, feedback 0.35, lowpass 1200 Hz) to create the echo tail;
  pearl = C pentatonic (523.25, 587.33, 659.25, 783.99, 880.00 Hz), scale
  degree = combo % 5, up one octave every 10 combo, add a perfect fifth
  (x1.5) when combo ≥ 8; near-miss = sub-sine 90 Hz decay 0.12 s +
  white-noise burst through bandpass 300 Hz Q=1 (noise buffer generated once
  at init); Listener growl = 2 sawtooth 55/57 Hz + LFO 6 Hz depth 12 Hz;
  heartbeat double-thump 52 Hz when echo < 25%. Unlock lazily on the first
  pointerdown; no click-pop (short ramps).
- HUD: combo ring drawn around the touch point; score pop scale 1.3 → 1.0
  ease-out-back.
- C2: (1) 60 fps worst-case (30 predators + 900 active particles ≤ 16.6 ms/
  frame, measured via the Performance panel, not by feel); (2) ping must have
  a REAL echo tail, near-miss must feel nasty, pearl pickups must form a
  rising melody with combo; (3) audio starts on the first pointerdown, never
  blocked by autoplay policy; (4) zero network requests beyond the document;
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend +
  PAUSED overlay; resume with a 3-2-1 countdown (guards against unfair deaths
  on return); loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('starless-echo', 1, defaults,
  migrate): schema v1 = { best, runs, pearls, mute, lang }. try/catch
  tolerant to corrupt/cleared storage (falls back to safe defaults);
  migration hook wired. Never raw localStorage.
- Near-miss mastery: lethal hitbox = 80% of true size (−20%); graze zone =
  100 → 120%; once-per-pair flag via an int bitmask → graze effect + combo.
- Instant replay < 150 ms: Float32Array ring buffer snapshotting every 4
  frames, keeping 5 s (pod + 16 predators + ring state ≈ 40 floats/snapshot,
  fixed pool); on death playback at 0.5x with a purple tint + cinematic
  letterbox; death event → first replay frame < 150 ms.
- Difficulty director, checked every 500 m: 0–2000 m teaches pinging;
  2000–6000 m pearl-chaining; > 6000 m denser predators + narrowing corridor;
  spawn budget = 4 + depth/1500. Anti-frustration: first 3 s of every run is
  predator-free.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  all vectors/constants preallocated; state machine as int enum + switch;
  offscreen canvas for the plankton background drawn once, scrolled with 2
  drawImage calls. Verify via Chrome allocation profiler: 10 s of gameplay =
  zero steady-state heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) repeated tab switching: no crash, timers don't drift (stall clamp
  holds); (2) storage round-trip correct; cleared storage → game still runs
  on defaults; (3) near-miss: standing in the 80–100% band survives with
  graze effect + combo credit; (4) replay starts < 150 ms after death;
  (5) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/starless-echo/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked on Chrome desktop + Chrome Android at worst-case (30
   predators + 900 active particles): no frame > 17 ms.
3. Zero GC in RAF steady state: 3 heap snapshots 30 s apart during gameplay,
   heap delta < 0.03 MB (allocations allowed only at boot/state change).
4. Audio starts exactly on the first pointerdown, never blocked by autoplay
   policy; 10 rapid tab switches: no broken or overlapping audio.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Fully playable with exactly one finger: gameplay + menu + pause + restart;
   touch-action none, input → pixel ≤ 1 frame, scroll/zoom/double-tap-zoom
   fully blocked.
7. Replay: death → first replay frame < 150 ms, smooth 0.5x playback.
8. Console self-test: C1/C2/C3 all PASS + 'ECHOABYSS READY'.
9. Definition of done: /game:qa starless-echo against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      STARLESS ECHO / THE STARLESS DEEP
  bootTap       TAP TO DESCEND
  tut0          PING TO SEE — PINGING WAKES THE LISTENERS
  tut1          PEARLS REFILL ECHO AND FEED YOUR COMBO
  tut2          BAIT LISTENERS INTO THE WALLS — +50
  scoreCap      SCORE      bestCap BEST      depthCap DEPTH
  echoCap       ECHO
  grazeCap      ECHO GRAZE!
  baitCap       BAIT-KILL +50
  pausedCap     PAUSED      pauseTap TAP TO RESUME
  countdown     3 / 2 / 1
  deathCap      THE DEEP TAKES YOU
  newBest       NEW BEST!
  top5Cap       LOCAL TOP 5
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: bg radial gradient #05070E → #0B1026; pod core #7DF9FF with a white
  core; sonar ring gradient stroke #00F0FF → #FF3DCB drawn composite lighter
  (additive); revealed walls outline #1E2A52 with glow #4C6FFF; pearl #FFD166;
  Listeners #FF3B5C with a bright rim when awake; danger vignette #2B0A1E;
  replay tint #6E3A8E. All glow via shadowBlur or gradient strokes — no
  per-frame filters.
- Combo system ECHO CHAIN: a pearl eaten within the 1.4 s chain window raises
  the combo; multiplier = 1 + floor(combo/4), cap x8 (CHOIR tier); near-miss
  +1 combo; the chain breaks when the window lapses or on a light wall hit;
  score = Σ(10 x multiplier x (1 + speedFactor)); bait-kill predator +50;
  local top-5 leaderboard shown on the death screen.
- Predator roster: Listeners only, but with awake/sleep states — pings awaken
  every Listener within 900 px and they home to the ping origin; asleep they
  drift blind.
- State machine: BOOT → MENU → RUN → DEAD → REPLAY → RUN; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier; worst-case
  30 predators + 900 particles ≤ 16.6 ms/frame.
```
