# VORTEX ASCENSION

- **Date:** 2026-08-17 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (games/vortex-ascension/ scaffold instead of a one-file build), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `vortex-ascension` — target folder `games/vortex-ascension/`
- **Genre:** One-thumb orbital-tether climber — swing/wind/fling with angular-momentum conservation (yo-yo) + near-miss graze combos + reactive procedural music.
- **Pitch:** Touch & hold to hook the nearest node and whirl like a yo-yo as the line winds itself shorter, spinning you up exponentially — then release at the top of the arc to fling up the neon vortex. Every near-death graze pushes the combo, the synth pitch and your pulse: spin longer, fly faster, die closer, feel better.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Vòng Xoáy Thăng Thiên".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build VORTEX ASCENSION — an H5 arcade one-thumb climber that meets this
repo's shipping bar: games/vortex-ascension/ static site scaffolded from
templates/game-starter/ via /game:new vortex-ascension, template engines
unmodified, zero build step, zero runtime network. Core loop: HOOK → WIND
(the line winds in, speed rises) → FLING → NEAR-DEATH GRAZE (combo) →
SCORE/FEVER — the "one more try" feel. All UI copy in English, served from an
STR i18n table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle)
so the game ships multi-language-ready. Commercial hooks: portal-ready
(Poki/CrazyGames) with no code changes, data-driven tuning; KPIs: FTUE ≤ 5 s
to first death, average session ≥ 4 min, instant-retry rate ≥ 60%. No stubs,
no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. Each iteration:
PLAN (write its checklist) → BUILD → SELF-AUDIT (measure with
performance.now/DevTools, never by feel) → REFINE. Only advance when the
checklist is 100% PASS; max 3 retries per iteration. Log 'VORTEX-ASCENSION
READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/vortex-ascension/ from templates/game-starter/ via /game:new
  vortex-ascension. Plain ES modules + <script type="module">, served over
  http:// only. Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: portrait-first 1080x1920 logical, letterbox-contain; backing store =
  cssSize x min(devicePixelRatio, 2); ctx.setTransform once per resize
  (ResizeObserver + 150 ms debounce, no object creation in RAF handlers).
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation with the
  remainder carried over. Entities move in update() only; render code never
  mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback
  (pointerdown/up + Space). Hold-state only — the touch POSITION never
  matters. touch-action: none on canvas.
- Core mechanic: free fall under G when released. On hold, latch the
  best-scoring node within LATCH_RADIUS (score = 1/dist + dot(v̂, direction
  to node)); orbit: θ += ω·dt with ω = L/r², L conserved; the line SELF-WINDS:
  r(t) = max(r − WIND_RATE·dt, MIN_R) → tangential v = ω·r = L/r keeps
  rising (the risk/speed trade). Release → fling: v = 1.08 x ω·r along the
  tangent t̂ = (−sinθ, cosθ)·sign(ω), then free flight with G + light drag
  v x= (1 − 0.06·dt).
- Camera: smooth-damp follows the player (drifts up only, never down);
  kill-line "the climbing void" rises from below at 30 + 0.06 x height(px)/s.
  Touching a stud or the void = death.
- World generation: procedural node columns upward, gap(h) = max(180,
  320 − 0.08 x h); stud density rises with height; all randomness through
  engine/rng.js createRng(seed) (seedable for replay/verify). No Math.random()
  in gameplay code.
- C1: (1) 20 consecutive hold-releases without jitter; (2) θ integration
  matches the analytic solution within 0.5% after 10 s; (3) stable 60 fps in
  a foreground tab.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: Float32Array 512x8 (x,y,vx,vy,life,maxLife,size,hue) allocated
  once; kill by swap-remove; spawn overwrites dead slots — follow
  engine/particles.js pool semantics. Trail = 24-point ring buffer, gradient
  stroke by age. NO new/closures in the hot loop.
- Juice: trauma shake — trauma ∈ [0,1], offset = trauma² x 14 px x noise,
  decay 2.2/s, camera-transform only (never world-space logic). Hitstop:
  death = timeScale 0 for 70 ms; perfect release 45 ms; FEVER trigger 90 ms +
  1-frame white flash; freeze via timeScale while RAF keeps running
  (particle/decay clocks stay separate).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor (−24 dB, 4:1) → destination; pre-rendered 1 s noise
  buffer; voices reuse pre-built nodes, stopped via gain ramps — no node
  create/disconnect during play. Master never starts > 0.5.
- Music/SFX table: A-minor pentatonic bed [110, 130.81, 146.83, 164.81, 196,
  220] Hz; graze pluck (triangle, ADSR 2/60/250/180 ms) at freq = 220 x
  2^(min(combo,24)/12) — +1 semitone per combo, heard as a rising ladder;
  release-fling = saw sweep 120 → 880 Hz / 200 ms through a 1.2 kHz lowpass;
  death = noise burst + osc pitch-drop 400 → 40 Hz; 120 BPM beat clock drives
  the hazard pulse (scale ±8%) with a 55 Hz sub kick every 2 beats.
- Combo & scoring: graze zone between hitbox_real (x0.8) and hitbox_visual;
  entering → chain +1, window refresh 1.5 s; multiplier = min(8, 1 + 0.25 x
  chain); perfect release (v within 15° of straight up) = +300 x mult;
  chain ≥ 8 → FEVER 6 s: WIND_RATE x1.6, rainbow trail (HSL spin), extra
  sub-bass layer, screen tint +5% saturation. Score = height in m (px/100) +
  graze 150 x mult + perfect 300 x mult + ring-gate pass 100. UI numbers
  repaint only on value change.
- C2: (1) 10-min soak with zero long tasks > 50 ms; (2) allocation sampling
  over 3 min of gameplay shows zero samples inside the RAF callback;
  (3) no click/pop when spamming 20 grazes/s; (4) network panel shows zero
  requests beyond the document; (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: visibilitychange + window blur → pause (freeze accumulator,
  audio.suspend()); foreground waits for one gesture before audio.resume();
  clean FSM states PLAYING/PAUSED/DEAD/REPLAY (no hybrid states).
- Saves via engine/storage.js createStorage('vortex-ascension', 1, defaults,
  migrate): schema v1 = { best, runs, totalMeters, settings {sound, lang} }.
  try/catch tolerant to corrupt/cleared storage; 500 ms write debounce;
  quota/security errors fall back to in-memory values; migration hook wired.
  Never raw localStorage.
- Near-miss −20% exact: debug overlay (toggle with ~) draws real vs visual
  hitboxes; verify with 20 boundary cases (tangential, through-center, FEVER
  edge).
- Instant replay < 150 ms: Float32Array ring buffer 120x6 [px,py,θ,r,camY,t]
  recorded every physics step; on death the 70 ms hitstop fades in parallel →
  replay the last 1.2 s at 0.35x → Game Over; measure performance.now() from
  the death frame to the first replay frame ≤ 150 ms; the replay reuses the
  whole draw pipeline (0 alloc).
- Anti-GC: no closures/string/template/array-methods in RAF; temp vectors
  live at module level; gradients & Path2D cached per combo tier, rebuilt
  only when the tier changes; console.assert compiled out behind a DEBUG
  flag.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) 10 switch/resize/orientation cycles leak-free (heap snapshot delta
  ≤ 2 GC cycles); (2) replay smooth at 0.35x; (3) pause/resume glitch-free
  physics; (4) storage survives a corrupt payload; (5) live language switch
  rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/vortex-ascension/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests, procedural assets only, total payload ≤ 5 MB.
   Ships README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: median frame 16.6 ms, p95 ≤ 16.9 ms on the reference
   laptop; zero frames ≥ 34 ms in a 10-min soak.
3. Zero GC in RAF steady state (allocations allowed only at boot/state
   change).
4. Full parity: 1-thumb touch, mouse, Space; audio unlock on the true first
   gesture; no sound after blur; touch-action none, scroll/zoom blocked,
   response ≤ 1 frame.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Save survives reload; replay ≤ 150 ms; near-miss −20% verified via the
   debug overlay.
7. Data-driven: all tuning in one top-level CONFIG + a tuning table in
   README.md so artists/testers can re-tune the feel without touching logic.
8. Console self-test: C1/C2/C3 all PASS + 'VORTEX-ASCENSION READY'.
9. Definition of done: /game:qa vortex-ascension against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         VORTEX ASCENSION
  bootTap       TAP TO START
  tut0          HOLD TO HOOK THE NEAREST NODE — RELEASE TO FLING
  tut1          THE LINE WINDS IN — SPEED RISES
  tut2          GRAZE THE STUDS — 8 CHAIN IGNITES FEVER
  scoreCap      SCORE      heightCap HEIGHT      bestCap BEST
  grazeCap      GRAZE!
  perfectCap    PERFECT RELEASE!
  feverCap      FEVER!
  replayCap     REPLAY      replaySkip TAP TO SKIP
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: vortex radial-gradient bg #050510 → #0B0E2A → #1a0b2e; player core
  #FFD166 with glow; tether #21E6C1; node #7B2FF7; hazard stud #FF4D6D;
  graze ring gold alpha 0.35; FEVER tint hue-spin 40°/s; every gradient built
  once and cached per tier.
- Physics constants (px/s at the 1080p frame): G = 2200; WIND_RATE = 42
  (FEVER x1.6); LATCH_RADIUS = 300; MIN_R = 40; MAX_R = 340; ω clamp
  ≤ 14 rad/s; fling boost x1.08; drag 0.06/s; camera stiffness 6/s; kill-line
  30 + 0.06 x h.
- Audio: pentatonic [110, 130.81, 146.83, 164.81, 196, 220] Hz; pluck freq =
  220 x 2^(min(combo,24)/12); fling sweep 120 → 880 Hz / 200 ms; death drop
  400 → 40 Hz; 55 Hz sub kick @120 BPM; 1 s pre-rendered noise buffer; all
  through the compressor (−24 dB, 4:1).
- Score economy: graze 150 x mult; perfect release 300 x mult; gate 100;
  1 m = 1 pt; multiplier cap x8; decay window 1.5 s; FEVER at chain ≥ 8,
  lasts 6 s.
- State machine: BOOT → MENU → COUNTDOWN → RUN → DEAD → REPLAY → RUN; PAUSE
  overlay anytime (button + visibilitychange).
- Perf budget: median 16.6 ms, p95 ≤ 16.9 ms @1080p/DPR2 mid-tier; zero long
  tasks > 50 ms; zero allocations in the frame path.
```
