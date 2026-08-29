# GRAVITY JUGGLE

- **Date:** 2026-08-28 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `gravity-juggle` — target folder `games/gravity-juggle/` (ships in the repo under this name)
- **Genre:** Arcade one-thumb orbital slingshot climber — hold to latch a planet orbit, release to fling tangentially, graze asteroids to feed the combo (a score-chasing flow game).
- **Pitch:** You are a comet seed climbing a wind-shear corridor with one finger: hold to hook an orbit around a planet — but the orbit spirals inward toward the deadly core, so you can never camp. Release on the golden boost-arc to get hurled ahead with acceleration. The bolder you graze asteroids, the hotter the combo burns; one careless beat and you shatter into a meteor shower. One finger, one breath, one endless bounce chain.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Tung Hứng Lực Hấp Dẫn (Gravity Juggle)".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build GRAVITY JUGGLE — an H5 one-thumb orbital slingshot climber that
meets this repo's shipping bar: games/gravity-juggle/ static site scaffolded
from templates/game-starter/ via /game:new, template engines unmodified, zero
build step, zero runtime network. Commercial tier (Voodoo/Ketchapp): 60 FPS
locked on 2019 mid-range Android, zero-GC in the game loop, 100% WebAudio
synth music/SFX (0 external assets), full professional juice (hitstop, screen
shake, instant replay, meta-progression, data-driven pacing), deterministic
runs, step-by-step self-audited QA checklists, absolutely clean console. The
player is a comet seed flying up a vertical 1080x1920 corridor full of
planets and drifting asteroids: HOLD = latch into a candidate planet's
gravity well and orbit — the orbit contracts toward the deadly core; RELEASE
= fling along the tangent; releasing inside the golden boost-arc = PERFECT
(+28% speed). Grazing asteroids without touching grows the combo. One finger,
one hold-release rhythm. All UI copy in English, served from an STR i18n
table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the
game ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP (mandatory): each iteration = PLAN → CODE →
SELF-AUDIT against its own checklist → name the BIGGEST FLAW remaining → fix
it inside that same iteration. Advance only at 100% checklist pass. No "fix
later". After iteration 3, self-grade all of A1–A12 with measurements. Log
'GRAVITYJUGGLE READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/gravity-juggle/ from templates/game-starter/ via /game:new
  gravity-juggle. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: 1080x1920 logical; HiDPI: canvas.width = 1080 x min(DPR, 2),
  setTransform scale; letterbox keeps 9:16 safe on every screen; context
  { alpha: false, desynchronized: true }.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), semi-implicit Euler; render(alpha)
  interpolation between prev/cur state (every entity stores prevX/prevY/
  prevRot). Entities move in update() only.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  pointerdown anywhere = latch the candidate planet (within a ±60° upward
  capture cone, dist < 560 px; a dotted guide-line shows while a candidate
  exists); pointerup = release. touch-action: none, preventDefault, no
  swipe/drag. Desktop QA: Space key.
- Physics: FREE: v += wind·dt; v *= exp(−0.15·dt); p += v·dt. LATCHED:
  r0 = clamp(dist, R+26, R+140); omega0 = cross(d, v)/dist² (sign preserved);
  clamp |omega0| ≥ 1.8 rad/s; every tick: omega += (260/r)·dt (gravity
  assist), r −= 34·dt (the orbit contracts), theta += omega·dt,
  p = planet + r·(cos, sin). RELEASE: v = omega·r along the tangent; theta
  inside the 26° boost-arc (randomized each latch) = PERFECT: |v| x= 1.28,
  snapped to the exact tangent.
- Collision: hurtbox = 0.8 x visual radius; death on touching a planet core
  (r_core = 0.42R), asteroid circle-circle, or dropping below camera bottom
  + 160 px. Soft walls x ∈ [60, 1020], restitution 0.6.
- Camera pogo: ascends only, y = min(y, player.y − 672); altitude =
  maxAlt/10 (m) is the base score.
- Deterministic layout: engine/rng.js createRng(seed); daily-seed mode for
  fair leaderboards. No Math.random() in gameplay code.
- State machine: BOOT → MENU → TUTORIAL (runs once, 3 swipes with arrow
  guides) → RUN → REPLAY → RESULTS → RUN/MENU; 180 ms fades.
- C1: (1) renders correctly on DPR 1/2/3; (2) 60 s climb smooth;
  (3) tab lag never changes physics outcomes (accumulator clamp);
  (4) re-seed → identical layout.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512 preallocated objects + free-list; 4 types: trail, spark,
  shatter, ring; spawns borrow from the pool — no closures, no new in the
  loop. Follow engine/particles.js pool semantics.
- Juice: screen shake trauma ∈ [0,1]; offset = trauma² x 14 px x noise, decay
  1.6/s; graze +0.15, perfect +0.25, crash +1.0 with a collision-direction
  bias. Hitstop (timeScale = 0): first graze of a chain 20 ms, perfect 45 ms,
  crash 180 ms before shatter + replay.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), unlock at
  the first pointerdown (resume AudioContext); chain masterGain → soft-clip
  WaveShaper → DynamicsCompressor → destination; frequency table in
  BLUEPRINT item 5; music pad scheduler setInterval 25 ms, lookahead 120 ms;
  suspend on pause, mute persisted. Master never starts > 0.5.
- Comet juice: 3-layer alpha trail; core pulses with |omega|; perfect = ring
  shockwave + #FFE066 flash; crash = 90-piece shatter.
- C2: (1) heap flat when spamming particles for 60 s; (2) every SFX fires on
  its event; (3) no autoplay-policy violations; (4) JS budget ≤ 8 ms/frame;
  (5) zero network requests beyond the document; (6) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: visibilitychange + pagehide → cancelAnimationFrame,
  audio.suspend(), RESUME overlay requires a tap (3-2-1 countdown, no
  auto-resume); the RAF runs only while visible; loop.js stall clamp guards
  time jumps.
- Saves via engine/storage.js createStorage('gravity-juggle', 1, defaults,
  migrate): schema v1 = { bestScore, bestAlt, totalRuns, skins, muted,
  tutorialDone, lang }. try/catch + merge-with-defaults against corruption;
  write throttle 2 s + flush on pagehide. Never raw localStorage.
- Near-miss: hurtbox 0.8 x visual (from I1); graze band = asteroidR + 26 px,
  once per asteroid per 700 ms → +combo + spark + whoosh; a debug overlay
  (3-finger tap) draws real vs visual hitboxes to certify A11.
- Instant replay < 150 ms: Float32Array ring buffer x 6 fields (px, py, rot,
  camY, anchorIdx, tension), 30 Hz x 75 frames = 2.5 s; on crash the first
  replay frame renders within the same hitstop tick (synchronized) — measure
  with performance.now() from impact to first frame ≤ 150 ms; playback at
  0.4x + vignette + IMPACT label + red real-hitbox line.
- Soak test 10 minutes with an auto-play bot (PRNG-seeded input): no crash,
  clean console.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: A1–A12 all met, with measurements attached.

=== ACCEPTANCE CRITERIA (FINAL — non-negotiable, measurable) ===
1. Repo-standard layout: games/gravity-juggle/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests, airplane-mode playable, total payload ≤ 5 MB
   with game code ≤ 120 KB. Ships README.md (how to run, controls, tuning
   table) + GDD.md from docs/game-design-template.md.
2. Zero external assets: no image/font/audio files; visuals 100% Canvas2D,
   audio 100% WebAudio synthesis.
3. 60 FPS locked: 60 s Performance capture — no frame > 16 ms (except cold
   start); JS ≤ 8 ms/frame on 2019 mid-range; auto quality scale: rolling
   avg > 20 ms over 120 frames → particles 512 → 256 → 128 and glow off.
4. Zero GC in RAF: allocation sampling ~0 B/s steady state over 60 s; no
   new/array-literal/string-concat/closure in update/render; HUD numbers
   drawn from an offscreen cache on change; gradients created once at resize.
5. One-thumb complete: the whole loop with one finger; input → render
   < 50 ms; scroll/zoom/double-tap-zoom fully blocked.
6. Deterministic: same seed → same layout + same physics outcomes thanks to
   the fixed-step 120 Hz sim.
7. Audio unlocks on the exact first gesture; mute works and persists across
   sessions.
8. Tab pause: leaving mid-RUN stops everything + suspends audio; returning
   shows the resume overlay.
9. Crash → replay displayed ≤ 150 ms (performance.now()).
10. Corrupt storage → default fallback, no crash.
11. Near-miss hitbox −20% verified via the debug overlay (0.8 x visual).
12. i18n-ready: every user-visible string keyed in STR; 'en' complete at
    ship; 'vi'/'lo' drop in the moment translations land.
13. Strict mode; console 0 errors 0 warnings; 10-minute soak clean; console
    self-test C1/C2/C3 all PASS + 'GRAVITYJUGGLE READY'.
14. Definition of done: /game:qa gravity-juggle against
    docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      GRAVITY JUGGLE / ORBIT — RELEASE — SOAR
  bootTap       TAP TO CLIMB
  tut0          HOLD TO ORBIT — RELEASE TO FLY
  tut1          THE ORBIT SHRINKS — NEVER CAMP
  tut2          GRAZE ASTEROIDS TO BURN YOUR COMBO
  scoreCap      SCORE      bestCap BEST      altCap ALTITUDE
  comboCap      COMBO
  perfectCap    PERFECT!   grazeCap GRAZE!
  impactCap     IMPACT     replayCap REPLAY
  pausedCap     PAUSED      resumeTap TAP TO RESUME
  countdown     3 / 2 / 1
  resultsCap    RESULTS    newBest NEW BEST!
  skinUnlock    NEW SKIN UNLOCKED!
  btnRetry      RETRY      btnMenu MENU      btnShare SHARE
  copied        RESULT COPIED!      copyFail COPY FAILED
  setCap        SETTINGS   setMute SOUND

=== TECHNICAL BLUEPRINT ===
1) Palette/gradients: bg vertical 3-stop #05060E → #101A3A → #2B1055; 3
   parallax star layers alpha .35/.55/.8 at speeds .1/.25/.45 x camera; 2
   radial nebulas #7F5AF0 and #FF5C8A screen-blend alpha .10; planet core
   #FF3860; orbit ring gradient #5CE1FF → #7F5AF0 lineWidth 3; boost-arc
   #FFE066 lineWidth 6; comet core #FFF7E6, trail #FFD166 → #FF5C8A →
   transparent; HUD #EAF2FF; combo flare #FFE066; HUD contrast ≥ 4.5:1.
2) Physics constants: G_ASSIST = 260 px/s²; CONTRACT = 34 px/s;
   CAPTURE_DIST = 560 px; CONE = ±60°; r0 ∈ [R+26, R+140];
   omega_min = 1.8 rad/s; PERFECT_ARC = 26° (tightens toward 16° with
   difficulty); PERFECT_BOOST = 1.28; wall restitution 0.6; r_core = 0.42R;
   free-fall drag exp(−0.15·dt); orbit-contract speed +8%/1000 m.
3) Difficulty pacing (every 500 m): planet gap 300 → 170 px; asteroid
   density 0 → 0.8 per planet; wind ±40 px/s from 1500 m; planet R random
   46–90.
4) Combo/score: graze +1 combo, perfect +2; mult = 1 + 0.5 x floor(combo/5),
   cap x8; combo decays after 4 s without events (drain bar on top); score =
   altitude(m) x 10 + Σ(base x mult) with perfect 150, graze 40; RESULTS
   shows NEW BEST + skin unlocks at the 500/1500/3000 m milestones
   (persisted) + share-to-clipboard.
5) Synth (Hz, 0-asset): attach = triangle 220 → 88 exp 80 ms gain .18;
   release = sine pluck pentatonic Am [220, 261.63, 293.66, 329.63, 392]
   chosen by planetIdx mod 5, decay 250 ms; perfect = added sine 2f gain .12
   decay 300 ms + 55 Hz sub 100 ms; graze = white noise 60 ms through
   bandpass 1800 Hz Q4 gain .20; crash = sine 140 → 30 exp 400 ms + noise
   lowpass 500 Hz 300 ms; tether hum = 2 saws detuned 110 & 110.7 Hz,
   lowpass 400 Hz, f = 110 x clamp(|omega|/3, .6, 2.4); UI tick = square
   660 Hz 30 ms; MUSIC = pad of 4 chords Am–F–C–G every 2 s, each chord 3
   triangles (root, fifth, tenth) with roots 110/87.31/130.81/98 Hz, filter
   LFO .1 Hz sweep 400 → 1200 Hz, gain .05.
6) Particles: pool 512 — trail 2/frame, graze spark 8, crash shatter 90,
   perfect ring expands 480 px/s fading over .5 s.
7) Replay: Float32Array ring x 6 fields, 30 Hz, 75 frames, playback 0.4x,
   vignette alpha .5, frozen IMPACT frame + red line of real vs visual
   hitbox.
8) Deliverable: template-scaffold static site running on Chrome/Edge/
   Firefox/Safari mobile ≤ 2 years old; after iteration 3 self-grade A1–A12
   and print a ticked report with measurements.
```
