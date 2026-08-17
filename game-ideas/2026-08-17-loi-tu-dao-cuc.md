# Lõi Từ: Đảo Cực

- **Ngày:** 2026-08-17
- **Genre:** Arcade/Casual One-Thumb · Polarity-Flip Orbital Dodger — chạm để đảo cực (hút vào lõi / văng ra vành), quán tính giữ nguyên tạo quỹ đạo xoắn ốc, hứng tia lửa theo chuỗi, né vành xạ quay
- **Mô tả:** Chạm một ngón tay để đảo cực từ: hạt sáng của bạn bị hút vào lõi hoặc văng ra vành, quán tính cũ kéo thành quỹ đạo xoắn ốc khiến mỗi cú lật là một pha liều lĩnh mới. Chuỗi combo nâng cao độ theo thang pentatonic và cú né 'tỉ milimet' kích hitstop — dopamine đúng kiểu 'một ván nữa'.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
MASTER PROMPT — LÕI TỪ: ĐẢO CỰC (Magnetic Core: Polarity Flip)

/goal (STANDING GOAL — ENTERPRISE ARCADE STANDARD):
Ship một game arcade H5 one-thumb THƯƠNG MẠI HOÁ ĐƯỢC, khác biệt hoàn toàn với sản phẩm học sinh/amateur: (1) Gameplay hook độc quyền 'polarity-flip orbit' — chạm để đảo cực, quán tính bảo toàn, người chơi CẢM NHẬN quỹ đạo xoắn ốc chứ không chỉ di chuyển; (2) Mỗi run 60–180s, mọi cái chết là lỗi người chơi 100% (fair-death), luôn kết thúc bằng suy nghĩ 'một ván nữa'; (3) Chất lượng ship-able lên web portal (Poki/CrazyGames-tier): 60FPS locked, zero-asset, zero-dependency, chạy cả khi mở trực tiếp file://; (4) Kiến trúc production trong 1 file: config frozen, pools, telemetry stubs sẵn sàng cắm SDK, hook điểm chèn rewarded-ad revive đã định vị nhưng disabled. Mọi quyết định kỹ thuật phục vụ 3 trục: Responsiveness <16.6ms, Readability (đọc được угроз trong 200ms), Retention (combo + near-miss dopamine).

AUTONOMOUS ITERATION LOOP — agent TỰ lặp 3 vòng, TỰ viết checklist pass/fail cho từng vòng, fail thì fix xong mới sang vòng sau; sau vòng 3 chạy lại toàn bộ checklist lần cuối:

[Iteration 1 — CORE ENGINE]
- 1 file index.html duy nhất, Canvas 2D, design space 1920×1080 letterbox, HiDPI: canvas.width = cssSize × min(devicePixelRatio,2), ctx.setTransform để vẽ theo toạ độ design.
- Vòng lặp: fixed-timestep accumulator, dt = 1/120s, render interpolation alpha = acc/dt; clamp frame ≤0.25s (anti tab-spiral); đúng 1 requestAnimationFrame chain.
- Input 1-thumb: chỉ pointerdown; touch-action:none; chặn double-tap zoom, pull-to-refresh, context menu, text selection; input vẫn hợp lệ khi ngón kéo ra ngoài canvas.
- Gameplay hoàn chỉnh: arena tròn R=470 (design px); player particle trạng thái (r, θ, v_r, v_θ, s); chạm = đảo dấu cực s∈{+1,−1}; sparks sinh ở 3 lane bán kính; vành xạ hazard dạng arc quay có khe hở; va chạm chết; HUD score/combo/best; restart <300ms.
- Exit criteria: tự chơi liền 30s mượt, toạ độ đúng ở mọi tỉ lệ màn hình, 0 lỗi logic, Performance panel ghi nhận 0 GC.

[Iteration 2 — ENTERPRISE JUICE]
- ParticlePool 512 hạt pre-allocated (structure-of-arrays, typed arrays), spawn/kill = swap-remove; tuyệt đối 0 allocation trong frame.
- Screen shake mô hình trauma²: offset = 12px · trauma² · noise, trauma decay 1.8/s; hitstop: timescale=0 trong 60–90ms khi chết, 40ms khi near-miss; flash trắng alpha 0.25 trong 80ms.
- Procedural WebAudio 0-asset: AudioContext singleton; unlockAudio() gọi trong gesture đầu tiên (resume nếu suspended); chain: masterGain(0.8) → DynamicsCompressor → destination; mọi node/preset/buffer noise tạo lúc init, khi playback chỉ set param.
- Bảng synth: collect = sine 880→1760Hz exp-ramp 60ms; combo ladder pentatonic minor [220.0, 261.6, 293.7, 329.6, 392.0]Hz nhân hệ số (1+0.06·comboStep); flip cực = noise burst bandpass 900Hz Q=4 40ms + sub sine 80Hz decay 120ms; death = saw 220→30Hz 450ms + lowpass sweep 4k→200Hz; frenzy pad = 2 triangle detune 110/110.7Hz; peak output < −1dBFS.
- Visual: core glow radial cyan→violet; player trail 12 điểm lưu sẵn; sparkle khi chain; vignette động đậm theo bậc combo.
- Exit criteria: A/B tự chơi đạt cảm giác 'đắt tiền', vẫn 0 alloc/frame, audio không rè.

[Iteration 3 — ENTERPRISE HARDENING]
- Visibility API: visibilitychange → pause toàn bộ (đóng băng accumulator, audio.suspend) + overlay resume bằng tap; test chuyển tab giữa run 10 lần, trạng thái không lệch 1 frame logic nào.
- LocalStorage schema có version + try/catch đầy đủ: bestScore, totalRuns, settings {mute}; hỏng/quota đầy vẫn chơi bình thường (in-memory fallback).
- Near-miss hệ công bằng: hitbox CHẾT = sprite thu nhỏ 20% (tha thứ viền cho cảm giác công bằng), vùng near-miss = sprite +15% nhưng không chết → +25 điểm, sfx whoosh, hitstop 40ms; debug view vẽ cả 3 vòng hitbox.
- Instant Replay: ring buffer 90 snapshot @30Hz ({t, r, θ, s, eventFlags}); chết → replay 1.2s chạy ở 0.5×; thời điểm chết đến frame replay đầu TIÊU HAO <150ms (đo performance.now, log ở dev mode).
- Exit criteria: checklist 3 vòng pass + smoke test: 2 heap snapshot cách nhau 5 phút chênh <5%.

ENTERPRISE ACCEPTANCE CRITERIA (NGHIỆM THU CUỐI):
1. Standalone 100%: double-click file chạy tốt không cần server; không fetch/CDN/font ngoài (system font stack); không import module ngoài.
2. 0 asset ngoài: mọi hình vẽ Canvas procedural, mọi âm thanh WebAudio procedural.
3. 60 FPS locked trên Chrome + Safari mobile mid-range; jank frame <1%/10s; có dev overlay FPS + frame-time graph (toggle).
4. 0 GC allocation trong RAF: allocation chỉ phép ở init/resize/start-run; cấm closure tạo mới, map/filter/concat, nối string, ghi DOM style trong frame; xác nhận bằng Allocation sampling.
5. Robustness: resize + xoay màn hình live không vỡ toạ độ; rapid tap 20/s không dual-trigger; background 5 phút rồi resume đúng trạng thái.
6. Product polish: first-run guide 5s tự ẩn; game-over hiển thị replay + best + 'chạm để chơi lại' rõ ràng; mute persist giữa phiên.

TECHNICAL BLUEPRINT (agent được quyền tinh chỉnh khi tự chơi thấy cần, giữ nguyên tinh thần):
- Palette: nền radial #05060E→#0B1026→#131B3A; lõi glow #22D3EE→#A78BFA; player cực+ cyan #34D3FF, cực− pink #FF6B9D; spark #FFD166; hazard gradient #FF3B5C→#7A0B2E; UI #E8ECFF alpha 0.9; frenzy mode hue-rotate 12°/s.
- Vật lý (đơn vị design px, dt=1/120): gia tốc hướng tâm a_r (dương ra ngoài) = −s · G · soften(r), s=+1 hút lõi / s=−1 đẩy vành; soften(r) = 0.5R/max(r, 0.5R); G=2400, clamp |a_r|≤2600; tích phân semi-implicit Euler; damping tiếp tuyến 0.995/step; nảy vành restitution 0.82 khi r>0.94R; v_max=1400; spawn r=0.82R, v_θ=±(380+40·d).
- Difficulty curve: d(t)=min(1, t/150s); ω hazard 0.6→2.1 rad/s; số arc 2→5; lifetime spark 6.0→3.2s; khe hở arc 110°→70°.
- Combo system: cửa sổ refresh 2.2s; bậc nhân x1/x2/x3/x4/x6/x8 tại chuỗi 0/4/9/16/28/45; điểm spark = 10×bậc; near-miss +25 điểm & +50% tiến độ bậc; chết khi đang frenzy giữ 50% bậc cho run kế (retention hook).
- Telemetry stubs: run_start / run_end / death / near_miss (console.debug, no PII) — điểm cắm SDK thương mại sau này.
```
