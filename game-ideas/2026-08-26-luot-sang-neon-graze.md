# LƯỚT SÁNG — Neon Graze Rush

- **Ngày:** 2026-08-26
- **Genre:** Arcade One-Thumb Graze-Runner (Bullet-Time Hell): auto-scroll ngang, điều khiển 1 ngón tay, dodging kiểu lướt-sát-đạn (graze) để nạp năng lượng bullet-time
- **Mô tả:** Người chơi KHÔNG được né xa — phải lướt sát hiểm họa để nạp bullet-time: càng liều lĩnh, thời gian càng chậm, càng sống lâu, combo càng nổ. Một chạm là chết, restart dưới 300ms, vòng lặp dopamine hoàn hảo của risk-reward nghịch đảo.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal XÂY DỰNG GAME H5 ARCADE THƯƠNG MẠI 'LƯỚT SÁNG — Neon Graze Rush': graze-bullet one-thumb thuần túy, single-file index.html standalone 100%, 0 asset ngoài, 60 FPS locked @1080p HiDPI, zero-GC trong RAF, chuẩn QA web-portal (CrazyGames/Poki): không soft-lock, không audio pop, restart <300ms, ship được license ngay.

CORE HOOK (bất biến): thế giới tấn công bằng đạn/laser; NGÓN TAY GIỮ = bullet-time 0.25× (drain meter), KÉO DỌC = điều khiển Y con tàu. Meter CHỈ nạp lại bằng GRAZE — đi vào vòng graze (1.9× hitbox) mà không chạm lõi đạn. Meter cạn = thời gian snap về 1.0× = chết gần như chắc chắn. Combo +1 mỗi graze, decay 2.5s không graze → ép người chơi chơi hung hãn.

=== VÒNG LẶP TỰ TRỊ (AUTONOMOUS ITERATION LOOP) ===
Agent TỰ lặp 3 iteration, mỗi iteration: build → tự QA checklist → chỉ sang bước kế khi pass 100%. Nếu fail: rollback fix rồi lặp lại bước đó (tối đa 3 vòng/bước, sau đó giảm scope tekních, KHÔNG giảm scope验收).

ITERATION 1 — CORE ENGINE (nền móng vật lý):
- Canvas 1920×1080 target, scale theo devicePixelRatio, letterbox-safe, ResizeObserver + orientation change handling.
- Fixed-step physics accumulator: dt = 1/120s, max 5 substeps (spiral-of-death guard), render interpolation alpha cho mọi entity (x = prev + (curr−prev)·alpha).
- Input 1-thumb: pointerdown/move đặt targetY normalized 0–1; đang giữ = bullet-time target 0.25; thả = 1.0. timeScale smoothing: ts += (target−ts)·(1−e^(−12·dtReal)). Fallback desktop: chuột + phím Space.
- Player spring dọc: ay = (targetY−y)·k − vy·c với k=90 s⁻², c=14 s⁻¹ (gần critical damping); world scroll 420 px/s scale theo difficulty.
- Collision: circle-vs-AABB & circle-vs-circle cho 3 loại hazards (helix gate, laser fence, homing dart); graze ring = hitbox×1.9, cooldown graze 250ms/đối tượng (flag trên object, không alloc).
- Object pools preallocate: obstacles 128, bullets 256, particles 1024 — free-list arrays, tái sử dụng trường, STRICT cấm new/array-literal/string-concat trong RAF.
- Greybox art chấp nhận ở bước này. HUD: score, graze meter, combo. Death → GAMEOVER → tap restart <300ms. QA1: chạy 10 phút không crash, physics determinism (seeded mulberry32), 60fps greybox.

ITERATION 2 — ENTERPRISE JUICE (cảm giác AAA-arcade):
- Particle pooling hoàn chỉnh: ring buffer 1024, spawn = ghi đè slot cũ, 3 loại (graze spark amber #FFB300, trail cyan #00F5FF, death burst magenta #FF2E92); vẽ batched theo fillStyle nhóm.
- Screen shake trauma model: amplitude = trauma²·14px, trauma decay 1.6/s, rotZ ±trauma²·0.02rad. Hitstop: timescale=0 trong 90ms (chết) / 45ms (close-call graze streak 10).
- Procedural WebAudio 0-asset, graph: [tất cả nguồn] → masterGain → DynamicsCompressor → destination. unlockAudio() resume context trong gesture đầu (iOS: play buffer silence 0.01 gain để kích speaker). (a) Bass drone: 2 saw detune ±6 cent @55Hz, lowpass cutoff = 200+2200·(1−ts)Hz — nhạc 'chùng xuống' theo bullet-time; (b) Graze zap: square 880→1760Hz exp-ramp 60ms qua highpass 600Hz; (c) Combo ladder: pentatonic f = 440·2^(n mod 16·[0,2,4,7,9]/12) tăng theo combo; (d) Death: white-noise buffer 300ms, lowpass sweep 8k→120Hz; (e) UI tick: sine 1200Hz 25ms −12dB. Mute toggle persist.
- Bảng màu & visual: nền gradient dọc #05060F→#0B1026→#1B0B2E, starfield parallax 3 lớp tốc độ khác nhau; neon primary #00F5FF, danger #FF2E92, graze #FFB300, core trắng #FFFFFF; hue-shift 4° mỗi phase (globalCompositeOperation lighter cho glow additive rẻ). Graze streak ≥5: viền màn hình pulse amber, ship kéo ghost trail (vẽ 5 frame trước với alpha giảm).
- QA2: nghe không click/pop (ramp mọi gain 5ms), shake không gây nausea (≤14px), spawn 50 obstacles + 400 particles mà frame time ≤8ms.

ITERATION 3 — ENTERPRISE HARDENING (ship-ready):
- Visibility API: document.hidden → PAUSED, audio ctx.suspend(); visible → không auto-resume ngay, hiện nút RESUME (chống chết oan).
- LocalStorage (namespace ls_graze_v1, JSON + checksum XOR chống edit): bestScore, totalRuns, lifetimeGraze, mute, bestCombo. GAMEOVER hiển thị delta so kỉ lục + flash NEW RECORD.
- Near-miss fair-feel: hitbox THẬT khi xét chết = 80% hitbox hiển thị (−20%); graze ring tính trên hitbox đầy đủ. Thêm telemetry nội bộ: deaths/minute, avg graze/run (in-memory, log console ở debug flag).
- Instant Replay: ring buffer 6s × 64Hz snapshot gọn (chỉ position/type/state của player+obstacles+particles-representative, Float32Array flat, preallocate). Chết → hitstop 90ms → replay 0.4× tốc độ với letterbox đen 2 cạnh + tag REPLAY; input-to-replay <150ms tổng.
- FPS governor tự trị: nếu mean frame time >12ms trong 60 frame liên tiếp → tự hạ particle budget 50% rồi DPR 1.5 rồi starfield 2 lớp (không bao giờ thấp hơn 60fps target).
- Pattern Director: seedable mulberry32, 4 pattern (helix gate xoay, laser fence có gap dịch, homing darts 3-volley, pendulum blade); difficulty(t) = 1 − e^(−t/90); interval spawn = lerp(1.6s→0.45s). State machine BOOT→MENU→PLAY→REPLAY→GAMEOVER, update/draw tách bạch từng state.

=== TIÊU CHUẨN NGHIỆM THU ENTERPRISE (ACCEPTANCE — fail 1 mục = KHÔNG ship) ===
AC1 Standalone 100%: đúng 1 file index.html, mở bằng double-click file:// chạy đủ (0 network request, 0 asset ngoài, font hệ thống, art sinh bằng canvas, audio synth thuần WebAudio).
AC2 60 FPS locked @1080p HiDPI: frame budget ≤8ms trên phone tầm trung; stress test 50 obstacles + 400 particles + replay chạy song song: không frame nào >20ms.
AC3 Zero-GC trong RAF: không new/object-literal/array-literal/string-concat/closure tạo trong vòng update+render; xác nhận bằng Chrome DevTools Allocation instrumentation: 0 allocation sample trong 10s gameplay liên tục; heap phẳng ±2MB sau 30 phút.
AC4 Latency: touch cảm nhận <50ms; restart-to-play <300ms; death-to-replay <150ms; audio unlock trong đúng gesture đầu tiên.
AC5 Tương thích: iOS Safari 15+, Android Chrome 100+, desktop Chrome/Firefox (chuột + Space); pause/resume đúng khi tab ẩn, không audio zombie ngầm.
AC6 QA 30 phút: không soft-lock, không stuck state, replay chính xác frame-perfect với buffer, kỉ lục LocalStorage sống sót reload.

STYLE GUIDE: typography = system-ui bold tracking-rộng cho số score; motion = mọi thứ ease-out exponential, không linear-jerk; juice nguyên tắc: MỌI hành động của người chơi phải có phản hồi âm+nét trong 1 frame (16ms).
```
