# POLARITY RUSH

- **Date:** 2026-08-23 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `polarity-rush` — target folder `games/polarity-rush/`
- **Genre:** Arcade physics dodger — one-thumb infinite vertical climber, pure-physics guidance hybrid: flip polarity +/- to be PULLED or PUSHED by magnetic nodes, weaving through an endless neon well.
- **Pitch:** You are the only charged orb in a chaotic magnetic well: one tap flips polarity — opposite signs slingshot you in, same signs push you out of danger. The closer you shave death (graze), the harder combos explode, time slows down, and the synth climbs a step with every defiant chain.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "CỰ ĐẢO: POLARITY RUSH".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build POLARITY RUSH — an H5 arcade dodger that meets this repo's
shipping bar: games/polarity-rush/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Ship a COMMERCIAL game at global-portal grade
(Poki/CrazyGames/Yandex Games): load < 2 s on 4G, understandable in < 10 s,
50+ hours of mastery depth, an original IP mechanic (Polarity-Slingshot
Dodger). Enterprise vs amateur line: no pre-made assets, no template tutorial,
every juice effect computed by formula, every tunable number in one CONFIG
table. Internal KPIs: D1 retention ≥ 35%, average session ≥ 4 min, 'one more
run' rate ≥ 3 consecutive runs. Make design decisions autonomously when
information is missing; never stop to ask. All UI copy in English, served from
an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. No stubs, no
TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order; each loop is
BUILD → SELF-VERIFY → GATE; on a failed gate, refactor at the root before
advancing. Self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements. Log 'POLARITY-RUSH READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/polarity-rush/ from templates/game-starter/ via /game:new
  polarity-rush. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: HiDPI canvas, width/height = cssSize x min(devicePixelRatio, 2),
  ctx.setTransform(scale, 0, 0, scale, 0, 0); world units = 1080-height,
  portrait-first, letterbox on desktop.
- Sim: engine/loop.js fixed timestep — accumulator, dt = 1/120 s, maxSubSteps
  4 (accumulator clamp ≤ 0.25 s, surplus discarded, spiral-of-death guarded),
  render(alpha) interpolation between ticks. Entities move in update() only;
  render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  touch drag = horizontal steering (targetX lerp), a short TAP (< 180 ms,
  movement < 12 px) = FLIP POLARITY +/-; mouse + Space as the desktop
  fallback; input→response ≤ 1 frame. touch-action: none on canvas.
- Core loop: an endlessly scrolling well (camera scroll); spawn +/- magnetic
  nodes; the orb feels the Coulomb force of every node within 520 px.
- All randomness through engine/rng.js createRng(seed) — spawn patterns are
  seeded and guaranteed-solvable. No Math.random() in gameplay code.
- C1: (1) 60 s of continuous play; (2) 60 FPS on desktop Chrome; (3) no
  tunneling through nodes (sub-stepping works); (4) polarity forces match the
  physics formula.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 structs pre-allocated at boot (typed-array-style free-list),
  0 particles created at runtime; spawn = slot ownership swap. Follow
  engine/particles.js pool semantics.
- Juice: trauma shake — offset = trauma² x 14 px x noise, decay 1.6/s;
  trauma += 0.25 per graze, 0.5 per close flip, 1.0 on death. Hitstop:
  timeScale 0.05 for 70 ms at the combo milestone (every 16 grazes); death
  freeze 90 ms before slow-mo (juice timers on a separate clock so
  interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination. Master never starts > 0.5.
- Synth table: (a) bg pad = 2 triangles at 55 Hz & 82.5 Hz + a 0.1 Hz LFO
  sweeping a lowpass 200–900 Hz; (b) combo ladder = 2 saws detuned ±7 cent
  through a lowpass 1800 Hz Q = 4, pentatonic A-minor scale [220.00, 261.63,
  293.66, 329.63, 392.00], index = combo%5, +1 octave every 16 combo;
  (c) graze = white-noise buffer looped through a bandpass 2200 Hz Q = 8,
  gain 0.25, decay 80 ms; (d) flip = square 660 → 330 Hz exponential ramp
  70 ms; (e) death = sub sine 110 → 40 Hz over 400 ms + noise burst lowpassed
  at 500 Hz.
- Trail ribbon of 24 segments, additive ('lighter'): cyan #00F0FF at polarity
  +, magenta #FF2E88 at polarity −; color snaps over 120 ms with a flash ring.
- C2: (1) 10 self-playtest runs, 'feel-good' ≥ 7/10; (2) allocation
  instrumentation on RAF shows 0 new objects; (3) network panel shows zero
  requests beyond the document; (4) audio unlocks on the first gesture, no
  click-pop; (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.hidden → full pause (audio.suspend, accumulator
  frozen); resume with a 3-2-1 countdown, then ramp time-scale 0 → 1 over
  600 ms against physics bursts; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('polarity-rush', 1, defaults,
  migrate) (replaces the original versioned key 'cudao.v1'): schema v1 =
  { best, bestCombo, totalRuns, leaderboard (local top-10), settings { audio,
  haptics, lang } }; haptics = navigator.vibrate 15 ms on flip, 40 ms on
  death, when permitted. try/catch every access, tolerant to corrupt/cleared
  storage; migration hook wired. Never raw localStorage.
- Near-miss hitbox −20%: the real collision hitbox = 80% of the hazard's
  displayed radius (visual r = 18 → collide r = 14.4); graze band
  14.4 → 46 px; grazing scores but collision kills → players are ENCOURAGED
  to fly close.
- Instant replay < 150 ms: ring buffer of 180 frames (3 s @ 60 Hz) holding
  {px, py, scroll, nodePos[]}; on death: 0.45x playback with letterbox +
  INSTANT REPLAY tag, measured start latency < 150 ms; the results screen
  only appears after the replay.
- Performance governor: if frame time > 20 ms sustained over 30 frames →
  auto-degrade (trail off, particle budget −50%).
- Anti-GC: no object/array literals, no fresh closures, no string concat, no
  array methods returning new arrays (map/filter/slice) in RAF; heap snapshot
  delta = 0 across 1000 consecutive frames; temp vectors live at module scope
  and are reused; UI text is only rebuilt on a dirty flag.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) 20 consecutive tab switches without time drift; (2) replay plays
  smoothly and starts < 150 ms after death; (3) all save data survives a
  reload and a corrupt payload; (4) governor steps never cause a visible
  hitch; (5) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/polarity-rush/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, zero CDN, procedural assets only, total payload ≤ 5 MB.
   Ships README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: total frame budget (logic + render) ≤ 12 ms on a mid-range
   laptop; ≥ 58 fps worst-case (full node density + surge + replay recording);
   frame p99 ≤ 20 ms; auto-degrade protects the floor.
3. Zero GC in RAF steady state (allocations allowed only at boot/state
   change): heap snapshot delta = 0 over 1000 consecutive frames.
4. One-thumb fully playable (drag steer + tap flip): touch-action none,
   response ≤ 1 frame, scroll/zoom/double-tap-zoom fully blocked.
5. Absolute fairness: seeded spawn patterns, guaranteed-solvable (a path
   ≥ 1.2x hitbox always exists), difficulty ramp by formula, not by spite.
6. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
7. Console self-test: C1/C2/C3 all PASS + 'POLARITY-RUSH READY'.
8. Definition of done: /game:qa polarity-rush against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         POLARITY RUSH
  bootTap       TAP TO START
  tut0          DRAG TO STEER — TAP TO FLIP POLARITY
  tut1          OPPOSITES PULL YOU IN — SAME SIGNS PUSH YOU OUT
  tut2          SHAVE THE HAZARDS — GRAZE FOR COMBO
  scoreCap      SCORE      bestCap BEST      comboCap COMBO
  surgeCap      SURGE
  grazeCap      GRAZE!
  reviveCap     SECOND WIND      reviveAd WATCH AD      reviveKeep KEEP COMBO
  readyCap      GET READY
  replayCap     INSTANT REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  soundOn       SOUND ON    soundOff SOUND OFF
  hapticsCap    HAPTICS
  btnRetry      RETRY       btnMenu MENU
  shareHead     POLARITY RUSH —

=== TECHNICAL BLUEPRINT ===
- Palette: vertical gradient bg #05060F → #0B1030 → #1A0B2E; polarity + cyan
  #00F0FF (glow radius 24 — baked into a sprite at boot, never per-frame
  shadowBlur), polarity − magenta #FF2E88 (glow 24); sparks gold #FFD166;
  hazards red #FF4D4D; UI white #F5F7FF alpha 0.92; radial vignette 0 → 0.55
  black at the edges.
- Physics: F = k·q_player·q_node / max(r², r_min²) with k = 9×10⁴,
  r_min = 42 px (softening against singularities); a = F/m (m = 1); drag
  v x= (1 − 3.2·dt); speed cap |v| ≤ 780 px/s; player r = 14; sub-step when
  |v|·dt > r_collide to prevent tunneling; camera scroll = 140 +
  min(t×3.5, 380) px/s. Opposite-sign nodes attract (slingshot acceleration),
  same-sign repel (a shy escape) — the well-timed flip is ALL the skill.
- Combo system: graze event = +1 combo, +25 x mult score, combo timer refresh
  2.5 s (decays to 0 when it lapses); mult = 1 + floor(combo/8), cap x8;
  polarity streak (consecutive flips without dying) grants +2% speed bonus
  per flip, cap +40% — high risk, high reward; baseline score +10 per second
  alive + 2 x scroll/100 per node passed. Floating text '+25 x4' rendered only
  when dirty (pool of 16 labels reused).
- Difficulty: node density = 6 + floor(t/12), cap 14 nodes on screen;
  pure-red hazard node ratio 12% → 30%; every 45 s an 8 s SURGE: scroll x1.35,
  music +1 octave, background gradient flips colors.
- Quantified juice: hitstop 70 ms (combo milestone), 90 ms (death); trauma
  table as above; graze spark 6 particles per patch, death burst 48;
  chromatic aberration offset 2 px for 120 ms after a flip (2 offset layers
  alpha 0.35).
- Monetization hooks (commercial, non-intrusive): 'SECOND WIND' revive
  1x/run via a rewarded ad or by sacrificing the combo; interstitial after
  run 3, 180 s cooldown; cosmetic trail unlocks at combo milestones (x2, x4,
  x8) — IAP skins later once KPIs prove out.
- HUD: score + best, combo + mult, polarity indicator; state machine
  BOOT → MENU → RUN → REPLAY → DEAD → RUN; PAUSE overlay anytime (button +
  visibilitychange). The template's engine modules cover the
  Engine/Input/Physics/Spawner/Render/Audio/JuiceFX/Replay/Store roles; all
  tunables live in one frozen CONFIG object at the top of src/main.js.
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier; batched
  canvas ops, no redundant state changes between draw calls.
```
