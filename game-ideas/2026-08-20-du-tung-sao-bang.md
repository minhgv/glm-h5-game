# ĐU TUNG SAO BĂNG

- **Ngày:** 2026-08-20
- **Genre:** Arcade/Casual — Orbital-Slingshot Infinite Climber: one-thumb, vật lý con lắc thật (bám mỏ neo → đu → văng tiếp tuyến), near-miss graze, combo score-chase, thế giới sinh vô tận theo độ cao
- **Mô tả:** Một ngón tay, một quyết định: GIỮ để đu quanh mỏ neo, THẢ để văng lên Tháp Thiên Hà bằng quán tính — cạo sát laser hồng để ăn graze, giữ chuỗi combo bùng nổ, chết là xem chính mình bay trong replay 2.5 giây rồi chơi lại ngay lập tức.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — STANDING GOAL (ENTERPRISE ARCADE STUDIO):
Ship 'ĐU TUNG SAO BĂNG' — game H5 Arcade one-thumb, thể loại Orbital-Slingshot Infinite Climber — ở mức thương mại hoá được: (1) game-feel ĐO ĐƯỢC (input→phản hồi ≤50ms, chết→replay→chơi lại ≤3s), (2) juice được budget hoá theo frame, (3) performance xác thực bằng DevTools chứ không cảm tính, (4) vòng lặp score-chase + combo + near-miss tạo retention (KPI nội bộ: session ≥4 phút, ≥6 run/người/ngày). Phân biệt hoàn toàn với sản phẩm amateur: không placeholder, không asset tải về, mọi hiệu ứng đều procedural và mỗi quyết định thiết kế đều có số liệu ghi trong blueprint.

AUTONOMOUS ITERATION LOOP — agent tự chạy 3 giai đoạn tuần tự; mỗi giai đoạn có Definition of Done (DoD); nếu không đạt DoD, lặp lại chính giai đoạn đó (tối đa 3 vòng inner-loop, ghi nguyên nhân) trước khi sang giai đoạn kế tiếp:

▍ITERATION 1 — CORE ENGINE
- Canvas 1080p HiDPI: logical 1920×1080, scale theo min(devicePixelRatio, 2), letterbox an toàn, resize không reset state.
- Fixed-step physics: accumulator pattern, dt = 1/120s, semi-implicit Euler, render interpolation với alpha; timeScale toàn cục (nền tảng cho hitstop).
- 1-thumb touch: pointerdown = bám anchor tối ưu phía trước, pointerup = nhả văng theo tiếp tuyến; touch-action:none; chặn scroll/zoom/double-tap/context-menu; mouse cho desktop.
- Camera dọc: camY += (targetY − camY)·(1 − e^(−8·dt)); lookahead = vy·0.18.
- Spawner: anchor cách nhau 260–420px theo độ cao, lệch ngang ±32%W; laser-gate quay tròn xuất hiện từ độ cao 600px.
- DoD: người chơi mới bay vượt 3000px trong run đầu; chết→restart ≤1.5s; 60FPS trên thiết bị trung bình; 0 lỗi console.

▍ITERATION 2 — ENTERPRISE JUICE
- Particle pooling: pool 512 particle prealloc, spawn qua ring-cursor, remove bằng swap-pop; blend 'lighter'; 0 phép 'new' trong RAF.
- Screen shake: trauma∈[0,1]; offset = trauma²·24px·noise; trauma decay 1.6/s; cộng trauma: graze +0.15, perfect +0.25, chết +1.0.
- Hitstop: 40ms (perfect), 70ms (mốc chain 10), 90ms (chết) — timeScale=0 nhưng vẫn render, không dừng RAF.
- Procedural WebAudio 0-asset: 1 noise-buffer dùng chung cả session, oscillator/noise-node tạo và dispose đúng lúc phát; unlockAudio() gọi trong pointerdown đầu tiên (resume AudioContext); SFX theo bảng tần số trong Blueprint; pitch ladder tăng theo combo.
- DoD: nghe 10 graze liên tiếp không 2 tiếng trùng cao độ khi combo tăng; tổng JS ≤6ms/frame; audio không rè (qua compressor).

▍ITERATION 3 — ENTERPRISE HARDENING
- Visibility API: document.hidden → PAUSED: dừng accumulator, mute masterGain; visible → đếm ngược 3-2-1 rồi resume; clamp accumulator ≤50ms chống tunneling.
- LocalStorage (wrap try/catch cho chế độ private): duongsao.best, duongsao.runs, duongsao.settings; lưu best ngay tại frame chết, không đợi unload.
- Near-miss: hitbox va chạm thực = hitbox hiển thị −20%; graze khi khoảng cách surface-to-surface tới hazard <26px duy trì ≥80ms → +1 chain, popup 'GRAZE!', không chết.
- Instant Replay: ring-buffer 150 snapshot (mỗi 33ms) chứa trạng thái player/anchor/hazard; khi chết phát lại 2.5s ×0.5 tốc bằng chính pipeline render (không canvas phụ), bắt đầu ≤150ms sau frame chết.
- DoD: chuyển tab 10 lần liên tiếp không chết oan/không lag spike; replay mượt 30fps; dữ liệu sống sót qua reload.

ENTERPRISE ACCEPTANCE CRITERIA — NGHIỆM THU CUỐI (tất cả phải đạt, xác thực bằng công cụ):
1. Standalone 100%: đúng 1 file HTML, mở bằng file:// chạy đầy đủ; 0 asset ngoài, 0 CDN, 0 font ngoài, 0 ảnh — mọi hình vẽ bằng Canvas2D path/gradient.
2. 60 FPS locked: budget 16.67ms/frame; JS ≤6ms + render ≤4ms trên laptop trung bình; không frame nào >25ms sau 5s warm-up; auto-degrade juice (tắt shadowBlur, giảm particle) nếu FPS<55.
3. 0 GC allocation trong RAF: xác thực bằng DevTools Performance — ghi 3 lần, heap allocations trong steady-state gameplay = 0; mọi object runtime lấy từ pool/biến module-scope tái sử dụng.
4. Input latency pointer→render ≤50ms; mọi audio chỉ khởi tạo sau user gesture; 0 console error/warning ở chế độ thường.
5. Chơi được cả desktop (mouse) lẫn mobile (touch), portrait lẫn landscape; không select-text, không pull-to-refresh.

TECHNICAL BLUEPRINT (agent tự do tinh chỉnh số liệu, nhưng phải giữ tam giác cảm giác MỊN — NHỊN — ĐỘC):
▍Bảng màu: nền gradient dọc #05060F→#0B1030→#141B45 + 3 lớp sao nền parallax; comet #00F0FF với đuôi gradient cyan→transparent; anchor #FFC94D (vàng hổ phách); hazard #FF2E88 (hồng neon); graze/điểm bay #3DFFB4 (mint); UI #EAF2FF; fog chết dưới đáy #3A0CA3→#7209B7. Glow dùng shadowBlur với budget ≤8 draw/frame.
▍Vật lý (px logic 1080p): g = 2000 px/s²; khi bám tether bán kính r: con lắc θ'' = −(g/r)·cosθ − 0.02·ω; ω ban đầu khi bám = chiếu vận tốc lên tiếp tuyến (v·t̂)/r — giữ năng lượng, không teleport; tích phân semi-implicit: ω += θ''·dt rồi θ += ω·dt; pos = anchor + r·[cosθ, sinθ]; tether tối đa 480px; nhả: v = ω·r·t̂ (hướng tiếp tuyến theo dấu ω).
▍Perfect Release: hướng vận tốc sau khi nhả hợp với trục thẳng đứng góc ≤12° → boost ×1.18 tốc, hitstop 40ms, flash radial vàng.
▍Chọn anchor khi press (trong tầm 480px): score = dot(normalize(anchor−player), normalize(v)) + (player.y − anchor.y)/1500 — ưu tiên anchor cao theo hướng bay; không có anchor hợp lệ → tiếp tục rơi tự do (giữ tension của quyết định).
▍Combo 'Chuỗi Tinh Hà': +1 chain khi Perfect Release, Graze, hoặc bám anchor mới cao hơn anchor trước 200px; multiplier = min(8, 1 + ⌊chain/4⌋); decay 3s không sự kiện → reset; UI vòng cung quanh comet hiển thị đếm ngược decay.
▍Điểm: height/10 (tick tại mốc) + graze·50·mult + perfect·100·mult; run đầu tiên trong ngày ×2 (hook quay lại hằng ngày).
▍Difficulty: diff = min(1, h/12000); laser-gate spawn p = 0.15 + 0.5·diff; tốc quay = 0.8 + 2.2·diff rad/s; shaft hẹp dần: biên ngang = W·(0.42 − 0.10·diff); tốc độ leo của fog = 60 + 240·diff px/s.
▍Synth table (WebAudio, master −6dB + DynamicsCompressor): attach = square 180→320Hz, 50ms, lowpass Q=8; swing-loop = bandpass noise 400–900Hz, gain tỉ lệ |ω|/12; release = sine 660→1320Hz, 120ms, attack 5ms; perfect = 2 osc 880Hz detune ±7 cent, 90ms; graze ladder = pentatonic [523.25, 587.33, 659.25, 783.99, 880.00] Hz, lệch octave +25% mỗi 5 chain, triangle 80ms; death = saw 220→40Hz 450ms + noise burst 90ms qua lowpass 1kHz; drone nền = sine 55Hz + 82.5Hz, LFO 0.1Hz điều chế gain, −28dB.
▍Particles: pool 512; burst perfect 24 hạt (cyan→gold), graze 12 hạt (mint), chết 48 hạt (hồng); life 0.4–0.9s; gravity 400 px/s²; drag e^(−3t); spawn bằng ring-cursor, không tạo mảng mới.
▍Instant Replay: snapshot 30Hz gồm player (x, y, θ, r, tether state) + anchor/hazard trong viewport; playback 2.5s ×0.5 kèm viền trắng mờ dần + chữ 'REPLAY'; tái dùng pipeline render hiện có.
▍State machine: BOOT → MENU → RUN → DYING (hitstop) → REPLAY → SCORE → RUN/MENU; ?debug=1 bật FPS meter + seed RNG mulberry32 cố định để reproduce bug.
▍Risk register: tab-switch tunneling → clamp accumulator; iOS autoplay → resume() trong gesture; GPU burn ở DPR cao → cap DPR 2 + auto-degrade juice; localStorage bị chặn → try/catch + fallback in-memory.
```
