# Hồi Âm Vực Thẳm (Echo Abyss)

- **Ngày:** 2026-08-24
- **Genre:** H5 Arcade Survival Ascent 1-thumb — cơ chế Sonar-Reveal: giữ ngón tay để bơi lên, chạm nhẹ để phát sóng âm soi sáng thế giới nhưng đồng thời đánh thức các thợ săn; né trong bóng tối để nuôi combo Adrenaline
- **Mô tả:** Bạn là một sinh vật phát sáng trồi lên từ vực thẳm chìm trong bóng tối tuyệt đối — mỗi cú ping soi rõ hang động cũng là tiếng gọi bầy thợ săn lao đến. Sự căng thẳng giữa MUỐN NHÌN và KHÔNG DÁM NGHE chính là chất gây nghiện: lướt qua tử thần trong bóng tối để nuôi Blind Streak, đầy Adrenaline rồi tung Lantern Burst phơi bày cả biển sâu.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
=== MASTER PROMPT — HỒI ÂM VỰC THẲM (ECHO ABYSS) ===

/GOAL — STANDING GOAL (CHUẨN ENTERPRISE ARCADE STUDIO)
Ship một tựa H5 Arcade Survival Ascent thương mại hoá được: 1 file HTML standalone, 0 asset ngoài, 0 dependency, 60 FPS locked trên Chrome Android mid-range 2018, giữ người chơi bằng vòng lặp risk/reward PING → BLIND-DODGE → LANTERN BURST. KPI nội bộ: D1 retention ≥ 35%, phiên chơi trung bình ≥ 6 phút, restart latency < 150ms. Thanh chất lượng: không chấp nhận bất kỳ dấu hiệu amateur (không placeholder art, không console warning, không frame spike, không màn hình chết).

VÒNG LẶP TỰ TRỊ — AUTONOMOUS ITERATION LOOP
Nguyên tắc vận hành: BUILD → MEASURE → GATE. Chỉ được sang iteration kế khi GATE hiện tại toàn xanh. Nếu FAIL: tối đa 3 nhánh sửa lỗi, vượt ngưỡng thì dừng và viết root-cause report.

[ITERATION 1 — CORE ENGINE: BÓNG TỐI CHẠY ĐƯỢC]
- Một file index.html duy nhất (inline CSS+JS, strict mode, no eval, CSP-safe, chạy trực tiếp qua file://).
- Canvas 1080p HiDPI portrait-first: logical 1080×1920, backing store = min(devicePixelRatio, 2), aspect-fit letterbox, tôn trọng safe-area inset, snap lưới pixel 3px chống nhòe.
- Game loop: RAF + accumulator fixed-step SIM 120 Hz, semi-implicit Euler, render interpolation theo alpha, spiral-guard max 5 substeps, clamp dt 50ms.
- Input 1-thumb: pointerdown = bắt đầu hold (thrust bơi lên), pointerup = kết thúc; nếu duration < 180ms thì tính là PING; lock pointer đầu tiên, bỏ multi-touch.
- Thế giới: hang động procedural bằng value-noise 2 tầng từ mulberry32(seed) — cùng seed cho cùng hang (deterministic, nền tảng Daily Challenge thương mại).
- Entities: Player (đèn sinh học), Jelly (trôi sin), Angler (mồi sáng + lunge), Leviathan (rắn đa đốt, chỉ xuất hiện sau 800m, telegraph bằng heartbeat).
- HUD: depth, best, combo, adrenaline ring; debug overlay (FPS, sim ms, pool usage, hitbox) bật bằng phím D.
- GATE 1: 60 FPS trên desktop + 4× CPU throttle DevTools; deterministic cùng seed; 0 console error; chơi 3 phút không crash.

[ITERATION 2 — ENTERPRISE JUICE: CẢM GIÁC AAA TRONG 12MS]
- unlockAudio() ở gesture đầu tiên (ctx.resume + silent-buffer trick cho iOS); master chain: masterGain 0.8 → DynamicsCompressor(threshold −18dB, ratio 6) → destination; mọi node one-shot disconnect onended, ≤ 64 node sống đồng thời.
- Synth 0-asset theo bảng tần số ở Blueprint: sonar ping sweep + feedback delay, heartbeat theo proximity, thrust bubble loop, near-miss whoosh, combo chime pentatonic, death sub-drop, lantern arpeggio.
- Particle pooling SoA Float32Array + free-list swap-remove; bubble trail theo thrust; plankton parallax 3 lớp; ping wavefront vẽ ring stroke nở dần; vignette tối dần theo depth.
- Screen shake hệ trauma: shake = trauma², decay 1.8/s, max offset 26px, rotation ≤ 0.035 rad. Hitstop: 55ms khi near-miss, 240ms khi death (timeScale = 0, vẫn render khung hình).
- GATE 2: budget sim ≤ 3ms + render ≤ 6ms @ 1080p; đủ 8 loại feedback nghe/nhìn rõ ràng; 0 allocation mới trong RAF (audit bằng allocation timeline).

[ITERATION 3 — ENTERPRISE HARDENING: SẴN SÀNG SHIP]
- Visibility API: tab blur → pause loop + suspend audio + reset trauma; focus → resync timestamp, không dt spike nhờ clamp 50ms.
- LocalStorage schema v1 (best depth, số lần chơi, settings, daily seed cache) bọc try/catch quota guard; nút reset data ở màn TITLE.
- Near-miss hitbox −20%: va chạm thực dùng 0.8×radius; band near-miss 0.8×–1.35×radius; verify bằng debug hitbox overlay.
- Instant Replay: ring buffer 600 mẫu (10s @ 60 Hz, SoA); death → hitstop 240ms → replay 2 giây cuối ở tốc 0.45× với ghost-trail, BẮT ĐẦU ≤ 150ms sau tử vong; tap để skip; restart warm < 150ms.
- Soak test 5 phút: heap delta = 0 MB; không string concat trong RAF (cache chuỗi sẵn); không literal object/array trong hot path; mọi sự kiện dùng event pooling.
- GATE 3: checklist nghiệm thu bên dưới toàn bộ PASS.

TECHNICAL BLUEPRINT
1) BẢNG MÀU (lerp per-channel qua dải chuyển 200m giữa các zone): Midnight 0–1500m nền #071B33→#020A14, accent #4DF3E6; Abyssal 1500–3000m nền #0B1030→#050518, accent #7A6CFF; Hadal 3000m+ nền #17081F→#000000, accent #FF3D5A. Player core #E8FFFB, halo radial #4DF3E6→transparent; lantern gold #FFC94D; danger #FF3D5A; text #DCEEF7. Nền mỗi zone pre-render lên offscreen canvas một lần — tuyệt đối không tạo gradient trong RAF.
2) VẬT LÝ (đơn vị px, s): dt = 1/120; gravity 1450 px/s²; thrust khi hold 2600 px/s²; drag v *= exp(−3.1·dt) → terminal ≈ ±620 px/s; auto-weave ngang x = cx + 90·sin(1.7t); ping wavefront r = 900·t px, lifetime 1.9s, alpha tuyến tính theo tuổi; Angler lunge: accel 4200 px/s² trong 0.35s, cooldown 1.6s; aggro sau ping: +65% speed trong 2.2s cho mọi predator trong bán kính 900px; camera smoothing exp k = 8.
3) AUDIO SYNTH (0 asset, tất cả WebAudio): sonar ping = sine sweep 880→220 Hz trong 0.42s (ADSR A=5ms D=0.4s R=80ms) + feedback delay 0.28s, feedback 0.35, wet 0.25; heartbeat = triangle 52 Hz double-thump, tempo 88→140 BPM khi predator < 420px; thrust = noise bandpass 600 Hz Q=1.2 gain 0.05 loop khi hold; near-miss whoosh = noise highpass sweep 300→2400 Hz 0.18s; combo chime = pentatonic [523.25, 587.33, 659.25, 783.99, 880, 1046.5] Hz, index = min(combo,5), kèm partial ×2 ở −12dB; death = sawtooth 110→30 Hz 0.6s + noise burst lowpass 400 Hz; lantern arpeggio = 660/880/1320 Hz bell (sine fundamental + sine ×2.76 −12dB).
4) COMBO SYSTEM — BLIND STREAK & ADRENALINE: near-miss (band 0.8×–1.35×radius và KHÔNG ping trong 1.5s trước đó) → combo +1, window làm mới 4s; multiplier = 1 + floor(combo/3), cap ×8; Adrenaline +9% mỗi near-miss, decay −4%/s, đầy 100% → LANTERN BURST: full-reveal 1.4s + stun mọi predator 1.2s + KHÔNG gây aggro. Score = depth(m) × multiplier + nearMiss × 25 × multiplier. Đây là vòng lặp dopamine: ping an toàn điểm thấp, mù lòe né hiểm điểm cao.
5) SPAWN DIRECTOR (đường cong khó retention): intensity I = clamp(0.5 + depth/4000, 0.5, 2.2) × (0.9 + 0.1·sin(elapsed/60)); spawn gap = 520/I px theo depth; tỉ lệ Jelly 55 / Angler 35 / Leviathan 10; mỗi 300m một gate wall hẹp bắt buộc line-choke — nông trại near-miss có kiểm soát, thưởng variable-ratio.
6) POOLING & MEMORY: bubbles 256, plankton 512, sparks 384, predators 24, pings 8, replay 600 mẫu; mọi pool là Structure-of-Arrays Float32Array + free-list stack, huỷ bằng swap-remove; ZERO allocation sau khi boot xong.
7) GAME STATES: BOOT → TITLE → RUN → PAUSED → DEATH → REPLAY → TITLE; mọi chuyển đổi warm < 150ms; i18n VI/EN string table tĩnh; toggle Reduce Motion (tắt shake/flash cho accessibility).

ACCEPTANCE CRITERIA — NGHIỆM THU ENTERPRISE (checklist tự động, PASS/FAIL kèm số đo)
1. Standalone 100%: đúng 1 file, chạy trực tiếp file://, 0 network request, 0 dependency.
2. 0 asset ngoài: font system stack, art 100% canvas procedural, audio 100% WebAudio synth.
3. 60 FPS locked: 1080p HiDPI, p95 frame ≤ 16.7ms, tỉ lệ jank frame (>33ms) < 0.5% trên máy tham chiếu.
4. 0 GC allocation trong RAF: heap delta = 0 MB sau soak 5 phút (DevTools allocation timeline).
5. Input→photon < 50ms; audio unlock ngay ở gesture đầu tiên (kể cả iOS silent switch path).
6. Tab blur → pause trong ≤ 1 frame; resume không spike (dt clamp 50ms đã verify).
7. Restart warm < 150ms; replay bắt đầu ≤ 150ms sau death; near-miss hitbox −20% verify bằng debug overlay.
8. Deterministic: cùng seed cho cùng hang động; 0 console error/warning; strict mode pass toàn bộ.

AGENT OPERATING RULES
Kết thúc mỗi iteration bằng bảng tự kiểm (PASS/FAIL + số đo cụ thể). Không sang giai đoạn sau khi còn FAIL. Sau 3 lần sửa vẫn FAIL: viết root-cause report rồi dừng. Thứ tự ưu tiên xoay vòng: correctness → performance → juice.
```
