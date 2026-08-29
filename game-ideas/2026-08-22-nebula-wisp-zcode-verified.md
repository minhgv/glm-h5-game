# NEBULA WISP: Graze the Storm

- **Date:** 2026-08-22 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `nebula-wisp` — target folder `games/nebula-wisp/`
- **Genre:** Arcade/Casual — one-thumb bullet-hell graze-runner: one-finger control, a physics verlet tail that is both the bait and the score sensor.
- **Pitch:** You are a comet wisp drifting through a nebula battlefield: the closer the bullets skim your tail without touching the core, the harder score and combo explode — the only line between 'boringly safe' and 'gloriously dusted' is 2.2 of your own radius.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Nebula Wisp: Graze the Storm".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build NEBULA WISP: Graze the Storm — an H5 arcade graze-runner that
meets this repo's shipping bar: games/nebula-wisp/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Emotional target: the player 'feels the goodness'
in the first 3 seconds (trail glow + graze chime), a 30-second core loop,
retention through combo score-chasing. Enterprise vs amateur line: 60 FPS
locked on integrated GPUs, zero-GC in RAF, procedural audio unlocked on the
first gesture, self-verified through 3 autonomous iterations — never ship with
a failing iteration checklist. All UI copy in English, served from an STR i18n
table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the game
ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order — never merge
iterations. After EACH iteration, self-verify with console.assert checklists
(C1.x, C2.x, C3.x: console 0 errors, 60 s hands-on gameplay, median frame-time)
plus real runtime measurements; on any FAIL, fix at the root before advancing.
Log 'NEBULA-WISP READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/nebula-wisp/ from templates/game-starter/ via /game:new
  nebula-wisp. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1920x1080 logical (landscape), responsive letterbox fit-scale; HiDPI:
  canvas.width = cssW x devicePixelRatio, ctx.setTransform for scale.
- Sim: engine/loop.js fixed timestep — stepHz 120 (dt = 1/120 s physics),
  maxSubSteps 4 (surplus discarded, spiral-of-death guarded), render(alpha)
  interpolation; a global timeScale hook reserved for hitstop. Entities move
  in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  a single pointer (down/move/up); the touch point = target; the wisp head
  seeks the target on a spring; no pointer lock, no mandatory keyboard;
  input→response ≤ 1 frame. touch-action: none on canvas.
- Verlet tail: 24 segments, 3 distance-constraint iterations, segLen 14 px
  @1080p.
- Spawn Director: intensity I(t) = 1 + 0.018·t; spawn interval =
  max(0.28, 1.1/I); 3 hazard types: straight-drifting asteroid, plasma lance
  with a 0.6 s telegraph, weak-spring homing drone.
- Simple circle collision + graze annulus; gray-box (wireframe) render is fine
  at this stage.
- All randomness through engine/rng.js createRng(seed). No Math.random() in
  gameplay code.
- C1: (1) 60 s of continuous hands-on play without error; (2) 60 fps;
  (3) head follows the finger within ≤ 1 frame; (4) hazards spawn and collide
  per the Director formulas.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 preallocated objects with a swap-pop free-list — NO
  splice, NO new in the loop; rendered with globalCompositeOperation
  'lighter'. Follow engine/particles.js pool semantics.
- Juice: trauma² shake — trauma += 0.4 when hit, += 0.08 per graze; amplitude
  = trauma² x 14 px @1080p, decay 1.4/s, clamp [0,1]; shake transforms the
  canvas, never the DOM. Hitstop: timeScale = 0 for 90 ms on damage;
  micro-hitstop 45 ms at every streak multiple of 10 (juice timers run on a
  separate clock so interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination. Master never starts > 0.5.
- Synth set: graze chime = sine f = 440 x 2^(n/12), n picked from the
  pentatonic set [0, 3, 5, 7, 10, 12] by streak % 6, +12 (octave up) every 24
  streak; explosion = 1 s white-noise buffer, playbackRate 0.7–1.3, lowpass
  sweep 800 → 80 Hz; background music = 112 BPM triangle arpeggio rooted at
  A2 = 110 Hz, 16th-note pulse, gain 0.05.
- Trail glow: gradient along the tail, alpha falling with segment index; all
  glow via 'lighter' composite with pre-baked 2-circle gradient sprites — NO
  shadowBlur in the loop (too expensive).
- C2: (1) 10 s of continuous grazing feels 'juicy' (chime ladder + shake +
  hitstop land together); (2) frame p99 < 16.9 ms; (3) network panel shows
  zero requests beyond the document; (4) audio unlocks on the first gesture,
  no click-pop; (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend; resume
  with a 500 ms GET READY grace (3-2-1 style) so no unfair deaths; loop.js
  stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('nebula-wisp', 1, defaults,
  migrate): schema v1 = { best, totalGrazes, settings { muted, lang } }; mute
  toggle in a screen corner. try/catch tolerant to corrupt/cleared storage;
  migration hook wired. Never raw localStorage.
- Near-miss mastery: r_hit = 0.8 x r_visual (−20% 'near-death' zone); graze
  annulus = [0.8r, 2.2r]; a hazard crossing the annulus without touching the
  core → +1 graze, a spark, a chime.
- Instant replay < 150 ms: ring buffer Float32Array of 150 frames x (head +
  24 tail nodes + the 6 nearest hazards); on death → freeze exactly 140 ms →
  replay at 0.5x speed with a dark vignette → results screen (score, best,
  graze count, 1-tap retry).
- Anti-GC audit: 3-minute heap snapshot flat; PerformanceObserver 'longtask'
  > 5 ms = fail; no closures, no template strings, no allocating array methods
  (map/filter/concat) in RAF; the DOM score element only updates when the
  integer changes; module-level scratch vectors reused. No
  .map/.filter/concat/slice/new/closures/string-concat in RAF; verify via
  Chrome allocation profiler: 10 s of gameplay = zero steady-state heap
  growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) storage survives a corrupt
  payload; (3) replay starts < 150 ms after death; (4) long tasks stay < 5 ms;
  (5) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/nebula-wisp/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: 99% of frames < 16.9 ms on an integrated GPU; ≥ 58 fps
   worst-case (200 particles + 6 hazards + replay recording); no jank; frame
   p99 ≤ 20 ms.
3. Zero allocation in RAF steady state: heap flat on a 3-minute snapshot;
   long tasks < 5 ms (allocations allowed only at boot/state change).
4. Input→render ≤ 1 frame; fully playable with one finger; works in portrait
   AND landscape; touch-action none, scroll/zoom/double-tap-zoom fully
   blocked.
5. Zero console errors/warnings; audio only after a user gesture (never
   Chrome-blocked).
6. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
7. Console self-test: C1/C2/C3 all PASS + 'NEBULA-WISP READY'.
8. Definition of done: /game:qa nebula-wisp against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      NEBULA WISP / GRAZE THE STORM
  bootTap       TAP TO START
  tut0          DRAG TO FLY — BULLETS THAT SKIM YOUR TAIL SCORE
  tut1          DON'T LET THEM TOUCH THE CORE
  scoreCap      SCORE      bestCap BEST      streakCap STREAK
  grazeCap      GRAZE!
  readyCap      GET READY
  replayCap     REPLAY
  resCap        RESULTS     newBest NEW BEST!      grazesCap GRAZES
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  soundOn       SOUND ON    soundOff SOUND OFF
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: radial bg #050510 → #0B0033, nebula noise #1B0B4D alpha 0.35; wisp
  core gradient #7DF9FF → #B16CEA, outer glow rgba(125,249,255,0.25); hot
  hazards #FF3D6E; graze sparks #FFD166; UI white #F5F7FF, system font stack;
  every glow uses 'lighter' composite — no shadowBlur in the loop (expensive)
  — glow = pre-baked 2-circle gradients.
- Head formula: a = 42·(target − pos) − 8·v; speed clamp 900 px/s @1080p;
  tail: verlet, damping 0.985, gravity 0, 3 constraint iterations.
- Combo: streak resets after 2.0 s without a graze; multiplier
  M = min(8, 1 + floor(streak/5)); score += 10·M per graze + distance
  traveled x M; M is shown as a number + a glow ring around the wisp, hue
  shifting per M milestone according to the palette.
- HUD: score + best top, streak/M multiplier beside the wisp or top-center,
  mute toggle in a corner; results show score, best, graze count.
- State machine: BOOT → TITLE → RUN → REPLAY → RESULTS → RUN; PAUSE overlay
  anytime (button + visibilitychange). The template's engine modules cover the
  Loop/Input/Pool/Audio/Director/Replay/Store roles.
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1920x1080/DPR2 mid-tier; batched
  canvas ops, no redundant state changes between draw calls.
```
