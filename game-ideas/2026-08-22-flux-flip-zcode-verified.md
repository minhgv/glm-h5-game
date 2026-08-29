# FLUX FLIP: Neon Polarity Surge

- **Date:** 2026-08-22 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `flux-flip` — target folder `games/flux-flip/`
- **Genre:** Arcade physics flow / one-thumb endless climber — flip magnetic polarity to slingshot through an anchor lattice, graze hazards to feed the combo.
- **Pitch:** You are a magnetic orb in free fall inside an endless neon conduit — with ONE finger you flip polarity (cyan↔magenta) to be attracted or repelled by anchors, slingshotting upward instead of falling down. The bolder you skim PAST hazards (graze), the more your Flux and combo explode — distilled 'one more run' addiction.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "FluxFlip: Neon Polarity Surge".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build FLUX FLIP: Neon Polarity Surge — an H5 arcade that meets this
repo's shipping bar: games/flux-flip/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Ship it as a commercial product, not a student
demo: cold-load to playable < 2 s, 60 FPS locked on a 2020 mid-range Android,
30-second addictive core loop, monetizable (meta-coin, 6 unlockable skins,
best-score chase). Every technical decision serves 3 pillars: RESPONSIVE
(input→pixel < 16 ms), READABLE (every death is identifiable as player error in
one replay viewing), REPLAYABLE (procedurally seeded spawner — no two runs
alike). All UI copy in English, served from an STR i18n table with reserved
'vi'/'lo' slots (pattern: games/gravity-juggle) so the game ships
multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max
2 fix cycles per iteration); NEVER regress criteria already passed in a prior
iteration. Log 'FLUXFLIP READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/flux-flip/ from templates/game-starter/ via /game:new
  flux-flip. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 design space, letterbox keeps 9:16; DPR scale capped 2.5;
  context getContext('2d', {alpha:false}); debounced resize handler.
- Sim: engine/loop.js fixed timestep — stepHz 120 (SIM_DT = 1/120 s),
  maxSubSteps 4 (surplus discarded, spiral-of-death guarded), render(alpha)
  interpolation. Entities move in update() only; render code never mutates
  state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  pointerdown ANYWHERE on the canvas = flip polarity (cyan↔magenta);
  touch-action:none + overscroll-behavior:none block iOS bounce; an input
  queue is drained at frame start so no event is lost between substeps; flip
  cooldown 90 ms against spam. touch-action: none on canvas.
- Physics (design-space units): gravity g = 1500 px/s²; each anchor pulls/pushes
  with F = K·P/max(d², D_MIN²), K = 9.2e6, D_MIN = 90 px, P = ±1 by polarity
  (like poles repel, opposite poles attract); linear drag 0.12/s; velocity
  clamp 2400 px/s; conduit wall restitution 0.55. Semi-implicit Euler:
  v += a·dt; x += v·dt.
- Spawner via engine/rng.js createRng(seed), seed = Date.now() xor run-id:
  sin-wave anchor ribbons, hazard gates (pillar pairs with a narrowing gap),
  coin arcs; scroll speed = 260 + 8·floor(score/1000), cap 900 px/s; anchor
  density always guarantees a survivable path (flood-check offline during dev).
- State machine: BOOT → MENU → RUN → DEATH → REPLAY → RUN; every transition is
  safe while the tab is hidden.
- C1: (1) physics/render separation holds, measured step ≈ 8.33 ms ±5%;
  (2) tap-anywhere flip feels instant, input→pixel < 16 ms; (3) polarity forces
  and wall bounces match the formulas above; (4) 60 fps desktop with the base
  spawner running.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 2048 preallocated as a typed-array ring buffer
  (Float32Array for x, y, vx, vy, life, maxLife, size, hueIdx) — NO new in the
  loop; 14 particles per graze, 40 on death. Follow engine/particles.js pool
  semantics.
- Juice: trauma² shake — offset = trauma² x 26 px x noise(t x 40), pitch
  ±3.5° x trauma², decay 1.6/s; hitstop 180 ms on death, micro-hitstop 40 ms
  at every chain milestone of 10 (juice timers run on a separate clock so
  interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture with a 10 ms master fade-in (no pop),
  suspend on pause, mute state persisted; master chain masterGain →
  WaveShaper soft-clip → DynamicsCompressor (threshold −18 dB, ratio 6:1) →
  destination. Master never starts > 0.5.
- Sound table: flip = square sweep 160 → 320 Hz / 60 ms; graze = sine on the
  minor-pentatonic scale [0, 3, 5, 7, 10] semitones from base 440 Hz, climbs
  1 step per chain + an octave every 5 chains (cap +2), a second osc detuned
  x2.01 for shimmer; slingshot = triangle 220 → 440 Hz / 90 ms; death = saw
  300 → 40 Hz / 500 ms + noise burst lowpassed at 800 Hz; OVERDRIVE pad =
  2 saws at 110 Hz detuned ±7 cents, LFO 6 Hz sweeping the filter cutoff
  400 → 2400 Hz. All peaks ≤ −6 dB.
- Trail ribbon of the 24 most recent points on the player orb,
  globalCompositeOperation 'lighter'; white radial hit-flash 60 ms alpha
  0.5 → 0; graze ring #FFE066 glows around a hazard while inside its annulus.
- Combo system: graze window 1.4 s (refreshed on every graze), multiplier =
  1 + floor(chain/3), cap x16; Flux Meter 0 → 100% (+4 per graze, +12 per
  coin); at 100% → OVERDRIVE for 6 s: time-scale 0.85, score x2, whole-scene
  hue shift +15°, vignette pulses on the LFO rhythm.
- C2: (1) 60 fps with the full spawner + 2048-particle pool busy;
  (2) network panel shows zero requests beyond the document; (3) hitstop/shake
  do not break interpolation; (4) audio unlocks on the first gesture, no
  click-pop (10 ms master ramp); (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend; resume
  with a 3-2-1 countdown (600 ms beats); physics never ingests a giant dt
  (loop.js stall clamp resets the accumulator clock).
- Saves via engine/storage.js createStorage('flux-flip', 1, defaults, migrate):
  schema v1 = { best, coins, skins[], settings {sfx, mus, quality 0|1|2, lang}
  }; write best at the moment of death, never waiting for unload. try/catch
  tolerant to corrupt/cleared storage and quota errors; migration hook wired.
  Never raw localStorage.
- Near-miss mastery: the LETHAL hitbox shrinks to 0.8 x (r_hazard + r_player)
  (lethal when d < that threshold); graze annulus 0.8 → 1.35 x the combined
  radius → pays flux + chain + sparks — the player is REWARDED for playing
  dangerously.
- Instant replay < 150 ms: ring buffer of 150 samples @ 30 Hz (player pos/vel/
  polarity + a subset of hazard positions, Int16 quantized); on death, play
  back at 0.5x with a sepia filter + letterbox bars; the first replay frame
  shows < 150 ms after death (just reset the buffer read cursor — NO
  allocation); tap to skip replay → retry.
- FPS governor: a sliding average over 60 frames below 52 fps sustained 3 s →
  drop one quality tier: particle budget −50% → trail off → trail + shake off;
  show a quality icon in the corner.
- Safe-area insets for notches; Screen Wake Lock API best-effort in try/catch.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  every vector/temp preallocated at module scope and reused; verify via Chrome
  allocation profiler: 10 s of gameplay = zero steady-state heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (ui-monospace stack, no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) storage survives a corrupt
  payload; (3) first replay frame < 150 ms after death, zero allocation;
  (4) FPS governor steps never cause a visible hitch; (5) live language switch
  rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/flux-flip/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only (canvas vector/gradients +
   WebAudio, ui-monospace stack), total payload ≤ 5 MB. Ships README.md (how
   to run, controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked: 1% low ≥ 55 fps on a mid-range device; ≥ 58 fps worst-case
   (full spawner + overdrive + trail busy); no repeated frame spikes > 18 ms
   across 10 minutes of play; frame p99 ≤ 20 ms.
3. Zero GC in RAF steady state: allocation instrumentation FLAT after 3
   minutes; update()/render() contain no object literals, closures,
   map/filter/concat, or array pushes outside ring buffers.
4. One-thumb tap-anywhere fully playable: touch-action none, input→pixel
   < 16 ms (≤ 1 frame), scroll/zoom/double-tap-zoom fully blocked.
5. Cold load → playable < 2 s; death → retry < 1.5 s (including replay skip);
   menu → run < 300 ms.
6. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
7. Stress test: 10 minutes alternating fore/background tab + screen lock/
   unlock → no physics drift (fixed-step guarantees it), no audio distortion,
   no save loss.
8. Readable death: 10 sampled deaths — every cause identifiable in one replay
   viewing; graze rewards clearly visible AND audible.
9. Console self-test: C1/C2/C3 all PASS + 'FLUXFLIP READY'.
10. Definition of done: /game:qa flux-flip against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      FLUX FLIP / NEON POLARITY SURGE
  bootTap       TAP TO START
  tut0          TAP ANYWHERE TO FLIP POLARITY
  tut1          LIKE POLES REPEL — OPPOSITES ATTRACT
  tut2          SKIM HAZARDS TO GRAZE — FEED THE FLUX METER
  scoreCap      SCORE      bestCap BEST      chainCap CHAIN
  coinCap       COINS      fluxCap FLUX
  overdriveCap  OVERDRIVE
  grazeCap      GRAZE!
  readyCap      GET READY
  replayCap     REPLAY      replaySkip TAP TO SKIP
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  skinsCap      SKINS       lockedCap LOCKED
  btnRetry      RETRY       btnMenu MENU
  shareHead     FLUX FLIP: NEON POLARITY SURGE —

=== TECHNICAL BLUEPRINT ===
- Palette: vertical gradient bg #05060F → #0B1030 → #1A0B2E + 3 static star
  parallax layers (speeds 0.2/0.5/0.9x); cyan polarity #00F0FF (glow
  rgba(0,240,255,0.35)) ↔ magenta #FF2E88; hazard hot-white #FFFFFF with amber
  core #FFB300; graze ring #FFE066; coin = small hexagon #7CFFB2; overdrive
  applies a whole-scene hue filter +15°.
- Per-substep force sum: a = g·ĵ + Σ(K·P_i/max(d_i², D_MIN²))·û_i − 0.12·v;
  anchors act only within a 560 px influence radius to bound the loop.
- Audio table exactly as in Iteration 2; short-lived nodes are created in event
  handlers (outside RAF); unlock happens exactly once.
- Meta loop: coins (+12 per coin, x2 during overdrive) → unlock 6
  procedural-palette skins that swap the polarity color pair (cyan/magenta ↔
  lime/violet ↔ gold/crimson ...) — color variables only, 0 assets.
- HUD: score + best top corners, chain meter top-center, Flux Meter bar at the
  bottom, coin counter in the menu/shop.
- State machine: BOOT → MENU → RUN → DEATH → REPLAY → RUN; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: input→pixel < 16 ms (pillar 1); logic ≤ 1.6 ms, draw ≤ 8 ms
  @1080p/DPR2 mid-tier; batched canvas ops, no redundant state changes between
  draw calls; hot-path constants UPPERCASE at module scope, hot functions flat
  and no-GC.
```
