# STARHOOK DRIFT

- **Date:** 2026-08-19 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (games/starhook-drift/ scaffold instead of a one-file build), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `starhook-drift` — target folder `games/starhook-drift/`
- **Genre:** One-thumb physics orbital-swing arcade (tether-fling infinite climber): hold to hook a star's orbit, release to fling tangentially; graze hazards to multiply the combo.
- **Pitch:** You are a bright mote lost in a sea of stars: hook, orbit, fling. Angular momentum makes every perfectly-timed release a screaming slingshot — and the closer you skim an asteroid, the brighter the graze ring, the bigger the combo, the higher the synth climbs.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "MÓC SAO — Starhook Drift".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build STARHOOK DRIFT — an H5 arcade game that meets this repo's
shipping bar: games/starhook-drift/ static site scaffolded from
templates/game-starter/ via /game:new starhook-drift, template engines
unmodified, zero build step, zero runtime network. Core loop: hook a star,
orbit with momentum-conserving physics, fling tangentially, graze asteroids
to feed combo heat. Design targets: 3 s to understand — 30 s to get hooked —
3 min to chase the record; retention scoring loop (near-miss graze rewards,
combo heat, best-score ghost); portal/ad-break/skin slots ready. Anchors:
RESPONSIVE (input → pixel < 16 ms), READABLE (silhouette-first: shape +
color identification within 100 ms, no reading required), REWARDING (juice
scales with skill — playing well must LOOK better). All UI copy in English,
served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. What separates
this from amateur work: determinism (fixed step), zero-GC render, pooled
everything, a replay system, audio with unlock and a studio-grade mix bus.
No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order; run that
iteration's acceptance checklist at its end — on FAIL, fix before advancing;
never ship halfway. Log 'STARHOOK READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/starhook-drift/ from templates/game-starter/ via /game:new
  starhook-drift. Plain ES modules + <script type="module">, served over
  http:// only. Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 portrait design space, HiDPI backing store = cssSize x
  min(devicePixelRatio, 2), letterbox-scale to fit; ctx.setTransform(dpr x
  fit) ONCE at resize, no scaling inside rAF.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation for EVERY
  entity position (never draw raw physics positions). Entities move in
  update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback
  (pointerdown/move/up unify mouse+touch+pen); press → pick the nearest
  anchor star within 300 px; hold → orbit; release → tangential fling;
  12 px dead-zone against finger jitter. The whole game is playable with
  exactly one thumb. touch-action: none on canvas.
- Camera: follow with lerp 1 − exp(−8 x frameDt), 120 px velocity
  look-ahead.
- Procedural spawner: anchor stars + asteroid hazards + score motes from a
  noise field, density scaling with altitude (difficulty = smoothstep of
  altitude); all randomness through engine/rng.js createRng(seed). No
  Math.random() in gameplay code.
- C1: 5 minutes of continuous play — no NaN, no softlock, no falling off
  screen forever.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 prealloc in Float32Array structure-of-arrays (x,y,vx,vy,
  life,size,type), free-list stack, O(1) spawn/despawn, NEVER new/push —
  follow engine/particles.js pool semantics. Comet trail = 24-point ring
  buffer.
- Juice: trauma shake — trauma ∈ [0,1], decay 1.8/s; offset = 14 px x
  trauma², rot = 0.028 rad x trauma², hash-noise by frameIndex (never
  Math.random in RAF). Hazard hit: trauma += 0.6; perfect fling: +0.25.
  Hitstop: timeScale = 0 exactly 70 ms on death / 45 ms on a perfect fling;
  hitstop blocks physics, NEVER render.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily and unlocked on the first pointerdown (mobile autoplay
  policy), suspend on pause, mute state persisted; master chain masterGain →
  WaveShaper soft-clip → DynamicsCompressor (threshold −18 dB, ratio 4:1,
  attack 0.003, release 0.25) → destination. Master never starts > 0.5.
- Music: generative Am pentatonic arpeggio [A3 220.00, C4 261.63, D4 293.66,
  E4 329.63, G4 392.00, A4 440.00] — note index = min(floor(comboHeat/8), 5),
  tempo 96 → 132 BPM with altitude, triangle voice + lowpass sweep. SFX:
  fling = sine sweep 180 → 520 Hz in 90 ms + highpass noise burst; graze =
  880 Hz sine ping, 40 ms decay; death = sawtooth gliss 220 → 40 Hz over
  400 ms + lowpass 4 kHz → 100 Hz; mote unlock = 2-note chime a fifth apart
  (freq x 1.5).
- Readable feedback: comet trail stretches with speed; the latched star
  pulses on the music beat; hazards get a 300 ms warning outline before
  entering the screen.
- C2: (1) SFX/music separable on earbuds; (2) shake nausea-safe (toggle in
  settings); (3) zero allocations in rAF (heap audit); (4) network panel
  shows zero requests beyond the document; (5) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: visibilitychange → hidden pauses the whole loop (discards any
  huge accumulator delta) + audioCtx.suspend(); visible → a 3-2-1 countdown,
  never an instant resume; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('starhook-drift', 1, defaults,
  migrate): schema v1 = { best, runs, settings {mute, shake, lang} }.
  try/catch tolerant to corrupt/cleared storage (corrupt → silent reset);
  migration hook wired. Never raw localStorage. A best-score ghost line is
  drawn at the record altitude.
- Near-miss hitbox −20%: lethal hitbox = 0.8 x r_visual (20% smaller than
  drawn — near-deaths feel FAIR); graze ring = 1.5 x r_visual: entering
  without dying → +1 graze spark + combo heat ("near-death is rewarded").
- Instant replay < 150 ms: ring buffer snapshots at 60 Hz x 3 s as reusable
  struct-of-arrays Float32Arrays; on death the last 0.8 s replays at 0.35x
  slow-mo with a red vignette; time-to-first-replay-frame < 150 ms from the
  death frame (no JSON serialization, no allocation during capture).
- Death flow: hitstop → replay → score breakdown (altitude, graze count,
  max combo) → one-tap restart (< 400 ms from death to playing again).
- Anti-GC: no .map/.filter/.concat/spread/string-concat/new-Object/new-Array
  in the frame loop; all scratch vectors prealloc; verify via Chrome
  allocation profiler: 10 s of gameplay = zero steady-state heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) 20 tab-switches without physics drift; (2) kill the app → save
  intact; (3) replay smooth on weak devices (throttle dpr = 1); (4) storage
  survives a corrupt payload; (5) live language switch rebuilds all labels,
  en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/starhook-drift/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests, procedural assets only, total payload ≤ 5 MB.
   Ships README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: rAF-driven + fixed-step 120 Hz physics; 10-min performance
   trace on mid hardware: zero render frames > 17 ms, no GC stutter.
3. Zero GC in RAF: two heap snapshots 5 min of gameplay apart —
   allocated-between = 0.
4. One-thumb: every interaction via pointer events, hit targets ≥ 48 px,
   fully playable one-handed; touch-action none, scroll/zoom blocked,
   response ≤ 1 frame.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Audio policy: no sound before unlock; mute state persists.
7. Self-playtest 20 runs: no softlock, no NaN (IsFinite assert every 60
   frames in the debug build), death → replay < 150 ms, death → restart
   < 400 ms.
8. Console self-test: C1/C2/C3 all PASS + 'STARHOOK READY'.
9. Definition of done: /game:qa starhook-drift against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         STARHOOK DRIFT
  bootTap       TAP TO START
  tut0          HOLD TO HOOK A STAR — RELEASE TO SLING
  tut1          RELEASE INSIDE THE ARC — PERFECT FLING
  tut2          SKIM THE ASTEROIDS — GRAZE FEEDS THE HEAT
  scoreCap      SCORE      altCap ALTITUDE      bestCap BEST
  heatCap       HEAT
  grazeCap      GRAZE!
  perfectCap    PERFECT FLING!
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  statScore     SCORE      statAlt ALTITUDE      statGraze GRAZES      statCombo MAX COMBO
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: nebula vertical gradient bg #050510 → #1a0b2e → #0f2027 +
  3-layer parallax starfield (120/80/40 stars, alpha 0.9/0.5/0.25); comet
  player gradient #7ef9ff → #b388ff with a white core; anchor stars #ffd166
  with a radial halo; asteroids #ff5d73, craggy procedural polys; graze
  sparks #fff1b8; UI system-ui 700 wide-tracked, white #eef2ff; the combo
  number heats up #7ef9ff → #ffd166 → #ff5d73 with the multiplier.
- Physics: momentum-conserving tether — on latch L = r x v_tangent
  (conserved); ω = L/r²; angular speed rises naturally as you spiral in;
  release v = ω x r tangential (100% of |v| kept). Star gravity wells
  a = GM/d² with GM = 2.4e6 px³/s², cap 2400 px/s², acting only in free
  flight. Pull: when v points into the anchor, r shrinks at 60 px/s — a
  real tug feel. Max speed 1600 px/s; zero air drag (space).
- Combo system: heat H starts 0; each graze +1, each mote +0.5; multiplier
  M = 1 + floor(H/8) cap x12; decay 2.0 H/s after 2 s without a graze;
  score = altitude_m x M + graze x 25 x M; perfect fling (release inside a
  ±15° window, faint arc preview drawn) → H +3 + chime SFX.
- Render order: bg gradient → starfield 3 parallax layers → gravity-well
  glow → motes → hazards → comet trail → comet → graze sparks → tethers →
  UI (score, heat bar ringed around the comet, best ghost).
- State machine: BOOT → MENU → RUN → REPLAY → DEAD → RUN; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: zero frames > 17 ms @1080p/DPR2 mid-tier; every entity
  pooled; one frozen CONFIG object holding every magic number.
```
