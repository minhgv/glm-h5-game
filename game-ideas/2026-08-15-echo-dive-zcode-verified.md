# ECHO DIVE

- **Date:** 2026-08-15 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `echo-dive` — target folder `games/echo-dive/`
- **Genre:** Arcade / casual one-touch (risk-reward sonar): every ping reveals the dark — and lures the hunters.
- **Pitch:** You sink freely through a pitch-black cave where the world only exists as the echo of your own sonar: each tap reveals the walls, shoves you off them, and wakes the sound-hunted hunters. Information is the wager — skim the walls to multiply your combo, or stay silent and safe but blind.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Echo Dive — Hồi Âm Vực Sâu".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Echo Dive — an H5 arcade one-touch sonar-diver that meets this
repo's shipping bar: games/echo-dive/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: you are a 'grain of sound' sinking into
a black cave — hold to charge, release to ping; the ping reveals walls,
pushes you off them, and lures hunters to the ping point. Goal: deepest dive,
highest combo. Design pillars: information-as-currency (vision paid for in
danger), near-miss dopamine (wall-skims score and lure the player upward in
risk), sub-30 s first run with 600 ms restart, and a best-depth line drawn
through every run. All UI copy in English, served from an STR i18n table with
reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the game ships
multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'ECHO-DIVE READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/echo-dive/ from templates/game-starter/ via /game:new
  echo-dive. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: logical canvas 390×700, portrait-first (min 360×560), responsive
  letterbox to desktop (centered, letterboxed); HiDPI canvas.width = viewport
  x min(DPR, 2); transform set once per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Player: circle r=10, Euler integration, dt = min(frameDt, 1/30). Sinking:
  vy += (SINK − vy) × 3 × dt with SINK = 70 + min(depth_m, 800) × 0.14
  (70→182 px/s). No gravity (underwater).
- Ping impulse: with wall distance dw and normal n (±x):
  impulse = 520 × charge × clamp(1 − dw/180, 0.15, 1);
  vx += n.x × impulse; vy += −120 × charge (against the sink). Total speed
  clamp 700 px/s; horizontal water drag vx ×= 0.99^(dt×60).
- Input: engine/input.js unified pointer/touch + keyboard fallback —
  press-and-hold anywhere to charge, release to ping; Space hold/release
  equivalent; P pause, M mute, R restart (death screen). touch-action: none
  on canvas.
- Charge: press-and-hold anywhere charges 0→1 over 0.9 s, release pings.
  Charge scales reveal radius 120→220 px,
  push force 0.55→1.0×, wall-light duration 1.4→2.4 s, ping volume 0.5→1.0×
  (lures hunters from farther: hearing radius 300→560 px).
- Cave: centerline C(y) = 2-octave 1D value noise (seedable), half-width
  W(y) = Wbiome + noise(y×0.004)×35, clamped to [40, width−40]; walls at
  x = C(y) ∓ W(y). Chunk-based generation for y ∈ [camY−200, camY+900], cull
  y < camY−400 (return to pool). Camera camY = playerY − 220 (lerp 0.12).
- Wall collision: push-out along x; impact speed |vx| > 220 → HARD HIT:
  vx ×= −0.35, combo resets, thud + light shake; otherwise slide:
  vx ×= −0.05, vy ×= 0.985 (friction). No shake on light grazes.
- Spikes: triangles on walls (height 18–30 px pointing into the cave), lethal
  when circle-triangle dist < r; spawned per biome density, ≥ 90 px apart
  along the wall, none in the first 300 px.
- Crystals: circle r=7 at C(y) + rand(−0.6, 0.6)×W(y), every 140–220 px of
  depth; touch (dist < r+7) → +1 charge (cap 3) + points.
- Hunters: circle r=9, two red dot eyes; spawn every 220 m (max 4 alive).
  States: lure — dash to lastPing at speed (90 + depth×0.02) × biomeMult,
  cap 260, for up to 4 s or until arrival → wander with light noise. Player
  collision (dist < r+9) → death.
- Undercurrent (biome 3): lateral flow cur = sin(y×0.01)×40 added directly to
  vx every frame.
- Scoring skeleton: depth_m = floor(playerY/10); crystals and wall-skim ticks
  feed a combo multiplier — full formulas in TECHNICAL BLUEPRINT.
- All randomness through engine/rng.js createRng(seed) — cave noise, spikes,
  crystals, hunters; ?seed= URL override for reproducible runs (the balance
  bot depends on it). No Math.random() in gameplay code.
- C1: (1) physics/render separation holds, dt clamp enforced;
  (2) ping-ring renders on the same frame as input, response ≤ 1 frame;
  (3) wall collision classes correct — |vx| > 220 hard-hit resets combo,
  anything softer slides with friction; (4) 60 fps desktop.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 256 particles + 8 rings, pre-allocated; 0 allocation in
  the game loop after load. Follow engine/particles.js pool semantics; NO
  new/closures in the hot loop.
- VFX (Canvas 2D, additive 'lighter' for glow): ping ring = stroke circle
  growing r 20→R over 0.5 s, alpha 0.9→0, lineWidth 3→1; wall reveal = both
  wall paths (sampled every 8 px) stroked in biome color, alpha = revealT
  (decays over the charge-scaled duration) + an 'inner glow' polyline offset
  8 px into the cave at alpha ×0.3 — shadowBlur is FORBIDDEN (pre-render a
  64×64 radial-gradient glow sprite if needed); player trail = faint dots
  every 24 px of travel while speed > 200, life 0.4 s; hunters show red eyes
  + a thin trail at alpha 0.25 (lure state only); skim streak = light streak
  parallel to the wall at the skim point, life 0.5 s; death burst = 20 pooled
  particles (random direction, gravity 200, life 0.8 s) + white full-screen
  flash alpha 0.35→0 over 0.25 s; crystal = 3 orbiting sparkle dots, on
  attraction a small ring grows 0.3 s + floating +25×N text for 0.7 s;
  charge ring = arc around the press point, 0→360° progress, white alpha 0.6.
- Juice: screen shake only on death (max 6 px, decay 8 px/s); haptics
  navigator.vibrate?.(20) on death inside try/catch; NO shake on light wall
  grazes.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  (latencyHint 'interactive') created lazily on first user gesture
  (BOOT→MENU), suspend on pause, mute state persisted; master chain
  masterGain → WaveShaper soft-clip → DynamicsCompressor (threshold −24 dB,
  ratio 4) → destination. Master never starts > 0.5. Total peak ≤ −1 dBFS.
  One shared 1 s white-noise buffer built at boot, reused.
- SFX recipes (all procedural): ping = sine 880→220 Hz exp-ramp 0.4 s through
  a gain env (0→0.3·charge→0, decay 0.45 s) fed into a feedback delay 0.28 s
  ×0.35 + highpass 600 Hz (true echo); pitch +40 Hz per biome; charge = loop
  sine 200→1200 Hz by charge, gain 0.05, stops on release/kill; crystal =
  2 oscs (f, f×2.01) triangle 0.18 s, decay 0.3, f from the pentatonic scale
  by min(streak, 11): [523, 587, 659, 784, 880, 1046, 1175, 1319, 1568, 1760,
  2093, 2349] Hz; skim = 0.15 s white-noise buffer → bandpass
  800 + speed×2 Hz, Q=1, gain 0.15·(speed/700); hard hit = sine 90 Hz 0.12 s
  + noise burst lowpass 300 Hz; death = saw 110→30 Hz 0.6 s (2 oscs detuned
  ±12 cent) + noise burst lowpass 400 Hz decay 0.5; background drone = 2
  sines detuned ±5 cent at the biome root note [55, 62, 49, 41] Hz, gain
  0.04, 2 s crossfade on biome change; crystal hum = sine 320 Hz, gain ∝
  1/dist (nearest crystal only), StereoPanner ∝ dx/width — lets you 'hear'
  the path.
- C2: (1) 60 fps with full VFX; (2) network panel shows zero requests beyond
  the document; (3) 20 consecutive pings do not clip (peak ≤ −1 dBFS measured
  via AnalyserNode); (4) audio scheduled ≤ ctx.currentTime + 0.03;
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange and window blur → full pause +
  audio suspend (ctx.suspend/resume on hide/show); tab hidden > 5 s → PAUSE;
  resume with a 3-2-1 countdown; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('echo-dive', 1, defaults, migrate):
  schema v1 = { best, bestCombo, runs, tutDone, settings {muted, lang} }.
  try/catch tolerant to corrupt/cleared storage (in-memory fallback);
  migration hook wired. Never raw localStorage.
- First-run tutorial: 3 layers of fading text ('HOLD...', 'RELEASE...',
  'LISTEN AROUND...') that dismiss on the matching action — understandable
  without reading; tutDone flag set after.
- Edge cases: resize/rotation rebuilds canvas + offscreen while keeping
  state, camera re-lerps without a jolt; pointercancel / pointer leaving the
  canvas = release ping; iOS ctx.resume() on touchend.
- Eco mode: if FPS < 30 for 3 s straight → drop DPR to 1.5 + halve the pool
  to 128 (once, with a small 'ECO MODE' badge).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- Accessibility: prefers-reduced-motion → no shake, no trail; gameplay and
  audio unchanged.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives
  in STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read
  via t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) death → replay ready ≤ 600 ms
  via tap or Space; (3) storage survives a corrupt payload; (4) profiler
  shows zero RAF allocations; (5) live language switch rebuilds all labels,
  en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/echo-dive/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: ≥ 55 fps p95 on 4× CPU throttle; debug overlay confirms
   ≤ 16.6 ms/frame (JS ≤ 4 ms, draw ≤ 8 ms on a 2019 mid-range Android).
3. Zero GC in RAF steady state; 30-minute soak: 0 console errors, heap
   ±10 MB across 3 heap snapshots, no particle leaks.
4. One-thumb fully playable: touch-action none, response ≤ 1 frame,
   scroll/zoom/double-tap-zoom fully blocked; input parity touch/mouse/Space;
   P/M/R keys work; resize/rotate clean.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Audio: 20 pings stacked never clip (peak ≤ −1 dBFS); mute cuts everything
   including the drone and survives reload.
7. Balance bot (headless, 1000 seeded runs): median run 45–90 s, p10 > 25 s,
   death causes 40–60% hunters; first human run median 20–40 s.
8. Console self-test: C1/C2/C3 all PASS + 'ECHO-DIVE READY'.
9. Definition of done: /game:qa echo-dive against
   docs/production-checklist.md, then /game:release gates. Feel gate: a
   first-time tester understands the mechanic within ≤ 3 pings and wants to
   retry immediately after the first death.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         ECHO DIVE
  bootTap       TAP TO START
  hintCharge    HOLD TO CHARGE — RELEASE TO PING
  tut0          HOLD...
  tut1          RELEASE...
  tut2          LISTEN AROUND...
  bestLine      BEST
  comboCap      ×N COMBO
  newBest       NEW BEST!
  pauseCap      PAUSED
  btnResume     RESUME      btnMenu MENU
  resCap        RESULTS
  depthCap      DEPTH      crysCap CRYSTALS      skimCap SKIM
  btnDive       DIVE AGAIN
  ecoMode       ECO MODE

=== TECHNICAL BLUEPRINT ===
- Biomes (every 400 m of depth; values: bg / wall color / base half-width W /
  spike density / hunter multiplier / special):
  1 STALACTITE — #05070d / #7fd8ff / 150 / 0.08 per wall-px / ×1.0 / —;
  2 SOUND-MOSS — #060b08 / #7dffb0 / 140 / 0.10 / ×1.1 / reveal duration
    ×0.55, moss glows when pinged;
  3 UNDERCURRENT — #0a0810 / #c09bff / 135 / 0.10 / ×1.15 / lateral current
    ±40 px/s;
  4 BLACK ABYSS — #0d0505 / #ff9b7d / 110→95 / 0.13 / ×1.35 / permanent 6%
    visibility.
  After biome 4 the cycle repeats with +5% difficulty per loop (cap +50%).
- Scoring: depth_m = floor(playerY / 10), depth points = depth_m; crystal
  +25 × mult; skim tick (every 0.25 s while dw < 26 and speed > 140) =
  +10 × mult; combo: each crystal/skim +1 streak, mult = 1 + floor(streak/5),
  cap ×8; hard wall hit or death resets to ×1.
- Best-line: thin dashed line (alpha 0.35) at the previous best depth + a
  BEST −xxx m label — a visible target in every run.
- HUD: top-left depth −128m (28 px, tabular-nums); top-right ×N COMBO (shown
  only at ≥ 2, scale-pop on increase); bottom-center 3 charge dots (filled =
  ready, recovering dot shows a progress arc); faint best-line; ?debug=1
  shows FPS + frame ms + hitboxes at the bottom.
- State machine: BOOT → MENU → PLAY ⇄ PAUSE → DEATH → PLAY (restart 1 tap or
  Space); PAUSE overlay anytime (button + visibilitychange). DEATH screen =
  3-line breakdown (DEPTH / CRYSTALS / SKIM) + total, NEW BEST! badge, big
  DIVE AGAIN button + 5 s auto-restart countdown (cancelled on touch).
- Perf budget: JS ≤ 4 ms + draw ≤ 8 ms = 16.6 ms @60fps mid-range; ≤ 150 live
  particles (pool 256); ≤ 8 rings; wall geometry per frame = path window
  ±700 px sampled every 8 px; shadowBlur/runtime filters FORBIDDEN; batched
  canvas ops, no redundant state changes between draw calls.
```
