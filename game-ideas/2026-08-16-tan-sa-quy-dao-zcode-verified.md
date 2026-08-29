# SCATTER ORBIT

- **Date:** 2026-08-16 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `scatter-orbit` — target folder `games/scatter-orbit/`
- **Genre:** One-thumb orbital slingshot × graze-scoring survivor: hold to latch a tether orbit around an anchor, release to slingshot tangentially — and the big points come from near-miss grazing, not dodging.
- **Pitch:** Touch down and your fingertip is a satellite latching an orbit; let go and you slingshot through the debris field — but big scores come from GRAZING bullets, not avoiding them. The bolder you fly, the hotter the combo burns, the higher the music climbs: a 30-second risk-for-reward loop that always begs one more run.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Tán Sa Quỹ Đạo (Scatter Orbit)".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Scatter Orbit — an H5 commercial one-thumb orbital-slingshot
grazer that meets this repo's shipping bar: games/scatter-orbit/ static site
scaffolded from templates/game-starter/ via /game:new, template engines
unmodified, zero build step, zero runtime network. Core loop: latch a tether
orbit, slingshot through debris, graze bullets on purpose — 60 fps locked, 0
GC in RAF, 0 external assets, full juice (shake/hitstop/particles/procedural
audio). Business targets: 30-second hook loop, one-more-run retention,
store-screenshot-ready visuals, a NEW BEST chain that begs to be shared.
Enterprise line: one central CONFIG (no scattered magic numbers), modular
code, frame-time telemetry with a debug overlay, mandatory self-test gates
before claiming DONE. All UI copy in English, served from an STR i18n table
with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the game
ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'SCATTER-ORBIT READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/scatter-orbit/ from templates/game-starter/ via /game:new
  scatter-orbit. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: logical 1920×1080, letterbox contain to the viewport; backing store
  = 1920×1080 x min(devicePixelRatio, 2); camera setTransform reset each
  frame, shake offset applied after the transform.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Motion:
  semi-implicit Euler v += a·dt; p += v·dt; free-flight damping v ×=
  exp(−0.35·dt); vMax clamp 1400 px/s after release. Entities move in
  update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback.
  pointerdown anywhere (touch-action: none, preventDefault, block scroll/
  zoom/selection) → LATCH the nearest anchor within 380 px. Hold = circular
  constraint: after integration, project p onto |p − anchor| = L (L locked at
  latch); remove the radial velocity component v ← v − dot(v,n)·n; tangential
  boost +1.5% per revolution by the sign of cross(v, r), preserving the
  player's chosen spin. pointerup → RELEASE: tangential v conserved — a
  natural slingshot. No anchor in range → soft dash 220 px/s toward the
  finger (smooth, never a teleport). Multi-touch must never mislatch.
- World: gold anchors spawn every 520–780 px in the direction of travel; red
  debris with density k(t) = 2 + 0.35·(t/30); mint dust-star pickups; every
  45 s a SUPERNOVA ring expands from the screen edge (telegraphed 1.2 s by a
  dashed ring) forcing orbit changes. HUD: score, multiplier, heat bar.
- Central CONFIG object holds every constant (physics, spawn, colors, audio)
  — no scattered magic numbers.
- All randomness through engine/rng.js createRng(seed); spawn placement and
  noise tables draw from it. No Math.random() in gameplay code.
- C1: (1) a bot self-plays 60 s without dying to logic bugs (gameplay deaths
  are fine); (2) pointerdown→latch delay ≤ 1 frame; (3) console clean of
  errors; (4) 60 fps desktop.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: Float32Array ring buffer of 2048 (x, y, vx, vy, life, maxLife,
  size, typeIdx) + a free-list stack; spawn = pop, kill = push; render
  batched by typeIdx using glow sprites pre-rendered on an offscreen canvas.
  Follow engine/particles.js pool semantics; NO new/[]/closures in the update
  loop.
- Juice: screen shake trauma ∈ [0,1]; offset = trauma² × 14 px × noise-table
  (256 precomputed values, index = frame & 255); rotation max 2.5° × trauma²;
  decay trauma −= 1.6·dt. Trauma adds: latch +0.18, graze +0.04, death +0.6.
  Hitstop: timeScale = 0.05 for 70 ms at combo milestones (×4/×8/×12) and
  120 ms on death — freezes simulation only, render keeps running (the trail
  keeps breathing).
- Comet trail: ring buffer of 24 history positions, gradient #7DF9FF →
  #4A7DFF → alpha-0 with tapered lineWidth (widths precomputed; no color
  strings in frame — fillStyle cached by key).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture (pointerdown/keydown), suspend on
  pause, mute state persisted, mute button in UI; master chain masterGain →
  WaveShaper soft-clip → DynamicsCompressor → destination. Master never
  starts > 0.5.
- Synth graph (all nodes scheduled-ready before unlock): [graze blip =
  triangle 1 osc | anchor stab = 3 osc root+quinta+octave | pad = 2 saws
  detuned ±6 cents through a 0.1 Hz LFO filter] → BiquadFilter lowpass,
  cutoff = 400 Hz + combo × 260 Hz (clamp 8 kHz, Q = 1.2) → WaveShaper
  soft-clip → compressor (−24 dB, 8:1) → destination. A-minor pentatonic
  scale [110.00, 130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66] Hz —
  grazes climb one note per combo index (folded into 2 octaves); latch plays
  the anchor's root chord; death = pitch-sweep saw 220→30 Hz over 0.4 s +
  white-noise burst (a 1 s noise buffer generated exactly once, reused
  forever).
- C2: (1) every SFX triggers on the correct event; (2) particles cost
  ≤ 2 ms/frame; (3) trauma + hitstop are visibly perceptible; (4) network
  panel shows zero requests beyond the document; (5) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → hidden: stop loop +
  audio.suspend(); visible: clamp the accumulator to 0, resume audio, READY
  overlay 800 ms to block unfair deaths. Tab-switch 10×: no overlapping
  audio, no timer leaks.
- Saves via engine/storage.js createStorage('scatter-orbit', 1, defaults,
  migrate): schema v1 = { best, runs, settings {muted, lang} }. try/catch
  tolerant to quota-full/private-mode storage; migration hook wired. Never
  raw localStorage. HUD shows BEST + a NEW BEST flare when exceeded.
- Graze system (the primary score source): lethal hitbox = 0.8 × true radius
  (−20%); graze band = [1.0 .. 1.6] × the combined radii of both objects:
  each frame inside the band → heat +1, a 6-particle spark, a 1-frame ring
  flash, trauma +0.04, a single-note blip; leaving the band holds the combo
  on a 2.5 s countdown (exponential decay). Score += 10 × multiplier per
  graze tick — the player is designed to SEEK bullets, not hide from them.
- Combo: multiplier = 1 + floor(heat/8), cap ×12. PERFECT ORBIT: one full
  360° revolution (unwrapped accumulated angle around the anchor) while
  grazing ≥ 3 distinct debris → +200 points, a one-time ×2 heat burst, a
  1-frame background flash.
- Instant replay: ring buffer of transforms (player + all debris) for
  150 ms @ 60 Hz = 9 frames; on death the sim freezes, a ghost replay plays
  (additive, alpha fade 1→0, exactly the buffered data — NO re-simulation),
  then the Game Over panel; measure performance.now() from the death frame to
  the first replay frame < 150 ms.
- Debug overlay (~ key): frame-time telemetry + draws the 0.8× lethal hitbox
  and the graze band so fairness is provable by eye.
- Anti-GC: no array/object/closure/string-concat declarations in the
  per-frame path; heap snapshot delta ≈ 0 KB after 60 s of active play; no
  periodic GC sawtooth in the Performance panel. Cache for-loop lengths;
  forEach/map/filter forbidden in hot paths; Math.hypot forbidden in hot
  paths (use sqrt(dx·dx + dy·dy)); temp vectors live at module scope.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives
  in STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read
  via t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) replay reaches the < 150 ms threshold; (2) debug render proves the
  lethal 0.8× hitbox and graze band; (3) tab pause/resume loses no time,
  stacks no audio, kills nobody unfairly; (4) storage survives a corrupt
  payload; (5) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/scatter-orbit/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests (no fetch/XHR/external imports/Image loads),
   procedural assets only, total payload ≤ 5 MB. Ships README.md (how to
   run, controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked: rAF steady 60 Hz, p95 frame ≤ 16.7 ms, no frame > 30 ms in
   a 3-minute bot run (integrated frame-time telemetry, ~ overlay).
3. Zero GC in RAF steady state (allocations only at boot/state change).
4. One-thumb fully playable: touch-action none, multi-touch never mislatches,
   no scroll/zoom/double-tap-zoom.
5. Fixed-step determinism: same input seed → same trajectory (bot replay
   matches positions within 0.5 px per 60 s).
6. Near-miss verified: lethal 0.8×, scoring graze band + juice, proven by the
   debug render; instant replay < 150 ms death→first frame with 0 new
   allocations.
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: the C1/C2/C3 + acceptance checklist prints a PASS/FAIL
   table exactly once (no spam), all PASS + 'SCATTER-ORBIT READY'.
9. Definition of done: /game:qa scatter-orbit against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         SCATTER ORBIT
  bootTap       TAP TO START
  hintLatch     HOLD TO ORBIT — RELEASE TO SLING
  tutGraze      GRAZE THE DEBRIS — THAT'S WHERE THE POINTS LIVE
  readyCap      READY
  scoreCap      SCORE      multCap ×N      heatCap HEAT      bestCap BEST
  newBest       NEW BEST!
  perfectOrbit  PERFECT ORBIT +200
  supernovaWarn SUPERNOVA
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS      runsCap RUNS
  btnRetry      RETRY      btnMenu MENU
  setSound      SOUND

=== TECHNICAL BLUEPRINT ===
- Palette 'Nebula Dusk': vertical bg gradient #05060E → #0B1026 → #141B3C
  plus 2 parallax star layers pre-rendered offscreen (stars never drawn per
  frame); player core #FFFFFF, glow #7DF9FF; trail #7DF9FF → #4A7DFF →
  alpha-0; anchor #FFD166, latch ring #FFE8A3; debris core #FF3864 rim
  #FF9E00; graze band #A78BFA; pickup #64FFDA; HUD text #EAF2FF; heat bar
  gradient #FFD166 → #FF3864. System font stack.
- Collision: circle-circle; static 64 px bucket grid preallocated (no bucket
  allocation), broad-phase before narrow-phase; max 220 active entities.
- Difficulty: debris speed 120 + 4·t px/s (cap 420); SUPERNOVA ring every
  45 s; debris density k(t) = 2 + 0.35·(t/30); all coefficients in CONFIG.
- Scoring: graze tick 10 × mult; pickup 50; PERFECT ORBIT +200 & ×2 heat;
  score formatted '12,480' from a preallocated string table — toLocaleString
  forbidden in frame.
- Glow policy: shadowBlur forbidden at runtime — glow = pre-rendered sprites;
  batched canvas ops, no redundant state changes between draw calls.
- State machine: BOOT → TITLE → RUN → REPLAY → GAMEOVER (→ RUN); PAUSE
  overlay anytime (button + visibilitychange).
- Perf budget: p95 ≤ 16.7 ms, JS ≤ 8 ms/frame @DPR2 mid-tier; particles
  ≤ 2 ms/frame; 2048-particle pool + 24-point trail + 9-frame replay buffer
  all allocated once at boot.
```
