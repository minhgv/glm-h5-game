# Sóng Đêm — Nightwave

- **Ngày:** 2026-08-24
- **Genre:** Endless One-Thumb Arcade / Rhythm-Survival — core mechanic 'Wave-Bending': điều khiển biên độ sóng bằng spring-damper, obstacle khoá beat-grid 128 BPM, near-miss graze scoring, combo Flow state
- **Mô tả:** Một ngón tay, một con sóng: giữ để dồn biên độ vọt lên, thả để rơi tự do — bạn không điều khiển nhân vật, bạn uốn cả dải sóng phát quang để luồn cổng theo nhịp 128 BPM. Cảm giác chơi mượt như lụa và nghiện kiểu one-more-run: mỗi lần cưa sát cái chết (near-miss) là một lần score nổ tung.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
MASTER PROMPT — SÓNG ĐÊM (NIGHTWAVE)

0. VAI TRÒ: Bạn là Lead Engineer kiêm Game Director của một studio arcade thương mại. Nhiệm vụ: SHIP sản phẩm hoàn chỉnh (không phải prototype, không phải demo học tập). Toàn bộ code nằm trong 1 file index.html, không dependency, không asset ngoài, chạy offline.

1. /goal (STANDING GOAL):
- Ship Sóng Đêm — arcade H5 one-thumb, single-file 100%, thương mại hoá được lên portal web (chuẩn CrazyGames/Poki) và dùng được cho ad-campaign retention.
- Định vị ENTERPRISE (khác biệt tuyệt đối với game amateur): deterministic fixed-step core; zero-GC runtime; audio-visual sync theo beat grid; meta tối thiểu (best score, combo tiers, Flow state); self-QA checklist tự chạy trước khi tuyên bố done.
- KPI: run length 60–120s; death→retry < 1.5s; input→pixel ≤ 1 rendered frame; frame p95 ≤ 16.9ms trên máy tầm trung (4× CPU throttle vẫn ≥ 55fps).

2. AUTONOMOUS ITERATION LOOP (BẮT BUỘC):
Làm tuần tự 3 iteration. Sau MỖI iteration: (a) tự chạy checklist nghiệm thu của iteration đó (node --check cho JS, mở Chromium record Performance 30s nếu có); (b) liệt kê verdict PASS/FAIL từng mục; (c) nếu FAIL → sửa rồi kiểm lại, tối đa 3 vòng sửa mỗi iteration; (d) chỉ sang iteration kế khi 100% PASS. Không hỏi user, không hạ tiêu chuẩn, không xoá mục checklist.

ITERATION 1 — CORE ENGINE (greybox chơi được):
- Canvas 1080×1920 portrait (design space cố định), HiDPI: canvas.width = cssW × min(devicePixelRatio, 2); ctx.setTransform về design space; handler resize/orientationchange; tôn trọng safe-area inset.
- Fixed-step physics: SIM_HZ = 120 (dt = 1/120s), accumulator pattern, render interpolation bằng alpha = acc/dt, guard spiral-of-death (max 5 step/frame).
- Input 1-thumb: pointerdown = GIỮ (dồn biên độ lên), pointerup = THẢ (rơi); touch-action none; pointer events thống nhất chuột/cảm ứng; input ghi ở event, áp dụng ở step (không đọc trong render).
- Player: hạt điện phát quang, core 18×18 design px; spring-damper: a = k×(targetY − y) − c×v với k = 180 s⁻², c = 22 s⁻¹ (ζ ≈ 0.82); giữ → targetY ở 25% phía trên màn, thả → 75% phía dưới, chuyển tiếp smoothstep 220ms; biên clamp với restitution 0.25.
- Wave-trail: chuỗi 24 node verlet sau player, mỗi step y_i += (y_{i−1} − y_i) × 0.35; vẽ ribbon gradient — đây là 'ký ức sóng', chủ đề thị giác trung tâm của game.
- World scroll: v = 420 + 18×level design px/s; level = floor(measures ÷ 8); spawner theo distance map, deterministic bằng mulberry32(seed = runId).
- 3 archetype hazard: GATE (khe hở clamp(320 − 8×level, 190, 320) px), ROTOR (thanh quay ω = 1.2–2.4 rad/s), PULSE-MINE (nổ theo beat, cảnh báo bán kính trước 600ms).
- Collision circle-vs-AABB; state machine BOOT → MENU → RUN → DEAD → REPLAY; run đầu chết trong < 90s, không tutorial text (học bằng chết).
- CHECKLIST I1: chơi end-to-end (menu→chết→retry); 60fps greybox; không bị swallow scroll/zoom; pause khi mất focus (tạm blur event, iteration 3 nâng cấp Visibility API).

ITERATION 2 — ENTERPRISE JUICE:
- ParticlePool 512 preallocated (fixed fields + freelist, never resize): gate-pass spark, tail ember, crystal smash, death shatter.
- Screen shake trauma²: trauma ∈ [0,1], decay 1.6/s; offset = 14 × trauma² × noise; death set trauma = 1, crystal = 0.35.
- Hitstop: freeze sim 110ms lúc chết, 45ms lúc smash crystal (render vẫn vẽ, chỉ dừng update).
- Procedural WebAudio 0-asset: unlockAudio() ở gesture đầu tiên (tạo/resume AudioContext); master chain: DynamicsCompressor(threshold −18dB, knee 24, ratio 6) → WaveShaper soft-clip → destination.
- Beat engine: BPM 128; scheduler setInterval 25ms, lookahead 0.12s (pattern Chris Wilson); kick = sine pitch-drop 160→42Hz, 90ms, gain 0.9 mỗi beat; clap beat 2&4 = noise bandpass 1.8kHz, 120ms; hat offbeat = noise highpass 8.5kHz, 35ms, gain 0.18; bass A1 55Hz saw → lowpass 320Hz, pattern 16th; lead pluck (triangle, decay 0.28s) chơi pentatonic A minor [220.00, 261.63, 293.66, 329.63, 392.00, 440.00] khi lên combo tier; death = saw pitch-bend 400→60Hz 0.6s + noise wash, music bus duck về 0.25 rồi ramp lại.
- Obstacle spawn khoá vào beat grid (1 measure = 1.875s → distance = v × beat) để gameplay 'đập' theo nhạc.
- Visual: bg gradient dọc #05060F → #0B1030 → #1A0B3C; player/trail neon cyan→magenta (#21D4FD → #3A7BD5 → #FF2E88); combo gold #FFC93C; 2 lớp parallax sao + lưới mờ; bloom bằng shadowBlur có budget (tối đa 6 shadow-draw mỗi frame).
- Haptics: navigator.vibrate guard try/catch — 10ms mỗi gate, 30ms death.
- CHECKLIST I2: audio bắt đầu đúng gesture đầu; hazard spawn khớp beat (verify bằng timestamp); burst 200 particle không jank; mọi hiệu ứng qua pool (0 từ khoá new trong game loop).

ITERATION 3 — ENTERPRISE HARDENING:
- Visibility API: document.visibilitychange → PAUSE (sim freeze + audioCtx.suspend()); resume → đếm 3-2-1 nhanh 500ms + grace 300ms (không hazard mới, player bất tử 300ms).
- LocalStorage (try/catch mọi thao tác): nightwave.v1.best, nightwave.v1.settings (music/sfx/haptics), nightwave.v1.stats (runs, totalScore, bestCombo, maxLevel); schema versioned + migrate; nút reset trong menu.
- Near-miss (−20%): lethal hitbox = 80% visual (18 → 14.4px); graze band = hazard phóng +20%; overlap(graze) && !overlap(lethal), mỗi hazard tính 1 lần → EDGE+ (điểm + spark + tick sound).
- Instant Replay < 150ms: ring buffer 9 snapshot @ 60Hz (Float32Array: player y,v + hazard ids/pos + trauma + time); chết → chuyển REPLAY ngay trong cùng frame, playback 0.25× tốc độ kèm grayscale 60%, kết thúc shatter 160 mảnh; đo death→replay-start bằng performance.now, phải < 150ms.
- Anti-frustration: 2 chết liên tiếp trong 15s ở cùng archetype → giảm 5% spawn rate archetype đó trong run (soft rubber-band, âm thầm).
- CHECKLIST I3: switch tab giữa chừng → pause cả vật lý lẫn âm thanh, quay lại không mất state; kill app → mở lại vẫn giữ best/settings; near-miss verify bằng hazard tĩnh setup tay; replay start < 150ms.

3. ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu cuối — TẤT CẢ phải PASS):
- AC1 Standalone 100%: 1 file index.html, 0 dependency, 0 request ngoài document (DevTools Network chỉ có document; airplane-mode vẫn chạy đầy đủ âm thanh + hiệu ứng).
- AC2 60 FPS locked: p95 frame ≤ 16.9ms, không frame > 33ms trong 3 phút gameplay trên máy tầm trung; 4× CPU throttle vẫn ≥ 55fps.
- AC3 0 GC trong RAF: JS Heap phẳng suốt 3 phút (chỉ sawtooth nhỏ từ WebAudio); self-audit: không new/closure/array-literal/object-literal/string-concat trong RAF và step; score vẽ bằng glyph-atlas offscreen cached, không fillText số mỗi frame.
- AC4 Input: 1 thumb, portrait, touch-action none, input→pixel ≤ 1 frame, double-tap không zoom (viewport meta + user-scalable=no).
- AC5 Persistence & pause: best/settings/stats sống qua reload; visibilitychange pause < 1 frame.
- AC6 Replay: death→replay < 150ms, playback 0.25× mượt.
- AC7 Clean console: 0 error/warning; 'use strict' toàn bộ; chạy trên Chrome/Safari/Firefox mobile mới nhất.

4. TECHNICAL BLUEPRINT (tham số bắt buộc):
- Palette: bg #05060F→#0B1030→#1A0B3C; cyan #21D4FD; blue #3A7BD5; magenta #FF2E88; gold #FFC93C; trắng quang #EAF6FF; trail alpha 0.9→0.
- Physics: SIM_HZ 120; spring k=180, c=22; verlet trail s=0.35; rotor ω=1.2–2.4 rad/s; scroll v=420+18×level; gap=clamp(320−8×level, 190, 320).
- Audio: pentatonic A minor [220.00, 261.63, 293.66, 329.63, 392.00, 440.00]; bass 55Hz; kick 160→42Hz; BPM 128; scheduler 25ms / lookahead 120ms.
- COMBO SYSTEM: gate pass = 100×mult; crystal = 40×mult; EDGE+ = 15 điểm + 25% bonus gate kế tiếp; streak tăng mỗi hành động thành công; mult = 1 + floor(streak/4), cap ×8; combo decay timer 4.0s (refresh mỗi hành động); FLOW MODE ở ×8: speed +12%, score ×1.5, trail gradient chromatic + thêm 1 voice nhạc; chết mất toàn bộ streak.
- Replay: 9 frame × 60Hz Float32Array ring; playback 0.25×; shatter 160 mảnh từ pool 256.
- Pools: particle 512, shard 256, float-text 24 (glyph atlas); pattern: fixed fields + freelist index.
- Code layout trong 1 file: IIFE 'use strict'; module objects: Config, RNG(mulberry32), Audio, Input, Pools, Wave, Player, Hazards, Replay, Storage, UI, Loop(accumulator). Không framework, không build step.
- 0-GC rules: reuse vector tmp; for-loop thay forEach/map; không build string score mỗi frame; event handler không tạo object; mọi hằng số hoisting ra ngoài loop.
- SELF-QA cuối: mở file, record 60s, verify AC1→AC7, xuất bảng PASS/FAIL trước khi khai báo hoàn thành.
```
