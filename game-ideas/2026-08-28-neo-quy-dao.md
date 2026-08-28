# Neo Quỹ Đạo — Orbital Tether

- **Ngày:** 2026-08-28
- **Genre:** Arcade One-Thumb / Orbital-Tether Survival + Graze-Scoring (bullet-dance, score-chaser, deterministic physics)
- **Mô tả:** Một ngón tay, một sợi neo: GIỮ để neo vào pivot và quay quanh theo quán tính, BUÔNG để văng ra theo tiếp tuyến — dệt chuỗi quỹ đạo để lướt SÁT mìn mà không chạm, càng liều càng ghi điểm. Cảm giác chơi: swing-flow adrenaline kiểu grappling-hook mixing với graze-rush của bullet-hell, mỗi lần thoát chết trong từng pixel là một cú rung adrenalin.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
ROLE: Studio Game Director kiêm Senior Game Engineer. Nhiệm vụ: ship game H5 arcade thương mại 'NEO QUỸ ĐẠO'.

/goal
Xây dựng và nghiệm thu tựa arcade one-thumb 'NEO QUỸ ĐẠO' (orbital-tether survival, graze-scoring) đạt chuẩn Enterprise Arcade Studio: 1 file index.html duy nhất, zero-dependency, zero-asset ngoài, chạy offline qua file://, 60 FPS locked, zero garbage-collection trong RAF, sẵn sàng pass QA các web-portal thương mại (CrazyGames/Poki-class). Ranh giới chất lượng: deterministic engine, full juice pipeline, instant replay, performance budget đo được — tuyệt đối không chấp nhận mức prototype học sinh/sinh viên.

VÒNG LẶP TỰ TRỊ (AUTONOMOUS ITERATION LOOP)
Làm việc tuần tự 3 iteration. Mỗi iteration: BUILD → SELF-VERIFY → GATE. GATE fail ⇒ fix và verify lại (tối đa 5 vòng fix), KHÔNG được sang iteration sau khi chưa pass. Ghi lại kết quả verify ngắn gọn trước khi chuyển.

ITERATION 1 — CORE ENGINE
Xây: (1) Game shell: canvas 2D, logical 1920x1080, aspect-fit letterbox, DPR cap 2.0 (HiDPI 1080p); (2) Fixed-step physics: accumulator, SIM_HZ = 120, dt = 1/120, clamp frame-delta 250ms, chống spiral-of-death; (3) Input 1-thumb: pointer events duy nhất, touch-action:none, press = thả neo vào pivot gần nhất trong bán kính 260px, release = buông văng tiếp tuyến; (4) Vật lý: free-flight Newton 0-ma-sát, tether-orbit bằng constraint góc (công thức Blueprint C); (5) Arena tròn biên lò xo, hazard spawn theo hàm độ khó, collision circle-circle; (6) milestone chơi được 60s: sống-sót + điểm graze thô + F5 restart.
VERIFY-1: mở bằng file://, console 0 error; auto-bot 10 phút không crash, không thoát arena; input latency press-to-orbit ≤ 1 frame; deterministic: cùng seed + cùng input script ⇒ cùng score (PRNG mulberry32).
GATE-1: core loop mượt, vật lý orbit/release chính xác về tiếp tuyến, không lỗi biên.

ITERATION 2 — ENTERPRISE JUICE
Xây: (1) Particle pool 2048 slot Float32Array + free-list stack, cấm keyword new trong RAF; (2) Screen shake model trauma: offset = trauma^2 * noise (bảng PRNG precompute), xoay ≤ 2.5 độ, decay 1.6/s; (3) Hitstop: elite-smash 90ms, death 220ms; (4) Procedural WebAudio 0-asset: unlockAudio() tại pointerdown đầu tiên (resume AudioContext + listener statechange), master chain DynamicsCompressor → gain 0.9, SFX tổng hợp runtime theo Blueprint D, nhạc generative 96 BPM qua lookahead scheduler chạy trên setInterval 25ms (ngoài RAF); (5) Graze feedback: vòng amber + súng zing pitch theo khoảng cách + trauma 0.35.
VERIFY-2: unlock audio đúng trên iOS Safari + Android Chrome (autoplay policy); Performance panel: 60 FPS, Allocation instrumentation = 0 allocation steady-state sau 2 phút.
GATE-2: mọi action đều có sound + shake + particle; feel đạt bar arcade thương mại, không stutter.

ITERATION 3 — ENTERPRISE HARDENING
Xây: (1) Visibility API: tab ẩn ⇒ pause loop + AudioContext.suspend(); quay lại ⇒ reset accumulator + fade-in nhạc 400ms; (2) LocalStorage key neoquydao.save.v1 (best score, best combo, runs, mute), bọc try/catch cho private-mode; (3) Near-miss design chuẩn enterprise: hitbox gây chết = 80% visual (r_lethal = 0.8 * r_visual, forgiveness -20%), graze ring = 1.9 * r_visual; (4) Instant Replay: ring buffer 240 snapshot (2s @ 120Hz) chỉ chứa minimal state (player x/y/theta, hazard x/y, event flags); khi chết render lại 1.2s cuối ở tốc độ 0.5x + thanh letterbox + nhãn REPLAY; độ trễ từ death-event đến frame replay đầu < 150ms (đo performance.now()); (5) UI hoàn chỉnh: title screen, HUD score/combo/multiplier dùng digit-atlas cache (0 string-concat trong RAF), game-over hiện best + rank D→SS.
VERIFY-3: kill-tab/restore 20 lần không mất state; replay latency đo được < 150ms; regression toàn bộ 3 iteration.
GATE-3 =-chỉ được coi là ĐẠT khi pass trọn ACCEPTANCE CRITERIA bên dưới.

ACCEPTANCE CRITERIA — ENTERPRISE (thiếu 1 mục = FAIL)
A1. Standalone 100%: 1 file index.html mở bằng file://, DevTools Network = 0 request ngoài.
A2. 0 asset ngoài: không ảnh/font/lib; mọi visual vẽ canvas, mọi âm thanh là synthesizer.
A3. 60 FPS locked: mid-range Android Chrome 2020+, frame time p95 ≤ 16.6ms ở 1080p HiDPI (DPR 2).
A4. 0 GC allocation trong RAF steady-state: mọi object pool/typed-array, HUD qua digit atlas, Music scheduler ngoài RAF.
A5. Deterministic + Instant Replay < 150ms; cùng seed + input ⇒ cùng kết quả.
A6. 1-thumb thuần: press/release là toàn bộ điều khiển trong gameplay, không UI blocking.
A7. 0 console error/warning trên Chrome + Safari + Firefox bản mới.

TECHNICAL BLUEPRINT
A. RENDER: logical 1920x1080; setTransform(dpr*scale,0,0,dpr*scale,0,0); trail bằng offscreen canvas fade (fillRect globalAlpha 0.86 mỗi frame, không tạo object); glow giới hạn shadowBlur ≤ 6 entity/frame, phần còn lại dùng radial-gradient sprite pre-render 1 lần vào offscreen canvas.
B. PALETTE (gradient lạnh-ấm đối lập): nền radial #05060F → #0B0E23 → #171238; player core #E8FBFF + glow #37F5FF; tether #7CFFD4; mìn coral #FF3D6E; elite gold #FFC53D; graze ring #FFE066; UI text #9FB3C8; khi multiplier ≥ 4 chuyển accent #FF6EC7.
C. PHYSICS: C1 free-flight x += v*dt, |v| bảo toàn; arena R = 980, biên lò xo a = -k*(|x|-(R-40))*x̂ với k = 42 khi vượt mép. C2 tether: r = |x-P| lúc attach; ω = tích chéo 2D (v × r̂)/r quyết định dấu; mỗi bước θ += ω*dt, x = P + r*(cosθ, sinθ), v = ω*r*(-sinθ, cosθ). C3 momentum: mỗi vòng 360° |v| += 6 px/s (cap 520); release > 420 px/s ⇒ trạng thái SMASH 0.6s phá được elite. C4 difficulty: spawn interval λ(t) = max(0.28, 1.6*e^(-t/45)) giây; tốc hazard = 60 + 3.2*sqrt(t) px/s; elite từ t = 40s với xác suất 12%. C5 collision: r_lethal = 0.8*r_visual (-20% near-miss forgiveness), graze ring = 1.9*r_visual.
D. WEBAUDIO SYNTH (0-asset): attach = triangle 220→440Hz glide 60ms qua lowpass 900Hz; orbit hum = sine 110Hz + LFO 5Hz depth 3Hz, gain theo trạng thái tether; release = noise buffer (sinh 1 lần, 0.5s) qua bandpass sweep 300→2400Hz trong 180ms; graze zing = sine f = 880 + 1320*(1 - d/grazeR), 40ms, StereoPanner theo x tương đối; smash = saw 200→60Hz + noise burst; death = saw 300→40Hz trong 700ms + noise lowpass 400Hz; nhạc generative 96 BPM: bass pentatonic A1-C2-D2-E2-G2 pattern 8 bước seeded, kick = sine pitch-drop 150→40Hz mỗi phách, hat = highpass noise 16th xác suất 30%, scheduler lookahead 120ms.
E. COMBO & SCORE: graze +1 combo, điểm = 50*mult; mult = 1 + floor(combo/8) cap 12; decay: sau 3.5s không graze, mỗi 1s mất 25% combo (làm tròn xuống); vòng quay đủ = +150*mult; smash elite = +500*mult + trauma 0.6; rank: D<2k, C<8k, B<20k, A<50k, S<120k, SS≥120k.
F. JUICE SPECS: particle graze 6 hạt, orbit-complete 24 hạt vòng tròn, smash 90 hạt, death 220 hạt + flash trắng 60ms; trauma graze 0.35 / smash 0.6 / death 1.0; death: hitstop 220ms → slow-mo 0.25x trong 900ms → replay → game-over.
G. CODE STRUCTURE: IIFE strict mode, namespace const: Engine/Input/PRNG/Pool/Audio/Replay/HUD/Save; toàn bộ state trong 1 GameState tái sử dụng, reset không cấp phát mới.
```
