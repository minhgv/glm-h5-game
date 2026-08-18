# Vọng Âm: Kẻ Săn Sóng Đáy Vực

- **Ngày:** 2026-08-18
- **Genre:** Arcade / Casual — Endless Descent kết hợp Echolocation Graze-Rush: 1 ngón tay (tap = phát sóng sonar soi bóng tối, hold-kéo = lượn tránh), ăn điểm bằng cách lướt SÁT tử thần (graze combo)
- **Mô tả:** Bạn là một sinh vật bóng tối lặn xuống vực sâu nơi không gì nhìn thấy được — mọi thứ chỉ hiện hình khi tiếng vọng của bạn chạm vào nó. Mỗi cú ping mở một vòng sáng lộ gai độc, sứa ma và ngọc âm; càng liều lĩnh lướt sát hiểm họa, combo càng cháy bỏng và bản nhạc đáy vực càng dâng cao — ping sai lúc, và bóng tối nuốt bạn.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal
Xây dựng VỌNG ÂM — sản phẩm arcade H5 thương mại của studio, KHÔNG phải demo học sinh: 1 file HTML standalone chạy trực tiếp qua file:// và mọi CDN nhúng game, retention cơ chế graze-combo kiểu rượu mạnh (một-vận-nữa), loop session 4–6 phút/run, sẵn slot thương mại hoá (interstitial sau mỗi 3 run, IAP skin, leaderboard localStorage chờ migrate server). Thanh chất lượng: cảm giác tay 'đắt' như sản phẩm Nitrome/Voodoo, độ polish audio-visual procedural 100%.

=== AUTONOMOUS ITERATION LOOP (agent tự lặp, mỗi vòng PHẢI build → tự test → fix xong mới sang vòng sau) ===

[ITERATION 1 — CORE ENGINE]
- Canvas 1 layer, resize theo viewport, DPR cap 2 (tương đương 1080p HiDPI), backing store = cssSize * dpr, ctx.setTransform(dpr,0,0,dpr,0,0) một lần lúc resize.
- Vòng lặp: rAF(ts) → acc += min((ts-last)/1000, 0.25) → while(acc >= 1/120){ update(1/120); acc -= 1/120 } → render(alpha=acc*120). Fixed-step 120Hz, render nội suy tuyến tính mọi vị trí (prevX/currX).
- State machine: BOOT → MENU → RUN → DYING → REPLAY → GAMEOVER, chuyển bằng bảng handler tĩnh, không closure mới.
- Input 1-thumb: pointerdown/pointermove/pointerup với touch-action:none, {passive:false}. Giữ-kéo: targetX = clamp(x, margin, W-margin). Tap nhanh (<150ms, di chuyển <12px) = PING. Input buffer ghi timestamp để xử lý ở bước fixed kế tiếp (latency ≤1 frame).
-實 physics: player.x += vx*dt; vx += (K*(targetX-x) - C*vx)*dt với K=42 s⁻², C=8 s⁻¹. Descent: vy = 260*(1+depth/2400)^0.6 px/s, cap 640. depth += vy*dt.
- Hazards dùng mảng pool định sẵn, spawn theo cuộn màn; vẽ placeholder rect kiểm tra va chạm vòng (dist < R_core).
- Self-test: 60s auto-play dummy, không crash, RAF стабильного, tab console sạch.

[ITERATION 2 — ENTERPRISE JUICE]
- Particle pool 1024 phần tử pre-allocated (Float32Array các trường x,y,vx,vy,life,maxLife,size,type) — spawn = ghi đè slot chết, KHÔNG tạo object. Bubble ambient 64 hạt trồi lên.
- Screen shake: trauma ∈[0,1], offset = trauma² * 14px * noise, trauma decay 1.6/s; hitstop: timescale=0 90ms khi chết, 45ms micro-freeze khi lên bậc combo 10.
- Ping ring: wavefront r(t)=c*t, c=1000 px/s, intensity I=I0*e^(-t/0.9); hazard sáng lên khi |dist(player→obj... r)|<24px, reveal=1 rồi fade e^(-t/1.4). Glow bằng sprite radial-gradient pre-render 1 lần vào offscreen canvas (TUYỆT ĐỐI không dùng shadowBlur trong render), composite 'lighter'.
- WebAudio procedural 0-asset, toàn bộ graph tạo lúc boot (unlockAudio() trong pointerdown đầu tiên: new/resume AudioContext, latency 'interactive'). Master chain: source → biquad → gain → [dry + delay(0.23s, fb 0.35, lowpass 1800Hz)] → compressor → destination. SFX: PING = sine sweep 880→180Hz/0.35s + exp decay 0.5s + transient square 4ms; reveal hazard f = 200 + 900*clamp(1-d/900) Hz (gai=sawtooth, sứa=triangle vibrato 5Hz, mìn=square); pearl = FM bell (carrier 660, mod ratio 1.5, index 200→0 trong 0.4s); combo tier-up = arpeggio 3 nốt pentatonic Am (A C D E G) từ 330*multiplier Hz; death = noise burst + saw pitch-drop 220→40Hz/0.6s; ambient = drone sine 55Hz + 110Hz detune ±0.7Hz + brown noise lowpass 400Hz gain 0.05 chạy vô hạn.
- Self-test: mở sound check từng event, đo không click/pop, đo RAF không vượt 16.6ms khi 400 particle sống.

[ITERATION 3 — ENTERPRISE HARDENING]
- visibilitychange → nếu hidden: pause loop (cancel rAF), audioCtx.suspend(), ghi timestamp; visible → resume một lần, không chết oan giữa chừng.
- LocalStorage key 'vong-am-v1' (try/catch): bestScore, totalRuns, settings {shake, reducedMotion, sound}; menu hiển thị BEST + prompt 'chỉ còn X điểm để phá kỷ lục'.
- Near-miss chuẩn enterprise: hitbox core = 80% visual (R_visual 14px → R_hit 11.2px), graze zone 18→34px; vào-ra graze zone với dwell ≥80ms = 1 graze-event → combo++, multiplier m = 1+0.1*combo (cap 8x); combo không chạm 3.5s → floor(combo/2). Score = (10 + depthBonus)*m mỗi event; pearl +50*m và hồi ping energy.
- Instant Replay: ring buffer 300 mẫu @120Hz (Float32Array 300*6: player x,y,depth + 3 hazard gần nhất), snapshot vào mảng replay pre-allocated ngay khi va chạm; chờ ≤120ms rồi chiếu 2.5s cuối ở 0.35x slow-mo có viền trắng — TOÀN BỘ pipeline snapshot→start phải <150ms (đo performance.now delta).
- prefers-reduced-motion: tắt shake/flash, giữ nguyên gameplay. Pin/heat: tự hạ particle budget nếu frame time trung bình >15ms trong 60 frame liên tiếp.
- Self-test checklist toàn bộ Acceptance Criteria bên dưới, mỗi mục 1 lần chạy xác minh.

=== TECHNICAL BLUEPRINT ===
- Bảng màu đáy vực (gradient dọc theo depth): nền #05070f (0m) → #07142e (1500m) → #0b1f4b (3000m), vignette rgba(0,0,0,0.45); ping #8bf7ff core / #3ad6e8 trail; gai độc #ff3d7f; sứa ma #b96bff; mìn cổ #ffb020; ngọc âm #ffe08a pulse; player #e8fbff mắt #7ff9ff. Text: system font stack vẽ bằng canvas, fillText với giá trị cache (không tạo string mới trong RAF — format số bằng mảng chữ số tra bảng).
- Ping energy: khởi đầu 2, max 3, regen 0.22/s, mỗi ping tốn 1 → chống spam, ép người chơi đọc nhịp; pearl +1.
- Spawn/difficulty: ngân sách B(d) = 6 + 14*(1-e^(-d/1800)) hazard/màn; <400m chỉ gai tĩnh; 400–1200m thêm sứa drift sin(ωt) biên độ 26px; >1200m thêm mìn hitbox 1.5x; pearl 1/2.2s di chuyển.
- Va chạm: circle-circle ở fixed-step, dùng bình phương khoảng cách (không sqrt), broad-phase lưới cột theo depth.

=== ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu, thiếu 1 mục = fail) ===
1. Standalone 100%: đúng 1 file .html, mở trực tiếp file:// vẫn chạy đầy đủ, không CDN/font/ảnh/audio ngoài — mọi asset procedural hoặc pre-render runtime.
2. 60 FPS locked: DevTools Performance 60s gameplay trên profile mobile mid-range — không frame nào >16.6ms ở steady state (trừ hitstop chủ đích).
3. 0 GC allocation trong RAF: Performance Monitor heap flat 60s; không object/array/string literal, không closure, không concat trong update/render — chỉ ghi đế pre-allocated.
4. 1-thumb chuẩn: pointer events, touch-action none, chặn double-tap zoom + scroll, input→visual ≤1 frame.
5. Near-miss hitbox -20%: test tay vượt gai cách 4px visual → không chết, được cộng combo, có feedback graze.
6. Instant Replay bắt đầu <150ms sau va chạm (đo được bằng code, log ra console lúc dev).
7. Tab pause: switch tab giữa game → audio suspend + freeze; quay lại resume đúng trạng thái, không mất run.
8. Persistence: best score + settings sống sót qua reload (thử chế độ private vẫn không crash khi localStorage throw).
9. Reduced-motion: bật cờ hệ thống → không shake/flash, gameplay nguyên vẹn.
```
