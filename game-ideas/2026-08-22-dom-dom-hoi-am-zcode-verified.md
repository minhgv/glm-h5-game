# FIREFLY ECHO

- **Date:** 2026-08-22 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `firefly-echo` — target folder `games/firefly-echo/`
- **Genre:** Echolocation arcade score-chaser — one-thumb flight steered by light-and-sound: the Sonar Ping draws the world, near-miss grazes multiply the score, and the Lumen Combo grows its own pentatonic music.
- **Pitch:** You are a firefly lost in an absolutely dark cave — the world only takes shape when you sing. Steer with your thumb, skim the cliff walls to graze for points and Heat, listen to the pentatonic symphony that builds itself every time your combo tiers up — and die instantly if the darkness wins.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Đom Đóm Hồi Âm".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build FIREFLY ECHO — an H5 arcade score-chaser that meets this repo's
shipping bar: games/firefly-echo/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: TOTAL BLACKNESS → tap → the sonar ripple
DRAWS THE WORLD → the player understands the rules with no tutorial. Dopamine
loop: graze close to walls → chain combo → chime climbs a note → multiplier
rises → play bolder → die → restart < 400 ms → 'one more run'. Commercial-grade
30–120 s sessions. Premium game-feel bar: hitstop, trauma shake, instant
replay; every effect pooled, every sound procedural, every tuning number in one
TUNING object. All UI copy in English, served from an STR i18n table with
reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the game ships
multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'FIREFLY-ECHO READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/firefly-echo/ from templates/game-starter/ via /game:new
  firefly-echo. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 logical (portrait-first), responsive letterbox fit-scale;
  HiDPI: canvas.width = viewport x min(DPR, 2.0); resize handler allocates
  nothing.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  finger position = target point; the firefly trails a damped spring
  a = −k·(p − p_target) − c·v with k = 42 s⁻², c = 9 s⁻¹; WASD fallback for
  desktop QA; input→response ≤ 1 frame. touch-action: none on canvas.
- World: infinitely scrolling cave — left/right walls are the radius function
  R(t), Catmull-Rom-interpolated through control points spaced 240 px apart,
  modulated by seeded 1D value-noise (restartable). Camera scrolls with
  progress + 180 px velocity lookahead.
- Sonar Ping (signature mechanic): tap the ping button area or double-tap to
  emit a wave expanding at 900 px/s; every surface the wavefront crosses lights
  up, then fades by e^(−t/τ) with τ = 0.9 s. Cooldown 0.6 s; each ping spends
  1 Lumen (a bar of 5 pellets; eat motes to refill) → risk/reward rhythm:
  pinging to see costs ammo.
- All randomness through engine/rng.js createRng(seed). No Math.random() in
  gameplay code.
- C1: (1) playable end-to-end; death on wall touch; restart < 400 ms;
  (2) one-thumb smooth, response ≤ 1 frame; (3) 60 fps stable with 1000 demo
  particles; (4) physics stays correct under 6x CPU throttle.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pre-allocated ring buffer of 2048 particles in TypedArrays
  (x, y, vx, vy, life, size, hue) — spawn only writes a slot; NO
  new/closures/array-literals in the hot path. Follow engine/particles.js pool
  semantics.
- Juice: trauma-model shake — shake = trauma², offset = 14 x shake x
  noise2D(t x 35), decay 1.4/s; light hits trauma 0.3, death trauma 1.0.
  Hitstop & slow-mo: graze = timeScale 0.05 for 90 ms; death = 220 ms freeze
  then slow-mo 0.25 ramping back to 1.0 over 800 ms (cubic-out); juice timers
  run on a separate clock so interpolation survives.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state persisted;
  master chain masterGain → WaveShaper soft-clip → DynamicsCompressor →
  destination; music bus → feedback-delay fake reverb (delay 0.23 s,
  feedback 0.35, wet 0.18); one shared 1 s white-noise buffer. Master never
  starts > 0.5.
- Synth set: sonar ping = sine sweep 880 → 220 Hz over 0.5 s, exp-decay
  envelope; ambient = 2 oscillators at 55 Hz detuned ±4 cent through a lowpass
  LFO (the cave's breathing); combo chime = A-minor pentatonic
  [220, 261.63, 293.66, 329.63, 392, 440] Hz, triangle osc, 0.18 s envelope,
  each combo tier steps one note up the scale; near-miss whoosh = the shared
  noise buffer through a bandpass.
- Lumen Combo: motes within ≤ 60 px of a wall are 'graze motes' worth x2;
  combo window 2.0 s; multiplier = 1 + floor(chain/8), cap x12; HUD combo
  heatmap shifts color per tier.
- C2: (1) frame budgets hold — physics ≤ 1.5 ms, particles ≤ 2.5 ms, render
  ≤ 3 ms (over budget → optimize before Iteration 3); (2) network panel shows
  zero requests beyond the document; (3) hitstop/shake do not break
  interpolation; (4) audio unlocks on the first gesture, no click-pop (≥ 5 ms
  attack ramps); (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend; RAF
  idles while hidden; resume with a 3-2-1 countdown plus a 500 ms GET READY
  shield against unfair deaths; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('firefly-echo', 1, defaults,
  migrate): schema v1 = { best, totalRuns, settings {sfx, shake, colorblind,
  lang} }. try/catch tolerant to corrupt/cleared storage (private-mode safe);
  reset button in the menu; migration hook wired. Never raw localStorage.
- Near-miss mastery: fatal hitbox = collision radius x 0.8; graze ring = x 1.6;
  flying inside the graze ring feeds the Heat bar — full Heat triggers PHOENIX
  MODE for 3 s (firefly self-glowing, free pings, x2 score) — the reward for
  reckless mastery.
- Instant replay < 150 ms after death: ring buffer of 180 frames
  (Float32Array) of player + wall state, allocated exactly once at boot;
  on death, 2.2 s playback at 0.5x with vignette + REPLAY tag; tap to restart
  immediately.
- Adaptive quality: measure average FPS every 2 s; below 55 → cut particle
  budget 30% → lower DPR → disable the glow layer (progressive by cost, never
  a visible hitch).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) storage survives a corrupt
  payload; (3) replay starts < 150 ms after death; (4) adaptive-quality steps
  never cause a visible hitch; (5) live language switch rebuilds all labels,
  en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/firefly-echo/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only (canvas vector/gradients +
   WebAudio, system-ui fonts), total payload ≤ 5 MB. Ships README.md (how to
   run, controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked: a 60 s performance capture shows ≥ 99% of frames < 16.7 ms
   on a mid-range machine; no frame > 100 ms even during spawn bursts; frame
   p99 ≤ 20 ms; JS ≤ 8 ms/frame on a mid-range phone.
3. Zero GC in RAF steady state (allocations allowed only at boot/state change).
4. Complete one-thumb play: control zone ≥ 40% of the screen, no UI
   overlapping the thumb zone; touch-action none, response ≤ 1 frame,
   scroll/zoom/double-tap-zoom fully blocked.
5. Cold load → first gameplay ≤ 1.5 s; death → back in play ≤ 400 ms.
6. Audio: unlock on the very first gesture; fully playable while muted;
   envelope attack ≥ 5 ms (no click/pop).
7. Tab switch 10 times in a row: no state loss, no audio zombies, no frame
   drops after return.
8. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
9. Console self-test: C1/C2/C3 all PASS + 'FIREFLY-ECHO READY'.
10. Definition of done: /game:qa firefly-echo against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      FIREFLY / ECHO
  bootTap       TAP TO START
  tut0          SONAR DRAWS THE WORLD — PING TO SEE
  tut1          SKIM THE WALLS — GRAZE FOR SCORE + HEAT
  tut2          EAT MOTES TO REFILL LUMEN
  scoreCap      SCORE      bestCap BEST      chainCap CHAIN
  lumenCap      LUMEN      heatCap HEAT
  phoenixCap    PHOENIX MODE
  grazeCap      GRAZE!
  readyCap      GET READY
  replayCap     REPLAY      replaySkip TAP TO RESTART
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  btnRetry      RETRY       btnMenu MENU       btnShare SHARE
  btnReset      RESET DATA  resetDone DATA RESET
  copied        RESULT COPIED!      copyFail COPY FAILED
  shareHead     FIREFLY ECHO —

=== TECHNICAL BLUEPRINT ===
- Palette: vertical gradient bg #030308 → #0b0b1e → #1a0b2e (cave floor →
  violet rim); firefly #7dffd4 + 3-layer radial glow alpha 0.4/0.15/0.05;
  amber motes #ffb347 → #ffd98a; danger magenta #ff3d6e blinking at 4 Hz;
  sonar wave cyan #9fefff, alpha by e^(−r/λ). Colorblind mode: danger switches
  to a stripe pattern instead of hue-only cues.
- Typography: system-ui; tabular-nums for numbers; score weight 700.
- Physics: no gravity (top-down 2D); quadratic drag v|v| x 0.001; max speed
  640 px/s.
- Difficulty Director: D = 1 + t/45; cave width lerps 560 → 300 px; obstacle
  density = (0.4 + 0.3D) / 100 px; weighted-random pattern mix (straight,
  S-bend, wide chamber, pillar fence) + a 5 s 'rest beat' every 20 s.
- Scoring: distance x1 + motes x50 x multiplier + graze ticks x12; best
  persists via storage; share via navigator.clipboard.
- HUD: score top-left with best; combo/multiplier heatmap top-center; Lumen
  bar and Heat bar along the bottom edge; floating graze captions.
- State machine: BOOT → TITLE → RUN → REPLAY → GAMEOVER → RUN; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: physics ≤ 1.5 ms, particles ≤ 2.5 ms, render ≤ 3 ms
  @1080p/DPR2 mid-tier; batched canvas ops, no redundant state changes between
  draw calls; all tuning constants gathered in one TUNING object at the top of
  src/main.js.
```
