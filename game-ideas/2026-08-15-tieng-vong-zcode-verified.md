# ECHO DEPTH

- **Date:** 2026-08-15 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no single-file), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `echo-depth` — target folder `games/echo-depth/`
- **Genre:** Arcade / casual — one-touch echolocation survival.
- **Pitch:** You are a mote of light fallen into an absolutely dark cave: tap to send out an echo that lights the way — but every echo wakes the sound-hunting Listeners. The quieter you are, the safer; the more you see, the more danger you call to you.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Tiếng Vọng (Echo Depth)".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build Echo Depth — an H5 arcade one-touch echolocation survival game
that meets this repo's shipping bar: games/echo-depth/ static site scaffolded
from templates/game-starter/ via /game:new, template engines unmodified, zero
build step, zero runtime network. Core loop: hold to fly up, release to fall,
tap to ping — the wavefront reveals walls and rings the Echo Crystals
(points × combo, +1 pip) but any Listeners it touches dash at the ping origin;
dodge by staying silent and navigating by growls. Design pillars: see-vs-
survive tension (every ping trades information for risk, decisions < 1 s);
sound IS the UI (growls, crystal chimes and echoes are a real radar — playable
by ear); pure one-touch 30–180 s sessions with ≤ 1.2 s death-to-play retry;
seeded daily challenge (same cave on every device). All UI copy in English,
served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. No stubs, no
TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements; on any FAIL, fix at the root before advancing (max 3
fix cycles per iteration). Log 'ECHO-DEPTH READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/echo-depth/ from templates/game-starter/ via /game:new
  echo-depth. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: portrait-first, one-hand play, responsive letterbox fit-scale;
  HiDPI canvas.width = viewport x min(DPR, 2); transform set once per resize.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback — one
  gesture, two functions: HOLD (anywhere) = upward thrust, release = free
  fall; TAP (pointer down→up < 150 ms AND movement < 12 px) = PING;
  otherwise treated as hold/thrust. Classify at pointerup while thrust
  accrues from pointerdown (no lost input). Desktop: hold Space = thrust,
  F or a quick mouse click = ping, P = pause. Input→response ≤ 50 ms;
  polling every sim step. touch-action: none on canvas.
- Physics constants: gravity 1400 px/s²; net thrust −1400 px/s² while held;
  vy clamp ±620 px/s; auto-scroll vx 240→420 px/s (linear ramp, max at
  depth 1000 m).
- Ping wavefront: speed 640 px/s, max radius 900 px, lifetime 1.6 s; wall
  reveal alpha = exp(−t/1.6), cutoff 2.75 s. Ping pips: 3 pips, 2.5 s
  regen per pip; each Echo Crystal restores +1 pip instantly.
- Hull: 3 points; wall stab = −1 hull + 240 px/s knockback along the normal
  + 1.2 s i-frame; hull 0 = shatter (death). Graze: within 26 px of a wall
  continuously ≥ 0.25 s → +2 pts/s × combo (spark feedback).
- Combo: window 4 s, multiplier steps ×1→×8 (cap); crystal = 10 × combo
  points. Total score = floor(depth_m) + Σ crystals + graze points.
- Terrain: top/bottom boundaries = 1D value noise (3 octaves, smooth lerp);
  chunked 512 px, generate 3 chunks ahead, keep a 1280 px window around the
  player, clean up behind. Guaranteed path: minimum gap ≥ 150 px at every
  depth (clamped after generation). Echo Crystals: clusters of 3 along the
  sine centerline ± jitter, one cluster every 400–700 px. Listeners spawn in
  wide pockets ≥ 250 px from crystal clusters (no inescapable traps).
- Listener AI: hovers at 60 px/s; when a wavefront touches it → HUNT 2.8 s:
  dashes 520 px/s (decaying) toward the PING ORIGIN (not the player — decoy
  pings are a valid survival tactic), then 4 s cooldown. Visible only while
  revealed + a permanent afterimage silhouette (alpha 0.12) at its last
  position — the signature 'sonar image' look.
- Sage AI (depth ≥ 800 m, one every ~600 px): every 6–10 s emits a red
  counter-ping (ring R 700 px) that reveals terrain for free BUT switches
  every Listener in range to the player's TRUE position — forces movement
  timing between enemy pings. Listener↔player collision = lose all hull
  (death) unless i-frame is active.
- Milestones: every 250 m → toast + reward chord (steady dopamine).
- Daily Challenge: seed = YYYYMMDD date string via engine/rng.js
  createRng(seed) → identical cave on every device; DAY badge + local top 5
  per seed. All other randomness through createRng too. No Math.random() in
  gameplay code.
- C1: (1) physics/render separation holds, step ≈ 8.33 ms ±5%;
  (2) 50 natural taps classify 100% correctly as ping vs hold (0 misfires);
  (3) wavefront reveals walls and HUNT targets the exact ping origin;
  (4) 60 fps desktop.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: hard pools — 512 particles (256 on Low quality), 64 floating
  texts, 16 rings; ZERO allocations in a frame. Follow engine/particles.js
  pool semantics; NO new/closures in the hot loop.
- VFX (Canvas 2D, composite 'lighter'): ping ring = 2 stacked strokes (4 px
  alpha 0.9 + 14 px alpha 0.12) in hsl(174, 90%, 60%), hue +14° per combo
  tier, plus a radial-gradient fill at alpha 0.05; revealed walls = 2-layer
  polyline (wide-faint + thin-bright), alpha = reveal intensity; player =
  mote r10 + an 18-particle glow trail, hue drifting 180→300 with combo;
  crystal pickup = 14-particle burst + hex ring opening over 0.4 s + pooled
  floating +10×N text; wall stab = 10 orange sparks + shake 7 px / 0.18 s +
  red vignette 0.35 decay; death = 40 shatter particles + slow-mo 0.35× for
  0.6 s + gray overlay; Sage counter-ping = red ring + 0.3 s eye-flash on
  every Listener in range. shadowBlur is FORBIDDEN in the loop (draw 2
  layers instead). DPR cap 2.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on first user gesture (never a sound before the gesture),
  suspend on pause, resume on visibilitychange, mute state persisted; master
  chain voices → sfx/music buses → masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination + a Convolver reverb (impulse = white
  noise with 1.8 s exponential decay) at wet 0.18. Master never starts
  > 0.5. Voice manager max 24 voices, steal-oldest.
- SFX recipes (all procedural): ping = sine 880→180 Hz exp sweep 0.32 s, env
  A 5 ms / D 0.4 s, + second osc detuned ×1.465 at gain 0.25, reverb send
  0.35; crystal = triangle on pentatonic [C4, D4, E4, G4, A4, C5, D5, E5,
  G5, A5], index = min(combo−1, 9), decay 0.5 s + ×2 harmonic gain 0.15;
  graze spark = noise buffer bandpass 2.4 kHz Q6, 0.08 s, gain 0.12; wall
  stab = sine 110→45 Hz 0.25 s gain 0.5 + noise lowpass 400 Hz 0.15 s
  (synced to the screen shake); death = sub 90→28 Hz 0.9 s + a cluster of 5
  oscs detuned around 220 Hz fading 1.4 s, reverb 0.6; Listener growl =
  brown noise lowpass 160 Hz, LFO 5.5 Hz depth 0.7, gain = clamp(1 −
  dist/600) × 0.22 — radar by ear; hunt alert = 2 notes E2→G2 saw lowpass
  300 Hz 0.28 s; Sage counter-ping = sine 520→1040 Hz swell 0.5 s + 14 Hz
  tremolo — a distinct learnable timbre; milestone = 3 fast notes C6-E6-G6
  sine 40 ms; UI click = square 900 Hz 18 ms at −18 dB; ambient = 2 sines
  55/55.7 Hz gain 0.04 + random drips every 4–9 s (1400→380 Hz, 0.09 s +
  echo ×3 at −6 dB).
- C2: (1) 60 fps with full VFX; (2) network panel shows zero requests beyond
  the document; (3) audio unlocks on first gesture, ≤ 24 voices, growl is
  intelligible as a distance cue (internal blindfold test 5/5);
  (4) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.visibilitychange → full pause (never die while
  paused) + audio suspend; resume with a 3-2-1 countdown; loop.js stall
  clamp guards time jumps; pagehide flushes best scores.
- Saves via engine/storage.js createStorage('echo-depth', 1, defaults,
  migrate): schema v1 = { best, bestDaily, settings {sound, reduceFlash,
  quality, lang} }. try/catch tolerant to corrupt/cleared storage; migration
  hook wired. Never raw localStorage.
- Settings: Sound, Reduce Flash (disables shake/flash), High/Low quality —
  all persist across reload. Accessibility: color is never the only signal —
  enemies are distinguished by audio AND a distinct silhouette shape.
- Debug overlay: ?debug shows fps, sim ms, draw calls, particle count,
  alloc/frame (must read 0).
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  verify via Chrome allocation profiler: 10 s of gameplay = zero steady-state
  heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives
  in STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read
  via t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) pause/resume glitch-free physics; (2) death → playing again
  ≤ 1.2 s; (3) storage survives a corrupt payload; (4) profiler shows zero
  RAF allocations; (5) live language switch rebuilds all labels, en table
  complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/echo-depth/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests, procedural assets only, total payload ≤ 5 MB. Ships
   README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked on Snapdragon 665 / iPhone 11-class: ≥ 55 fps average over a
   10-minute soak, p99 frame ≤ 20 ms; ≤ 8 ms CPU frame on a 2020 laptop;
   ≤ 220 draw calls/frame; no GC pause > 8 ms (2-min Performance recording
   shows a flat sawtooth).
3. Zero GC in RAF steady state (alloc/frame = 0 in the debug overlay).
4. One-hand portrait play: touch-action none, response ≤ 50 ms, all touch
   targets ≥ 44 px, scroll/zoom fully blocked.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. Full loop: title → play → death → retry ≤ 1.2 s with 0 console errors in
   the production build.
7. Daily-seed determinism: same seed → identical cave on 2 different devices.
8. Mute + reduce-flash + quality persist across reload; no audio before the
   first gesture.
9. Console self-test: C1/C2/C3 all PASS + 'ECHO-DEPTH READY'.
10. Definition of done: /game:qa echo-depth against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title         ECHO DEPTH
  bootTap       TAP TO START
  hintEcho      TAP — ECHO          hintFly HOLD — FLY UP
  dayBadge      DAY
  milestone     {m} M DEEP
  comboCap      ×N
  newBest       NEW BEST
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS
  maxCombo      MAX COMBO      crysCap CRYSTALS
  btnDeeper     DIVE DEEPER      btnShare SHARE      btnRevive REVIVE
  shareText     I sank to {depth} m in Echo Depth — beat that!
  setSound      SOUND      setFlash REDUCE FLASH
  setQuality    QUALITY      qualityHigh HIGH      qualityLow LOW

=== TECHNICAL BLUEPRINT ===
- Difficulty pacing (depth / cave gap / content):
  0–150 m — gap 320–420 px — no Listeners; faint diegetic hints painted on
    the walls: TAP — ECHO / HOLD — FLY UP;
  150–500 m — 260–340 px — 1 Listener per screen, vx 280;
  500–900 m — 210–300 px — 2 Listeners + currents ±120 px/s reversing every
    4–7 s (faint particles show direction);
  900 m+ — 190–260 px — Sage + 3 Listeners, vx 420.
- Revive: once per run (watchAd hook stub) — restores full hull + 2 s
  i-frame. Share copies "I sank to 1,482 m in Echo Depth — beat that!" to
  the clipboard.
- HUD: depth top-left (tabular-nums, 1 decimal + m); combo top-center
  (spring scale 1→1.35→1 over 180 ms); 3 ping pips bottom-center (radar-
  sweep cooldown ring); pause top-right; safe-area insets respected.
- Title: cave backdrop + slow auto-ping, glow-pulse logo (3 s cycle), best
  score, tap-to-start. Death: big score + NEW BEST badge, max combo,
  crystals; DIVE DEEPER (tap → playing ≤ 1.2 s).
- State machine: BOOT → TITLE ⇄ PLAY ⇄ PAUSE → DEAD; PAUSE overlay anytime
  (button + visibilitychange).
- Perf budget: ≥ 55 fps avg on mid-range (10-min soak), p99 ≤ 20 ms, JS
  ≤ 8 ms/frame; ≤ 220 draw calls; DPR cap 2; pools 512/64/16 (Low: 256);
  boot→playable ≤ 3 s @ Fast 3G; Lighthouse mobile Performance ≥ 95;
  batched canvas ops, no redundant state changes between draw calls.
- Non-goals: multiplayer, backend, sprite/image assets, full PWA (cache
  shell only), real IAP (ad stub only).
```
