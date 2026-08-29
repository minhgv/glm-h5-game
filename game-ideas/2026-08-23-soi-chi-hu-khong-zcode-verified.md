# VOID TETHER

- **Date:** 2026-08-23 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `void-tether` — target folder `games/void-tether/`
- **Genre:** Arcade one-thumb orbital-flow — tether-chaining (anchor-orbit physics) fused with a procedural rhythm-resonance dodger.
- **Pitch:** You are a thread of light trapped in the void: you orbit anchors of light automatically, hold your finger to cut the thread and fly along the tangent, release to latch onto the next anchor — latching on the 128 BPM beat multiplies a cascading combo. Play feel: swing — launch — skim past death — explode in timbre; one finger, not a second of rest.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Sợi Chỉ Hư Không" (Void Tether).

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build VOID TETHER — a studio-grade commercial H5 arcade that meets this
repo's shipping bar: games/void-tether/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. 60 FPS locked @1080p HiDPI on a mid-range 2020
device, zero-GC in the game loop, everything controlled with one finger.
Monetization-ready: a safe ad-break point between sectors, a local leaderboard,
zero data collection (GDPR-friendly). Amateur-vs-studio line: bug-free,
studio-grade juice, accessibility (reduced-motion, colorblind mode), fully
procedural WebAudio (no audio files). All UI copy in English, served from an
STR i18n table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle)
so the game ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: after EACH iteration the agent MUST build →
self-audit against that iteration's checklist → measure FPS/heap with DevTools
instrumentation (C1.x, C2.x, C3.x) → only advance when the checklist is 100%.
Log 'VOID-TETHER READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/void-tether/ from templates/game-starter/ via /game:new
  void-tether. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 logical (portrait), HiDPI: backing store = CSS size x
  min(devicePixelRatio, 2.5), ctx.setTransform; letterbox fit; handle
  resize/orientationchange.
- Sim: engine/loop.js fixed timestep — dt = 1/120 s, accumulator, maxSubSteps
  4 (MAX_FRAME_TIME 0.25 s, surplus discarded, spiral-of-death guarded),
  render(alpha) interpolation. Semi-implicit Euler: v += a·dt then p += v·dt.
  Entities move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb
  mechanic: default = orbiting the current anchor; HOLD = cut the thread → fly
  along the tangent at the current tangential speed + gravity g = 1400 px/s²;
  RELEASE = latch to the nearest anchor within a 260 px catch radius
  (priority cone ±60° around the velocity direction). After latching, a
  critically-damped spring binds to the circular orbit (k = 180, c = 2·√k,
  ζ = 1), settle ≤ 120 ms, no jerk. Mouse + Space for desktop QA; input
  latency < 50 ms; touchstart fallback accepted for old iOS; touch-action:
  none on canvas.
- Orbit: θ += ω·dt with ω = 2.6·(1 + min(chain, 20)·0.02) rad/s; tether decay
  r(t) = r0 − 42 px/s creates the pressure to leave the anchor at the right
  moment.
- World procedural: mulberry32 seeded RNG via engine/rng.js createRng(seed);
  the camera climbs vertically forever; difficulty D = 1 + distance/1200
  (cap 8); anchor spacing 320 → 520 px; magenta hazard density 0.08 → 0.35 by
  D; MANDATORY solvability check: the next anchor always exists within 90% of
  the optimal flight range (no unfair deaths). No Math.random() in gameplay
  code.
- C1: (1) stable infinite play loop; (2) death and scoring work end-to-end;
  (3) pinned 60 FPS; (4) hold/cut vs release/latch matches the spec with
  ≤ 120 ms settle and no jerk.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 preallocated slots, ring-buffer overwriting the oldest slot by
  index swap — NO objects/arrays/strings created in RAF. Follow
  engine/particles.js pool semantics.
- Juice: trauma shake — shake = trauma², trauma decay 1.6/s, offset = shake x
  26 px x (sin(t·97.3), cos(t·81.7)) — smooth, no per-frame random jitter.
  Hitstop: reso-hit = 45 ms, death = 90 ms (timeScale = 0, render still draws,
  input buffered so nothing is lost; juice timers on a separate clock).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture (ctx.resume() + state verification),
  suspend on pause, mute state persisted; master chain masterGain → WaveShaper
  soft-clip → DynamicsCompressor → destination. Master never starts > 0.5.
  Synth table: latch = triangle pluck 220 → 440 Hz pitch-env 80 ms through a
  lowpass sweep 2000 → 400 Hz; reso-hit = sine perfect fifth 660 Hz + 990 Hz,
  300 ms decay + a 1320 Hz shimmer for 60 ms; graze = white-noise buffer 60 ms
  through a bandpass 3 kHz Q = 8, gain 0.25; death = saw 300 → 60 Hz over
  400 ms + noise burst; ambient pad = 2 saws detuned ±0.5 Hz @ 55 Hz through a
  0.1 Hz lowpass LFO; metronome 128 BPM: kick = sine pitch-drop 150 → 40 Hz /
  90 ms every beat — shared clock with the anchors' visual pulse (audio-synced
  visuals). Every gain uses 5 ms ramps against click/pop.
- Rhythm resonance: a latch within ±60 ms of the beat = RESO HIT → multiplies
  the chain, a 120 ms chromatic burst, the anchor glows gold.
- Trail: 24-point position history drawn as a gradient #F5F7FF → #8A7CFF by
  speed.
- C2: (1) juice checklist 12/12; (2) a 200-particle burst causes no frame
  spike; (3) network panel shows zero requests beyond the document;
  (4) audio unlocks on the first gesture, no click-pop;
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: tab hidden → full pause + audio.suspend; return → a 1-frame
  warm-up (plus 3-2-1 countdown) then run; guard against timer drift; loop.js
  stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('void-tether', 1, defaults,
  migrate) (replaces the original versioned key 'voidtether.v1'): schema v1 =
  { best, bestSector, settings { sfx, music, reducedMotion, colorblind, lang }
  }; JSON schema with a version + safe migration. try/catch tolerant to
  corrupt/cleared storage. Never raw localStorage.
- Near-miss hitbox: fatal hitbox = 80% of the hazard radius; graze ring = 118%
  of the radius → GRAZE +50 x m — that adrenal skim-past-death feel.
- Instant replay: ring buffer 5 s @ 30 Hz (flat Float32Array, 150 samples x
  (x, y, theta) for every entity); on death, playback at 0.6x; replay renders
  < 150 ms after the collision — no stall, no allocation.
- Death flow: replay → one-tap RESTART → into fresh gameplay < 400 ms.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) 20 tab switches with no audio/timer leaks; (2) 50 restarts with the
  heap flat; (3) storage survives a corrupt payload and migrates without data
  loss; (4) replay starts < 150 ms after death; (5) live language switch
  rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/void-tether/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, every visual drawn with pure Canvas2D and every sound
   synthesized procedurally, total payload ≤ 5 MB. Ships README.md (how to
   run, controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked: median ≥ 60 FPS, frame p99 ≤ 17.5 ms; physics fixed-step
   cleanly separated from render (changing the display Hz does not change
   gameplay).
3. Zero GC in RAF steady state: Chrome allocation instrumentation over 60 s of
   gameplay → 0 steady-state allocations; heap snapshot before/after diff
   flat.
4. One-thumb full-screen fully playable: latency < 50 ms, no dead-zone
   required, no positional precision required; touch-action none,
   scroll/zoom/double-tap-zoom fully blocked.
5. Audio: unlock on the first gesture, no click/pop, suspends when the tab is
   hidden.
6. Replay: shown < 150 ms after death, smooth 30 fps playback.
7. Persistence: score/settings survive a reload; schema migrates without data
   loss; survives a corrupt payload.
8. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
9. Console self-test: C1/C2/C3 all PASS + 'VOID-TETHER READY'.
10. Definition of done: /game:qa void-tether against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         VOID TETHER
  bootTap       TAP TO START
  tut0          HOLD TO CUT THE THREAD — RELEASE TO LATCH
  tut1          LATCH ON THE BEAT FOR RESO HITS
  tut2          SKIM HAZARDS TO GRAZE — FEED THE CHAIN
  scoreCap      SCORE      bestCap BEST      sectorCap SECTOR      chainCap CHAIN
  grazeCap      GRAZE!     resoCap RESO HIT!
  readyCap      GET READY
  replayCap     REPLAY      replaySkip TAP TO RESTART
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  soundOn       SOUND ON    soundOff SOUND OFF
  musicOn       MUSIC ON    musicOff MUSIC OFF
  motionCap     REDUCED MOTION      colorblindCap COLORBLIND
  btnRetry      RETRY       btnMenu MENU
  shareHead     VOID TETHER —

=== TECHNICAL BLUEPRINT ===
- Palette: vertical gradient bg #050510 → #0B1026 → #1B1F4B + 3 radial
  nebulae lerping hue slowly with the camera; anchor cyan #4EF3E8, resonance
  gold #FFC94A, hazard magenta #FF3D6E, spark white #F5F7FF, trail violet
  #8A7CFF. Colorblind mode: hazard switches to #FFB800 + a diagonal stripe
  pattern. Reduced-motion: honors the setting (shake/flash toned down).
- Combo & scoring: distance 10 pts/s x m; latch +25 x m; reso-hit +200 x m;
  graze +50 x m; m = 1 + floor(chain/4), cap x8; death resets the chain; m is
  shown as the thickness of the glow halo around the spark (no numerals during
  flow — text only appears when the chain breaks).
- Camera: smooth Y lerp, 180 px velocity look-ahead, speed-capped so it never
  jolts the player.
- HUD: score + best, sector, chain halo; no score numerals mid-flow.
- State machine: BOOT → MENU → RUN → HITSTOP → REPLAY → RESULT; each state has
  clean entry/exit, no scattered phase logic; PAUSE overlay anytime (button +
  visibilitychange). All gameplay constants gathered in one CONFIG object at
  the top of src/main.js; the template's engine modules cover the
  Engine/Audio/Particles/World/UI/Storage roles.
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier; batched
  canvas ops, no redundant state changes between draw calls.
```
