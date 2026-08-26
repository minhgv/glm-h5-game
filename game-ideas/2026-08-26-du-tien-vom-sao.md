# ĐU TIÊN: Vòm Sao Đom Đóm

- **Ngày:** 2026-08-26
- **Genre:** Arcade / Casual — One-thumb Endless Ascender: Pendulum-Slingshot Climber kết hợp timing Perfect-Arc release, near-miss risk-reward và combo chain
- **Mô tả:** Giữ 1 ngón tay để móng vào đom đóm neo sáng gần nhất và đu như con lắc, thả đúng khoảnh khắc để bắn ly tâm vọt lên vòm sao vô tận — càng dám lượn sát hiểm họa đỏ ở khoảng cách muối mặt, combo Dây Sao càng nổ. Nhịp 'đu chậm — thả dũng cảm — rơi nhanh' tạo vòng lặp 'một ván nữa' cực kỳ gây nghiện.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
VAI TRÒ: Bạn là Lead Engineer kiêm Game Director của một studio arcade enterprise. Sản phẩm: game H5 thương mại hoá được, 1 file HTML duy nhất, 1-thumb, không có dấu vết amateur.

/GOAL: Xây dựng DU TIEN: Vom Sao Dom Dom — vertical pendulum-slingshot climber. Người chơi là 1 đốm lửa đom đóm leo lên vô hạn: giữ ngón tay cái = móng (latch) vào anchor gần nhất phía trên và đu theo vật lý con lắc thật; thả = bắn ly tâm theo tiếp tuyến. Độ sâu đến từ 3 lớp kỹ năng: (1) chọn thời điểm thả hoàn hảo — Perfect Arc, (2) chuỗi combo Dây Sao khi chuỗi latch liên tục không chạm tường, (3) near-miss: chủ động lượn sát hazard để ăn bonus. KPI studio: phiên chơi TB >= 6 phút, D1 retention >= 35%, first death trong <= 25s (fast fail), cảm giác juice ngang tile chart toppers. Mọi決 định không rõ → ưu tiên 'cảm giác tay' > đồ hoạ > tính năng phụ.

NGUYÊN TẮC VÒNG LẶP TỰ TRỊ: Sau mỗi iteration, TỰ CHẠY verification gate bằng trình duyệt/console; nếu fail → chẩn đoán, sửa, chạy lại (tối đa 5 vòng nhỏ/iteration); chỉ sang iteration kế khi gate toàn xanh. Không hỏi người dùng giữa chừng, không để lại TODO rỗng.

=== ITERATION 1 — CORE ENGINE ===
- 1 file HTML standalone, canvas 1920x1080 design-space, scale theo devicePixelRatio (cap 2.0), letterbox-safe, safe-area inset respected.
- Fixed-step physics: dt = 1/120s, accumulator clamp 250ms, render interpolation theo alpha; duy nhất 1 RAF loop.
- Input 1-thumb: pointerdown = latch anchor hợp lệ gần nhất phía trên trong bán kính 520px; pointerup = release. Fallback chuột + phím Space; debounce 8ms chống double-fire; touch-action: none.
- Vật lý con lắc: g = 2200 px/s²; Verlet integration + rope-length constraint (project vị trí về vòng tròn bán kính L quanh anchor, bảo toàn tốc độ tiếp tuyến); damping 0.999/tick; vận tốc thả = tiếp tuyến x 1.02 (slingshot boost).
- Anchor sinh vô hạn theo band độ cao bằng seed-able RNG (mulberry32), |dx| ngang giữa 2 anchor <= 30% chiều rộng màn, khoảng cách dọc 380–620px.
- Camera chỉ đi lên (theo max-height đạt được); chết khi rơi khỏi đáy màn 160px hoặc chạm hazard full-hitbox.
- GATE 1: đu/mở/thả mượt không giật, không vượt ràng buộc dây; 60 FPS desktop ổn định; resize/rotate không vỡ layout.

=== ITERATION 2 — ENTERPRISE JUICE ===
- Particle pool 512 pre-allocated: Float32Array struct-of-arrays (x, y, vx, vy, life, size, hueIdx), spawn bằng con trỏ vòng — 0 keyword new trong frame.
- Screen shake hệ trauma: shake = trauma^2, decay 1.6/s, offset tối đa 14px + roll ±1.2 độ; latch trauma 0.15, Perfect Arc 0.35, chết 1.0.
- Hitstop: Perfect Arc 40ms, chết 120ms — ngưng accumulate physics nhưng vẫn render (không đóng băng canvas).
- WebAudio 100% procedural 0-asset: unlockAudio() gọi ở pointerdown đầu tiên (resume/suspend AudioContext đúng chính sách autoplay); latch = Karplus-Strong pluck 180 Hz; whoosh = white-noise buffer loop + bandpass, cutoff map theo vận tốc góc; Perfect Arc = nốt arpeggio pentatonic A-minor leo theo combo (A4 440 → C5 523.25 → E5 659.25 → G5 784 → A5 880, quá combo 5 chuyển octave); near-miss = ping sine 1244 Hz decay 90ms; pad nền = 2 oscillator detune ±7 cent + LFO lowpass 0.1 Hz, tempo brightens +8%/km độ cao; chết = sub-drop 110 → 38 Hz trong 300ms.
- Trail ribbon 24 điểm cho spark (alpha gradient dọc ribbon); squash/stretch spark theo |v| (scale 1.0–1.35).
- Combo text popup pool với scale-punch easeOutBack 220ms — tái sử dụng, không innerHTML.
- GATE 2: nghe/nhìn rõ 5 sự kiện riêng biệt (latch, perfect, near-miss, touchdown, chết); không clipping, không vẽ đè HUD; Chrome allocation sampling: particle/audio path 0 byte cấp phát mới.

=== ITERATION 3 — ENTERPRISE HARDENING ===
- Visibility API: tab ẩn → pause toàn bộ (physics + audioCtx.suspend); quay lại → đếm ngược 3-2-1 (1s/số, vẽ canvas, 0 allocation) rồi resume; chống time-jump bằng clamp accumulator.
- LocalStorage schema 'dts_v1': { bestAltitude, totalStars, settings: {sfx, music, shake, reducedMotion}, schemaVersion } — wrap try/catch (chế độ private mode), có migrate version, không bao giờ crash vì storage đầy.
- Near-miss hitbox: va chạm thật dùng hitbox thu 20%; vòng vỏ 28px quanh full-box hazard = near-miss → +75 điểm, micro time-dilation 0.85x trong 120ms, sparkle cyan #7BF7FF, trauma 0.1.
- Instant Replay: ring buffer 20 Hz x 1.5s snapshot trạng thái (pos, vel, anchor hiện tại, 24 điểm trail, hazards); khi chết → replay đúng 140ms cuối ở tốc độ 0.5x với letterbox + chromatic offset 2 kênh RGB; tổng độ trễ từ chết đến màn nhập lại < 150ms.
- Reduced-motion setting: tắt shake + slow-mo replay, giữ nguyên gameplay (tuân thủ prefers-reduced-motion lần chạy đầu).
- GATE 3: kill tab giữa chừng → mở lại không mất best/settings; chuyển tab 20 lần liên tiếp không lệch thời gian vật lý; allocation sampling trên RAF loop = 0 byte.

=== ACCEPTANCE CRITERIA — NGHIỆM THU ENTERPRISE (ALL xanh mới hoàn thành) ===
1. Standalone 100%: 1 file .html mở trực tiếp qua file://, không network request, không CDN, không asset ngoài, không font ngoài (system font stack + canvas text).
2. 60 FPS locked: frame time p95 <= 17.5ms trên laptop mid-2019 và Android tầm trung, kiểm tra với DevTools 4x CPU throttle.
3. 0 GC allocation trong RAF: pre-allocate mọi vector/particle/audio-graph tĩnh; cấm string concat, array/object literal, closure mới, DOM write trong hot path; HUD chỉ update khi giá trị đổi (dirty flag).
4. Touch 1 ngón hoàn chỉnh ở mọi vị trí màn hình; không vùng chết, không zoom-page, không scroll.
5. Audio unlock hợp lệ mọi browser chính; mute persist qua session; không tiếng rè do denormal (highpass 10 Hz mọi node gain).
6. Vòng lặp one-more-run: chết đầu <= 25s, restart <= 1.2s kể từ tap nút.
7. Code sạch: strict mode, 0 console warning, toàn bộ hằng gameplay gom 1 object CONFIG duy nhất để tuning.

=== TECHNICAL BLUEPRINT (khoá bởi Director) ===
- Bảng màu gradient nền theo band độ cao (đổi tone mỗi 1200px, lerp chuyển tiếp 240px): #0B1026 → #1B2A4A (band 0, nửa đêm) → #2A1B4A (violet) → #0F3B4A (teal aurora) → #4A1B3A (magenta dawn) → lặp #0B1026. Accent: anchor #FFD166, spark #FFE9A3, dây tether #7BF7FF alpha 0.75, hazard #FF4D6D, near-miss glow #7BF7FF, UI text #F5F3FF. Star field 3 lớp parallax (hệ số 0.15/0.4/0.75) pre-render lên 2 offscreen canvas tái sử dụng.
- Công thức điểm & combo: score = floor(altitude/10) + Σ(Perfect Arc 150 x multiplier + near-miss 75). Multiplier = 1 + 0.25 x comboPerfect (cap x8). Perfect Arc điều kiện: góc dây–trục đứng < 8 độ VÀ tốc độ tiếp tuyến > 620 px/s tại khoảnh khắc thả. Combo reset khi: chạm biên ngang màn, hoặc treo đứng im > 2.5s, hoặc thả trống (không latch kịp).
- Difficulty curve: từ 1500px xuất hiện hazard quay (omega 0.8 rad/s, +0.15/km, tăng dần); từ 3000px anchor di động theo sin(t) biên độ 60–140px; từ 6000px gravity well hút nhẹ (gia tốc 300 px/s² hướng tâm, bán kính 240px); mật độ hazard giao động theo sóng — không tăng đơn điệu, có nhịp thở.
- HUD: độ cao dạng km 1 chữ số thập phân, combo punch-scale, vạch vàng đánh dấu bestAltitude của session trước.
- Chuẩn bị thương mại hoá (không chặn gameplay): màn kết thúc run = slot interstitial; totalStars = đồng phí cho rewarded video; CONFIG tách riêng để A/B tuning sau này.

LUỒNG XUẤT: sinh duy nhất 1 file du-tien-vom-sao.html kèm 3 checklist gate tự nghiệm ở comment cuối file.
```
