# Nebula Wisp: Graze the Storm

- **Ngày:** 2026-08-22
- **Genre:** Arcade/Casual — One-thumb bullet-hell graze-runner: điều khiển 1 ngón tay, đuôi verlet vật lý vừa là mồi nhử vừa là cảm biến điểm
- **Mô tả:** Bạn là một đuıt sao băng trôi qua chiến trường tinh vân: càng để đạn sut sát đuôi mà không chạm lõi, điểm và hệ số combo càng nổ tung — cột mốc duy nhất giữa 'an toàn nhàm chán' và 'phủi bụi sáng chói' là 2.2 bán kính của chính bạn.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — STANDING GOAL (Enterprise Arcade Standard)
Xây dựng NEBULA WISP: graze-runner H5 thương mại trong 1 file .html duy nhất, chạy 100% offline, zero asset ngoài, zero dependency. Mục tiêu cảm xúc: người chơi 'cảm nhận độ ngon' trong 3 giây đầu (trail glow + graze chime), core loop 30 giây, retention qua score-chasing combo. Ranh giới enterprise vs amateur: 60FPS locked trên GPU tích hợp, zero-GC trong RAF, audio procedural giải phóng bằng cử chỉ đầu tiên, tự hoàn thiện qua 3 iteration tự trị — không bao giờ giao sản phẩm nếu checklist iteration chưa pass.

=== AUTONOMOUS ITERATION LOOP ===
Sau MOỖI iteration: agent tự chạy checklist nghiệm thu (console 0 error, 60s gameplay tay-test, frame-time median), nếu FAIL → sửa rồi mới được sang iteration tiếp. Không được gộp iteration.

[ITERATION 1 — CORE ENGINE]
- Canvas 1920x1080 logic-scale, hiDPI: canvas.width = cssW * devicePixelRatio, ctx.setTransform scale, letterbox giữ tỉ lệ.
- Game loop: accumulator fixed-step dt = 1/120 (physics 120Hz), render mỗi RAF với nội suy alpha = acc/dt; timescale global để phục vụ hitstop sau này.
- Input 1-thumb: pointerdown/move/up duy nhất; touch point = target; wisp head tìm target bằng lò xo; không pointer lock, không bàn phím bắt buộc.
- Đuôi verlet: 24 segment, 3 lần lặp ràng buộc khoảng cách, segLen 14px (scale 1080p).
- Spawn Director: intensity I(t) = 1 + 0.018*t; interval spawn = max(0.28, 1.1/I); 3 loại hazard: asteroid trôi thẳng, plasma lance có telegraph 0.6s, drone homing lò xo yếu.
- Collision tròn đơn giản + graze annulus; render gray-box (wireframe) chưa cần đẹp.
  PASS KHI: chơi liền tay 60s không lỗi, 60fps, head bám ngón trong ≤1 frame.

[ITERATION 2 — ENTERPRISE JUICE]
- Particle pool: 512 object preallocate, free-list array hoán đổi cuối (swap-pop), KHÔNG splice, KHÔNG new trong loop; render bằng globalCompositeOperation 'lighter'.
- Screen shake mô hình trauma²: shake += 0.4 khi dính đòn, += 0.08 mỗi graze; biên độ = trauma² * 14px @1080p, trauma decay 1.4/s, clamp [0,1]; dịch transform canvas — không dịch DOM.
- Hitstop: timescale = 0 trong 90ms khi damage; micro-hitstop 45ms mỗi mốc streak bội 10.
- Procedural WebAudio 0-asset: unlockAudio() trên gesture đầu (resume + tạo silent buffer); graze chime sine f = 440 * 2^(n/12), n chọn từ pentatonic [0,3,5,7,10,12] theo streak % 6, octave +12 mỗi 24 streak; explosion = 1s noise buffer trắng, playbackRate 0.7–1.3, lowpass sweep 800→80Hz; music nền arpeggio 112BPM triangle root A2=110Hz, pulse 16th-note, gain 0.05.
- Trail glow: gradient dọc theo đuôi, alpha giảm theo index segment.
  PASS KHI: graze liên tục 10s cảm giác 'đã'; frame p99 < 16.9ms.

[ITERATION 3 — ENTERPRISE HARDENING]
- Visibility API: tab ẩn → pause loop + audio.suspend; quay lại → grace 500ms 'GET READY' rồi resume (không chết oan).
- LocalStorage (try/catch mọi truy cập): best score, tổng graze, mute setting; nút mute góc màn hình.
- Near-miss hitbox: r_hit = 0.8 * r_visual (-20% cho vùng 'suýt chết'); graze annulus = [0.8r, 2.2r]; hazard đi qua annulus không chạm lõi → +1 graze, spawn spark, chime.
- Instant Replay < 150ms: ring buffer Float32Array 150 frame × (head + 24 tail + 6 hazard gần nhất); chết → freeze đúng 140ms → replay 0.5x tốc độ với vignette tối → màn kết quả (score, best, graze count, nút 1-chạm retry).
- Zero-GC audit: 3 phút Playwright/heap snapshot flat; PerformanceObserver 'longtask' > 5ms = fail; rà soát: không closure, không template string, không array method cấp phát (map/filter/concat) trong RAF; DOM score chỉ update khi số nguyên đổi; scratch vector module-level dùng lại.
  PASS KHI: tất cả Acceptance Criteria xanh.

=== ENTERPRISE ACCEPTANCE CRITERIA (NGHIỆM THU CUỐI) ===
1. Standalone 100%: 1 file .html, mở qua file:// chạy đủ tính năng; DevTools Network = 0 request ngoài.
2. 60 FPS locked: 99% frame < 16.9ms trên GPU tích hợp; không jank khi 200 particle + 6 hazard + replay.
3. 0 allocation trong RAF steady-state: heap flat trên snapshot 3 phút; long task < 5ms.
4. Input→render ≤ 1 frame, chơi được hoàn toàn bằng 1 ngón, hoạt động portrait lẫn landscape.
5. 0 console error/warning; audio chỉ phát sinh sau gesture (không bị Chrome block).

=== TECHNICAL BLUEPRINT (GLM-DIRECTED) ===
- Bảng màu: nền radial #050510 → #0B0033, nebula noise #1B0B4D alpha 0.35; wisp lõi gradient #7DF9FF → #B16CEA, glow ngoài rgba(125,249,255,0.25); hazard nóng #FF3D6E; graze spark #FFD166; UI trắng #F5F7FF, font system stack; mọi glow dùng 'lighter' composite, không shadowBlur trong vòng lặp (đắt) — glow bằng gradient pre-baked 2 vòng tròn.
- Công thức head: a = 42*(target − pos) − 8*v; clamp tốc 900px/s @1080p; tail: verlet, damping 0.985, gravity 0, 3 constraint iterations.
- Combo: streak reset nếu 2.0s không graze; multiplier M = min(8, 1 + floor(streak/5)); score += 10*M mỗi graze + quãng đường di chuyển *M; hiển thị M bằng số + vòng sáng quanh wisp, đổi sắc mỗi mốc M theo palette.
- Cấu trúc file: <style> tối giản, <canvas>, <script> IIFE 'use strict'; modules logic: Loop, Input, Pool, Audio, Director, Replay, Store — tất cả trong 1 scope, không global leak.
```
