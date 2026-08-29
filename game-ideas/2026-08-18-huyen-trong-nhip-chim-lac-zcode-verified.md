# BRONZE DRUM BEAT

- **Date:** 2026-08-18 · **Revised:** 2026-08-29 — aligned to repo standards: template/engine architecture (games/bronze-drum-beat/ scaffold instead of a one-file build), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `bronze-drum-beat` — target folder `games/bronze-drum-beat/`
- **Genre:** Circular rhythm arcade, one-thumb (one-tap reflex + inhibition dodge): light notes ride 8 lotus-spoke lanes toward a breathing sacred drum rim — tap on the beat to score, never touch the Shadow Notes, and the Rhythm-Fire combo unlocks layers of procedural music; seeded Daily Challenge.
- **Pitch:** Strike the bronze drum as stars sail into the sacred rim — but do you dare NOT touch the Shadow Notes to keep your combo? The better the groove, the thicker the procedural ensemble and the faster the breathing rim: 60 seconds a run of reflex, restraint and bronze-drum joy unique on H5.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Huyền Trống: Nhịp Chim Lạc".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal: Build BRONZE DRUM BEAT — an H5 rhythm arcade that meets this repo's
shipping bar: games/bronze-drum-beat/ static site scaffolded from
templates/game-starter/ via /game:new bronze-drum-beat, template engines
unmodified, zero build step, zero runtime network. Core loop: one-tap rhythm
judgment on 8 rotating lotus lanes plus inhibition dodge — tap light notes on
the beat, let Shadow Notes pass untouched; combo heat (Rhythm Fire) unlocks
procedural music layers and speeds the breathing rim. All UI copy in English,
served from an STR i18n table with reserved 'vi'/'lo' slots (pattern:
games/gravity-juggle) so the game ships multi-language-ready. Commercial
hooks: seeded daily challenge, day streak, haptics, meta progression;
tap-feel on par with the best tile/Pop-the-Lock games. Every iteration must
pass its numeric DoD gate; on FAIL, fix and re-run (max 5 rounds per
iteration); log [PASS] only when a checklist is all green. No stubs, no
TODOs, no scope cuts.

AUTONOMOUS ITERATION LOOP: Work exactly 3 iterations in order. After EACH
iteration, self-verify with console.assert checklists (C1.x, C2.x, C3.x) plus
real runtime measurements. Log 'BRONZE-DRUM READY' only when FINAL ACCEPTANCE
passes.

=== ITERATION 1 — CORE ENGINE (template engines, no rewrites) ===
- Scaffold games/bronze-drum-beat/ from templates/game-starter/ via /game:new
  bronze-drum-beat. Plain ES modules + <script type="module">, served over
  http:// only. Games never import from outside their folder; engine/
  modules stay unmodified.
- Stage: 1920x1080 logical, DPR cap 2.0, letterbox-safe, jank-free resize;
  ctx.imageSmoothing off for crisp rims.
- Sim: engine/loop.js fixed timestep — stepHz 120, maxSubSteps 4 (surplus
  discarded, spiral-of-death guarded), render(alpha) interpolation:
  pos_render = pos_prev + (pos_curr − pos_prev) x alpha. Entities move in
  update() only; render code never mutates state.
- Input: engine/input.js unified pointer/touch + keyboard fallback.
  Whole-screen pointerdown (ignore the 2nd+ pointer), touch-action: none;
  tap → logic latency < 30 ms.
- Engine: 8 lotus-spoke lanes (lane angle i = i x 45° + θ(t)); θ(t) = 0.15 +
  0.02 x floor(t/20) rad/s, direction flips every 12 s via engine/rng.js.
  Notes spawn at r = 980 px flying to the center at v = 320 + 12 x level px/s
  (level = floor(score/40), cap 12). Sacred rim R(t) = 330 + 26 x
  sin(2π x 0.25 x t).
- Judgment by time-to-rim: t_hit = (r − R)/v of the nearest same-side note;
  Δ = t_now − t_hit. PERFECT |Δ| ≤ 28 ms, GREAT ≤ 60 ms, GOOD ≤ 95 ms,
  otherwise MISS (the note drifts past). SHADOW notes: 18% chance from level
  2, +1%/level, cap 30% — touching one inside the GOOD window BREAKS the
  combo; letting it pass safely = +2 discipline points.
- FSM: BOOT → MENU → COUNTDOWN(1 s) → PLAY → REPLAY → RESULT; restart < 400 ms
  from the retry tap. PAUSE overlay anytime (button + visibilitychange).
- Seeded randomness through engine/rng.js createRng(seed): daily seed =
  YYYYMMDD date string, endless = boot-time seed. No Math.random() in
  gameplay code.
- C1: (1) 60 notes/min with zero frame drift; (2) judgment error ≤ 1 physics
  step (8.33 ms); (3) zero console errors; (4) the internal auto-play bot
  (URL flag ?bot=1, ±20 ms jitter) completes 3 full runs without a crash.

=== ITERATION 2 — JUICE & AUDIO ===
- Particles: pool of 512 fixed objects allocated once at init — copper sparks
  (PERFECT), gold dust (GREAT), wave rings (GOOD); spawn = slot reset,
  ease-out-quart decay, off after ttl — follow engine/particles.js pool
  semantics. NO new/closures in RAF.
- Juice: trauma-model screen shake — trauma += 0.25 (PERFECT) / 0.12 (GREAT)
  / 0.05 (GOOD); offset = trauma² x 14 px x noise (3 sines at 13/47/89 Hz);
  decay 1.8/s; COMBO BREAK → trauma = 1 + a 60 ms red flash; everything
  clamped. Hitstop: 45 ms (PERFECT) / 25 ms (BREAK) world freeze, then
  timeScale eases back to 1 over 80 ms; UI and rims keep rendering.
- Audio: engine/audio.js contract — createAudio({ master: 0.4 }), context
  created lazily and unlocked on the first pointerdown, suspend on pause,
  mute state persisted; master chain masterGain → WaveShaper soft-clip →
  DynamicsCompressor → destination with a fixed −3 dB trim stage; one 2 s
  white-noise buffer generated once, looped. Master never starts > 0.5.
- Drum synth: PERFECT = pitch-drop sine 165 → 48 Hz, 120 ms decay + noise
  bandpass 1.8 kHz Q=8, 30 ms + inharmonic gong partials (1, 2.32, 3.01,
  4.27) x 130 Hz, 400 ms decay; gain = 0.5 + min(combo,50)/100. GREAT =
  148 → 50 Hz, 90 ms; GOOD = 120 → 55 Hz, 70 ms, no gong. Shadow-note hit =
  sub 40 Hz 150 ms + 2 saws detuned 110/116 Hz, 200 ms — the expensive "ugh".
  Lac Bird bonus (4% of notes) = sine 880 Hz vibrato 6 Hz depth 12 cents,
  glide 660 → 990 Hz, 250 ms.
- Adaptive music by Heat: Web Audio clock scheduler, 120 ms lookahead /
  25 ms timer (NEVER setInterval for note-on); layers unlock via 300 ms gain
  ramps: combo 0–8 base drums; 9–24 adds the bamboo phach layer (saw +
  lowpass sweep 300 → 1200 Hz); 25–49 adds a pentatonic arpeggio C-D-F-G-A
  (261.6/293.7/349.2/392.0/440.0 Hz); ≥ 50 adds the Lac Bird lead sine
  vibrato. BPM = 96 + heat x 0.4.
- C2: (1) event audio fires ≤ 5 ms after pointerdown; (2) the bot reaches
  combo ≥ 40 at ±28 ms jitter; (3) trauma/hitstop never stack past their
  clamps; (4) 3 heap snapshots across 5 min of bot play — heap flat (pool
  works); (5) network panel shows zero requests beyond the document;
  (6) tests/audio-contract.mjs passes.

=== ITERATION 3 — HARDENING, SAVE & I18N ===
- Visibility: document.hidden → suspend AudioContext, freeze accumulator,
  PAUSED overlay; on return a 3-2-1 countdown then resume; RAF fully stopped
  while hidden (0 CPU). loop.js stall clamp guards time jumps.
- Saves via engine/storage.js createStorage('bronze-drum-beat', 1, defaults,
  migrate): schema v1 = { bestScore, longestCombo, totalRuns, totalPlaytime,
  dailyStreak, settings {sfx, haptic, reduceFlash, lang} }. try/catch
  tolerant to corrupt/cleared/blocked storage → RAM-only fallback, game
  still runs; migration hook wired. Never raw localStorage.
- Near-miss: note hitbox = 0.8 x r_visual (debug flag ?hitbox=1 draws this
  layer). An empty tap (no note in the GOOD window) while the nearest bronze
  note sits within a 1.0 → 1.75x widened GOOD window → judged GRAZE: +3
  points, combo kept, purple GRAZE! label + 40 ms rim flash — the daring
  bonus; beyond 1.75x → plain MISS.
- Instant replay < 150 ms: 10-slot ring buffer (16.67 ms overwrite cycle)
  holding {t, notes[24] {lane, r, type}, theta, ringR, score}, copied by
  field assignment (no structuredClone); on death one 0.25x slow-motion pass
  with vignette + the PANIC! label; death-input → replay-start ≤ 150 ms
  (measured via performance.now, logged to console).
- Anti-GC in RAF: no string concat, no toFixed, no new closures, no DOM
  writes; UI text updates only on value change (dirty flags); number strings
  0..9999 precomputed.
- i18n (STR pattern, as shipped in games/gravity-juggle): all UI copy lives in
  STR tables — 'en' ships complete; 'vi' and 'lo' are reserved slots. Read via
  t(key); setLang(code) rebuilds every label; language persists in
  settings.lang; ?lang=xx URL override for QA. Zero hardcoded UI strings
  outside STR; system font stack only (no remote fonts).
- C3: (1) tab hidden 10 min burns no CPU; (2) reload mid-run keeps
  best/streak; (3) replay measured ≤ 150 ms; (4) 60 s of allocation
  instrumentation shows zero RAF allocations; (5) storage survives a corrupt
  payload; (6) live language switch rebuilds all labels, en table complete.

=== ACCEPTANCE CRITERIA (FINAL) ===
1. Repo-standard layout: games/bronze-drum-beat/ runs as a plain static site
   (ES modules over http://, python3 -m http.server), zero build, zero
   runtime network requests, procedural assets only, total payload ≤ 5 MB.
   Ships README.md (how to run, controls, tuning table) + GDD.md from
   docs/game-design-template.md.
2. 60 fps locked: average ≥ 59.4 fps, p99 frame ≤ 20 ms across 5 min of bot
   play; if it dips → auto-degrade particles 512 → 256 → 128, then drop
   gradient strokes.
3. Zero GC in RAF: allocations allowed only at init / entering the menu /
   starting a replay.
4. Cold start → first tap playable ≤ 1.5 s on a mid-range phone.
5. i18n-ready: every user-visible string keyed in STR; 'en' complete at ship;
   'vi'/'lo' drop in the moment translations land.
6. prefers-reduced-motion and the reduceFlash setting respected; autoplay
   policy respected (silent until first gesture).
7. Console self-test: C1/C2/C3 all PASS + 'BRONZE-DRUM READY'.
8. Definition of done: /game:qa bronze-drum-beat against
   docs/production-checklist.md, then /game:release gates.

=== UI COPY — STR ENTRIES ('en' ships; 'vi'/'lo' reserved) ===
  title1/2      BRONZE DRUM / LAC BIRD BEAT
  bootTap       TAP TO START
  tut0          TAP AS NOTES REACH THE RIM
  tut1          NEVER TOUCH THE SHADOW NOTES — LET THEM PASS
  tut2          DISCIPLINE PAYS — PASSED SHADOWS +2
  perfectCap    PERFECT      greatCap GREAT      goodCap GOOD      missCap MISS
  shadowCap     SHADOW
  grazeCap      GRAZE!      grazePts +3
  disciplineCap PASSED +2
  bonusCap      LAC BIRD!
  comboCap      COMBO      heatCap RHYTHM FIRE
  breakCap      COMBO BREAK
  dailyCap      DAILY CHALLENGE      streakCap DAY STREAK
  bestCap       BEST      scoreCap SCORE
  replayCap     REPLAY      panicCap PANIC!
  pauseCap      PAUSED      pauseTap TAP TO RESUME
  resCap        RESULTS      statCombo MAX COMBO
  btnRetry      RETRY       btnMenu MENU

=== TECHNICAL BLUEPRINT ===
- Palette, bronze-patina: radial bg #0D0B08 → #1A130C; drum rim conic
  #B87333 → #F4C430 → #8A5A2B; patina teal #43A69E (GREAT note rims);
  PERFECT #FFE082; GOOD #C08A3E; SHADOW note dark violet #2A1F3D rim
  #7C4DFF; LAC BIRD ivory #F8F4E3 with gold wings #F4C430; UI text #E8D9B5;
  warning #C3272B. Judgment glow shadowBlur 18 px (off when reduceFlash).
- Combo/Rhythm Fire: heat = min(50, combo); multiplier m = 1 + floor(combo/8)
  cap x8; PERFECT +100m, GREAT +60m, GOOD +30m, GRAZE +3, shadow pass +2.
  BREAK → heat = 0, 40% of the particle pool bursts, music collapses to
  layer 1. Combo pop scale 1.35 → 1.0 ease-out-back 180 ms at x2/x4/x8
  milestones + navigator.vibrate(10) when haptics are on.
- Physics: only 2 integrations (note r, θ) — no solver; O(1) collision per
  note, max 24 live notes, a tap is a simple radial distance check.
- Polish quarter: after every gate passes, the bot plays 3 different seeds;
  pick the 3 smallest-highest-impact game-feel tweaks (e.g. rim knock-back on
  PERFECT, grain vignette at max heat), ship them, and record the final
  [SHIPPED | FPS x | Alloc y | Replay z ms] numbers in the release notes.
- State machine: BOOT → MENU → COUNTDOWN → PLAY → REPLAY → RESULT; PAUSE
  overlay anytime (button + visibilitychange).
- Perf budget: p99 ≤ 20 ms @1080p/DPR2 mid-tier; zero allocations in the
  frame path.
```
