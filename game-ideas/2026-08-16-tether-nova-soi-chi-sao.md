# TETHER NOVA: Sợi Chỉ Sao

- **Ngày:** 2026-08-16
- **Genre:** Arcade Endless Vertical — Tether-Orbit-Fling Precision Climber (1-thumb, physics-driven, score-chase)
- **Mô tả:** Giữ ngón tay cái để neo đu vào sao gần nhất và quay quanh nó, thả tay đúng khoảnh khắc để văng theo tiếp tuyến leo lên vô tận trong giếng tinh vân — mỗi cú thả 'perfect' và mỗi lần lượn sát hiểm họa đều đẩy nhạc synthesizer và combo bùng nổ, tạo cảm giác nghiện 'một lượt nữa' kiểu Super Hexagon gặp Spider-Man.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — STANDING GOAL (Enterprise Arcade Standard):
Xây dựng TETHER NOVA là sản phẩm thương mại của studio, KHÔNG phải demo học tập: game arcade endless vertical 'tether-orbit-fling' chơi bằng 1 ngón tay cái trên H5 (canvas 1080p HiDPI), vòng lặp lõi là GIỮ để neo quỹ đạo quanh anchor-node gần nhất, THẢ để văng theo tiếp tuyến, leo vô tận trong giếng tinh vân, thua khi rơi khỏi khung camera. KPI thương mại: cảm giác 'juice' ngay 3 giây đầu, độ sâu combo 30 giây, trung bình ≥4 run/ngày, session ≥6 phút, kiến trúc chèn sẵn điểm hook monetization (revive có thưởng sau khi chết, interstitial mỗi 3 run, skin shop) và leaderboard cục bộ mà không cần refactor. Toàn bộ phải đạt Nghiệm thu Enterprise bên dưới mới được gọi là xong.

AUTONOMOUS ITERATION LOOP — agent TỰ LẶP 3 giai đoạn, mỗi giai đoạn phải chạy và tự kiểm tra trước khi sang giai đoạn kế:
[ITERATION 1 — CORE ENGINE] Canvas 1920x1080 logic size, scale theo devicePixelRatio (cap 2.0) cho HiDPI sắc nét. Vòng lặp rAF + accumulator fixed-step: dt = 1/120s, alpha = accumulator/dt để render nội suy (interpolation) mượt; spin-wheelguarded (max 5 substep/frame chống spiral of death). Vật lý: trọng trường g = 2200 px/s² hướng xuống; khi GIỮ: tìm anchor trong bán kính bắt 420px ưu tiên phía trên, gắn tether, vận tốc góc ω = sign của tích chấm (r × v) × (6.2 + 140/max(r,60)) rad/s, bán kính tether co dần r(t) = r0 − 180·t (floor 70px) tạo cảm giác căng như dây thun; khi THẢ: v_flint = ω·r theo vectơ tiếp tuyến, cộng hụt 4% lực để trọng lực luôn thắng nếu không thả — cơ chế 'luôn phải hành động'. Camera chỉ đi lên: y_cam = min(y_cam, player.y − 520), lerp 0.08. Input 1-thumb: pointerdown/pointerup/pointercancel toàn màn hình, chặn contextmenu/gesture/scroll, touch-action:none. Trạng thái game: BOOT → MENU → RUN → DEATH → REVIVE_OR_MENU. Định mức: nếu run không đạt 60fps ổn định hoặc vật lý lệch khi đổi tab thì chưa qua.
[ITERATION 2 — ENTERPRISE JUICE] (a) Particle pool 512 preallocated (spark khi latch, ring-burst khi thả, dust khi near-miss) — zero new trong vòng lặp; (b) Screen shake: trauma hệ thống (trauma += 0.4 khi latch, += 1 khi chết; offset = trauma² × 26px × noise, decay 2.2/s) — KHÔNG dịch canvas trực tiếp bằng random mỗi frame; (c) Hitstop: timescale = 0 trong 45ms khi perfect-fling, 70ms khi near-miss, 120ms khi chết (bằng cách ngưng tiêu accumulator, không ngưng rAF); (d) WebAudio 100% procedural 0-asset: unlockAudio() trên pointerdown đầu tiên (resume + 2 nốt noop trong user gesture), master chain = compressor → destination; nhạc nền = sequencer pentatonic 5 nốt dựa A3 220Hz với tần số f = 220 × 2^(n/12) theo bậc [0,3,5,7,10], mỗi 8 combo lên 1 quãng tám; SFX: latch = pluck tam giác 180Hz decay 0.12s; release = sweep sawtooth 240→680Hz 0.18s; near-miss = noise burst highpass 3kHz 60ms; chết = sub sine 90→30Hz 0.6s. Trail player = dải 32 điểm fade gradient cyan→magenta. Định mức: nghe thấy nhạc ngay chạm đầu, không tiếng rắc DLC, juice không làm tụt dưới 60fps.
[ITERATION 3 — ENTERPRISE HARDENING] (a) Visibility API: document.hidden → pause toàn bộ (đóng băng accumulator, suspend AudioContext), resume đếm ngược 3-2-1 chống chết oan; (b) LocalStorage (namespace tethernova_v1): best score, tổng run, setting âm lượng, chống ghi chặn bằng try/catch; (c) Near-miss hitbox −20%: hitbox nguy hiểm thực = 80% kích thước vẽ, zone near-miss = 100%→120% — lượn sát hiểm họa trong zone này +2 combo (rủi ro-thưởng cân bằng); (d) Instant Replay <150ms: ring buffer 150ms × 60 slot vị trí player + hazard, khi chết tua lại chậm 0.5× trong 1.2s rồi hiện DEATH UI. Định mức: full checklist nghiệm thu bên dưới PASS thì mới ship.

ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu bắt buộc):
1) Standalone 100%: đúng MỘT file index.html, mở bằng file:// chạy được, 0 request mạng, 0 asset ngoài, 0 CDN, 0 thư viện ngoài.
2) Hiệu năng: 60 FPS locked trên Chrome mobile devtools; rAF không được cấp phát bất kỳ object/array/closure nào (dùng pool + vectơ scratch tái sử dụng; xác minh bằng Memory heap snapshot 3 lần so delta = 0 allocation tăng trưởng trong steady-state) — Zero-GC-RAF là điều kiện tuyệt đối.
3) Vật lý deterministic: kết quả run giống nhau khi same input ở cùng seed (seeded RNG mulberry32 cho layout neo + hazard).
4) Tab pause hoạt động: rút điện tab 10s quay lại không nhảy thời gian, không chết oan.
5) Chơi được 1-thumb toàn bộ, không UI nào cần chạm thứ hai khi đang RUN.
6) Điểm hook thương mại hiện diện dạng stub hoạt động: revive button, banner sau 3 run, skin swapper (thuần local).

TECHNICAL BLUEPRINT (agent tự định nghĩa chi tiết, đây là baseline):
— Bảng màu gradient: nền giếng tinh vân dọc #05060F → #150B2E → #3D1F5C, sao nền parallax 3 lớp; player comet #22D3EE (cyan neon) với lõi trắng #F8FAFC; tether gradient #22D3EE→#F472B6 (magenta); anchor node vàng hổ phách #FBBF24 pulsing; hazard blade đỏ #EF4444 viền #FCA5A5; UI font stack: system-ui, letter-spacing 0.2em uppercase cho cảm giác arcade cao cấp.
— Công thức cốt lõi: điểm = mét cao độ (y/100) × multiplier; combo: perfect-fling (thả trong ±12° cửa sổ góc tối ưu tính từ hướng thẳng lên qua tâm neo) +1 combo +40ms hitstop + flash ring; near-miss +2 combo +70ms hitstop + zoom-pulse 1.04×; chuỗi combo chỉ sống 4 giây không feeding; multiplier = 1 + floor(combo/5), cap ×12; mỗi lần x2 milestone → đổi tông nền + particle爆发.
— Difficulty curve: mật độ node giảm dần 420px→300px khoảng cách theo độ cao; từ 800m xuất hiện node di động sin; từ 1500m blade quay; từ 2500m giếng trọng lực cục bộ kéo player lệch (thêm vectơ a = 5200/r² hướng tâm wells) — mọi thứ đều công bằng vì spawn dựa seed + luôn có đường đi an toàn tối thiểu 2 lựa chọn neo.
— HUD: score trên cùng giữa, combo meter thanh mảnh hai bên viền, high-water line (vạch kỷ lục cũ) vẽ mờ trong thế giới — chất 'một lần nữa' khi vượt vạch kèm shimmer.
— Anti-frustration: 2 lần latch 'assist snap' bán kính +15% trong 30 giây đầu mỗi run cho người mới; DEATH screen hiện 3 số liệu (cao độ, combo max, near-miss count) + nút revive.
```
