# Tơ Trọng Lực — Vòng Quỹ Đạo Vô Tận

- **Ngày:** 2026-08-22
- **Genre:** Arcade One-Thumb Orbital-Slingshot / Endless Vertical Climber (Cơ chế cốt lõi: giữ ngón tay để neo tơ vào giếng trọng lực và xoay quanh quỹ đạo, thả tay để bắn tiếp tuyến — chuỗi hook-nhả tạo năng lượng leo vô tận)
- **Mô tả:** Bạn là một sao chổi tự do trong giếng không gian dọc vô tận: giữ để quấn tơ quanh giếng trọng lực gần nhất và swing, thả đúng khoảnh khắc để slingshot vọt lên, lướt sượt hiểm họa lấy combo Graze và chạm tới độ cao chưa từng có.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — STANDING GOAL (Chuẩn Enterprise Arcade Studio)
Xây dựng 'Tơ Trọng Lực' thành vertical slice THƯƠNG MẠI: một file HTML duy nhất chạy 100% offline, chơi được trong 3 giây kể từ khi mở, giữ chân người chơi ≥ 5 phút/run, có vòng lặp retry-scores-under-60s và cảm giác 'chỉ thêm một lần nữa'. Phân biệt tuyệt đối với game amateur bởi: (1) Fixed-step deterministic physics 120 Hz tách hoàn toàn khỏi render; (2) Render loop 0 garbage allocation; (3) Âm thanh procedural WebAudio 0-asset với unlock-gesture đúng chuẩn mobile; (4) Juice pass chuyên nghiệp (trauma shake, hitstop, particle pooling); (5) Hardening sản xuất (tab pause, save schema versioned, instant replay); (6) Thiết kế retention: combo decay, near-miss graze, overdrive — mọi hệ thống phục vụ dopamine loop. Khẩu hiệu nội bộ: 'Mỗi lần thả tay là một nhịp thở'.

=== AUTONOMOUS ITERATION LOOP (agent tự lặp, không dừng giữa chừng) ===

[ITERATION 1 — CORE ENGINE] Xây nền, chơi được ngay:
- Một file index.html duy nhất, <canvas> 2D portrait 9:16, HiDPI 1080p: canvas.width = cssW × dpr (clamp dpr 1.0–2.5), ctx.setTransform(dpr,0,0,dpr,0,0), resize listener + visualViewport fallback.
- State machine: BOOT → MENU → RUN → PAUSE → REPLAY → DEAD. Không dùng biến rải rác.
- Fixed-step loop: accumulator, STEP = 1/120s, clamp frame delta ≤ 0.25s, render với interpolation alpha (prevX/nextX lerp). RAF duy nhất, không setTimeout song song.
- Input 1-thumb: pointerdown = tether vào giếng trọng lực GẦN NHẤT trong bán kính neo; pointerup = thả, bắn tiếp tuyến. Chỉ 2 sự kiện, tổng.delegate trên window, passive:true, preventDefault touchmove để chống scroll.
- Vật lý (đơn vị px/s, px/s²): tự do vx,vy giữ nguyên + gravity gy = 180; khi neo: ω khởi tạo = (v·tangent)/r, mỗi tick ω += K/(r²)·dt với K = 9.2e5 (gravity-assist nhẹ), θ += ω·dt, vị trí x = cx + r·cosθ, y = cy + r·sinθ; thả: vx = −r·ω·sinθ, vy = r·ω·cosθ. Ràng buộc |ω| ≤ 6.5 rad/s để không dizzy.
- Camera dọc: follow lerp 1 − e^(−8·dt), deadzone 60px, chỉ đi lên (không tụt dưới mức cao nhất đã đạt).
- Spawn Director: giếng trọng lực cách nhau 260–420px dọc, offset ngang ±110px, r ∈ [70,140]px; mật độ vật cản ρ(h) = 0.15 + (h/50000)·0.35 (cap 0.5); score ring xuất hiện từ h > 800, góc ngẫu nhiên quanh giếng.
- Chết: chạm vật cản, rơi khỏi đáy màn hình, hoặc 8s không neo được giếng nào (anti-stall).
- GATE 1: Fun trong 10 giây đầu, full loop MENU→RUN→DEAD→retry hoạt động, 60 FPS trên desktop.

[ITERATION 2 — ENTERPRISE JUICE] Cảm giác 'đắt tiền':
- Particle pool: mảng 512 particle pre-allocated, free-list swap-remove (p[i] = p[count−1]; count−−), tuyệt đối không splice/push trong RAF.
- Screen shake hệ trauma: shake = trauma², trauma ∈ [0,1], decay 1.5/s, offset = shake · 14px · (noise), kẹp ±8px để không gây chóng mặt.
- Hitstop: gần-trúng/hazard → timescale 0.05 trong 60–90ms (bằng cách nhân STEP vào accumulator feed), không dùng Date.now() trong logic.
- Comet squash-stretch theo vector vận tốc, trail ribbon 24 điểm pre-allocated (mảng hình học reused, no concat).
- Procedural WebAudio 0-asset: hàm unlockAudio() resume AudioContext ở gesture đầu; master chain = DynamicsCompressor → Gain(0.8). Bảng synth: neo (sine 220→440Hz gliss 80ms), thả (triangle pluck 520Hz exp-decay 0.15s), collect ladder ngũ cung C-major pentatonic 523.25 / 587.33 / 659.25 / 783.99 / 880.00 Hz leo theo combo (clamp bậc 8), chết (noise buffer + lowpass 200Hz + saw 110Hz detune +7 cents), graze whoosh (filtered noise sweep 300→3000Hz, Q=4). Ambient pad: 2 saw detune 55.0/55.5Hz qua lowpass LFO 0.1Hz — bật ở MENU, duck −12dB khi RUN.
- Haptics: navigator.vibrate?.(10) khi neo/graze (nếu setting bật).
- GATE 2: 'Feel checklist' đạt ≥ 9/10 (mỗi action có âm + hình + rung; mọi thứ phản hồi trong cùng 1 frame input).

[ITERATION 3 — ENTERPRISE HARDENING] Sống sót ngoài thế giới thực:
- Visibility API: document.hidden → pause + audioCtx.suspend(); visible → đếm ngược 3-2-1 resume + audioCtx.resume(). Cấm autoplay policy violation.
- LocalStorage schema v1 (JSON, try/catch toàn bộ, key 'ttlv.save.v1'): bestScore, bestHeight, totalRuns, settings {mute, haptics, quality}, kèm migration switch cho tương lai.
- Near-miss system: hitbox hiển thị của hazard = 100%, hitbox THỰC = −20% kích thước; lướt trong vùng graze (hitbox thực → hitbox hiển thị +18px) → +graze point, charge thanh Overdrive; đầy → 5s timescale 0.6 + điểm ×2 + nhạc thêm layer arpeggio.
- Instant Replay: ring buffer 3s × 60样本 (mảng pre-allocated 180 phần tử {x,y,theta,alive} vòng tròn ghi đè), khi chết → replay 0.5× tốc độ với letterbox + nhãn 'REPLAY', chuyển cảnh < 150ms (chỉ đổi state, không khởi tạo gì mới).
- FPS governor: nếu rolling avg FPS < 52 trong 2s → tự giảm particle budget 50%, tắt trail ribbon, giảm dpr 1 nấc (tối thiểu 1.0).
- GATE 3: toàn bộ Acceptance Criteria pass mới được dừng.

=== ENTERPRISE ACCEPTANCE CRITERIA (NGHIỆM THU CUỐI) ===
1. Standalone 100%: một file HTML duy nhất, không network request nào (không fetch/XHR/font/img/CSS ngoài), mở offline bằng file:// vẫn chạy.
2. 60 FPS locked: duy trì 60 FPS @ 1080p HiDPI trên thiết bị Android tầm trung 2019; không drop > 1 frame / 10s trong gameplay chuẩn.
3. 0 GC allocation trong RAF: không tạo object/array/closure/string nối trong vòng render; mọi vector, particle, audio node tái sử dụng pool; xác minh bằng DevTools Allocation instrumentation trên stack 'requestAnimationFrame'.
4. Input latency cảm nhận ≤ 32ms từ pointerdown tới thay đổi khung hình; 1-thumb portrait, mọi UI chạm được bằng ngón cái.
5. Âm thanh chỉ phát sinh sau gesture đầu tiên (unlockAudio), không console error nào toàn phiên.
6. Deterministic: cùng seed spawn → cùng chuỗi giếng (seeded PRNG mulberry32, seed lưu trong replay).

=== TECHNICAL BLUEPRINT (GLM Director định nghĩa chi tiết) ===
- BẢNG MÀU (gradient thương hiệu 'Neon Void'): nền dọc #050510 → #0D1B2A → #1B263B (canvas fill gradient tạo 1 lần/lưu); giếng trọng lực = cyan #00F5FF với lõi gradient radial alpha 0.9→0.0; hazard = magenta #FF2E88 viền 2px + ruột #2B0A18; sao/phần thưởng = gold #FFD166 pulse sin(t·4); comet người chơi = trắng #FFFFFF với trail gradient cyan→trong suốt; từ độ cao 20000px nền bắt đầu hue-drift +0.5°/s (HSL shift cả palette) báo hiệu zone mới. UI font: system-ui stack, số điểm dùng tabular-nums.
- CÔNG THỨC VẬT LÝ: như Iteration 1, bổ sung: damping khi neo r += (targetR − r)·(1 − e^(−10·dt)) để tơ 'giật' tự nhiên; tơ vẽ dạng quadratic bezier cong theo phương pháp %% vận tốc, độ cong tỉ lệ |ω|.
- COMBO SYSTEM: Perfect Release (thả trong ±12° quanh tâm score ring) → combo+1; hệ số điểm mult = 1 + combo·0.25 (cap ×8); combo decay 4s không perfect → reset; graze +10·mult, collect +50·mult, height +floor(Δy/10). Text popup '+50 ×4' bay lên 40px fade 0.6s (pool text riêng, không tạo chuỗi mới — dùng cache theo số nguyên).
- SPAWN/DIFFICULTY: speed-run cảm giác: 0–15s dễ (chỉ giếng), 15–45s thêm hazard tĩnh, >45s hazard chuyển động sin(t·0.8)·30px; mỗi 10000px = 1 zone banner 'ĐỈNH CẢNH k' + sting âm 2 nốt (659.25→880Hz).
- CẤU TRÚC CODE: IIFE strict mode, 4 module đối tượng: Engine (loop/resize), Physics (fixed-step thuần, không đọc DOM), Render (ctx thuần, dirty-state tối thiểu), Audio (lazy init sau unlock). Không framework, không class thừa — Simplicity Over Abstraction.
```
