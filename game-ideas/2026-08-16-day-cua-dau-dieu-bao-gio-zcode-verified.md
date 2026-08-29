# LINE SAW

- **Date:** 2026-08-16 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `line-saw` — target folder `games/line-saw/`
- **Genre:** Arcade skill one-thumb (H5 portrait) — Verlet kite-line physics + real-time line-sawing duels; hyper-casual controls, mid-core depth, wave-based (Season) progression.
- **Pitch:** You don't control the kite — you control the kite-flier: drag your thumb with the wind, reel the line in and out, twitch it on the beat to saw through the enemy's line before yours gives. Every cut is a paper storm; every combo is a returning gale that shoves the rival back across your line.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "DAY CƯA — Đấu Diều Bão Gió".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Line Saw — an H5 portrait one-thumb arcade duel that meets this
repo's shipping bar: games/line-saw/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: fly your kite-flier with the wind, reel
and twitch your line to saw through enemy kite lines while protecting your
own — cut = paper burst, combo = MONSOON GUST that shoves enemies toward your
line. Commercial targets: 3–5 min sessions, D1 retention > 35%, rewarded-
continue once per run. Enterprise bar: deterministic physics, 0 garbage
allocation in RAF, 0-asset audio, graceful degradation (audio or storage loss
still playable), no-op analytics hooks ready for an SDK. Standing principles:
(1) exactly one thumb — every mechanic uses a single pointer; (2) death is
always a wind-reading error by the player, never an unseen hit; (3) p95 frame
time < 16.7 ms on every target device, no exceptions. Every technical number
(color, frequency, physics, difficulty) is defined here and must not be
freely varied; log any tradeoff into a DECISIONS section at the end. All UI
copy in English, served from an STR i18n table with reserved 'vi'/'lo' slots
(pattern: games/gravity-juggle) so the game ships multi-language-ready.
No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'LINE-SAW READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/line-saw/ from templates/game-starter/ via /game:new
  line-saw. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: design space 1080×1920, DPR clamp ×2, letterbox scale-to-fit;
  static offscreen background drawn once at boot.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback — single
  pointer only: pointermove X → anchor X (spring k = 14 s⁻¹); Y → reel line
  in/out (length 45%..100%); quick tap < 150 ms → TWITCH (line jerk, tension
  spike for 250 ms — the skill verb used to cut). touch-action: none on
  canvas.
- Kite line: Verlet chain of 16 nodes, constraint relaxation 6 iterations per
  step. Kite = point mass with lift/drag per the BLUEPRINT formulas.
- Wind field: sum of 3 sine octaves + Poisson gusts (formulas in BLUEPRINT).
- One enemy kite AI wanders; cutting the enemy's line → it falls; the
  player's line cut → death → screen restart.
- C1: (1) input smooth, zero perceptible lag, input→render same frame;
  (2) line-segment intersection (sawing) math passes its test cases;
  (3) on-screen FPS meter holds 60; (4) restart < 300 ms.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: SoA pool Float32Array 2048 slots × 8 fields, zero-alloc, ring
  reuse. Follow engine/particles.js pool semantics; NO new/closures in the
  hot loop.
- Juice: screen shake TRAUMA model — offset = shake²·trauma, max 18 px +
  rotation 2.2°, decay 1.8 s⁻¹; hitstop 60 ms on a line cut, 180 ms on player
  death (timeScale = 0, RAF never stops); MONSOON GUST combo + talisman
  chime + near-cut sparks per the tables below; paper-burst on every cut.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), full graph
  built at boot, context created lazily on first pointerdown (resume + start
  the wind bed), suspend on pause, mute state persisted; master chain
  masterGain → WaveShaper soft-clip → DynamicsCompressor → destination.
  Master never starts > 0.5.
- C2: (1) every important event is both heard and seen; (2) no frame > 20 ms
  while 512 particles are alive; (3) network panel shows zero requests beyond
  the document; (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → pause + audio.suspend + reset the
  accumulator; resume must not jump physics (large deltas discarded).
- Saves via engine/storage.js createStorage('line-saw', 1, defaults,
  migrate): schema v1 = { best, talismans, settings {sound, lang}, skins }.
  Every access wrapped in try/catch with a RAM fallback; migration hook
  wired. Never raw localStorage.
- Near-miss hitbox: player hitbox shrunk 20% vs visual; near-cut zone 14 px →
  slow-mo 120 ms + bonus points.
- Instant replay: ring buffer of 180 pre-allocated Float32Array snapshots;
  death → 180 ms hitstop → replay of the last 3 s at ×0.5 speed with
  letterbox bars; death→replay latency < 150 ms (re-render from the buffer
  only, serialization forbidden).
- Perf audit: DevTools allocation sampling over 30 s of steady-state
  gameplay = 0 B/s; offline test = serve statically, cut the network, play a
  full run with zero errors.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives
  in STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read
  via t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics after tab switches; (2) replay
  starts < 150 ms after death; (3) storage survives a corrupt payload;
  (4) profiler shows zero RAF allocations; (5) live language switch rebuilds
  all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/line-saw/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: p95 frame < 16.7 ms, no frame > 33 ms, under 4× CPU
   throttle included.
3. Zero GC in RAF: steady state 0 B/s; no closures, array/object literals,
   or string concat in the hot path; score rendered via a pre-rendered glyph
   atlas.
4. One-thumb fully playable: touch-action none, input→render same frame,
   full game playable on any ≥ 5-inch screen; cold boot < 1 s; restart
   < 300 ms.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Console self-test: C1/C2/C3 all PASS + 'LINE-SAW READY'.
7. Definition of done: /game:qa line-saw against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         LINE SAW
  bootTap       TAP TO START
  tutDrag       DRAG WITH THE WIND — REEL IN, LET OUT
  tutTwitch     QUICK TAP TO TWITCH THE LINE
  tutCut        CROSS LINES TO SAW — FIRST TO BREAK WINS
  scoreCap      SCORE      bestCap BEST      talisCap TALISMANS
  comboCap      ×N
  monsoonCap    MONSOON GUST
  seasonCap     SEASON      season0 CALM      season1 WINDY      season2 STORM
  newBest       NEW BEST!
  replayCap     REPLAY      replaySkip TAP TO SKIP
  overTap       TAP TO FLY AGAIN
  reviveCap     CONTINUE
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  setSound      SOUND

=== TECHNICAL BLUEPRINT ===
- Palette: sunset-storm vertical linear-gradient #0B1026 → #2B1A4E → #7A2E4F
  → #FF7A3D, ground #12081F; player kite vermilion #E8382F with gold trim
  #F2B441; glowing line rgba(255,236,170,α); enemy tiers — teal #29D9C2
  (slow), magenta #E14ECF (fast), storm #5B6B8C with white trim; UI #F5EAD0;
  combo flame #FFD166 → #EF476F. All gradients built once at boot, cached
  offscreen. System font stack.
- Physics (design px): wind W(t,x) = Σ Ai·sin(ωi·t + ki·x + φi) with
  A = 40/26/14 px/s, ω = 0.7/1.9/4.3 rad/s; gust Poisson λ = 1/6 s, boost
  +180 px/s decaying with τ = 1.2 s. Kite (m = 1): a = (Laero + Ttension +
  G)/m; lift = Cl·|vrel|², Cl(α) = 1.2·sin(2α), α = line–wind angle; drag =
  0.02·|vrel|² opposite vrel. Line Verlet: 16 nodes, rest segment 34 px,
  gravity 900 px/s², damping 0.995, relaxation ×6; tension = average stretch
  clipped to [0,1]. Twitch: tension ×2.2 for 250 ms, linear decay.
- CUTTING: when two line segments intersect (sweep-and-prune along x culls
  far pairs): saw speed = |Δv|·tension_attacker·sin(θ crossing); damage
  accumulates at the crossing point, break threshold 24 — the first side to
  reach it cuts the other's line. Kite↔kite contact never kills, only pushes
  (impulse 300).
- Scoring: cut = 100 × mult; talisman = 10; near-cut = 25; survival 1/s.
  Combo window 4 s, mult = min(9, 1 + chain); combo ≥ 5 → MONSOON GUST 2.5 s:
  wind shoves every enemy toward the player's line plane.
- Difficulty/seasons: spawn interval = max(0.9, 3.2 − 0.18·wave) s; enemy
  speed ×(1 + 0.07·wave); every 60 s advances one SEASON (CALM → WINDY →
  STORM: sky darkens, wind +35%, rain particles). Daily seeded run via
  engine/rng.js createRng seeded from the system date.
- Audio table (all nodes built at boot): wind bed = 2 s noise buffer loop →
  bandpass 400–900 Hz, LFO 0.13 Hz, gain scales with tension; cut = saw
  180→58 Hz pitch-env 90 ms + noise HP 2 kHz 40 ms + sub sine 46 Hz 120 ms;
  twitch = triangle pluck 320 Hz decay 60 ms; talisman = FM bell, carrier
  880 Hz, mod ratio 3.01, index decay 300 ms; combo ladder = pentatonic just
  intonation 220 Hz × [1, 9/8, 5/4, 3/2, 5/3, 2, 9/4, 5/2, 3] by chain
  1→9; death = noise LP sweep 6k→120 Hz 600 ms + double heartbeat sine
  55 Hz. Compressor −18 dB knee 24 → limiter −1 dBFS.
- Memory budget: particles 2048×8 float; enemies pool 64 objects; replay ring
  180 snapshots × Float32Array; total steady heap ≤ 12 MB; no dynamic
  allocation after boot.
- Monetization/analytics: window.__dc?.event(name) no-op hooks; rewarded-
  continue slot = 5 s countdown, once per run.
- State machine: BOOT → TITLE → RUN → REPLAY → GAMEOVER (→ RUN); PAUSE
  overlay anytime (button + visibilitychange).
- Perf budget: p95 < 16.7 ms, JS ≤ 8 ms/frame @DPR2 mid-tier; batched canvas
  ops, no redundant state changes between draw calls.
```
