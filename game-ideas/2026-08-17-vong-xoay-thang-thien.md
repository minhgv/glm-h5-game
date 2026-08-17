# Vòng Xoáy Thăng Thiên

- **Ngày:** 2026-08-17
- **Genre:** Arcide One-Thumb Orbital-Tether Climber — swing/wind/fling (bảo toàn mô-men động lượng yo-yo) + near-miss graze combo + nhạc procedural reactive
- **Mô tả:** Chạm & giữ để móc node gần nhất, tự xoáy như yo-yo khi dây cuốn ngắn dần khiến tốc độ quay tăng theo lũy thừa, rồi thả đúng đỉnh cung để bắn vụt lên lòng vortex neon. Mỗi cú lướt sát tử thần (near-miss) đẩy combo, đẩy cao độ synthesizer và đẩy nhịp tim — càng xoáy lâu càng nhanh, càng gần chết, càng đã.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
MASTER PROMPT — VÒNG XOÁY THĂNG THIÊN v1.0 — SHIP-READY H5 ARCADE

▛ /GOAL — STANDING GOAL (CHUẨN ENTERPRISE ARCADE STUDIO)
Ship MỘT game H5 single-file thương mại hoá được ngay (port sang Poki / CrazyGames / web portal mà không sửa code), phân biệt tuyệt đối với game học sinh/amateur bằng 5 trụ cột cứng:
(1) Vật lý deterministic: fixed-step accumulator, kết quả không phụ thuộc framerate hay thiết bị.
(2) Juice chuẩn studio: mọi input đều có phản hồi thị giác + âm thanh ≤ 1 frame; hitstop, screen-shake, particle, audio-reactive hazard.
(3) Hardening sản phẩm: tab-pause, save, instant replay, zero-jank, zero-leak.
(4) Vòng lặp nghiện 5 giây: MÓC → XOÁY (dây cuốn, tốc độ tăng) → THẢ (fling) → LƯỚT SÁT TỬ THẦN (near-miss combo) → ĐIỂM/FEVER. Cảm giác chủ đạo: 'một lần nữa nữa thôi'.
(5) Data-driven: toàn bộ tuning nằm trong 1 object CONFIG bậc nhất, không magic number rải rác.
KPI nghiệm thu gián tiếp: FTUE ≤ 5s đến lần chết đầu tiên; thời lượng phiên TB ≥ 4 phút; tỷ lệ bấm chơi lại ngay ≥ 60%.
Vai trò agent: Game Director + Senior Gameplay Engineer + Audio Designer. Tự do quyết định mọi chi tiết kỹ thuật, KHÔNG giảm scope trừ khi đã hết 3 retry của vòng lặp.

▛ AUTONOMOUS ITERATION LOOP (TỰ TRỊ)
Chạy tuần tự 3 vòng. Mỗi vòng: PLAN (viết checklist) → BUILD → SELF-AUDIT (đo bằng performance.now / DevTools, không đo bằng cảm tính) → REFINE. CHỈ chuyển vòng khi checklist 100% PASS; tối đa 3 retry mỗi vòng trước khi ghi nợ kỹ thuật (debt note) và sang vòng.

── ITERATION 1 — CORE ENGINE ──
• Single index.html, Canvas 2D, 0 dependency. Portrait-first: khung logic 1080×1920, letterbox-contain theo viewport; backing store = cssSize × min(devicePixelRatio, 2); ctx.setTransform 1 lần khi resize (ResizeObserver + debounce 150ms, không tạo object trong handler RAF).
• Fixed-step physics: accumulator, dt = 1/120, tối đa 5 substeps/frame (chống spiral-of-death), render nội suy tuyến tính theo alpha = acc/dt; remainder mang sang frame sau.
• Input 1-thumb tổng quát: pointerdown/pointerup (Pointer Events, touch-action:none) + Space cho desktop. KHÔNG bắt buộc kéo — vị trí chạm không quan trọng, chỉ quan tâm trạng thái giữ.
• Cơ chế gốc: khi tự do → rơi theo G. Khi giữ → latch node tối ưu trong LATCH_RADIUS (hàm score = 1/dist + dot(v̂, hướng tới node)); quay quanh node: θ += ω·dt với ω = L / r², L bảo toàn; dây TỰ CUỐN: r(t) = max(r − WIND_RATE·dt, MIN_R) → v tiếp tuyến = ω·r = L/r tăng dần (rủi ro/tốc độ giao nhau). Thả → fling: v = 1.08 × ω·r theo tiếp tuyến t̂ = (−sinθ, cosθ)·sign(ω), tiếp tục bay tự do với G + drag nhẹ v ×= (1 − 0.06·dt).
• Camera smooth-damp theo player (chỉ cho phép trôi lên, không tụt), kill-line Vực Leo từ dưới trồi lên với tốc độ 30 + 0.06×chiều_cao(px)/s. Chạm stud/Vực = chết.
• Sinh thế giới procedural: cột node hướng lên, gap(h) = max(180, 320 − 0.08×h); stud theo mật độ tăng dần; seedable PRNG (mulberry32) để replay/verify.
• SELF-AUDIT I: giữ-thả 20 lần liên tục không jitter; tích phân θ khớp nghiệm giải tích sai lệch < 0.5% sau 10s; fps ổn định 60 ở tab foreground.

── ITERATION 2 — ENTERPRISE JUICE ──
• Particle pool: Float32Array 512×8 (x,y,vx,vy,life,maxLife,size,hue) cấp phát 1 lần; kill bằng swap-remove; spawn chỉ ghi đè slot chết. Trail = ring-buffer 24 điểm, stroke gradient theo độ cũ.
• Screen shake: trauma ∈ [0,1], offset = trauma² × 14px × noise; decay 2.2/s; chỉ apply vào transform camera (không đụng world-space logic).
• Hitstop: chết = timescale 0 trong 70ms; perfect-release = 45ms; FEVER trigger = 90ms + flash trắng 1 frame. Freeze bằng timescale, RAF vẫn chạy (đồng hồ particle/decay tách bạch).
• WebAudio procedural 0-asset, khởi tạo qua unlockAudio() trong gesture đầu tiên (new AudioContext + resume + pre-render noise buffer 1s). Chuỗi master: voices → masterGain(0.8) → DynamicsCompressor → destination. Mọi voice tái sử dụng node chuẩn bị sẵn; stop bằng gain ramp, không disconnect/create trong gameplay.
• Công thức âm: nền A-minor pentatonic [110, 130.81, 146.83, 164.81, 196, 220 Hz]; graze/near-miss pluck (triangle, ADSR 2/60/250/180ms) với cao độ freq = 220 × 2^(min(combo,24)/12) — combo tăng 1 = +1 semitone, tai người nghe như 'leo thang'; release-fling = saw sweep 120→880Hz/200ms qua lowpass 1.2kHz; chết = noise burst + osc pitch-drop 400→40Hz; beat clock 120 BPM để hazard pulse scale ±8% đồng bộ kick sub-bass 55Hz mỗi 2 nhịp.
• Combo system: graze zone = vành giữa hitbox_thực (×0.8) và hitbox_hiển thị; vào zone → chain +1, window làm mới 1.5s; multiplier = min(8, 1 + 0.25×chain); perfect release (góc v với trục lên < 15°) = +300×mult; chain ≥ 8 → FEVER 6s: WIND_RATE ×1.6, trail chuyển rainbow (HSL spin), thêm layer sub-bass, screen tint +5% độ bão hoà.
• Điểm: chiều cao m (px/100) + graze 150×mult + perfect 300×mult + xuyên ring-gate 100. UI số chỉ update DOM/canvas khi giá trị đổi (không vẽ chuỗi mới mỗi frame).
• SELF-AUDIT II: Performance panel 10 phút soak — 0 Long Task > 50ms; Memory → Allocation sampling 3 phút gameplay: 0 sample phát sinh bên trong callback RAF; âm thanh không click/pop khi spam 20 graze/s.

── ITERATION 3 — ENTERPRISE HARDENING ──
• Visibility API: visibilitychange + window blur → pause (freeze accumulator, audio.suspend()); foreground → chờ 1 gesture trước khi audio.resume() (state-machine Clean: PLAYING/PAUSED/DEAD/REPLAY, không trạng thái lai).
• LocalStorage: key vxt_save_v1 = {best, runs, totalMeters, sound} — JSON.parse trong try/catch, ghi debounce 500ms, fail-imossible (quota/security error → fallback biến bộ nhớ).
• Near-miss hitbox −20% chính xác: overlay debug (gõ ~) vẽ hitbox_thực vs hitbox_hiển thị; kiểm tra bằng 20 ca biên (tiếp tuyến, xuyên tâm, biên FEVER).
• Instant Replay < 150ms: ring buffer Float32Array 120×6 [px,py,θ,r,camY,t] ghi mỗi physics step; chết → hitstop 70ms chạy song song fade → replay 1.2s cuối ở 0.35× → màn Game Over; đo bằng performance.now() từ frame chết đến frame replay đầu ≤ 150ms, replay render tái sử dụng toàn bộ pipeline vẽ (0 alloc).
• Luật zero-GC trong RAF (dẫn chiếu cho cả 3 vòng): không closure/string/template/array method mới; mọi vector tạm module-level; gradient & Path2D cache theo combo-tier, chỉ build lại khi tier đổi; console/assert剥离 bằng flag DEBUG.
• SELF-AUDIT III: 10 lần switch tab/resize/đảo orientation không leak timer-node-audio (heap snapshot so sánh trước/sau ≤ 2 chu kỳ GC); replay mượt 0.35×; kill file:// mở trực tiếp — game chạy 100%.

▛ ENTERPRISE ACCEPTANCE CRITERIA (NGHIỆM THU CUỐI)
[A0·BLOCKER] Single-file HTML, chạy 100% offline qua file://, 0 asset ngoài, 0 CDN, 0 network request (DevTools Network = 0 row).
[A0·BLOCKER] 60 FPS locked: median frame = 16.6ms, p95 ≤ 16.9ms trên laptop tham chiếu; 0 frame ≥ 34ms trong 10 phút soak.
[A0·BLOCKER] 0 GC allocation trong RAF steady-state (Allocation sampling: 0 sample thuộc callback rAF).
[A1] Parity đầy đủ: 1-thumb touch, mouse, Space; audio unlock đúng gesture; không âm thanh sau blur.
[A1] Save/load best-score sống sóc reload; replay ≤ 150ms; near-miss −20% xác minh bằng overlay.
[A2] CONFIG data-driven + 1 trang tuning ghi chú công thức để artist/tester đổi cảm giác không đụng code.

▛ TECHNICAL BLUEPRINT (GIÁ TRỊ MẶC ĐỊNH)
• Bảng màu: nền vortex radial-gradient #050510 → #0B0E2A → #1a0b2e; player core #FFD166 với glow; tether #21E6C1; node #7B2FF7; hazard stud #FF4D6D; graze ring alpha 0.35 gold; FEVER tint +hue-spin 40°/s; mọi gradient build 1 lần/cache theo tier.
• Hằng số vật lý (px/s tại khung 1080p): G = 2200; WIND_RATE = 42 (FEVER ×1.6); LATCH_RADIUS = 300; MIN_R = 40; MAX_R = 340; clamp ω ≤ 14 rad/s; fling boost ×1.08; drag 0.06/s; camera stiffness 6/s; kill-line base 30 + 0.06×h.
• Audio: pentatonic [110,130.81,146.83,164.81,196,220]; pluck freq = 220×2^(min(combo,24)/12); fling sweep 120→880Hz/200ms; death drop 400→40Hz; kick sub 55Hz @120BPM; noise buffer 1s pre-render; toàn bộ qua compressor −24dB/4:1.
• Combo/kinh tế điểm: graze 150×mult, perfect-release 300×mult, gate 100, 1m = 1đ; mult cap ×8; decay window 1.5s; FEVER ≥ 8 chain, kéo 6s.
• Cấu trúc code: IIFE strict-mode; module HẰNG SỐ: CONFIG, PRNG, POOL, PHYSICS, AUDIO, FX, REPLAY, STATE, RENDER, INPUT; không class hierarchy thừa — Simplicity Over Abstraction.
```
