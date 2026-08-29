# KOILOOP: Dragon Gate

- **Date:** 2026-08-20 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `koiloop` — target folder `games/koiloop/`
- **Genre:** Arcade/Casual gesture-skill — lasso-loop capture: one thumb steers a glowing koi through a dark vortex; draw a closed loop of light to capture dark wisps, chain geometric combos, and evolve Koi → Serpent → Dragon after the Dragon Gate legend (Vũ Môn Hóa Rồng).
- **Pitch:** You are bait and weapon at once: touch-drag to swim the koi, close a light loop to capture demons — but your own ribbon of light lures them in to bite it. Bigger loops square the score and the risk; every 1,000 points sweeps the Dragon Gate across the screen — swim through it to evolve.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "KOILOOP: Vũ Môn Hóa Rồng".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build KOILOOP: Dragon Gate — an H5 arcade/casual game that meets this repo's
shipping bar: games/koiloop/ static site scaffolded from templates/game-starter/
via /game:new, template engines unmodified, zero build step, zero runtime network.
Core loop: one-thumb 'draw-loop-to-capture' (lasso-loop capture) plus the
Koi → Serpent → Dragon evolution meta. All UI copy in English, served from an
STR i18n table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so
the game ships multi-language-ready. Commercial hooks: share score, seeded daily
run, ad-slot-ready layout. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'KOILOOP READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/koiloop/ from templates/game-starter/ via /game:new koiloop.
  Plain ES modules + <script type="module">, served over http:// (never file://).
  Games never import from outside their folder; engine/ modules stay unmodified.
- Stage: 1080x1920 logical (portrait-first), responsive letterbox fit-scale;
  HiDPI: canvas.width = viewport x min(DPR, 2.5); set transform once per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb
  steering: koi follows a critically-damped spring a = (P − x)·k − v·c with
  k = 160 s⁻², ζ = 0.9 (c ≈ 22.8 s⁻¹), clamp |v| ≤ 1500 px/s; input→response
  ≤ 1 frame. touch-action: none on canvas.
- Verlet ribbon trail: 28 nodes, 16 px segments, 2 constraint iterations per
  node per frame, node TTL 0.9 s fade.
- Loop detection: leading segment crosses an older segment (≥ 3 nodes back) →
  build polygon from the loop's nodes → valid if Shoelace area ≥ 2400 px² and
  ≥ 6 nodes → point-in-polygon (raycast) every wisp inside → capture.
- Wisp AI: steering-seek the koi + attraction to ribbon nodes within 180 px —
  a bite cuts the trail at that node and resets the chain. Difficulty ramp
  over 180 s: spawn interval 1.5 s → 0.45 s, wisp speed 130 → 340 px/s.
- All randomness through engine/rng.js createRng(seed); daily runs derive the
  seed from the date string. No Math.random() in gameplay code.
- C1: (1) physics/render separation holds, measured step ≈ 8.33 ms ±5%;
  (2) 1-thumb smooth, response ≤ 1 frame; (3) loop capture recognizes ≥ 95% of
  clearly drawn loops; (4) 60 fps desktop.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: SoA pool (Float32Array(1024x8) + Uint8 type + Int16 free-stack),
  O(1) spawn, single-pass update, batched draw by blend mode; glow = sprite
  pre-rendered on an offscreen canvas at boot — NO shadowBlur in the hot loop.
  Follow engine/particles.js pool semantics.
- Juice: screen shake offset = trauma² x 26 px, rotate ≤ 2.4°, trauma decay
  1.8/s; hitstop timeScale = 0 for 60–90 ms on captures of ≥ 3 wisps (juice
  timers run on a separate clock so interpolation survives); ring shockwave +
  16-object floating-score pool on loop close.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state persisted;
  master chain masterGain → WaveShaper soft-clip → DynamicsCompressor →
  destination; one shared 1 s white-noise buffer. Master never starts > 0.5.
- Generative BGM, 100 BPM: pad of 2 detuned saws (±4 cent) through a lowpass
  opening 500 Hz → 4000 Hz with evolution tier; chord cycle Dm → Bb → F → C
  every 7.68 s; hi-hat (6 kHz highpass noise, 30 ms) only during RISING DRAGON.
- SFX FM bell on D-pentatonic [293.66, 329.63, 369.99, 440, 493.88, 587.33,
  659.26, 739.99, 880] Hz: capturing n wisps plays an n-note rising arpeggio
  (45 ms apart) — carrier f, modulator f x 2.01, modIndex f x 3 → 0 exp over
  0.22 s; graze = bandpass noise sweep 400 → 2400 Hz / 120 ms; death = sine
  glide 220 → 55 Hz / 0.8 s + noise burst; UI blip = square 880 Hz / 30 ms.
- C2: (1) 60 fps with 60 wisps + 500 particles; (2) network panel shows zero
  requests beyond the document; (3) hitstop/shake do not break interpolation;
  (4) audio unlocks on first tap, no click-pop (5 ms ramps);
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend; resume
  with a 3-2-1 countdown; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('koiloop', 1, defaults, migrate):
  schema v1 = { best, chainBest, career {runs, totalCaptures, evolutions},
  settings {bgm, sfx, haptics, lang}, dailySeed }. try/catch tolerant to
  corrupt/cleared storage; migration hook wired. Never raw localStorage.
- Near-miss mastery: fatal hitbox = 0.8 x visual radius (grazing survives);
  graze zone 0.8r → 1.3r: +25 x chain points, whoosh SFX, rim flash, 0.4 s
  per-wisp cooldown.
- Instant replay < 150 ms: SoA ring buffer 30 Hz x 4 s = 120 frames (koi pos,
  ≤ 64 wisps, 28 ribbon nodes, score), allocated exactly once at boot; on
  death, play back at 0.45x speed starting ≤ 2 frames later, letterbox bars +
  REPLAY label, tap to skip.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- Adaptive difficulty: 3 consecutive deaths under 30 s → −10% spawn rate;
  ghost-finger tutorial on the first 3 runs.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) replay starts ≤ 2 frames after
  death; (3) profiler shows zero RAF allocations; (4) storage survives a
  corrupt payload; (5) live language switch rebuilds all labels, en table
  complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/koiloop/ runs as a plain static site (ES modules
   over http://, python3 -m http.server), zero build, zero runtime network
   requests, procedural assets only, total payload ≤ 5 MB. Ships README.md
   (how to run, controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked: ≥ 58 fps worst-case (60 wisps + 1024 particles + replay
   recording); frame p99 ≤ 20 ms.
3. Zero GC in RAF steady state (allocations allowed only at boot/state change).
4. Perfect one-thumb: touch-action none, response ≤ 1 frame, scroll/zoom/
   double-tap-zoom fully blocked.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Console self-test: C1/C2/C3 all PASS + 'KOILOOP READY'.
7. Definition of done: /game:qa koiloop against docs/production-checklist.md,
   then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      KOILOOP / DRAGON GATE
  bootTap       TAP TO START
  tut0          DRAG TO SWIM — CLOSE THE LOOP TO CAPTURE
  tut1          BIGGER LOOPS SQUARE THE SCORE — AND THE RISK
  tut2          YOUR LIGHT LURES THEM IN — MIND THE BITE
  scoreCap      SCORE      chainCap CHAIN      bestCap BEST
  frenzyCap     RISING DRAGON
  gateCap       DRAGON GATE OPEN — SWIM THROUGH!
  tiers         KOI / SERPENT / DRAGON
  grazeCap      GRAZE!
  replayCap     REPLAY      replaySkip TAP TO SKIP
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  btnRetry      RETRY       btnMenu MENU       btnShare SHARE
  copied        RESULT COPIED!      copyFail COPY FAILED
  shareHead     KOILOOP: DRAGON GATE —

=== TECHNICAL BLUEPRINT ===
- Palette: vortex radial bg #05060E → #0B1030 → #14224A; koi body #FFD166 →
  #FF8C42 → #FF5E62; ribbon additive glow #7DF9FF → #40E0D0, alpha 0.9 → 0.1
  by TTL; wisps — Chaser #B06AB3 → #6C3FA0, Phased #3FA0A0, Splitter #E05555,
  Guardian #E0C555; UI text #EAF6FF; danger flash #FF3B5C.
- Wisp roster: Chaser (basic seek); Phased (unlocks 45 s, must be captured in
  2 consecutive loops); Splitter (90 s, splits in two when captured); Guardian
  (140 s, vulnerable only 1.2 s after its red telegraph dash).
- Scoring: capture = 10 x n² x chain x tier (n = wisps inside one loop); chain
  window 2.0 s; tier multipliers [1.0, 1.5, 2, 3, 4, 6, 8]; graze +25 x chain.
  RISING DRAGON: every 15 captures → 5 s of invincibility, +50% speed, x2
  score, ribbon turns to dragonfire. Evolution: every 1,000 points sweeps the
  Dragon Gate across the screen — swim through it to evolve Koi → Serpent →
  Dragon (permanent in-run stat boost + new visual/trail per tier).
- HUD: score top-left, chain meter top-center, frenzy bar at the bottom; game
  over shows best-delta + share button (clipboard copy).
- State machine: BOOT → TITLE → COUNTDOWN → RUN → REPLAY → GAMEOVER → RUN;
  PAUSE overlay anytime (button + visibilitychange).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier; batched canvas
  ops, no redundant state changes between draw calls.
```
