# STARLASH

- **Date:** 2026-08-25 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `starlash` — target folder `games/starlash/`
- **Genre:** Arcade/Casual one-thumb endless ascent — core mechanics: Elastic Gravity Lasso (hold to anchor an elastic tether, release to slingshot), gravity-well orbits, graze-combo scoring, Perfect-Sling timing.
- **Pitch:** Your one finger is a gravity lasso: hold to anchor an elastic tether into space, swing your comet around gravity wells, release on rhythm to slingshot, and graze asteroids to multiply the neon combo. Plays like physics fishing in deep space: learnable in 5 seconds, hard to master, and every Perfect Sling snaps like fireworks across the sky.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "STARLASH — Neon Gravity Lasso".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build STARLASH — an H5 one-thumb physics-lasso arcade game that meets
this repo's shipping bar: games/starlash/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core mechanic (entirely new to H5): Elastic
Gravity Lasso — hold to anchor the tether, drag to build tension, release to
slingshot; orbit gravity wells, graze asteroids, chain stardust. Commercial
hooks: inter-run ad slots, rewarded retry; one-more-run retention (best score,
S–D grades, near-miss replay). AAA-mobile-grade juice, 100% procedural audio,
disciplined performance budget. The implementer has full authority to tune
technical constants (±30%) but may NEVER lower an acceptance criterion. All
UI copy in English, served from an STR i18n table with reserved 'vi'/'lo'
slots (pattern: games/gravity-juggle) so the game ships multi-language-ready.
No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. At the end of
EACH iteration run its verify checklist and print PASS/FAIL per item with
measured evidence; on FAIL fix and repeat that same iteration (max 3 times)
before advancing. Log 'STARLASH READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/starlash/ from templates/game-starter/ via /game:new
  starlash. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 logical (portrait, 9:16); HiDPI: canvas.width = viewport x
  min(max(DPR, 1.0), 2.0); letterbox contain; respect safe-area insets;
  resize allocates nothing; dev FPS overlay (toggleable).
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation; wall-clock
  dt spikes clamped by the loop's stall guard. Entities move in update() only;
  render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb
  only: hold = anchor the tether at the touch point, drag = tension, release =
  slingshot; touch-action: none, scroll/zoom/double-tap-zoom fully blocked.
- State machine: BOOT → MENU → PLAY → DEATH → REPLAY → RETRY; restart never
  reloads the page.
- All randomness through engine/rng.js createRng(runSeed) — deterministic
  per-run seed. No Math.random() in gameplay code.
- C1: (1) determinism — same seed → same trajectory (dump 600 frames of
  positions, diff = 0); (2) stable 60 FPS; (3) a full run playable with one
  thumb on mobile/emulator; (4) input→response ≤ 1 frame.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 640 pre-allocated + free-list swap-remove; NO new/splice
  in the game loop; comet tail = 24-point ring buffer drawn as a gradient
  ribbon. Follow engine/particles.js pool semantics.
- Juice: screen shake trauma model — shake = trauma², offset = 14 px x shake
  x noise, decay 1.6/s; addTrauma 0.4 (graze) / 0.6 (sling) / 1.0 (death).
  Hitstop: timeScale = 0 for 60 ms (graze), 90 ms (perfect sling), 150 ms
  (death) — render keeps running, never blocks rAF.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on the first gesture, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor (threshold −24 dB, ratio 4) → destination; generative
  music scheduler on the Web Audio clock (lookahead 120 ms, no setInterval).
  Master never starts > 0.5.
- C2: (1) heap snapshot after 3 minutes of play: delta < 512 KB; (2) 100% of
  game events have SFX; (3) no click/pop (attack ≥ 5 ms, release ramped);
  (4) zero network requests beyond the document; (5) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → pause sim + audio.suspend; resume
  when visible; dt-spike guard on return (no unfair death, no camera jump);
  loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('starlash', 1, defaults, migrate):
  schema v1 = { best, totalDust, runs, muted, lang }. try/catch on everything,
  debounced write (1 s), working mute button. Never raw localStorage.
- Near-miss mastery: comet collision hitbox = 80% of displayed radius (−20%);
  graze ring +80 px; a graze counts only when |v| > 420 px/s, once per
  asteroid.
- Instant replay: ring buffer of 120 samples @ 60 Hz (player, live asteroids,
  dust, camera); on death switch to REPLAY within the collision frame → play
  the last 1.5 s at 0.35x slow-mo + vignette; collision → first replay frame
  < 150 ms (measured by timestamp); GAME OVER appears only after the replay.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) kill tab/restore error-free; (2) cleared storage → game still runs
  on defaults; (3) replay stutter-free, measured latency < 150 ms;
  (4) pause/resume glitch-free; (5) live language switch rebuilds all labels,
  en table complete.

=== ACCEPTANCE CRITERIA (FINAL — 100% mandatory PASS) ===
1. Repo-standard layout: games/starlash/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. Zero external assets: no images/fonts/libs/JSON from outside; graphics
   100% Canvas2D; audio 100% WebAudio procedural; system font stack.
3. 60 fps locked: average ≥ 59.5 FPS, p95 frame time ≤ 17 ms (deliberate
   hitstop/shake not counted as drops); no long task > 50 ms.
4. Zero GC allocation in RAF: no object/array/string allocations in update +
   render; heap snapshot before/after 5 minutes of play delta < 512 KB
   without forcing GC.
5. One-thumb 100%: entire gameplay + UI operable with one pointer; hit
   targets ≥ 44 px; non-blocking ghost-hand tutorial in the first 5 s.
6. Crash-free: 10-minute soak test without exceptions (window.onerror
   surfaced in the dev overlay).
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'STARLASH READY'.
9. Definition of done: /game:qa starlash against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      STARLASH / NEON GRAVITY LASSO
  bootTap       TAP TO LAUNCH
  tut0          HOLD TO ANCHOR — RELEASE TO SLING
  tut1          GRAZE ASTEROIDS TO STACK COMBO
  scoreCap      SCORE      bestCap BEST      altCap ALTITUDE
  dustCap       STARDUST   comboCap COMBO
  grazeCap      GRAZE!     slingCap PERFECT SLING!
  gradeCap      GRADE
  replayCap     REPLAY
  pausedCap     PAUSED      pauseTap TAP TO RESUME
  deathCap      LOST TO THE VOID
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU
  setCap        SETTINGS    setMute SOUND

=== TECHNICAL BLUEPRINT ===
- Palette (neon deep-space): bg vertical gradient #050112 → #160B2E (45%) →
  #2B1548; nebula radial #3F1D6E alpha 0.18 drifting slowly; comet core
  #FFF8E7, glow #FFD166; tail gradient #FFE066 → #FF006E → #7B2FF7 (alpha
  0.9 → 0); tether gradient #7DF9FF → #4CC9F0, alpha 0.35 + 0.5·T, width
  2 + 6·T; stardust #FFE38A glow #FF9E00; asteroid #2E3244 rim #9AA3B8 crack
  #12141F; danger telegraph #FF477E; UI #E8E6F8; combo pop #FFD166.
- Physics (px, s; mass = 1): comet a = tether + gravityWells + drag;
  v += a·dt; p += v·dt; |v| clamp 2600 px/s. Tether while held: a_s =
  K·(anchor − p) − DAMP·v with K = 26 s⁻², DAMP = 2.2 s⁻¹; tether length
  clamp 560 px; tension T = dist/560. On release: if T > 0.25 → boost of
  T²·620 px/s along normalize(p − anchor); PERFECT SLING at T ≥ 0.85.
  Gravity well: a_g = GM·(s − p)/(r² + 200²)^1.5 with GM = 6e10 px³/s².
  Drag: v *= 1/(1 + 0.35·dt). Side walls bounce coefficient 0.55; falling out
  of the camera bottom = death. Camera ascends only: cameraY = min(cameraY,
  playerY − 0.42·H), lerp 8/s; floor scroll 60 → 220 px/s over time.
- Spawn & difficulty: asteroid interval max(0.55, 1.6 − t·0.012) s; every
  900–1400 px of altitude spawn 1 star with a halo cluster of 3–6 stardust
  around it; all constants gathered in one frozen CONFIG object.
- Combo & scoring: each stardust +1 combo, decay timer 2.5 s (expiry resets
  combo to 0); graze +2 combo and +150·m points; perfect sling +300·m;
  multiplier m = 1 + 0.5·floor(combo/5), cap 8.0; score = altitude x 0.05 +
  50·m per dust + graze + sling; grades S/A/B/C by score thresholds
  (tunable); combo text pop-tween scale 1.4 → 1.0 over 200 ms.
- Audio synth voice table (0 assets): pickup = sine from A-minor pentatonic
  [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25] Hz,
  index = combo mod 8, attack 5 ms / decay 180 ms, gain 0.18, plus a triangle
  +1 octave at gain 0.06; sling release = white noise 0.12 s through bandpass
  500 + 1300·T Hz; graze = sawtooth sweep 90 → 55 Hz over 90 ms gain 0.22;
  death = sine sweep 130 → 28 Hz over 450 ms + noise lowpass 900 Hz 300 ms;
  music bed = drone A2 110 Hz sine + E3 164.81 Hz triangle detune ±4 cent,
  hi-hat = 30 ms highpass 6 kHz noise every eighth note, BPM = 128 +
  min(32, altitude/120).
- Render: design space 1080x1920; setTransform(dpr·s); UI font monospace
  system stack; UI strings rebuilt only when the value changes (dirty-flag);
  all entities pre-allocated (MAX_AST 24, MAX_DUST 32, POOL 640); module-level
  scratch vectors; no array/object literals, closures, or string-concat in
  update/render.
- State machine: BOOT → MENU → PLAY → DEATH → REPLAY → RETRY; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier.
```
