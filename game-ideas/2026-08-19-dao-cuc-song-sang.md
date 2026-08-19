# Đảo Cực: Sóng Sáng

- **Ngày:** 2026-08-19
- **Genre:** Endless Neon Reflex Arcade (polarity-swap runner) — 1 thumb: kéo ngang để lái tia sáng, chạm nhanh để đảo cực tính; cùng cực = xuyên qua và ăn điểm, khác cực = tử vong
- **Mô tả:** Bạn là một tia sáng lao qua đường hầm neon: chạm để đảo cực tính giữa CƠM (cyan) và HỒNG (magenta), xuyên đúng cổng cùng cực để nối chuỗi combo, len vào mép cổng để ăn Near-Miss và bùng nổ FLOW — chậm một nhịp là tan thành sao.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — Sản xuất game H5 arcade THƯƠNG MẠI chuẩn Enterprise Arcade Studio, phân biệt rõ ràng với sản phẩm nghiệp dư: (1) 100% standalone 1 file index.html, zero asset ngoài, zero network call; (2) game feel ngang chart-top: input→phản hồi ≤ 1 frame, vòng lặp chết→chơi lại < 1.5s; (3) KPI mục tiêu: D1 retention ≥ 40%, session trung bình ≥ 4 phút, deaths/session ≥ 6 (chết là lỗi của người chơi, không phải của engine). Ba trụ cột thiết kế: PHẢN XẠ (quyết định mỗi 0.4–1.0s khi tốc độ tăng), DÒNG CHẢY (FLOW streak khi combo cao), CẢM GIÁC SỚT RUỘT (near-miss dopamine khi lách mép cổng).

VÒNG LẶP TỰ TRỊ — agent tự lặp, sau mỗi vòng PHẢI tự kiểm qua Cổng nghiệm thu của vòng đó; fail thì sửa xong mới được sang vòng sau.

[Iteration 1 — CORE ENGINE] Nhiệm vụ: (a) Canvas 1080×1920 design-space, DPR-aware (ctx.setTransform theo devicePixelRatio, clamp ≤ 2.5), letterbox giữ tỉ lệ, resize an toàn orientation change; (b) Vòng lặp fixed-step: accumulator, SIM_DT = 1/120s, clamp frame ≤ 250ms, render interpolation alpha cho mọi entity (x_render = x_prev + (x − x_prev)·alpha); (c) Input 1 thumb hợp nhất qua Pointer Events: pointermove đặt steering target theo tọa độ X, pointerup với thời gian nhấn < 200ms và dịch chuyển < 12px tính là TAP → đảo cực; (d) Gameplay dọc: tia sáng cuộn theo trục màn hình, spawn cổng đôi CƠM/HỒNG, logic cùng cực đi xuyên + ăn, khác cực chết, tường 2 bên phản xạ mềm; (e) UI tối thiểu: title → play → game over → restart. Cổng nghiệm thu: chơi tay 60s mượt, không giật interpolation, tap không bao giờ bị nuốt, chết luôn là lỗi người chơi.

[Iteration 2 — ENTERPRISE JUICE] Nhiệm vụ: (a) Particle pool 512 pre-allocated (spawn chỉ reset field, không new); trail ribbon vẽ từ ring-buffer 24 điểm với globalCompositeOperation = lighter; (b) Screen shake theo trauma: offset = 26·trauma²·noise, trauma −= 2.2·dt; (c) Hitstop: 70ms đóng băng sim khi chết, 40ms micro-hitstop khi lên tier combo; (d) WebAudio 0-asset procedural: unlock audio trong gesture đầu tiên (resume AudioContext trong pointerdown), chain master gain → DynamicsCompressor → destination; (e) SFX: đảo cực = square gliss 220→880Hz/60ms; ăn điểm = sine thang ngũ cung C (523.25, 587.33, 659.25, 783.99, 880Hz) index = chain mod 5, decay 0.12s; near-miss = triangle ping 1318.5Hz; chết = sawtooth rơi 440→55Hz/300ms + noise burst qua bandpass 800Hz; nhạc nền = 2 saw detune ±0.7Hz tại 110Hz qua lowpass 380Hz, LFO 0.1Hz depth 120Hz, vào FLOW thì octave lên + noise-hat 16th note gain 0.05. Cổng nghiệm thu: checklist juice (mỗi sự kiện game đều có âm + hình phản hồi), audio phát đúng lần chạm đầu, không tiếng rè.

[Iteration 3 — ENTERPRISE HARDENING] Nhiệm vụ: (a) Visibility API: tab ẩn → pause sim + suspend audio, quay lại → đếm ngược 3-2-1; (b) LocalStorage có version + try/catch: best score, tổng run, mute, seed Daily Challenge (mulberry32); (c) Near-miss hitbox −20%: hitbox chết thu nhỏ 20%, vùng 100–120% kích mép = NEAR MISS +50% điểm, +1 chain, slow-mo 0.3× trong 120ms; (d) Instant Replay: ring buffer 150ms vị trí người chơi + hazards, khi chết phát ghost replay độ trễ tổng < 150ms trước màn game over; (e) Difficulty curve: tốc độ cuộn v = 420 + 9·sqrt(t) px/s cap 1180; khoảng spawn T = clamp(1.05 − 0.018·level, 0.38, 1.05)s. Cổng nghiệm thu: checklist production pass toàn bộ.

TIÊU CHUẨN NGHIỆM THU ENTERPRISE (bắt buộc 100%): (1) Standalone: 1 file HTML, không CDN, không fetch, không asset ngoài — mở file là chơi; (2) 60 FPS locked @ 1080p HiDPI (DPR 2) trên Android Chrome trung cấp 2021: frame budget 16.6ms, sim ≤ 4ms, render ≤ 8ms; (3) 0 GC allocation trong RAF: mọi entity/particle/vector cấp phát từ pool, không tạo closure, string, array mới trong hot loop, không dùng map/filter/concat/slice mỗi frame — xác nhận bằng Chrome DevTools Allocation instrumentation: 10s gameplay = 0 allocation trên call stack RAF; (4) Touch: pointer events hợp nhất, audio unlock đúng gesture, đề kháng ghost-touch; (5) Code: CONFIG const tập trung, RNG seedable, hàm thuần cho logic va chạm để test được.

TECHNICAL BLUEPRINT — Bảng màu: nền gradient dọc #05060E → #0B1026 → #1A0B2E (FLOW mode hue-shift +30°); neon CƠM #00F0FF, HỒNG #FF2E88, vàng combo #FFD166, chết #FF3B3B, lõi tia sáng #FFFFFF, glow shadowBlur 24 cùng màu; Vật lý lái: spring-damper a = −k·(x − target) − c·vx với k = 140, c = 18, flip cooldown 120ms, hoàn đổi cực 80ms ease-out; Combo: điểm = 10 × mult, mult = 1 + floor(chain/8) cap ×8, FLOW tại chain 24 thưởng x2; HUD monospace system-font, số combo scale-pop 1.4→1.0/150ms; Mọi hằng số nằm trong CONFIG để tuning không đụng logic.
```
