# Hoa Từ Trường — Magnetic Bloom

- **Ngày:** 2026-08-21
- **Genre:** Arcade Gravity-Bending Survival (One-Thumb Graze-Scoring Defense): người chơi không né — người chơi UỐN không gian, bắt thiên thạch vào quỹ đạo, graze để ăn combo, thả để slingshot chain-kill
- **Mô tả:** Bạn là lõi từ đứng yên giữa mưa thiên thạch: giữ ngón tay để triển khai lực trường cuốn đá vào quỹ đạo quay quanh mình — càng cho chúng bay sát mình, điểm càng nổ; buông tay để văng toàn bộ đá quỹ đạo thành đạn xâu chiếm chuỗi kill. Can đảm (khoảng cách tới cái chết) chính là điểm số.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — XÂY DỰNG 'HOA TÙ TRƯỜNG' (HOA TỪ TRƯỜNG) THƯƠNGNGHIỆP HÓA ĐƯỢC:
[GOAL] Sản xuất game H5 arcade 'Hoa Từ Trường' đạt chuẩn Enterprise Arcade Studio: chơi được trong <3s载入, phiên 45–90s, cơ chế D1-retention (best-score chase + Perfect Sling dopamine loop), game-feel cao cấp ngang tiêu chuẩn portal thương mại (Poki/CrazyGames tier). Phân biệt 100% với game amateur: core mechanic ĐỘC QUYỀN (gravity-bending + graze-as-currency + release-to-fling chain), juice chuyên sâu, hardening production-grade. TOÀN BỘ nằm trong 01 file index.html duy nhất.

[CORE LOOP] Giữ (hold) = trường đẩy-tangent cuốn đá vào quỹ đạo quanh lõi; đá lướt qua vành graze (amber) = +combo; buông (release) = trường sập trong 90ms, đá quỹ đạo văng ra ×1.9 vận tốc = đạn; đạn phá đá mới = chain kill; quá nhiệt 100% = trường ĐẢO CỰC (hút đá vào) 2.5s. Chết khi đá chạm hitbox lõi (80% visual — near-miss −20%).

[VÒNG LẶP TỰ TRỊ — AUTONOMOUS ITERATION LOOP] Chạy tuần tự, mỗi vòng: BUILD → SELF-TEST → FIX → RE-VERIFY → chỉ sang vòng sau khi checklist 100% PASS; nếu FAIL ở vòng sau, quay lại vá vòng trước (không chồng lỗi):
• ITERATION 1 — CORE ENGINE: Canvas 1080p HiDPI (min(1080, dpr cap 2) backbuffer, ctx.scale), fixed-step physics dt=1/120s + accumulator + render interpolation α (không dùng biến dt tự do); input = Pointer Events một ngón tay (touch-action:none, preventDefault, whole-screen hit target); entity debris = pre-allocated pool 256 (không new trong loop); cài đủ: field on/off, spawn director, quỹ đạo, graze ring, core collision, death→restart <300ms bằng tap. VERIFY: vertical slice chơi được 60FPS, vật lý ổn định ở 60/120/144Hz.
• ITERATION 2 — ENTERPRISE JUICE: particle pool 512 (không GC); screen shake trauma-based (offset = trauma² × 9px, rot ±0.6° × trauma², decay 1.8/s); hitstop (40ms chain-kill, 90ms core-hit — đóng băng accumulator, RAF vẫn render); WebAudio 100% procedural 0-asset, unlockAudio() ở gesture đầu tiên (resume ctx trong touchstart); synth graph: master(0.8)→DynamicsCompressor(threshold −18dB, ratio 6)→destination; SFX: field-hum 2 saw detuned 55Hz/55.35Hz qua lowpass mở theo tension 400→1400Hz; graze-blip sine 660Hz+combo×8, 40ms; sling FM-chime carrier 880Hz mod-ratio 2.5 decay 300ms; core-hit noise-burst + sub-sine 90→40Hz; overheat siren square 440→880Hz 1.2s; combo tier-up: arpeggio 3 nốt pentatonic pitch-rise theo tier.
• ITERATION 3 — ENTERPRISE HARDENING: Visibility API — tab blur = pause tức thì + resume countdown 3-2-1 (không drain overheat khi pause); LocalStorage safe-parse JSON: htb_best, htb_mute, htb_seenTutorial; near-miss hitbox −20% (core collision radius = 0.8 × visual radius) + graze annulus [0.9r, 1.8r] hiện rõ; Instant Replay <150ms: ring-buffer 120 physics snapshots (chỉ vị trí/vận tốc/field/trauma), khi chết phát lại 0.4× slow-mo có vignette + tag REPLAY, tap để skip; FPS governor: nếu fps<55 ≥2s thì hạ tier VFX (shadowBlur, particle cap 256, tắt parallax); chặn mọi alert/confirm, chặn font ngoài.

[ACCEPTANCE CRITERIA — NGHIỆM THU ENTERPRISE, TẤT CẢ PHẢI PASS]
1. Standalone 100%: 01 file index.html, chạy từ file://, 0 network request, 0 asset ngoài (không ảnh/font/audio file — tất cả procedural Canvas+WebAudio).
2. 60 FPS locked: RAF + fixed-step tách rời; frame budget measure bằng performance.now() < 12ms p95.
3. 0 GC allocation trong RAF steady-state: không tạo object/array/closure/string trong update+render; scratch-vector tái sử dụng; score string chỉ rebuild khi đổi; mọi particle/debris từ pool.
4. 1-thumb: chơi trọn vẹn bằng 1 ngón bất kỳ vị trí nào; input→response <1 frame.
5. Death→restart <300ms; First-playable <3s; autoplay-policy compliant (âm thanh chỉ sau gesture).
6. Chạy đúng 10 phút liên tục không degradation FPS, không memory leak (heap flat qua 3 lần restart).

[TECHNICAL BLUEPRINT — GLM TỰ DO ĐỊNH NGHĨA CHI TIẾT]
• PALETTE (ngữ nghĩa màu): nền radial-gradient #05070E→#0B1026→#141B3D + nebula parallax offscreen tĩnh; lõi #40F2D9 (teal=an toàn) lõi trắng #EFFFFB; thiên thạch #FF3D81 (magenta=uy hiếp) với đuôi ember #FF9E5E; vành graze #FFC145 (amber=điểm số); trạng thái đảo cực #B44BFF (tim tím, desat 60%); UI system-ui stack, chữ glow theo combo tier.
• VẬT LÝ: field bán kính R=0.42×min(w,h); với đá trong R: a = k(1−d/R)² × (r̂×1400 + t̂×900) px/s², t̂ = perpendicular hướng quay kim; quỹ đạo đẹp sinh ra khi v²/r ≈ a_rad → r* = √(k/v²) tự nhiên tạo bloom quay; release: vận tốc tiếp tuyến ×1.9, window hủy field 90ms; overheat +18/s hold, −26/s release, inversion 2.5s (đảo dấu lực, khoá điều khiển, shake liên tục trauma 0.4).
• COMBO: graze-tick +1 mỗi 120ms mỗi đá trong annulus; multiplier x1/x2/x4/x8 tại 10/25/50; decay combo 2.0s không graze; PERFECT SLING (đá quay ≥270° rồi fling giết ≥2 đá) = bonus ×tier + hitstop 80ms + flash trắng alpha 0.18 60ms + confetti particle 24 viên; viền màn phát sáng amber theo tier hiện tại.
• SPAWN DIRECTOR: độ khó D = 1 + t(s)/45; interval = clamp(1100 − 9D, 320) ms; pattern pool: RAIN / SPIRAL-2arms / BURST-8 / WALL-with-gap; mỗi 45s = boss 'TỪ BÃO' 3 phase (spiral dày, burst xen kẽ, wall thu hẹp gap) thưởng 1 nhịp thanh tẩy toàn màn.
• REPLAY & SHAKE & HITSTOP: đúng spec Iteration 2–3; replay render bằng cùng pipeline, alpha overlay 0.35.
• CODEBASE: IIFE 'use strict'; namespace const Engine/Input/Audio/FX/Game; không framework, không build step; mọi hằng số gom CONFIG object đầu file để tuning; comment tối thiểu, naming tự документ.

[DELIVERY] Xuất 1 file index.html hoàn chỉnh, tự mở test bằng checklist ACCEPTANCE, báo cáo PASS/FAIL từng mục.
```
