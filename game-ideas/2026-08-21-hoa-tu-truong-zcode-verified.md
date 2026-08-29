# Magnetic Bloom

- **Date:** 2026-08-21 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `magnetic-bloom` — target folder `games/magnetic-bloom/`
- **Genre:** Arcade gravity-bending survival (one-thumb graze-scoring defense): you don't dodge — you BEND space, catch meteors into orbit, graze for combo, release to slingshot chain-kills.
- **Pitch:** You are a motionless magnetic core in a meteor storm: hold your finger to deploy a force field that sweeps rocks into orbit around you — the closer you let them fly past, the more the score explodes; let go to fling the whole orbital cache outward as a chain-kill shotgun spread. Courage (your distance from death) IS the score.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Hoa Từ Trường — Magnetic Bloom".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Magnetic Bloom — an H5 arcade game that meets this repo's shipping
bar: games/magnetic-bloom/ static site scaffolded from templates/game-starter/
via /game:new, template engines unmodified, zero build step, zero runtime
network. Core loop: gravity-bending defense — hold to orbit meteors, graze for
combo, release to fling them as slingshot bullets. All UI copy in English,
served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. Commercial bar:
load-to-playable < 3 s, sessions of 45–90 s, D1-retention mechanics (best-score
chase + the Perfect Sling dopamine loop), game-feel at commercial-portal tier
(Poki/CrazyGames). 100% distinct from amateur work: EXCLUSIVE core mechanic
(gravity-bending + graze-as-currency + release-to-fling chains), deep juice,
production-grade hardening. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order — each round
BUILD → SELF-TEST → FIX → RE-VERIFY, advancing only when the checklist is 100%
PASS; if a later round FAILs, go back and patch the earlier round (no error
stacking). Log 'MAGNETIC-BLOOM READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/magnetic-bloom/ from templates/game-starter/ via /game:new
  magnetic-bloom. Plain ES modules + <script type="module">, served over
  http:// (never file://). Games never import from outside their folder;
  engine/ modules stay unmodified.
- Stage: 1080p HiDPI — backbuffer scaled by min(DPR, 2) via ctx.scale, set
  once per resize; responsive letterbox fit.
- Sim: engine/loop.js fixed timestep — stepHz 120 (dt = 1/120 s), maxSubSteps 4
  (surplus discarded, spiral-of-death guarded), render interpolation with
  alpha; no free-running dt anywhere. Entities move in update() only; render
  code never mutates state.
- Input: engine/input.js unified pointer events, one finger, whole-screen hit
  target (touch-action: none, bound keys preventDefault only); keyboard
  fallback for desktop.
- Entities: meteor/debris pre-allocated pool of 256 — no new in the loop.
  Implement fully: field on/off, spawn director, orbital capture, graze ring,
  core collision, death → restart < 300 ms with a tap.
- Core loop: HOLD = tangent-push field sweeps rocks into orbit around the
  core; a rock crossing the amber graze ring = +combo; RELEASE = the field
  collapses in 90 ms and orbiting rocks fly out at x1.9 velocity = bullets;
  bullets breaking fresh rocks = chain kills; overheat at 100% = field
  POLARITY INVERSION (pulls rocks IN) for 2.5 s. Death when a rock touches the
  core hitbox (80% of visual — near-miss −20%).
- All randomness through engine/rng.js createRng(seed). No Math.random() in
  gameplay code.
- C1: (1) vertical slice playable at 60 fps; (2) physics stable at 60/120/144
  Hz displays; (3) capture → orbit → release chain works end to end;
  (4) death → restart < 300 ms.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512, zero GC. Follow engine/particles.js pool semantics.
- Juice: trauma-based screen shake — offset = trauma² x 9 px, rotation
  ±0.6° x trauma², decay 1.8/s; hitstop 40 ms on chain-kill, 90 ms on
  core-hit — the accumulator freezes but the RAF keeps rendering (juice
  timers run on a separate clock so interpolation survives).
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture, suspend on pause, mute state
  persisted; master chain masterGain → DynamicsCompressor (threshold −18 dB,
  ratio 6) → destination; master never starts > 0.5. 100% procedural, 0
  assets. SFX: field-hum = 2 detuned saws 55 Hz / 55.35 Hz through a lowpass
  opening with tension 400 → 1400 Hz; graze-blip = sine 660 Hz + combo x 8,
  40 ms; sling FM-chime = carrier 880 Hz, mod-ratio 2.5, decay 300 ms;
  core-hit = noise burst + sub-sine 90 → 40 Hz; overheat siren = square
  440 → 880 Hz over 1.2 s; combo tier-up = 3-note pentatonic arpeggio,
  pitch rising per tier.
- C2: (1) 60 fps with 512 particles + shake active; (2) network panel shows
  zero requests beyond the document; (3) hitstop does not break interpolation;
  (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → instant pause + audio.suspend;
  resume with a 3-2-1 countdown (overheat does not drain while paused);
  loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('magnetic-bloom', 1, defaults,
  migrate): schema v1 = { best, settings { mute, lang }, seenTutorial }.
  Safe JSON parse, try/catch tolerant to corrupt/blocked storage; migration
  hook wired. Never raw localStorage.
- Near-miss hitbox −20%: core collision radius = 0.8 x visual radius; graze
  annulus [0.9r, 1.8r] drawn clearly so players can read the risk.
- Instant replay < 150 ms: ring buffer of 120 physics snapshots (position/
  velocity/field/trauma only), allocated once at boot; on death, playback at
  0.4x slow-mo with vignette + REPLAY tag through the same render pipeline
  (alpha overlay 0.35); tap to skip.
- FPS governor: if fps < 55 for ≥ 2 s → drop a VFX tier (shadowBlur off,
  particle cap 256, parallax off).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  scratch vectors reused; the score string is rebuilt only when the value
  changes; verify via Chrome allocation profiler: 10 s of gameplay = zero
  steady-state heap growth.
- No alert()/confirm() anywhere; no remote fonts.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only.
- C3: (1) pause/resume glitch-free physics; (2) replay starts ≤ 150 ms after
  death; (3) profiler shows zero RAF allocations; (4) storage survives a
  corrupt payload; (5) live language switch rebuilds all labels, en table
  complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/magnetic-bloom/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only (no image/font/audio files — all
   Canvas + WebAudio), total payload ≤ 5 MB. Ships README.md (how to run,
   controls, tuning table) + GDD.md from docs/game-design-template.md.
2. 60 fps locked: RAF + fixed-step cleanly separated; frame budget measured
   with performance.now() < 12 ms p95.
3. Zero GC allocation in RAF steady state: no object/array/closure/string
   created in update+render; scratch vectors reused; every particle/debris
   from a pool.
4. One-thumb fully playable with a finger anywhere on screen; input→response
   < 1 frame; touch-action none, scroll/zoom/double-tap-zoom fully blocked.
5. Death → restart < 300 ms; first-playable < 3 s; autoplay-policy compliant
   (audio only after a gesture).
6. Runs 10 continuous minutes with no FPS degradation and no memory leak
   (heap flat across 3 restarts).
7. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
8. Console self-test: C1/C2/C3 all PASS + 'MAGNETIC-BLOOM READY'.
9. Definition of done: /game:qa magnetic-bloom against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         MAGNETIC BLOOM
  bootTap       TAP TO START
  tut0          HOLD TO ORBIT — RELEASE TO SLING
  tut1          GRAZE CLOSE FOR COMBO — DON'T GET TOUCHED
  tut2          FULL HEAT FLIPS YOUR FIELD — LET GO IN TIME
  comboCap      COMBO x{mult}
  heatCap       HEAT
  inversionCap  POLARITY FLIP!
  perfectCap    PERFECT SLING!
  bossCap       MAGNET STORM
  replayCap     REPLAY      replaySkip TAP TO SKIP
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS     newBest NEW BEST!
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette (color semantics): bg radial gradient #05070E → #0B1026 → #141B3D +
  a static offscreen nebula parallax layer; core #40F2D9 (teal = safety) with
  white heart #EFFFFB; meteors #FF3D81 (magenta = threat) with ember tails
  #FF9E5E; graze ring #FFC145 (amber = score); polarity-inversion state #B44BFF
  (violet heart, 60% desaturation); UI system-ui stack, text glow intensity
  tracks the combo tier.
- Physics: field radius R = 0.42 x min(w, h); for a rock inside R:
  a = k·(1 − d/R)² x (r̂ x 1400 + t̂ x 900) px/s², with t̂ the perpendicular in
  the clockwise direction; beautiful orbits emerge naturally when v²/r ≈ a_rad
  → r* = √(k/v²) — the 'bloom' forms itself; release: tangential velocity
  x1.9, field-cancel window 90 ms; overheat +18/s while holding, −26/s while
  released; inversion lasts 2.5 s (force sign flips, controls locked,
  continuous shake at trauma 0.4).
- Combo: graze-tick +1 every 120 ms per rock inside the annulus; multipliers
  x1/x2/x4/x8 at 10/25/50 grazes; combo decays after 2.0 s without a graze;
  PERFECT SLING (a rock orbited ≥ 270° then flung to kill ≥ 2 rocks) = bonus
  x tier + hitstop 80 ms + white flash alpha 0.18 for 60 ms + 24 confetti
  particles; the screen border glows amber according to the current tier.
- Spawn director: difficulty D = 1 + t(s)/45; spawn interval = clamp(1100 −
  9D, 320) ms; pattern pool: RAIN / SPIRAL-2arms / BURST-8 / WALL-with-gap;
  every 45 s a boss wave 'TỪ BÃO' (Magnet Storm) of 3 phases (dense spiral,
  alternating bursts, wall with a narrowing gap), rewarding one full-screen
  clear pulse.
- Replay & shake & hitstop: per ITERATION 2–3 specs; replay renders through
  the same pipeline with an alpha overlay 0.35.
- Constants: all tuning numbers gathered in a CONFIG object at the top of the
  gameplay module for one-stop balancing.
- State machine: BOOT → TITLE → RUN → REPLAY → RESULTS → RUN; PAUSE overlay
  anytime (button + visibilitychange).
- Perf budget: frame < 12 ms p95; FPS governor tiers degrade gracefully below
  55 fps.
```
