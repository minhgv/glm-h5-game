# Boundless Orbit

- **Date:** 2026-08-21 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `boundless-orbit` — target folder `games/boundless-orbit/`
- **Genre:** Arcade orbital survival, one-thumb (hold/release) — inertial orbital physics + graze-to-score + rhythm survival.
- **Pitch:** Hold your finger to spiral in toward the glowing core, release to fling outward — the closer you get, the more insanely fast you orbit, by conservation of angular momentum; and the closer you shave past meteors, the more monstrous your score multiplier grows. One finger, one heartbeat reflex, a thousand 'one more run's.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Quỹ Đạo Vô Cực".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Boundless Orbit — an H5 arcade game that meets this repo's
shipping bar: games/boundless-orbit/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: one-thumb orbital survival — hold to
spiral inward, release to drift out, graze hazards for HEAT. All UI copy in
English, served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. Commercial bar:
tap-to-play < 1 s, sessions of 45–90 s, D1 retention target ≥ 40%, smooth on a
2 GB-RAM Android with a 360 px screen. Separators from amateur work: a real
juice pipeline (pool–shake–hitstop), procedural 0-asset audio, GC discipline,
full pause/replay/persistence. No server, no external assets, no remote fonts.
No stubs, no TODOs, no scope cuts.

=== GAME SPEC ===
- Single input: HOLD (pointerdown) = centrifugal brake, radius shrinks, spiral
  into the core; RELEASE (pointerup) = drift outward. The player controls
  RADIUS; angular speed is a physics consequence.
- The player is a violet comet circling a golden core at screen center;
  collect stardust (gold), dodge meteors (magenta) and CORE PULSES — circular
  shockwaves fired exactly on the background music's BPM beat.
- CORE FEEL: conservation of angular momentum L — shrink the radius and you
  spin MADLY faster (hunting points near the core = more dangerous, higher
  multiplier). Pure physical risk-reward.
- GRAZE TO SURVIVE: sweeping through a hazard's glow zone without touching the
  death hitbox → HEAT rises. Heat decays 2.0/s, forcing the player to take
  risks constantly. At full heat 12, a double-tap triggers SUPERNOVA: hitstop
  250 ms, the background gradient inverts, every hazard on screen explodes
  into stardust.
- Death: a real collision → 64-particle shatter + instant replay < 150 ms +
  back to menu within 2 s, looping instantly (brain F5: 'this run I graze
  more').
- Light meta: daily seed (the same meteor timeline for everyone each day —
  compare scores with friends), best score, mute, play count.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. Finish each
iteration, self-verify its DoD before advancing; any FAIL is fixed IMMEDIATELY
inside that iteration, no debt carried forward. After each iteration, open the
Debug Overlay (~ key), measure, tick the checklist, then continue. Log
'BOUNDLESS-ORBIT READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/boundless-orbit/ from templates/game-starter/ via /game:new
  boundless-orbit. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: internal 1080x1920, DPR clamp [1, 2.5], letterbox scale-to-fit keeping
  aspect, 2D context { alpha: false, desynchronized: true }. Core at (540, 960).
- Sim: engine/loop.js fixed timestep — stepHz 120 (SIM_DT = 1/120 s),
  maxSubSteps 4 (surplus discarded, spiral-of-death guarded), render
  interpolation with alpha = acc/SIM_DT. Entities move in update() only;
  render code never mutates state.
- Input: engine/input.js — one single pointerdown/pointerup pair over the
  whole screen, touch-action: none, contextmenu/select/zoom gestures blocked,
  no coordinate hit-test needed; keyboard fallback for desktop. Double-tap
  reserved for SUPERNOVA.
- Orbital physics (px in the 1080x1920 space): hold → r −= 260·dt; release →
  r += 200·dt; clamp r ∈ [120, 880]; L conservation: omega = L / r² with
  L = 5.0e5 px²/s (self-calibrates so a lap at r = 400 ≈ 2 s and at r = 200
  ≈ 0.5 s; clamp omega ≤ 14 rad/s). Position: angle += omega·dt;
  x = 540 + r·cos, y = 960 + r·sin.
- Spawner director via seeded RNG (mulberry32 — engine/rng.js createRng —
  seeded with the FNV-1a hash of the YYYYMMDD string for the daily seed):
  BPM 100 → 180 over elapsed time, hazard density proportional to
  elapsed^0.85, anti-cluster rule: never more than 2 hazards within a 60° arc
  in the same radius band → a live path always exists.
- Render primitives: 3 precomputed parallax star layers, core pulsing its
  scale on the beat, comet + 24-point ring-buffer trail, round magenta
  hazards, gold stardust, core pulse as an expanding circle.
- Collision: circle-circle inside the 1/120 substep (swept thanks to the small
  step).
- C1 (DoD): (1) runs 10 minutes without crashing; (2) changing r never
  'teleports' position; (3) disabling interpolation must show VISIBLE stutter
  (proves interpolation is alive); (4) the same seed reproduces the same
  timeline.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 preallocated as structure-of-arrays (Float32Array x,
  y, vx, vy, life, maxLife, size, colorIndex) + ring-cursor recycle.
  Absolutely NO new in the loop; the comet trail is also a fixed ring buffer.
  Follow engine/particles.js pool semantics.
- Juice: trauma-model screen shake — shake = trauma², decay 1.6/s, offset =
  shake x 18 px x noise(−1..1), canvas rotation = shake x 0.015 rad; graze
  +0.15, death 1.0, nova 0.7. Shake applies to world-space, NEVER to UI.
  Hitstop: timeScale = 0 for 60 ms (big graze) / 120 ms (nova charge) /
  250 ms (death); hitstop freezes physics only — spark particles keep running
  (far more valuable that way). Juice timers run on a separate clock so
  interpolation survives.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created + unlocked at the first pointerdown (resume + play one silent
  sample), suspend on pause, mute state persisted; master chain masterGain →
  DynamicsCompressor → destination; master never starts > 0.5. Game-specific
  bus layout on top: musicBus → DelayNode 0.28 s feedback 0.35 (space echo) →
  compressor; sfxBus straight into the compressor.
  · 16-step sequencer, A minor pentatonic: A2 = 110, C3 = 130.81, D3 = 146.83,
    E3 = 164.81, G3 = 196, A3 = 220. Kick = sine pitch-env 150 → 40 Hz over
    90 ms on beat 1; hat = 8 ms noise buffer through a 7 kHz highpass on odd
    beats; bass = triangle every 4 steps; the lead arpeggio adds notes with
    the combo tier (1x silent → 8x full 6 notes).
  · SFX: graze = 40 ms noise bandpass 5–8 kHz gain 0.12 (a whoosh past the
    ear); collect = sine gliss 880 → 1320 Hz 60 ms; death = saw gliss
    220 → 28 Hz 600 ms + noise burst; nova = sub sine 55 Hz 800 ms + noise
    sweep lowpass 200 Hz → 8 kHz; heat tier-up = 2-note quinta harmonics
    (220 + 330 Hz) 120 ms.
  · Music BPM = director BPM: the music speeds up WITH difficulty — players
    hear the rhythm and know a core pulse is coming.
- Near-miss visual: entering the graze band, the hazard flashes a cyan rim +
  a light streak along the relative motion direction.
- C2 (DoD): (1) 50 rapid-fire SFX stay clean (the compressor survives);
  (2) the hazard rhythm is audible in the music; (3) grazing genuinely feels
  like a heartbeat-skip (self-play 5 rounds — if you don't WANT to graze,
  rebalance the heat rewards); (4) network panel shows zero requests beyond
  the document; (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: visibilitychange → pause the loop (RAF stopped) + audio.suspend;
  on return → resume + a 500 ms GRACE period with no new hazard spawns and the
  first frame skips collision (unfair lag deaths are unacceptable); loop.js
  stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('boundless-orbit', 1, defaults,
  migrate): schema v1 = { best, runs, settings { mute, lang }, daily (date of
  the currently running seed) }. Every access wrapped in try/catch for private
  mode; migration hook wired. Kill the app → the best survives. Never raw
  localStorage.
- Near-miss hitbox −20%: death hitbox = 0.8 x (R_hazard + R_player) vs visual;
  graze band = 0.8R to 1.35 x R_hazard; each hazard counts a graze only once
  per 250 ms. The player THINKS it's a miracle shave — it's actually fair
  design.
- Instant replay < 150 ms: ring buffer of 60 snapshots (60 FPS = the last
  second), each snapshot just Float32Array position + radius of player and
  hazards, allocated once at boot; on death: freeze 250 ms hitstop, then
  project the replay at 0.5x as alpha-0.4 ghosts inside the same canvas; total
  latency from the death frame to replay on screen ≤ 150 ms.
- Delta-time clamp: throttled frames (dt > 250 ms) are discarded — no
  jump-simulation.
- Anti-GC: no new Object/Array/closure, no string concat, no array methods
  that allocate, no toFixed in the loop — scratch variables + pool + integer
  counters; strings built only when the value changes; verify via DevTools
  Allocation Timeline: no new bars in steady state.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3 (DoD): (1) 10 tab switches in a row — no audio loss, no double-loop, no
  unfair deaths; (2) the replay shows the exact collision moment; (3) the
  heap does not bloat after 20 minutes of play; (4) storage survives a
  corrupt payload; (5) live language switch rebuilds all labels, en table
  complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/boundless-orbit/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, full play in airplane mode, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 0 external assets: no images, no fonts, no audio files, no CDN — every
   visual a canvas primitive, every sound WebAudio synthesis, every glyph
   system-ui.
3. 60 fps locked: p95 frame time ≤ 16.67 ms on a 2019+ laptop, internal
   budget 12 ms/render; the Debug Overlay (~ key) shows fps + live particle
   count for self-measurement.
4. Zero GC allocation in RAF: no new object/array/closure, no string concat,
   no allocating array methods, no toFixed in the loop; verified with the
   DevTools Allocation Timeline (steady state shows no new bars).
5. Audio absolutely silent before the first gesture; hidden tab = paused +
   silent; storage persists across reload.
6. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
7. All three iteration DoDs met.
8. Console self-test: C1/C2/C3 all PASS + 'BOUNDLESS-ORBIT READY'.
9. Definition of done: /game:qa boundless-orbit against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         BOUNDLESS ORBIT
  bootTap       TAP TO START
  tut0          HOLD TO SPIRAL IN — RELEASE TO DRIFT OUT
  tut1          SHAVE METEORS TO BUILD HEAT
  tut2          FULL HEAT? DOUBLE-TAP FOR SUPERNOVA
  scoreCap      SCORE      bestCap BEST      runsCap RUNS
  heatCap       HEAT      novaCap SUPERNOVA!
  grazeCap      GRAZE!
  dailyCap      DAILY ORBIT
  replayCap     REPLAY
  pauseTap      TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: vertical bg gradient #05010F → #12082B → #0F1B3D; core radial
  #FFC857 → #FF6B35 → transparent; comet #9D6BFF with a trail gradient into
  #3EF2E0; stardust #FFD166; hazard #FF2E88 with rim #FF9BB3; graze ring
  #3EF2E0 at alpha 0.35; UI ivory #F5F3FF with tabular-nums. During SUPERNOVA
  the entire background gradient inverts for 2 s (white flash → bright-dark
  background).
- Formulas: r_hold = r − 260·dt; r_release = r + 200·dt; omega = L/r² with
  L = 5.0e5; points per lap = 10 x multiplier awarded when crossing angle 0;
  heat: +0.35 per graze, decay 2.0/s; tiers 1x/2x/4x/8x at heat 1/3/6/10;
  SUPERNOVA at heat ≥ 12, then heat resets to 0.
- Combo psychology: the 250 ms per-hazard graze cooldown prevents farming; the
  decay forces a sustained rhythm of risk; core pulses riding the BPM turn
  music into gameplay (hear it = dodge it).
- Code rules: every constant lives in a CONFIG object at the top of the module;
  state is plain typed arrays or numbers; render fully separated from
  simulation (interpolation); gameplay wrapped in one GAME module — the
  template's engine/ modules own loop/input/audio/storage/rng/particles.
- State machine: BOOT → MENU → RUN → REPLAY → RESULTS → RUN (restart within
  2 s); PAUSE overlay anytime (button + visibilitychange).
- Perf budget: 12 ms render budget, p95 frame ≤ 16.67 ms; targeted at 2 GB-RAM
  Android / 360 px screens.
```
