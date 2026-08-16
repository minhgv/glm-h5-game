# Tán Sa Quỹ Đạo (Scatter Orbit)

- **Ngày:** 2026-08-16
- **Genre:** One-thumb Orbital Slingshot × Graze-Scoring Survivor — arcade casual-core H5: giữ ngón tay để khoá quỹ đạo tether quanh anchor, thả để slingshot tiếp tuyến, điểm số đến từ near-miss graze
- **Mô tả:** Ngón tay chạm là vệ tinh bám quỹ đạo, thả ra là sling-shot xuyên bãi debris — nhưng điểm lớn đến từ việc SÁT NÚT lướt qua viên đạn (graze) chứ không phải né chúng. Càng liều lĩnh, combo càng cháy, âm thanh càng dâng: vòng lặp rủi-ro-tđổi-thưởng 30 giây khiến người chơi luôn thèm thêm một run nữa.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal
Xây dựng game H5 arcade THƯƠNG MẠI 'Tán Sa Quỹ Đạo': one-thumb orbital-slingshot grazer trong 1 file index.html duy nhất, chạy offline qua file://, đạt chuẩn ship của Enterprise Arcade Studio — 60FPS locked, 0 garbage-collection trong RAF, 0 asset ngoài, juice đầy đủ (shake/hitstop/particle/procedural audio). Mục tiêu kinh doanh: hook-loop 30 giây, retention kiểu cần-thêm-một-run, screenshot sẵn sàng lên store, chuỗi 'NEW BEST' kích thích chia sẻ. Ranh giới amateur vs enterprise: CONFIG trung ương thay vì magic-number, hệ thống module hoá, telemetry frame-time có overlay debug, acceptance gate tự kiểm bắt buộc trước khi tuyên bố DONE.

AUTONOMOUS ITERATION LOOP — agent PHẢI tự lặp 3 giai đoạn. Mỗi vòng kết thúc bằng khối VERIFY liệt kê pass/fail từng mục; KHÔNG được sang vòng sau khi vòng trước chưa xanh toàn bộ.

ITERATION 1 — CORE ENGINE (1-thumb phải 'ngon tay' ngay từ giây đầu):
- Boot: index.html duy nhất, IIFE strict-mode, CONFIG object trung ương chứa mọi hằng số (vật lý, spawn, màu, audio) — cấm magic number rải rác.
- Canvas 1080p HiDPI: stage logic 1920x1080, letterbox contain theo viewport, backing store = 1920x1080 x min(devicePixelRatio, 2); camera setTransform reset mỗi frame, shake offset áp sau transform.
- Fixed-step physics: dt = 1/120s, accumulator clamp tối đa 5 step (chống spiral-of-death), render interpolation alpha = acc/dt. Motion semi-implicit Euler: v += a*dt; p += v*dt; damping v *= exp(-0.35*dt) khi tự do; vMax clamp 1400px/s sau release.
- Vòng lặp chơi: pointerdown bất cứ đâu (touch-action:none, preventDefault, chặn scroll/zoom/selection) -> LATCH anchor gần nhất trong bán kính 380px. Giữ = ràng buộc tròn: sau tích phân project p về |p - anchor| = L (L khoá tại lúc latch); xoá thành phần xuyên tâm vận tốc v <- v - dot(v,n)*n (n = normal đơn vị); boost tiếp tuyến +1.5%/vòng quay theo dấu cross(v, r) giữ chiều quay người chơi chọn. pointerup -> RELEASE: bảo toàn v tiếp tuyến = slingshot tự nhiên. Không có anchor trong tầm -> dash mềm 220px/s theo hướng ngón tay (mượt, không teleport).
- Thế giới: anchor vàng sinh mỗi 520-780px theo hướng tiến; debris đỏ mật độ k(t) = 2 + 0.35*(t/30); sao bụi pickup mint; mỗi 45s một SUPERNOVA ring mở rộng từ mép màn (báo trước 1.2s bằng vòng nét đứt) ép người chơi đổi quỹ đạo. HUD: score, multiplier, heat bar.
- VERIFY: bot tự chơi 60s không chết vì bug logic (chết vì gameplay là đúng), độ trễ pointerdown->latch <= 1 frame, console sạch lỗi.

ITERATION 2 — ENTERPRISE JUICE:
- Particle pool: Float32Array ring-buffer 2048 hạt (x, y, vx, vy, life, maxLife, size, typeIdx) + free-list stack; spawn = pop, kill = push; render batch theo typeIdx bằng glow-sprite prerender trên offscreen canvas (cấm new/[] trong vòng update).
- Screen shake: trauma thuộc [0,1]; offset = trauma^2 x 14px x noise-table (bảng 256 giá trị random precompute, index = frame & 255); rotation tối đa 2.5 độ x trauma^2; decay trauma -= 1.6*dt. Latch +0.18, graze +0.04, death +0.6.
- Hitstop: timeScale = 0.05 trong 70ms tại milestone combo (x4/x8/x12) và 120ms khi chết; hitstop chỉ đóng băng simulation, render vẫn chạy (trail vẫn thở).
- Procedural WebAudio 0-asset: graph = [graze blip triangle 1 osc | anchor stab 3 osc root+quinta+octave | pad 2 saw detune ±6 cent qua LFO filter 0.1Hz] -> BiquadFilter lowpass cutoff = 400Hz + combo x 260Hz (clamp 8kHz, Q = 1.2) -> WaveShaper soft-clip -> DynamicsCompressor(-24dB, 8:1) -> destination. Scale pentatonic Am: 110.00, 130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66 Hz — graze leo thang nốt theo combo index (fold về 2 octave); latch bấm hợp âm root của anchor; death = pitch-sweep saw 220 -> 30Hz trong 0.4s + white-noise burst (buffer noise 1 giây sinh đúng 1 lần, reuse mãi). unlockAudio(): tạo/resume AudioContext trong gesture đầu tiên (pointerdown/keydown), mọi node scheduled-ready trước đó; có nút mute.
- Trail comet: ring-buffer 24 điểm lịch sử vị trí, vẽ gradient #7DF9FF -> #4A7DFF -> alpha-0 với lineWidth taper (lineWidth tính trước, không string màu trong frame — cache bảng fillStyle theo key).
- VERIFY: mọi SFX trigger đúng event; particle tốn <= 2ms/frame; trauma + hitstop nhận biết được bằng mắt.

ITERATION 3 — ENTERPRISE HARDENING:
- Visibility API: visibilitychange -> hidden: dừng loop + audioCtx.suspend(); visible: clamp accumulator về 0, resume audio, overlay READY 800ms chống chết oan. Test tab-switch 10 lần không chồng âm, không leak timer.
- LocalStorage (try/catch quota + private-mode fallback): key 'tan-sa-quy-dao:v1' = {best, runs, muted}; HUD hiện BEST + flare NEW BEST khi vượt.
- Near-miss graze: hitbox lethal = 0.8 x bán kính thật (-20%); band graze = [1.0 .. 1.6] x tổng bán kính 2 vật: mỗi frame trong band -> heat +1, spark 6 hạt, ring flash 1 frame, trauma +0.04, blip 1 nốt; rời band giữ combo đếm ngược 2.5s (decay exponential). Graze là NGUỒN ĐIỂM CHÍNH: score += 10 x multiplier mỗi graze-tick — người chơi bị thiết kế để TÌM đạn chứ không trốn đạn.
- Instant Replay: ring-buffer transform (player + toàn bộ debris) 150ms @ 60Hz = 9 frame; khi chết đóng băng, phát replay ghost (additive, alpha fade 1 -> 0, dùng đúng dữ liệu đã buffer, KHÔNG simulate lại) rồi mới hiện Game Over panel; đo performance.now() từ death-frame tới frame replay đầu < 150ms.
- Combo: multiplier = 1 + floor(heat/8), cap x12; PERFECT ORBIT: 1 vòng 360 độ (unwrap góc tích luỹ quanh anchor) mà graze >= 3 debris riêng biệt -> +200 điểm, x2 heat burst một lần, chớp nền 1 frame.
- VERIFY: replay đạt ngưỡng < 150ms; chế độ debug (phím ~) vẽ hitbox lethal 0.8x và band graze chứng minh bằng mắt.

ENTERPRISE ACCEPTANCE CRITERIA — cổng DONE, thiếu 1 mục = KHÔNG ship:
A1. Standalone 100%: 1 file index.html, double-click file:// chạy full; DevTools Network = 0 request ngoài chính nó; không fetch/XHR/import external/Image() load.
A2. 0 asset ngoài: mọi đồ hoạ = canvas procedural, mọi âm thanh = WebAudio synthesizer, font = system-ui stack.
A3. 60 FPS locked: rAF steady 60Hz; p95 frame <= 16.7ms, không frame nào > 30ms trong bot-run 3 phút (telemetry frame-time tích hợp, overlay phím ~).
A4. 0-GC trong RAF: không khai báo array/object/closure/string-concat trong per-frame path; heap snapshot delta xấp xỉ 0KB sau 60s active play; Performance panel không có GC sawtooth định kỳ.
A5. Fixed-step deterministic: cùng input seed -> cùng trajectory (bot replay khớp vị trí tolerance 0.5px/60s).
A6. 1-thumb hoàn chỉnh: chơi trọn vẹn bằng 1 ngón; multi-touch không gây latch lỗi; không scroll/zoom/double-tap-zoom.
A7. Near-miss hoạt động: lethal 0.8x, band graze cho điểm + juice, có debug-render chứng minh.
A8. Instant replay < 150ms từ death tới frame replay đầu, 0 allocation mới.
A9. Tab pause/resume an toàn: không tích lũy thời gian, không chồng âm, không chết oan.
A10. Code ship-grade: CONFIG trung ương, module hoá trong IIFE, JSDoc API nội bộ, console sạch, chạy trên Chrome/Edge/Firefox/Safari mobile 2022+.

TECHNICAL BLUEPRINT
- Bảng màu 'Nebula Dusk': nền gradient dọc #05060E -> #0B1026 -> #141B3C + 2 lớp sao parallax prerender offscreen (không vẽ sao mỗi frame); player core #FFFFFF glow #7DF9FF; trail #7DF9FF -> #44A7DFF -> alpha-0; anchor #FFD166, latch-ring #FFE8A3; debris core #FF3864 viền #FF9E00; graze band #A78BFA; pickup #64FFDA; HUD text #EAF2FF; heat bar gradient #FFD166 -> #FF3864.
- Va chạm: circle-circle, grid 64px bucket tĩnh prealloc (không allocate bucket), broad-phase trước narrow-phase; khoảng cách dùng sqrt(dx*dx + dy*dy), cấm Math.hypot trong hot path; tối đa 220 entity hoạt động.
- Difficulty: tốc debris 120 + 4*t px/s (cap 420); SUPERNOVA ring mỗi 45s; k(t) như Iteration 1 — mọi hệ số nằm trong CONFIG.
- Scoring: graze-tick 10 x mult; pickup 50; perfect-orbit +200 & x2 heat; format số '12.480' bằng bảng chuỗi prealloc — cấm toLocaleString trong frame.
- Perf rules: mọi vòng for cache length; cấm forEach/map/filter trong hot path; cấm shadowBlur runtime (glow = sprite prerender); toàn bộ vector tạm module-scope; không closure mới trong rAF.
- Self-test protocol kết thúc: chạy checklist A1-A10, xuất bảng PASS/FAIL ra console đúng MỘT lần (không spam), tự sửa cho tới khi toàn PASS rồi mới được kết luận hoàn tất.
```
