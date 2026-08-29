# INK TRAIL

- **Date:** 2026-08-18 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (games/ink-trail/ scaffold instead of a one-file build), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `ink-trail` — target folder `games/ink-trail/`
- **Genre:** Arcade survival one-thumb (H5) — flappy-buoyancy meets trail-terrain: your ink trail solidifies into the level itself; graze near-miss combos; procedural zero-asset audio.
- **Pitch:** You are a glowing squid: hold to rise, release to sink — and after 2.5 s the ink trail you just swum through hardens into coral: a shield… or a cage around you. The closer you shave past deadly things, the huger the Graze combo — finesse is paid in points.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Vệt Mực — Nẻo Do Tay Vẽ".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build INK TRAIL — an H5 arcade survival game that meets this repo's
shipping bar: games/ink-trail/ static site scaffolded from
templates/game-starter/ via /game:new ink-trail, template engines unmodified,
zero build step, zero runtime network. Core loop: the ink trail you just drew
IS your terrain — first a life-saving platform, then a prison — with a graze
near-miss combo paying out for finesse and a one-more-run loop of 30 s–2 min.
North stars: (1) the one-more-run loop, (2) finesse rewarded through the
Graze combo, (3) studio feel — 60 fps smooth, heavy juice, zero jank. Any
jank, stutter or per-frame allocation is a severity-1 bug outranking
everything else. All UI copy in English, served from an STR i18n table with
reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the game ships
multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. Each
iteration: BUILD → SELF-TEST against its checklist → fix and re-verify any
FAIL before advancing; a later iteration must never break an earlier
iteration's checklist; end each iteration with a 5-line PASS/FAIL report. Log
'INK-TRAIL READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/ink-trail/ from templates/game-starter/ via /game:new
  ink-trail. Plain ES modules + <script type="module">, served over http://
  only. Games never import from outside their folder; engine/ modules stay
  unmodified.
- Stage: 1920x1080 logical, HiDPI scale = min(devicePixelRatio, 2); letterbox
  held on resize; touch-action: none; scroll/double-tap-zoom fully blocked.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation; exactly
  one RAF loop. Entities move in update() only; render code never mutates
  state.
- Input: engine/input.js unified pointer/touch + keyboard fallback:
  pointerdown/up/cancel unify mouse+touch; hold = swim up, release = sink;
  only the first pointer counts.
- Squid physics (px/s, px/s²): vy += (holding ? −2600 : +1800) x dt;
  hydraulic drag vy x= exp(−1.8·dt); clamp vy ∈ [−620, 700]; the world
  auto-scrolls horizontally: worldSpeed 220 → 520 (+6 per 10 s); the squid
  stays fixed on screen.
- Ink trail: 256-point ring buffer; push a new point when the head has moved
  ≥ 12 px; after 2.5 s a point turns SOLID; solid = capsule of radius 7 px;
  off-screen points recycle.
- Collision: swept capsule-capsule; head r = 14. Touching solid ink: lose
  1/3 heart + knockback + 1.2 s i-frames. Angler fish: instant death.
  Plankton: circle r = 26.
- Spawner: plankton along sin-noise bands; Anglers appear after 300 m with
  density scaling by depth; corridor-solver: before spawning a blocker,
  flood-check that a ≥ 120 px exit always exists.
- FSM: BOOT → MENU → PLAY → PAUSE → OVER → REPLAY. No Math.random() in
  gameplay code — all spawning via engine/rng.js createRng(seed).
- C1: (1) playable one-thumb; (2) 60 fps measured; (3) resize never shifts
  hitboxes; (4) pause/resume never shifts physics; (5) line-by-line loop
  audit: zero object creation in RAF.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 pre-allocated, struct-of-arrays; types: bubble,
  plankton-burst, ink-drop, graze-spark, shatter; absolutely no new/[]/{} in
  a frame; when active > 85% of the pool, auto-throttle spawn rate — follow
  engine/particles.js pool semantics.
- Juice: trauma shake — trauma ∈ [0,1], decay 1.6/s; offset = trauma² x 14 px
  x 2-frequency noise; sources: eat +0.06, graze +0.12, heart-break +0.45,
  death 1.0; total offset ≤ 10 px; toggle in settings. Hitstop/slow-mo:
  heart-break freeze 110 ms; big-feed freeze 60 ms; death timeScale 0.15 for
  400 ms. Squash-stretch: sy = 1 − clamp(vy/900, −0.35, 0.45); sx = 2 − sy;
  lerp rate 12/s. Tentacle: 8-segment follow-the-leader, spring k = 40,
  damping 8.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily, unlocked on the first gesture, suspend on pause, mute
  state persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination, split music/sfx buses. Master never
  starts > 0.5. No audio files, no base64 audio — 100% synthesized.
- Synth table: pickup = sine pluck, attack 5 ms decay 180 ms, A-minor
  pentatonic [220, 261.63, 293.66, 329.63, 392] Hz, index = chain % 5, every
  10 chains pushes +1 octave (x2), capped at 2; graze = shared 1 s noise
  buffer (created once) through bandpass 6 kHz, 40 ms, gain 0.05;
  heart-break = square glide 110 → 55 Hz 150 ms + 80 ms noise burst; death =
  sawtooth glide 220 → 41.2 Hz 350 ms + 55 Hz sub sine; solidify = triangle
  chime 1318.5 Hz decay 300 ms gain 0.03 when the trail hardens near the
  head; ambient = 2 drone triangles detuned 55 & 55.5 Hz through a lowpass
  with 0.1 Hz LFO; 8-step sequencer BPM 96 → 132 following worldSpeed; kick
  = sine pitch-env 150 → 40 Hz.
- Combo & scoring: plankton +10 x mult; chain grows on eats within 4 s;
  mult = min(8, 1 + floor(chain/5)). GRAZE: distance to a deadly thing inside
  the ring between the −20% hitbox and the full hitbox, held ≥ 90 ms →
  +1 graze, +25 points, light trauma. Ink Fever: ≥ 15 grazes in one life →
  5 s of all points x2 + neon-pink palette flip. Floating text from a
  32-label pool.
- C2: (1) audio only after the first gesture; (2) zero runtime SFX
  allocations (buffers/nodes built outside RAF); (3) the particle pool never
  starves; (4) shake ≤ 10 px, nausea-safe; (5) 60 fps with full juice;
  (6) network panel shows zero requests beyond the document;
  (7) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: visibilitychange → auto-pause + mute when hidden; on return an
  overlay "Tap to continue" (never auto-resume into gameplay); loop.js stall
  clamp guards time jumps.
- Saves via engine/storage.js createStorage('ink-trail', 1, defaults,
  migrate): schema v1 = { best, meters (lifetime — meta progression), zone
  (depth record), settings {shake, audio, lang} }. Versioned, try/catch
  everywhere, graceful degradation (full storage → play on, no crash);
  migration hook wired. Never raw localStorage.
- Near-miss: every FATAL check uses the 20%-shrunk hitbox (r x 0.8); the
  graze band IS the ring between the two hitboxes — the game's main combo
  source.
- Instant replay: 150-snapshot ring buffer (pos, vy, trailHeadIdx, scroll)
  @ 60 Hz = 2.5 s; on death, after 80 ms, replay the last 1.2 s at 2x with a
  grey palette + vignette, then game over; perceived death → replay-start
  latency < 150 ms.
- Onboarding in 3 s: the first run surfaces HOLD/RELEASE exactly when needed;
  the first solidification shows the hint that old ink hardens after 2.5 s.
- Edge cases: dt spike > 250 ms → clamp and drop the surplus; lost canvas
  context → recreate; full storage → play on, no crash.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) tab switch mid-hitstop never shifts physics; (2) replay matches the
  death position ± 2 px; (3) kill the app → best + settings survive;
  (4) tested across 5 device DPRs; (5) zero console errors in a 10-min soak;
  (6) storage survives a corrupt payload; (7) live language switch rebuilds
  all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/ink-trail/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps: p95 frame time < 16.6 ms on mid hardware; FPS counter only with
   the ?debug URL flag.
3. Zero GC in RAF steady state: 60 s allocation timeline with no blue bars;
   JS heap swing < 2 MB.
4. One-thumb complete: menu → game over with a single finger; every UI hit
   target ≥ 48 px; touch-action none, scroll/zoom/double-tap-zoom blocked,
   response ≤ 1 frame.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Death loop < 2.2 s: death → replay starts < 150 ms → tap restart < 0.5 s.
7. Compatibility: Chrome/Safari mobile, two most recent versions.
8. Console self-test: C1/C2/C3 all PASS + 'INK-TRAIL READY'.
9. Definition of done: /game:qa ink-trail against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         INK TRAIL
  subtitle      A PATH DRAWN BY YOUR OWN HAND
  bootTap       TAP TO START
  tut0          HOLD TO RISE — RELEASE TO DIVE
  tut1          YOUR INK HARDENS AFTER 2.5s — SHIELD OR CAGE
  tut2          GRAZE THE DEADLY THINGS — INK FEVER AWAITS
  scoreCap      SCORE      bestCap BEST      depthCap DEPTH
  grazeCap      GRAZE!
  feverCap      INK FEVER!
  holdCap       HOLD!      releaseCap RELEASE!
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette, 4 depth zones (bg = vertical linear gradient, accents neon):
  Z1 Sunlit Shelf (0–500 m): #0B1E3D → #11557A, accent #4FFCDD, plankton
  #E8FFF9 · Z2 Sunken Sunset (500–1200 m): #0D1030 → #3A1C71, accent
  #FF6EC7 · Z3 Mid Abyss (1200–2500 m): #06001A → #261447, accent #A06BFF ·
  Z4 The Bottomless (2500 m+): #000000 → #0E0E2A, accent #FF3D7F, parallax
  bio-particle glow.
- Ink: loose #B8FFF2 alpha 0.55 → solid #2EE6B8 + glow (glow cached as an
  offscreen sprite drawn once; never per-frame shadowBlur). Ink Fever: all
  accents flip to #FF71CE + a 60 ms white #FFF flash.
- HUD: bold monospace; score top-left, multiplier pill center, 3 ink-drop
  hearts top-right, meter readout along the bottom.
- Arbitration principle: juice vs 60 fps → 60 fps wins; cut particles first,
  effects second. The iteration formulas are the spec — no constant changes
  without a logged reason in the report.
- Completion: 3 iterations PASS + all acceptance items + 20 self-played runs
  without a crash + a final report (checklist, frame-time distribution, pool
  inventory with sizes, design decisions with reasons) recorded in the GDD.
- State machine: BOOT → MENU → PLAY → PAUSE → OVER → REPLAY → PLAY; PAUSE
  overlay anytime (button + visibilitychange).
- Perf budget: p95 < 16.6 ms @1080p/DPR2 mid-tier; zero allocations in the
  frame path.
```
