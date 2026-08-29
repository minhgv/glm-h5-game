# NIGHTWAVE

- **Date:** 2026-08-24 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `nightwave` — target folder `games/nightwave/`
- **Genre:** Endless one-thumb arcade / rhythm-survival — core mechanic "wave-bending": steer the wave's amplitude with a spring-damper, hazards locked to a 128 BPM beat grid, near-miss graze scoring, combo Flow state.
- **Pitch:** One finger, one wave: hold to surge the amplitude up, release to let it fall — you don't control a character, you bend the whole glowing wave to thread gates on the 128 BPM beat. Buttery-smooth and one-more-run addictive: every near-miss is a score explosion.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Sóng Đêm — Nightwave".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build NIGHTWAVE — an H5 endless one-thumb arcade/rhythm-survival game
that meets this repo's shipping bar: games/nightwave/ static site scaffolded
from templates/game-starter/ via /game:new, template engines unmodified, zero
build step, zero runtime network. Core loop: hold to bend the glowing wave up,
release to drop it, thread gates on the 128 BPM beat grid, farm near-miss EDGE+
into a combo ladder that peaks in FLOW MODE. All UI copy in English, served
from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. Commercial
positioning: portal-ready (CrazyGames/Poki tier), usable for ad-campaign
retention; KPI targets — run length 60–120 s, death→retry < 1.5 s, input→pixel
≤ 1 rendered frame, frame p95 ≤ 16.9 ms on mid-range phones. Enterprise bar:
deterministic fixed-step core, zero-GC runtime, audio-visual sync on the beat
grid, self-QA checklist before done. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements (node --check for JS, Chromium Performance 30 s
recording when available); on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'NIGHTWAVE READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/nightwave/ from templates/game-starter/ via /game:new
  nightwave. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 logical (portrait-first), responsive letterbox fit-scale;
  HiDPI: canvas.width = viewport x min(DPR, 2); set transform once per resize;
  handle resize/orientationchange; respect safe-area insets.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  press = SURGE (amplitude pushed up), release = FALL (free drop); input is
  recorded on the event and applied in the step (never read in render);
  input→response ≤ 1 frame. touch-action: none on canvas.
- Player: glowing energy mote, core 18x18 design px. Spring-damper
  a = k x (targetY − y) − c x v with k = 180 s⁻², c = 22 s⁻¹ (ζ ≈ 0.82);
  hold → targetY at 25% from the top, release → 75% (near bottom), transitions
  eased by smoothstep over 220 ms; boundary clamp with restitution 0.25.
- Wave-trail: 24 verlet nodes trailing the player, each step
  y_i += (y_{i−1} − y_i) x 0.35; drawn as a gradient ribbon — the "wave
  memory", the game's central visual theme.
- World scroll: v = 420 + 18 x level design px/s; level = floor(measures ÷ 8);
  spawner follows a distance map, deterministic via engine/rng.js
  createRng(seed = runId). No Math.random() in gameplay code.
- Hazard archetypes: GATE (gap clamp(320 − 8 x level, 190, 320) px), ROTOR
  (spinning bar, ω = 1.2–2.4 rad/s), PULSE-MINE (detonates on the beat, radius
  warning 600 ms ahead). Collision: circle-vs-AABB.
- State machine BOOT → MENU → RUN → DEAD → REPLAY; first runs must end in
  death < 90 s, no tutorial text (learning by dying).
- C1: (1) playable end-to-end (menu → death → retry); (2) 60 fps greybox;
  (3) scroll/zoom never swallowed by the canvas; (4) pause on focus loss
  (blur event now, upgraded to the Visibility API in iteration 3).

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 preallocated (fixed fields + freelist index, never
  resized): gate-pass spark, tail ember, crystal smash, death shatter. Follow
  engine/particles.js pool semantics. NO new/closures in the hot loop.
- Juice: screen shake = trauma² — trauma ∈ [0,1], decay 1.6/s, offset =
  14 x trauma² x noise; death sets trauma = 1, crystal smash = 0.35. Hitstop:
  freeze sim 110 ms on death, 45 ms on crystal smash (render keeps drawing,
  only update stops).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state persisted;
  master chain masterGain → WaveShaper soft-clip → DynamicsCompressor
  (threshold −18 dB, knee 24, ratio 6) → destination. Master never starts
  > 0.5.
- Beat engine: BPM 128; scheduler tick every 25 ms, lookahead 0.12 s (Chris
  Wilson pattern); kick = sine pitch-drop 160 → 42 Hz, 90 ms, gain 0.9 per
  beat; clap on beats 2 & 4 = bandpass noise 1.8 kHz, 120 ms; offbeat hat =
  highpass noise 8.5 kHz, 35 ms, gain 0.18; bass A1 55 Hz saw through lowpass
  320 Hz, 16th-note pattern; lead pluck (triangle, decay 0.28 s) plays A-minor
  pentatonic [220.00, 261.63, 293.66, 329.63, 392.00, 440.00] on combo-tier
  ups; death = saw pitch-bend 400 → 60 Hz / 0.6 s + noise wash, music bus
  ducks to 0.25 then ramps back.
- Obstacle spawns lock to the beat grid (1 measure = 1.875 s → distance =
  v x beat) so gameplay "punches" with the music.
- Visuals: bg vertical gradient #05060F → #0B1030 → #1A0B3C; player/trail
  neon cyan → magenta (#21D4FD → #3A7BD5 → #FF2E88); combo gold #FFC93C;
  2 parallax star layers + faint grid; bloom via shadowBlur with a budget
  (max 6 shadow-draws per frame).
- Haptics: navigator.vibrate guarded by try/catch — 10 ms per gate, 30 ms on
  death.
- C2: (1) audio starts exactly on the first gesture; (2) hazard spawns land on
  the beat grid (verified by timestamp); (3) 200-particle burst without jank;
  (4) all effects come from pools (zero new in the game loop); (5) network
  panel shows zero requests beyond the document; (6) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend; resume
  with a fast 3-2-1 countdown (500 ms total) + 300 ms grace (no new hazards,
  player invulnerable 300 ms); loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('nightwave', 1, defaults,
  migrate): schema v1 = { best, settings {music, sfx, haptics, lang}, stats
  {runs, totalScore, bestCombo, maxLevel} }. try/catch tolerant to
  corrupt/cleared storage; migration hook wired; reset button in the menu.
  Never raw localStorage.
- Near-miss mastery (−20% hitbox): lethal hitbox = 80% of visual (18 → 14.4
  px); graze band = hazard expanded +20%; overlap(graze) && !overlap(lethal),
  each hazard counts once → EDGE+ (points + spark + tick sound).
- Instant replay < 150 ms: ring buffer of 9 snapshots @ 60 Hz (Float32Array:
  player y/v + hazard ids/positions + trauma + time); on death, switch to
  REPLAY within the same frame, playback at 0.25x speed with 60% grayscale,
  ending in a 160-piece shatter; measure death→replay-start with
  performance.now — must be < 150 ms.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- Anti-frustration: 2 deaths within 15 s on the same archetype → −5% spawn
  rate for that archetype for the rest of the run (silent rubber-band).
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) mid-run tab switch pauses both physics and audio, state intact on
  return; (2) kill app → relaunch keeps best/settings/stats; (3) near-miss
  verified with hand-placed static hazards; (4) replay starts < 150 ms;
  (5) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/nightwave/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: p95 frame ≤ 16.9 ms, no frame > 33 ms across 3 minutes of
   gameplay on a mid-range phone; 4x CPU throttle still ≥ 55 fps (worst-case:
   200-particle bursts + full hazard field).
3. Zero GC in RAF steady state (allocations allowed only at boot/state
   change); score rendered via a cached offscreen glyph-atlas, no per-frame
   fillText for numbers.
4. Perfect one-thumb: touch-action none, input→pixel ≤ 1 frame, scroll/zoom/
   double-tap-zoom fully blocked (viewport meta + user-scalable=no).
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Persistence & pause: best/settings/stats survive reload; visibilitychange
   pause < 1 frame.
7. Replay: death→replay < 150 ms, smooth 0.25x playback.
8. Console self-test: C1/C2/C3 all PASS + 'NIGHTWAVE READY'; clean console —
   zero errors/warnings on latest Chrome/Safari/Firefox mobile.
9. Definition of done: /game:qa nightwave against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      NIGHTWAVE / RIDE THE DARK
  bootTap       TAP TO START
  howto         HOLD TO RISE — RELEASE TO FALL
  scoreCap      SCORE      bestCap BEST      levelCap LEVEL
  streakCap     STREAK
  edgeCap       EDGE+
  flowCap       FLOW MODE
  deathCap      WIPED OUT
  newBest       NEW BEST!
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  btnRetry      RETRY       btnMenu MENU
  setCap        SETTINGS
  setMusic      MUSIC       setSfx SFX       setHaptics HAPTICS
  btnReset      RESET DATA      resetAsk      ERASE ALL PROGRESS?

=== TECHNICAL BLUEPRINT ===
- Palette: bg #05060F → #0B1030 → #1A0B3C; cyan #21D4FD; blue #3A7BD5;
  magenta #FF2E88; gold #FFC93C; light white #EAF6FF; trail alpha 0.9 → 0.
- Physics: stepHz 120; spring k = 180, c = 22; verlet trail s = 0.35; rotor
  ω = 1.2–2.4 rad/s; scroll v = 420 + 18 x level; gap = clamp(320 − 8 x level,
  190, 320).
- Audio: A-minor pentatonic [220.00, 261.63, 293.66, 329.63, 392.00, 440.00];
  bass 55 Hz; kick 160 → 42 Hz; BPM 128; scheduler 25 ms / lookahead 120 ms.
- Combo system: gate pass = 100 x mult; crystal = 40 x mult; EDGE+ = 15 points
  + 25% bonus on the next gate; streak increments on every successful action;
  mult = 1 + floor(streak/4), cap x8; combo decay timer 4.0 s (refreshed by
  every action); FLOW MODE at x8: speed +12%, score x1.5, chromatic trail
  gradient + one extra music voice; death wipes the whole streak.
- Replay: 9 frames x 60 Hz Float32Array ring; playback 0.25x; shatter 160
  pieces from a 256 pool.
- Pools: particle 512, shard 256, float-text 24 (glyph atlas); fixed fields +
  freelist index.
- Module layout: template scaffold only — src/main.js boot + game code in src/,
  engine/ modules (loop, rng, storage, audio, input, particles) unmodified.
- 0-GC rules: reuse temp vectors; for-loops instead of forEach/map; no score
  string built per frame; event handlers allocate nothing; all constants
  hoisted out of the loop.
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier; batched
  canvas ops, no redundant state changes between draw calls.
- State machine: BOOT → MENU → RUN → DEAD → REPLAY → RUN; PAUSE overlay
  anytime (button + visibilitychange).
```
