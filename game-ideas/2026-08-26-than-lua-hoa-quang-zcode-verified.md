# EMBER VOID

- **Date:** 2026-08-26 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `ember-void` — target folder `games/ember-void/`
- **Genre:** Arcade one-touch · vertical endless scroller · risk-reward hybrid (flame size = hitbox = score multiplier).
- **Pitch:** Hold your finger: the ember blazes, blooms wide, and climbs — and the hitbox swells with your score. Let go: it shrinks, falls, threads the narrow gaps — but a dying flame is death. One thumb, one paradox: the flame is your score, and the flame is your killer.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "THAN LỬA — Hoa Quang Hư Không".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build EMBER VOID — an H5 one-touch vertical endless scroller that meets
this repo's shipping bar: games/ember-void/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Standing goal — commercial product, no amateur
traces: (1) 10-second hook — the player understands the paradox
BIG-FLAME-HIGH-SCORE-FAST-DEATH with a single touch; retry full loop < 1.5 s
to build the "one more run" reflex. (2) Internal metrics must hit before
"done": average session ≥ 3 min, avg retries ≥ 7 per playtest, input-to-photon
< 50 ms. (3) Commercial packaging: 60 FPS locked on mid-range Android Chrome,
zero-allocation steady state, zero external assets, deployable to any static
host, offline-capable. Every design decision serves the risk-profit equation:
high heat → big flame → x8 multiplier → 2.2x hitbox. There is no optimal safe
state — only degrees of greed. All UI copy in English, served from an STR
i18n table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so
the game ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: The agent works autonomously, never asking the
user; each round: build → run the checklist → on FAIL fix within that same
round → PASS before advancing. Log 'EMBERVOID READY' only when FINAL
ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/ember-void/ from templates/game-starter/ via /game:new
  ember-void. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 logical, HiDPI (DPR clamp 2.5, resize handler debounced
  150 ms, orientation-safe).
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), semi-implicit Euler, render(alpha)
  interpolation. Entities move in update() only.
- Input: engine/input.js unified pointer/touch + keyboard fallback. Pure
  one-thumb: pointerdown = HOLD (buoyancy + flame bloom), pointerup/
  pointercancel/blur = RELEASE (gravity + flame shrink); double-tap zoom
  blocked, touch-action: none, preventDefault globally.
- Entities: Ember (the flame), Paper Gates (narrow-gap gates, spawned via
  engine/rng.js createRng(seed) for replayability), Resin Orbs (fuel
  refills), Rain Drops (kill heat). No Math.random() in gameplay code.
- Camera scrolls vertically; death when the core touches a solid or heat
  stays at 0 past 0.9 s. Retry: tap-to-restart < 1.5 s from the death frame.
- C1 VERIFY: (1) 60 fps continuous for 120 s; (2) input works on both mouse
  and touch; (3) no NaN after a 10-minute soak; (4) death→alive loop within
  1.5 s.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 pre-allocated ring-buffer grains (reused, no new in
  RAF): hold sparks, graze sparks, resin dust, ash on death. Follow
  engine/particles.js pool semantics.
- Juice: screen shake trauma model — offset = trauma² x 14 px x noise, decay
  1.8/s; trauma granted by graze-tier-up (0.25) and death (1.0). Hitstop:
  freeze the accumulator 45 ms on combo tier-up, 90 ms on death (replay still
  captures state).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), graph
  masterGain → WaveShaper soft-clip → DynamicsCompressor → destination;
  unlockAudio() on the first gesture (resume + unlock + play a silent
  buffer); suspend on pause; mute persisted. Master never starts > 0.5.
- SFX: graze = a pentatonic run [0,3,5,7,10] semitones over a 220 Hz base —
  tier i plays 220 x 2^(penta[i%5]/12 + floor(i/5)); triangle osc, gain env
  A=5 ms D=220 ms S=0; resin pickup = fifth chord 440 + 660; death = saw
  sweep 180 → 40 Hz over 400 ms + pink-noise burst; background wind =
  filtered noise loop, gain 0.03 modulated by scroll speed. Haptics:
  navigator.vibrate(8) on tier-up, try/catch guarded.
- C2 VERIFY: (1) DevTools allocation recorder logs 0 new objects in 60 s of
  gameplay; (2) audio never blocked by mobile browsers; (3) juice never pushes
  frame p95 past 18 ms; (4) zero network requests beyond the document;
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.hidden → pause (freeze accumulator, suspend
  AudioContext, stop RAF); on visible → 3-2-1 countdown resume, no piled-up
  dt (frame delta clamp max 50 ms) → no tab-switch speed hack; loop.js stall
  clamp guards time jumps.
- Saves via engine/storage.js createStorage('ember-void', 1, defaults,
  migrate): schema v1 = { bestScore, bestCombo, totalRuns, mute,
  audioLatencyOffset, lang }. try/catch on every access (private-mode safe);
  versioned migration hook. Never raw localStorage.
- Near-miss, formalized: corona graze zone = core radius x 1.55; real
  collision uses the core hitbox at −20% of visual (real core = r x 0.8) →
  near-death ALWAYS feels fair.
- Instant replay: ring buffer of 4 s of state snapshots @ 30 Hz (position/
  rotation/event only, 120 pre-allocated slots); on death → playback at 0.5x
  after exactly 150 ms, tap to skip; the replay uses the same renderer — no
  draw-code branching.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3 VERIFY: (1) 20 tab switches without physics drift or audio loss;
  (2) replay smooth and allocation-free; (3) cleared storage → clean boot;
  (4) storage survives a corrupt payload; (5) live language switch rebuilds
  all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL — no item may be dropped) ===
1. Repo-standard layout: games/ember-void/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, 0 external
   requests (no CDN, no fonts, no images, no JSON), offline-capable, total
   payload ≤ 5 MB. Ships README.md (how to run, controls, tuning table) +
   GDD.md from docs/game-design-template.md.
2. 60 FPS locked: mid-range Android Chrome, 100 entities + 512 particles
   simultaneously, frame time p95 < 18 ms, no frame > 33 ms.
3. Zero garbage in RAF: the hot path (update/render/audio-callback) creates
   no object/array/string/closure; verified by 60 s allocation
   instrumentation → zero steady-state allocation.
4. Physics correct: fixed-step 120 Hz + interpolation; determinism — same
   seed → same gate sequence; tab pause never corrupts time.
5. Touch standard: one thumb, input→photon < 50 ms, no text-select /
   300 ms click delay / context menu; scroll/zoom fully blocked.
6. Death→replay→restart: replay starts < 150 ms after death, full restart
   < 1.5 s.
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'EMBERVOID READY'.
9. Definition of done: /game:qa ember-void against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      EMBER VOID / FIREWORKS OF THE VOID
  bootTap       TAP TO IGNITE
  tut0          HOLD TO BLOOM — RELEASE TO THREAD
  tut1          BIGGER FLAME — BIGGER SCORE, BIGGER HITBOX
  tut2          CATCH RESIN — FEAR THE RAIN
  scoreCap      SCORE      bestCap BEST      comboCap COMET
  heatCap       HEAT       tierCap TIER
  grazeCap      GRAZE!
  replayCap     REPLAY     replaySkip TAP TO SKIP
  pausedCap     PAUSED      pauseTap TAP TO RESUME
  countdown     3 / 2 / 1
  deathCap      THE FLAME GOES OUT
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU
  setCap        SETTINGS    setMute SOUND

=== TECHNICAL BLUEPRINT ===
- Palette: bg vertical 3-stop gradient #0B0E1A → #1A1033 → #2B1050 (hue
  shifts with depth, 5 looping zones); ember core radial #FFF3C4 → #FFB347 →
  #FF6B35, outer corona #FF2E63 alpha 0.18; gate wireframe #6C63FF 3 px
  stroke with shadowBlur 12 glow; resin orb #7CFFCB; graze spark #7CFFCB →
  #FFF; danger rain #4FC3F7. UI font: monospace system stack, tabular-nums
  for numbers.
- Physics: gravity 2350 px/s²; hold buoyancy 4100 px/s² (net ascent 1750);
  quadratic drag k = 0.0035·vel·|vel|; horizontal pendulum sway amplitude
  26 px, period 2.4 s; flame radius r = lerp(26, 92, heat) px on the 1080
  canvas; heat += 1.9/s while holding, −= 1.6/s while released, clamp
  [0.12, 1]; fuel exhausted (heat = 0.12 held 0.9 s) → flame out, death.
  Wind field: 2-octave sine sum, amplitude scaling with depth.
- Spawn & difficulty: scroll speed 380 → 720 px/s over 180 s (easeOutQuad);
  gate gap 420 → 260 px; gate spacing 520 → 340 px; every 30 s one new
  modifier (rain, crosswind, gates rotated 15°) drawn from a curve table.
- Combo: graze (corona touches a gate but the core hasn't) +1 Comet + resets
  the 4 s decay timer; tier = min(8, floor(sqrt(comet)/2)); score += 12 x
  tier x dt while tier ≥ 1; resin orb = +15% heat + 50 x tier points; tier
  rendered as a halo ring around the ember, color by tier (gold → white →
  green).
- Audio spec: device sample rate; lookahead scheduler 120 ms via 25 ms
  setInterval (NEVER schedule notes inside RAF); all osc/gain nodes come from
  a reused 32-voice pool.
- Replay buffer: 120 pre-allocated slots, each {t, emberX, emberY, r, heat,
  events bitmask}; written only while running, GC-free.
- Module layout: template scaffold only — game code in src/ organized as
  CONFIG / RNG / POOL / PHYSICS / SPAWN / AUDIO / JUICE / REPLAY / STATE /
  RENDER / INPUT / LOOP modules over the template engines; no frameworks, no
  eval, strict mode; engine/ unmodified.
- State machine: BOOT → TITLE → RUN → DEAD → REPLAY → RUN; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier.
```
