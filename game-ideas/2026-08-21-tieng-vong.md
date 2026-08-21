# Tiếng Vọng: Vực Sâu

- **Ngày:** 2026-08-21
- **Genre:** Arcade Survival 1-thumb — Sonar-Reveal & Dodge. Ping để soi sáng thế giới tối tuyệt đối, nhưng mỗi tiếng vọng đánh thức những kẻ săn mồi nghe ngóng; né, graze và hạ sâu càng xa càng tốt.
- **Mô tả:** Bạn là một hạt sáng rơi vào vực sâu không đáy nơi không gì nhìn thấy được cho tới khi sóng âm của bạn chạm vào nó — ping để nhìn thấy, nhưng ping cũng dẫn rắn săn mồi đến bạn. Vòng lặp gây nghiện: cám dỗ ping vì điểm số vs nỗi sợ bị nghe thấy, cảm giác chơi nhịp nhàng như thở.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — STANDING GOAL (Enterprise Arcade Standard)
Xây dựng TIẾNG VỌNG: VỰC SÂU — game H5 arcade survival 1-thumb, 1 file HTML standalone, sẵn sàng thương mại hoá lên web portal (Poki / CrazyGames / YouTube Playables / Google Play Instant). Mục tiêu: vòng lặp lõi ping-để-soi + né-để-sống tạo độ gây nghiện kiểu one-more-run; game feel đạt chuẩn studio (juice, audio phản ứng, hitstop, shake); hiệu năng 60FPS locked, 0 asset ngoài, 0 phân bổ GC trong RAF. Phân biệt tuyệt đối với sản phẩm amateur: mọi tương tác đều có phản hồi аудo-hình ảnh trong ≤1 frame, meta-loop nhẹ (kỷ lục, mốc độ sâu, streak), hoàn thiện kỹ thuật (tab pause, replay, offline-first). KHÔNG dùng ảnh/font/sound ngoài — 100% procedural.

CORE GAME (định nghĩa lõi)
- Người chơi là Hạt Sáng rơi tự do xuống vực dọc (portrait). Bất cứ thứ gì ngoài bán kính 140px quanh Hạt Săng là BÓNG TỐI — chỉ hiển thị khi sóng âm đi qua, sau đó mờ dần 1.6s.
- TAP = phát ping (ring sóng âm lan toả), DRAG = lái ngang bằng lò xo critically-damped. Ping làm lộ hazard + đẩy nhẹ hazard ra xa, NHƯNG kẻ Thính Giác (listener) sẽ bơi về đúng toạ độ bạn vừa ping → rủi ro/phần thưởng lồng nhau.
- Thu Mắt Sáng (motes) để hồi Oxy Ping (ping tốn tài nguyên, ping spam = chết đói), graze sát nút hazard để ăn điểm nhân combo.

AUTONOMOUS ITERATION LOOP (agent tự lặp, mỗi vòng phải đạt DoD trước khi sang vòng sau; nếu fail → sửa rồi chạy lại verify, tối đa 5 lần/vòng)
[ITERATION 1 — CORE ENGINE] Xây canvas 1080×1920 logical, HiDPI: render buffer = cssSize × min(devicePixelRatio,2), letterbox scale-to-fit, ctx.setTransform(dpr·s,0,0,dpr·s,ox,oy). Fixed-step physics: accumulator, dt = 1/120s, clamp frameDelta ≤ 250ms, semi-implicit Euler (v += a·dt; x += v·dt), render interpolation alpha = acc/dt. Input 1-thumb: pointerdown = ping tại vị trí ngón, pointermove = targetX, spring ngang: a = ω²(xt−x) − 2ωv với ω = 14 rad/s; rơi: vy = 220 + depth·0.035 (cap 560 px/s). Spawn hazard theo depth-band, camera follow y. DoD: chạy được vòng chơi chết→restart, chạm 1 ngón, không jitter khi 60/120Hz.
[ITERATION 2 — ENTERPRISE JUICE] Particle pool 512 pre-allocated (typed arrays x,y,vx,vy,life,size,colorIdx — cấm new trong loop). Screen shake theo trauma model: offset = trauma² · 26px · (noise), trauma decay 1.6/s. Hitstop 90ms khi trúng, 40ms khi graze hoàn hảo (timeScale = 0 trong N frame, chính xác ±5ms). WebAudio procedural 0-asset: unlockAudio() trên pointerdown đầu tiên (resume AudioContext), master chain = Gain −6dB → DynamicsCompressor. Ping = sine sweep 220→880Hz 0.25s + noise bandpass Q=8; motes theo ngũ cung thứ nhỏ C4 261.63 / D#4 311.13 / F4 349.23 / G4 392.00 / A#4 466.16 — nốt tăng theo bậc combo; death = sawtooth 110Hz + WaveShaper distortion 0.35s; ambience = 2 detuned sine 55/55.5Hz gain 0.05. DoD: mọi sự kiện game đều có âm + hiệu ứng, audio chỉ phát sau unlock, không click/pop.
[ITERATION 3 — ENTERPRISE HARDENING] Visibility API: tab blur → pause toàn bộ + audio.suspend(), focus → resume với 500ms grace. LocalStorage schema key tiengvong.v1 = {best, depthMax, milestones[], mute, quality}, try/catch mọi truy cập. Near-miss: hitbox chết giảm 20% so với sprite, graze zone = hitbox gốc + 26px, rời zone an toàn → +graze. Instant Replay: ring buffer 300 frame × 20Hz (pod + hazards + pings), khi chết phát lại 1.2s ngay trong <150ms (không decode, không render lại asset — chỉ replay trạng thái đã có). DoD: rotate tab giữa game không mất trạng thái, replay mượt, graze cảm giác đã.

ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu bắt buộc)
1. Standalone 100%: 1 file .html mở bằng file:// chạy đủ — 0 asset ngoài, 0 network request (verify: DevTools Network = 0 request sau load).
2. 60 FPS locked @ 1080p HiDPI: frame budget 16.67ms, render ≤ 6ms, physics ≤ 2ms; không drop dưới 55fps trong 5 phút stress test (spawn dày + 512 particle bùng nổ).
3. 0 GC allocation trong RAF: đo bằng PerformanceObserver longtask + 2 heap snapshot trước/sau 60s gameplay → delta object count = 0; cấm literal object/array/string concat trong update/render path.
4. Input→feedback ≤ 1 frame; hitstop ±5ms; TTI < 1s.

TECHNICAL BLUEPRINT (chi tiết GLM tự định nghĩa — tuân theo)
- BẢNG MÀU: nền radial #05070E→#0B1220, vignette rgba(0,0,0,0.55); Hạt Sáng #7DF9E9 với glow shadowBlur 32; ping ring #9FE8FF alpha 0.9→0; Mắt Sáng #FFD166; hazard tĩnh #FF5D73; Thính Giác #B388FF; graze flash #FFF3B0; UI #E8F1FF; gradient combo bar aqua→violet theo multiplier.
- VẬT LÝ: ping ring r(t) = 40 + 900·t (px/s), knockback hazard 240 px/s hướng pháp tuyến trong 90ms; listener homing speed 180 + depth·0.06 (cap 320), quay đầu tối đa 2.2 rad/s; vy camera lerp 0.08.
- COMBO: mỗi hazard được ping-reveal lần đầu +1 insight; multiplier = 1 + floor(insight/5), cap ×8; decay 4s không reveal → reset; graze +0.5 insight; điểm = depth·1 + mote·25·(1+0.25·mult) + graze·40·(1+0.25·mult).
- SPAWN: mật độ hazard = 0.8 + depth·0.0018 (đơn vị/spawn-tick 0.5s); listener xuất hiện từ depth 800m, xác suất 0.12 + depth·0.0001; motes cụm 3–5, hồi Oxy Ping 18/ mắt (ping tốn 25, hồi 6/s tự nhiên).
- UI: HUD tối giản 2 góc, hướng dẫn 3 giây lần đầu (tap = ping, giữ-kéo = lái), màn chết hiển thị replay + best + nút retry ngay giữa màn hình.
Xuất đúng 1 file: tieng-vong.html. Bắt đầu Iteration 1 ngay, tự verify theo DoD, không dừng lại để hỏi.
```
