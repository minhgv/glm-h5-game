# THUNDER RELAY

- **Date:** 2026-08-17 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (games/thunder-relay/ scaffold instead of a one-file build), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `thunder-relay` — target folder `games/thunder-relay/`
- **Genre:** Arcade one-thumb orbit-slingshot — push-your-luck chain runner.
- **Pitch:** You are a lightning bolt routing charge between storm clouds: hold to latch onto an orbit and charge up, release to fling off along the tangent. The more full loops you bank before letting go, the bigger the multiplier — but the cloud ring keeps shrinking. One more loop, or bail now?
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "TRUYỀN SẤM".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build THUNDER RELAY — an H5 arcade one-thumb game that meets this
repo's shipping bar: games/thunder-relay/ static site scaffolded from
templates/game-starter/ via /game:new thunder-relay, template engines
unmodified, zero build step, zero runtime network. Core loop: orbit-slingshot
push-your-luck — latch an orbit around a storm cloud, spin to charge the
multiplier, fling tangentially before the shrinking ring kills you. All UI
copy in English, served from an STR i18n table with reserved 'vi'/'lo' slots
(pattern: games/gravity-juggle) so the game ships multi-language-ready.
Commercial hooks: rules understood in the first 3 s, sessions 60–180 s, deaths
always player-error (never engine-error), rewarded-ad-continue and skin slots
ready for later. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max
5 fix cycles per iteration). Log 'THUNDER-RELAY READY' only when FINAL
ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/thunder-relay/ from templates/game-starter/ via /game:new
  thunder-relay. Plain ES modules + <script type="module">, served over
  http:// only. Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1920x1080 logical, responsive letterbox; HiDPI: canvas.width =
  cssSize x dpr, ctx.setTransform(dpr,0,0,dpr,0,0) once per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), semi-implicit Euler, render(alpha)
  interpolation. Entities move in update() only; render code never mutates
  state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One thumb:
  press = latch onto the nearest cloud within snap radius 260 px → enter
  orbit; release = fling along the tangent vector. Desktop mouse fallback.
  Handle on pointerdown, never wait for pointerup. touch-action: none on
  canvas.
- Camera: infinite vertical scroll (the bolt climbs); clouds spawn
  procedurally via engine/rng.js createRng(seed) with a difficulty ramp by
  score. No Math.random() in gameplay code.
- Run loop: death → results → tap to restart < 400 ms, no page reload.
- C1: (1) hold-release smooth at 60 fps; (2) launch angle exactly tangent
  (verified with a debug vector); (3) deaths only from real collisions.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 pre-allocated slots (fixed array + free-list, no
  new/literals in frame) — follow engine/particles.js pool semantics. The
  bolt is drawn as a procedural zigzag polyline regenerated every 40 ms.
- Juice: trauma-model screen shake — offset = maxAmp x trauma², decay 2.2/s,
  max 14 px. Hitstop 70–90 ms on near-miss and on fatal impact. Trail
  gradient for the bolt, fake bloom via globalCompositeOperation 'lighter'.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination (compressor on the master bus). One
  shared 1.2 s white-noise buffer for thunder. Master never starts > 0.5.
- Synth table: thunder = 1.2 s noise buffer through a lowpass sweep
  200 → 60 Hz + exp gain decay 0.9 s + sine sub 40 → 30 Hz; orbit tick =
  pentatonic [0,2,5,7,10] semitones over A3 (f = 220 x 2^(st/12)), +1 step
  per completed loop, resonant filter Q rising with the multiplier; death =
  sawtooth 110 Hz pitch-down 0.4 s + noise burst; UI click = square 660 Hz
  30 ms; backing tempo 100 → 140 BPM with the multiplier.
- C2: (1) no digital click/pop at buffer boundaries; (2) juice never pushes
  frame time past 16.9 ms; (3) network panel shows zero requests beyond the
  document; (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend; resume
  resets the accumulator first (no delta-jump); loop.js stall clamp guards
  time jumps.
- Saves via engine/storage.js createStorage('thunder-relay', 1, defaults,
  migrate): schema v1 = { best, runs, settings {muted, lang} }. try/catch
  tolerant to corrupt/cleared storage (private mode must never crash);
  migration hook wired. Never raw localStorage.
- Near-miss: lethal hitbox shrunk 20% vs the drawn shape; the 100–125% ring
  band triggers CLOSE: +points x multiplier, light hitstop, 0.3 s slow-mo
  (timeScale 0.45 → 1 eased).
- Instant replay: ring buffer 10 snapshots/s x 3 s of positions + states; on
  death rebuild the final 1.5 s as a fading ghost before the results screen;
  death → replay visible < 150 ms.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth (pool + pre-allocated Float32Array/Int32Array only).
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) replay visible < 150 ms after
  death; (3) profiler shows zero RAF allocations; (4) storage survives a
  corrupt payload; (5) live language switch rebuilds all labels, en table
  complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/thunder-relay/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests, procedural assets only, total payload ≤ 5 MB.
   Ships README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked on commodity hardware: frame p95 < 16.9 ms, no long task
   > 50 ms during gameplay.
3. Zero GC in RAF steady state (allocations allowed only at boot/state
   change).
4. Input: handled on pointerdown (never waiting for pointerup), touch →
   visual response < 50 ms; touch-action none, scroll/zoom/double-tap-zoom
   fully blocked.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Stability: no memory leak across 10 restarts (flat heap); audio respects
   autoplay policy (silent until gesture, mute works, no crash when blocked).
7. Console self-test: C1/C2/C3 all PASS + 'THUNDER-RELAY READY'.
8. Definition of done: /game:qa thunder-relay against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         THUNDER RELAY
  bootTap       TAP TO START
  tut0          HOLD TO LATCH AN ORBIT — RELEASE TO SLING
  tut1          MORE LOOPS = MORE CHARGE — DON'T OVERSTAY
  tut2          THE RING SHRINKS — BAIL IN TIME
  scoreCap      SCORE      multCap xMULT      bestCap BEST
  closeCap      CLOSE!
  chargeCap     CHARGE
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette, storm-dusk: vertical bg #050510 → #0B1026 → #141B3C + purple
  nebula radial #2B1055 alpha 0.25; safe clouds gradient #7DE2FF → #3B82F6
  with a cold-white rim; hazard clouds #FF4D6D → #C9184A; bolt core #FFFFFF
  wrapped in #FFF7C2 → #FFD60A; near-miss ring #B14DED; UI text #E8F1FF.
- Flight formulas: free velocity 540 px/s (world-units on the 1080 height);
  on latch switch to polar coords, radius shrinks r(t) = r0 x
  max(0.62, 1 − 0.14t); angular velocity ω = 2.6 x 1.35^completedLoops rad/s
  (each full loop spins faster — the charging feel); fling: v = tangent x
  (620 + 180 x completedLoops) px/s; horizontal wind drift = 24 x
  sin(t x 0.7 + cloudSeed).
- Combo system: latching a new cloud +1 streak; multiplier = 1 + 0.25 x
  streak, cap 8x; completed loops before release set the charge tier x1–x4
  multiplying that fling's score; touching a hazard or losing altitude resets
  the streak; each near-miss +2 base points x multiplier.
- Spawning: cloud spacing 380–560 px vertical, lateral offset ±320 px clamped
  to the playfield; hazard-cloud ratio 0.18 → 0.42 with score; lightning rods
  (instant death, placed between two clouds) from score 300; a solver
  guarantees ≥ 1 survivable path before locking a layout.
- HUD/state: FSM BOOT → MENU → COUNTDOWN → RUN → REPLAY → RESULT; PAUSE
  overlay anytime (button + visibilitychange); multiplier and charge tier
  always readable as color + number.
- Perf budget: frame p95 < 16.9 ms @1080p/DPR2 mid-tier; zero allocations in
  the frame path.
```
