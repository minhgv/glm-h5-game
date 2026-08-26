# THAN LỬA — Hoa Quang Hư Không

- **Ngày:** 2026-08-26
- **Genre:** Arcade One-Touch · Vertical Endless Scroller · Risk-Reward HYBRID (độ lớn ngọn lửa = hitbox = hệ số điểm)
- **Mô tả:** Giữ ngón tay: than lửa rực sáng, nở to, bay lên — và hitbox phình theo điểm số. Thả tay: co nhỏ, rơi xuống, luồn qua khe hẹp nhưng lửa tắt dần là chết. Một thumb, một nghịch lý: lửa là điểm, lửa cũng là tử thần.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
=== MASTER PROMPT · THAN LỬA — HOA QUANG HƯ KHÔNG ===

■ /goal (STANDING GOAL — CHUẨN ENTERPRISE ARCADE STUDIO)
Ship một sản phẩm thương mại hoá được, KHÔNG phải demo amateur:
(1) Hook 10 giây: người chơi hiểu nghịch lý LỬA-TO-ĐIỂM-CAO-CHẾT-NHANH chỉ bằng 1 lần chạm; retry full-loop < 1.5s tạo phản xạ 'one more run'.
(2) Chỉ số nội bộ phải đạt trước khi gọi là xong: session trung bình >= 3 phút, avg retry >= 7 lượt/chạy thử, độ trễ input-to-photon < 50ms.
(3) Kỹ thuật đóng gói thương mại: 60 FPS locked trên Android Chrome tầm trung, zero-allocation steady-state, zero asset ngoài, single-file index.html deploy mọi CDN/static host, chạy offline.
Mọi quyết định thiết kế đều phục vụ phương trình rủi ro-lợi nhuận: heat cao -> flame to -> multiplier x8 -> hitbox x2.2. Không có trạng thái an toàn tối ưu — chỉ có mức độ tham lam.

■ AUTONOMOUS ITERATION LOOP (agent TỰ LẬP, không hỏi lại người dùng; mỗi vòng: build -> chạy checklist -> FAIL thì sửa ngay vòng đó -> PASS mới được lên vòng sau)
— ITERATION 1 · CORE ENGINE —
BUILD: Canvas 1080x1920 logical, HiDPI (dpr clamp 2.5, resize handler debounce 150ms, orientation-safe). Vật lý fixed-step: accumulator dt = 1/120s, semi-implicit Euler, render interpolate theo alpha = acc/dt. Input 1-thumb thuần: pointerdown = HOLD (buoyancy + flame nở), pointerup/pointercancel/blur = RELEASE (gravity + flame co); chặn double-tap zoom, touch-action none, preventDefault toàn cục. Thực thể: Ember (than lửa), Paper Gates (cổng giấy khe hẹp, sinh bằng seeded RNG mulberry32 để replayable), Resin Orbs (nhựa cây = tiếp nhiên liệu), Rain Drops (giọt mưa làm tắt heat). Camera scroll dọc, death khi core chạm solid hoặc heat chạm 0 quá 0.9s. Vòng retry: tap-to-restart < 1.5s kể từ frame chết.
VERIFY: chạy 60fps liên tục 120s; input hoạt động cả mouse/touch; không NaN sau 10 phút soak; vòng chết-sống lại đúng 1.5s.
— ITERATION 2 · ENTERPRISE JUICE —
BUILD: Particle pool 512 hạt pre-allocated ring-buffer (tái sử dụng, cấm new trong RAF): tia lửa hold, graze spark, bụi resin, ash khi chết. Screen shake mô hình trauma: offset = trauma^2 * 14px * noise, trauma decay 1.8/s, trauma được cấp bởi graze-tier-up (0.25) và death (1.0). Hitstop: freeze accumulator 45ms khi lên tier combo, 90ms khi chết (nhưng replay vẫn захват state). Audio 0-asset procedural WebAudio: graph = master gain -> DynamicsCompressor -> destination; unlockAudio() vào gesture đầu tiên (resume + unlock + play silent buffer); tiếng graze là chuỗi pentatonic [0,3,5,7,10] semitone trên nền 220Hz, tier i lên nốt 220 * 2^(penta[i%5]/12 + floor(i/5)); osc triangle, gain env A=5ms D=220ms S=0; pickup resin = hợp âm fifth 440+660; chết = saw sweep 180Hz->40Hz trong 400ms + pink-noise burst; gió nền = filtered noise loop gain 0.03 modulated theo scroll speed. Haptic: navigator.vibrate(8) khi tier-up, guard try/catch.
VERIFY: allocation recorder của DevTools ghi 0 object mới trong 60s gameplay; audio không bị mobile browser block; juice không làm frame p95 vượt 18ms.
— ITERATION 3 · ENTERPRISE HARDENING —
BUILD: (a) Visibility API: document.hidden -> pause (freeze accumulator, suspend AudioContext, dừng RAF); visible -> đếm ngược 3-2-1 resume, KHÔNG dồn dt (clamp frame delta tối đa 50ms) -> không bị speed-hack bằng tab-switch. (b) LocalStorage schema v1 có version + migration: bestScore, bestCombo, totalRuns, mute,AudioLatencyOffset; try/catch mọi access (private mode safe). (c) Near-miss chính thức: corona graze zone = bán kính core * 1.55; va chạm thật tính trên core hitbox -20% so với visual (core thực = r * 0.8) -> người chơi LUÔN cảm giác suýt chết là công bằng. (d) Instant Replay: ring buffer 4 giây state snapshot @30Hz (chỉ position/rotation/event, pre-allocated 120 slot); khi chết -> playback 0.5x tốc độ sau đúng 150ms, tap để skip; replay dùng đúng renderer, không phân nhánh code vẽ.
VERIFY: tab-switch 20 lần không drift physics/không mất audio; replay mượt không alloc; clear storage -> game vẫn boot sạch.

■ ACCEPTANCE CRITERIA — NGHIỆM THU ENTERPRISE (cấm bỏ mục nào)
AC-1 Standalone 100%: đúng 1 file index.html, 0 request ngoài (không CDN, không font, không ảnh, không JSON), chạy file:// trực tiếp.
AC-2 60 FPS locked: mid-range Android Chrome, 100 thực thể + 512 particle đồng thời, frame time p95 < 18ms, không frame > 33ms.
AC-3 0 garbage trong RAF: hot path (update/render/audio-callback) không tạo object/array/string/closure nào; kiểm bằng Allocation instrumentation 60s -> zero allocation steady-state.
AC-4 Physics đúng: fixed-step 120Hz + interpolation; số determism: cùng seed -> cùng gate sequence; tab pause không làm sai thời gian.
AC-5 Touch chuẩn: 1 thumb,_latency input->photon < 50ms, không text-select/click 300ms/context-menu.
AC-6 Death->replay->restart: replay start < 150ms sau death, full restart < 1.5s.

■ TECHNICAL BLUEPRINT (GLM tự do tinh chỉnh, đây là baseline của Director)
• PALETTE: nền gradient dọc 3-stop #0B0E1A -> #1A1033 -> #2B1050 (chuyển sắc theo độ sâu, 5 zone lặp); Ember core radial #FFF3C4 -> #FFB347 -> #FF6B35, corona ngoài #FF2E63 alpha 0.18; Gate wireframe #6C63FF stroke 3px glow shadowBlur 12; Resin orb #7CFFCB; graze spark #7CFFCB -> #FFF; nguy hiểm rain #4FC3F7. UI font: monospace system stack, tabular-nums cho số liệu.
• VẬT LÝ: gravity 2350 px/s^2; buoyancy khi hold 4100 px/s^2 (net bay lên 1750); drag bậc hai k=0.0035*vel*|vel|; sway con lắc ngang amplitude 26px period 2.4s; flame radius r = lerp(26, 92, heat) px trên canvas 1080; heat += 1.9/s khi hold, -= 1.6/s khi release, clamp [0.12, 1]; fuel cạn (heat = 0.12 giữ 0.9s) -> tắt lửa chết. Wind field: 2 octave sine sum, biên độ theo depth.
• SPAWN & DIFFICULTY: scroll speed 380 -> 720 px/s qua 180s theo easeOutQuad; gate gap 420 -> 260 px; khoảng cách gate 520 -> 340 px; mỗi 30s thêm 1 modifier (mưa, gió chéo, gate xoay 15 độ) theo bảng curve embarcadero easing tự chọn.
• COMBO SYSTEM: graze (corona chạm gate nhưng core chưa chạm) +1 Đu Quang + reset decay-timer 4s; tier = min(8, floor(sqrt(du)/2)); score += 12 * tier * dt khi đang trong tier >= 1; resin orb +15% heat + 50 * tier điểm; hiện tier bằng vòng hoa quang quanh ember, đổi màu theo tier (gold -> trắng -> xanh lục).
• AUDIO SPEC: sampleRate mặc định thiết bị; lookahead scheduler 120ms bằng setInterval 25ms (KHÔNG đặt note trong RAF); mọi node osc/gain lấy từ pool 32 voice tái sử dụng.
• REPLAY BUFFER: 120 slot pre-allocated, mỗi slot {t, emberX, emberY, r, heat, events bitmask}; chỉ ghi khi running, GC-free.
• CODEBASE: 1 file, các module bằng IIFE sections: CONFIG, RNG, POOL, PHYSICS, SPAWN, AUDIO, JUICE, REPLAY, STATE, RENDER, INPUT, LOOP. Cấm framework, cấm eval, 'use strict'.

■ OUTPUT CONTRACT: agent xuất duy nhất file index.html hoàn chỉnh, sau đó tự chạy lại toàn bộ AC-1..AC-6; nếu bất kỳ mục nào fail -> quay về Iteration tương ứng sửa, lặp đến khi toàn PASS. Không giải thích dài, chỉ nộp product.
```
