# TUNG HỨNG LỰC HẤP DẪN (GRAVITY JUGGLE)

- **Date:** 2026-09-01 · **Revised:** 2026-09-01 — aligned to repo standards: template/engine architecture (no monolithic one-file delivery), English UI copy behind an STR i18n table, saves via `engine/storage.js`.
- **Slug:** `tung-hung-luc-hap-dan` — target folder `games/tung-hung-luc-hap-dan/`
- **Genre:** Arcade One-Thumb Orbital Slingshot Climber — giữ ngón tay để bám quỹ đạo hành tinh, thả để văng theo tiếp tuyến, cạo sát thiên thạch để nuôi combo (score-chasing flow game)
- **Pitch:** Bạn là hạt comet leo lên vành đai gió giật chỉ bằng một ngón tay: giữ để móc quỹ đạo quanh hành tinh — nhưng quỹ đạo tự co dần vào lõi chết — thả đúng cung vàng để được hất vọt gia tốc. Càng liều cạo sát thiên thạch thì combo càng cháy, một nhịp lơ đãng là vỡ tan thành sao băng. Một ngón tay, một nhịp thở, một chuỗi nảy không hồi kết.
- **Origin:** GLM-5.3 (Z.AI Coding Plan); original Vietnamese brief "Tung Hứng Lực Hấp Dẫn (Gravity Juggle)".

---

## Master Prompt (production-ready, repo-conformant)

```text
/goal — STANDING GOAL: Ship game H5 Arcade one-thumb 'Tung Hưng Lực Hấp Dẫn' (orbital slingshot climber) chuẩn Enterprise Arcade Studio, thương mại hoá được (tier Voodoo/Ketchapp): 1 file duy nhất, offline 100%, 60 FPS locked trên Android trung cấp 2019, zero-GC trong game loop, âm thanh + nhạc synth 100% WebAudio (0 asset ngoài), đầy đủ juice chuyên nghiệp (hitstop, screen shake, instant replay, meta-progression, pacing theo dữ liệu). Phân biệt tuyệt đối với demo amateur: deterministic, có QA checklist tự nghiệm từng bước, console sạch tuyệt đối.

ROLE: Bạn vừa là Game Director vừa là Lead Engineer. Tự do tinh chỉnh chi tiết kỹ thuật, nhưng KHÔNG được vi phạm bất kỳ mục nào trong Enterprise Acceptance Criteria.

GAME PITCH: Người chơi là hạt comet bay lên trong hành lang dọc 1080x1920 full các hành tinh + thiên thạch trôi. GIỮ ngón tay = móc vào trường hấp dẫn hành tinh ứng viên, xoay quanh quỹ đạo — quỹ đạo co spiral dần vào lõi chết nên không thể camp. THẢ = văng theo tiếp tuyến; thả đúng boost-arc vàng trên vành quỹ đạo = PERFECT (+28% tốc độ). Cạo sát thiên thạch (graze) mà không chạm = combo tăng. Chỉ một ngón tay, chỉ nhịp giữ-thả.

AUTONOMOUS ITERATION LOOP (bắt buộc): Mỗi iteration = PLAN → CODE → SELF-AUDIT theo checklist riêng → xác định BIGGEST FLAW còn sót → fix ngay trong iteration đó. Chỉ được chuyển iteration kế khi checklist 100%. Cấm kiểu 'sẽ fix sau'. Sau Iteration 3 phải tự chấm toàn bộ A1–A12 kèm số đo.

=== ITERATION 1 — CORE ENGINE ===
- Canvas 1080x1920 logical, HiDPI: canvas.width = 1080 * min(devicePixelRatio, 2), setTransform scale, letterbox giữ tỉ lệ 9:16 an toàn mọi màn hình; context { alpha:false, desynchronized:true }.
- Fixed-step physics: accumulator dt = 1/120 s, clamp frameDelta <= 0.25 s, semi-implicit Euler; render nội suy alpha = acc/dt giữa state prev/cur (mọi thực thể lưu prevX/prevY/prevRot).
- Input 1-thumb: pointerdown bất kỳ đâu = bám hành tinh ứng viên (trong capture cone +-60 độ hướng lên, dist < 560 px; có guide-line chấm khi ứng viên tồn tại); pointerup = thả. touch-action:none, preventDefault, không swipe/drag. Desktop QA: phím Space.
- Vật lý: Tự do: v += wind*dt; v *= exp(-0.15*dt); p += v*dt. Khi bám: r0 = clamp(dist, R+26, R+140); omega0 = cross(d, v)/dist^2 (giữ dấu); clamp |omega0| >= 1.8 rad/s; mỗi tick: omega += (260/r)*dt (gravity-assist), r -= 34*dt (quỹ đạo co dần), theta += omega*dt, p = planet + r*(cos, sin). Thả: v = omega*r theo tiếp tuyến; theta trong boost-arc 26 độ (random mỗi lần bám) = PERFECT: |v| *= 1.28, snap chuẩn tiếp tuyến.
- Va chạm: hurtbox = 0.8 x visual radius; chết khi chạm lõi hành tinh (r_core = 0.42R), thiên thạch circle-circle, hoặc tụt dưới camera bottom + 160 px. Tường mềm x trong [60, 1020], restitution 0.6.
- Camera pogo: chỉ đi lên, y = min(y, player.y - 672); altitude = maxAlt/10 (m) là score nền.
- Layout deterministic: mulberry32(seed); daily-seed mode cho fairness leaderboard.
- State machine: BOOT → MENU → TUTORIAL (chạy 1 lần, 3 cú có mũi tên chỉ dẫn) → RUN → REPLAY → RESULTS → RUN/MENU; fade 180 ms.
- CHECKLIST I1: render đúng trên dpr 1/2/3; climb 60 s mượt; tab lag không đổi kết quả physics (nhờ clamp accumulator); re-seed → layout giống hệt.

=== ITERATION 2 — ENTERPRISE JUICE ===
- Particle pooling: 512 object preallocated + free-list; 4 loại: trail, spark, shatter, ring; spawn mượn từ pool, không closure, không 'new' trong loop.
- Screen shake: trauma thuộc [0,1]; offset = trauma^2 * 14 px * noise; decay 1.6/s; graze +0.15, perfect +0.25, crash +1 kèm bias hướng va chạm.
- Hitstop (timeScale = 0): graze đầu chuỗi 20 ms, perfect 45 ms, crash 180 ms rồi mới shatter + replay.
- Procedural WebAudio 0-asset: unlockAudio tại pointerdown đầu tiên (resume AudioContext); chain masterGain → soft-clip WaveShaper → DynamicsCompressor → destination; bảng tần số ở BLUEPRINT mục 5; music pad scheduler setInterval 25 ms lookahead 120 ms.
- Comet juice: trail 3 lớp alpha, core pulse theo |omega|; perfect = ring shockwave + flash #FFE066; crash = shatter 90 mảnh.
- CHECKLIST I2: heap không tăng khi spam particle 60 s; mọi SFX phát đúng sự kiện; không autoplay-policy violation; JS budget <= 8 ms/frame.

=== ITERATION 3 — ENTERPRISE HARDENING ===
- Visibility API: visibilitychange + pagehide → cancelAnimationFrame, audioCtx.suspend(), overlay RESUME cần tap (countdown 3-2-1, không auto-resume); RAF chỉ chạy khi visible.
- LocalStorage: key 'thlhd_v1' = { bestScore, bestAlt, totalRuns, skins, muted, tutorialDone }; try/catch + merge defaults chống corrupt; throttle ghi 2 s + flush khi pagehide.
- Near-miss: hurtbox 0.8 x visual (đã cài I1); graze band = asteroidR + 26 px, mỗi thiên thạch 1 lần/700 ms → +combo + spark + whoosh; debug overlay (tap 3 ngón) vẽ hitbox thật vs visual để nghiệm thu A11.
- Instant Replay < 150 ms: ring buffer Float32Array x 6 field (px, py, rot, camY, anchorIdx, tension), 30 Hz x 75 frame = 2.5 s; khi crash render ngay frame replay đầu trong cùng tick hitstop (đồng bộ) — đo performance.now() từ impact tới frame đầu <= 150 ms; playback 0.4x speed + vignette + label IMPACT + vạch đỏ hitbox.
- Soak test 10 phút với auto-play bot (input từ PRNG seed): không crash, console sạch.
- CHECKLIST I3: đạt đủ A1–A12 với số đo kèm theo.

=== ENTERPRISE ACCEPTANCE CRITERIA (không thương lượng, đo được) ===
A1 Standalone 100%: 1 file index.html duy nhất (HTML+CSS+JS inline, <= 120 KB); mở bằng file:// + airplane mode; DevTools Network: 0 request ngoài.
A2 0 asset ngoài: không image/font/audio file; visual 100% Canvas2D, audio 100% WebAudio synthesis.
A3 60 FPS locked: Performance 60 s gameplay — không frame nào > 16 ms (trừ cold start); JS <= 8 ms/frame máy trung cấp 2019; auto quality scale: rolling avg > 20 ms/120 frame → giảm particle 512 → 256 → 128 và tắt glow.
A4 0 GC trong RAF: allocation sampling steady-state ~ 0 B/s trong 60 s; cấm new/array-literal/string-concat/closure trong update/render; HUD số vẽ offscreen cache khi đổi; gradient tạo 1 lần lúc resize.
A5 1-thumb hoàn chỉnh: toàn vòng chơi bằng 1 ngón; input → render < 50 ms; chặn scroll/zoom/double-tap-zoom.
A6 Deterministic: cùng seed → cùng layout + cùng kết quả physics nhờ fixed-step 120 Hz.
A7 Audio unlock đúng gesture đầu; mute được và lưu qua phiên.
A8 Tab pause: rời tab giữa RUN → dừng toàn bộ + suspend audio; quay lại thấy overlay resume.
A9 Crash → replay hiển thị <= 150 ms (đo performance.now()).
A10 LocalStorage corrupt → fallback default, không crash.
A11 Near-miss hitbox -20% xác minh bằng debug overlay (0.8 x visual).
A12 'use strict'; console 0 error 0 warning; soak 10 phút sạch.

=== TECHNICAL BLUEPRINT (chuẩn implement — được phép tinh chỉnh hằng số nếu giữ nguyên cảm giác) ===
1) PALETTE/GRADIENT: BG dọc 3 stop #05060E → #101A3A → #2B1055; 3 lớp sao parallax alpha .35/.55/.8 tốc .1/.25/.45 x camera; 2 nebula radial #7F5AF0 và #FF5C8A blend screen alpha .10; lõi hành tinh #FF3860; vành quỹ đạo gradient #5CE1FF → #7F5AF0 lineWidth 3; boost-arc #FFE066 lineWidth 6; comet core #FFF7E6, trail #FFD166 → #FF5C8A → transparent; HUD #EAF2FF; combo flare #FFE066; contrast HUD >= 4.5:1.
2) PHYSICS CONSTANTS: G_ASSIST = 260 px/s2; CONTRACT = 34 px/s; CAPTURE_DIST = 560 px; CONE = +-60 độ; r0 thuộc [R+26, R+140]; omega_min = 1.8 rad/s; PERFECT_ARC = 26 độ (thắt về 16 theo độ khó); PERFECT_BOOST = 1.28; wall restitution = 0.6; r_core = 0.42R; drag tự do exp(-0.15dt); tốc co quỹ đạo +8%/1000m.
3) DIFFICULTY PACING (mỗi 500 m): gap hành tinh 300 → 170 px; mật độ thiên thạch 0 → 0.8/hành tinh; wind +-40 px/s từ 1500 m; R hành tinh random 46–90.
4) COMBO/SCORE: graze +1 combo, perfect +2; mult = 1 + 0.5 x floor(combo/5), cap x8; combo decay sau 4 s không event (thanh drain hiển thị trên đầu); score = altitude(m) x 10 + Sum(base x mult) với perfect 150, graze 40; RESULTS hiện NEW BEST + unlock skin theo mốc 500/1500/3000 m (lưu LocalStorage) + share-to-clipboard.
5) SYNTH (Hz, 0-asset): attach = triangle 220 → 88 exp 80 ms gain .18; release = sine pluck pentatonic Am [220, 261.63, 293.66, 329.63, 392] chọn planetIdx mod 5, decay 250 ms; perfect = thêm sine 2f gain .12 decay 300 ms + sub 55 Hz 100 ms; graze = white noise 60 ms qua bandpass 1800 Hz Q4 gain .20; crash = sine 140 → 30 exp 400 ms + noise lowpass 500 Hz 300 ms; tether hum = 2 saw detune 110 & 110.7 Hz, lowpass 400 Hz, f = 110 x clamp(|omega|/3, .6, 2.4); UI tick = square 660 Hz 30 ms; MUSIC = pad 4 hợp âm Am–F–C–G mỗi 2 s, mỗi hợp âm 3 triangle (root, fifth, tenth) root 110/87.31/130.81/98 Hz, filter LFO .1 Hz sweep 400 → 1200 Hz, gain .05.
6) PARTICLES: pool 512 — trail 2/frame, graze spark 8, crash shatter 90, perfect ring expand 480 px/s fade .5 s.
7) REPLAY: Float32Array ring x 6 field, 30 Hz, 75 frame, playback 0.4x, vignette alpha .5, freeze IMPACT + vạch đỏ hitbox thật vs visual.
8) DELIVERABLE: 1 file index.html chạy Chrome/Edge/Firefox/Safari mobile <= 2 năm tuổi; sau Iteration 3 tự chấm A1–A12 và xuất báo cáo tick kèm số đo.
```
