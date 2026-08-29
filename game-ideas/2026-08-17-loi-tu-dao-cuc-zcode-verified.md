# MAGNETIC CORE: POLARITY FLIP

- **Date:** 2026-08-17 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `magnetic-core` — target folder `games/magnetic-core/`
- **Genre:** Arcade/casual one-thumb · polarity-flip orbital dodger — tap to flip polarity (sucked into the core / flung to the rim), conserved inertia bends the path into spirals, catch sparks in chains, dodge rotating radial arcs.
- **Pitch:** One finger flips your magnetic polarity: your mote of light is sucked toward the core or slung toward the rim, and conserved momentum bends every flip into a fresh spiral gamble. Combo chains climb a pentatonic ladder and millimetre-close near-misses trigger hitstop — the exact dopamine of 'one more run'.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Lõi Từ: Đảo Cực (Magnetic Core: Polarity Flip)".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Magnetic Core: Polarity Flip — an H5 commercial-grade one-thumb
arcade that meets this repo's shipping bar: games/magnetic-core/ static site
scaffolded from templates/game-starter/ via /game:new, template engines
unmodified, zero build step, zero runtime network. Exclusive gameplay hook:
'polarity-flip orbit' — tap to flip polarity, momentum conserved, the player
FEELS the spiral orbit instead of just moving. Every run 60–180 s, every
death 100% player-error (fair-death), always ending in 'one more run'. Three
axes govern every technical decision: responsiveness < 16.6 ms, readability
(threats readable within 200 ms), retention (combo + near-miss dopamine).
All UI copy in English, served from an STR i18n table with reserved 'vi'/'lo'
slots (pattern: games/gravity-juggle) so the game ships multi-language-ready.
Rewarded-ad revive hook positioned but disabled; telemetry stubs ready for a
later SDK. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'MAGNETIC-CORE READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/magnetic-core/ from templates/game-starter/ via /game:new
  magnetic-core. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: design space 1920×1080 letterbox, HiDPI canvas.width = cssSize x
  min(DPR, 2), setTransform draws in design coordinates; transform set once
  per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback —
  pointerdown only; touch-action: none; block double-tap zoom, pull-to-
  refresh, context menu, text selection; input stays valid when the finger
  drags outside the canvas. Rapid taps at 20/s must never dual-trigger.
- Arena: circle R = 470 (design px). Player particle state (r, θ, v_r, v_θ,
  s); a tap flips polarity s ∈ {+1, −1}.
- Physics (design px, dt = 1/120): radial accel a_r (positive outward) =
  −s · G · soften(r); s = +1 pulls to the core, s = −1 pushes to the rim;
  soften(r) = 0.5R / max(r, 0.5R); G = 2400, clamp |a_r| ≤ 2600; semi-
  implicit Euler; tangential damping 0.995/step; rim bounce restitution 0.82
  when r > 0.94R; v_max = 1400; spawn at r = 0.82R with v_θ = ±(380 + 40·d).
- Sparks spawn on 3 radius lanes; radial hazard = rotating arcs with gaps;
  touching an arc (outside the near-miss band) = death; HUD score/combo/best;
  restart < 300 ms.
- Difficulty curve: d(t) = min(1, t/150 s); hazard ω 0.6→2.1 rad/s; arc count
  2→5; spark lifetime 6.0→3.2 s; arc gap 110°→70°.
- Combo skeleton: spark pickups feed a multiplier ladder (full formula in
  TECHNICAL BLUEPRINT).
- All randomness through engine/rng.js createRng(seed); spawn lanes, spark
  placement, arc phases. No Math.random() in gameplay code.
- C1: (1) physics/render separation holds, step ≈ 8.33 ms ±5%;
  (2) coordinates correct at every screen scale, resize + live rotation
  included; (3) plays smoothly for 30 s straight, zero logic errors;
  (4) Performance panel records 0 GC.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 pre-allocated (structure-of-arrays, typed arrays),
  spawn/kill = swap-remove; ABSOLUTELY 0 allocation in a frame. Follow
  engine/particles.js pool semantics; NO new/closures in the hot loop.
- Juice: screen shake trauma² model — offset = 12 px · trauma² · noise,
  trauma decay 1.8/s; hitstop: timescale = 0 for 60–90 ms on death, 40 ms on
  near-miss; white flash alpha 0.25 for 80 ms; sparkle bursts on chain
  pickups; dynamic vignette deepening per combo tier; frenzy mode hue-rotates
  12°/s.
- Visual: core glow radial cyan → violet; player trail of 12 pre-stored
  points; player tinted by polarity.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture (resume if suspended), suspend on
  pause, mute state persisted; master chain masterGain → WaveShaper soft-clip
  → DynamicsCompressor → destination. Master never starts > 0.5. All
  nodes/presets/noise buffers built at init; playback only sets params.
- Synth table (peak output < −1 dBFS): collect = sine 880→1760 Hz exp-ramp
  60 ms; combo ladder = pentatonic minor [220.0, 261.6, 293.7, 329.6, 392.0]
  Hz × (1 + 0.06·comboStep); polarity flip = noise burst bandpass 900 Hz Q=4
  40 ms + sub sine 80 Hz decay 120 ms; death = saw 220→30 Hz 450 ms + lowpass
  sweep 4k→200 Hz; frenzy pad = 2 triangles detuned 110/110.7 Hz.
- C2: (1) 60 fps with full VFX, still 0 alloc/frame; (2) network panel shows
  zero requests beyond the document; (3) audio has no crackle/underrun;
  (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → pause everything (freeze the
  accumulator, audio.suspend) + tap-to-resume overlay; switching tabs mid-run
  10 times leaves state off by 0 logic frames; backgrounded 5 minutes then
  resumed = correct state.
- Saves via engine/storage.js createStorage('magnetic-core', 1, defaults,
  migrate): schema v1 = { best, runs, settings {muted, lang} }. try/catch
  tolerant to corrupt/quota-full storage (in-memory fallback, still fully
  playable); migration hook wired. Never raw localStorage.
- Near-miss fairness system: fatal hitbox = sprite shrunk 20% (forgiving rim);
  near-miss zone = sprite +15%, no death → +25 points, whoosh SFX, 40 ms
  hitstop; debug view draws all 3 hitbox rings.
- Instant replay: ring buffer of 90 snapshots @30 Hz ({t, r, θ, s,
  eventFlags}); on death a 1.2 s replay plays at 0.5×; death → first replay
  frame costs < 150 ms (measured with performance.now, logged in dev mode).
- Anti-GC: allocations only at init/resize/start-run; no fresh closures,
  map/filter/concat, string concat, or DOM style writes inside a frame;
  verified via allocation sampling + 2 heap snapshots 5 minutes apart
  differing < 5%.
- Product polish: 5 s first-run guide that self-hides; game-over shows
  replay + best + a clear 'tap to play again'; mute persists across sessions.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives
  in STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read
  via t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics across 10 tab switches;
  (2) replay starts ≤ 150 ms after death; (3) storage survives a corrupt
  payload and quota-full writes; (4) profiler shows zero RAF allocations,
  heap drift < 5% over 5 minutes; (5) live language switch rebuilds all
  labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/magnetic-core/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests (no fetch/CDN/remote fonts), procedural assets
   only, total payload ≤ 5 MB. Ships README.md (how to run, controls, tuning
   table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked on Chrome + Safari mobile mid-range; jank frames < 1% per
   10 s; dev overlay with FPS + frame-time graph (toggleable).
3. Zero GC in RAF steady state (allocations only at init/resize/start-run).
4. One-thumb fully playable: touch-action none, response ≤ 1 frame, 20
   taps/s never dual-trigger, scroll/zoom/context-menu/selection fully
   blocked.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Fairness verify: fatal hitbox exactly 20% under sprite, near-miss band
   +15%; debug view shows all 3 rings.
7. Console self-test: C1/C2/C3 all PASS + 'MAGNETIC-CORE READY'.
8. Definition of done: /game:qa magnetic-core against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         MAGNETIC CORE
  bootTap       TAP TO START
  tutFlip       TAP TO FLIP POLARITY
  scoreCap      SCORE      comboCap COMBO      bestCap BEST
  newBest       NEW BEST!
  replayCap     REPLAY
  overTap       TAP TO PLAY AGAIN
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  setSound      SOUND

=== TECHNICAL BLUEPRINT ===
- Palette: radial bg #05060E → #0B1026 → #131B3A; core glow #22D3EE →
  #A78BFA; player polarity+ cyan #34D3FF, polarity− pink #FF6B9D; spark
  #FFD166; hazard gradient #FF3B5C → #7A0B2E; UI #E8ECFF at alpha 0.9;
  frenzy mode hue-rotate 12°/s. System font stack.
- Combo system: refresh window 2.2 s; multiplier tiers ×1/×2/×3/×4/×6/×8 at
  streaks 0/4/9/16/28/45; spark = 10 × tier points; near-miss = +25 points
  and +50% progress toward the next tier; dying during frenzy keeps 50% of
  the tier into the next run (retention hook).
- HUD: score, combo, best; restart < 300 ms from death to playable.
- Telemetry stubs: run_start / run_end / death / near_miss (console.debug,
  no PII) — SDK insertion points for commercialization later; rewarded-ad
  revive hook positioned but disabled.
- State machine: BOOT → TITLE → RUN → GAMEOVER (→ RUN); PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: response < 16.6 ms, JS ≤ 8 ms/frame @DPR2 mid-tier; pool 512
  particles; batched canvas ops, no redundant state changes between draw
  calls.
```
