# Neon Wave Rider

- **Date:** 2026-08-20 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `neon-wave-rider` — target folder `games/neon-wave-rider/`
- **Genre:** Hyper-casual arcade skill-ribbon — indirect one-thumb control through an underdamped spring: your finger drags an anchor, the ship whips like a kite on a verlet ribbon, weaving through procedural neon gates; grazes feed a pentatonic combo ladder and Surge time-dilation.
- **Pitch:** Your finger does NOT control the ship — it controls an anchor point the ship lunges toward, snaps back from, and whips through neon gate slots like a kite in a storm. The closer you shave the hazard edge, the better it feels: the music's pitch climbs with your combo, time dilates when Surge erupts, and the moment you die is replayed instantly like a sports broadcast — a challenge-addiction loop unlike anything else on H5.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Lượn Sóng Neon".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Neon Wave Rider — an H5 hyper-casual arcade game that meets this
repo's shipping bar: games/neon-wave-rider/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: indirect one-thumb spring-steering —
drag the anchor, whip the ribbon-ship through procedural neon gates, graze for
combo. All UI copy in English, served from an STR i18n table with reserved
'vi'/'lo' slots (pattern: games/gravity-juggle) so the game ships
multi-language-ready. Commercial bar: premium hyper-casual — (1) one-thumb
gameplay with 30-second-to-5-minute skill depth per run, easy to learn, hard to
master; (2) studio-grade juice: particles, screen shake, hitstop, procedural
synth audio, instant replay; (3) production engineering: fixed-step
deterministic physics, zero-allocation frame loop, auto-pause on tab hide,
persistence; (4) commercial hooks pre-wired: no-op stub adBreak(type) for
interstitial/rewarded (called before RESULT) and no-op track(event, data) for
analytics — comment-marked for later SDK insertion, zero network, no PII,
GDPR-safe. No stubs beyond those no-op hooks, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. Each ends in a
VERIFICATION GATE; on any FAIL, fix and re-run the gate (max 3 remediation
cycles per iteration) before advancing. Never merge iterations, never skip a
gate. Log 'NEON-WAVE-RIDER READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/neon-wave-rider/ from templates/game-starter/ via /game:new
  neon-wave-rider. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: 1920x1080 logical, fit letterbox at every screen ratio, DPR =
  min(devicePixelRatio, 2) for HiDPI; 2D context with { alpha: false,
  desynchronized: true }.
- Sim: engine/loop.js fixed timestep — stepHz 120 (dt = 1/120 s), maxSubSteps 4
  (surplus discarded, 250 ms frame clamp guards spiral-of-death), render
  interpolation with alpha = acc/dt; absolute separation of update() (logic,
  120 Hz) and render() (drawing, per RAF). Entities move in update() only.
- Input: engine/input.js unified pointerdown/move/up (mouse + touch) +
  keyboard fallback; anchor = finger position minus 90 px along Y so the
  finger never covers the ship; 8 px dead-zone. touch-action: none on canvas.
- Ship physics — underdamped spring chase: a = −k·(p − anchor) − c·v with
  k = 140 s⁻², c = 14 s⁻¹ (ζ = c/(2·√k) ≈ 0.59 — underdamped, kite-whip
  feel), speed clamp 2400 px/s; screen-edge compression with restitution 0.35.
  Semi-implicit Euler: v += a·dt then p += v·dt.
- Ribbon body: verlet chain of 14 nodes: p_new = 2p − p_prev + a·dt²; 3
  relaxation passes of the 14 px length constraints; drawn as a gradient
  line-strip colored by combo.
- Seeded procedural gate spawner (seed = floor(runStartTime·1000), stored for
  replay) — via engine/rng.js createRng(seed): scroll speed 420 px/s, +9 px/s
  every 10 s, cap 980; gate gap 320 px narrowing to 190 px at t = 180 s by
  smoothstep; spike hazard density 12% → 38%.
- State machine: BOOT → MENU → RUN → DEATH → REPLAY → RESULT; restart ≤ 100 ms.
- C1 (GATE 1): bot auto-runs 5 minutes: holds 60 FPS, ship always valid
  on-screen, circle-vs-AABB collision exact, console clean of errors.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 pre-allocated as struct-of-arrays (Float32Array x, y, vx, vy,
  life, maxLife, size, hue); zero-allocation emit; glow sprite pre-baked ONCE
  at boot to an offscreen canvas then drawImage; batched with
  globalCompositeOperation 'lighter'. Follow engine/particles.js pool
  semantics.
- Juice: trauma-model screen shake — offset = trauma² x 18 px, decay 1.6/s,
  using a pre-computed sine table (no Math.random in render); gate pass +0.15,
  graze +0.25, death +1.0; plus micro-rotation ±0.6°. Hitstop: death = 90 ms
  freeze (shake excluded); ultra-close graze (< 6 px) = 45 ms micro-freeze
  (juice timers run on a separate clock so interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture (ctx.resume at first pointerdown),
  suspend on pause, mute state persisted; master chain masterGain →
  DynamicsCompressor → destination; master never starts > 0.5. Synth table:
  (a) gate pass = sawtooth through a lowpass sweep 300 → 3200 Hz over 60 ms,
  envelope A 3 ms / D 120 ms; (b) graze = sine blip, pitch from the A-minor
  pentatonic ladder [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25,
  587.33] at scale[min(combo, 7)] — the higher the combo, the higher the
  music climbs; (c) death = 0.4 s noise buffer through bandpass sweep
  180 → 60 Hz + sine sub 55 Hz thump gain 0.9; (d) Surge = 2 detuned oscs
  rising + 0.8 s noise riser; (e) UI tick = square 880 Hz / 20 ms. All
  envelopes via setTargetAtTime/linearRamp (NO setTimeout); nodes reused from
  a pool; noise buffer created once; hard cap 32 simultaneous nodes — beyond
  that, drop the lowest-priority event.
- Score popup pool + DIGIT ATLAS: pre-render digits 0–9 to an offscreen
  canvas, draw scores with drawImage — no string-concat in RAF.
- Background: 3 pooled wrap-around parallax star layers + nebula gradient
  cached once (no CanvasGradient creation inside the frame loop).
- C2 (GATE 2): stress test 200 particles + shake + continuous grazing: frame
  p95 ≤ 16.9 ms, no audio glitch, 3 consecutive heap snapshots show no
  significant growth; network panel shows zero requests beyond the document;
  tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document visibilitychange + window blur → instant pause
  (accumulator frozen, audio.suspend, TAP TO CONTINUE overlay); resume resets
  lastTime = performance.now() against spiral-of-death; loop.js stall clamp
  guards time jumps. Tab hidden 10 minutes: memory flat, audio silent.
- Saves via engine/storage.js createStorage('neon-wave-rider', 1, defaults,
  migrate): schema v1 = { best, runs, grazeTotal, maxCombo, settings { sound,
  lang } }. try/catch tolerant to quota/blocked/corrupt storage with an
  in-memory fallback; migration hook wired. Never raw localStorage.
- Near-miss hitbox −20%: collision hitbox = 0.8 x visual radius; graze ring
  1.0–1.25 x radius triggers a near-miss (+5 points, combo +1, surge meter
  +12%); compare with squared distance — no sqrt in the hot path.
- Instant replay < 150 ms: ring buffer Float32Array(720) storing (x, y) @
  120 Hz x 3 s + a byte array marking events, allocated once at boot; on
  death: hitstop 90 ms → IMMEDIATELY replay the last 3 s at timeScale 0.5
  with a faded ghost ship, static camera → RESULT; total from death to replay
  visible ≤ 150 ms.
- FPS governor: if average frame > 17.5 ms across 60 frames → cut the
  particle budget 50%; if it persists → disable the glow layer (graceful
  degradation the player never notices).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3 (GATE 3): 100% of the FINAL ACCEPTANCE checklist below passes; code is
  strict mode, every constant in a CONFIG object at the top, no dead code, no
  console.log in the final build.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/neon-wave-rider/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only (no images, no remote fonts —
   system-ui stack, no CDN, no imports), total payload ≤ 5 MB. DevTools
   offline/block-all-requests leaves full functionality. Ships README.md (how
   to run, controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 FPS locked: measured with performance.now() across a 5-minute bot run —
   ≥ 99% of frames < 16.9 ms under 4x CPU throttle (mid-range profile).
3. Zero GC in RAF steady state: no new object/array/closure/string-concat in
   the frame loop; verified by 3 consecutive heap snapshots, delta ≤ 0.1%.
4. One-thumb fully playable: touch-to-render latency ≤ 1 frame; restart
   ≤ 100 ms; death → replay visible ≤ 150 ms; touch-action none,
   scroll/zoom/double-tap-zoom fully blocked.
5. Deterministic: the same spawner seed → the same gate sequence (serves
   replay and verification).
6. Tab pause/resume introduces no physics bug, no audio loss, no background
   battery drain.
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'NEON-WAVE-RIDER READY'.
9. Definition of done: /game:qa neon-wave-rider against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         NEON WAVE RIDER
  bootTap       TAP TO START
  tut0          DRAG TO WEAVE
  tut1          SHAVE THE EDGES — GRAZE FOR COMBO
  scoreCap      SCORE      bestCap BEST      maxCombo MAX COMBO
  grazeCap      GRAZES
  surgeCap      SURGE
  comboCap      x{mult}
  replayCap     REPLAY
  pauseCap      TAP TO CONTINUE
  resCap        RESULTS     newBest NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: vertical 3-stop bg #050510 → #1a0b2e → #0d1b3e; safe gate gradient
  #00f5ff → #0088ff; hazard spikes #ff2d78; ship core #ffffff with additive
  glow; ribbon HSL hue sweeps 190 → 310 with combo; UI text #e8f6ff, score
  accent #ffd23f.
- Physics: as ITERATION 1 — spring k = 140 s⁻², c = 14 s⁻¹, dt = 1/120 s,
  semi-implicit Euler, verlet ribbon 14 nodes / 3 relaxation passes / 14 px
  segments, edge restitution 0.35, speed clamp 2400 px/s. Blueprint values are
  authoritative and may be tuned ±15% with a written performance/feel rationale.
- Difficulty: D(t) = smoothstep(t / 180) simultaneously modulates speed
  420 → 980 px/s and gap 320 → 190 px; hazard density 0.12 → 0.38; the first
  3 seconds are always absolutely safe (onboarding).
- Combo & Surge: combo +1 per gate passed or graze; decay window 4 s resets to
  0; multiplier = 1 + floor(combo/5), cap 8x; surge meter +12% per graze
  (~8–9 grazes to fill → a burst rhythm every ~45–60 s); Surge lasts 5 s:
  timeScale 0.55, score x2, 7-color ribbon, an extra music pad layer — then
  the meter empties and a 10 s cooldown begins.
- Audio: synth frequencies per ITERATION 2; music bed = drone 55 Hz + fifth
  82.4 Hz at gain 0.05 running the whole session.
- Render order: nebula → 3 star layers → gates → ribbon → ship → particles
  (lighter) → shake transform → UI.
- UX flow: BOOT (dark bg, TAP TO START — the gesture unlocks audio) → MENU
  (best score, one-line how-to: DRAG TO WEAVE) → RUN → DEATH → REPLAY →
  RESULT (score, best, max combo, total grazes) → tap anywhere restarts
  ≤ 100 ms.
- Enterprise hooks: adBreak(type) stub called before RESULT (interstitial
  insertion point); track(event, data) no-op — both comment-marked for later
  SDK insertion; no PII collected, GDPR-safe, zero network.
- State machine: BOOT → MENU → RUN → DEATH → REPLAY → RESULT; PAUSE overlay
  anytime (button + visibilitychange + blur); ?lang=xx for QA.
- Perf budget: p95 frame ≤ 16.9 ms on 4x CPU throttle; FPS governor degrades
  particles then glow below target.
```
