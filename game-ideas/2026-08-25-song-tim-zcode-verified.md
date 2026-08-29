# HEARTWELL

- **Date:** 2026-08-25 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `heartwell` — target folder `games/heartwell/`
- **Genre:** Rhythm-survival arcade / one-thumb casual — beat-synced dodging, density switching (contract/bloom), graze combos, a fully procedural synth universe.
- **Pitch:** You are an ember free-falling down an endless crystal well, where the whole world — music, hazards, the physics itself — beats to one procedural heart. Hold your thumb to contract and slip through lethal gaps, release on the beat to fire a Heartwave that sweeps hazards away, and graze near-death to push the whole world to a higher BPM — the greedier you play, the faster the world gets.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Sóng Tim: Giếng Nhịp Vô Tận".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build HEARTWELL — an H5 rhythm-survival arcade game that meets this
repo's shipping bar: games/heartwell/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Core loop: hold to CONTRACT through lethal gaps,
release to BLOOM and fire a hazard-clearing Heartwave, graze hazards to push
combo and world BPM. Standing goal: portal-commercial (CrazyGames/Poki,
ad-compatible), retention ≥ 3 plays/session, instant fun in the first 5 s.
Signature quality bar: EVERY phenomenon in the game — spawns, music, shake,
flash — is born from ONE sequencer (single source of truth), so gameplay and
music are in sync by construction, not by measurement. All UI copy in English,
served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. No stubs, no
TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order; each iteration
runs BUILD → VERIFY (execute the checklist by actually running/playing) → FIX
(max 3 fix cycles inside the iteration) → GATE (advance only at 100% pass).
After iteration 3, run the full acceptance sweep; any FAIL goes back to the
iteration that owns it — never loosen a criterion. Log 'HEARTWELL READY' only
when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/heartwell/ from templates/game-starter/ via /game:new
  heartwell. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1920x1080 logical, responsive letterbox scale-to-fit; HiDPI:
  canvas.width = viewport x min(DPR, 2.0); set transform once per resize
  (debounced handler).
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation — every
  entity drawn at prev + (curr − prev) x alpha. update() and render() fully
  separated; entities move in update() only.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb
  Pointer Events over the full screen, touch-action: none, preventDefault;
  thumb.x = horizontal lane target; held = CONTRACT, released = BLOOM.
  Fully playable with a mouse too.
- Player ember: r = 26 logic px; gravity g0 = 2600 px/s²; BLOOM 0.35x g
  (drag k = 4.5/s, terminal 520 px/s), CONTRACT 2.2x g (terminal 1900 px/s);
  contracted hitbox = 0.65r; lateral x += (tx − x) x (1 − exp(−8 x dt)).
- Camera follows player.y + lookahead 0.35 s x vy; the spawn director reads
  patterns from the sequencer every 1/4 note; difficulty = f(depth).
- State machine: BOOT → MENU → PLAY → PAUSE → DEAD → REPLAY → PLAY; exactly
  one requestAnimationFrame loop for the whole app.
- All randomness through engine/rng.js createRng(seed). No Math.random() in
  gameplay code.
- C1: (1) 3 minutes of continuous play without crash/NaN; (2) input-to-photon
  latency ≤ 1 frame; (3) stable 60 fps on desktop; (4) fixed-step sim verified
  (step ≈ 8.33 ms).

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: fixed pool of 512 (x, y, vx, vy, life, maxLife, size, hue, type)
  + free-list index; spawn = slot revival; ABSOLUTELY no new/literals inside
  RAF. FloatText pool of 24; player trail = 16-point ring buffer. Follow
  engine/particles.js pool semantics.
- Juice: screen shake trauma model — offset = trauma² x 34 px, angle =
  trauma² x 0.05 rad, decay 1.8/s; addTrauma: graze 0.08, parry 0.25, death
  1.0. Hitstop: freeze update (render keeps running) 70 ms when a parry
  catches ≥ 2 hazards; 110 ms at death before replay.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily, unlockAudio() idempotent on the first gesture (resume +
  1-sample silent buffer), suspend on pause, mute state persisted; master
  chain masterGain → WaveShaper soft-clip → DynamicsCompressor →
  destination; scheduler lookahead 120 ms, tick 25 ms setInterval (outside
  RAF — zero GC inside the frame). Master never starts > 0.5.
- Voice bank (all A-minor pentatonic): KICK = sine pitch-env 160 → 42 Hz over
  90 ms, gain env exp 0.9 → 0 over 180 ms, every beat; HI-HAT = white-noise
  buffer (created once at boot) through highpass 7.5 kHz, decay 40 ms, every
  offbeat 8th; SUB-BASS = square 55 / 65.41 / 73.42 / 82.41 / 98 Hz changing
  per bar; CHIME = triangle + square detuned 7 cents, scale 440 → 880 Hz
  rising with combo on stardust pickup; PARRY = bandpass noise 1.8 kHz Q0.8
  + 220 Hz osc decay 300 ms; DEATH = saw sweep 440 → 55 Hz over 600 ms +
  noise fade.
- Combo & BPM: BPM = min(96 + combo x 1.5, 180); the sequencer drives BOTH
  the music and the spawn decisions — sync by architecture.
- Visual juice: ember radial gradient shifts with heat; parry ring expands to
  220 px, alpha 0.9 → 0; floating score text rises; 1-frame white flash on
  parry.
- C2: (1) beat audibly stable for 5 minutes; (2) shake/hitstop match the spec
  exactly; (3) no frame > 20 ms across 5 minutes of desktop gameplay;
  (4) zero network requests beyond the document; (5) tests/audio-contract.mjs
  passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: visibilitychange + window blur → auto PAUSE ≤ 1 frame +
  audio.suspend(); resuming requires a gesture, 3-2-1 countdown, no dt-jump
  (accumulator reset); loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('heartwell', 1, defaults,
  migrate): schema v1 = { best, bestCombo, lifetimeDust, settings {sfx, shake,
  lang} }. try/catch on both read and write; migrate by version; fallback to
  defaults on corruption; debounced write at death. Never raw localStorage.
- Near-miss mastery (−20% hitbox): lethal hitbox = r x 0.8; graze ring =
  r x 1.9; each hazard may trigger graze only ONCE (grazed flag); a graze
  gives +1 graze count, cyan sparkles, addTrauma 0.08.
- Instant replay < 150 ms: ring buffer of 18 snapshots every 16.67 ms
  (= 300 ms) holding only {player, hazard x/y/type list, cameraY}; death →
  hitstop 110 ms → replay at 0.4x for 2.5 s with vignette + REPLAY label;
  death→replay-start ≤ 150 ms.
- Adaptive quality tier: if p95 frame-time > 17 ms over a 180-frame window →
  drop tier in order: DPR 2.0 → 1.5 → 1.25, particle spawn rate 50%, disable
  shake rotation; tier shown in the debug overlay.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  temp vars reused, constants at module scope, cached score strings rebuilt
  only when the value changes. Verify via Chrome allocation profiler: 10 s of
  gameplay = zero steady-state heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) tab hidden 10 minutes → returns to the exact state, no audio
  zombie, no physics leap; (2) storage survives a corrupt payload;
  (3) graze fires once per hazard and credits combo; (4) replay starts
  ≤ 150 ms after death; (5) live language switch rebuilds all labels, en
  table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/heartwell/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. Zero external assets: all visuals Canvas2D at runtime; all audio WebAudio
   synthesis; no fonts/icons/CDN.
3. 60 fps locked: p95 frame ≤ 16.9 ms; no frame > 34 ms (except deliberate
   hitstop) at 1080p HiDPI desktop + mid-range mobile.
4. Zero GC in RAF: 60 s allocation timeline = 0 bytes inside RAF
   (handlers/menus allowed).
5. Complete one-thumb: the entire game lifecycle operable with a single
   pointer; no keyboard required; touch-action none, input → pixel ≤ 1 frame,
   scroll/zoom/double-tap-zoom fully blocked.
6. Autoplay-safe: total silence before the first gesture; idempotent
   unlockAudio works on Chrome/Safari mobile.
7. Tab-safe: tab hidden 10 minutes → return to the exact state, no audio
   zombie, no physics leap.
8. Persistence: best/combo/settings survive reload; corrupt JSON never
   crashes.
9. Fair hitboxes: lethal = 80% of visual; graze ring = 190%; graze once per
   hazard; deaths ALWAYS feel fair (5-person playtest, zero unfair
   complaints).
10. Replay: death→replay ≤ 150 ms; buffer ≥ 300 ms; smooth at 0.4x.
11. i18n-ready: every user-visible string keyed in STR; 'en' complete at
    ship; 'vi'/'lo' drop in the moment translations land.
12. Retention: natural playtest ≥ 3 runs/person thanks to the
    graze → combo → BPM up → dopamine loop.
13. Console self-test: C1/C2/C3 all PASS + 'HEARTWELL READY'.
14. Definition of done: /game:qa heartwell against
    docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      HEARTWELL / THE ENDLESS RHYTHM WELL
  bootTap       TAP TO FALL
  tut0          HOLD TO CONTRACT — RELEASE TO BLOOM
  tut1          GRAZE THE HAZARDS — THE WORLD SPEEDS UP
  scoreCap      SCORE      bestCap BEST      comboCap COMBO
  depthCap      DEPTH      dustCap STARDUST
  grazeCap      GRAZE!     parryCap PARRY!
  replayCap     REPLAY
  pausedCap     PAUSED      pauseTap TAP TO RESUME
  countdown     3 / 2 / 1
  deathCap      THE WELL CLAIMS YOU
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU
  setCap        SETTINGS    setSfx SFX      setShake SCREEN SHAKE

=== TECHNICAL BLUEPRINT ===
- Palette: well bg vertical #05060E → #0D1030 → #1A0B2E; ember radial
  #FFF7E6 → #FFB84D → #FF5E3A; heat-max #FFFFFF → #7DF9FF; hazard #FF3D81
  rim #FF9AC4; stardust #7DF9FF and #FFE066; parry ring #FFFFFF → #7DF9FF
  alpha 0.9 → 0; UI text #E8ECFF, accent linear #7DF9FF → #FF5E3A.
- Physics: fixed-step 120 Hz; g0 = 2600 px/s²; BLOOM 0.35g + drag 4.5/s
  terminal 520; CONTRACT 2.2g terminal 1900; lateral exp-lerp 8/s; camera
  lookahead 0.35 s x vy; interpolation render alpha.
- Audio: A-minor pentatonic across all voices; BPM ramp 96 → 180 with combo;
  kick 160 → 42 Hz / 90 ms; hihat HP 7.5 kHz / 40 ms; bass square 55–98 Hz;
  chime 440–880 Hz; scheduler lookahead 120 ms, tick 25 ms.
- Combo math: multiplier = 1 + 0.5 x floor(graze/6), cap x8; score =
  stardust x 10 x mult + parry x 50 x mult + depth_px/1080; heat =
  clamp(grazeStreak/12) drives the ember gradient.
- Difficulty: hazardDensity = 0.6 + depth_m/400; pattern bank of 12 patterns
  weighted by BPM band [96–120–150–180]; every pattern guarantees a survival
  path ≥ 1.6x hitbox.
- Module layout: template scaffold only — game code in src/ organized as
  core/input/audio/juice/persist/replay modules, all tunables centralized in
  one CFG module; engine/ modules unmodified.
- State machine: BOOT → MENU → PLAY → PAUSE → DEAD → REPLAY → PLAY; PAUSE
  overlay anytime (button + visibilitychange).
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier.
```
