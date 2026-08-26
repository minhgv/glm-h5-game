# Đảo Cực Neon

- **Ngày:** 2026-08-26
- **Genre:** Arcade / Hyper-Casual lai Score-Attacker: One-Thumb Gravity-Flip Infinite Runner — cơ chế lõi: đảo cực 1-nút (gravity flip), rail-glide magnet, graze-combo, heat management, daily-seed challenge
- **Mô tả:** Chạm một ngón cái để đảo cực — trọng lực lật ngược, bạn bật vọt giữa hai rail từ tính neon, glide sát mặt rail và 'cạo' qua tia laser để đẩy multiplier lên ×8 trong ống dẫn mỗi lúc một nhanh. Cảm giác chơi: nhịp búng ngón như đánh trống, mỗi lần chết chỉ cách retry một nhịp tim — 'thêm một lần nữa' không dừng lại.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — STANDING GOAL (Chuẩn Enterprise Arcade Studio): Xây dựng và ship game H5 'Đảo Cực Neon' — arcade one-thumb thương mại hoá được, KHÔNG phải đồ án học sinh/sinh viên: (1) Kinh doanh: phiên 45-90 giây, vòng chết→retry <1.5s, target D1 retention >40%, trung bình 8+ run/session, sẵn slot quảng cáo giữa các run (không chặn core loop, không phụ thuộc backend). (2) Kỹ thuật: đúng 1 file index.html standalone 100%, physics fixed-step deterministic 120Hz, âm thanh tổng hợp procedural WebAudio, zero-GC steady-state, chạy trực tiếp qua file:// và embedded webview. (3) Ranh giới amateur: hitbox fair-first (thu -20%), daily seed mọi nền tảng giống nhau, juice framework (hitstop/shake/particle pooled), instrumentation ?debug=1 tự nghiệm thu 8 tiêu chí. Cấm: framework, build step, CDN, asset ngoài, Math.random trong gameplay.

=== VÒNG LẶP TỰ TRỊ (AUTONOMOUS ITERATION LOOP) ===
Meta-rule: 3 giai đoạn tuần tự, không song song. Cuối mỗi giai đoạn mở ?debug=1, console.table() checklist; PASS toàn bộ mới sang giai đoạn kế; FAIL → đứng nguyên scope, sửa đến khi PASS; cấm thêm tính năng khi còn FAIL. Mỗi iteration kết thúc bằng 1 report ngắn: [ĐÃ LÀM / ĐÃ KIỂM / CÒN NỢ].

— ITERATION 1: CORE ENGINE —
1. Canvas 1920×1080 (không gian tham chiếu), CSS letterbox 16:9, backing store scale theo min(devicePixelRatio, 2) — HiDPI sắc nét; ctx alpha:false để tối ưu composite.
2. Vòng lặp: requestAnimationFrame + accumulator fixed-step dt = 1/120s; clamp frame delta 250ms (chống spiral-of-death); render nội suy tuyến tính: pos = prev + (curr - prev) × alpha.
3. Vật lý (đơn vị px, px/s, px/s² — hoàn toàn độc lập framerate):
   - Player neo x = 480px; rail trên y = 240px, rail dưới y = 840px.
   - polarity ∈ {-1, +1}; trọng lực g = polarity × 3400 px/s².
   - FLIP (pointerdown): polarity ×= -1; vy += polarity × 520 (cú hích theo hướng trọng lực mới); heat += 14.
   - Rail-snap: cách rail đích < 8px và |vy| < 120 → y := rail, vy := 0, vào chế độ GLIDE không ma sát đến lần flip kế.
   - Tốc độ cuộn thế giới: v_scroll(t) = 320 + 46 × t^0.62 px/s, clamp 980.
4. Input 1-thumb tuyệt đối: pointerdown bất kỳ đâu = flip (touch + mouse + phím Space fallback); mọi nút UI ≥ 64px, nằm vùng ngón cái phải/dưới; input ghi cả trong hitstop (buffer 1 flip).
5. FSM: BOOT → TITLE → RUN → PAUSE → DEATH → REPLAY → RUN; mỗi state là object {enter, update, draw, exit} thuần, không class lồng nhau.
6. Spawner theo seed mulberry32(hash YYYYMMDD) → Daily Challenge: cùng ngày, mọi máy ra cùng layout. 3 loại hazard: RAIL-WALL (chặn 1 rail, buộc flip đúng nhịp), LASER-GATE (nằm giữa ống, đóng mở chu kỳ 2.4s, phase theo seed), ION-SPARK (pickup trừ heat).
7. Giao bản grey-box chơi được toàn loop sống→chết→retry; F1 bật debug hitbox.
PASS khi: flip/glide/snap mượt không rung; chết→retry <1.5s; grey-box giữ 60FPS.

— ITERATION 2: ENTERPRISE JUICE —
1. Particle pooling zero-alloc: struct-of-arrays 2048 particle — Float32Array (x, y, vx, vy, life, maxLife, size, hueIdx) + con trỏ vòng ghi đè slot cũ nhất; spawn là gán field, không new; trọng lực particle 900 px/s²; alpha = life/maxLife; composite 'lighter'.
2. Screen shake theo trauma: shake = trauma²; offset = shake × 26px × noise(t × 72Hz); trauma decay 2.2/s; rail-snap +0.05, graze +0.15, death = 1.0; setting reduced-motion tắt shake.
3. Hitstop: timescale = 0 trong 42ms khi graze tier ≥ 3, 118ms khi death; ease-out cubic 180ms trở lại 1.0; input không bị nuốt (buffer).
4. Procedural WebAudio 0-asset — unlockAudio() gắn trong pointerdown đầu tiên: ctx.resume() + dựng graph 1 lần (gain → DynamicsCompressor → destination), mọi node tái sử dụng:
   - flip: osc square 220Hz→110Hz exponential sweep 90ms, lowpass 900Hz.
   - rail-snap: sine sub-thump 55Hz, 140ms, gain 0.5→0.
   - graze: sine arpeggio thang pentatonic C — [261.63, 293.66, 329.63, 392.00, 440.00, 523.25] Hz; tier càng cao note càng cao; decay 180ms.
   - ion pickup: triangle 660Hz→880Hz, 120ms.
   - death: 2 saw detune 110Hz + 116Hz pitch-drop về 40Hz trong 600ms + white-noise burst 80ms (noise buffer tạo đúng 1 lần lúc boot).
   - Music generative: bass sequencer 8-step, root C2 = 65.41Hz, pattern semitone [0,0,3,0,5,0,3,7], tempo = 128 + ((v_scroll - 320) / 660) × 48 BPM; hi-hat = noise burst 30ms mỗi beat chẵn.
5. Trail ribbon: 24 điểm lịch sử vị trí player, stroke gradient hue 190→320 theo combo, lineWidth taper 18→2.
PASS khi: nghe rõ flip/graze/bass theo nhịp; shake + hitstop + 2048 particle không tụt frame; ?debug=1 xác nhận pool 0 allocation.

— ITERATION 3: ENTERPRISE HARDENING —
1. Visibility API: visibilitychange → hidden: pause ngay frame hiện tại + audioCtx.suspend(); trở lại tab: hiện màn PAUSE thủ công, chỉ pointerdown mới resume gameplay (cấm auto-resume giết người chơi giữa hazard).
2. LocalStorage schema 'dcn.save.v1': {best, runs, sound, reducedMotion, version}; mọi truy cập bọc try/catch (Safari private mode); migrate theo field version.
3. Near-miss chuẩn enterprise: hitbox CHẾT của hazard thu -20% (fair-first, ưu tiên cảm giác công bằng); graze ring player = 52px (core 26px); vùng giao [hitbox thật − hitbox chết] chạm ring → GRAZE: +50 × multiplier điểm, heat −7, trauma +0.15, combo tier +1.
4. Instant Replay: ring-buffer 150 frame gần nhất (typed arrays: y, vy, worldX, offset bảng hazard active — tái sử dụng, không cấp phát); chết → hitstop 118ms → phát lại slow-mo 0.35×, tổng độ trễ khởi động replay <150ms, xong mới hiện màn DEATH + điểm số.
5. Combo/Heat hoàn chỉnh: flip kế trong cửa sổ 1.2s giữ chuỗi; multiplier = 1 + 0.25 × min(chain, 28), cap ×8; heat 0-100: +14/flip, −9/s thụ động, −7/graze, −12/pickup; heat ≥100 → OVERHEAT khoá flip 0.6s (feedback đỏ + âm cảnh báo, chuỗi reset) — ở v_scroll 700+ đó là án tử, tạo vòng rủi ro/lợi nhuận.
6. Bảo vệ người mới: 1.2s đầu run không spawn hazard; 3 run đầu giảm dần tốc độ tăng.
PASS khi: tab-switch giữa chừng không chết oan; replay mượt <150ms; save sống qua reload; F1 xác nhận hitbox chết nhỏ hơn hình vẽ đúng -20%.

=== TIÊU CHUẨN NGHIỆM THU ENTERPRISE (ACCEPTANCE CRITERIA — cổng chặn ship, 8/8 PASS) ===
A1. Standalone 100%: đúng 1 file index.html; không CDN, không font/ảnh/âm/file ngoài, không fetch network; chạy offline qua file://.
A2. 0 asset ngoài: 100% thị giác = Canvas2D procedural; 100% âm thanh = WebAudio synthesis; dung lượng file ≤ 120KB.
A3. 60 FPS locked: accumulator fixed-step 120Hz + nội suy render; benchmark 60s liên tục ≥ 59.4 FPS trung bình dưới throttle CPU 4×; không frame nào > 20ms ngoài hitstop có chủ đích.
A4. 0 garbage-collection allocation trong RAF steady-state: mọi entity/particle/buffer pool sẵn từ boot; trong hot path cấm new, .map/.filter/.concat, string template; allocation timeline 60s gameplay = 0 object mới trong loop.
A5. Determinism: cùng seed ngày → chuỗi hazard giống hệt trên mọi nền tảng (mulberry32; Math.random bị cấm trong gameplay).
A6. Input→phản hồi ≤ 1 frame; hitstop không nuốt input.
A7. Palette brand-locked (gradient duy nhất, không tùy hứng): nền dọc #05060F→#0B1026; rail ANOD #00F0FF→#0066FF; rail CATHOD #FF2E88→#7A00FF; player core #FFFFFF + glow; trail hue 190→320 theo combo; hazard chết #FF3355; graze ring #FFAA00; ion pickup #7CFF4D.
A8. ?debug=1: console.table() in 8 tiêu chí PASS/FAIL kèm số liệu đo (FPS min/avg, alloc count, replay latency ms) — chỉ ship khi 8/8 PASS.

=== TECHNICAL BLUEPRINT (khung kỹ thuật chốt) ===
- Kiến trúc: 1 IIFE 'use strict', ≤1500 dòng, banner comment từng section; toàn bộ hằng số nằm trong CONFIG object đầu file — tuning chỉ chạm CONFIG, không chạm logic.
- Module hệ thống: RNG (mulberry32) · Input · AudioEngine (unlockAudio, graph 1 lần) · Physics (fixed-step) · Spawner (seeded) · Particles (SoA pool) · Shake (trauma) · Replay (ring-buffer 150) · Save (localStorage v1) · FSM · Renderer (nội suy alpha).
- Khung vòng lặp: raf(t): dt = min(t − last, 250); acc += dt × timescale; while (acc ≥ 8.333ms) { snapshotPrev(); step(1/120); } alpha = acc / 8.333; render(alpha).
- Mọi công thức, tần số, bảng màu như chốt ở Iteration 1-3; sai số cho phép khi tuning: ±15% giá trị CONFIG, không đổi cấu trúc công thức.
```
