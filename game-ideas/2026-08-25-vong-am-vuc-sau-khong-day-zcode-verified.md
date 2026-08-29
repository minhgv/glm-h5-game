# ECHOLIGHT

- **Date:** 2026-08-25 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `echolight` — target folder `games/echolight/`
- **Genre:** Arcade survival / sonar-reveal — one-thumb hold-to-charge sonar pulse, blind dodging on memory, graze near-miss combos, information-vs-threat risk/reward.
- **Pitch:** You are a bioluminescent creature in a pitch-black abyss: the screen is nearly dark, revealed only when you charge and release an echoing pulse — but every pulse draws in the hunting pack. Charge with one finger, shave past predators by a hair for graze combos, and survive on memory and information greed.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Vọng Âm: Vực Sâu Không Đáy".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build ECHOLIGHT — an H5 one-thumb arcade survival game that meets this
repo's shipping bar: games/echolight/ static site scaffolded from
templates/game-starter/ via /game:new, template engines unmodified, zero build
step, zero runtime network. Hook: the player is a bioluminescent creature in a
bottomless abyss and the screen is DARK. Touch-hold to charge the Echo —
release to radiate (R(t) = R0 + 2200·t), revealing predators and crystals
inside the running ring of light. The price: every pulse raises the pack's
aggro (attraction = 1.15 ^ recent pulse count). The more you ping, the more
you see — the more you're hunted. That is the addiction loop: information vs
aggression. 30 s core loop: drift → charge → pulse → grab orbs / graze past
predators → stack combo → tier-up flare → boss wave every 60 s → death →
instant replay → one-tap retry. Commercial, studio-grade game-feel
(deterministic physics, proper juice, full hardening), ready for itch.io /
web portals and monetization. All UI copy in English, served from an STR i18n
table with reserved 'vi'/'lo' slots (pattern: games/gravity-juggle) so the
game ships multi-language-ready. No stubs, no TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order (Game Director +
senior gameplay engineer + audio designer in one). Self-verify each
iteration's checklist before advancing. On spec conflicts, acceptance items
1–4 win. Log 'ECHOLIGHT READY' only when FINAL ACCEPTANCE passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/echolight/ from templates/game-starter/ via /game:new
  echolight. Plain ES modules + <script type="module">, served over http://
  (never file://). Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: full-viewport Canvas2D; design space 1920x1080 with letterbox
  scale-to-fit; HiDPI: canvas.width = viewport x min(DPR, 2); viewport size
  read exactly once per resize (no layout thrash).
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation. Entities
  move in update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback. One-thumb:
  pointerdown = charge the pulse (blast radius 180–640 px scaled by charge
  time 0.15–1.2 s, with a visual ring-progress); pointermove drags the player
  via spring-damper (k = 120, c = 14); pointerup = emit the wave.
  touch-action: none on canvas.
- Entities pre-allocated: player, 6 predator archetypes, orb field of 24,
  max 4 simultaneous pulses. State machine: BOOT → TITLE → PLAY → REPLAY →
  GAMEOVER.
- Physics: v += a·dt; drag v *= pow(0.86, dt·60); predator steering =
  clamp(desired x maxSpeed − v, maxForce 900 px/s²); camera lerps to the
  player with v-based look-ahead.
- All randomness through engine/rng.js createRng(seed) — deterministic runs.
  No Math.random() in gameplay code.
- C1: (1) 3 minutes of continuous play with zero logic errors; (2) zero
  visual jank; (3) one-thumb playable end-to-end; (4) input→response
  ≤ 1 frame.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: 512-slot ring buffer preallocated; spawning overwrites the oldest
  slot; absolutely no new particles during gameplay. Follow
  engine/particles.js pool semantics.
- Juice: screen shake via trauma model — offset = trauma² x 26 px x
  hash-noise, decay 1.8/s; graze = 0.15, tier-up = 0.3, death = 1.0. Hitstop:
  timeScale = 0 for 40 ms (graze) / 90 ms (death) / 120 ms (tier-up), eased
  back to 1 over 80 ms.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily on the first pointerdown (resume + silent buffer), suspend
  on pause, mute state persisted; master chain masterGain → WaveShaper
  soft-clip → DynamicsCompressor (threshold −18 dB, ratio 12) → destination.
  Master never starts > 0.5.
- Synth spec: ping = sine 880 Hz exp-glide to 140 Hz over 0.6 s + 0.3 s
  bandpass-noise "water" tail; charge-tick every 80 ms climbing the pentatonic
  ladder [220, 262, 330, 392, 440, 523, 587, 659, 784, 880] Hz; graze =
  triangle 1560 Hz 40 ms stereo-panned by travel direction; death = sawtooth
  110 → 30 Hz over 0.8 s + lowpass 400 Hz noise burst; tier-up = 2-note chord
  detuned +7 cent.
- Palette: bg vertical gradient #04060D → #0A1628 → #10263F; pulse cyan
  #22D3EE drawn additive (globalCompositeOperation lighter); orb purple
  #A78BFA; threat pink #F43F5E; combo gold #FBBF24, flare #FDE68A; player core
  #E8F4FD; system-ui font stack (no external fonts).
- Combo: graze +1 stack, orb +2, each predator revealed inside one pulse +3;
  stack decay 2.5 s without events; multiplier = 1 + floor(stack/5), cap x8;
  each multiplier doubling: chord + screen-rim flash + trauma 0.3.
- C2: (1) every gameplay event has matching sound + effect + haptics;
  (2) audio plays only after the first user gesture; (3) 60 fps with a full
  pulse + orb field + predator pack; (4) zero network requests beyond the
  document; (5) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: blur/hidden → auto pause + mute + clock reset to avoid dt-jumps;
  on refocus a 3-2-1 countdown precedes resume; loop.js stall clamp guards
  time jumps.
- Saves via engine/storage.js createStorage('echolight', 1, defaults,
  migrate): schema v1 = { best, bestCombo, mute, runs, lang }. try/catch
  tolerant to corrupt/cleared storage; migration hook wired. Never raw
  localStorage.
- Near-miss mastery: physical hitbox shrunk −20% vs the sprite (hitR =
  0.8 x visualR) for fair collisions; graze zone = 1.0–1.4 x hitR, triggered
  when a projectile/predator enters then leaves the zone (once per object).
- Instant replay: ring buffer of 120 snapshots (pre-allocated typed arrays:
  x, y, rot, alpha per entity); death → hitstop 90 ms → replay 1.5 s at 0.5x
  + red vignette; death→replay < 150 ms.
- Anti-GC: no .map/.filter/concat/slice/new/closures/string-concat in RAF;
  preallocate every object/array/vector. Verify via Chrome allocation
  profiler: 10 s of gameplay = zero steady-state heap growth.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) 10 tab switches without state drift; (2) killing the app mid-run
  keeps best score; (3) graze is readable by eye (flash + tick sound);
  (4) storage survives a corrupt payload; (5) live language switch rebuilds
  all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL — mandatory) ===
1. Repo-standard layout: games/echolight/ runs as a plain static site (ES
   modules over http://, python3 -m http.server), zero build, zero runtime
   network requests (no fetch/XHR/network imports), runs offline in
   airplane-mode, total payload ≤ 5 MB. Ships README.md (how to run, controls,
   tuning table) + GDD.md from docs/game-design-template.md.
2. Zero external assets: no image/font/audio files; visuals pure Canvas2D,
   audio pure procedural WebAudio, all text in the OS font stack.
3. 60 fps locked: physics fixed-step 120 Hz + render 60 Hz, frame budget
   p95 < 16.6 ms on integrated GPU.
4. Zero GC allocation in RAF: everything preallocated; no new /
   array-literal / closure / string-concat in the frame path; verified via
   DevTools Allocation Timeline: 30 s of play = 0 heap growth.
5. Commercial game-feel: hitstop + shake + graze + combo-tier audio feel
   "expensive"; death→replay < 150 ms; the entire game operable with one
   thumb (touch-action none, input → pixel ≤ 1 frame, scroll/zoom blocked).
6. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
7. Console self-test: C1/C2/C3 all PASS + 'ECHOLIGHT READY'.
8. Definition of done: /game:qa echolight against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      ECHOLIGHT / THE BOTTOMLESS ABYSS
  bootTap       TAP TO GLOW
  tut0          HOLD TO CHARGE — RELEASE TO PULSE
  tut1          EVERY PULSE REVEALS — AND ENRAGES
  tut2          GRAB ORBS — GRAZE PREDATORS TO STACK COMBO
  scoreCap      SCORE      bestCap BEST      comboCap COMBO
  grazeCap      GRAZE!     tierCap TIER UP!
  replayCap     REPLAY
  pausedCap     PAUSED      pauseTap TAP TO RESUME
  countdown     3 / 2 / 1
  deathCap      THE DARK TAKES YOU
  newBest       NEW BEST!
  btnRetry      RETRY       btnMenu MENU
  setCap        SETTINGS    setMute SOUND

=== TECHNICAL BLUEPRINT ===
- Palette: bg vertical gradient #04060D → #0A1628 → #10263F; pulse cyan
  #22D3EE (additive); orb purple #A78BFA; threat pink #F43F5E; combo gold
  #FBBF24, flare #FDE68A; player core #E8F4FD.
- Charge & wave: blast radius 180–640 px by charge time 0.15–1.2 s; released
  ring R(t) = R0 + 2200·t; max 4 simultaneous pulses.
- Aggro: predator attraction = 1.15 ^ recent pulse count; steering maxForce
  900 px/s²; 6 predator archetypes + boss wave every 60 s.
- Combo: graze +1, orb +2, predator revealed in a pulse +3; stack decay 2.5 s;
  multiplier = 1 + floor(stack/5), cap x8.
- Synth ladder: charge ticks [220, 262, 330, 392, 440, 523, 587, 659, 784,
  880] Hz every 80 ms; ping 880 → 140 Hz / 0.6 s; graze triangle 1560 Hz /
  40 ms; death saw 110 → 30 Hz / 0.8 s; tier chord +7 cent.
- Drag model: v *= pow(0.86, dt·60); player spring-damper k = 120, c = 14.
- State machine: BOOT → TITLE → PLAY → REPLAY → GAMEOVER; PAUSE overlay
  anytime (button + visibilitychange).
- All magic numbers gathered in one const CONFIG for tuning.
- Perf budget: logic ≤ 1.6 ms, draw ≤ 8 ms @1080p/DPR2 mid-tier.
```
