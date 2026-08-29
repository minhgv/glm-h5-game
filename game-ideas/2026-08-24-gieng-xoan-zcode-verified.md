# SPIRAL WELL

- **Date:** 2026-08-24 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `spiral-well` — target folder `games/spiral-well/`
- **Genre:** Arcade one-thumb / orbital-physics slicer — manage angular momentum around a free-falling anchor to slice nodes and shave near-misses inside a bottomless well.
- **Pitch:** You are a blade of light chained to a falling anchor inside a bottomless well: hold your finger to coil tight around the axis — spinning faster and faster, like a figure skater pulling in her arms — then release to fling into a wide spiral. Slice nodes at critical speed, shave the walls with breathtaking near-misses, and never let your angular momentum fall to zero.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Giếng Xoán (Spiral Well)".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build SPIRAL WELL — a one-thumb H5 arcade at the commercial quality of
a professional arcade studio (CrazyGames/Poki-ready) that meets this repo's
shipping bar: games/spiral-well/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Session loop 3–5 minutes, high-score chase + combo
tiers driving D1 retention, an ad-insertion hook (death point → Revive/Restart
gate). Amateur-vs-studio line: fixed-step physics, particle pooling,
procedural 0-asset WebAudio, tab-safe, GC-free render loop. No prototype, no
placeholder, no TODO. All UI copy in English, served from an STR i18n table
with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the game
ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: The agent loops through exactly 3 stages itself;
each stage must pass its Definition of Done (C1.x, C2.x, C3.x) before the
next; on FAIL → fix and repeat that same stage (max 3 fix rounds per stage).
Log 'SPIRAL-WELL READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/spiral-well/ from templates/game-starter/ via /game:new
  spiral-well. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 logical HiDPI, scaled by devicePixelRatio (cap 2.5),
  ctx.setTransform once, resize handler never recreates objects.
- Sim: engine/loop.js fixed timestep — accumulator, fixed dt = 1/120 s,
  maxSubSteps 4 (frame clamp 0.25 s, surplus discarded, spiral-of-death
  guarded), render(alpha) interpolation for player/anchor/particles; a global
  timeScale variable serves hitstop/slow-mo. Entities move in update() only;
  render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback.
  pointerdown = COIL (r decreases), pointerup = RELEASE (r increases); Space
  fallback; accepts touch and mouse; preventDefault blocks scroll-zoom;
  input→response ≤ 1 frame. touch-action: none on canvas.
- Core physics: the player lives in polar coordinates (r, θ) around the
  anchor. HOLD: r −= 520·dt (px/s), clamp [r_min = 48, r_max =
  0.42·min(W,H)]. RELEASE: r += 300·dt. ANGULAR MOMENTUM CONSERVATION: when r
  changes, ω_new = ω_old·(r_old/r_new)² — the 'skater-spin' that makes it
  addictive; clamp ω ∈ [0.5, 18] rad/s; v_tangential = ω·r. The anchor falls
  straight: v_well = 140 px/s initially, +6 px/s per 10 s of depth, cap 420.
- Entities: red node #FF4D6D (death on touch when v_t < v_cut = 520 px/s —
  slice it if ≥), purple node #B388FF (bonus points), lime node #B9FF66
  (charges one 'Overdrive': x2 slice speed for 4 s), walls on both sides of
  the well curving in a gentle sine (wall(y, t)). Circle-vs-circle and
  circle-vs-wall collision.
- All randomness through engine/rng.js createRng(seed) — a seedable mulberry32
  pattern generator reserved for a future daily challenge. No Math.random()
  in gameplay code.
- State machine: BOOT → READY (tap to unlockAudio + start) → PLAY → PAUSE →
  GAMEOVER; HUD: depth (m), score, combo, best.
- C1: (1) playable at 60 fps; (2) death/slice/restart all work; (3) skater-spin
  momentum math matches the formula; (4) collisions resolve correctly against
  nodes and walls.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 plain-object particles pre-allocated, free-list index swap —
  NO object creation in RAF; the player trail is a 24-point ring buffer drawn
  as a 2-stop gradient #7DF9FF → transparent with decreasing lineWidth. Follow
  engine/particles.js pool semantics.
- Juice: trauma shake — trauma ∈ [0,1], offset = trauma² x 14 px x noise,
  decay 1.8/s. Hitstop: timeScale = 0 for 45 ms (a normal slice) / 90 ms
  (tier-up) — NO setTimeout in the RAF path (juice timers on a separate clock
  so interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), the
  AudioContext is created on the FIRST pointerdown (unlockAudio pattern for
  iOS), suspend on pause, mute state persisted; master chain masterGain →
  WaveShaper soft-clip → DynamicsCompressor → destination. Master never starts
  > 0.5.
- SFX table: (a) SLICE = sawtooth sweep 180 → 720 Hz over 70 ms + highpass Q4
  + a 30 ms noise burst; (b) COMBO NOTE = pentatonic scale f = 261.63·2^(n/12)
  with n ∈ {0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24}, +1 degree per combo,
  tier-up resets +1 octave; (c) WALL NEAR-MISS = filtered noise (bandpass
  2.5 kHz, Q8) 120 ms; (d) DEATH = sine drop 400 → 40 Hz over 500 ms +
  lowpassed noise; (e) TIER-UP = 2 oscs detuned +7 cent simultaneously. All
  audio nodes self-dispose via onended once stopped/scheduled.
- Visual juice: fake bloom via shadowBlur ONLY on the player + anchor (cheap);
  chromatic flash 60 ms on tier-up (2 layers offset ±3 px mixing
  cyan/magenta); a node shatter = 12–20 directional particles by v_t; a static
  vignette radial gradient drawn once to an offscreen canvas.
- C2: (1) every effect has a clearly defined trigger; (2) audio runs on iOS
  Safari after unlock, absolute silence before the first gesture;
  (3) network panel shows zero requests beyond the document;
  (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: visibilitychange → hidden: full pause + audio.suspend; visible:
  resume waits for a user tap (3-2-1 countdown overlay); pagehide also saves
  state; loop.js stall clamp guards time jumps so physics never 'teleports'.
- Saves via engine/storage.js createStorage('spiral-well', 1, defaults,
  migrate) (replaces the original schema key 'gieng-xoan-v1'): schema v1 =
  { best, totalRuns, settings { sfx, haptics, lang } }; try/catch every access
  (private-mode safe); migration hook wired. Never raw localStorage.
  navigator.vibrate(15) on slice when haptics are on.
- Near-miss hitbox −20%: when the player overlaps a wall/ceiling node with a
  20%-shrunk hitbox margin but no real collision → trigger: slow-mo timeScale
  0.65 for 120 ms + score 40·mult + a light shake + a 'whoosh' — the
  ultra-tight shave feel.
- Instant replay < 150 ms: ring buffer of 10 snapshots (every 16 ms, ~16 data
  lines: r, θ, anchorY, entities-dirty-flag) → on death: replay at 1.2x with a
  grayscale filter + letterbox; total delay from the death input → replay
  shown < 150 ms (measured with performance.now()).
- Difficulty curve, sigmoid by depth: spawn rate = 1.8 + 1.1·(1 −
  e^(−depth/800)); the pattern generator runs on the seedable PRNG.
- Anti-GC: all vectors/particles/temp objects pre-allocated at BOOT; no
  closures or array methods creating new arrays (map/filter/concat/spread) in
  the update loop; verify via Chrome allocation profiler: 10 s of gameplay =
  zero steady-state heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (numbers drawn on canvas, no remote
  fonts).
- C3: (1) 10 minutes in a hidden tab → return without crash, no zombie audio,
  no physics teleport; (2) replay runs and starts < 150 ms after death;
  (3) close-reopen keeps the best score and storage survives a corrupt
  payload; (4) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/spiral-well/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, zero CDN, zero external assets (system font stack +
   canvas-drawn numbers), total payload ≤ 5 MB. Ships README.md (how to run,
   controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked: RAF delta histogram ≥ 55 fps on an average machine; CPU
   frame budget ≤ 8 ms/frame measured by performance.now() inside the game
   (F1 debug overlay); frame p99 ≤ 20 ms.
3. Zero GC allocation in RAF steady state: verified by running 10,000 frames
   with --js-flags='--expose-gc' + gc() heuristics — heap stays within the
   clamped level.
4. HiDPI 1080p sharp on DPR 1–3; no moiré, no blurry text.
5. Perfect one-thumb: every main action = a one-finger hold/release; hit
   targets ≥ 44 px; no multi-touch needed; touch-action none, scroll/zoom/
   double-tap-zoom fully blocked.
6. Tab-safe: hidden tab 10 minutes → return without crash, no zombie audio,
   physics doesn't 'teleport' (accumulator clamp).
7. Audio unlock proper on iOS Safari; absolute silence before the first
   gesture.
8. Zero console errors across every flow: boot → 3 minutes of play → death →
   replay → restart x5.
9. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
10. Console self-test: C1/C2/C3 all PASS + 'SPIRAL-WELL READY'.
11. Definition of done: /game:qa spiral-well against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         SPIRAL WELL
  bootTap       TAP TO START
  tut0          HOLD TO COIL — RELEASE TO FLING
  tut1          SLICE NODES AT SPEED — A SLOW TOUCH KILLS
  tut2          SHAVE THE WALLS — NEAR-MISSES SCORE
  scoreCap      SCORE      bestCap BEST      depthCap DEPTH      comboCap COMBO
  overdriveCap  OVERDRIVE
  nearMissCap   NEAR-MISS!
  reviveCap     REVIVE     reviveAd WATCH AD      btnRestart RESTART
  readyCap      GET READY
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  soundOn       SOUND ON    soundOff SOUND OFF
  hapticsCap    HAPTICS
  shareHead     SPIRAL WELL —

=== TECHNICAL BLUEPRINT ===
- Palette: well bg vertical gradient #05060E → #0B1026, dust parallax #1E2749
  alpha 0.35; player blade #7DF9FF → #00E5FF; anchor #FFD166 core +
  #FFE8A3 halo; danger #FF4D6D, bonus #B388FF, energy #B9FF66; walls #16203D
  fill + neon border #4E6EFF 2 px + glow; combo tiers 1–4 recolor the score
  white → gold #FFD166 → orange #FF8C42 → hot-white #FFFFFF with a pulse.
- Physics formulas (px, s): ω' = ω·(r/r')²; v_t = ω·r; SLICE condition:
  v_t ≥ 520; death on touching a red node with v_t < 520 or a real wall touch
  (full hitbox); v_well(depth) = min(140 + 0.6·depth_s, 420) with depth_s =
  seconds played; r_min = 48, r_max = 0.42·min(W,H); bounce recoil: ω x= −0.35.
- Combo system: slice node +1 combo, near-miss +1 combo; combo decays — 2.5 s
  without an event → reset; multiplier = 1 + floor(combo/8), cap x8; TIER-UP
  every 16 combo: hitstop 90 ms + flash + pitch ladder reset +1 octave; score:
  node 100·mult, near-miss 40·mult, depth milestone every 500 m +250; death
  loses the whole combo — pure arcade risk/reward.
- Audio synth detail: default sampleRate; envelope attack 5 ms with a decay
  slope; pentatonic base C4 261.63 Hz; noise = a 1 s white-noise AudioBuffer
  generated at boot (not an external asset); a limiter prevents clipping when
  ≥ 6 SFX stack up.
- Render order: vignette offscreen → dust → walls → nodes → trail → player →
  anchor → particles → HUD → flash overlay.
- Self-verification protocol: after each iteration, instrument the code
  (debug overlay, frame timer, alloc counter) to check the DoD + Acceptance
  and only ship FINAL when all-pass; if a browser is unavailable, statically
  review each item and note the confirmation per line in the internal report.
- HUD: depth (m), score, combo, best; state machine BOOT → READY → PLAY →
  PAUSE → GAMEOVER; PAUSE overlay anytime (button + visibilitychange); the
  death point opens the Revive/Restart gate (ad hook).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier (CPU frame
  budget ≤ 8 ms total); batched canvas ops, no redundant state changes between
  draw calls.
```
