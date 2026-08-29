# Neon Tether: Orbit Thief

- **Date:** 2026-08-21 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `neon-tether-orbit-thief` — target folder `games/neon-tether-orbit-thief/`
- **Genre:** Arcade/casual one-thumb orbital-swing vertical runner (attach-and-orbit physics + graze near-miss scoring + spin-match gates).
- **Pitch:** Hold one finger to latch onto an anchor and orbit it, let go to get flung tangentially upward forever; shave past obstacles for grazes, thread gates while matching the spin direction you own to detonate your combo. The feel: weightless pendulum drift, then a 0.2-second explosion of speed.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Neon Tether: Kẻ Cắp Quỹ Đạo".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Neon Tether: Orbit Thief — an H5 arcade game that meets this
repo's shipping bar: games/neon-tether-orbit-thief/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: one-thumb orbital swing — attach, orbit,
release to fling up an endless vertical climb. All UI copy in English, served
from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. Commercial bar:
TTV (time-to-value) < 3 s from load to first playable frame; session length
target 45–120 s; retry loop < 300 ms. Four engineering pillars that separate it
from amateur work: (a) deterministic fixed-step physics, (b) zero-allocation
GC render loop, (c) procedural 0-asset realtime synth audio, (d) telemetry/
retention hooks (daily seed, coins, death-heatmap DDA) — with rewarded-ad hook
'Second Wind' and cosmetic tether skins pre-scaffolded as API stubs (no network
calls). Core fantasy: STEAL THE ORBIT — the player steals the world's angular
velocity; the longer you keep it, the farther you fling, the closer you graze,
the more the score explodes. No stubs beyond those API hooks, no TODOs, no
scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order; each iteration
MUST hit its DoD before the next. After EACH iteration run the verify ritual
(perf trace, heap snapshot, the relevant FINAL items); fix each failure at the
root before advancing. Forbidden: TODOs/placeholders, setTimeout for game
logic, object creation in the hot loop, unnamed magic numbers, dead code. On a
trade-off, priority is per-round DoD > eye candy > side features; anything not
in this spec is NOT built. Log 'NEON-TETHER READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/neon-tether-orbit-thief/ from templates/game-starter/ via
  /game:new neon-tether-orbit-thief. Plain ES modules + <script type="module">,
  served over http:// (never file://). Games never import from outside their
  folder; engine/ modules stay unmodified.
- Stage: logical 1080x1920 (9:16 portrait), backing store = 1080·dpr x
  1920·dpr with dpr = min(devicePixelRatio, 2.5); CSS letterbox keeps aspect;
  resize + orientation change never break the layout.
- Sim: engine/loop.js fixed timestep — stepHz 120 (dt = 1/120 s), maxSubSteps 4
  (surplus discarded, frameDelta clamp 0.25 s guards spiral-of-death), render
  interpolation with alpha = acc/dt. No setTimeout for game logic. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified Pointer Events + keyboard fallback.
  pointerdown = ATTACH, pointerup = RELEASE; Space as desktop fallback;
  touch-action: none; preventDefault blocks scroll/zoom/context-menu.
- State machine: MENU → PLAYING → DYING (hitstop) → REPLAY → SCORE → PLAYING;
  tap-to-retry from every death state, retry < 300 ms.
- Entity roster (minimum): player (point + trail), anchors (spawned upward via
  deterministic mulberry32 — engine/rng.js createRng), hazards (round mines +
  rotating bars), spin-match gates (thread them while your spin direction
  matches for a PERFECT), camera (locks max-height only, exponential smooth
  1 − e^(−6·dt)).
- All randomness through engine/rng.js createRng(seed). No Math.random() in
  gameplay code.
- C1 (DoD): (1) 3 full minutes of the complete loop (attach → orbit → release
  → die → retry); (2) performance trace shows no frame > 17 ms; (3) two runs
  with the same seed produce identical physics state-hashes every 120 steps
  (self-verify: log the state-hash).

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: ring buffer of 2048 pre-allocated (fields x, y, vx, vy, life,
  maxLife, size, hueIdx, type) — spawn = overwrite a slot via the ring cursor,
  absolutely no object creation in the loop. Follow engine/particles.js pool
  semantics.
- Juice: trauma-model screen shake — trauma ∈ [0,1], offset = trauma² x 14 px x
  noise, decay 1.8/s; event trauma: graze +0.12, perfect gate +0.3, death
  +1.0. Hitstop: a freeze counter inside the step loop (skip physics for N ms
  but keep rendering): perfect gate 60 ms, death 120 ms (juice timers run on a
  separate clock so interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily, unlockAudio() on the first gesture (pointerdown/keydown) +
  resume() if suspended; suspend on pause; mute state persisted; master chain
  masterGain → DynamicsCompressor → destination; a 1 s noise buffer generated
  once at init. Master never starts > 0.5. Synth spec in TECHNICAL BLUEPRINT.
- Trail ribbon: 24-point fading polyline; tier-based glow via shadowBlur
  (controlled by the perf governor).
- C2 (DoD): (1) every gameplay event gets audio + visual feedback within
  ≤ 1 frame; (2) heap snapshot before/after 60 s of gameplay: 0 new objects in
  the hot path; (3) no audio clipping (compressor engaged); (4) network panel
  shows zero requests beyond the document; (5) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: visibilitychange → pause < 50 ms (accumulator frozen,
  audio.suspend); on return, a 3-2-1 countdown rendered by a stepped timer
  inside the loop (no setTimeout); window.blur fallback; loop.js stall clamp
  guards time jumps.
- Saves via engine/storage.js createStorage('neon-tether-orbit-thief', 1,
  defaults, migrate): schema v1 = { best, coins, runs, deathHeatmap (12
  altitude buckets), settings { sfx, haptics, quality, lang } }. try/catch +
  versioned key + migration hook; every JSON.parse guarded. Never raw
  localStorage. DDA: dying 3 times in the same bucket → spawn gap +10% (mercy)
  on the next run.
- Near-miss dual hitbox: death hitbox = 80% of visual radius (−20%); graze
  band = [80%, 125%] of radius; entering the band fires a graze event (points
  + combo + spark + audio tick); debug overlay (D key or 3-finger tap) draws
  the hitboxes — verify with 20 sampled cases.
- Instant replay < 150 ms: ring buffer records player state (x, y, theta,
  omega, R, anchorId, alive) every fixed step, 300 samples (2.5 s @ 120 Hz),
  allocated once at boot; on death: hitstop 120 ms then replay at 0.4x speed
  with letterbox bars + film tint; from the death input to the first replay
  frame ≤ 150 ms (measured with performance.now()); afterwards the panel:
  Score / Best / Max Combo / Graze / Coins, tap to retry.
- Performance governor: rolling average frame-time > 17.5 ms across 60 frames
  → drop one dpr step, drop the shadowBlur tier, persist to settings. Soak
  test 30 minutes: heap growth ≤ 5%.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  UI text rebuilt only when the value changes (string cache); verify via
  Chrome allocation profiler: 10 s of gameplay = zero steady-state heap
  growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts). English comments for
  handoff (repo convention).
- C3 (DoD): (1) pause/resume glitch-free physics; (2) replay first frame
  ≤ 150 ms after death; (3) profiler shows zero RAF allocations; (4) storage
  survives a corrupt payload; (5) live language switch rebuilds all labels,
  en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/neon-tether-orbit-thief/ runs as a plain static
   site (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests (no CDN, no fetch/XHR), procedural assets only
   (100% canvas vectors + WebAudio synth, no image/audio/font files), total
   payload ≤ 5 MB. Ships README.md (how to run, controls, tuning table) +
   GDD.md from docs/game-design-template.md.
2. 60 fps locked: 60 s gameplay trace, ≥ 99% of frames < 16.9 ms on a
   mid-range device; the governor self-lowers tiers when it dips.
3. Zero GC allocation in RAF: allocation instrumentation shows 0 kB/s in
   steady state; no object/array/closure/string creation in update+render; UI
   text rebuilt only on value change.
4. One-thumb fully playable; mouse + Space fallback; scroll/zoom/context-menu
   blocked; touch-action none, response ≤ 1 frame.
5. Tab switch 10 times in a row: pause < 50 ms, audio suspended, countdown on
   resume; the accumulator clamp never jumps time.
6. Persistence: kill the tab mid-run → best/coins/settings/heatmap survive;
   all JSON.parse guarded; storage survives a corrupt payload.
7. Near-miss: death hitbox = 80% visual, graze band = [80%, 125%]; verified
   via the debug overlay on 20 cases.
8. Instant replay: death input → first replay frame ≤ 150 ms
   (performance.now()).
9. Deterministic: 2 runs with the same seed → state-hash identical 100%
   (logged every 120 steps).
10. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
    'vi'/'lo' drop in the moment translations land.
11. Console self-test: C1/C2/C3 all PASS + 'NEON-TETHER READY'.
12. Definition of done: /game:qa neon-tether-orbit-thief against
    docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      NEON TETHER / ORBIT THIEF
  bootTap       TAP TO START
  tut0          HOLD TO ORBIT — RELEASE TO FLY
  tut1          SHAVE OBSTACLES FOR GRAZE POINTS
  tut2          THREAD GATES SPINNING YOUR WAY
  scoreCap      SCORE      bestCap BEST      comboCap MAX COMBO
  grazeCap      GRAZE      coinsCap COINS
  perfectCap    PERFECT!
  overdriveCap  OVERDRIVE
  dailyCap      DAILY CLIMB
  secondWind    SECOND WIND
  skinsCap      TETHER SKINS
  replayCap     REPLAY      replaySkip TAP TO SKIP
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette & gradients: sky base (vertical 3-stop) #04050D → #0A1030 → #1A0B33;
  biome tint lerped by altitude every 4000 m: biome1 cyan #00E5FF, biome2
  magenta #FF2E88, biome3 amber #FFB300, biome4 UV #7A5CFF; the tint applies
  to the background haze, anchor rings, and tether. Player: white core
  #FFFFFF + glow in the current biome (shadowBlur 24); tether: cyan→magenta
  gradient line with a 3-tap sine wobble over time; UI score 64 px bold with
  glow by combo tier; faint perspective grid background at 6% alpha scrolling
  with the camera (parallax 0.4x).
- Physics (1080p logical px, dt = 1/120): free-fall v += g·dt, g = 1800 px/s²;
  speed clamp 2600 px/s. Attach: pick the nearest anchor within a 75° cone
  ahead, distance ≤ 720 px; R = clamp(current distance, 180, 320). Angular
  velocity on attach: omega = (rx·vy − ry·vx) / R², with r = playerPos −
  anchorPos. While orbiting: theta += omega·dt (omega preserved, plus a pump
  of +8%/s for finger-sweetening); pos = anchor + R·(cosθ, sinθ). Release:
  tangential v = omega·(−ry, rx) — conserves the spin direction, the source
  of the 'fling' feel. Death: the core hitbox (80% visual) touches a hazard,
  or falling off the camera bottom.
- Procedural synth (0 assets, explicit frequencies): note ladder
  (graze/perfect) — A minor pentatonic ladder, semitone s = min(24,
  floor(combo/2)), f = 220 · 2^(s/12); osc triangle + sine partial at 2.01x;
  ADSR attack 5 ms, exponential decay 220 ms. Attach: sub thump sine 90 Hz
  pitch-dropping to 55 Hz over 90 ms. Release: noise bandpass sweep
  300 → 2400 Hz, 140 ms. Perfect gate: FM ping — carrier 880 Hz, modulator
  ratio 3.01, decaying index, 180 ms envelope. Tether hum (while attached):
  2 detuned saws 55 Hz & 55.8 Hz → lowpass 300 Hz (LFO 6 Hz), gain 0.05.
  Death: noise burst lowpass sweep 3800 → 90 Hz exponential over 450 ms, gain
  0.5 → 0. Overdrive (combo ≥ 24): beat at 128 BPM — kick sine 150 → 45 Hz
  (120 ms) alternating with hat noise highpass 8 kHz (30 ms) on every 8th
  note; background pulse synced to the beat. Haptics: navigator.vibrate(10)
  graze, (30) perfect, ([60,40,60]) death (when settings enable it).
- Combo & score: graze +1 combo (+25·m points); perfect gate (through a gate
  with the omega sign matching the current spin) +2 combo (+100·m); anchor
  chain (attach a new anchor within 1.5 s of release) +50·m. Multiplier
  m = 1 + floor(combo/8); combo decays to 0 after 4 s without an event;
  combo ≥ 24 = OVERDRIVE: all points x2, beat layer on, background pulses.
- Difficulty (function of altitude alt): anchor gap G = 420 − 160·min(1,
  alt/12000); spin-match gate probability 0.35 + 0.55·min(1, alt/9000);
  mobile anchors (bob sine, amplitude 60–140 px, frequency 0.4–0.9 Hz) appear
  after alt > 6000; hazard density scales linearly with the heatmap bucket.
  Daily Challenge: seed = mulberry32(YYYYMMDD) via engine/rng.js — same seed,
  same layout, leaderboard-ready (with a score-signature hash).
- HUD: score top, combo tier glow, graze/coins counters; results panel lists
  Score / Best / Max Combo / Graze / Coins.
- State machine: BOOT → MENU → PLAYING → DYING (hitstop) → REPLAY → SCORE →
  PLAYING; PAUSE overlay anytime (button + visibilitychange).
- Perf budget: no frame > 17 ms target, ≥ 99% < 16.9 ms; governor ladder:
  dpr step → shadowBlur tier → persist.
```
