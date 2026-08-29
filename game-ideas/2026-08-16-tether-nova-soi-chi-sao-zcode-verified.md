# TETHER NOVA

- **Date:** 2026-08-16 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `tether-nova` — target folder `games/tether-nova/`
- **Genre:** Arcade endless vertical — tether-orbit-fling precision climber (one thumb, physics-driven, score-chase).
- **Pitch:** Hold your thumb to lasso the nearest star and swing around it; release at exactly the right moment to fling tangentially upward, climbing forever up the nebula well. Every 'perfect' release and every hazard-skimming graze pushes the synth and the combo higher — Super Hexagon meets Spider-Man, one more run at a time.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "TETHER NOVA: Sợi Chỉ Sao".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Tether Nova — an H5 commercial arcade endless-vertical
'tether-orbit-fling' climber that meets this repo's shipping bar:
games/tether-nova/ static site scaffolded from templates/game-starter/ via
/game:new, template engines unmodified, zero build step, zero runtime network.
Core loop: HOLD to tether-orbit the nearest anchor node, RELEASE to fling
tangentially upward, climb endlessly up the nebula well; you lose by falling
out of the camera frame. Commercial KPIs: juice felt within the first
3 seconds, combo depth of 30 s, ≥ 4 runs/day average, sessions ≥ 6 minutes,
monetization hooks pre-built without refactor (rewarded revive after death,
interstitial every 3 runs, skin shop) plus a local leaderboard. All UI copy in
English, served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. No stubs, no
TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'TETHER-NOVA READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/tether-nova/ from templates/game-starter/ via /game:new
  tether-nova. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: logical 1920×1080, scale by devicePixelRatio (cap 2.0) for sharp
  HiDPI; letterbox fit.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Physics: gravity g = 2200 px/s² downward. On HOLD: find an anchor within a
  420 px catch radius (prefer above), attach the tether; angular velocity
  ω = sign of cross(r × v) × (6.2 + 140/max(r, 60)) rad/s; the tether radius
  reels in r(t) = r0 − 180·t (floor 70 px) — a rubber-band tension feel.
  On RELEASE: v_fling = ω·r along the tangent, minus a deliberate 4% deficit
  so gravity always wins if you never let go — the 'always act' mechanic.
- Camera only climbs: y_cam = min(y_cam, player.y − 520), lerp 0.08.
- Input: engine/input.js unified pointer/touch + keyboard fallback — one
  thumb: pointerdown/pointerup/pointercancel anywhere on screen; block
  contextmenu/gesture/scroll; touch-action: none. No UI during RUN may ever
  require a second finger.
- State machine: BOOT → MENU → RUN → DEATH → REVIVE_OR_MENU.
- All randomness through engine/rng.js createRng(seed) (seeded mulberry32 for
  anchor layout + hazards). No Math.random() in gameplay code.
- C1: (1) stable 60 fps desktop; (2) physics does not drift when switching
  tabs mid-run; (3) hold/release tether physics matches the formulas above;
  (4) input→response ≤ 1 frame.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 pre-allocated (latch sparks, release ring-bursts,
  near-miss dust) — zero new in the loop. Follow engine/particles.js pool
  semantics.
- Juice: trauma shake system — trauma += 0.4 on latch, += 1 on death; offset
  = trauma² × 26 px × noise, decay 2.2/s (never offset the canvas with raw
  per-frame random); hitstop: timeScale = 0 for 45 ms on a perfect fling,
  70 ms on near-miss, 120 ms on death (stop consuming the accumulator, never
  stop rAF).
- Player trail: a 32-point strip with a fading cyan → magenta gradient.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on the first pointerdown (resume + 2 silent noop notes
  inside the user gesture), suspend on pause, mute state persisted; master
  chain masterGain → WaveShaper soft-clip → DynamicsCompressor →
  destination. Master never starts > 0.5.
- Music & SFX (100% procedural): BGM = a pentatonic 5-note sequencer on A3
  220 Hz, note freq f = 220 × 2^(n/12) over scale degrees [0, 3, 5, 7, 10],
  up one octave every 8 combo; latch = triangle pluck 180 Hz decay 0.12 s;
  release = sawtooth sweep 240→680 Hz 0.18 s; near-miss = noise burst
  highpass 3 kHz, 60 ms; death = sub sine 90→30 Hz 0.6 s.
- C2: (1) music audible from the first touch, no crackle; (2) juice never
  drops the game below 60 fps; (3) network panel shows zero requests beyond
  the document; (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.hidden → pause everything (freeze the accumulator,
  suspend the AudioContext); resume with a 3-2-1 countdown against unfair
  deaths; leaving a tab for 10 s causes no time jump on return.
- Saves via engine/storage.js createStorage('tether-nova', 1, defaults,
  migrate): schema v1 = { best, runs, settings {volume, muted, lang} }.
  Write-blocking guarded with try/catch; migration hook wired. Never raw
  localStorage.
- Near-miss fairness: real danger hitbox = 80% of drawn size (−20%);
  near-miss zone = 100% → 120% — grazing a hazard inside this zone grants
  +2 combo (balanced risk-reward).
- Instant replay < 150 ms: ring buffer of 150 ms × 60 slots of player +
  hazard positions; on death, a 0.5× slow-motion replay plays for 1.2 s,
  then the DEATH UI.
- Anti-GC: no object/array/closure allocations in rAF (pools + reused scratch
  vectors); verified via 3 memory heap snapshots with zero growth delta in
  steady state — Zero-GC-RAF is an absolute condition.
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
1. Repo-standard layout: games/tether-nova/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked on Chrome mobile; zero GC in RAF steady state (heap
   snapshots ×3, delta = 0).
3. Deterministic physics: same seed + same input → identical run.
4. One-thumb fully playable end-to-end; no UI needs a second touch during
   RUN; touch-action none.
5. Tab pause safe: 10 s away, back with no time jump and no unfair death.
6. Commercial hooks present as working local stubs: revive button, banner
   after 3 runs, skin swapper (purely local).
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'TETHER-NOVA READY'.
9. Definition of done: /game:qa tether-nova against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         TETHER NOVA
  bootTap       TAP TO START
  tutHold       HOLD TO ORBIT THE NEAREST STAR
  tutRelease    RELEASE AT THE TOP TO FLING UPWARD
  scoreCap      SCORE      bestCap BEST      comboCap COMBO
  newBest       NEW BEST!
  reviveCap     REVIVE
  resCap        RESULTS
  altCap        ALTITUDE      maxCombo MAX COMBO      nearCap NEAR MISSES
  overTap       TAP TO TRY AGAIN
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  setSound      SOUND      setVolume VOLUME      shopCap SKINS

=== TECHNICAL BLUEPRINT ===
- Palette: nebula-well vertical gradient #05060F → #150B2E → #3D1F5C; 3-layer
  parallax background stars; player comet #22D3EE (neon cyan) with white core
  #F8FAFC; tether gradient #22D3EE → #F472B6 (magenta); anchor node amber
  #FBBF24 pulsing; hazard blade red #EF4444 with rim #FCA5A5; UI font stack
  system-ui, letter-spacing 0.2em, uppercase — premium arcade feel.
- Core formulas: score = altitude meters (y/100) × multiplier; perfect-fling
  = released within a ±12° optimal angular window measured from straight up
  through the anchor center → +1 combo, +40 ms hitstop, ring flash; near-miss
  → +2 combo, +70 ms hitstop, zoom-pulse 1.04×; the combo chain dies after
  4 s without feeding; multiplier = 1 + floor(combo/5), cap ×12; every ×2
  milestone → background key change + particle burst.
- Difficulty curve: node spacing thins 420 px → 300 px with altitude; from
  800 m sin-moving nodes appear; from 1500 m rotating blades; from 2500 m
  local gravity wells pull the player off-line (extra accel a = 5200/r²
  toward well centers). Everything stays fair: spawns are seeded and there is
  always a safe path with ≥ 2 anchor choices.
- HUD: score top-center; combo meter as thin bars along the side borders;
  the high-water line (previous record) drawn faintly in the world — with a
  shimmer when you pass it ('one more time' feel).
- Anti-frustration: 2 'assist snap' latches with +15% radius during the first
  30 s of each run for newcomers; DEATH screen shows 3 stats (altitude, max
  combo, near-miss count) + the revive button.
- State machine: BOOT → MENU → RUN → DEATH → REVIVE_OR_MENU; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier; 512-particle
  pool + 60-slot replay buffer allocated once at boot; batched canvas ops,
  no redundant state changes between draw calls.
```
