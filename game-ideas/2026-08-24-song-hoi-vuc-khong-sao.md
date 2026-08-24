# Sóng Hồi: Vực Không Sao

- **Ngày:** 2026-08-24
- **Genre:** Arcade Survival-Scroller 1-thumb — cơ chế độc quyền Sonar-Vision Risk/Reward (nhìn thấy kẻ địch = đánh thức kẻ địch)
- **Mô tả:** Lặn vào vực sâu không một tia sáng, nơi khả năng nhìn thấy chính là đạn mất phí: mỗi lần phát sóng âm soi đường, bạn vô tình triệu hồi những Kẻ Nghe hung hãn về đúng vị trí phát sóng. Một ngón tay, hàng nghìn quyết định ping-hay-không-ping mỗi phút — càng liều thấy, càng giàu điểm, càng gần chết.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — XÂY DỰNG SÓNG HỒI: VỰC KHÔNG SAO, game H5 arcade one-thumb thuộc dòng survival-scroller với hook độc quyền VISION-IS-AMMUNITION (thấy được kẻ địch = đánh thức kẻ địch). Chuẩn Enterprise Arcade Studio: sản phẩm thương mại hoá được ngay trên web-portal, khác biệt tuyệt đối với game业余/học sinh ở chỗ: 1 file HTML duy nhất chạy trực tiếp từ file:// không server không build-tool, 0 phụ thuộc 0 asset ngoài, 60 FPS locked, 0 garbage trong render loop, juice và meta-loop ngang sản phẩm studio. Agent được tự do tinh chỉnh hằng số kỹ thuật nhưng KHÔNG được thay đổi hook cốt lõi.

=== TRIẾT LÝ THIẾT KẾ ===
- Vòng risk/reward trung tâm: ping để SOI (an toàn trước tường) nhưng ping làm TỈNH mọi predator trong 900px và chúng homing về đúng vị trí phát — người chơi phải ping-then-move, học cách bạo Kẻ Nghe đâm tường (bait-kill +50 điểm).
- Tài nguyên kép: echo meter (hao khi ping) và oxygen không tồn tại — chỉ có echo; pearl hồi echo và nuôi combo. Kinh tế một dòng duy nhất, dễ hiểu trong 3 giây.
- Cảm giác mục tiêu: mọi cái chết đều NHÌN THẤY nguyên nhân (replay + vệt sáng), không bao giờ chết oan — đây là điều kiện nghiện số 1 của arcade.

=== VÒNG LẶP TỰ TRỊ (AUTONOMOUS ITERATION LOOP) ===
Mỗi vòng: build → tự QC theo checklist liên quan → chỉ được sang vòng sau khi PASS tuyệt đối. Không được gộp vòng, không được skip QC.

■ ITERATION 1 — CORE ENGINE
Nội dung: canvas logic 1080x1920 (9:16) HiDPI (dpr = min(devicePixelRatio,3), ctx.setTransform(dpr,0,0,dpr,0,0), letterbox CSS fit = min(innerW/1080, innerH/1920)); vòng lặp rAF + accumulator fixed-step SIM_HZ=120 (dt=1/120, clamp frame 250ms) + interpolation alpha cho render (x_r = x_prev + (x-x_prev)*alpha); điều khiển 1-thumb: pointer-x map sang targetX, pod bám bằng spring-damper ax = k*(targetX-x) - c*vx với k=180, c=14 (zeta = c/(2*sqrt(k)) ≈ 0.52, hơi underdamped cho cảm giác bouncy); tốc độ dọc vy = 220 + depth*0.02 clamp 640 px/s; hang động từ value-noise 4 octave (hash xorshift 32-bit deterministic theo seed, lacunarity 2.0, gain 0.5), bề rộng hành lang W(d) = 360 - clamp(d*0.03, 0, 160) px; va chạm capsule-vs-tường bằng closest-point segment; sonar ring r(t) = 560*(1-e^(-t*3.2)) px, reveal geometry alpha = max(0, 1-(now-tReveal)/1.2) rồi tối dần; pearl xếp chuỗi cung; chết + tap-restart.
DoD: chơi trọn vẹn 1 run end-to-end; PASS mục A1+A2 bên dưới.

■ ITERATION 2 — ENTERPRISE JUICE
Nội dung: particle pool 1024 hạt structure-of-arrays (8 mảng Float32Array: x,y,vx,vy,life,maxLife,size,type + free-list index, 0 object alloc); screen shake mô hình trauma (biên độ = trauma^2 * 26 px, decay 1.6/s, rot jitter ±2.1 độ theo Perlin-noise 1D); hitstop near-miss 60ms timescale 0.35, chết 180ms full-stop; procedural WebAudio 0-asset với master chain masterGain → DynamicsCompressor → destination: ping = sine sweep 1400→320Hz trong 0.18s qua feedback-delay thật (DelayNode 0.21s, feedback 0.35, lowpass 1200Hz) tạo tiếng vọng; pearl = thang pentatonic C (523.25, 587.33, 659.25, 783.99, 880.00 Hz), bậc = combo % 5, lên 1 octave mỗi 10 combo, thêm quãng 5 hoàn chỉnh (x1.5) khi combo ≥ 8; near-miss = sub-sine 90Hz decay 0.12s + white-noise burst qua bandpass 300Hz Q=1 (noise buffer sinh 1 lần lúc init); growl Kẻ Nghe = 2 sawtooth 55/57Hz + LFO 6Hz depth 12Hz; heartbeat double-thump 52Hz khi echo < 25%; unlockAudio = AudioContext tạo lazy trong pointerdown đầu tiên + resume theo visibilitychange; HUD combo vòng tròn quanh điểm chạm, số pop scale 1.3→1.0 ease-out-back.
DoD: PASS A4; cảm giác đạt chuẩn: ping phải CÓ TIẾNG VỌNG, near-miss phải ĐÃ, ăn pearl phải thành giai điệu tăng dần theo combo.

■ ITERATION 3 — ENTERPRISE HARDENING
Nội dung: Visibility API — document.hidden thì pause SIM + audioCtx.suspend() + overlay PAUSED, resume kèm đếm ngược 3-2-1 (chống chết oan khi quay lại); LocalStorage key songhoi.save.v1 dạng {best, runs, pearls, mute} bọc try/catch, version-check, hỏng thì rơi về default an toàn; near-miss hitbox: hộp sát thương = 80% kích thước thật (-20%), vùng hội vọng = 100→120%, flag once-per-pair bằng bitmask int; Instant Replay: ring buffer Float32Array chụp snapshot mỗi 4 frame giữ 5 giây (pod + 16 predator + trạng thái ring ≈ 40 float/snapshot, pool cố định), khi chết playback 0.5x với tint tím + letterbox điện ảnh, độ trễ từ event chết đến frame replay đầu < 150ms; difficulty director kiểm tra mỗi 500m: 0-2000m dạy ping, 2000-6000m pearl-chain, >6000m predator dày + hành lang siết, spawn budget = 4 + depth/1500; anti-frustration: 3 giây đầu mỗi run không predator.
DoD: PASS toàn bộ A1-A9 → ký nghiệm thu.

=== TECHNICAL BLUEPRINT CHI TIẾT ===
- Bảng màu: nền radial gradient #05070E → #0B1026; pod core #7DF9FF với lõi trắng; vành sonar gradient stroke #00F0FF → #FF3DCB vẽ composite lighter (additive); tường được soi hiện outline #1E2A52 với glow #4C6FFF; pearl #FFD166; Kẻ Nghe #FF3B5C có viền sáng khi tỉnh; vignette nguy hiểm #2B0A1E; replay tint #6E3A8E. Toàn bộ glow = shadowBlur hoặc gradient stroke, không dùng filter mỗi frame.
- Combo system HỒI VỌNG: ăn pearl trong cửa sổ chuỗi 1.4s tăng combo; multiplier = 1 + floor(combo/4), trần x8 (bậc THÁNH ÂM); near-miss +1 combo; ngắt chuỗi khi mất cửa sổ hoặc trúng tường nhẹ; score = Σ(10 × multiplier × (1 + speedFactor)); bait-kill predator +50; leaderboard local top-5 hiển thị ở màn chết.
- 0-GC discipline: mọi vector/hằng preallocated; cấm closure, cấm string concat, cấm array literal trong RAF; state machine bằng enum int + switch; offscreen canvas cho nền plankton vẽ 1 lần, scroll bằng 2 lần drawImage.
- Số học hiệu năng: worst-case 30 predator + 900 particle active phải vẫn ≤ 16.6ms/frame; đo bằng Performance panel, không đo bằng cảm giác.

=== NGHIỆM THU ENTERPRISE (ACCEPTANCE — QC GATE, PHẢI PASS 100%) ===
A1. Standalone 100%: 1 file index.html duy nhất, mở bằng file:// chạy hoàn chỉnh; DevTools Network ghi nhận 0 request ra ngoài.
A2. 60 FPS locked trên Chrome desktop + Chrome Android ở worst-case: không frame nào > 17ms.
A3. 0 GC allocation trong RAF: 3 heap snapshot cách 30s trong gameplay, heap delta < 0.03MB.
A4. Âm thanh phát đúng ở pointerdown đầu tiên, không bị autoplay-policy chặn; tap-switch tab 10 lần không đứt tiếng, không đè tiếng.
A5. Tab switch liên tục: không crash, timer không trôi (dt clamp 250ms hoạt động).
A6. LocalStorage round-trip đúng; xoá storage → game vẫn chạy với default.
A7. Replay chết: đo từ event chết đến frame replay đầu < 150ms.
A8. Toàn bộ gameplay + menu + pause + restart thao tác được bằng đúng 1 ngón tay.
A9. Near-miss: đứng trong vùng hitbox 80-100% không chết nhưng có hiệu ứng hội vọng + cộng combo.
```
