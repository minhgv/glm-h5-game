# Huyền Trống: Nhịp Chim Lạc

- **Ngày:** 2026-08-18
- **Genre:** Circular Rhythm Arcade one-thumb (One-Tap Reflex + Inhibition Dodge): nốt sáng bay theo 8 nan hoa sen về vành trống thiêng đang thở, gõ đúng nhịp để điểm, tuyệt đối kìm chế khỏi chạm Nốt Bóng, combo Lửa Nhịp mở khoá từng lớp nhạc procedural, Daily Challenge seeded theo ngày.
- **Mô tả:** Gõ Trống Đồng khi sao bay về vành trống thiêng — nhưng dám không chạm Nốt Bóng để giữ combo? Càng gõ 'đã tay', giàn nhạc procedural càng dày và vành trống thở càng nhanh: 60 giây mỗi ván của phản xạ, kìm chế và khoái cảm nhịp điệu bronze-drum có một không hai trên H5.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal [STANDING GOAL — ENTERPRISE ARCADE STUDIO] XÂY DỰNG HOÀN THIỆN game H5 'HUYỀN TRỐNG: Nhịp Chim Lạc' đạt chuẩn thương mại: 1 file HTML standalone 100%, zero asset ngoài, 60 FPS locked trên máy phổ thông, zero GC-allocation trong RAF, cảm giác gõ ngang tầm Tiles/Pop-the-Lock, đủ hook thương mại (daily challenge, streak, haptic, meta tiến trình). KHÔNG chấp nhận bản demo amateur: mỗi Iteration phải qua gate DoD số học; nếu FAIL → agent TỰ SỬA rồi chạy lại gate (tối đa 5 vòng/iteration), chỉ được ghi [PASS] và sang giai đoạn sau khi checklist toàn xanh. Kết thúc ghi nhật ký [ITER i/3 | vòng k | PASS/FAIL: lý do] vào comment đầu file.

NGUYÊN TẮC ĐỨNG: (1) Output duy nhất index.html chứa toàn bộ CSS+JS inline — cấm CDN, fetch/XHR, ảnh/font/audio ngoài, import module. (2) Mọi đồ hoạ sinh Canvas2D, mọi âm thanh sinh WebAudio tại runtime. (3) Agent tự chạy vòng BUILD → SELF-QA (checklist đo được) → FIX → RE-RUN cho từng Iteration. (4) Tôn trọng prefers-reduced-motion, autoplay policy mobile, và chế độ ?bot=1 (auto-play tester nội bộ) cho mọi gate.

=== A. AUTONOMOUS ITERATION LOOP ===

ITERATION 1 — CORE ENGINE (nền móng, chưa juice):
- Canvas logic 1920x1080, scale theo devicePixelRatio (cap 2.0), letterbox an toàn, resize không giật, ctx.imageSmoothing off cho nét viền.
- Vòng lặp: RAF render + fixed-step physics 120 Hz (accumulator, dt = 8.333ms, render interpolation alpha, clamp spiral-of-death 5 bước). pos_render = pos_prev + (pos_curr - pos_prev) * alpha.
- Input 1-thumb: pointerdown toàn màn hình (Pointer Events, touch-action none, bỏ multi-touch thứ 2 trở đi), target độ trễ chạm→logic < 30ms.
- Engine: 8 lane nan hoa sen (góc lane i = i*45deg + theta(t)); theta quay chậm omega(t) = 0.15 + 0.02*floor(t/20) rad/s, đảo chiều mỗi 12s bằng seeded RNG. Nốt spawn tại r=980px bay vào tâm với v = 320 + 12*level px/s (level = floor(score/40), cap 12). Vành trống thiêng R(t) = 330 + 26*sin(2π*0.25*t).
- Phán đoán theo thời-gian-tới-vành: t_hit = (r - R)/v của nốt gần nhất cùng phía; Δ = t_now - t_hit. PERFECT |Δ|≤28ms, GREAT ≤60ms, GOOD ≤95ms, ngoài ra = MISS (nốt trôi qua). NỐT BÓNG (shadow): tỉ lệ 18% từ level 2, +1%/level, cap 30% — chạm khi trong cửa sổ GOOD → BREAK COMBO; để trôi qua an toàn → +2 điểm kỉ luật.
- FSM: BOOT → MENU → COUNTDOWN(1s) → PLAY → REPLAY → RESULT; restart < 400ms kể từ tap Chơi lại.
- Seeded RNG mulberry32: seed daily = YYYYMMDD, endless = Date.now().
DoD Iter1: 60 nốt/phút không lệch frame; sai lệch phán đoán ≤ 1 bước physics (8.33ms); console 0 error; bot ?bot=1 auto-tap với jitter ±20ms chơi trọn 3 ván không crash.

ITERATION 2 — ENTERPRISE JUICE (cảm giác 'đã'):
- PARTICLE POOL 512 object cố định, cấp phát 1 lần lúc init: tia lửa đồng (PERFECT), bụi vàng (GREAT), vòng sóng (GOOD). Spawn = reset slot, decay ease-out-quart, age > ttl thì tắt. Cấm new/closure trong RAF.
- SCREEN SHAKE mô hình TRAUMA: trauma += 0.25 (PERFECT) / 0.12 (GREAT) / 0.05 (GOOD); offset = trauma^2 * 14px * noise(sin 3 tần số 13/47/89Hz); trauma decay 1.8/s; BREAK COMBO → trauma = 1 + flash đỏ 60ms. Clamp mọi trần.
- HITSTOP: đóng băng world-time 45ms (PERFECT) / 25ms (BREAK), rồi timeScale ease về 1 trong 80ms; UI và viền vẫn render để người chơi không mất khung hình.
- WEBAUDIO 0-ASSET + unlockAudio(): AudioContext tạo lazy, unlock trên pointerdown đầu (resume + playBytes rỗng). Chain: masterGain(-3dB) → DynamicsCompressor → destination. White-noise buffer 2s sinh 1 lần, loop.
  * Trống đồng PERFECT: kick pitch-drop sine 165→48Hz decay 120ms + noise bandpass 1.8kHz Q=8 dài 30ms + partial gong inharmonic (1, 2.32, 3.01, 4.27 x 130Hz) decay 400ms; gain = 0.5 + min(combo,50)/100.
  * GREAT: 148→50Hz decay 90ms; GOOD: 120→55Hz decay 70ms, bỏ gong.
  * Chạm Nốt Bóng: sub 40Hz 150ms + 2 saw detune 110/116Hz 200ms — tiếng kịt đắt hại.
  * Chim Lạc (bonus, 4% nốt): sine 880Hz vibrato 6Hz depth 12 cents, glide 660→990Hz, 250ms.
- NHẠC ADAPTIVE theo Heat: scheduler Web Audio clock lookahead 120ms / timer 25ms (KHÔNG setInterval cho note-on); mở khoá lớp bằng gain ramp 300ms: combo 0-8 trống nền; 9-24 thêm phách tầu lái (saw + lowpass sweep 300→1200Hz); 25-49 thêm arpeggio ngũ cung Bắc C-D-F-G-A (261.6/293.7/349.2/392.0/440.0 Hz); ≥50 mở lead Chim Lạc sine vibrato. BPM = 96 + heat*0.4.
DoD Iter2: event âm phát ≤ 5ms sau pointerdown; bot đạt combo ≥ 40 ở jitter ±28ms; trauma/hitstop không cộng dồn vượt trần; 3 heap snapshot trong 5 phút bot play — heap không tăng (pool hoạt động đúng).

ITERATION 3 — ENTERPRISE HARDENING (bền thương mại):
- VISIBILITY API: document.hidden → suspend AudioContext, đóng băng accumulator, overlay PAUSED; khi quay lại đếm 3-2-1 mới resume. RAF phải dừng hẳn (0 CPU) khi tab ẩn.
- LOCALSTORAGE (try/catch toàn bộ, schema {v:1}): bestScore, longestCombo, tổng ván, tổng giờ chơi, streak ngày liên tiếp, settings {sfx, haptic, reduceFlash}. Bị chặn → fallback RAM-only, game vẫn chạy.
- NEAR-MISS HITBOX -20%: hitbox nốt = 0.8 * r_visual (debug ?hitbox=1 vẽ đúng lớp này). Khi tap TRƯỢT (không nốt nào trong GOOD window) nhưng nốt bronze gần nhất nằm trong vùng mở rộng 1.0→1.75x GOOD window → phán SÁT NÚT: +3 điểm, KHÔNG mất combo, chữ tím SÁT NÚT + flash viền 40ms — thưởng cho pha liều. Ngược lại tap trắng > 1.75x → MISS thường.
- INSTANT REPLAY < 150ms: ring-buffer 10 slot (mỗi 16.67ms ghi đè vòng) chứa {t, notes[24] {lane, r, type}, theta, ringR, score}, copy bằng gán field (cấm structuredClone). Khi chết → phát slow-motion 0.25x đúng 1 lần với vignette + chữ HOẢNG HỐNG; tổng trễ input chết → replay start ≤ 150ms (đo performance.now, in ra console).
- CHỐNG GC TRONG RAF: cấm string concat, toFixed, closure mới, DOM write trong RAF; text UI chỉ cập nhật khi giá trị đổi (dirty flag); chuỗi số 0..9999 precomputed.
DoD Iter3: tab ẩn 10 phút không đốt CPU; reload giữa ván giữ best/streak; replay đo được ≤ 150ms; Chrome allocation instrumentation 60s: 0 blue bar trong khung RAF.

=== B. ENTERPRISE ACCEPTANCE CRITERIA (NGHIỆM THU CUỐI — TẤT CẢ PHẢI XANH) ===
1. Standalone 100%: mở qua file:// không mạng vẫn đầy đủ âm thanh + đồ hoạ + lưu tiến trình RAM.
2. 0 asset ngoài: DevTools Network ghi 0 request sau lần load file đầu tiên.
3. 60 FPS locked: trung bình ≥ 59.4 FPS, p99 frame ≤ 20ms trong 5 phút bot play; nếu tụt → auto-degrade particle 512→256→128 rồi bỏ gradient stroke.
4. 0 GC allocation trong RAF: cấp phát chỉ phép lúc init / vào menu / bắt đầu replay.
5. Lạnh → gõ đầu tiên ≤ 1.5s trên điện thoại tầm trung.
6. Cả 3 Iteration DoD PASS + nhật ký iteration nằm trong comment đầu file.

=== C. TECHNICAL BLUEPRINT (GLM GAME DIRECTOR BẢN — TRIỂN KHAI ĐÚNG THÔNG SỐ) ===
- BẢNG MÀU bronze-patina: nền radial #0D0B08→#1A130C; vành trống conic #B87333→#F4C430→#8A5A2B; patina teal #43A69E viền nốt GREAT; PERFECT #FFE082; GOOD #C08A3E; NỐT BÓGM tím đen #2A1F3D viền #7C4DFF; CHIM LẠC trắng ngà #F8F4E3 cánh vàng #F4C430; chữ UI #E8D9B5; cảnh báo #C3272B. Judgment glow shadowBlur 18px (tắt khi reduceFlash).
- COMBO/LỬA NHỊP: heat = min(50, combo); multiplier m = 1 + floor(combo/8) cap x8; điểm PERFECT +100m, GREAT +60m, GOOD +30m, SÁT NÚT +3, né bóng +2. BREAK → heat=0, văng 40% particle pool, nhạc rụng về lớp 1. HUD combo pop scale 1.35→1.0 ease-out-back 180ms mỗi mốc x2/x4/x8, kèm navigator.vibrate(10) nếu haptic on.
- VẬT LÝ: chỉ 2 phép tích phân (r của nốt, theta) — không solver, va chạm O(1)/nốt, tối đa 24 nốt sống, chạm giản đơn so khoảng cách radial.
- CẤU TRÚC CODE 1 file: IIFE strict mode, module hoá const Object: CONFIG, RNG, AudioEngine, ParticlePool, ReplayBuffer, Judgement, GameFSM, Render, Boot. Không framework, target ≤ 1800 dòng, chú thích tiếng Việt ngắn.
- POLISH-QUARTER (vòng lặp cuối): sau khi mọi gate PASS, bot chơi thử 3 seed khác nhau, chọn 3 cải thiện game-feel nhỏ nhất mà tác động lớn nhất (ví dụ: knock-back vành khi PERFECT, grain vignette lúc heat max), triển đấu, rồi đóng comment cuối file: [SHIPPED v1.0.0 | FPS x | Alloc y | Replay z ms].
```
