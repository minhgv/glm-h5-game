# WAVEFORGE

- **Date:** 2026-08-23 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `waveforge` — target folder `games/waveforge/`
- **Genre:** Arcade surf-sculpting one-thumb — an endless physics-surfer controlled INDIRECTLY (the player doesn't steer the ship; the player sculpts the ocean).
- **Pitch:** One finger drags up/down to bend the plasma sea into waves; the ship rides the terrain you just sculpted — skim the surface to bank Heat, fling yourself through golden rings to chime the combo, but touch the sea and you burn. Play feel: pilot and tide-god at once, surfing a synth line emitted by your own wave path.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "RÈN SÓNG: WAVEFORGE".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build WAVEFORGE — an H5 one-thumb arcade that meets this repo's
shipping bar: games/waveforge/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Commercial-grade, with a mechanic nobody else has:
SURF-SCULPTING (indirect control by sculpting dynamic terrain). 60 FPS locked
@1080p HiDPI, zero allocation in requestAnimationFrame, cold start to gameplay
≤ 1.5 s. Monetization-ready: an interstitial adapter stub after run 3 (empty
interface, no network calls), an analytics hook that is a no-op log. Scoring
by PURE SKILL: no gacha, no pay-to-win. All UI copy in English, served from an
STR i18n table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle)
so the game ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, audit against its DoD and run the self-test (C1.x, C2.x, C3.x); on
FAIL → fix and repeat that iteration (max 3 times) before advancing. Never
skip a DoD, never defer to 'later'. Log 'WAVEFORGE READY' only when FINAL
ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/waveforge/ from templates/game-starter/ via /game:new
  waveforge. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1920x1080 logical, scaled by devicePixelRatio (cap 2.0), safe
  letterbox.
- Sim: engine/loop.js fixed timestep — accumulator at 120 Hz (dt = 1/120 s,
  maxSubSteps 4, frame clamp ≤ 0.25 s, surplus discarded, spiral-of-death
  guarded), render(alpha) interpolation. Entities move in update() only;
  render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb
  operator: pointerdown/move anywhere on screen; dy from the anchor point → a
  SCULPT command (no aiming needed, only direction + amplitude) with an 8 px
  dead-zone; mouse + touch + keyboard arrows (up/down) fallback; input→response
  ≤ 1 frame. touch-action: none on canvas.
- Wave engine: the ocean is an additive sine field of 5 harmonics with a
  spring-damper toward the target envelope (Blueprint A).
- Ship rides on ground-effect hover (Blueprint B); gold rings spawn per the
  Spawn Director (Blueprint E); death when the core touches plasma; restart
  ≤ 300 ms. HUD: score, combo tier, heat bar.
- All randomness through engine/rng.js createRng(seed): a map seed from
  performance.now plus a separate cosmetic seed (gameplay/cosmetic
  determinism split). No Math.random() in gameplay code.
- C1: (1) stable 60 FPS over a 60 s profile, no frame > 17 ms logic+render;
  (2) determinism: simulated frame jitter 8/20/40 ms alternating for 10 s →
  ship position drift < 0.5 px vs even pacing; (3) input latency ≤ 1 frame —
  the sculpt reflects instantly on harmonics near the ship; (4) F3 debug
  overlay: FPS, ms/frame, particle count; (5) 3 minutes of continuous play
  with no softlock; rings always reachable (internal solver checks 500
  consecutive spawns).

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: struct-of-arrays pool of 2048 (x, y, vx, vy, life, size, type) —
  spray when shaving waves, confetti burst on ring pickup, sparks on death.
  Follow engine/particles.js pool semantics.
- Juice: trauma shake (shake = trauma², decay 1.6/s, max offset 26 px,
  rotational noise ±1.2°); hitstop: 45 ms freeze when punching through a ring
  (timeline scale = 0, still renders) and 120 ms on death before the
  explosion (juice timers on a separate clock so interpolation survives).
- Glow: sprites pre-rendered offscreen 64x64, drawn with
  globalCompositeOperation 'lighter' — NO shadowBlur/filter in the hot path.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture (resume + a silence buffer), suspend
  on pause, mute state persisted; chain preGain → DynamicsCompressor
  (threshold −12 dB, ratio 6) → destination. Master never starts > 0.5.
  Blueprint D, all nodes created at init, only parameters (frequency/gain)
  change at runtime — zero-alloc audio: sea-drone = 2 continuous FM voices,
  carrier 55 + 2.3·combo Hz, mod ratio 2.007, modIndex 40 + 0.9·heat, LP
  cutoff 300 + 0.4·speed; ring pluck = pentatonic [0, 3, 5, 7, 10] semitones
  from base A2 110 Hz, note = combo mod 5 + an octave every 5 combo, sine
  attack 4 ms, exp decay τ = 0.35 s, + 5th harmonic gain 0.2; heat hiss =
  2 s pre-allocated white-noise loop → bandpass 900 + 18·heat Hz, Q 0.8,
  gain 0.0012·heat; death = sub 120 → 30 Hz sweep 0.5 s + noise burst.
- Ship trail: ribbon of 24 points, fading additive.
- Combo tiers recolor the sea: RIPPLE (#7DF9FF) → SURGE (#FFD166) → STORM
  (#FF8C42) → TSUNAMI (#FF2E88).
- C2: (1) stress test at 2048 particles + 3 simultaneous shake sources →
  still 60 FPS; (2) hitstop causes no physics drift (the accumulator
  compensates exactly, verified with the C1 jitter test); (3) audio: no
  click/pop between notes (attack ≥ 4 ms), unlock works on Chrome Android +
  Safari iOS; (4) listening test: combo 1 → 20 must sound like a rising
  musical phrase, not a flat beep sequence; (5) network panel shows zero
  requests beyond the document; (6) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.hidden → suspend audio + pause the accumulator; resume
  with a 3-2-1 countdown, a 400 ms input-grace and a dimmed overlay; no
  Date.now() in physics — only performance.now feeds the accumulator; loop.js
  stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('waveforge', 1, defaults, migrate):
  schema v1 = { best, totalRuns, tutDone, settings { mute, lang } }; try/catch
  against quota errors, safe migration hook. Never raw localStorage.
- Near-miss hitbox −20%: fatal hitbox = core radius x 0.8; the HEAT zone is
  56 px around plasma/mines and banks heat (Blueprint C).
- Instant replay: ring buffer Float32Array of 150 frames x (x, y, θ, h_local,
  heat); on death, ghost playback at 0.9x speed with a vignette starting
  < 150 ms after impact, then the death screen.
- Tutorial: 3-step wordless (ghost hand + arrows), first time only, flagged in
  storage.
- Pause + mute buttons with hit areas ≥ 48 px.
- Pool & GC protocol: particle SoA 2048 {Float32 x, y, vx, vy, life; Uint8
  type, size}; replay ring 150 x 5 Float32; trail 24 points; 2 x
  Float32Array(241) wave columns. In update/render: no object/array literals,
  no arrow functions, no template strings, no ctx.save; HUD DOM updates only
  when an integer value changes (dirty flag); every glow gradient pre-rendered
  offscreen at init. Verify via Chrome allocation profiler: 10 s of gameplay =
  zero steady-state heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) a 60 s Chrome performance record → zero Long Tasks in RAF; the
  allocation profiler shows 0 bytes allocated in RAF after 5 s warm-up;
  (2) heap snapshot before/after 5 minutes: delta ≈ 0; (3) 20 consecutive tab
  switches: no dt accumulation, no audio zombies; (4) replay smooth and
  < 150 ms; (5) storage survives a corrupt payload; (6) live language switch
  rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/waveforge/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests (DevTools Network = 0 after load), no CDN/fonts/images,
   procedural assets only, total payload ≤ 5 MB (the original's ≤ 128 KB
   code-size ambition stands within that budget). Ships README.md (how to
   run, controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 FPS locked @1080p HiDPI on a 2019 mid-range Android: frame budget
   ≤ 12 ms; ≥ 58 fps worst-case (2048 particles + TSUNAMI tier + replay
   recording); frame p99 ≤ 20 ms.
3. Zero GC in RAF steady state: no object/array/string literals, no closures,
   no ctx.save/restore in the loop — manual setTransform, gradients cached per
   resize (allocations allowed only at boot/state change).
4. Fixed-step 120 Hz deterministic + render interpolation.
5. Every magic number lives in one CONFIG object.
6. Death → back in play ≤ 300 ms; every input responds ≤ 1 frame; touch-action
   none, scroll/zoom/double-tap-zoom fully blocked.
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'WAVEFORGE READY'.
9. Definition of done: /game:qa waveforge against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         WAVEFORGE
  bootTap       TAP TO START
  tut0          DRAG UP / DOWN — SCULPT THE SEA (accessibility caption for
                the wordless 3-step tutorial)
  scoreCap      SCORE      comboCap COMBO      heatCap HEAT
  tiers         RIPPLE / SURGE / STORM / TSUNAMI
  quenchCap     QUENCH!
  grazeCap      GRAZE!
  readyCap      GET READY
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  soundOn       SOUND ON    soundOff SOUND OFF
  btnRetry      RETRY       btnMenu MENU
  shareHead     WAVEFORGE —

=== TECHNICAL BLUEPRINT ===
- [A. WAVE ENGINE] Surface h(x,t) = Σ(i=0..4) A_i(t)·sin(k_i·x + φ_i(t));
  k = [0.006, 0.011, 0.019, 0.031, 0.052] rad/px; φ_i' = ω_i fixed. Sculpt:
  the finger creates a target envelope T(x) = B·exp(−((x − x_ship)/σ)²),
  σ = 190 px, B = clamp(−dy · 3.4, −520, +520) px (drag UP → sea DOWN —
  inverted like an airplane stick — tested easiest to learn). Each A_i is a
  critically-damped pendulum: A_i'' = ω_n²(T·w_i − A_i) − 2ζω_n·A_i',
  ω_n = 9 rad/s, ζ = 1.0, weights w = [0.42, 0.27, 0.17, 0.09, 0.05]. Sample
  241 columns into a Float32Array (h and slope h'); collision = nearest-column
  lookup + lerp.
- [B. SHIP PHYSICS] Semi-implicit Euler at 120 Hz. Gravity 2400 px/s².
  Ground-effect hover: lift = 2900·exp(−d/42) px/s² upward while the ship is
  at distance d above the wave surface (d ≤ 160 px) → hugging the wave =
  hover + speedup, the core risk/reward. Horizontal speed: 640 + 12·combo px/s,
  clamp 1900. Pitch θ lerps toward atan(slope) with coefficient 10/s. Plasma
  collision: core r = 15 px, fatal hitbox = 12 px (−20%).
- [C. COMBO & HEAT] Heat rises (1 − d/56)·240°/s while d < 56 px from plasma
  or a mine; decays 60°/s. A ring pickup banks heat → score = 100 ·
  (1 + heat/25) · multiplier; multiplier +1 per consecutive ring, resets when
  a ring is missed by > 4 s. Overheat 100% + no ring for 4 s → QUENCH
  shockwave: lose the multiplier, keep the score, heavy screen shake — a soft
  penalty, not death (keeps the addictive rhythm: near-miss is always worth
  trying). Tiers change visuals + music BPM: RIPPLE <5, SURGE <12, STORM <25,
  TSUNAMI ≥25.
- [D. AUDIO SYNTH (0 assets)] AudioContext at 48 kHz → preGain →
  DynamicsCompressor (threshold −12 dB, ratio 6) → destination; sound design
  as specified in Iteration 2 (sea-drone / ring pluck / heat hiss / death
  sub-drop); all nodes created at init, only params mutate at runtime.
- [E. SPAWN DIRECTOR] Lookahead 1400 px; ring spacing ~ N(560, 90)·(1 +
  0.01·combo); ring y = h_forecast(x) + offset ∈ [−180, +320] px, forecast
  computed by freezing A_i and advancing φ by ω·Δt (cheap, deterministic);
  mines (hovering at h(x)+140, bobbing on sin) appear after 30 s, density
  grows on a background exponential 1.0004^frames, cap 6 on screen.
- [F. PALETTE] Vertical gradient bg #070714 → #101033, aurora band
  rgba(64,224,208,0.05). Plasma sea: #2B0F54 → #7A1FA2 → #FF2E88 by depth,
  wave-crest rim #FFE5F2. Ship #7DF9FF, cockpit #FFFFFF, cyan additive trail.
  Rings: #FFD166 outer / #FFF8E1 inner, collected → #FF6B9D. Mines #B8C4CE,
  blink #FF4757 at 1 Hz. HUD ui-monospace, score #EAF6FF, heat bar gradient
  #7DF9FF → #FF2E88.
- HUD: score, combo tier, heat bar; state machine: boot → menu → tutorial
  (if !tutDone) → run → replay → dead → run; PAUSE overlay anytime (button +
  visibilitychange). Seeds via engine/rng.js: map seed from performance.now,
  separate cosmetic seed (deterministic gameplay / cosmetic split).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier (12 ms total
  frame budget); batched canvas ops, manual setTransform, no redundant state
  changes between draw calls.
```
