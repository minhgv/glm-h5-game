# Đom Đóm Vườn Sao

- **Ngày:** 2026-08-18
- **Genre:** Arcade/Casual — One-thumb Orbital Graze-Scorer (né chạm × cọ sát hiểm × fever slow-mo)
- **Mô tả:** Một ngón tay là tâm quang đạo: đom đóm bay vòng quanh ngón tay bạn, mảnh bóng tối rơi xuống theo nhịp — đừng né xa, hãy 'sát nút' cọ sát ngay mép hiểm để xếp combo, đầy thanh Hào Quang rồi bùng fever slow-mo đổi toàn bộ bảng màu. Càng gần chết, càng rực sáng.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — Xây dựng "Đom Đóm Vườn Sao": game H5 arcade/causal thương mại chuẩn Enterprise, 1 file index.html standalone 100%, 0 asset/network bên ngoài, 60 FPS locked, 0 GC allocation trong RAF, chơi bằng đúng 1 ngón tay. Định vị: chất lượng studio (juice, hardening, replay), phân biệt tuyệt đối với sản phẩm amateur — không có grid/test-placeholder, mọi pixel và âm thanh đều được thiết kế.

=== 1. TRIẾT LÝ THIẾT KẾ ===
P1 — Graze là gameplay: né an toàn = 0 điểm; cọ mép hiểm (band sat-nút) = điểm + combo + nhiệt. Risk/reward liên tục.
P2 — Một ngón, vô hạn kontrol: ngón giữ = tâm quang đạo (lantern), đom đóm tự bay vòng quanh; tap nhanh = đảo chiều quang đạo + boost. Không nút UI trong gameplay.
P3 — Cảm giác sống: mọi sự kiện đều có âm (synth), rung ánh (shake), nín thở (hitstop), đổi màu (fever).

=== 2. BLUEPRINT KỸ THUẬT ===
[A. Canvas & Render]
- Canvas 2D, CSS full-viewport; canvas.width = cssW·dpr (cap dpr = 2); ctx.setTransform(dpr,0,0,dpr,0,0). Chuẩn hoá không gian thiết kế: scale s = min(w,h)/1080, mọi hằng số dưới đây nhân s (design-px @1080).
- Vòng lặp: accumulator FIXED_DT = 1/120s; render interpolation alpha = acc/FIXED_DT; RAF delta clamp 50ms (tab-switch bảo vệ).
- Nền gradient dọc (cache 1 offscreen canvas, chỉ vẽ lại khi resize): #0B1026 → #162447 → #1A405F + vignette radial rgba(0,0,0,0.45). Sao nền: 140 điểm pre-generated, twinkle bằng sin(t·f+φ) — không random mỗi frame.
[B. Vật lý — công thức cố định]
- Quang đạo: θ(t) = θ + ω·dt; ω = sgn·(2.6 + 1.6·e^(−t_tap/0.45)) rad/s (tap đảo sgn và reset t_tap). Bán kính quang đạo R = 92 design-px.
- Tâm theo ngón tay: lò xo critically-damped: a = k·(p_target − p) − c·v với k = 180 s⁻², c = 2·√k ≈ 26.83 s⁻¹.
- Mảnh bóng tối (shard): rơi thẳng + pattern modifiers, tốc v = (220 + 14·D) px/s, D = floor(t/30); spawn interval T = max(0.32, 1.15·e^(−0.055·D)).
- Pattern director (RNG mulberry32 deterministic, seed ngày = floor(Date.now()/864e5) cho 'Vườn Hằng Ngày'): xen kẽ [mưa-tҥ nhiên, khe tường (gap 2.6·R), cung con lắc, drifter truy đuổi nhẹ (steer 40 px/s², sống 6s)].
- Hitbox: comet = 0.80·visual (near-miss chuẩn enterprise); graze band = hitbox + 26 px; graze khi d ∈ (hitR, grazeR]; mỗi shard chỉ được graze 1 lần (flag).
- Screen shake: trauma model — offset = trauma²·14 px, trauma decay 1.8/s; graze +0.12, milestone +0.3, death +1.
- Hitstop: milestone combo 70 ms, death 130 ms (timeScale = 0, giữ render).
[C. Combo & Điểm — công thức]
- Combo (Chuỗi Sát Nút): +1/graze, window 2.5s (reset nếu hết window); chết hoặc trúng = reset.
- Điểm/graze = 50·(1 + 0.1·min(combo,50))·(fever?2:1). Stardust pickup = 25·multiplier (spawn 1/6 shard).
- Milestone 10/25/50/100: synth stab + trauma 0.3 + pulse viền màn.
- Hào Quang (fever): heat +8/graze, decay 3/s; đạt 100 → fever 6s, timeScale 0.55, hoán đổi bảng màu, multiplier ×2, thoát tự nhiên.
[D. Bảng màu (2 chế độ, hoán đổi trong 250 ms lerp)]
- Thường: comet core #FFF7D6, trail 3-stop #FFD166→#EF476F→#7B2CBF; shard #232946 viền #8B8BAA; UI #E0E1DD.
- Fever: nền #2B0A3D→#6A0DAD, trail #00F5D4→#00BBF9→#F15BB5, shard viền #4CC9F0, heat ring #F15BB5.
[E. WebAudio procedural 0-asset — unlockAudio: resume() + tạo node lazily tại pointerdown đầu tiên]
- Master chain: node → DynamicsCompressor(threshold −18dB, ratio 4) → destination; mọi gain envelope qua setTargetAtTime (không tạo closure).
- Graze: triangle, f0 = 660·2^(min(combo,24)/12) Hz, sweep ×1.5 trong 80 ms, gain 0.18 — pitch tăng theo combo = feedback gây nghiện.
- Tap đảo chiều: square 220→180 Hz, 60 ms, lowpass 800 Hz.
- Stardust: sine arpeggio C5 523.25 → E5 659.25 → G5 783.99 Hz, 45 ms/note.
- Milestone: 2 saw detune ±7 cent tại 110 & 165 Hz, 150 ms.
- Fever enter: saw rise 110→220 Hz, 300 ms + shimmer-LFO 6 Hz trên filter.
- Death: procedural white-noise buffer 180 ms + saw fall 330→55 Hz, 400 ms.
- Ambient: 2 triangle detune (110 & 110.55 Hz) → lowpass 400 Hz, gain 0.05, LFO 0.1 Hz.
[F. Object pooling — 0 GC]
- Pools preallocate: particles 2048 (live cap 1200), shards 256, floating-text 64, replay ring 100 snapshots. Free-list index, tái sử dụng đối tượng; cấm map/filter/forEach/closure/string-concat trong RAF; text điểm chỉ update DOM khi giá trị đổi; temp vector module-scope.

=== 3. VÒNG LẶP TỰ TRỊ (thực hiện tuần tự, mỗi vòng phải pass self-audit trước khi sang vòng sau; nếu fail → sửa rồi audit lại) ===
— ITERATION 1: CORE ENGINE. Deliverables: game loop accumulator 120 Hz + interpolation; HiDPI 1080p canvas + resize handler; input pointer events 1-ngón (touch-action:none, preventDefault, không scroll/zoom); lò xo tâm + quang đạo ω; spawn director 4 pattern; collision hitbox 0.8·visual; death + restart < 1s. Self-audit: chơi 120s không console error; delta clamp hoạt động khi throttle tab.
— ITERATION 2: ENTERPRISE JUICE. Deliverables: graze band +26px + scoring/combo formula; particle pool (trail comet 90/s, spark graze 12 viên, burst chết 180 viên); trauma shake; hitstop; toàn bộ synth table F + unlockAudio; heat/fever + hoán đổi bảng màu lerp 250ms; milestone pulse. Self-audit: mọi sự kiện P1–P3 đều có phản hồi ≥ 2 giác quan (thính + thị); audio không bị click/pop (attack ≥ 5 ms).
— ITERATION 3: ENTERPRISE HARDENING. Deliverables: Visibility API → pause khi hidden (audio.suspend), resume đếm 3-2-1; LocalStorage an toàn try/catch {best, totalGraze, sfx, reducedMotion, seed}; Instant Replay: ring buffer snapshot 20 Hz × 5s {cx,cy,θ,shard-ids,x,y}, sau death hiển thị < 150 ms, playback 0.5× với marker 'SAT NÚT!' tại các graze; debug overlay (nhập 'debug') vẽ hitbox/graze-band/FPS/heap. Self-audit: đo performance.now() cho latency replay < 150 ms; kill app giữa chừng → mở lại giữ best.

=== 4. NGHIỆM THU ENTERPRISE (checklist bắt buộc 10/10) ===
1) 1 file index.html standalone, chạy từ file://, Network tab = 0 request ngoài, không font/ảnh/icon ngoài.
2) 60 FPS ổn định trên Chrome Android mid-range; jank frame < 1% mỗi 10s (Performance panel).
3) Allocation instrumentation: 0 allocation trong 10s gameplay liên tục.
4) Chơi đúng 1 pointer; không có UI blocking; 44px+ vùng cảm ứng ngầm (toàn màn hình).
5) Tab switch ≥ 3s → pause + audio suspend; resume có countdown; không time-jump.
6) LocalStorage persist + load an toàn (JSON parse fail → default).
7) Hitbox = 0.80·visual + graze band +26px, verify bằng debug overlay.
8) Replay sau chết render < 150 ms (log đo).
9) 'use strict', ESLint 0 error, console sạch.
10) Fever/combo/milestone đúng công thức mục C; RNG deterministic theo seed ngày.

=== 5. RÀNG BUỘC PHẠM VI ===
Không thêm: mạng/leaderboard online, mode nhiều ngón, sprite ảnh, thư viện ngoài, WebGL, i18n. Chỉ mở rộng sau khi 10/10 checklist pass.
```
