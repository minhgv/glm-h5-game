# TETHER RUSH

- **Date:** 2026-08-19 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (games/tether-rush/ scaffold instead of a one-file build), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `tether-rush` — target folder `games/tether-rush/`
- **Genre:** H5 arcade/casual one-touch — orbital tether-sling endless flow runner: hold to anchor the comet to a light pillar and swing its circular orbit, release to fling tangentially; graze near-misses to feed the combo.
- **Pitch:** One finger, one breath: hold to anchor, fling to live. The tether heats up and BURNS after 2.4 s, forcing a constant sling–anchor–sling flow — graze the asteroids for combo before the whole star field caves in.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Vút Dây Sao Băng (Tether Rush)".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build TETHER RUSH — an H5 arcade one-touch game that meets this repo's
shipping bar: games/tether-rush/ static site scaffolded from
templates/game-starter/ via /game:new tether-rush, template engines
unmodified, zero build step, zero runtime network. Core loop: hold → anchor
the comet to the nearest light pillar → swing the circular orbit (verlet +
rigid constraint) → release → fling tangentially → repeat across a
procedural meteor field. The twist: the tether accumulates heat and BURNS
after 2.4 s of holding, forcing a constant sling–anchor flow state, with a
graze near-miss system feeding an arcade-cabinet combo. Commercial targets:
sessions 30–90 s/run, one-tap restart < 400 ms, automatic death replay,
best-score persistence, full juice (particles, shake, hitstop, procedural
audio). All UI copy in English, served from an STR i18n table with reserved
'vi'/'lo' slots (pattern: games/gravity-juggle) so the game ships
multi-language-ready. Verify gates, pooled zero-GC architecture,
pause/replay/persistence: what separates this from amateur work. No stubs,
no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order; at the end of
EACH iteration self-verify against that iteration's gate — on FAIL, fix and
repeat that iteration (max 3 times) before advancing. Log 'TETHER-RUSH
READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/tether-rush/ from templates/game-starter/ via /game:new
  tether-rush. Plain ES modules + <script type="module">, served over
  http:// only. Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: Canvas 2D render, 1080p HiDPI (scale by devicePixelRatio, clamp
  ≤ 2), letterbox fit.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation between
  the last two steps. Entities move in update() only; render code never
  mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback:
  pointerdown = anchor to the nearest pillar within 320 px; pointerup =
  release; mouse + Spacebar supported. touch-action: none on canvas.
- Verlet physics: pNew = 2p − pPrev + g·dt² with g = (0, 1400) px/s²; while
  anchored, rigid constraint projection p = anchor + L x (p − anchor)/
  |p − anchor| (L = rope length at anchor time); release velocity
  v = (p − pPrev)/dt; damping 0.9995/step in free flight. Camera follows
  the comet + horizontal world scroll.
- Procedural world: anchor pillars 260–420 px apart with height offsets
  ±180 px; 10% are amber whip pillars (L shrinks 20%/loop → +30% release
  velocity); stardust (+points), asteroids (death). All spawning randomness
  through engine/rng.js createRng(seed); difficulty ramps with run time. No
  Math.random() in gameplay code.
- C1: (1) swing/fling exits exactly along the tangent; (2) death only on
  asteroid impact (hitbox = 80% radius); (3) 60 fps without jank;
  (4) restart < 400 ms.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 preallocated (struct-of-arrays + free-list, zero closures,
  zero object literals in the loop) — follow engine/particles.js pool
  semantics; gradient trail ribbon for the comet.
- Juice: trauma shake — shake = trauma², offset = shake x maxOffset x
  perlin-noise, decay 1.6/s; +0.3 on graze, +0.55 on death. Hitstop:
  timeScale = 0 for 70 ms on anchor catch and on explosion.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily and unlocked on the first pointerdown, suspend on pause,
  mute state persisted; chain osc/noise → filter → gain → WaveShaper
  soft-clip → DynamicsCompressor → destination. Master never starts > 0.5.
- Synth table: anchor = sine pluck 220 → 330 Hz / 90 ms; release = noise +
  bandpass sweep 300 → 3500 Hz / 180 ms; stardust = A-minor pentatonic
  {220, 261.63, 293.66, 329.63, 392, 440} Hz, pitch = base x
  2^((combo mod 12)/12); graze = 55 Hz sub + shimmer; explosion = noise
  lowpass 800 Hz decay 400 ms; drone bed = 2 saws detuned 55/55.5 Hz, lowpass
  opening 220 → 880 Hz with combo. Every envelope via setTargetAtTime (no
  clicks); compressor threshold −18 dB, ratio 4:1.
- C2: (1) no audio glitch/click; (2) juice reads clearly; (3) the
  performance trace shows no allocation spikes; (4) network panel shows
  zero requests beyond the document; (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: auto-pause when the tab hides + audio.suspend; resume with a
  3-2-1 countdown; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('tether-rush', 1, defaults,
  migrate): schema v1 = { best, totalRuns, settings {sfx, music, shake,
  lang} }. Restored on reload; try/catch tolerant to corrupt/cleared
  storage; migration hook wired. Never raw localStorage.
- Near-miss, formal rule: collision hitbox = 80% of the asteroid radius
  (−20%); graze ring = 135% radius — passing through within < 300 ms
  without touching the hitbox → +graze.
- Instant replay: Float32Array ring buffer at 60 Hz x 3 s (x, y, angle,
  heat) of the main entities; auto-replays at 0.5x on death; replay starts
  < 150 ms after impact; REPLAY label shown, ghost alpha 0.6.
- Session guard: the first 10 s of any run are unkillable; a "one tap to
  play again" prompt is always offered.
- Anti-GC: no string concat, no array/object literals, no closures, no DOM
  access in the hot loop — module-scope temp vectors, particle pool,
  preallocated ring buffers; verify via Chrome memory sampling over 60 s:
  zero steady-state heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) tab-switch/kill/reload keeps state intact; (2) replay smooth;
  (3) graze scores exactly per the rule; (4) pause/resume glitch-free;
  (5) storage survives a corrupt payload; (6) live language switch rebuilds
  all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/tether-rush/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: fixed-step 120 Hz physics + render interpolation; dev FPS
   meter (F key); no frame spikes on mid hardware.
3. Zero GC in RAF steady state (allocations allowed only at boot/state
   change).
4. One-thumb mobile: viewport meta, scroll/zoom/double-tap-zoom blocked,
   safe-area insets respected, touch + mouse + Spacebar, response ≤ 1 frame.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Session loop: new players die within 30–90 s, strong players last
   > 3 min; the first 10 s are unkillable; restart is always one tap
   (< 400 ms).
7. Console self-test: C1/C2/C3 all PASS + 'TETHER-RUSH READY'.
8. Definition of done: /game:qa tether-rush against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         TETHER RUSH
  bootTap       TAP TO START
  tut0          HOLD TO ANCHOR — RELEASE TO SLING
  tut1          THE TETHER BURNS AFTER 2.4s — KEEP MOVING
  tut2          GRAZE THE ASTEROIDS — CHAIN THE COMBO
  scoreCap      SCORE      comboCap COMBO      bestCap BEST
  grazeCap      GRAZE!
  heatCap       TETHER HEAT
  flowCap       FLOW STATE!
  againCap      ONE TAP TO PLAY AGAIN
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: vertical gradient bg #05060F → #0B1026 → #141B3C + 3-layer
  parallax stars (alpha 0.35/0.55/0.85); comet core #FFFFFF, trail gradient
  cyan #22D3EE → magenta #F472B6; anchor pillars #22D3EE, whip pillars
  #FBBF24; tether gradient by heat: #22D3EE (cold) → #FBBF24 (60% heat) →
  #FB7185 (about to burn); stardust #FDE68A; asteroid fill #33406B rim
  #94A3B8; UI monospace system font, HUD white alpha 0.9.
- Physics: verlet pNew = 2p − pPrev + g·dt², dt = 1/120 s, g = (0, 1400)
  px/s²; circular constraint projection radius L around the anchor;
  heat += dt/2.4 while anchored; at full heat auto-release + a 0.8 s anchor
  cooldown; world scroll 220 → 520 px/s by difficulty; difficulty =
  exp(t/45) scaling asteroid spawns.
- Combo system: stardust +1 combo, graze +2; combo decays to 0 after 2.5 s
  without a gain; multiplier m = 1 + floor(combo/8), cap x12; points =
  base x m; FLOW STATE at combo ≥ 40: stardust magnet radius +40%, screen
  rim glow #22D3EE alpha 0.25, drone opens full cutoff + an extra arpeggio
  layer.
- State machine: BOOT → MENU → RUN → REPLAY → GAMEOVER → RUN; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: no frame spikes @1080p/DPR2 mid-tier; game code compact and
  readable (section-banner comments, no minification — the repo ships plain
  source).
```
