# NEON TWINS

- **Date:** 2026-08-17 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (games/neon-twins/ scaffold instead of a one-file build), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `neon-twins` — target folder `games/neon-twins/`
- **Genre:** Arcade one-thumb elastic-tether runner — you don't steer the twins, you control the TENSION of the elastic cord joining two orbs diving through a tunnel of neon gates; match-color gates, score-attack combos.
- **Pitch:** Twin orbs race through a neon gate tunnel joined by an elastic cord: hold to CONTRACT the line, release to EXTEND — thread each orb through its own color hole, and skim the edges for Near-Miss x1.5 payouts that blow the combo open. An 8-second dopamine loop: the higher the risk, the sweeter the hitstop.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Song Sinh Neon (Neon Twins)".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build NEON TWINS — an H5 arcade one-thumb game that meets this repo's
shipping bar: games/neon-twins/ static site scaffolded from
templates/game-starter/ via /game:new neon-twins, template engines unmodified,
zero build step, zero runtime network. Core loop: command the elastic tether
joining two orb twins through match-color gates — hold to contract, release to
extend — with an ~8 s risk-reward near-miss dopamine cycle. All UI copy in
English, served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. Commercial hooks:
30 s–5 min sessions, playable-ad friendly, banner-safe zones, daily-streak
retention. Studio product, not a student demo: no placeholders, no TODOs, no
external assets. No stubs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'NEON-TWINS READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/neon-twins/ from templates/game-starter/ via /game:new
  neon-twins. Plain ES modules + <script type="module">, served over http://
  only. Games never import from outside their folder; engine/ modules stay
  unmodified.
- Stage: 1920x1080 logical (16:9), responsive letterbox fit-scale; HiDPI:
  canvas.width = viewport x min(DPR, 2.0); set transform once per resize;
  safe-area insets (notch) respected.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One thumb:
  press = contract the tether, release = extend; desktop fallback Space/mouse;
  first pointer only (later pointers ignored); touch-action: none on canvas;
  300 ms ghost-click guard, double-fire pointer guard. Response ≤ 1 frame:
  events land in an input ring buffer, the sim reads them on the next step.
- Entities: two orbs mirrored across the tunnel axis, joined by a spring
  tether; gates are bars with cyan/magenta holes spawned along the tunnel.
  FSM via switch: BOOT → MENU → COUNTDOWN → PLAY → DYING(replay) → RESULT —
  no loose boolean flags.
- Physics: damped Hooke spring along the axis joining the orbs:
  a = (−k·(L − L0) − c·vRel) with k = 46 s⁻², c = 7.5 s⁻¹; L0 = 64 px held,
  216 px released, L0 switches with a 120 ms ease; tunnel scroll v = 300 px/s,
  +1.8% per 500 points (cap 620 px/s); NO gravity — difficulty comes from
  speed + gate spacing; the orbs' oscillation amplitude around the axis is
  L/2, producing a natural double-sine path.
- Collision: circle-vs-rect closest-point (orb vs bar); death when an orb
  touches a bar body or the wrong-color hole.
- Spawning: gate gap 380 px shrinking to 260 px as a smooth function of score;
  hole sides flipped via engine/rng.js createRng(seed); rule: never two
  consecutive side flips within 0.4 s (no impossible chains). No Math.random()
  in gameplay code.
- C1: (1) physics/render separation holds; (2) 1-thumb smooth, response ≤ 1
  frame; (3) deaths only from true collisions; (4) 60 fps desktop.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 pre-allocated at boot, free-list swap-deactivate — follow
  engine/particles.js pool semantics. NO new/closures in the hot loop. A
  16-particle burst fires where a gate is cut.
- Juice: trauma-model screen shake — shake = trauma², decay 1.4/s, offset =
  shake x 14 px x noise; perfect pass +0.2 trauma, near-miss +0.45, death
  +1.0. Hitstop (freeze sim, keep rendering): perfect 40 ms, near-miss 70 ms,
  death 90 ms. Tether glows by real tension (glow width tracks spring force).
- Haptics where supported: vibrate(10) perfect, vibrate(30) near-miss,
  vibrate([60,40,120]) death.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor (threshold −18 dB, ratio 6) → destination. Master never
  starts > 0.5.
- SFX synth: perfect pass = one rising note per combo tier on A-minor
  pentatonic [220.00, 261.63, 293.66, 329.63, 392.00] Hz x
  2^(floor(combo/5) mod 3) for octave climbs: sawtooth through a lowpass sweep
  2400 Hz → 320 Hz over 90 ms, gain attack 2 ms decay 90 ms; near-miss adds a
  square osc one octave up detuned +7 cents; death = 300 ms noise buffer +
  sine drop 180 → 38 Hz over 450 ms through a waveshaper; menu music = sine
  kick 130 → 40 Hz every 500 ms + a 16-step arp from a pre-computed frequency
  array.
- C2: (1) 60 fps under full juice; (2) network panel shows zero requests
  beyond the document; (3) tests/audio-contract.mjs passes; (4) audio unlocks
  on the first tap, no click-pop; hitstop/shake never break interpolation.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend; resume
  with a 3-2-1 countdown; loop.js stall clamp guards time jumps. Ten tab
  switches in a row: no timer leaks, no stacked sounds, no lost run state.
- Saves via engine/storage.js createStorage('neon-twins', 1, defaults,
  migrate): schema v1 = { best, lastScore, games, streak, settings {muted,
  lang} }. try/catch tolerant to corrupt/cleared storage; writes throttled to
  once per run; migration hook wired. Never raw localStorage.
- Near-miss measurement: near-miss is MEASURED with a bar hitbox shrunk −20%;
  the fatal collision hitbox stays 100% — death stays death, only the
  proximity measurement gets the slack.
- Instant replay: pre-allocated Float32Array ring buffer of 120 frame
  snapshots (x,y of both orbs + the 8 nearest gates); on death replay the
  last 1.2 s at 0.25x under a 40% dark overlay, then RESULT; collision-frame
  → replay-start delay < 150 ms.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth (heap-snapshot delta < 0.1 MB across 5000 frames).
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) replay starts < 150 ms after
  the collision frame; (3) profiler shows zero RAF allocations; (4) storage
  survives a corrupt payload; (5) live language switch rebuilds all labels,
  en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/neon-twins/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: frame budget median < 12 ms, p99 < 16.6 ms; sim fully
   separated from render.
3. Zero GC in RAF steady state (allocations allowed only at boot/state
   change).
4. Input-to-photon < 1 frame: pointer events only write the input ring
   buffer; the sim reads it on the next step.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Audio only after the first user gesture; mute button works, state
   persisted.
7. Tab switch 10x in a row: no sound stacking, no timer pile-up, no lost run.
8. Death replay visible < 150 ms after the collision frame.
9. Readability: playable one-handed by silhouette + functional color alone
   (with glow off, orbs A/B and bars remain distinguishable).
10. Console self-test: C1/C2/C3 all PASS + 'NEON-TWINS READY'.
11. Definition of done: /game:qa neon-twins against
    docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         NEON TWINS
  bootTap       TAP TO START
  tut0          HOLD — CONTRACT THE CORD · RELEASE — EXTEND
  tut1          FEED EACH ORB THROUGH ITS OWN COLOR
  tut2          SKIM THE GATE EDGE — NEAR-MISS x1.5
  scoreCap      SCORE      comboCap COMBO      bestCap BEST
  nearCap       NEAR MISS!
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  statScore     SCORE      statCombo MAX COMBO      statNear NEAR-MISSES
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: radial bg #070818 → #0E1030, tunnel vignette #030309; Orb A
  #00F0FF core #EAFBFF; Orb B #FF2E88 core #FFF0F6; tether gradient cyan →
  magenta drawn with composite 'lighter'; gate bar 2 px neon rim, body 12%
  alpha, cyan/magenta holes matching the orbs; combo gold #FFD166; danger red
  #FF4D4D; UI white 92%, monospace, 0.2em letter-spacing.
- Scoring: correct pass +1 combo, points = ceil(100 x (1 + combo x 0.1));
  NEAR-MISS (< 14 px from the bar edge, measured on the −20% hitbox) = +2
  combo, x1.5 score multiplier for 3 s, stacking to x3 (max 900/pass), with
  24 particles + trauma 0.45; a collision resets the combo but keeps the
  score; BEST is written the moment it is beaten.
- HUD: SCORE top-left, COMBO center (pop scale 1.3x → 1.0 over 150 ms on
  increase), BEST top-right; death → slow-mo replay → result panel with three
  numbers (Score / Max combo / Near-misses) + a RETRY button 60% of the
  screen width at the bottom, inside the safe area.
- State machine: BOOT → MENU → COUNTDOWN → PLAY → DYING(replay) → RESULT →
  PLAY; PAUSE overlay anytime (button + visibilitychange).
- Perf budget: frame median < 12 ms, p99 < 16.6 ms @1080p/DPR2 mid-tier;
  zero allocations in the frame path.
```
