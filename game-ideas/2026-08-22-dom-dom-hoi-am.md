# Đom Đóm Hồi Âm

- **Ngày:** 2026-08-22
- **Genre:** Echolocation Arcade — score-chaser 1-thumb điều khiển bằng ánh sáng-sóng-âm: Sonar Ping vẽ nên thế giới, Graze Near-miss nhân điểm, Lumen Combo tự sinh nhạc pentatonic
- **Mô tả:** Bạn là một con đom đóm lạc trong hang động tối tuyệt đối — thế giới chỉ hiện hình khi bạn phát sóng hồi âm. Dùng ngón tay cái dẫn đường, lướt sát vách đá để 'graze' được điểm và Heat, nghe bản giao hưởng pentatonic tự sinh mỗi khi combo thăng tầng, và chết ngay lập tức nếu bóng tối thắng bạn.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal
Xây dựng 'Đom Đóm Hồi Âm' — game H5 arcade score-chaser chuẩn thương mại của một studio chuyên nghiệp: single-file HTML, zero asset ngoài, chơi được ngay trên mọi trình duyệt mobile/desktop, session 30–120 giây. Hook trong 5 giây đầu: MÀN ĐEN TUYỆT ĐỐI → tap → sóng âm lan ra VẼ NÊN THẾ GIỚI → người chơi hiểu luật không cần tutorial. Vòng lặp dopamine rõ ràng: graze sát vách → chain combo → chime tăng nốt → multiplier tăng → liều lĩnh hơn → chết → restart < 400ms → 'một lần nữa'. Khác biệt với game amateur: mọi hiệu ứng đều có pool, mọi âm thanh đều procedural, mọi con số tuning nằm trong 1 object TUNING duy nhất, game-feel đạt chuẩn premium (hitstop, trauma shake, instant replay).

=== AUTONOMOUS ITERATION LOOP (agent tự lặp, bắt buộc self-review đạt mới sang bước tiếp) ===

[ITERATION 1 — CORE ENGINE]
1. Canvas 1080p HiDPI: full-screen, nhân với devicePixelRatio (cap 2.0), viewport logic 1080x1920 letterbox scale-to-fit, resize handler không cấp phát bộ nhớ mới.
2. Fixed-step physics: accumulator pattern, SIM_DT = 1/120s, clamp frame 0.25s chống spiral-of-death, render interpolation theo alpha, tách tuyệt đối update() và render().
3. 1-thumb control: vị trí ngón tay = điểm mục tiêu; đom đóm bám bằng lò xo giảm chấn a = -k(p - p_target) - c*v với k = 42 s^-2, c = 9 s^-1. Pointer events thống nhất (touch/mouse/pen); WASD cho desktop QA.
4. Thế giới: hang động cuộn vô tận — vách trái/phải là hàm bán kính R(t) nội suy Catmull-Rom qua các control point cách đều 240px, điều biến bằng value-noise 1D (seeded RNG, restartable). Camera scroll theo tiến trình + lookahead 180px theo vận tốc.
5. Sonar Ping (cơ chế chủ đạo): tap vùng nút hoặc double-tap phát vòng sóng lan 900 px/s; mọi hình học chạm frontsóng hiện sáng rồi phai theo e^(-t/τ), τ = 0.9s. Cooldown 0.6s, mỗi ping tốn 1 Năng Sáng (thanh 5 hạt, ăn mote để nạp) → tạo nhịp rủi-ro/thưởng: ping để nhìn thì mất đạn.
6. Điều kiện đạt: bay được end-to-end, chết khi chạm vách, restart < 400ms, 60 FPS ổn định với 1000 hạt demo, physics vẫn đúng khi throttle CPU 6x.

[ITERATION 2 — ENTERPRISE JUICE]
1. Particle pooling: ring-buffer 2048 hạt pre-allocated bằng TypedArray (x, y, vx, vy, life, size, hue) — spawn chỉ ghi slot, TUYỆT ĐỐI không new/closure/array-literal trong hot path.
2. Screen shake theo mô hình trauma: shake = trauma^2, offset = 14 x shake x noise2D(t x 35), decay 1.4/s. Va chạm nhẹ trauma 0.3, chết trauma 1.0.
3. Hitstop & slow-mo: graze = timescale 0.05 trong 90ms; chết = freeze 220ms rồi slow-mo 0.25 ramp về 1.0 trong 800ms (easing cubic out).
4. Procedural WebAudio 0-asset: unlockAudio() ở gesture đầu tiên (resume + silent-buffer cho iOS). Graph: master -> DynamicsCompressor -> destination; bus nhạc -> feedback-delay giả reverb (delay 0.23s, feedback 0.35, wet 0.18). Sonar ping = sine sweep 880 -> 220Hz trong 0.5s, envelope exp-decay. Ambient = 2 oscillator 55Hz detune ±4 cent + lowpass LFO (hơi thở hang động). Combo chime = pentatonic A minor (220, 261.63, 293.66, 329.63, 392, 440 Hz), triangle osc, envelope 0.18s, mỗi tầng combo nhảy 1 nốt. Near-miss whoosh = white-noise buffer 1s pre-render dùng lại qua bandpass.
5. Lumen Combo: mote nằm cách vách ≤ 60px là 'graze mote' x2 điểm; combo window 2.0s; multiplier = 1 + floor(chain/8), cap x12; HUD combo heatmap đổi màu theo tầng.
6. Self-review bằng Chrome Performance: budget mỗi frame — physics ≤ 1.5ms, particles ≤ 2.5ms, render ≤ 3ms. Vượt budget → tối ưu trước khi sang Iteration 3.

[ITERATION 3 — ENTERPRISE HARDENING]
1. Visibility API: document.hidden → suspend audio, freeze accumulator, RAF idle; resume có 500ms khiên 'Get Ready' chống chết oan.
2. LocalStorage versioned: {v:2, best, totalRuns, settings:{sfx, shake, colorblind}}; try/catch mọi truy cập (private-mode safe); nút reset trong menu.
3. Near-miss hitbox -20%: hitbox chết = bán kính va chạm x 0.8; graze ring = x 1.6; bay trong graze ring nuôi thanh Heat — Heat đầy kích Phoenix Mode 3s (đom đóm tự phát sáng, ping miễn phí, điểm x2) → phần thưởng cho người chơi liều lĩnh.
4. Instant Replay < 150ms delay: ring buffer 180 frame (Float32Array) trạng thái player + vách; khi chết freeze → replay 2.2s ở 0.5x tốc độ với vignette + tag REPLAY → tap để restart ngay.
5. Adaptive quality: đo FPS trung bình mỗi 2s; nếu < 55 → giảm particle budget 30% → giảm DPR → tắt glow layer (giảm dần theo chi phí, không bao giờ giật).
6. Final QA checklist + build minify-inline thành đúng 1 file HTML.

=== ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu bắt buộc) ===
A1. Standalone 100%: 1 file HTML mở qua file:// chạy đầy đủ; Network panel ghi 0 request ngoài chính nó.
A2. 0 asset ngoài: hình = canvas vector/gradient, âm = WebAudio procedural, font = system-ui stack.
A3. 60 FPS locked: ghi Performance 60s, ≥ 99% frame < 16.7ms trên máy mid-range; không frame nào > 100ms kể cả lúc spawn bùng nổ.
A4. 0 GC allocation trong RAF: Allocation instrumentation — steady-state gameplay không cấp phát mới (chỉ cho phép alloc lúc init/menu/restart).
A5. 1-thumb hoàn chỉnh: chơi trọn vẹn bằng 1 ngón cái; vùng dieu khiển ≥ 40% màn hình; không UI chồng vùng thumb.
A6. Cold load → gameplay đầu tiên ≤ 1.5s; chết → đang chơi lại ≤ 400ms.
A7. Audio: unlock đúng gesture đầu; mute vẫn chơi đầy đủ; envelope attack ≥ 5ms (không click/pop).
A8. Tab switch 10 lần liên tiếp: không mất state, không audio zombie, không tụt frame sau khi quay lại.

=== TECHNICAL BLUEPRINT ===
- Bảng màu: nền gradient dọc #030308 -> #0b0b1e -> #1a0b2e (đáy hang -> viền tím); đom đóm #7dffd4 + glow radial 3 lớp alpha 0.4/0.15/0.05; mote amber #ffb347 -> #ffd98a; nguy hiểm magenta #ff3d6e nhấp nháy 4Hz; sóng sonar cyan #9fefff alpha theo e^(-r/λ). Colorblind mode: nguy hiểm chuyển sang pattern sọc thay vì phụ thuộc hue.
- Typography: system-ui, số dùng tabular-nums, score weight 700.
- Vật lý: không trọng lực (top-down 2D), drag bậc 2 v|v| x 0.001, max speed 640 px/s.
- Difficulty Director: D = 1 + t/45; bề rộng hang lerp 560 -> 300px; mật độ chướng ngại = (0.4 + 0.3D) / 100px; pattern weighted-random xen kẽ (thẳng, chữ S, buồng rộng, rào cột) + 'rest beat' 5s mỗi 20s.
- Scoring: distance x1 + motes x50 x multiplier + graze ticks x12; best lưu LocalStorage; share qua navigator.clipboard.
- Kiến trúc code: các module IIFE — Engine, Input, Audio, Particles, World, Entities, UI, Storage; 'use strict'; mọi hằng số gom trong object TUNING đặt đầu file để tuning không phải đụng logic.
```
