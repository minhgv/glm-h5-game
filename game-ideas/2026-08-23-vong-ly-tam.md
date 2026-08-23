# Vòng Ly Tâm

- **Ngày:** 2026-08-23
- **Genre:** Arcade One-Thumb Orbital Climber — Hold để neo dây quay quanh anchor, thả để văng theo tiếp tuyến, leo tháp vô hạn bằng quán tính
- **Mô tả:** Bạn là một hạt plasma rơi vào tháp neon vô tận: giữ 1 ngón tay để móc dây ly tâm và văng herself qua các anchor, thả tay đúng ±12° tiếp tuyến để Perfect Release, chain combo ridge lên vô hạn — một nhầm nhị nửa giây là rơi xuống vực.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — STANDING GOAL (Enterprise Arcade Studio Standard):
Xây dựng 'Vòng Ly Tâm' — game H5 arcade one-thumb thương mại hóa được: single-file HTML chạy offline 100%, 60 FPS locked trên Chrome Android tầm trung, run ngắn 45-90s, instant-restart <400ms, juice density cấp Triple-i mobile (mỗi input đều có feedback аудио+hình ảnh trong <50ms). Phân biệt với game amateur bằng: fixed-step physics determinism, zero-GC render loop, procedural WebAudio 0-asset, hệ combo có depth (Perfect Chain × Grazing × Risk-Reward khi bám anchor xa hơn), analytics hooks sẵn (run_start/run_end/revive_offer). Mục tiêu lưu giữ: D1 retention ≥ 35% qua loop 'thua do lỗi player, không phải game'.

AUTONOMOUS ITERATION LOOP — agent tự lặp, tự nghiệm thu từng vòng trước khi sang vòng sau:

[ITERATION 1 — CORE ENGINE]
- Canvas 1080p HiDPI: width=1080 logic px, DPR-cap 2.0, resize observer, letterbox giữ aspect 9:16, ctx.imageSmoothingEnabled=false cho UI sprite procedural.
- Fixed-step physics: accumulator loop, SIM_DT=1/120s, render interpolation alpha=acc/SIM_DT, clamp frame dt ≤ 50ms (anti spiral-of-death), paused khi tab ẩn.
- Physics core: free-fall g=2400 px/s² (hướng +Y xuống); khi Hold: snap tether tới anchor gần nhất phía trên trong bán kính 420px, chuyển tốc tuyến tính → góc: ω=|v|/r (bảo toàn động lượng), trong swing chỉ có trọng lực tạo torque: ω += (g·cos(θ)/r)·dt, damping ω·=(1−0.8·dt); Release: v_tangential=ω·r theo vector tiếp tuyến, giữ nguyên |v|.
- One-thumb input: Pointer Events unify touch/mouse/Space, chỉ 2 state (DOWN=attached, UP=flung), input latency target <50ms, chặn scroll/zoom/long-press-press (touch-action:none, user-select:none, -webkit-touch-callout:none).
- Camera: follow Y theo player với smoothing exp: camY += (targetY−camY)·(1−e^(−8·dt));.Anchor spawning: procedural, khoảng cách dọc 260–340px, offset ngang ±40% screen, gap khó tăng theo hàm难度 = 1−e^(−0.035·height/100).
- Nghiệm thu vòng 1: chơi được full loop 60s, chết khi rơi khỏi màn ≥1200px, restart <400ms, không jank khi 50 anchor on-screen.

[ITERATION 2 — ENTERPRISE JUICE]
- Particle pooling: ring buffer 512 particle struct-of-arrays (Float32Array x/y/vx/vy/life/size/hue), zero alloc trong RAF; emit: tether-snap spark 24 hạt, perfect release burst 48 hạt radial, graze trail 2 hạt/frame, death shatter 96 hạt.
- Screen shake: trauma model (0..1), shake=trauma², offset=shake·14px·noise(t·35), trauma decay 1.6/s; add 0.3 khi attach, 0.5 khi graze, 0.7 khi chết.
- Hitstop: freeze physics 45ms khi Perfect Release (co-scale 3/5/8/12ms thêm theo combo tier 1-4), 90ms khi chết — dùng để não player 'chụp' khoảnh khắc.
- Procedural WebAudio 0-asset: unlockAudio() trên pointerdown đầu tiên (resume AudioContext trong user gesture); master gain 0.35 + soft-clip; nhạc nền = 2 osc drone (sine 55Hz + triangle 110.07Hz beat-frequency 0.07Hz) + hi-hat noise burst 16th-note khi combo ≥ ×5; SFX pentatonic ladder C-major [C5 523.25, D5 587.33, E5 659.25, G5 783.99, A5 880.00] — mỗi lần attach chìa nốt bậc combo% 5, osc 'square' gain envelope attack 5ms/decay 180ms; Perfect Release = 2 osc sawtooth detune ±12 cents + pitch rise +3 semitone; death = glide 220→55Hz exponentially 600ms + lowpass sweep 8000→200Hz.
- Nghiệm thu vòng 2: không có frame nào audio-hitch, mọi SFX tạo trong <2ms, tổng juice làm gameplay 'đã' hơn — verify bằng test chơi 10 run liên tục.

[ITERATION 3 — ENTERPRISE HARDENING]
- Visibility API: document.visibilitychange → pause + mute; resume qua overlay đếm ngược 3-2-1 (mỗi số 500ms + tick SFX) để player lấy nhịp, chống 'resume-death'.
- LocalStorage (namespace 'vlt_'): best_score, best_combo, total_runs, mute_pref; try/catch mọi quota/private-mode failure, graceful default.
- Near-miss system: hitbox graze = player hitbox thu −20% (14.4px vs 18px radius) quét vùng vành ngoài 30–48px quanh hazards; graze trigger: +50đ × multiplier, trauma 0.15, tick SFX 1318.5Hz (E6), không spam — cooldown 150ms/hazard.
- Instant Replay <150ms: ring buffer 3 giây game-state (60 snapshot/s × pos/rot của player + anchors + particles-meta), khi chết render lại 3s ở 0.5× speed với vignette + 'REPLAY' watermark, sau đó mới hiện death screen; buffer là pre-allocated Float32Array, ghi đè vòng tròn.
- Anti-frustration: 'Second Wind' revive 1 lần/run khi đạt combo ≥ ×8 (checkpoint = anchor cao nhất), giữ 50% multiplier.
- Nghiệm thu vòng 3: kill tab giữa run → reload không lỗi; private mode Safari OK; replay chính xác frame-perfect; tổng JSON < 150KB.

ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu cuối, fails thì quay lại vòng thiếu):
1. Standalone 100%: một file index.html duy nhất, mở bằng file:// chạy full, network tab = 0 request ngoài, offline-mode PWA-compatible manifest inline data-URI.
2. 0 asset ngoài: không ảnh/font/sound/CDN — mọi visual là canvas path + gradient, mọi audio là WebAudio oscillator/noise-buffer.
3. 60 FPS locked: JS budget ≤ 8ms/frame (đo performance.now trong RAF, self-instrument FPS counter bật bằng ?debug=1), không frame nào > 20ms trong run chuẩn 5 phút.
4. 0 GC allocation trong RAF: không object literal/array method tạo garbage (map/filter/concat/spread), không string concat trong hot path, không closure creation — verify bằng Chrome Allocation Timeline heap flat qua 3 phút.
5. Physics determinism: cùng input seed → cùng trajectory (fixed-step đảm bảo replay khớp).
6. UX: first-meaningful-play < 3s từ load (không menu sâu), death→restart < 400ms, mọi nút hit-target ≥ 48px.

TECHNICAL BLUEPRINT (GLM Director định nghĩa — agent triển khai nguyên văn):
• Bảng màu: nền vertical-gradient #050816→#0B1E3A→#122B4F; player plasma core radial #FFFFFF→#00F0FF→transparent; anchor ring #FFD166 khi thường, #00F0FF khi in-range, pulse 2Hz khi là target gần nhất; hazard laser #FF2E63 core + #FF8FA3 glow; graze flash #7CFF6B; UI typography 'Courier New' monospace tracking +2px, HUD alpha 0.9; everything on additive-blend (globalCompositeOperation='lighter') cho neon depth.
• Combo system: multiplier ladder ×1→×2→×3→×5→×8 (cap), lên 1 bậc mỗi Perfect Release liên tiếp (release trong ±12° của tiếp tuyến hướng lên tối ưu), reset khi: bỏ lỡ anchor (không attach trong 4s) hoặc graze-fail; score = height·0.1 + perfect·500·mult + graze·50·mult; hiển thị multiplier với scale-pop 1.4→1.0 trong 200ms + chromatic tint theo tier (tier 1 trắng, 2 vàng, 3 cam, 5 đỏ cam, 8 trắng xanh electric).
• Difficulty curve: hazard density từ 0% (0–2000px) tăng theo hàm logistic tới 45% (12000px+); anchor spacing mở rộng dần 260→340px; tốc độ swing tự nhiên tăng vì r dài hơn → skill ceiling = đọc trajectory nhiều vòng quay trước.
• Game feel constants (tuning table): g=2400, tether_snap_radius=420, release_angle_window=12°, graze_ring=[30,48]px, hitbox=18px (graze 14.4px), trauma_decay=1.6/s, hitstop_ms=[45,48,53,57] theo tier, camera_stiffness=8, sim_hz=120, replay_seconds=3, replay_speed=0.5.
```
