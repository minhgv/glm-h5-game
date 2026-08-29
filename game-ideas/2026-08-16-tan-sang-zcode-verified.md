# AFTERGLOW

- **Date:** 2026-08-16 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `afterglow` — target folder `games/afterglow/`
- **Genre:** One-touch arcade score-chaser (kite-fence): carve zigzag arcs with one finger, bait enemies into the light trail behind you — a trail that is both your deadliest weapon and your own fatal flaw.
- **Pitch:** You are the last comet in the void: the glowing trail you leave is the only laser fence that kills the hunters — the bolder you carve, the wider your shining arena grows, but touching your own trail means detonating. Twenty-second runs: die, restart instantly, break the record, repeat.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "TÀN SÁNG: Kẻ Săn Bằng Ánh Sáng".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Afterglow — an H5 arcade score-chaser that meets this repo's
shipping bar: games/afterglow/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: a 20-second addiction cycle — steer the
comet in arcs, lure enemies into your lethal light trail, never touch your own
trail; die → restart ≤ 400 ms → break the record. Commercial-ready: hook
window.Afterglow?.onRunEnd(score) for ad-interstitial/leaderboard SDKs,
settings persistence. Enterprise line: studio-grade juice (hitstop, trauma
shake, pooling, 0-asset synth), full hardening (tab pause, replay, near-miss
fairness), 0 console errors, 0 allocation in RAF. All UI copy in English,
served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. No stubs, no
TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'AFTERGLOW READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/afterglow/ from templates/game-starter/ via /game:new
  afterglow. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: logical 1920×1080, letterbox scale-to-fit, HiDPI canvas.width =
  viewport x min(devicePixelRatio, 2), setTransform once per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback — one
  thumb, continuous steering: pointerdown anywhere = bank left, pointerup =
  bank right (mandatory perpetual carving). Turn rate ω(t) = 3.2 + 0.9·d
  rad/s; speed v(t) = 340 + 220·d px/s, with d = min(1, t/240).
  touch-action: none; desktop QA: hold Space/mouse.
- Trail: ring buffer of points sampled every 22 px of travel, lifetime 4.2 s
  (fading over the last 0.8 s); self-truncates by capacity; self-collision
  considers only segments older than 0.5 s (young segments immune).
- Enemies, 3 types: CHASER (seek 190 + 110·d px/s, steering ≤ 3.5 rad/s);
  DRIFTER (linear 120 px/s, bounces off walls); STRIKER (telegraph blink
  0.6 s, then a 900 px/s dash with the vector locked for 0.5 s). Poisson
  spawner: interval = 1.9 − 1.3·d + jitter ±0.3 s, cap 14 enemies.
- Collision: circle-vs-segment (point-segment distance < r_comet +
  r_trail/enemy); death on touching an enemy body or cutting your own trail.
- SHIELD pickup every 45 s: +1 immunity + 260 px knockback.
- Minimal HUD: score, combo, best.
- All randomness through engine/rng.js createRng(seed) — spawner Poisson
  draws, jitter, telegraph timing. No Math.random() in gameplay code.
- C1: (1) playable 3 minutes straight; (2) fixed-step holds with no stutter;
  (3) input→render ≤ 1 frame; (4) 60 fps desktop.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 pre-allocated (kill burst 24, near-miss 8, death
  160), density scales with combo; 0 new in the loop. Follow
  engine/particles.js pool semantics.
- Juice: trauma shake [0..1] — kill +0.25, near-miss +0.06, death = 1;
  offset = trauma² × 18 px, rotation = trauma² × 0.012 rad, decay 1.6/s.
  Hitstop: 60 ms on kill, 120 ms on death (freezes the accumulator, render
  keeps running).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination. Master never starts > 0.5.
- Synth table (0 assets): trail hum = 2 saws detuned 110/110.5 Hz through a
  400 Hz lowpass at gain 0.05; kill = FM pop, carrier 220→55 Hz exp over
  0.18 s, mod-index 8; near-miss = noise bandpass 1.2 kHz Q8, 0.12 s;
  combo-up = C# minor pentatonic [277.18, 329.63, 369.99, 440.00, 493.88] Hz,
  a 3-note rising arpeggio per tier; death = sine 55→27 Hz over 0.8 s + noise
  burst; combo-break = pitch-down blip 300→150 Hz.
- Render: additive glow via globalCompositeOperation 'lighter'; trail
  gradient 3-stop — core #FFFFFF → #7DF9FF → rgba(125,249,255,0), width
  pulsing with trauma.
- Combo math: window 2.5 s, refreshed per kill; multiplier m = 1 +
  floor(c/4), cap ×6; kill score = 100 × m; near-miss = 25 × m; tiers at
  c ≥ 4 / ≥ 8 / ≥ 12 / ≥ 20 with banner + jingle (see STR: ASSASSIN, HUNTER,
  WARLORD, LEGEND); at combo ≥ 12 the screen border pulses #FFB454.
- C2: (1) audible feedback for 100% of events; (2) shake/hitstop cause no
  motion sickness at defaults, and settings can disable shake; (3) network
  panel shows zero requests beyond the document; (4) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → hidden: full pause +
  audio.suspend(); returning: an 800 ms resume countdown before physics.
- Saves via engine/storage.js createStorage('afterglow', 1, defaults,
  migrate): schema v1 = { best, runs, settings {shake, volume, muted, lang} }.
  try/catch tolerant to corrupt/private-mode storage; migration hook wired.
  Never raw localStorage.
- Near-miss fairness: enemy lethal hitbox shrunk ×0.8; a separate sensor at
  1.35 × radius triggers NEAR MISS +25 × m with a 1 s per-enemy cooldown
  against farming.
- Instant replay ≤ 150 ms: ring buffer of 240 physics snapshots (2 s @ 120 Hz:
  position + angle of every entity); on death, after the 120 ms hitstop, the
  last 1.2 s plays at 0.4× speed — total death→replay delay ≤ 150 ms.
- FPS guard: median over 120 frames; if < 55 → automatically reduce particles
  + drop the glow layer; log a warning.
- Death→restart ≤ 400 ms (tap to retry during the replay).
- Robustness: pointer-lock-exit safe; orientationchange/resize never loses a
  run; double-input ghost inputs filtered.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives
  in STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read
  via t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) replay triggers ≤ 150 ms
  after the collision; (3) storage survives a corrupt payload; (4) profiler
  shows zero RAF allocations; (5) live language switch rebuilds all labels,
  en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/afterglow/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: median ≥ 59, P1 ≥ 55 at 1080p HiDPI, on 2019 mid-range
   Android included.
3. Zero GC in RAF steady state: flat memory monitor over 5 minutes of play;
   every object from pools / reused module-scope variables.
4. One-thumb fully playable: touch-action none, input latency ≤ 1 frame, no
   300 ms click delay, scroll/zoom/double-tap fully blocked.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Tab pause proven: 10 minutes backgrounded causes no unfair death and no
   audio crackle; persistence survives reload.
7. Zero console errors/warnings on Chrome/Safari/Firefox/Edge (latest − 2).
8. Console self-test: C1/C2/C3 all PASS + 'AFTERGLOW READY'.
9. Definition of done: /game:qa afterglow against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         AFTERGLOW
  bootTap       TAP TO START
  tutSteer      HOLD TO BANK LEFT — RELEASE TO BANK RIGHT
  tutTrail      YOUR TRAIL KILLS THEM — NEVER TOUCH IT
  scoreCap      SCORE      comboCap COMBO      bestCap BEST
  shieldCap     SHIELD
  tier1         ASSASSIN      tier2 HUNTER
  tier3         WARLORD      tier4 LEGEND
  newBest       NEW BEST!
  replayCap     REPLAY      replaySkip TAP TO SKIP
  overTap       TAP TO FLY AGAIN
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  setSound      SOUND      setShake SCREEN SHAKE

=== TECHNICAL BLUEPRINT ===
- Palette: radial bg #05060E → #0B1026; comet white; enemy #FF2E88;
  trail/pickup #7DF9FF; combo highlight #FFB454; at combo ≥ 12 the screen
  border pulses #FFB454. System font stack.
- Enemy roster: CHASER — seek 190 + 110·d px/s, steering ≤ 3.5 rad/s;
  DRIFTER — linear 120 px/s, wall bounces; STRIKER — 0.6 s telegraph blink,
  900 px/s dash, vector locked 0.5 s. Poisson spawn interval = 1.9 − 1.3·d
  ± 0.3 s, cap 14.
- Combo ladder: window 2.5 s refreshed per kill; m = 1 + floor(c/4), cap ×6;
  kill = 100 × m; near-miss = 25 × m; tiers ASSASSIN ≥ 4, HUNTER ≥ 8,
  WARLORD ≥ 12, LEGEND ≥ 20 (banner + jingle).
- Shield: spawns every 45 s; grants +1 immunity and a 260 px knockback.
- HUD: score, combo, best — minimal.
- Monetization hook: window.Afterglow?.onRunEnd(score) no-op stub for
  ad-interstitial / leaderboard SDK insertion.
- State machine: BOOT → TITLE → RUN → REPLAY → GAMEOVER (→ RUN); PAUSE
  overlay anytime (button + visibilitychange).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier; 512-particle
  pool + 240-snapshot replay buffer allocated once at boot; batched canvas
  ops, no redundant state changes between draw calls; all tunables in one
  CONFIG object.
```
