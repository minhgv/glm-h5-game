# NEON GRAZE RUSH

- **Date:** 2026-08-26 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `neon-graze-rush` — target folder `games/neon-graze-rush/`
- **Genre:** Arcade one-thumb graze-runner (bullet-time hell) — auto-scrolling horizontal, one-finger control, bullet-skimming (graze) dodging that charges a bullet-time meter.
- **Pitch:** You are NOT allowed to dodge far — you must skim danger to charge bullet-time: the bolder you fly, the slower time gets, the longer you live, the harder the combo pops. One touch is death, restart is under 300 ms — a perfect dopamine loop of inverted risk-reward.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "LƯỚT SÁNG — Neon Graze Rush".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build NEON GRAZE RUSH — an H5 commercial arcade graze-runner that meets
this repo's shipping bar: games/neon-graze-rush/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. CORE HOOK (immutable): the world attacks with
bullets/lasers; HOLD = bullet-time 0.25x (drains the meter), DRAG VERTICALLY =
steer the ship's Y. The meter ONLY refills via GRAZE — entering the graze ring
(1.9x hitbox) without touching the bullet's core. Empty meter = time snaps
back to 1.0x = near-certain death. Combo +1 per graze, decaying after 2.5 s
without one — the player is forced to play aggressively. Portal QA bar
(CrazyGames/Poki): no soft-lock, no audio pop, restart < 300 ms, shippable
under license immediately. 60 FPS locked @1080p HiDPI, zero-GC in RAF. All UI
copy in English, served from an STR i18n table with reserved 'vi'/'lo' slots
(pattern: games/gravity-juggle) so the game ships multi-language-ready. No
stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations; each: build → self-QA
checklist → advance only at 100% pass. On FAIL: root-cause fix and repeat that
step (max 3 cycles per step, then reduce TECHNICAL scope — never acceptance
scope). Log 'NEONGRAZERUSH READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/neon-graze-rush/ from templates/game-starter/ via /game:new
  neon-graze-rush. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: 1920x1080 target, scaled by devicePixelRatio, letterbox-safe;
  ResizeObserver + orientation-change handling.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation for every
  entity (x = prev + (curr − prev) x alpha). Entities move in update() only.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  pointerdown/move sets targetY normalized 0–1; held = bullet-time target
  0.25; released = 1.0. timeScale smoothing: ts += (target − ts) x
  (1 − e^(−12·dtReal)). Desktop fallback: mouse + Space.
  touch-action: none on canvas.
- Player vertical spring: ay = (targetY − y)·k − vy·c with k = 90 s⁻²,
  c = 14 s⁻¹ (near critical damping); world scroll 420 px/s scaled by
  difficulty.
- Collision: circle-vs-AABB and circle-vs-circle across 3 hazard types
  (helix gate, laser fence, homing dart); graze ring = hitbox x 1.9, graze
  cooldown 250 ms per object (flag on the object, no allocation).
- Object pools preallocated: obstacles 128, bullets 256, particles 1024 —
  free-list arrays, field reuse; STRICTLY no new/array-literal/string-concat
  in RAF.
- Greybox art acceptable at this stage. HUD: score, graze meter, combo.
  Death → GAMEOVER → tap restart < 300 ms.
- All randomness through engine/rng.js createRng(seed) — deterministic
  physics. No Math.random() in gameplay code.
- C1: (1) 10 minutes of play without crash; (2) physics determinism verified;
  (3) 60 fps greybox; (4) input→response ≤ 1 frame.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: complete pooling — ring buffer of 1024, spawn = overwrite the
  oldest slot; 3 types (graze spark amber #FFB300, trail cyan #00F5FF, death
  burst magenta #FF2E92); draw batched grouped by fillStyle. Follow
  engine/particles.js pool semantics.
- Juice: screen shake trauma model — amplitude = trauma² x 14 px, decay
  1.6/s, rotZ ±trauma² x 0.02 rad. Hitstop: timeScale = 0 for 90 ms (death) /
  45 ms (close-call graze streak of 10).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), graph
  [all sources] → masterGain → WaveShaper soft-clip → DynamicsCompressor →
  destination; context created lazily and resumed in the first gesture
  (iOS: play a 0.01-gain silence buffer to wake the speaker); suspend on
  pause; mute toggle persisted. Master never starts > 0.5.
- Synth: (a) bass drone = 2 saws detuned ±6 cent @ 55 Hz, lowpass cutoff =
  200 + 2200 x (1 − ts) Hz — the music "sags" with bullet-time; (b) graze zap
  = square 880 → 1760 Hz exp-ramp 60 ms through highpass 600 Hz; (c) combo
  ladder = pentatonic f = 440 x 2^((n mod 16)·[0,2,4,7,9]/12) rising with
  combo; (d) death = white-noise buffer 300 ms, lowpass sweep 8k → 120 Hz;
  (e) UI tick = sine 1200 Hz 25 ms at −12 dB.
- Palette & visuals: bg vertical gradient #05060F → #0B1026 → #1B0B2E;
  3-layer parallax starfield at different speeds; neon primary #00F5FF,
  danger #FF2E92, graze #FFB300, core white #FFFFFF; hue-shift 4° per phase
  (globalCompositeOperation lighter for cheap additive glow). Graze streak
  ≥ 5: screen rim pulses amber, ship drags a ghost trail (5 frames back,
  fading alpha).
- C2: (1) no click/pop (5 ms ramps on every gain); (2) shake stays below
  nausea threshold (≤ 14 px); (3) spawning 50 obstacles + 400 particles keeps
  frame time ≤ 8 ms; (4) zero network requests beyond the document;
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.hidden → PAUSED + audio.suspend; on visible → no
  instant auto-resume, show a RESUME button (protects against unfair deaths);
  loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('neon-graze-rush', 1, defaults,
  migrate): schema v1 = { bestScore, totalRuns, lifetimeGraze, mute, bestCombo,
  lang }; an XOR checksum (game layer) guards against tampering.
  try/catch tolerant to corrupt/cleared storage. Never raw localStorage.
  GAMEOVER shows the delta vs the record + a NEW RECORD flash.
- Near-miss fair-feel: the LETHAL hitbox used for death checks = 80% of the
  displayed hitbox (−20%); the graze ring is computed on the full hitbox.
  Internal telemetry: deaths/minute, avg graze/run (in-memory, console-logged
  behind a debug flag).
- Instant replay: ring buffer 6 s x 64 Hz of compact snapshots (only
  position/type/state of player + obstacles + representative particles, flat
  preallocated Float32Array). Death → hitstop 90 ms → replay at 0.4x with
  black letterbox bars + REPLAY tag; input-to-replay < 150 ms total.
- FPS governor: if mean frame time > 12 ms over 60 consecutive frames → drop
  particle budget 50%, then DPR to 1.5, then starfield to 2 layers (never
  below the 60 fps target).
- Pattern Director: engine/rng.js createRng(seed), 4 patterns (rotating helix
  gate, laser fence with shifting gap, homing dart 3-volley, pendulum blade);
  difficulty(t) = 1 − e^(−t/90); spawn interval lerp(1.6 s → 0.45 s).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) tab hide/resume correct, no background audio zombie; (2) storage
  survives a corrupt payload; (3) replay frame-perfect against the buffer;
  (4) restart < 300 ms; (5) live language switch rebuilds all labels, en
  table complete.

=== ACCEPTANCE CRITERIA (FINAL — any FAIL = do not ship) ===
1. Repo-standard layout: games/neon-graze-rush/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests, zero external assets, system fonts, canvas-born
   art, pure WebAudio synthesis, total payload ≤ 5 MB. Ships README.md (how to
   run, controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 FPS locked @1080p HiDPI: frame budget ≤ 8 ms on a mid-range phone;
   stress test with 50 obstacles + 400 particles + replay running in parallel:
   no frame > 20 ms.
3. Zero-GC in RAF: no new/object-literal/array-literal/string-concat/closures
   created in update+render; Chrome DevTools allocation instrumentation: 0
   allocation samples across 10 s of continuous gameplay; heap flat ±2 MB
   after 30 minutes.
4. Latency: touch felt < 50 ms; restart-to-play < 300 ms; death-to-replay
   < 150 ms; audio unlocked in exactly the first gesture.
5. Compatibility: iOS Safari 15+, Android Chrome 100+, desktop Chrome/Firefox
   (mouse + Space); pause/resume correct when the tab hides.
6. 30-minute QA: no soft-lock, no stuck state, replay frame-perfect against
   the buffer, record survives reload.
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'NEONGRAZERUSH READY'.
9. Definition of done: /game:qa neon-graze-rush against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      NEON GRAZE RUSH / SKIM OR DIE
  bootTap       TAP TO LAUNCH
  tut0          HOLD FOR BULLET-TIME — DRAG TO FLY
  tut1          ONLY GRAZES REFILL YOUR TIME
  tut2          METER EMPTY — TIME SNAPS BACK
  scoreCap      SCORE      bestCap BEST      comboCap COMBO
  meterCap      TIME
  grazeCap      GRAZE!
  replayCap     REPLAY
  pausedCap     PAUSED      resumeBtn RESUME
  deathCap      CLIPPED
  newRecordCap  NEW RECORD!
  btnRetry      RETRY       btnMenu MENU
  setCap        SETTINGS    setMute SOUND

=== TECHNICAL BLUEPRINT ===
- Palette: bg vertical #05060F → #0B1026 → #1B0B2E; neon primary #00F5FF;
  danger #FF2E92; graze amber #FFB300; particle trail cyan #00F5FF; death
  burst magenta #FF2E92; core white #FFFFFF; hue-shift 4° per phase.
- Physics: vertical spring k = 90 s⁻², c = 14 s⁻¹; world scroll 420 px/s;
  timeScale smoothing ts += (target − ts) x (1 − e^(−12·dtReal)); bullet-time
  0.25x while held.
- Graze model: graze ring = full hitbox x 1.9; lethal hitbox = 80% of
  displayed; cooldown 250 ms per object; combo +1/graze, decay 2.5 s; meter
  drains while bullet-time is held, refills only on graze.
- Pattern director: difficulty(t) = 1 − e^(−t/90); spawn interval 1.6 s →
  0.45 s; patterns: helix gate (rotating), laser fence (shifting gap), homing
  darts (3-volley), pendulum blade.
- Pools: obstacles 128, bullets 256, particles 1024; replay ring 6 s x 64 Hz
  flat Float32Array.
- Style guide: typography = system-ui bold, wide tracking, for score numbers;
  motion = everything ease-out exponential, no linear jerk; juice rule — EVERY
  player action gets audio + visual feedback within 1 frame (16 ms).
- Module layout: template scaffold only — game code in src/, engine/ modules
  unmodified.
- State machine: BOOT → MENU → PLAY → REPLAY → GAMEOVER; update/draw cleanly
  separated per state; PAUSE overlay anytime (button + visibilitychange).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier.
```
