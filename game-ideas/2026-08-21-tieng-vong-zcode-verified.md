# Echo Descent

- **Date:** 2026-08-21 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `echo-descent` — target folder `games/echo-descent/`
- **Genre:** Arcade survival, one-thumb — Sonar-Reveal & Dodge: ping to illuminate a world of absolute darkness, but every echo wakes things that listen; dodge, graze, and dive as deep as you dare.
- **Pitch:** You are a mote of light falling into a bottomless abyss where nothing exists until your sound waves touch it — ping to see, but every ping also leads the hunting serpents straight to you. The addictive loop: the temptation to ping for score versus the fear of being heard; a rhythm of play as steady as breathing.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Tiếng Vọng: Vực Sâu".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Echo Descent — an H5 arcade survival game that meets this repo's
shipping bar: games/echo-descent/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: ping-to-reveal + dodge-to-live — a
one-more-run addiction engine. All UI copy in English, served from an STR i18n
table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the game
ships multi-language-ready. Commercial bar: ready for web portals (Poki /
CrazyGames / YouTube Playables / Google Play Instant); studio-grade game feel
(juice, reactive audio, hitstop, shake); 60 fps locked, zero external assets,
zero GC allocation in RAF; every interaction answers with audio + visual
feedback within ≤ 1 frame; light meta-loop (record, depth milestones, streak);
fully engineered (tab pause, instant replay, offline-first). No images/fonts/
sounds from outside — 100% procedural. No stubs, no TODOs, no scope cuts.

=== CORE GAME ===
- The player is the LIGHT MOTE free-falling down a vertical abyss (portrait).
  Anything beyond a 140 px radius around the Mote is DARKNESS — visible only
  while a sound wave passes over it, then fading out over 1.6 s.
- TAP = emit a ping (an expanding sonar ring); DRAG = steer horizontally with
  a critically-damped spring. The ping reveals hazards and gently pushes them
  away, BUT the LISTENER predator swims toward the exact coordinates you
  pinged → interlocking risk and reward.
- Collect Light Eyes (motes) to refill Ping Oxygen (every ping costs resource;
  ping spam = starving to death); graze the very edge of hazards for
  combo-multiplied points.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order; each iteration
must reach its DoD before the next; on FAIL, fix and re-verify (max 5
remediation cycles per iteration). Log 'ECHO-ABYSS READY' only when FINAL
ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/echo-descent/ from templates/game-starter/ via /game:new
  echo-descent. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1080x1920 logical; HiDPI render buffer = cssSize x
  min(devicePixelRatio, 2); letterbox scale-to-fit;
  ctx.setTransform(dpr·s, 0, 0, dpr·s, ox, oy) once per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120 (dt = 1/120 s), maxSubSteps 4
  (surplus discarded, frameDelta clamp ≤ 250 ms guards spiral-of-death),
  semi-implicit Euler (v += a·dt; x += v·dt), render interpolation with
  alpha = acc/dt. Entities move in update() only; render code never mutates
  state.
- Input: engine/input.js unified pointer/touch + keyboard fallback.
  pointerdown = ping at the finger position; pointermove = targetX; horizontal
  spring a = ω²(xt − x) − 2ωv with ω = 14 rad/s. Fall speed vy = 220 +
  depth·0.035 (cap 560 px/s). touch-action: none on canvas.
- Hazards spawn by depth band; camera follows y.
- All randomness through engine/rng.js createRng(seed). No Math.random() in
  gameplay code.
- C1 (DoD): (1) the full death → restart loop plays end to end on one finger;
  (2) no jitter on 60/120 Hz displays; (3) physics/render separation holds;
  (4) ping reveal + fade timing matches spec (1.6 s).

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 pre-allocated typed arrays (x, y, vx, vy, life, size,
  colorIdx) — new forbidden in the loop. Follow engine/particles.js pool
  semantics.
- Juice: trauma-model screen shake — offset = trauma² x 26 px x noise, decay
  1.6/s. Hitstop 90 ms on a hit, 40 ms on a perfect graze (timeScale = 0 for
  N frames, accurate to ±5 ms; juice timers run on a separate clock so
  interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on the first pointerdown, suspend on pause, mute state
  persisted; master chain masterGain (−6 dB) → DynamicsCompressor →
  destination; master never starts > 0.5. Ping = sine sweep 220 → 880 Hz over
  0.25 s + bandpass noise Q = 8; motes play the C minor pentatonic ladder
  C4 261.63 / D#4 311.13 / F4 349.23 / G4 392.00 / A#4 466.16 — notes climb
  with the combo tier; death = sawtooth 110 Hz + WaveShaper distortion 0.35 s;
  ambience = 2 detuned sines 55 / 55.5 Hz at gain 0.05.
- C2 (DoD): (1) every game event has sound + effect; (2) audio plays only
  after unlock, no click/pop; (3) network panel shows zero requests beyond the
  document; (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: tab blur → full pause + audio.suspend; focus → resume with a
  500 ms grace period; loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('echo-descent', 1, defaults,
  migrate): schema v1 = { best, depthMax, milestones [], settings { mute,
  quality, lang } }. try/catch on every access; migration hook wired. Never
  raw localStorage.
- Near-miss: death hitbox reduced 20% vs the sprite; graze zone = the original
  hitbox + 26 px; leaving the zone safely → +graze.
- Instant replay: ring buffer of 300 frames x 20 Hz (pod + hazards + pings),
  allocated once at boot; on death, replay the last 1.2 s starting within
  < 150 ms (no decoding, no asset re-rendering — just replay recorded state).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3 (DoD): (1) rotating/hiding the tab mid-game loses no state;
  (2) replay runs smooth; (3) grazing feels great in playtesting;
  (4) storage survives a corrupt payload; (5) live language switch rebuilds
  all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/echo-descent/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero runtime
   network requests (DevTools Network = 0 after load), procedural assets only,
   total payload ≤ 5 MB. Ships README.md (how to run, controls, tuning table)
   + GDD.md from docs/game-design-template.md.
2. 60 fps locked @ 1080p HiDPI: frame budget 16.67 ms, render ≤ 6 ms, physics
   ≤ 2 ms; no drop below 55 fps in a 5-minute stress test (dense spawns +
   512-particle bursts).
3. Zero GC allocation in RAF: measured with PerformanceObserver longtask + 2
   heap snapshots before/after 60 s of gameplay → delta object count = 0;
   object/array literals and string concat forbidden in update/render paths.
4. One-thumb fully playable: input → feedback ≤ 1 frame; hitstop accurate to
   ±5 ms; TTI < 1 s; touch-action none, scroll/zoom/double-tap-zoom fully
   blocked.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Console self-test: C1/C2/C3 all PASS + 'ECHO-ABYSS READY'.
7. Definition of done: /game:qa echo-descent against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      ECHO / ABYSS
  bootTap       TAP TO START
  tut0          TAP TO PING — HOLD AND DRAG TO STEER
  tut1          PINGS REVEAL — AND ATTRACT THE LISTENER
  tut2          COLLECT LIGHT EYES — PINGING COSTS OXYGEN
  depthCap      DEPTH      bestCap BEST
  oxyCap        OXYGEN
  insightCap    INSIGHT x{mult}
  grazeCap      GRAZE!
  milestone     {n}m — NEW DEPTH MILESTONE
  replayCap     REPLAY      replaySkip TAP TO SKIP
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  btnRetry      DIVE AGAIN  btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette: bg radial #05070E → #0B1220 with vignette rgba(0,0,0,0.55); Light
  Mote #7DF9E9 with shadowBlur 32 glow; ping ring #9FE8FF alpha 0.9 → 0; Light
  Eyes #FFD166; static hazards #FF5D73; Listener #B388FF; graze flash #FFF3B0;
  UI #E8F1FF; combo bar gradient aqua → violet tracking the multiplier.
- Physics: ping ring r(t) = 40 + 900·t (px/s); hazard knockback 240 px/s
  along the normal for 90 ms; listener homing speed 180 + depth·0.06
  (cap 320), max turn rate 2.2 rad/s; camera vy lerp 0.08.
- Combo: each hazard ping-revealed for the first time grants +1 insight;
  multiplier = 1 + floor(insight/5), cap x8; 4 s without a reveal resets the
  chain; graze +0.5 insight; score = depth·1 + mote·25·(1 + 0.25·mult) +
  graze·40·(1 + 0.25·mult).
- Spawn: hazard density = 0.8 + depth·0.0018 (units per 0.5 s spawn tick);
  listeners appear from depth 800 m with probability 0.12 + depth·0.0001;
  motes spawn in clusters of 3–5, each restoring 18 Ping Oxygen (a ping costs
  25, natural regen 6/s).
- UI: minimal HUD in two corners; 3-second onboarding on first play (tap =
  ping, hold-drag = steer); the death screen centers the replay + best + retry.
- State machine: BOOT → TITLE → RUN → REPLAY → RESULTS → RUN; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: render ≤ 6 ms, physics ≤ 2 ms of the 16.67 ms frame; 55 fps
  floor under stress.
```
