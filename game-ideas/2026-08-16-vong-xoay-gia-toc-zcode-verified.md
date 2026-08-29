# ANGULAR RUSH

- **Date:** 2026-08-16 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `angular-rush` — target folder `games/angular-rush/`
- **Genre:** One-thumb polar arcade runner (angular-momentum conservation × graze near-miss economy).
- **Pitch:** You are a comet circling an energy core across 3 concentric rails; one-tap hops move between them — hop inward and you spin FASTER by conservation of angular momentum (a skater pulling in her arms): the faster you spin, the closer to death, and the more near-miss points you can shave off the hazards. Your heartbeat syncs to a rising drone; every hop is a wager between momentum and the reaper.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Vòng Xoay Gia Tốc — Angular Rush".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Angular Rush — an H5 commercial arcade one-thumb polar runner
that meets this repo's shipping bar: games/angular-rush/ static site
scaffolded from templates/game-starter/ via /game:new, template engines
unmodified, zero build step, zero runtime network. USP: angular-momentum
conservation (hop inward → spin faster) fused to a near-miss graze economy.
One addictive loop rules every feature: RISK (spin fast) → REWARD (graze ×
combo) → PEAK (overdrive) → DEATH → ONE MORE. Portal-packaging quality:
60 fps locked, 0 GC in RAF, meta-progression, instant replay, full settings.
All UI copy in English, served from an STR i18n table with reserved 'vi'/'lo'
slots (pattern: games/gravity-juggle) so the game ships multi-language-ready.
No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration; on the 3rd failure keep the spec, simplify the
implementation). Log 'ANGULAR-RUSH READY' only when the FINAL ACCEPTANCE
checklist has been printed as a PASS/FAIL table and everything passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/angular-rush/ from templates/game-starter/ via /game:new
  angular-rush. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: logical 1080×1920, portrait; CSS 100dvh, overscroll-behavior none;
  HiDPI backing = 1080 x min(devicePixelRatio, 2) with setTransform(scale);
  block double-tap-zoom + long-press menu; touch-action: none.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded; frameDelta clamp ≤ 250 ms so tab
  switches never explode physics), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback —
  pointerdown ONLY (normalized pointer/mouse/touch): tap = hop to the next
  rail in the cycle R1→R2→R3→R1; the R3→R1 hop is a SLINGSHOT (speed
  privilege, see BLUEPRINT). Only the first pointer is accepted, later
  pointers ignored (anti-palm guard).
- FSM: BOOT → MENU → RUN → PAUSE → REPLAY → DEAD; restart is fully clean (no
  leaked objects, no duplicate listeners).
- Polar physics per fixed step: θ += ω·dt; r via spring integration;
  collisions computed DIRECTLY in polar coordinates (cheaper than Cartesian).
- Spawner: hazard arcs placed ahead in θ within the upcoming 2π window;
  recycled once passed. All randomness through engine/rng.js createRng(seed)
  (seeded, deterministic runs). No Math.random() in gameplay code.
- C1: (1) plays smoothly 120 s with no NaN/Infinity; (2) physics steps even;
  (3) learn-to-play ≤ 5 s (one hand icon + an auto-playing demo after 3 s
  idle in the menu); (4) 60 fps desktop.

=== ITERATION 2 — JUICE & AUDIO ===
- Pools: 512 particles + 24 shockwaves + 16 floating texts, all pre-allocated
  (free-list, batch-drawn by color) — 0 allocation in RAF. Follow
  engine/particles.js pool semantics.
- Comet trail: ring buffer of 24 points, tapered gradient line; 2-layer
  parallax starfield (64 + 32 points) drifting against ω to amplify the
  rotation feel.
- Juice: trauma shake — shake = trauma²; offset = shake·18 px, rotation
  ±shake·0.8°, noise = sin(t·47.3) + sin(t·31.7) per axis; decay 2.2/s;
  events: graze +0.12, hop +0.05, tier-up +0.35, death +0.7; each shake
  event ≤ 250 ms (never nausea-inducing). Hitstop (timeScale = 0): death
  120 ms, tier-up 60 ms, every ×10 combo milestone 45 ms; NO hitstop for
  ordinary grazes (it would break the rhythm).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on the first pointerdown (resume again on visible), suspend
  on pause, mute state persisted; master chain masterGain → WaveShaper
  soft-clip → DynamicsCompressor (threshold −18 dB, ratio 8, knee 6 dB) →
  destination. Master never starts > 0.5. ALL nodes/voices pre-allocated at
  init (×8 voices per role); no AudioNode created after init. Zero-click
  rule: envelope attack/release ≥ 5 ms, never a pop.
- Synth (full table in BLUEPRINT): momentum drone of 2 saws 55.0/55.5 Hz
  through a lowpass whose cutoff maps to ω — the player HEARS how fast they
  are; graze pings climb a pentatonic ladder with combo; overdrive opens a
  1/16 arpeggio layer.
- C2: (1) high vs low ω is distinguishable by ear when changing rails;
  (2) 0 alloc/frame verified by a 60 s heap snapshot; (3) network panel
  shows zero requests beyond the document; (4) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document hidden or window blur → auto PAUSE + audio suspend;
  a PAUSED overlay — tap to continue (never auto-resume, never an unfair
  death).
- Saves via engine/storage.js createStorage('angular-rush', 1, defaults,
  migrate): schema v1 = { best, totalRuns, sparksTotal, palettesUnlocked [],
  settings {audio, shake, motion, lang} }. try/catch with quota-full
  fallback to defaults; migration hook wired. Never raw localStorage.
- Near-miss fairness: visual r = 26 px → lethal r = 20.8 px (−20%); graze
  band 20.8–34 px; one graze per hazard per pass; debug overlay (?debug=1 or
  pressing H) draws both hitboxes for acceptance.
- Instant replay < 150 ms: ring buffer of 90 snapshots @ 30 Hz (3 s),
  pre-allocated Float32Array overwritten in place (0 copy garbage); on death
  the last 2.2 s replay at 0.35× slow-mo through the same render pipeline;
  tap to skip.
- Anti-frustration: 0.8 s spawn-grace after start/restart; in-game settings
  — audio / shake / reduced-motion (−50% particles) / palette — all applied
  instantly, no reload.
- Anti-GC: 10 minutes of gameplay = 0 bytes allocated in the update/render
  path (allocation allowed only at init/menu/restart); heap drift ±2% over
  30 minutes; hot path forbids string concat, array/object literals,
  closures, DOM access — HUD updates only via dirty-flag.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives
  in STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read
  via t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) replay starts < 150 ms after
  death; (3) storage survives a corrupt payload and quota-full writes;
  (4) profiler shows zero RAF allocations, 50 tab switches register no
  duplicate listeners; (5) live language switch rebuilds all labels, en
  table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/angular-rush/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests (no remote fonts/images/icons, no eval), procedural
   assets only, total payload ≤ 5 MB. Ships README.md (how to run, controls,
   tuning table) + GDD.md from docs/game-design-template.md.
2. 60 fps @ 1080p HiDPI (dpr ≤ 2) on Chrome Android mid-range; CPU frame
   ≤ 8 ms; never more than 2 consecutive dropped frames with 300 particles +
   20 hazards active.
3. Zero GC in RAF steady state (allocations only at init/menu/restart);
   8-hour soak with no exception/NaN/Infinity; resize/rotate ×20 never breaks
   the canvas; broken/full storage → game runs on defaults.
4. One-thumb fully playable: pointerdown → visible change ≤ 1 frame, touch
   target ≥ 96 px logical, double-tap-zoom and context menu fully blocked.
5. Determinism: fixed-step + seeded RNG → the same input script yields the
   same result (self-test: 10,000 taps from a fixed seed, hash the state,
   re-run, hashes must match).
6. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
7. Commercial UX: death → tap restart ≤ 400 ms; BEST + NEW BEST + a
   "TOP {pct}% OF RUNS" line using the softener 100·(1−e^(−best/2200)); meta
   unlock conditions visible in UI.
8. Console self-test: the AC checklist prints PASS/FAIL per criterion +
   'ANGULAR-RUSH READY'.
9. Definition of done: /game:qa angular-rush against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         ANGULAR RUSH
  bootTap       TAP TO START
  tutHop        TAP TO HOP RAILS — INWARD SPINS FASTER
  tutGraze      GRAZE THE HAZARDS FOR COMBO — NEVER TOUCH THEM
  scoreCap      SCORE      bestCap BEST      tierCap TIER      comboCap COMBO
  chainBreak    CHAIN BREAK
  overdriveCap  OVERDRIVE
  newBest       NEW BEST!
  beatPct       TOP {pct}% OF RUNS
  pauseCap      PAUSED      pauseTap TAP TO CONTINUE
  resCap        RESULTS
  btnRetry      RETRY      btnMenu MENU
  setSound      AUDIO      setShake SHAKE      setMotion REDUCED MOTION
  paletteCap    PALETTE

=== TECHNICAL BLUEPRINT ===
- Space & render: logical 1080×1920; core at (540, 700); 3 rails at radii
  170 / 280 / 390; hazards are arcs ON the rails (walls static in θ, blades
  self-rotating, gates blinking) — the player rotates into them; distance =
  arc length traveled. Render order: bg gradient → grid rings → hazards →
  sparks → trail → player → particles → shockwaves → floating text →
  vignette + flash overlays → HUD. Vignette pre-rendered once to an offscreen
  canvas and drawImage'd per frame; HUD touched only on value change
  (dirty-flag).
- Palette NEBULA (default): BG radial 3-stop #05060F (0%) → #0B1026 (55%) →
  #131A3A (100%); rings rgba(148,163,184,0.08); core conic dashes #22D3EE →
  #A78BFA rotating 0.3 rad/s; player #F8FAFC; trail #F8FAFC → #67E8F9 →
  transparent; walls #FB7185; blade #F472B6; pulse gate #FB923C; spark
  #FDE68A; graze spark #A5F3FC; overdrive tint #FEF3C7 alpha 0.06 ('lighter'
  composite); death flash #FEF08A for 90 ms. Unlocks by best: SUNSET (≥ 1500)
  bg #1A0B2E → #3B0D2E, accents #FBBF24/#F87171/#FCA5A5; TOXIC (≥ 4000) bg
  #041F10 → #0B2E13, accents #A3E635/#22D3EE/#FDE047; GOLD (≥ 10000) bg
  #141003 → #2E2308, accents #FCD34D/#FDE68A/#FFF7DB.
- Physics formulas (rad, s, logical px): θ(n+1) = θn + ω·dt. Hop spring:
  r'' = −k·(r − r_target) − c·r' with k = 180 s⁻², c = 2·0.85·√k ≈ 22.8 s⁻¹
  (lightly underdamped, springy); hop cooldown 90 ms. ANGULAR MOMENTUM
  CONSERVATION on arriving at the target rail: ω_new = ω_old·(r_old/r_new)² —
  R2→R1: ω ×2.71 (heats up); R2→R3: ω ×0.52 (breathes). SLINGSHOT R3→R1:
  apply the formula, then ω ×1.15, then clamp ω ∈ [0.9, 4.2] rad/s. Baseline
  relaxation against divergence: ω_base(r) = 1.6·(280/r)²; each step
  ω += (ω_base − ω)·dt/4 (4 s constant) — the slingshot is a TEMPORARY
  advantage to exploit immediately. Distance: m += ω·r·dt/50; tier =
  floor(m/500).
- Polar collision: Δθ_eff = atan2(sin(θp − θh), cos(θp − θh)); death when
  |Δθ_eff| < (halfArc + angularHalfPlayer) AND |r_player − r_rail| <
  20.8 + halfThickness. Pulse gate kills only on the closed phase (cycle
  1.6 s, duty 55%, phase-locked to spawn time so the rhythm is READABLE).
  Blades carry their own ω_h ∈ ±[0.4, 1.1] rad/s.
- Spawner & difficulty: interval T(m) = max(0.55, 1.4·0.93^tier) s per
  hazard; minimum angular gap = max(14°, 30°·0.94^tier); rail allocation
  45/35/20% (R1 hardest, compensated by grazeMultiplier R1 = 1.5, R2 = 1.0,
  R3 = 0.8 — playing the inside pays). Hazard unlocks by tier: wall (t0),
  blade (tier ≥ 2), pulse gate (tier ≥ 4), double-wall (tier ≥ 6), eclipse
  (tier ≥ 8: darkness 0.5 s every 10 s, only the trail glows). Sparks spawn
  30% of intervals, ALWAYS inside a safe gap (never a trap).
- Combo & scoring: graze +1 combo, +25·mult; spark +2 combo, +50·mult;
  survival +10·mult per second; tier-up +200·mult; grazing mid-hop between
  rails ×1.5. Combo window 2.5 s (reset per graze/spark); expiry = CHAIN
  BREAK (combo 0, floating text, descending sound). mult = 1 +
  min(floor(combo/5), 7) → max ×8. OVERDRIVE at combo ≥ 20: total score ×2,
  arpeggio layer, #FEF3C7 tint, trail flares.
- Synthesizer (0 assets, ×8 voices per role pre-allocated): graph [drone bus
  + sfx bus] → compressor → master 0.4 → destination. Momentum drone: 2 saws
  55.0 Hz + 55.5 Hz (0.5 Hz beat) → lowpass Q=8, cutoff = 200 + 2200·
  (ω − 0.9)/(4.2 − 0.9) Hz, gain 0.14; overdrive adds a 27.5 Hz sub at gain
  0.06. Graze ping: A-major pentatonic f = 440·2^(s/12), s ∈ {0, 2, 4, 7, 9};
  note = combo mod 5, octave = min(floor(combo/5), 2); triangle, attack 5 ms,
  decay 0.18 s, gain 0.12. Hop: noise bandpass 800 Hz Q4 60 ms + sine 90 Hz
  thump 90 ms, gain 0.18; slingshot adds a sine sweep 220→440 Hz 120 ms.
  Spark: sine gliss 1320→1760 Hz 80 ms gain 0.1. Tier-up: chime 660/880/1320
  Hz staggered 50 ms triangle gain 0.15. Death: saw sweep 220→30 Hz 0.6 s
  (exponentialRamp) + noise crash lowpass 400 Hz 0.5 s gain 0.3; drone fades
  to 0. Chain break: 392→262 Hz sine 120 ms. Menu tap: 990 Hz square 40 ms
  gain 0.06.
- Juice patterns: graze → 3 particles #A5F3FC; spark → 6 particles #FDE68A +
  shockwave; death → 64 particles + double shockwave + flash #FEF08A; after a
  big hitstop the player draws as 2 layers offset 2 px at alpha 0.25 for
  90 ms (fake chromatic). Floating text: system font stack, tabular numbers.
- Replay data layout: Float32Array ring of 90 slots — each slot = player
  {t, θ, r, ω, alive} + 64 hazards × 4 floats (θ, halfArc, rail, type),
  overwritten circularly; playback only READS and redraws via the existing
  render pipeline (never re-runs physics).
- Module architecture (per the template scaffold, plain ES modules):
  CFG (frozen) → rng → Pools (Player, Hazard, Spark, Particle, Shockwave,
  FloatText, ReplayRing) → AudioBus {init, unlock, sfx, setMomentum(ω)} →
  Input → Systems: physics(dt), spawner(dt), collision(dt), scoring(dt),
  juice(dt) → render(alpha) → FSM → Save {load, save, migrate} → Boot.
- Debug mode: ?debug=1 (or press H) shows FPS meter, visual/lethal −20%
  hitboxes, allocation counter.
- State machine: BOOT → MENU → RUN → PAUSE → REPLAY → DEAD; PAUSE overlay
  anytime (button + visibilitychange/blur).
- Perf budget: CPU frame ≤ 8 ms @1080p/DPR2 mid-tier; batched canvas ops, no
  redundant state changes between draw calls; all tunables in one frozen CFG.
```
