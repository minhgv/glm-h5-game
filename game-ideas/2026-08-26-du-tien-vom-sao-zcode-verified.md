# FIREFLY SWING

- **Date:** 2026-08-26 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `firefly-swing` — target folder `games/firefly-swing/`
- **Genre:** Arcade/Casual — one-thumb endless ascender: a pendulum-slingshot climber with Perfect-Arc release timing, near-miss risk/reward, and combo chains.
- **Pitch:** Hold one finger to latch onto the nearest glowing anchor firefly and swing like a pendulum; release at exactly the right moment to fling centripetally up the endless star vault. The bolder you skim past red hazards at cheek distance, the harder your Star-String combo detonates. The rhythm of "swing slow — release brave — fall fast" makes an extremely addictive one-more-run loop.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "ĐU TIÊN: Vòm Sao Đom Đóm".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build FIREFLY SWING — an H5 vertical pendulum-slingshot climber that
meets this repo's shipping bar: games/firefly-swing/ static site scaffolded
from templates/game-starter/ via /game:new, template engines unmodified, zero
build step, zero runtime network. The player is a firefly spark climbing
forever: hold the thumb = latch the nearest anchor above and swing on real
pendulum physics; release = fling along the tangent. Depth comes from 3 skill
layers: (1) the perfect release moment — the Perfect Arc; (2) Star-String
combos while a latch chain survives without touching walls; (3) near-misses —
deliberately skimming hazards for bonus. Studio KPIs: average session ≥ 6 min,
D1 retention ≥ 35%, first death ≤ 25 s (fast fail), juice equal to chart
toppers. Every unclear decision prioritizes game-feel > graphics > side
features. All UI copy in English, served from an STR i18n table with reserved
'vi'/'lo' slots (pattern: games/gravity-juggle) so the game ships
multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: After each iteration run the verification gate
yourself in a browser/console; on FAIL diagnose, fix, re-run (max 5 small
cycles per iteration); advance only when the gate is fully green. Never ask
the user mid-run, never leave empty TODOs. Log 'FIREFLYSWING READY' only when
FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/firefly-swing/ from templates/game-starter/ via /game:new
  firefly-swing. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: 1920x1080 design space, scaled by min(DPR, 2.0), letterbox-safe,
  safe-area insets respected.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation; exactly
  one RAF loop. Entities move in update() only.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  pointerdown = latch the nearest valid anchor above within a 520 px radius;
  pointerup = release. Mouse + Space fallback; 8 ms debounce against
  double-fire; touch-action: none on canvas.
- Pendulum physics: g = 2200 px/s²; Verlet integration + rope-length
  constraint (project position onto the circle of radius L around the anchor,
  preserving tangential velocity); damping 0.999/tick; release velocity =
  tangent x 1.02 (slingshot boost).
- Anchors spawn infinitely by altitude band through engine/rng.js
  createRng(seed); horizontal |dx| between consecutive anchors ≤ 30% of
  screen width, vertical spacing 380–620 px. No Math.random() in gameplay
  code.
- Camera only ascends (follows the max height achieved); death when falling
  160 px below the screen bottom or touching a full-hitbox hazard.
- C1: (1) smooth swing/release with no jerk, rope constraint never violated;
  (2) stable 60 FPS desktop; (3) resize/rotate never breaks layout;
  (4) input→response ≤ 1 frame.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 preallocated — SoA Float32Array (x, y, vx, vy, life,
  size, hueIdx), spawn via ring pointer — zero new in the frame. Follow
  engine/particles.js pool semantics.
- Juice: screen shake trauma model — shake = trauma², decay 1.6/s, offset max
  14 px + roll ±1.2°; latch trauma 0.15, Perfect Arc 0.35, death 1.0.
  Hitstop: Perfect Arc 40 ms, death 120 ms — physics accumulation pauses but
  rendering continues (canvas never freezes).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on the first pointerdown (resume/suspend per autoplay
  policy), suspend on pause, mute state persisted; master chain masterGain →
  WaveShaper soft-clip → DynamicsCompressor → destination. Master never
  starts > 0.5.
- SFX: latch = Karplus-Strong pluck 180 Hz; whoosh = looping white-noise
  buffer + bandpass, cutoff mapped to angular velocity; Perfect Arc =
  A-minor pentatonic arpeggio climbing with combo (A4 440 → C5 523.25 →
  E5 659.25 → G5 784 → A5 880, past combo 5 shift up an octave); near-miss =
  sine ping 1244 Hz, 90 ms decay; background pad = 2 oscillators detuned
  ±7 cent + 0.1 Hz LFO on the lowpass, timbre brightens +8% per km of
  altitude; death = sub-drop 110 → 38 Hz over 300 ms.
- Trail ribbon of 24 points behind the spark (alpha gradient along the
  ribbon); squash/stretch the spark by |v| (scale 1.0–1.35).
- Combo text popups from a pool with scale-punch easeOutBack 220 ms — reused,
  no innerHTML.
- C2: (1) 5 distinct events clearly audible/visible (latch, perfect,
  near-miss, touchdown, death); (2) no clipping, no HUD overdraw;
  (3) Chrome allocation sampling: particle/audio path allocates 0 new bytes;
  (4) zero network requests beyond the document; (5) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: tab hidden → pause everything (physics + audio.suspend); on
  return a 3-2-1 countdown (1 s per digit, drawn on canvas, zero allocation)
  precedes resume; time jumps guarded by the accumulator clamp (loop.js stall
  guard).
- Saves via engine/storage.js createStorage('firefly-swing', 1, defaults,
  migrate): schema v1 = { bestAltitude, totalStars, settings {sfx, music,
  shake, reducedMotion, lang} }. try/catch wrapped (private mode), versioned
  migration hook, never crashes on a full/corrupt store. Never raw
  localStorage.
- Near-miss mastery: real collisions use a hitbox shrunk 20%; a 28 px shell
  around the hazard's full box = near-miss → +75 points, micro time-dilation
  0.85x for 120 ms, cyan sparkle #7BF7FF, trauma 0.1.
- Instant replay: ring buffer at 20 Hz x 1.5 s of state snapshots (pos, vel,
  current anchor, 24 trail points, hazards); on death → replay the last
  140 ms at 0.5x with letterbox + 2-channel RGB chromatic offset; total
  death→replay-entry latency < 150 ms.
- Reduced-motion setting: disables shake + slow-mo replay, gameplay unchanged
  (respects prefers-reduced-motion on first run).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) kill tab mid-run → relaunch keeps best/settings; (2) 20 consecutive
  tab switches without physics time drift; (3) allocation sampling on the RAF
  loop = 0 bytes; (4) storage survives a corrupt payload; (5) live language
  switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL — all green or not done) ===
1. Repo-standard layout: games/firefly-swing/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests, no CDN, no external assets, no external fonts
   (system font stack + canvas text), total payload ≤ 5 MB. Ships README.md
   (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: p95 frame time ≤ 17.5 ms on a mid-2019 laptop and mid-range
   Android, verified with DevTools 4x CPU throttle.
3. Zero GC allocation in RAF: preallocate every vector/particle/static audio
   graph; no string concat, array/object literals, new closures, or DOM
   writes in the hot path; HUD updates only when values change (dirty flag).
4. Complete one-finger play at every screen position; no dead zones, no page
   zoom, no scroll; touch-action none, input → pixel ≤ 1 frame.
5. Audio unlock valid on every major browser; mute persists across sessions;
   no denormal hiss (10 Hz highpass on every gain node).
6. One-more-run loop: first death ≤ 25 s, restart ≤ 1.2 s from the button tap.
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'FIREFLYSWING READY'.
9. Definition of done: /game:qa firefly-swing against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      FIREFLY SWING / THE FIREFLY STAR VAULT
  bootTap       TAP TO LATCH
  tut0          HOLD TO SWING — RELEASE TO SOAR
  tut1          RELEASE AT THE PERFECT ARC FOR COMBO
  tut2          SKIM THE RED HAZARDS — NEAR-MISS PAYS
  altCap        ALTITUDE   scoreCap SCORE    bestCap BEST
  comboCap      STAR STRING
  perfectCap    PERFECT ARC!     grazeCap NEAR-MISS +75
  replayCap     REPLAY
  pausedCap     PAUSED      pauseTap TAP TO RESUME
  countdown     3 / 2 / 1
  deathCap      THE SPARK FADES
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU
  setCap        SETTINGS
  setSfx        SFX         setMusic MUSIC      setShake SHAKE
  setMotion     REDUCED MOTION

=== TECHNICAL BLUEPRINT ===
- Palette: bg gradient by altitude band (tone change every 1200 px, 240 px
  lerp transition): #0B1026 → #1B2A4A (band 0, midnight) → #2A1B4A (violet) →
  #0F3B4A (teal aurora) → #4A1B3A (magenta dawn) → loop back to #0B1026.
  Accents: anchor #FFD166, spark #FFE9A3, tether line #7BF7FF alpha 0.75,
  hazard #FF4D6D, near-miss glow #7BF7FF, UI text #F5F3FF. Star field: 3
  parallax layers (factors 0.15 / 0.4 / 0.75) pre-rendered onto 2 reused
  offscreen canvases.
- Scoring & combo: score = floor(altitude/10) + Σ(Perfect Arc 150 x multiplier
  + near-miss 75); multiplier = 1 + 0.25 x comboPerfect (cap x8); Perfect Arc
  condition: rope-to-vertical angle < 8° AND tangential speed > 620 px/s at
  the release instant; combo resets on touching a screen side edge, hanging
  still > 2.5 s, or a whiffed release (no latch in time).
- Difficulty curve: from 1500 px spinning hazards appear (omega 0.8 rad/s,
  +0.15 per km, gradual); from 3000 px anchors become mobile via sin(t) with
  amplitude 60–140 px; from 6000 px a light gravity well pulls (300 px/s²
  centripetal, radius 240 px); hazard density oscillates like a wave — never
  monotonic, it breathes.
- Pendulum numbers: g = 2200 px/s², latch radius 520 px, anchor vertical gap
  380–620 px, |dx| ≤ 30% screen width, damping 0.999/tick, release boost
  x1.02, death margin 160 px below view.
- HUD: altitude in km with 1 decimal, combo punch-scale, gold tick marking the
  previous session's bestAltitude.
- Commercial prep (non-blocking): end-of-run screen = interstitial slot;
  totalStars doubles as rewarded-video currency; CONFIG isolated for later
  A/B tuning.
- Module layout: template scaffold only — game code in src/, engine/ modules
  unmodified; all gameplay constants in one CONFIG object.
- State machine: BOOT → MENU → RUN → DEAD → REPLAY → RUN; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier.
```
