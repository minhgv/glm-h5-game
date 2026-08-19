# Xuyên Âm Tần (Resonance Drift)

- **Ngày:** 2026-08-19
- **Genre:** Arcade Rhythm-Survival one-thumb: điều khiển cao độ 'theremin' để pha qua cổng cộng hưởng
- **Mô tả:** Bạn không nhảy, không bắn — bạn ĐIỆU TẦN. Giữ ngón tay để quả cầu plasma trượt lên thang âm, thả ra để rơi xuống; khớp đúng tần số của cổng cộng hưởng đang lao tới để xuyên qua nó như bóng ma. Mỗi lần pha thành công là một nốt trong giai điệu chính bạn tạo ra — sai nốt là nổ tung trong pháo hoa ánh sáng.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
═══════════════════════════════════════════════
XUYÊN ÂM TẦN — MASTER PROMPT (v1.0)
Vai trò: Senior Game Director + Lead Engine Engineer của một Arcade Studio thương mại. Sản phẩm phải đạt chuẩn ship, không phải demo.

───────────────────────────────
/goal — STANDING GOAL
───────────────────────────────
Ship 'Xuyên Âm Tần' — arcade H5 one-thumb với cơ chế độc quyền CẮT TẦN SỐ (theremin phasing): người chơi điều chỉnh cao độ của quả cầu plasma bằng chính âm thanh procedural (WebAudio là CƠ CHẾ gameplay, không phải hiệu ứng) để xuyên qua các cổng cộng hưởng.
Chuẩn thương mại:
• Đọc hiểu cách chơi trong 3 giây (không tutorial text —第一次 chạm là hiểu ngay), thành thạo trong 30 phút, chinh phục trong 30 giờ.
• Mục tiêu engagement: session trung bình ≥ 4 phút, tilt-retry trong < 2 giây sau chết.
• 1 file index.html standalone 100%, deploy lên bất kỳ static host/CDN, chạy cả file://, không backend, không framework, không asset ngoài.
• Phân biệt tuyệt đối với sản phẩm amateur bởi: fixed-step deterministic physics, zero-GC render loop, audio-reactive core mechanic, complete hardening (pause/replay/persistence).

───────────────────────────────
AUTONOMOUS ITERATION LOOP
───────────────────────────────
Agent TỰ LẶP qua đúng 3 giai đoạn. Mỗi giai đoạn có Definition of Done (DoD) — tự nghiệm thu bằng checklist trước khi sang giai đoạn kế; nếu FAIL bất kỳ mục nào: quay lại sửa ngay giai đoạn đó, KHÔNG được bỏ qua, KHÔNG được hạ tiêu chí.

◆ ITERATION 1 — CORE ENGINE (nền móng, cấm thêm juice):
– Canvas logic 1920×1080, HiDPI: scale theo devicePixelRatio (cap 2.0), letterbox giữ aspect, resize anamorphic.
– Fixed-step physics: dt = 1/120s, accumulator, render với interpolation alpha = acc/dt, panic cap 5 steps/frame (anti spiral-of-death).
– 1-thumb input: pointerdown/pointerup + touch fallback; GIỮ = pitch trượt LÊN, THẢ = pitch rơi XUỐNG (xem công thức ở Blueprint). Input → world response trong cùng 1 logic step, không buffer trễ.
– Core loop hoàn chỉnh: spawn cổng, 3 cửa sổ判定 (PERFECT / PASS / DEAD), score cơ bản, restart ≤ 2s.
– Debug overlay khi ?debug=1: FPS, frame-time p99, step count, pitch cents.
• DoD 1: Chơi được full loop 5 phút không crash; cùng input seed → cùng trajectory 100% (determinism); logic KHÔNG dùng Date.now()/performance.now() (chỉ RAF dùng).

◆ ITERATION 2 — ENTERPRISE JUICE (cảm giác 'sướng tay'):
– Particle pooling: pool 512 pre-allocated, SoA (Struct-of-Arrays: Float32Array cho x/y/vx/vy/life/size/hueIdx), swap-remove khi chết — CẤM new/[] trong vòng lặp.
– Screen shake theo trauma model: shake = trauma², offset = shake·14px·perlin-noise(t), decay 1.4/s; trauma += 0.4 khi PERFECT, += 1.0 khi DEAD.
– Hitstop (freeze-frame): PERFECT = 40ms, NEAR-MISS = 90ms + timescale 0.3× trong 140ms, DEAD = 220ms.
– Procedural WebAudio 0-asset (đầy đủ trong Blueprint): drone của orb luôn kêu theo pitch hiện tại — NGƯỜI CHƠI NGHE ĐƯỢC mình đang ở tần số nào; cổng hum đúng tần số mục tiêu → khớp tai = khớp mắt = khớp màu.
– unlockAudio: AudioContext tạo lazy trong pointerdown đầu tiên, ctx.resume() + phát silent 1-sample buffer để warm-up; nút mute lưu state.
– Trail ribbon 24 điểm cho orb, vẽ 1 path gradient; background parallax 2 lớp pre-rendered offscreen tile + pulse theo envelope gain hiện tại.
• DoD 2: Checklist 8 cảm giác đạt: weight / anticipation / impact / recovery / audio-visual sync / readability / escalation / tilt-retry. Vẫn giữ 60fps khi 300 particle + shake + full audio.

◆ ITERATION 3 — ENTERPRISE HARDENING:
– Visibility API: visibilitychange → pause loop + audioContext.suspend(); quay lại → resume audio, reset accumulator (KHÔNG fast-forward bù thời gian ẩn tab — chống cheat + anti-jank).
– LocalStorage schema key 'xat_save_v1': {best, runs, totalScore, muted, cal} — bọc try/catch quota/serialization, migrate an toàn.
– Near-miss hitbox −20%: bán kính va chạm chết = r·0.8; đi qua vùng 'suýt chết' (giữa pass-window và dead-window) → trigger NEAR MISS: +bonus, slow-mo, flash viền màn hình.
– Instant Replay < 150ms: ring buffer 90 snapshot (3s @ 30Hz) gồm {orbY, pitch, gateOffset, coarseParticles}; khi chết → cắt sang replay mode TỐI ĐA 150ms sau impact: phát 1.2s cuối ở 0.5× tốc độ với overlay desaturate + hiển thị số cents lệch, tap-to-skip → màn kết quả trong 60ms.
• DoD 3: Hardening checklist pass 100% + chạy audit 4 Acceptance Criteria bên dưới → xuất file cuối cùng duy nhất.

───────────────────────────────
ENTERPRISE ACCEPTANCE CRITERIA
───────────────────────────────
(Nghiệm thu bắt buộc — FAIL mục nào sửa mục đó, không thương lượng)
□ AC1 — STANDALONE 100%: mở bằng file:// chạy đầy đủ; DevTools Network = 0 request ngoài chính file; không CORS, không CDN, không font/ảnh/âm ext.
□ AC2 — 0 ASSET NGOÀI: mọi hình vẽ runtime bằng Canvas2D API, mọi âm thanh sinh bằng OscillatorNode/NoiseBuffer, chữ dùng system font stack.
□ AC3 — 60 FPS LOCKED: Chrome DevTools 4× CPU throttle trên máy mid-range: không frame nào > 20ms (kể cả lúc 300 particle + shake + replay); frame budget nội bộ: render ≤ 6ms, logic ≤ 2ms, audio param ≤ 1ms.
□ AC4 — 0 GC TRONG RAF: Memory profiler (Allocation instrumentation) cho thấy 0 allocation/frame ở steady state. Cấm: tạo object/array/string/closure/typed-array trong RAF — chỉ dùng pool, typed arrays preallocated, số nguyên cho score buffer.
□ AC5 — INPUT LATENCY: chạm → hình ≤ 1 frame; chạm → âm ≤ 20ms.
□ AC6 — ONE THUMB: chơi hoàn chỉnh bằng 1 ngón tay, hỗ trợ portrait + landscape, min viewport 320px.
□ AC7 — DETERMINISM: fixed-step + không dùng thời gian thực trong logic; replay ring buffer tái hiện chính xác frame-frame.

───────────────────────────────
TECHNICAL BLUEPRINT (chi tiết kỹ thuật bắt buộc)
───────────────────────────────
[1] BẢNG MÀU GRADIENT — 'Tần Số Vô Cực':
• Nền: vertical gradient #060913 → #0D1B2A; 2 lớp starfield parallax alpha 0.35/0.6 pre-rendered offscreen.
• Ánh xạ tần số → màu (chính là core feedback): pitch s ∈ [0,1] → hue = 190 + 170·s, tức cyan #00E5FF → tím #7B2EFF → hồng #FF2E88; saturation 95%, lightness 60%. Orb glow, ring cổng, particle, trail TOÀN BỘ dùng đúng hue này → mắt đọc được tần số bằng màu.
• Khi 2 màu orb + cổng tiến về cùng hue → giác quan thứ ba 'cảm nhận' được match sắp xảy ra (anticipation).
• PERFECT flash: trắng #F8FDFF lerp nhanh; DEAD: split-complement của hue hiện tại để chói nhất.
• Text neon: vẽ fillText 3 lớp alpha giảm dần (0.45/0.25/0.1) thay vì shadowBlur (đắt). UI: system-ui, tracking rộng, uppercase cho HUD.

[2] CÔNG THỨC VẬT LÝ (fixed-step, đơn vị SI-ish):
• Pitch integrator: s += (held ? +1.35 : −1.90) · dt; clamp [0,1]. Tốc độ rơi nhanh hơn 40% so với lên → tạo cảm giác 'thả rơi' quen thuộc của lò xo, dễ_ctrl.
• Tần số: f = 110 · 2^(4s) Hz — quét mũ 4 quãng tám (A2 → A6, 110 → 1760 Hz) để glide đều theo cents (tai người nghe tuyến tính theo log tần số).
• Cửa sổ判定 theo cents: c = |1200 · log2(f / f_gate)|; PERFECT: c ≤ 45; PASS: c ≤ 140; còn lại = DEAD khi biên cổng chạm hitbox.
• Tần số cổng: lượng tử hoá trên lưới pentatonic minor của A {A, C, D, E, G}; random-walk ±1..2 bậc mỗi cổng → chuỗi cổng tạo thành MELODY, người chơi tốt sẽ 'hát' theo.
• Tốc độ thế giới: v = 320 + 42·√score px/s, cap 1200; khoảng cách cổng = 420 + 0.35·v px; difficulty ramp: window khởi đầu ±70 cents thu hẹp dần về ±45 trong 15 cổng đầu; mỗi 15 cổng thêm DOUBLE-GATE (2 tần số cách nhau ≤ 0.9s).

[3] PROCEDURAL SYNTHESIZER (0 asset, Web Audio API):
• Master chain: [saw osc @f] + [sine osc @2.01f, gain 0.4] → BiquadFilter lowpass (fc = 200 + 4500·s, Q = 6 — filter mở ra khi pitch cao = tự nhiên như giọng hát) → GainNode 0.16 → DynamicsCompressor (threshold −18dB, ratio 6) → destination. Frequency set bằng exponentialRampToValueAtTime mỗi step với timeConstant nhỏ (glide mượt, 0 zipper noise).
• Gate hum: triangle @f_gate + tremolo LFO 5Hz depth 0.3, gain 0.05, StereoPanner theo vị trí x của cổng → tai định vị được cổng đang đến từ đâu.
• SFX: PERFECT = arpeggio 3 nốt pentatonic lên (attack 2ms, decay 180ms, mỗi nốt +1 bậc theo combo → combo cao giai điệu càng cao); NEAR-MISS = sub thump 60Hz + noise woosh highpass; DEAD = white-noise burst 0.3s + osc pitch-drop 220→40Hz; combo milestone mỗi 8 = octave chime.
• Toàn bộ node tạo MỘT LẦN lúc unlock, reuse mãi; KHÔNG tạo node trong RAF.

[4] SCORING & COMBO SYSTEM:
• PERFECT: +100 · mult · (1 + v/1200); combo += 1.
• NEAR MISS: +25 · mult (không tăng combo, chỉ duy trì).
• Multiplier: mult = min(8, 1 + floor(combo/4)); mismatch/DEAD → combo về 0.
• FLOW BONUS ×1.5: chỉ cộng khi lúc xuyên mà |ds/dt| ≥ 0.25 (đang lia tay) — CHỐNG CAMP đứng yên đợi đúng tần số, ép phong cách chơi lưu loát.
• Shield: mỗi 10 combo đổi được 1 lần cứu (phá cổng bằng force), tối đa 2 — tầngdecision nhẹ cho casual.

[5] CẤU TRÚC CODE (1 file, IIFE 'use strict', module bằng const namespace):
Input · Audio · Pools · World · Gates · Render · Replay · Store · Loop.
Loop: raf(t) → acc += min(t − last, 250ms) → while (acc ≥ dt && steps < 5) step(dt) → render(acc/dt). Replay mode chia sẻ đúng hàm render với tham số snapshot thay world state (0 code trùng lặp).
HUD: thước đo tần số dọc bên phải màn hình (minimap mọi cổng đang tới + con trỏ pitch hiện tại) — đảm bảo readability 3 giây cho người mới.

───────────────────────────────
OUTPUT: duy nhất 1 file index.html hoàn chỉnh, không giải thích thêm. Bắt đầu Iteration 1 ngay bây giờ.
```
