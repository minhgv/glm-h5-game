# ABYSS ECHO

- **Date:** 2026-08-18 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (games/abyss-echo/ scaffold instead of a one-file build), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `abyss-echo` — target folder `games/abyss-echo/`
- **Genre:** Arcade/casual endless descent + echolocation graze-rush — one finger (tap = sonar ping that reveals the dark, hold-drag = glide), scored by grazing danger as close as it gets.
- **Pitch:** You are a creature of the dark diving into an abyss where nothing can be seen — things only exist where your echo touches them. Every ping opens a ring of light revealing toxic spikes, ghost jellyfish and echo pearls; the closer you dare graze the danger, the hotter the combo and the higher the abyssal score — mistime a ping and the dark swallows you.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Vọng Âm: Kẻ Săn Sóng Đáy Vực".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build ABYSS ECHO — an H5 arcade game that meets this repo's shipping
bar: games/abyss-echo/ static site scaffolded from templates/game-starter/
via /game:new abyss-echo, template engines unmodified, zero build step, zero
runtime network. Core loop: echolocation descent — tap to ping and reveal the
dark, hold-drag to glide, graze the revealed hazards to feed a burning combo.
A studio product, NOT a student demo: retention built on the one-more-run
graze-combo hook, 4–6 min sessions, commercial slots ready (interstitial
after every 3 runs, IAP skin, local leaderboard awaiting server migration);
audio-visual polish 100% procedural. All UI copy in English, served from an
STR i18n table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle)
so the game ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order; each round
MUST build → self-test → fix before advancing. Log 'ABYSS-ECHO READY' only
when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/abyss-echo/ from templates/game-starter/ via /game:new
  abyss-echo. Plain ES modules + <script type="module">, served over http://
  only. Games never import from outside their folder; engine/ modules stay
  unmodified.
- Stage: one canvas layer, resized to the viewport, DPR cap 2 (≈1080p
  HiDPI); backing store = cssSize x dpr; ctx.setTransform(dpr,0,0,dpr,0,0)
  once at resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), linear interpolation of every
  position (prevX/currX) at render. Entities move in update() only; render
  code never mutates state.
- FSM: BOOT → MENU → RUN → DYING → REPLAY → GAMEOVER; transitions via a
  static handler table, no new closures. PAUSE overlay anytime (button +
  visibilitychange).
- Input: engine/input.js unified pointer/touch + keyboard fallback;
  touch-action: none, {passive:false}. Hold-drag: targetX = clamp(x, margin,
  W − margin). A quick tap (< 150 ms, < 12 px movement) = PING. Input events
  are buffered with timestamps and consumed at the next fixed step (latency
  ≤ 1 frame).
- Physics: player.x += vx·dt; vx += (K x (targetX − x) − C x vx) x dt with
  K = 42 s⁻², C = 8 s⁻¹. Descent: vy = 260 x (1 + depth/2400)^0.6 px/s,
  cap 640; depth += vy·dt.
- Hazards come from a pre-sized pool spawned by the scroll; placeholder
  rects are fine for the first collision checks (circle dist < R_core). All
  spawning/layout randomness through engine/rng.js createRng(seed). No
  Math.random() in gameplay code.
- C1: 60 s of dummy auto-play — no crash, stable RAF, clean console.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 1024 pre-allocated (Float32Array fields x,y,vx,vy,life,maxLife,
  size,type) — spawn overwrites dead slots, NO object creation; 64 ambient
  rising bubbles — follow engine/particles.js pool semantics.
- Juice: trauma shake — trauma ∈ [0,1], offset = trauma² x 14 px x noise,
  decay 1.6/s; hitstop timeScale = 0 for 90 ms on death, 45 ms micro-freeze
  on combo tier x10.
- Ping ring: wavefront r(t) = c x t with c = 1000 px/s, intensity I = I0 x
  e^(−t/0.9); hazards light up when |dist(player → obj) − r| < 24 px,
  reveal = 1 then fades e^(−t/1.4). Glow = radial-gradient sprite
  pre-rendered once to an offscreen canvas (NEVER shadowBlur in render),
  composite 'lighter'.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily and unlocked on the first pointerdown (latency
  'interactive'), suspend on pause, mute state persisted; whole graph built
  at boot: source → biquad → gain → [dry + delay 0.23 s, feedback 0.35,
  lowpass 1800 Hz] → WaveShaper soft-clip → DynamicsCompressor →
  destination. Master never starts > 0.5.
- Synth table: PING = sine sweep 880 → 180 Hz / 0.35 s + exp decay 0.5 s +
  4 ms square transient; hazard reveal tone f = 200 + 900 x clamp(1 − d/900)
  Hz (spikes = sawtooth, jellyfish = triangle vibrato 5 Hz, mines = square);
  pearl = FM bell (carrier 660, mod ratio 1.5, index 200 → 0 over 0.4 s);
  combo tier-up = 3-note Am pentatonic arpeggio (A C D E G) from 330 x
  multiplier Hz; death = noise burst + saw pitch-drop 220 → 40 Hz / 0.6 s;
  ambient = sine drone 55 Hz + 110 Hz detuned ±0.7 Hz + brown noise lowpass
  400 Hz gain 0.05, endless.
- C2: (1) sound-check every event, no click/pop; (2) RAF stays ≤ 16.6 ms
  with 400 live particles; (3) network panel shows zero requests beyond the
  document; (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: visibilitychange → if hidden: pause the loop, audio.suspend(),
  timestamp it; on visible: one clean resume — never an unfair death during
  a switch; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('abyss-echo', 1, defaults,
  migrate): schema v1 = { bestScore, totalRuns, settings {shake,
  reducedMotion, sound, lang} }. try/catch tolerant to corrupt/cleared
  storage (private mode never crashes); migration hook wired. Never raw
  localStorage.
- Near-miss, enterprise standard: hitbox core = 80% of visual (R_visual
  14 px → R_hit 11.2 px), graze zone 18 → 34 px; enter + exit the graze zone
  with dwell ≥ 80 ms = 1 graze event → combo++, multiplier m = 1 + 0.1 x
  combo (cap 8x); the combo decays to floor(combo/2) after 3.5 s without
  contact. Score = (10 + depthBonus) x m per event; pearl = +50 x m and
  restores ping energy.
- Instant replay: ring buffer 300 samples @120 Hz (Float32Array 300x6:
  player x,y,depth + the 3 nearest hazards) snapshotted into a pre-allocated
  replay array on impact; after ≤ 120 ms, project the last 2.5 s at 0.35x
  slow-mo with a white border — the whole snapshot → start pipeline < 150 ms
  (performance.now delta).
- prefers-reduced-motion: no shake/flash, gameplay intact. Battery/heat:
  lower the particle budget if mean frame time > 15 ms across 60 consecutive
  frames.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free; (2) replay starts < 150 ms after impact;
  (3) profiler shows zero RAF allocations; (4) storage survives a corrupt
  payload; (5) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/abyss-echo/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: 60 s of DevTools performance on a mid-range mobile
   profile — no frame > 16.6 ms in steady state (deliberate hitstop
   excepted).
3. Zero GC in RAF: Performance Monitor heap flat for 60 s; no object/array/
   string literals, no closures, no concat in update/render — pre-allocated
   fields only.
4. One-thumb standard: pointer events, touch-action none, double-tap zoom +
   scroll blocked, input → visual ≤ 1 frame.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Near-miss −20% verified by hand: grazing a spike 4 px visually away →
   survives, combo increments, graze feedback fires.
7. Instant replay starts < 150 ms after impact (code-measured, logged).
8. Tab pause: switching tabs mid-run → audio suspend + freeze; resuming
   restores the exact state, no lost run.
9. Persistence: best + settings survive reload; private mode (storage
   throws) never crashes.
10. Console self-test: C1/C2/C3 all PASS + 'ABYSS-ECHO READY'.
11. Definition of done: /game:qa abyss-echo against
    docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      ABYSS ECHO / WAVE HUNTER
  bootTap       TAP TO START
  tut0          TAP TO PING — HOLD-DRAG TO GLIDE
  tut1          THINGS EXIST ONLY WHERE YOUR ECHO TOUCHES
  tut2          GRAZE THE REVEALED SPIKES — FEED THE COMBO
  scoreCap      SCORE      comboCap COMBO      depthCap DEPTH      bestCap BEST
  pingCap       PING
  grazeCap      GRAZE!
  pearlCap      ECHO PEARL +1
  recordNear    ONLY {n} POINTS FROM YOUR RECORD
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette (vertical gradient by depth): bg #05070f (0 m) → #07142e (1500 m)
  → #0b1f4b (3000 m), vignette rgba(0,0,0,0.45); ping #8bf7ff core / #3ad6e8
  trail; toxic spikes #ff3d7f; ghost jellyfish #b96bff; ancient mines
  #ffb020; echo pearls #ffe08a pulse; player #e8fbff with eyes #7ff9ff.
  Text: system font stack drawn via canvas fillText with cached values (no
  new strings in RAF — number formatting through a lookup digit table).
- Ping energy: start 2, max 3, regen 0.22/s, each ping costs 1 — anti-spam,
  forces rhythm reading; a pearl restores +1.
- Spawn/difficulty: budget B(d) = 6 + 14 x (1 − e^(−d/1800)) hazards per
  screen; < 400 m static spikes only; 400–1200 m adds jellyfish drifting
  sin(ωt) amplitude 26 px; > 1200 m adds mines with a 1.5x hitbox; pearls
  every 2.2 s of travel.
- Collision: circle-circle at the fixed step, squared distances (no sqrt),
  broad-phase column grid by depth.
- State machine: BOOT → MENU → RUN → DYING → REPLAY → GAMEOVER; PAUSE
  overlay anytime (button + visibilitychange).
- Perf budget: no steady-state frame > 16.6 ms @1080p/DPR2 mid-tier; zero
  allocations in the frame path.
```
