# STAR GARDEN FIREFLIES

- **Date:** 2026-08-18 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (games/star-garden-fireflies/ scaffold instead of a one-file build), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `star-garden-fireflies` — target folder `games/star-garden-fireflies/`
- **Genre:** Arcade/casual one-thumb orbital graze-scorer (dodge-close x edge-graze x fever slow-mo).
- **Pitch:** One finger is the center of the light-orbit: fireflies circle your fingertip while shards of darkness fall on the beat — don't dodge far, shave the danger as close as you dare to chain combos, fill the Halo bar, then burst into a fever slow-mo that flips the whole palette. The closer to death, the brighter you burn.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Đom Đóm Vườn Sao".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build STAR GARDEN FIREFLIES — an H5 arcade/casual game that meets this
repo's shipping bar: games/star-garden-fireflies/ static site scaffolded from
templates/game-starter/ via /game:new star-garden-fireflies, template engines
unmodified, zero build step, zero runtime network. Core loop: graze IS the
game — safe dodging scores 0; shaving the edge of danger scores points,
combo and heat; a full Halo bar flips the world into fever slow-mo. Design
pillars: (P1) graze is the gameplay; (P2) one finger, total control — the
finger is the lantern the fireflies orbit, a quick tap reverses the orbit,
no UI buttons during play; (P3) everything responds — synth sound, shake,
hitstop, palette flip. All UI copy in English, served from an STR i18n table
with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the game
ships multi-language-ready. Studio quality: no test placeholders, every pixel
and sound designed. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order, each passing
its self-audit before the next (on FAIL, fix and re-audit). Log
'STAR-GARDEN-FIREFLIES READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/star-garden-fireflies/ from templates/game-starter/ via
  /game:new star-garden-fireflies. Plain ES modules + <script
  type="module">, served over http:// only. Games never import from outside
  their folder; engine/ modules stay unmodified.
- Stage: Canvas 2D, CSS full-viewport; canvas.width = cssW x dpr (cap 2);
  ctx.setTransform(dpr,0,0,dpr,0,0); design scale s = min(w,h)/1080 — every
  constant below is scaled by s (design-px @1080).
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation; loop.js
  stall clamp guards RAF delta spikes (50 ms clamp for tab switches).
  Entities move in update() only.
- Background: vertical gradient cached on one offscreen canvas (redrawn only
  on resize): #0B1026 → #162447 → #1A405F + vignette rgba(0,0,0,0.45); 140
  pre-generated stars twinkle via sin(t·f+φ) — no per-frame random.
- Input: engine/input.js unified pointer/touch — 1 finger only
  (touch-action: none, preventDefault, no scroll/zoom); quick tap = reverse
  orbit + boost. Keyboard fallback for desktop QA.
- Physics (fixed formulas): orbit θ(t) = θ + ω·dt with ω = sgn x
  (2.6 + 1.6 x e^(−t_tap/0.45)) rad/s (a tap flips sgn and resets t_tap);
  orbit radius R = 92 design-px. The lantern center follows the finger via a
  critically-damped spring a = k·(p_target − p) − c·v with k = 180 s⁻²,
  c = 2·√k ≈ 26.83 s⁻¹.
- Shards: fall straight + pattern modifiers, speed v = (220 + 14·D) px/s with
  D = floor(t/30); spawn interval T = max(0.32, 1.15·e^(−0.055·D)).
- Pattern director: deterministic via engine/rng.js createRng(seed); the
  daily seed = floor(Date.now()/864e5) feeds the 'Daily Garden'; alternates
  [natural rain, wall gap (gap 2.6·R), pendulum arcs, light-chasing drifters
  (steer 40 px/s², 6 s life)]. No Math.random() in gameplay code.
- Hitbox: comet = 0.80 x visual (enterprise near-miss standard); graze band
  = hitbox + 26 px; a graze counts when d ∈ (hitR, grazeR]; each shard can be
  grazed once (flag).
- C1: (1) 120 s of play with zero console errors; (2) the delta clamp holds
  under tab throttling; (3) death + restart < 1 s.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pre-allocated pools — particles 2048 (live cap 1200), shards
  256, floating-text 64 — free-list reuse, follow engine/particles.js pool
  semantics; NO map/filter/forEach/closure/string-concat in RAF; temp
  vectors module-scope; score text repaints only on value change. Effects:
  comet trail 90/s, graze sparks 12, death burst 180.
- Juice: trauma shake — offset = trauma² x 14 px, decay 1.8/s; graze +0.12,
  milestone +0.3, death +1. Hitstop: milestone combo 70 ms, death 130 ms
  (timeScale = 0, render continues).
- Combo (Close Chain) & scoring: +1 per graze, window 2.5 s (reset when it
  lapses); death/hit resets. Score per graze = 50 x (1 + 0.1 x min(combo,50))
  x (fever ? 2 : 1). Stardust pickup = 25 x multiplier (spawns on 1 of every
  6 shards). Milestones 10/25/50/100: synth stab + trauma 0.3 + screen-rim
  pulse. Halo (fever): heat +8 per graze, decay 3/s; at 100 → fever 6 s,
  timeScale 0.55, palette swap, multiplier x2, ends naturally.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on the first pointerdown (unlock = resume + lazy node
  build), suspend on pause, mute state persisted; master chain masterGain →
  WaveShaper soft-clip → DynamicsCompressor (threshold −18 dB, ratio 4) →
  destination; all envelopes via setTargetAtTime (no closures). Master never
  starts > 0.5.
- Synth table: graze = triangle, f0 = 660 x 2^(min(combo,24)/12) Hz, sweep
  x1.5 over 80 ms, gain 0.18 — pitch rises with combo, the addictive
  feedback loop; tap reverse = square 220 → 180 Hz, 60 ms, lowpass 800 Hz;
  stardust = sine arpeggio C5 523.25 → E5 659.25 → G5 783.99 Hz, 45 ms/note;
  milestone = 2 saws detuned ±7 cent at 110 & 165 Hz, 150 ms; fever enter =
  saw rise 110 → 220 Hz, 300 ms + shimmer LFO 6 Hz on the filter; death =
  white-noise buffer 180 ms + saw fall 330 → 55 Hz, 400 ms; ambient = 2
  detuned triangles (110 & 110.55 Hz) → lowpass 400 Hz, gain 0.05, LFO
  0.1 Hz.
- C2: (1) every pillar event answers with ≥ 2 senses (hearing + sight);
  (2) audio never clicks/pops (attack ≥ 5 ms); (3) network panel shows zero
  requests beyond the document; (4) tests/audio-contract.mjs passes;
  (5) 60 fps with full juice.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause + audio.suspend when
  hidden; resume with a 3-2-1 countdown; loop.js stall clamp guards time
  jumps.
- Saves via engine/storage.js createStorage('star-garden-fireflies', 1,
  defaults, migrate): schema v1 = { best, totalGraze, settings {sfx,
  reducedMotion, lang}, dailySeed }. try/catch tolerant to corrupt/cleared
  storage (JSON parse fail → defaults); migration hook wired. Never raw
  localStorage.
- Instant replay: ring buffer of snapshots at 20 Hz x 5 s
  {cx,cy,θ,shard-ids,x,y}; after death visible in < 150 ms, playback at 0.5x
  with a 'CLOSE!' marker at every graze.
- Debug overlay (type 'debug'): draws hitboxes, graze band, FPS, heap.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) measured replay latency < 150 ms; (2) kill the app mid-run → best
  survives; (3) pause/resume glitch-free; (4) storage survives a corrupt
  payload; (5) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/star-garden-fireflies/ runs as a plain static
   site (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests, procedural assets only, total payload ≤ 5 MB.
   Ships README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps stable on mid-range Chrome Android; jank frames < 1% per 10 s
   (Performance panel).
3. Zero GC in RAF steady state: zero allocations across 10 s of continuous
   play.
4. Exactly one pointer; no blocking UI; the whole screen is the (44 px+)
   touch target; touch-action none, scroll/zoom/double-tap-zoom blocked,
   response ≤ 1 frame.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Tab switch ≥ 3 s → pause + audio suspend; resume has a countdown; no
   time-jump.
7. Hitbox = 0.80 x visual + graze band +26 px, verified via the debug
   overlay.
8. Replay renders < 150 ms after death (measured and logged).
9. Fever/combo/milestone match the blueprint formulas; RNG deterministic by
   the daily seed.
10. Console self-test: C1/C2/C3 all PASS + 'STAR-GARDEN-FIREFLIES READY'.
11. Definition of done: /game:qa star-garden-fireflies against
    docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         STAR GARDEN FIREFLIES
  bootTap       TAP TO START
  tut0          YOUR FINGER IS THE LANTERN — THEY ORBIT YOU
  tut1          TAP TO REVERSE THE ORBIT
  tut2          SHAVE THE SHARDS — HIDING SCORES NOTHING
  scoreCap      SCORE      comboCap CHAIN      bestCap BEST
  heatCap       HALO
  feverCap      HALO FEVER!
  grazeCap      GRAZE!
  dailyCap      DAILY GARDEN
  replayCap     REPLAY
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette (2 modes, swapped in a 250 ms lerp) — Normal: comet core #FFF7D6,
  trail 3-stop #FFD166 → #EF476F → #7B2CBF; shard #232946 rim #8B8BAA; UI
  #E0E1DD. Fever: bg #2B0A3D → #6A0DAD, trail #00F5D4 → #00BBF9 → #F15BB5,
  shard rim #4CC9F0, heat ring #F15BB5.
- Background: cached vertical gradient #0B1026 → #162447 → #1A405F + vignette
  rgba(0,0,0,0.45); 140 pre-generated twinkling stars.
- Difficulty/pattern director: shard speed (220 + 14·D) px/s, spawn interval
  max(0.32, 1.15·e^(−0.055·D)) s; patterns = natural rain, wall gap (2.6·R),
  pendulum arcs, drifters (steer 40 px/s², 6 s life).
- HUD: score, chain, HALO heat bar, fever state — no buttons during play;
  hold anywhere = move, tap = reverse.
- Scope guard: no online leaderboard, no multi-finger modes, no image
  sprites, no external libraries, no WebGL — the STR i18n table is part of
  the repo standard and ships with the game.
- State machine: BOOT → MENU → COUNTDOWN → RUN → REPLAY → RESULT; PAUSE
  overlay anytime (button + visibilitychange).
- Perf budget: 60 fps, sim + draw inside 16.6 ms @1080 design/DPR2 mid-tier;
  zero allocations in the frame path.
```
