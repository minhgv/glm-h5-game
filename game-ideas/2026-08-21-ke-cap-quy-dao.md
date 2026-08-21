# Neon Tether: Kẻ Cắp Quỹ Đạo

- **Ngày:** 2026-08-21
- **Genre:** Arcade/Casual — One-Thumb Orbital-Swing Vertical Runner (vật lý bám-mọc quay + graze near-miss scoring + cổng khớp chiều quay)
- **Mô tả:** Giữ một ngón tay để móc vào neo và quay quanh nó, thả tay để bị hất vọt theo tiếp tuyến leo lên vô hạn; cà sát chướng ngại để ăn graze, xuyên cổng đúng chiều quay đang sở hữu để combo bùng nổ. Cảm giác chơi: đu đưa weightless rồi nổ tung tốc độ trong 0.2 giây.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
=====================================================================
MASTER PROMPT — NEON TETHER: KẺ CẮP QUỸ ĐẠO (H5 Arcade, 1 file, 0 asset)
=====================================================================

VAI TRÒ: Bạn là Senior Game Engineer kiêm Technical Director của một Enterprise Arcade Studio. Bạn tự raftoán, tự quyết định chi tiết, tự nghiệm thu. Không hỏi lại, không descopre, không để lại TODO.

---------------------------------------------------------------------
1) /goal — STANDING GOAL (mục tiêu đứng, không bao giờ hạ chuẩn)
---------------------------------------------------------------------
- Sản phẩm H5 arcade THƯƠNG MẠI HOÁ ĐƯỢC: TTV (time-to-value) < 3s từ load tới frame chơi đầu tiên; độ dài session mục tiêu 45–120s; vòng retry < 300ms.
- Phân biệt tuyệt đối với game amateur bằng 4 trụ cột kỹ thuật: (a) physics fixed-step tất định (deterministic), (b) render loop 0-allocation GC, (c) audio procedural 0-asset tổng hợp realtime, (d) telemetry/retention hooks (daily seed, coins, death-heatmap DDA) — scaffold sẵn hook quảng cáo reward 'Second Wind' và cosmetic tether skins (API stub, không gọi mạng).
- Core fantasy: 'CẮP TRỘM QUỸ ĐẠO' — người chơi mọc vận tốc góc của thế giới, giữ nó càng lâu, hất càng xa, graze càng hiểm thì điểm càng nổ.

---------------------------------------------------------------------
2) VÒNG LẶP TỰ TRỊ — AUTONOMOUS ITERATION LOOP (xuất sequential, mỗi vòng PHẢI đạt DoD trước khi sang vòng sau)
---------------------------------------------------------------------

[ITERATION 1 — CORE ENGINE: xây sự thật gameplay trước, chưa cần đẹp]
- Canvas: logical 1080x1920 (9:16 portrait), backing store = 1080*dpr x 1920*dpr với dpr = min(devicePixelRatio, 2.5); CSS letterbox scale giữ aspect; xử lý resize + orientation change không vỡ layout.
- Game loop: rAF bọc accumulator; physics fixed-step dt = 1/120s; clamp frameDelta = 0.25s (chống spiral-of-death); render interpolation theo alpha = acc/dt. Không dùng setTimeout cho logic game.
- Input 1-thumb: Pointer Events hợp nhất (pointerdown = MỐC, pointerup = THẢ), Space làm fallback chuột/phím; touch-action:none, preventDefault chống scroll/zoom/context-menu.
- State machine: MENU -> PLAYING -> DYING (hitstop) -> REPLAY -> SCORE -> PLAYING. Tap-to-retry trong mọi trạng thái chết, đạt retry < 300ms.
- Entity tối thiểu: player (điểm + trail), anchors (spawn leo lên bằng PRNG tất định mulberry32), hazards (mìn tròn + thanh quay), camera (chỉ khóa max-height, exponential smooth 1 - e^(-6*dt)).
- DoD: chơi trọn 3 phút vòng lặp đầy đủ (mọc -> quay -> thả -> chết -> retry); Performance trace không frame nào > 17ms; chạy 2 lần cùng seed, hash trạng thái physics mỗi 120 bước PHẢI trùng khớp tuyệt đối (self-verify: log state-hash).

[ITERATION 2 — ENTERPRISE JUICE: phản hồi từng frame có trọng lượng studio]
- Particle pooling: ring buffer 2048 particle pre-allocate (field: x,y,vx,vy,life,maxLife,size,hueIdx,type) — spawn = ghi đè slot qua con trỏ vòng, TUYỆT ĐỐI không tạo object trong loop.
- Screen shake hệ trauma: trauma thuộc [0,1], offset = trauma^2 * 14px * noise; decay 1.8/s; event cộng trauma: graze +0.12, perfect gate +0.3, death +1.0.
- Hitstop: bộ đếm freeze trong step-loop (bỏ qua physics N ms nhưng vẫn render): perfect gate 60ms, death 120ms.
- Procedural WebAudio 0-asset: AudioContext tạo lazy, unlockAudio() trên gesture đầu tiên (pointerdown/keydown) + resume() nếu suspended; graph: masterGain(0.8) -> DynamicsCompressor -> destination; noise buffer 1s tự sinh 1 lần lúc init. Đặc tả synth ở Blueprint mục 3c.
- Trail ribbon 24 điểm vẽ poly mờ dần; glow theo tier shadowBlur (perf governor kiểm soát).
- DoD: mọi event gameplay có phản hồi âm + hình cách nhau <= 1 frame; heap snapshot trước/sau 60s gameplay: 0 object mới trong hot path; không clipping âm (compressor bật).

[ITERATION 3 — ENTERPRISE HARDENING: sống sót ngoài thế giới thực]
- Visibility API: visibilitychange -> pause < 50ms (đóng băng accumulator, audioCtx.suspend()); quay lại: countdown 3-2-1 (render bằng stepped timer trong loop, không setTimeout); fallback window.blur.
- LocalStorage (namespace 'ntd.', bọc try/catch + version key + migration): best, coins, runs, deathHeatmap (mảng 12 bucket độ cao), settings {sfx, haptics, quality}. DDA nhân từ: chết 3 lần cùng bucket -> spawn gap +10% (mercy) cho run sau.
- Near-miss dual hitbox: hitbox chết = 80% bán kính thị giác (-20%); graze band = [80%, 125%] bán kính; vào band -> graze event (điểm + combo + spark + tick âm); debug overlay (phím D hoặc 3-ngón tap) vẽ hitbox để nghiệm thu 20 case lấy mẫu.
- Instant Replay < 150ms: ring buffer ghi trạng thái player (x,y,theta,omega,R,anchorId,alive) mỗi fixed-step, giữ 300 mẫu (2.5s @ 120Hz); khi chết: hitstop 120ms rồi replay 0.4x tốc độ kèm letterbox + tint film, khoảng từ input chết tới frame replay đầu TIỆN NGHI ≤ 150ms (đo performance.now()); xong hiện panel: Score / Best / Max Combo / Graze / Coins, tap retry.
- Performance governor: rolling avg frame-time > 17.5ms suốt 60 frame -> hạ 1 nấc dpr, hạ tier shadowBlur, ghi vào settings. Soak test 30 phút: heap tăng ≤ 5%.
- DoD: checklist nghiệm thu mục 4 đạt 100%; dọn dead code; comment tiếng Việt cho bàn giao.

---------------------------------------------------------------------
3) TECHNICAL BLUEPRINT (agent được toàn quyền định nghĩa — đây là spec chuẩn)
---------------------------------------------------------------------
3a. BẢNG MÀU & GRADIENT:
- Sky base (vertical gradient 3 stop): #04050D -> #0A1030 -> #1A0B33.
- Biome tint lerp theo độ cao mỗi 4000m: biome1 cyan #00E5FF, biome2 magenta #FF2E88, biome3 amber #FFB300, biome4 UV #7A5CFF; tint áp lên haze nền, anchor ring, tether.
- Player: lõi trắng #FFFFFF + glow biome hiện tại (shadowBlur 24); tether: line gradient cyan->magenta, wobble sin 3 tap theo thời gian; UI score: 64px bold, glow màu combo tier; nền grid perspective mờ 6% alpha cuộn theo camera (parallax 0.4x).

3b. CÔNG THỨC VẬT LÝ (đơn vị pixel logic 1080p, dt = 1/120):
- Free-fall: v += g*dt, g = 1800 px/s^2; clamp tốc độ 2600 px/s.
- Mọc (attach): chọn anchor gần nhất trong cone 75 độ phía trước, dist <= 720px; R = clamp(khoảng cách hiện tại, 180, 320).
- Vận tốc góc khi mọc: omega = (rx*vy - ry*vx) / R^2, với r = playerPos - anchorPos. Khi quay: theta += omega*dt (giữ nguyên omega, cộng thêm pump +8%/s để 'ngon tay'); pos = anchor + R*(cos(theta), sin(theta)).
- Thả (release): vận tốc tiếp tuyến v = omega * (-ry, rx) — bảo toàn chiều quay, đây là nguồn cảm giác 'hất'.
- Chết: core hitbox (80% visual) chạm hazard, hoặc rơi khỏi đáy camera.
3c. PRODEDURAL SYNTH (0 asset, tần số cụ thể):
- Note ladder (graze/perfect): thang pentatonic minor A; semitone s = min(24, floor(combo/2)); f = 220 * 2^(s/12); osc triangle + sine con la 2.01x, ADSR: attack 5ms, decay exp 220ms.
- Attach: sub thump sine 90Hz pitch-drop về 55Hz trong 90ms.
- Release: noise bandpass sweep 300->2400Hz, 140ms.
- Perfect gate: FM ping — carrier 880Hz, modulator ratio 3.01, index decay, envelope 180ms.
- Tether hum (đang mọc): 2 saw detuned 55Hz & 55.8Hz -> lowpass 300Hz (LFO 6Hz), gain 0.05.
- Death: noise burst lowpass sweep 3800->90Hz exp trong 450ms, gain 0.5->0.
- Overdrive (combo >= 24): beat 128 BPM — kick sine 150->45Hz (120ms) xen kẽ hat noise highpass 8kHz (30ms) mỗi nốt 8; nền pulse sync theo beat.
- Haptics: navigator.vibrate(10) cho graze, (30) perfect, ([60,40,60]) death (nếu settings bật).
3d. COMBO & SCORE:
- Graze +1 combo (+25*m điểm); perfect gate (xuyên cổng với dấu omega cùng chiều quay hiện tại) +2 combo (+100*m); anchor chain (mọc anchor mới trong 1.5s sau khi thả) +50*m.
- Multiplier m = 1 + floor(combo/8); combo decay về 0 sau 4s không event; combo >= 24 = OVERDRIVE: mọi điểm x2, beat bật, nền pulse.
3e. ĐỘ KHÓ (hàm theo độ cao alt):
- Anchor gap G = 420 - 160*min(1, alt/12000); xác suất cổng spin-match 0.35 + 0.55*min(1, alt/9000); anchor di động (bob sine amp 60-140px, freq 0.4-0.9Hz) xuất hiện sau alt > 6000; mật độ hazard tăng tuyến tính theo bucket heatmap.
- Daily Challenge: seed = mulberry32(YYYYMMDD) — cùng seed, cùng layout, sẵn sàng cho leaderboard (kèm score signature hash).

---------------------------------------------------------------------
4) ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu 100% mới được declare done)
---------------------------------------------------------------------
[ ] 1. Standalone: 1 file index.html duy nhất, mở từ file:// offline, DevTools Network = 0 request, không CDN, không fetch/XHR.
[ ] 2. 0 asset ngoài: không file ảnh/âm/font — 100% vector canvas + WebAudio synth runtime.
[ ] 3. 60 FPS locked: trace 60s gameplay, >= 99% frame < 16.9ms trên thiết bị mid-range; governor tự hạ tier nếu tụt.
[ ] 4. 0 GC allocation trong RAF: allocation instrumentation thấy 0 kB/s steady-state; không tạo object/array/closure/string trong update+render; UI text chỉ rebuild khi giá trị đổi (cache chuỗi).
[ ] 5. Tab switch 10 lần liên tiếp: pause < 50ms, audio suspend, resume có countdown; accumulator clamp không nhảy thời gian.
[ ] 6. Persistence: kill tab giữa chừng -> best/coins/settings/heatmap sống sót; mọi JSON.parse có guard.
[ ] 7. Near-miss: hitbox chết = 80% visual, graze band = [80%,125%]; xác minh bằng debug overlay 20 case.
[ ] 8. Instant Replay: từ input chết tới frame replay dau tiên <= 150ms (performance.now()).
[ ] 9. Chơi trọn vẹn bằng 1 ngón tay; có fallback chuột + Space; chặn scroll/zoom/menu.
[ ] 10. Tất định: 2 run cùng seed -> state-hash trùng 100% (log mỗi 120 bước).

---------------------------------------------------------------------
5) LUẬT TỰ TRỊ CỦA AGENT
---------------------------------------------------------------------
- Sau MỖI iteration: chạy nghi thức verify (trace perf, heap snapshot, checklist mục 4 phần liên quan) -> lỗi nào sửa nấy XONG mới được sang vòng sau.
- CẤM: TODO/placeholder, setTimeout cho game logic, tạo object trong hot loop, hardcode magic number không hằng số đặt tên, để code chết.
- Nếu vướng trade-off: ưu tiên thứ tự DoD từng vòng > độ ngon mắt > tính năng phụ. Feature nào không nằm spec này = KHÔNG làm.
```
