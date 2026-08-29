# POLARITY WAVE

- **Date:** 2026-08-19 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (games/polarity-wave/ scaffold instead of a one-file build), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `polarity-wave` — target folder `games/polarity-wave/`
- **Genre:** Endless neon reflex arcade (polarity-swap runner) — one thumb: drag horizontally to steer a beam of light, quick tap to flip polarity; same polarity passes through and scores, opposite polarity kills.
- **Pitch:** You are a beam of light racing through a neon tunnel: tap to flip between CYAN and MAGENTA, thread the matching gates to chain combos, shave the gate edges for Near-Miss bursts of FLOW — one beat late and you scatter into stardust.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Đảo Cực: Sóng Sáng".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build POLARITY WAVE — an H5 arcade game that meets this repo's
shipping bar: games/polarity-wave/ static site scaffolded from
templates/game-starter/ via /game:new polarity-wave, template engines
unmodified, zero build step, zero runtime network. Core loop: polarity-swap
runner — steer the beam, flip CYAN/MAGENTA to thread matching gates, shave
gate edges for near-miss chains into FLOW. Three design pillars: REFLEX (a
decision every 0.4–1.0 s as speed climbs), FLOW (streak rewards at high
combo), GUT-DROP (near-miss dopamine). All UI copy in English, served from an
STR i18n table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle)
so the game ships multi-language-ready. Commercial hooks and KPIs: D1
retention ≥ 40%, average session ≥ 4 min, deaths/session ≥ 6 (death is
player error, never engine error), input → response ≤ 1 frame, death → retry
< 1.5 s. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order; after each
round, pass that round's acceptance gate — on FAIL, fix at the root before
advancing. Log 'POLARITY-WAVE READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/polarity-wave/ from templates/game-starter/ via /game:new
  polarity-wave. Plain ES modules + <script type="module">, served over
  http:// only. Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 design space, DPR-aware (ctx.setTransform by
  devicePixelRatio, clamp ≤ 2.5), letterbox keeps the ratio, resize safe on
  orientation change.
- Sim: engine/loop.js fixed timestep — SIM_DT 1/120 s, maxSubSteps 4 (frame
  clamp ≤ 250 ms, surplus discarded), render interpolation alpha for every
  entity: x_render = x_prev + (x − x_prev) x alpha. Entities move in
  update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. Pointer
  move sets the steering target on X; pointer-up with press time < 200 ms
  and movement < 12 px counts as TAP → polarity flip. touch-action: none on
  canvas.
- Gameplay: vertical scroll — the beam rides the screen axis; paired
  CYAN/MAGENTA gates spawn; same polarity = pass through + score, opposite
  polarity = death; soft bounces off both side walls.
- Minimal UI: title → play → game over → restart (all strings from STR).
- C1: 60 s of hand play is smooth, no interpolation stutter, taps never
  swallowed, deaths always player-error.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 pre-allocated (spawn resets fields only, no new) — follow
  engine/particles.js pool semantics; trail ribbon drawn from a 24-point
  ring buffer with globalCompositeOperation 'lighter'.
- Juice: trauma-model screen shake — offset = 26 x trauma² x noise, trauma
  decays at 2.2/s. Hitstop: 70 ms sim freeze on death, 40 ms micro-hitstop
  on combo tier-up.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily and unlocked on the first user gesture, suspend on pause,
  mute state persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination. Master never starts > 0.5.
- Synth table: polarity flip = square gliss 220 → 880 Hz / 60 ms; score =
  sine on the C pentatonic [523.25, 587.33, 659.25, 783.99, 880] Hz, index =
  chain mod 5, decay 0.12 s; near-miss = triangle ping 1318.5 Hz; death =
  sawtooth fall 440 → 55 Hz / 300 ms + noise burst through an 800 Hz
  bandpass; music bed = 2 saws detuned ±0.7 Hz at 110 Hz through a 380 Hz
  lowpass, LFO 0.1 Hz depth 120 Hz; FLOW mode: +1 octave + 16th-note noise
  hats at gain 0.05.
- C2: (1) every game event answers with audio + visual feedback;
  (2) audio plays on the very first touch, no buzz/rattle; (3) network panel
  shows zero requests beyond the document; (4) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: tab hidden → pause the sim + suspend audio; on return a 3-2-1
  countdown; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('polarity-wave', 1, defaults,
  migrate): schema v1 = { best, totalRuns, settings {muted, lang},
  dailySeed }. Versioned + try/catch tolerant to corrupt/cleared storage;
  migration hook wired. Never raw localStorage. The Daily Challenge seed is
  derived from the date string and driven through engine/rng.js
  createRng(seed) (seeded, reproducible runs). No Math.random() in gameplay
  code.
- Near-miss hitbox −20%: lethal hitbox shrunk 20%; the 100–120% edge band =
  NEAR MISS +50% points, +1 chain, 120 ms slow-mo at 0.3x.
- Instant replay: 150-frame ring buffer of player position + hazards; ghost
  replay on death with total latency < 150 ms before the game-over screen.
- Difficulty curve: scroll speed v = 420 + 9 x sqrt(t) px/s, cap 1180;
  spawn interval T = clamp(1.05 − 0.018 x level, 0.38, 1.05) s.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free; (2) replay visible < 150 ms after death;
  (3) storage survives a corrupt payload; (4) profiler shows zero RAF
  allocations; (5) live language switch rebuilds all labels, en table
  complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/polarity-wave/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests, procedural assets only, total payload ≤ 5 MB.
   Ships README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked @1080p HiDPI (DPR 2) on 2021 mid-range Android Chrome:
   frame budget 16.6 ms, sim ≤ 4 ms, render ≤ 8 ms.
3. Zero GC in RAF: every entity/particle/vector drawn from pools, no
   closures/strings/arrays created in the hot loop, no map/filter/concat/
   slice per frame — verified by Chrome DevTools allocation instrumentation:
   10 s of gameplay = 0 allocations on the RAF call stack.
4. Touch: unified pointer events, audio unlocked on the true first gesture,
   ghost-touch resistant, input → response ≤ 1 frame, scroll/zoom/
   double-tap-zoom fully blocked.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Death → retry < 1.5 s; all constants centralized in a CONFIG object,
   seedable RNG, pure collision functions kept testable.
7. Console self-test: C1/C2/C3 all PASS + 'POLARITY-WAVE READY'.
8. Definition of done: /game:qa polarity-wave against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      POLARITY / WAVE
  bootTap       TAP TO START
  tut0          DRAG TO STEER — TAP TO FLIP
  tut1          MATCH THE GATE COLOR — MISMATCH IS DEATH
  tut2          SHAVE THE GATE EDGE — NEAR-MISS FEEDS FLOW
  scoreCap      SCORE      chainCap CHAIN      bestCap BEST
  nearCap       NEAR MISS!
  flowCap       FLOW!
  dailyCap      DAILY CHALLENGE
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: vertical gradient bg #05060E → #0B1026 → #1A0B2E (FLOW mode
  hue-shift +30°); neon CYAN #00F0FF, MAGENTA #FF2E88, combo gold #FFD166,
  death #FF3B3B, beam core #FFFFFF, glow shadowBlur 24 in the matching hue.
- Steering physics: spring-damper a = −k x (x − target) − c x vx with
  k = 140, c = 18; flip cooldown 120 ms; polarity swap eased over 80 ms
  ease-out.
- Combo: points = 10 x mult, mult = 1 + floor(chain/8) cap x8; FLOW at
  chain 24 = x2 bonus.
- HUD: monospace system font; combo number pop scale 1.4 → 1.0 over 150 ms.
- State machine: BOOT → TITLE → RUN → GAMEOVER → RUN; PAUSE overlay anytime
  (button + visibilitychange).
- Perf budget: frame budget 16.6 ms, sim ≤ 4 ms, render ≤ 8 ms
  @1080p/DPR2 mid-tier; zero allocations in the frame path.
```
