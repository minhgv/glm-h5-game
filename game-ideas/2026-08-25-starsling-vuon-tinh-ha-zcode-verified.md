# STARSLING

- **Date:** 2026-08-25 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `starsling` — target folder `games/starsling/`
- **Genre:** Arcade one-thumb orbital climber — hold to latch onto a star's orbit, release to fling along the tangent; endless vertical, procedural audio, graze combos.
- **Pitch:** One finger, a whole universe: hold to orbit a star, release at the perfect moment to slingshot yourself into the deep sky. Every latch rings out a pentatonic note — you play and compose your own symphony at once, and the fall is just the final chord.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Starsling: Vươn Tinh Hà".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build STARSLING — an H5 one-thumb orbital climber that meets this
repo's shipping bar: games/starsling/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop hooks in 3 seconds: hold = latch orbit,
release = tangent slingshot; sessions of 90–120 s; retention via best score +
a deterministic seed that can be shared as a challenge. Studio-publishing
juice/feel: zero external assets, zero jank, zero dropped frames, zero leaks —
every detail intentional, artistically and technically. All UI copy in
English, served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. No stubs, no
TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. Each stage:
PLAN (write a small checklist) → BUILD → SELF-AUDIT (run it for real, measure
for real). PASS before advancing; on FAIL fix and re-audit, max 3 cycles per
stage, with the failure cause noted in internal comments. Never declare done
before the FINAL AUDIT passes fully. Log 'STARSLING READY' only when FINAL
ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/starsling/ from templates/game-starter/ via /game:new
  starsling. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 design space; HiDPI: canvas.width = viewport x min(DPR, 2);
  set transform exactly once per frame; resize/orientationchange handled
  safely; viewport meta blocks zoom/scroll. All coordinates use DPI-independent
  virtual units (v.u.).
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. Pure
  one-thumb: pointerdown snaps to the nearest star within the capture radius;
  pointerup = tangent release; input is processed in the same frame as the
  touch (no polling). touch-action: none on canvas.
- Camera tracks the y axis (lerp 0.12); stars spawn from a seeded RNG —
  engine/rng.js createRng(seed); the seed is displayed in a screen corner for
  sharing. No Math.random() in gameplay code.
- C1 — definition of DONE for this stage: fly → orbit → release → die (fall
  off the bottom of the screen or hit an asteroid) → replay in one tap;
  fixed-step verified; input→response ≤ 1 frame.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 preallocated (TTL, alpha fade, total reuse); comet
  trail = a reused 60-point ring buffer. Follow engine/particles.js pool
  semantics. NO new/closures in the hot loop.
- Juice: screen shake trauma model — shake = trauma², offset ≤ 24 px, roll
  ≤ 0.6°, decay 1.2/s; graze +0.3 trauma, death +1.0. Hitstop: freeze
  timeScale 70 ms on a perfect release, 90 ms on death.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on the first pointerdown, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination. Master never starts > 0.5.
- Instruments: pluck (triangle, exponential decay) + sub sine one octave down
  + noise-hat (a 0.5 s white-noise AudioBuffer generated exactly once at
  boot); scale = minor pentatonic rooted at 110 Hz with ratios
  [1.000, 1.189, 1.335, 1.498, 1.782]; every capture climbs one degree,
  wrapping an octave every 5 degrees (max +2 octaves) — the better you play,
  the higher the melody; death = pitch sweep 400 → 60 Hz over 0.6 s + noise
  crash; perfect release = a leap of a fifth. All audio nodes preallocated
  and reused; no new nodes inside the gameplay loop.
- Combo: graze an asteroid (visual touches but hitbox doesn't) → +1 combo +
  ghost note; perfect release (exit angle within the ±6° optimal upward
  window) → x2 combo; combo decays after 4 s without a capture; score =
  100 x tier x 1.1^combo; floating text comes from the pool — no new strings
  built in RAF (preallocated templates).
- C2: (1) 60 fps with a full star field + asteroids + 512-particle bursts;
  (2) 100% of game events have SFX, no click/pop; (3) zero network requests
  beyond the document; (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → pause the whole loop +
  audio.suspend; resume safely by dropping the large frame delta, never
  double-updating; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('starsling', 1, defaults,
  migrate): schema v1 = { best, runs, muted, seed, lang }. try/catch tolerant
  to corrupt/cleared storage; migration hook wired; mute button hit-target
  ≥ 44 px. Never raw localStorage.
- Near-miss mastery (−20% hitbox): the player's lethal hitbox = 80% of the
  displayed shape → surviving by a hair rewards a graze (the grazed asteroid
  bursts particles + a light trauma shake, no death) — a maximum-luck feeling.
- Instant replay < 150 ms: ring buffer of 150 snapshots (x, y, angle, alive
  for the player + up to 64 entities); on death replay 1.2 s at 0.5x with
  vignette + REPLAY label, starting at most 2 frames after the death frame.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) 20 consecutive background/foreground cycles: no AudioNode leaks, no
  crash; (2) storage survives a corrupt payload; (3) replay starts ≤ 2 frames
  after death; (4) pause/resume glitch-free; (5) live language switch
  rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL — 100% mandatory PASS) ===
1. Repo-standard layout: games/starsling/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests (no fetch/XHR/CDN/import-map), procedural assets only,
   total payload ≤ 5 MB. Ships README.md (how to run, controls, tuning table)
   + GDD.md from docs/game-design-template.md.
2. Zero external assets: not a single image/font/audio/video file; all
   visuals are canvas vectors, all audio is procedural WebAudio.
3. 60 fps locked: debug overlay measures the budget — physics ≤ 2 ms,
   render ≤ 8 ms, total frame ≤ 16.6 ms; ≥ 59 fps sustained for 5 minutes on
   Chrome desktop and Android mid-range.
4. Zero GC allocation in RAF: the hot path (update + render) has no new, no
   object/array literals, no closures, no string concat, no .map/.filter;
   pool everything; verify via a 5-minute Allocation Timeline with a flat
   heap.
5. One-thumb complete: the entire game from launch to death screen operable
   with a single pointer; touch-action none, input → pixel ≤ 1 frame,
   scroll/zoom/double-tap-zoom fully blocked.
6. Robustness: double-tap zoom, pull-to-refresh, portrait/landscape rotation,
   20 consecutive background/foreground cycles — no AudioNode leaks, no crash
   with any seed.
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'STARSLING READY'.
9. Definition of done: /game:qa starsling against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      STARSLING / REACH THE STAR RIVER
  bootTap       TAP TO ORBIT      (launch button itself is icon-only)
  tut0          HOLD TO ORBIT — RELEASE TO SLING
  tut1          GRAZE ASTEROIDS — PERFECT RELEASE DOUBLES COMBO
  scoreCap      SCORE      bestCap BEST      tierCap TIER
  comboCap      COMBO      seedCap SEED
  grazeCap      GRAZE!     perfectCap PERFECT!
  replayCap     REPLAY
  pausedCap     PAUSED      pauseTap TAP TO RESUME
  deathCap      THE FALL IS YOUR FINAL CHORD
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU
  setCap        SETTINGS    setMute SOUND

=== TECHNICAL BLUEPRINT ===
- Palette: bg vertical gradient #05060f → #170b2b → #2a0f3d; stars tiered
  gold #ffd166 → orange #ff7b54 → blue #4cc9f0; comet trail gradient
  #72efdd → #b892ff → #ff6b9d; UI dim white rgba(255,255,255,.92); asteroid
  purple #9d4edd rim #f72585.
- Formulas: orbit radius r = clamp(distance, 90, 240); angular velocity
  omega = ±(v_in/r) x 1.15 (preserving the tangential direction at entry);
  release v = omega x r, cap 1400 v.u/s; gravity 380 v.u/s² only while in
  free fall; asteroids self-rotate 0.8–2.2 rad/s.
- Spawning: 1 star per 280 v.u of climb, horizontal offset ±360; the flight
  line always keeps at least 1 star within capture range; tier increases
  every 1500 v.u; asteroids appear from 1200 v.u with density ∝ log(tier).
- UX: launch screen is a single giant wordless touch button; minimal HUD;
  death screen shows score, best, seed, and a big mobile-grade replay button.
- Module layout: template scaffold only — game code in src/ organized as
  Config / Input / Physics / Audio / FX / Replay modules over the template
  engines; engine/ modules unmodified.
- State machine: BOOT → MENU → PLAY → DEAD → REPLAY → RETRY; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: physics ≤ 2 ms, render ≤ 8 ms, total frame ≤ 16.6 ms
  @1080p/DPR2 mid-tier.
```
