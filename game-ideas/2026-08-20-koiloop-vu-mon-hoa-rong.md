# KOILOOP: Vũ Môn Hóa Rồng

- **Ngày:** 2026-08-20
- **Genre:** Arcade/Casual Gesture-Skill — Lasso-Loop Capture: 1 ngón tay dẫn cá koi ánh sáng bơi trong vực tối, vẽ vòng khép dải sáng để lasso bầy wisps bóng tối, combo chuỗi nhân hình học, tiến hóa Koi → Giao → Rồng theo truyền thuyết Vũ Môn.
- **Mô tả:** Bạn LÀ con mồi và vũ khí cùng lúc: chạm-kéo để koi bơi, khép vòng sáng để bắt quỷ — nhưng chính dải sáng của bạn lại cuốn hút lũ quỷ tới cắn. Vòng càng to, điểm nhân bình phương, càng tham càng gần chết; mỗi 1000 điểm mở cổ Vũ Môn để hóa Rồng.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal: Xây dựng KOILOOP: Vũ Môn Hóa Rồng — game H5 Arcade/Casual chuẩn Enterprise Arcade Studio, thương mại hóa được (share score, daily seed, ad-hook-ready), single-file index.html, chơi 1 ngón tay, gây nghiện bằng core loop 'vẽ-vòng-bắt' (lasso-loop capture) cộng meta tiến hóa Koi → Giao → Rồng. Phân biệt với game amateur: mọi hiệu ứng pooled, mọi con số tuned, mọi crash-path handled, perf budget đo được, self-test tự nghiệm thu. Cấm stub, cấm TODO, cấm rút gọn scope.

NGUYÊN TẮC TỰ TRỊ (AUTONOMOUS ITERATION LOOP): Làm việc tuần tự đúng 3 iteration. Sau MỖI iteration, agent PHẢI tự chạy checklist (C1.x, C2.x, C3.x) bằng console.assert + đo đạc runtime thực tế; nếu bất kỳ mục nào FAIL → quay lại sửa tận gốc rồi mới sang iteration sau (tối đa 3 chu kỳ sửa mỗi iteration); chỉ log 'KOILOOP READY' khi toàn bộ FINAL ACCEPTANCE PASS.

=== ITERATION 1 — CORE ENGINE ===
- Single index.html, zero dependency, zero asset, zero network.
- Canvas 1080x1920 virtual stage (portrait-first), HiDPI: canvas.width = viewport x min(DPR, 2.5), letterbox fit-scale, set transform 1 lần mỗi resize.
- Fixed-step physics: dt = 1/120s, accumulator, render interpolation theo alpha, spiral-of-death guard (clamp 4 substeps/frame, dư bỏ).
- Input 1-thumb: touchstart/touchmove (passive:false, preventDefault) → target point; koi bơi bằng critically-damped spring: a = (P − x) x k − v x c, k = 160 s^-2, ζ = 0.9 (c ≈ 22.8 s^-1), clamp |v| ≤ 1500 px/s; pointer events cho desktop test.
- Verlet ribbon trail: 28 node, seg 16px, 2 constraint iterations/node/frame, node TTL 0.9s fade.
- Loop detection: segment đầu cắt segment cũ (cách đầu ≥ 3 node) → dựng polygon từ node vòng → Shoelace area ≥ 2400 px² và ≥ 6 node → loop hợp lệ → point-in-polygon (raycast) mọi wisp bên trong → capture.
- Wisps AI: steering seek koi (accel hướng koi) + bị hút node ribbon trong bán kính 180px — cắn ribbon = cắt trail từ điểm cắn + reset chain; ramp khó: spawn interval 1.5s → 0.45s, speed 130 → 340 px/s trong 180s.
- Checklist C1: (1) physics/render tách đúng, dt trung bình 8.33ms ±5%; (2) 1-thumb mượt, phản hồi ≤ 1 frame; (3) loop capture nhận đúng ≥ 95% vòng rõ ràng; (4) giữ 60fps desktop.

=== ITERATION 2 — ENTERPRISE JUICE ===
- Particle SoA pool: Float32Array(1024x8) + Uint8 type + Int16 free-stack, spawn O(1), update 1 vòng for, draw batch theo blend mode; glow dùng sprite pre-render bằng offscreen canvas lúc boot — CẤM shadowBlur trong hot loop.
- Screen shake trauma: offset = trauma² x 26px x noise, rotate ≤ 2.4°, trauma decay 1.8/s; hitstop: capture ≥ 3 wisp → timeScale = 0 trong 60–90ms (juice timer chạy clock riêng); ring shockwave + floating score pool 16 object khi khép vòng.
- Procedural WebAudio 0-asset: unlockAudio() tại gesture đầu (resume AudioContext, iOS-safe, suspend khi pause); master chain: masterGain → WaveShaper soft-clip → DynamicsCompressor → destination; noise buffer trắng 1s tạo 1 lần.
- BGM generative 100 BPM: pad 2 saw detune ±4 cent qua lowpass 500Hz (mở dần → 4000Hz theo chain tier), vòng hợp âm Dm → Bb → F → C mỗi 7.68s; hi-hat (highpass noise 6kHz, 30ms) chỉ bật lúc frenzy.
- SFX FM bell — thang D-pentatonic [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.26, 739.99, 880] Hz: capture n wisp → arpeggio n note tăng dần (cách 45ms), carrier f, modulator f x 2.01, modIndex f x 3 → 0 exp trong 0.22s; graze = bandpass noise sweep 400 → 2400Hz / 120ms; chết = sine glide 220 → 55Hz / 0.8s + noise burst; UI blip = square 880Hz / 30ms.
- Checklist C2: (1) 60fps với 60 wisps + 500 hạt; (2) Network panel 0 request ngoài document; (3) hitstop/shake không phá interpolation; (4) audio unlock ở tap đầu tiên, không click-pop (ramp 5ms).

=== ITERATION 3 — ENTERPRISE HARDENING ===
- Visibility API: document.visibilitychange → tab hide = pause toàn bộ + audio.suspend; resume = countdown 3-2-1; dt clamp chống time-jump.
- LocalStorage schema v1 (try/catch toàn bộ, chịu corrupt/clear): kl_best, kl_chainBest, kl_career {runs, totalCaptures, evolutions}, kl_settings {bgm, sfx, haptics}, kl_seedDaily.
- Near-miss hitbox −20%: hitbox va chạm chết = 0.8 x visual radius (graze sát mặt sống được — cảm giác mastery); zone graze 0.8r → 1.3r: +25 x chain điểm, whoosh SFX, flash viền, cooldown 0.4s mỗi wisp.
- Instant Replay < 150ms: ring buffer SoA snapshot 30Hz x 4s = 120 frame (koi pos, ≤ 64 wisps, 28 ribbon node, score); chết → playback 0.45x tốc độ trong ≤ 2 frame, letterbox + nhãn REPLAY, tap skip; buffer cấp phát 1 lần duy nhất.
- Anti-GC: cấm .map/.filter/concat/slice/new/closure/string-concat trong RAF; xác minh bằng Chrome allocation profiler 10s gameplay = 0 heap growth steady-state.
- Adaptive difficulty: 3 thua liên tiếp < 30s → −10% spawn rate; ghost-finger tutorial 3 run đầu.
- Checklist C3: (1) pause/resume không glitch vật lý; (2) replay start ≤ 2 frame sau chết; (3) profiler 0 allocation trong RAF; (4) localStorage an toàn khi corrupt.

=== ACCEPTANCE CRITERIA (NGHIỆM THU ENTERPRISE — FINAL) ===
1. Standalone 100%: 1 file index.html mở trực tiếp file://, offline chạy đầy đủ, 0 asset ngoài, 0 request ngoài, 0 dependency (font dùng stack system).
2. 60 FPS locked: giữ ≥ 58fps trong worst-case (60 wisps + 1024 hạt + đang ghi replay), frame p99 ≤ 20ms.
3. 0 GC trong RAF: không cấp phát heap nào trong steady-state RAF (chỉ cho phép cấp phát 1 lần lúc boot/state-transition).
4. 1-thumb hoàn hảo: touch-action none, tap → phản hồi ≤ 1 frame, chặn scroll/zoom/double-tap-zoom hoàn toàn.
5. Console self-test: toàn bộ C1/C2/C3 PASS + log 'KOILOOP READY'.

=== TECHNICAL BLUEPRINT ===
- Bảng màu (gradient): nền vortex radial #05060E → #0B1030 → #14224A; koi body #FFD166 → #FF8C42 → #FF5E62; ribbon additive glow #7DF9FF → #40E0D0, alpha 0.9 → 0.1 theo TTL; wisp Thường #B06AB3 → #6C3FA0, Phased #3FA0A0, Splitter #E05555, Guardian #E0C555; UI text #EAF6FF; danger flash #FF3B5C.
- Loại wisp: Thường (chase); Phased (mở khóa 45s, phải bị bắt trong 2 vòng liên tiếp); Splitter (90s, tách 2 con khi bị bắt); Guardian (140s, chỉ vulnerable 1.2s sau telegraph dash đỏ).
- Công thức điểm/combo: capture = 10 x n² x chain x tier (n = số wisp trong 1 vòng); chain window 2.0s, hệ số tier [1.0, 1.5, 2, 3, 4, 6, 8]; graze +25 x chain; Frenzy meter: mỗi 15 capture → 5s THĂNG LONG (bất tử, speed +50%, điểm x2, ribbon hóa rồng lửa); evolution: mỗi 1000 điểm mở cổ Vũ Môn băng qua màn — xuyên cổ để tiến hóa Koi → Giao → Rồng (+stat vĩnh viễn trong run, visual + trail mới mỗi tier).
- HUD: score góc trái trên, chain meter giữa đỉnh, frenzy bar đáy màn; game over hiện best-delta + nút share (copy clipboard).
- State machine: BOOT → TITLE → COUNTDOWN → RUN → REPLAY → GAMEOVER → RUN; PAUSE overlay bất kỳ lúc nào (nút + visibilitychange).
- Perf budget: logic ≤ 1.6ms, draw ≤ 8ms @1080p/DPR2 mid-tier; batch canvas ops, không state-change thừa giữa draw calls.
```
