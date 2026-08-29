# ECHO ABYSS

- **Date:** 2026-08-24 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `echo-abyss` — target folder `games/echo-abyss/`
- **Genre:** H5 arcade survival-ascent, one-thumb — Sonar-Reveal mechanic: hold your finger to swim upward, tap lightly to fire a sonar wave that lights up the world but also wakes the hunters; dodge in the dark to feed the Adrenaline combo.
- **Pitch:** You are a bioluminescent creature rising from an abyss drowned in absolute darkness — every ping that reveals the cave is also a dinner bell for the pack of hunters. The tension between WANTING TO SEE and NOT DARING TO HEAR is the addiction: skim past death in the dark to feed your Blind Streak, fill the Adrenaline gauge, then unleash a Lantern Burst that bares the whole deep.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Hồi Âm Vực Thẳm (Echo Abyss)".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build ECHO ABYSS — a commercial H5 arcade survival-ascent that meets
this repo's shipping bar: games/echo-abyss/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. 60 FPS locked on a mid-range 2018 Chrome Android;
player retention through the risk/reward loop PING → BLIND-DODGE → LANTERN
BURST. Internal KPIs: D1 retention ≥ 35%, average session ≥ 6 minutes,
restart latency < 150 ms. Quality bar: zero amateur signs (no placeholder
art, no console warnings, no frame spikes, no dead screens). All UI copy in
English, served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. No stubs, no
TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: operating principle BUILD → MEASURE → GATE. Only
advance when the current GATE is fully green. On FAIL: max 3 fix branches;
past that threshold, stop and write a root-cause report. Log 'ECHO-ABYSS
READY' only when FINAL ACCEPTANCE passes. Rotating priority: correctness →
performance → juice; end each iteration with a self-check table (PASS/FAIL +
concrete measurements).

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/echo-abyss/ from templates/game-starter/ via /game:new
  echo-abyss. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified. No eval, CSP-safe.
- Stage: 1080p HiDPI portrait-first: logical 1080x1920, backing store =
  min(devicePixelRatio, 2), aspect-fit letterbox, safe-area insets respected,
  3 px pixel-grid snap against blur.
- Sim: engine/loop.js fixed timestep — RAF + accumulator, SIM 120 Hz, max 4
  substeps (spiral-guard, surplus discarded), semi-implicit Euler, render
  interpolation by alpha, dt clamped at 50 ms. Entities move in update() only;
  render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  pointerdown = begin hold (upward swim thrust), pointerup = end; a press
  shorter than 180 ms counts as a PING; the first pointer is locked,
  multi-touch ignored; input→response ≤ 1 frame (input→photon < 50 ms).
  touch-action: none on canvas.
- World: procedural caves via 2-layer value-noise from engine/rng.js
  createRng(seed) (mulberry32) — same seed, same cave (deterministic; the
  foundation of a commercial Daily Challenge). No Math.random() in gameplay
  code.
- Entities: Player (biological lantern), Jelly (sinusoidal drifter), Angler
  (glowing lure + lunge), Leviathan (multi-segment snake, only appears after
  800 m, telegraphed by a heartbeat).
- HUD: depth, best, combo, adrenaline ring; debug overlay (FPS, sim ms, pool
  usage, hitboxes) toggled with the D key.
- C1: (1) 60 FPS on desktop + under 4x CPU throttle in DevTools;
  (2) deterministic for the same seed; (3) 0 console errors; (4) 3 minutes of
  play without a crash.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: SoA Float32Array pools + free-list swap-remove; bubble trail on
  thrust; 3-layer plankton parallax; the ping wavefront drawn as an expanding
  ring stroke; the vignette darkens with depth. Follow engine/particles.js
  pool semantics.
- Juice: trauma shake — shake = trauma², decay 1.8/s, max offset 26 px,
  rotation ≤ 0.035 rad. Hitstop: 55 ms on a near-miss, 240 ms on death
  (timeScale = 0, the frame still renders; juice timers on a separate clock
  so interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture (ctx.resume + the silent-buffer trick
  for iOS), suspend on pause, mute state persisted; master chain masterGain →
  WaveShaper soft-clip → DynamicsCompressor (threshold −18 dB, ratio 6) →
  destination. Master never starts > 0.5. One-shot nodes disconnect onended;
  ≤ 64 live nodes at once.
- Synth set (0 assets, frequency table verbatim): sonar ping = sine sweep
  880 → 220 Hz over 0.42 s (ADSR A=5 ms D=0.4 s R=80 ms) + feedback delay
  0.28 s, feedback 0.35, wet 0.25; heartbeat = triangle 52 Hz double-thump,
  tempo 88 → 140 BPM as a predator closes within 420 px; thrust = noise
  bandpass 600 Hz Q=1.2 gain 0.05 looped while holding; near-miss whoosh =
  noise highpass sweep 300 → 2400 Hz 0.18 s; combo chime = pentatonic
  [523.25, 587.33, 659.25, 783.99, 880, 1046.5] Hz, index = min(combo, 5),
  with a x2 partial at −12 dB; death = sawtooth 110 → 30 Hz 0.6 s + noise
  burst lowpass 400 Hz; lantern arpeggio = 660/880/1320 Hz bell (sine
  fundamental + sine x2.76 at −12 dB).
- C2: (1) budget sim ≤ 3 ms + render ≤ 6 ms @1080p; (2) all 8 feedback types
  clearly audible/visible; (3) 0 new allocations in RAF (allocation-timeline
  audit); (4) network panel shows zero requests beyond the document;
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: tab blur → full pause + audio.suspend + reset trauma; focus →
  resync the timestamp with a 3-2-1 countdown resume, no dt spike (the 50 ms
  clamp already guards); loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('echo-abyss', 1, defaults,
  migrate): schema v1 = { bestDepth, runs, dailySeedCache, settings { sfx,
  music, reduceMotion, lang } }; try/catch quota guard; a reset-data button
  on the TITLE screen; migration hook wired. Never raw localStorage.
- Near-miss hitbox −20%: real collision uses 0.8x radius; the near-miss band
  is 0.8x–1.35x radius; verified with the debug hitbox overlay.
- Instant replay: ring buffer of 600 samples (10 s @ 60 Hz, SoA); death →
  hitstop 240 ms → replay of the last 2 s at 0.45x with a ghost-trail,
  STARTING ≤ 150 ms after death; tap to skip; warm restart < 150 ms.
- Soak test 5 minutes: heap delta = 0 MB; no string concat in RAF (strings
  cached); no object/array literals in the hot path; event pooling for all
  events.
- Reduce Motion toggle (shake/flash off for accessibility).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free with no dt spikes; (2) storage survives a
  corrupt payload and a quota error; (3) replay starts ≤ 150 ms after death;
  (4) the 5-minute soak leaves heap delta 0 MB; (5) live language switch
  rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/echo-abyss/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, zero dependency, total payload ≤ 5 MB. Ships README.md
   (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. Zero external assets: system font stack, art 100% procedural canvas, audio
   100% WebAudio synth.
3. 60 fps locked: 1080p HiDPI, frame p95 ≤ 16.7 ms, jank-frame (> 33 ms) rate
   < 0.5% on the reference machine; ≥ 58 fps worst-case (all pools busy +
   replay recording); frame p99 ≤ 20 ms.
4. Zero GC allocation in RAF steady state: heap delta = 0 MB after a 5-minute
   soak (DevTools allocation timeline).
5. Input→photon < 50 ms; audio unlocks at the very first gesture (including
   the iOS silent-switch path); touch-action none, scroll/zoom/double-tap-zoom
   fully blocked.
6. Tab blur → pause within ≤ 1 frame; resume without spikes (dt clamp 50 ms
   verified).
7. Warm restart < 150 ms; replay starts ≤ 150 ms after death; the −20%
   near-miss hitbox verified via the debug overlay.
8. Deterministic: same seed → same cave; 0 console errors/warnings; strict
   mode throughout.
9. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
10. Console self-test: C1/C2/C3 all PASS + 'ECHO-ABYSS READY'.
11. Definition of done: /game:qa echo-abyss against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         ECHO ABYSS
  bootTap       TAP TO START
  tut0          HOLD TO SWIM UP — TAP TO PING
  tut1          EVERY PING WAKES THE HUNTERS
  tut2          DODGE BLIND — NEAR-MISSES FEED ADRENALINE
  scoreCap      SCORE      bestCap BEST      depthCap DEPTH      comboCap COMBO
  adrenalineCap ADRENALINE      lanternCap LANTERN BURST
  nearMissCap   NEAR-MISS!
  readyCap      GET READY
  replayCap     REPLAY      replaySkip TAP TO SKIP
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  btnRetry      RETRY       btnMenu MENU
  btnReset      RESET DATA  resetDone DATA RESET
  soundOn       SOUND ON    soundOff SOUND OFF
  motionCap     REDUCE MOTION
  shareHead     ECHO ABYSS —

=== TECHNICAL BLUEPRINT ===
- Palette (per-channel lerp across 200 m transition bands between zones):
  Midnight 0–1500 m bg #071B33 → #020A14, accent #4DF3E6; Abyssal 1500–3000 m
  bg #0B1030 → #050518, accent #7A6CFF; Hadal 3000 m+ bg #17081F → #000000,
  accent #FF3D5A. Player core #E8FFFB, radial halo #4DF3E6 → transparent;
  lantern gold #FFC94D; danger #FF3D5A; text #DCEEF7. Each zone's background
  is pre-rendered once to an offscreen canvas — absolutely no gradient
  creation inside RAF.
- Physics (px, s): dt = 1/120; gravity 1450 px/s²; thrust while holding
  2600 px/s²; drag v x= exp(−3.1·dt) → terminal ≈ ±620 px/s; auto-weave
  horizontal x = cx + 90·sin(1.7t); ping wavefront r = 900·t px, lifetime
  1.9 s, alpha linear by age; Angler lunge: accel 4200 px/s² for 0.35 s,
  cooldown 1.6 s; post-ping aggro: +65% speed for 2.2 s for every predator
  within 900 px; camera smoothing exp k = 8.
- Combo system — BLIND STREAK & ADRENALINE: a near-miss (band 0.8x–1.35x
  radius AND no ping in the previous 1.5 s) → combo +1, the window refreshes
  for 4 s; multiplier = 1 + floor(combo/3), cap x8; Adrenaline +9% per
  near-miss, decay −4%/s, at 100% → LANTERN BURST: full reveal 1.4 s + stuns
  every predator for 1.2 s + causes NO aggro. Score = depth(m) x multiplier +
  nearMiss x 25 x multiplier. The dopamine loop: pinging is safe but scores
  low; blind-dodging scores high.
- Spawn Director (retention difficulty curve): intensity I = clamp(0.5 +
  depth/4000, 0.5, 2.2) x (0.9 + 0.1·sin(elapsed/60)); spawn gap = 520/I px
  by depth; Jelly 55 / Angler 35 / Leviathan 10 ratio; every 300 m a narrow
  gate wall forces a line-choke — a controlled near-miss farm with
  variable-ratio reward.
- Pooling & memory: bubbles 256, plankton 512, sparks 384, predators 24,
  pings 8, replay 600 samples; every pool is a Structure-of-Arrays
  Float32Array + free-list stack, freed by swap-remove; ZERO allocation after
  boot.
- HUD: depth, best, combo, adrenaline ring; state machine BOOT → TITLE → RUN
  → PAUSED → DEATH → REPLAY → TITLE; every transition warm < 150 ms; PAUSE
  overlay anytime (button + visibilitychange); Reduce Motion toggle.
- Perf budget: sim ≤ 3 ms + render ≤ 6 ms @1080p/DPR2 mid-tier; batched
  canvas ops, no redundant state changes between draw calls.
```
