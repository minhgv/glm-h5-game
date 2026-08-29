# GRAVITY SILK: Endless Orbit

- **Date:** 2026-08-22 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `gravity-silk` — target folder `games/gravity-silk/`
- **Genre:** Arcade one-thumb orbital-slingshot / endless vertical climber — core mechanic: hold to tether your silk to a gravity well and orbit it, release to fling tangentially; chained hook-and-release builds endless climbing energy.
- **Pitch:** You are a free comet in an endless vertical space well: hold to wind your silk around the nearest gravity well and swing, release at exactly the right moment to slingshot upward, skim hazards for Graze combos, and reach heights no one has touched. Internal motto: 'every release is a breath'.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Tơ Trọng Lực — Vòng Quỹ Đạo Vô Tận".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build GRAVITY SILK: Endless Orbit — an H5 arcade vertical climber that
meets this repo's shipping bar: games/gravity-silk/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Ship it as a COMMERCIAL vertical slice: playable
within 3 s of opening, holds players ≥ 5 minutes/run, a retry-under-60 s loop,
and a 'just one more' feel. Enterprise vs amateur line: (1) fixed-step
deterministic 120 Hz physics fully separated from render; (2) zero-garbage
render loop; (3) procedural 0-asset WebAudio with proper mobile unlock-gesture;
(4) professional juice pass (trauma shake, hitstop, particle pooling);
(5) production hardening (tab pause, versioned save schema, instant replay);
(6) retention design (combo decay, near-miss graze, overdrive) — every system
serves the dopamine loop. All UI copy in English, served from an STR i18n
table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the
game ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order — never stop
halfway. After EACH iteration, self-verify with console.assert checklists
(C1.x, C2.x, C3.x) plus real runtime measurements; on any FAIL, fix at the
root before advancing. Log 'GRAVITY-SILK READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/gravity-silk/ from templates/game-starter/ via /game:new
  gravity-silk. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: portrait 9:16 canvas, HiDPI 1080p: canvas.width = cssW x dpr
  (clamp dpr 1.0–2.5), ctx.setTransform(dpr, 0, 0, dpr, 0, 0), resize listener
  + visualViewport fallback.
- State machine: BOOT → MENU → RUN → PAUSE → REPLAY → DEAD. No scattered
  phase flags.
- Sim: engine/loop.js fixed timestep — accumulator, STEP = 1/120 s, maxSubSteps
  4 (frame delta clamp ≤ 0.25 s, surplus discarded, spiral-of-death guarded),
  render(alpha) interpolation (prevX/nextX lerp). Entities move in update()
  only; render code never mutates state. Single RAF, no parallel timers.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  pointerdown = tether to the NEAREST gravity well within anchor radius;
  pointerup = release and fling tangentially. Only 2 events; touchmove
  preventDefault blocks scroll; input→response ≤ 1 frame. touch-action: none
  on canvas.
- Physics (px/s, px/s²): free flight keeps vx, vy + gravity gy = 180; while
  tethered: ω initialized = (v·tangent)/r, each tick ω += K/(r²)·dt with
  K = 9.2e5 (light gravity-assist), θ += ω·dt, position x = cx + r·cosθ,
  y = cy + r·sinθ; on release: vx = −r·ω·sinθ, vy = r·ω·cosθ. Constraint
  |ω| ≤ 6.5 rad/s so orbits never dizzy.
- Camera: vertical follow lerp 1 − e^(−8·dt), 60 px deadzone, up-only (never
  drops below the highest altitude reached).
- Spawn Director: gravity wells spaced 260–420 px vertically, horizontal
  offset ±110 px, r ∈ [70, 140] px; obstacle density ρ(h) = 0.15 +
  (h/50000)·0.35 (cap 0.5); score rings appear from h > 800 at a random angle
  around a well.
- Death: touch an obstacle, fall below the bottom of the screen, or 8 s
  without tethering to any well (anti-stall).
- All randomness through engine/rng.js createRng(seed) (seeded PRNG; the seed
  is stored in the replay). No Math.random() in gameplay code.
- C1: (1) fun within the first 10 s; (2) the full MENU→RUN→DEAD→retry loop
  works; (3) 60 FPS desktop; (4) tether/orbit/release math matches the
  formulas above.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 pre-allocated pool with swap-remove free-list
  (p[i] = p[count−1]; count−−) — absolutely no splice/push in RAF. Follow
  engine/particles.js pool semantics.
- Juice: trauma shake — shake = trauma², trauma ∈ [0,1], decay 1.5/s, offset
  = shake x 14 px x noise, clamped ±8 px so it never nauseates. Hitstop:
  near-miss/hazard → timeScale 0.05 for 60–90 ms (fed through the accumulator,
  never Date.now() in logic). Comet squash-stretch along the velocity vector;
  trail ribbon of 24 pre-allocated points (reused geometry arrays, no concat).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination. Master never starts > 0.5.
- Synth table: tether = sine gliss 220 → 440 Hz / 80 ms; release = triangle
  pluck 520 Hz, exp-decay 0.15 s; collect ladder = C-major pentatonic
  523.25 / 587.33 / 659.25 / 783.99 / 880.00 Hz climbing with combo (clamp
  degree 8); death = noise buffer + lowpass 200 Hz + saw 110 Hz detuned
  +7 cents; graze whoosh = filtered noise sweep 300 → 3000 Hz, Q = 4. Ambient
  pad: 2 saws detuned 55.0/55.5 Hz through a 0.1 Hz lowpass LFO — on in MENU,
  ducked −12 dB during RUN.
- Haptics: navigator.vibrate?.(10) on tether/graze (when enabled in settings).
- C2: (1) 'feel checklist' ≥ 9/10 — every action has sound + visual + haptic,
  everything responds within 1 frame of input; (2) network panel shows zero
  requests beyond the document; (3) hitstop/shake do not break interpolation;
  (4) audio unlocks on the first gesture, no click-pop;
  (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.hidden → full pause + audio.suspend; visible →
  3-2-1 countdown resume + audio.resume; loop.js stall clamp guards time
  jumps; zero autoplay-policy violations.
- Saves via engine/storage.js createStorage('gravity-silk', 1, defaults,
  migrate): schema v1 = { bestScore, bestHeight, totalRuns, settings { mute,
  haptics, quality, lang } }; migration switch wired for the future. try/catch
  every access, tolerant to corrupt/cleared storage. Never raw localStorage.
- Near-miss system: the DISPLAYED hazard hitbox = 100%, the REAL hitbox = −20%
  size; skimming the graze zone (real hitbox → displayed hitbox + 18 px) →
  +graze points and charges the Overdrive bar; full bar → 5 s of timeScale
  0.6 + score x2 + the music gains an extra arpeggio layer.
- Instant replay: ring buffer of 3 s x 60 samples (pre-allocated 180-element
  {x, y, theta, alive} circular overwrite); on death → 0.5x playback with
  letterbox + REPLAY label; transition < 150 ms (a pure state change, nothing
  newly allocated).
- FPS governor: rolling average FPS < 52 for 2 s → particle budget −50% →
  trail ribbon off → DPR down one notch (floor 1.0).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  every vector, particle, and audio node pooled and reused; verify via Chrome
  allocation profiler on the requestAnimationFrame stack: 10 s of gameplay =
  zero steady-state heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) storage survives a corrupt
  payload; (3) replay transition < 150 ms with zero allocation;
  (4) governor steps never cause a visible hitch; (5) live language switch
  rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/gravity-silk/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests (no fetch/XHR/remote font/img/CSS), procedural assets
   only, total payload ≤ 5 MB. Ships README.md (how to run, controls, tuning
   table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked: sustained 60 FPS @ 1080p HiDPI on a 2019 mid-range Android;
   no drop > 1 frame / 10 s in standard gameplay; ≥ 58 fps worst-case
   (particles + overdrive + replay recording); frame p99 ≤ 20 ms.
3. Zero GC in RAF steady state: no object/array/closure/string-concat
   allocation in the render loop (allowed only at boot/state change).
4. One-thumb portrait fully playable: perceived input latency ≤ 32 ms from
   pointerdown to a changed frame (≤ 1 frame), every UI element
   thumb-reachable, touch-action none, scroll/zoom/double-tap-zoom fully
   blocked.
5. Audio only after the first gesture (unlock); zero console errors for the
   whole session.
6. Deterministic: the same seed → the same well sequence (seeded PRNG, seed
   stored in the replay).
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'GRAVITY-SILK READY'.
9. Definition of done: /game:qa gravity-silk against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      GRAVITY SILK / ENDLESS ORBIT
  bootTap       TAP TO START
  tut0          HOLD TO TETHER — RELEASE TO SLINGSHOT
  tut1          RELEASE INSIDE THE RING FOR A PERFECT BOOST
  tut2          GRAZE HAZARDS TO CHARGE OVERDRIVE
  scoreCap      SCORE      bestCap BEST      heightCap HEIGHT
  comboCap      COMBO      overdriveCap OVERDRIVE
  perfectCap    PERFECT!   grazeCap GRAZE!
  zoneBanner    PEAK {n}
  readyCap      GET READY
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  soundOn       SOUND ON    soundOff SOUND OFF
  hapticsCap    HAPTICS     qualityCap QUALITY
  btnRetry      RETRY       btnMenu MENU
  shareHead     GRAVITY SILK: ENDLESS ORBIT —

=== TECHNICAL BLUEPRINT ===
- Palette ('Neon Void' brand gradient): vertical bg #050510 → #0D1B2A →
  #1B263B (canvas fill gradient created once and cached); gravity wells =
  cyan #00F5FF with a radial-gradient core alpha 0.9 → 0.0; hazards = magenta
  #FF2E88, 2 px border + #2B0A18 fill; stars/pickups = gold #FFD166 pulsing
  sin(t·4); player comet = white #FFFFFF with a cyan→transparent trail
  gradient; from 20000 px altitude the background hue-drifts +0.5°/s (HSL
  shift of the whole palette) signaling a new zone. UI font: system-ui stack,
  tabular-nums for the score.
- Physics addendum: while tethered, r += (targetR − r)·(1 − e^(−10·dt)) so the
  silk 'snaps' naturally; the silk is drawn as a quadratic bezier bowed along
  the velocity vector, curvature proportional to |ω|.
- Combo system: Perfect Release (release within ±12° of the score-ring center)
  → combo+1; score multiplier mult = 1 + combo·0.25 (cap x8); combo decays —
  4 s without a perfect release → reset; graze +10·mult, collect +50·mult,
  height +floor(Δy/10). Popup text '+50 x4' floats up 40 px fading over 0.6 s
  (dedicated text pool — no new strings — cached by integer).
- Spawn/difficulty: speed-run feel — 0–15 s easy (wells only), 15–45 s adds
  static hazards, > 45 s hazards move sin(t·0.8)·30 px; every 10000 px = a
  zone banner PEAK {n} + a 2-note audio sting (659.25 → 880 Hz).
- HUD: score + height top, combo multiplier near the comet, Overdrive bar at
  the bottom; popups pooled.
- State machine: BOOT → MENU → RUN → PAUSE → REPLAY → DEAD; PAUSE overlay
  anytime (button + visibilitychange). The template's engine modules cover the
  Engine/Physics/Render/Audio roles (fixed-step sim reads no DOM; render
  touches no state).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier; batched
  canvas ops, minimal dirty-state changes between draw calls.
```
