# Lượn Sóng Neon

- **Ngày:** 2026-08-20
- **Genre:** H5 Arcade Skill-Ribbon (Hyper-Casual): điều khiển gián tiếp one-thumb bằng mô hình lò xo giảm chấn — ngón tay kéo điểm neo, con tàu quất như con diều với dải ribbon verlet, luồn qua cổng neon procedural, graze near-miss nuôi combo thang bát âm và Surge time-dilation.
- **Mô tả:** Ngón tay của bạn KHÔNG điều khiển con tàu — nó điều khiển điểm neo khiến tàu lao vút, giật ngược và quất qua các khe cổng neon như con diều trong bão. Càng sát mép hiểm họa càng graze càng đã: cao độ nhạc leo thang theo combo, thời gian chậm lại khi Surge bùng nổ, và khoảnh khắc chết được phát lại ngay tức thì như replay thể thao — vòng lặp thử thách-ghiền có một không hai trên H5.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
MASTER PROMPT — LƯỢN SÓNG NEON — H5 Arcade một-file, chuẩn Enterprise Arcade Studio. Đọc toàn bộ, tuân thủ /goal, thực hiện đúng Vòng Lặp Tự Trị, chỉ bàn giao khi pass 100% Acceptance Criteria.

/goal (STANDING GOAL)
Xây dựng thương phẩm arcade THƯƠNG MẠI HOÁ ĐƯỢC (premium hyper-casual), phân biệt tuyệt đối với game amateur: (1) gameplay one-thumb có chiều sâu kỹ năng 30 giây đến 5 phút mỗi run, dễ học khó mastered; (2) juice mức studio: particle, screen shake, hitstop, âm thanh tổng hợp procedural, instant replay; (3) kỹ thuật production: fixed-step deterministic physics, frame loop zero-allocation, tự pause theo tab, persistence; (4) móc sẵn hook thương mại: stub adBreak(type) cho interstitial/rewarded và track(event) cho analytics — no-op, zero network; (5) giao đúng MỘT file index.html, chạy offline qua file://, UI tiếng Việt, font hệ thống.

AUTONOMOUS ITERATION LOOP — thực hiện tuần tự 3 vòng; mỗi vòng kết thúc bằng VERIFICATION GATE; nếu fail thì sửa và chạy lại gate (tối đa 3 lượt remediation mỗi vòng) trước khi sang vòng kế. Không được gộp vòng, không được bỏ gate.

ITERATION 1 — CORE ENGINE (nền móng, chưa cần đẹp):
- Canvas 1920×1080 logical (1080p), fit letterbox mọi tỉ lệ màn hình, DPR = min(devicePixelRatio, 2) cho HiDPI; ctx = getContext với alpha:false, desynchronized:true.
- Game loop: requestAnimationFrame + accumulator; FIXED-STEP PHYSICS dt = 1/120 giây, clamp frame 250ms; render nội suy với alpha = acc/dt; tách tuyệt đối update() (logic, 120Hz) và render() (vẽ, theo RAF).
- 1-THUMB TOUCH: hợp nhất pointerdown/move/up (chuột + cảm ứng); anchor = vị trí ngón trừ 90px theo trục Y để ngón không che tàu; dead-zone 8px. Con tàu là điểm đuổi anchor bằng LÒ XO GIẢM CHẤN: a = -k·(p − anchor) − c·v, với k = 140 s^-2, c = 14 s^-1 (ζ = c/(2·√k) ≈ 0.59 — underdamped, cảm giác quất diều), clamp tốc độ 2400 px/s; nén mép màn hình với restitution 0.35.
- Dải ribbon (thân tàu): chuỗi verlet 14 đốt: p_new = 2p − p_prev + a·dt²; 3 lượt relaxation ràng buộc chiều dài đốt 14px; vẽ line-strip gradient theo combo.
- Spawner cổng procedural có seed (seed = floor(runStartTime·1000), lưu cho replay): tốc độ cuộn 420 px/s, +9 px/s mỗi 10s, cap 980; khe cổng 320px thu về 190px tại t = 180s bằng smoothstep; mật độ gai hazard 12% → 38%.
- State machine: BOOT → MENU → RUN → DEATH → REPLAY → RESULT; restart ≤ 100ms.
- VERIFICATION GATE 1: bot auto-chạy 5 phút: giữ 60 FPS, tàu luôn hợp lệ trong màn, va chạm circle-vs-AABB chính xác, console sạch lỗi.

ITERATION 2 — ENTERPRISE JUICE (lớp cảm xúc thương mại):
- PARTICLE POOLING: 512 particle pre-allocate theo struct-of-arrays (Float32Array x, y, vx, vy, life, maxLife, size, hue); emit zero-allocation; sprite glow pre-bake MỘT LẦN lúc boot lên offscreen canvas rồi drawImage; batch với globalCompositeOperation = lighter.
- SCREEN SHAKE hệ trauma: offset = trauma² × 18px, decay 1.6/s, dùng bảng sin pre-compute (không Math.random trong render); gate pass +0.15, graze +0.25, chết +1.0; cộng thêm micro-rotation ±0.6°.
- HITSTOP: chết = đóng băng 90ms (trừ shake); graze cực sát (dưới 6px) = micro-freeze 45ms.
- PROCEDURAL WEBAUDIO 0-ASSET + unlockAudio: khởi tạo AudioContext ở pointerdown ĐẦU TIÊN (ctx.resume), master chain = compressor → gain 0.8 → destination. Bảng synth: (a) gate pass = sawtooth qua lowpass sweep 300 → 3200 Hz trong 60ms, envelope A 3ms / D 120ms; (b) graze = sine blip, cao độ lấy thang A-minor pentatonic [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33] tại nốt scale[min(combo, 7)] — combo càng cao nhạc càng leo; (c) chết = noise buffer 0.4s qua bandpass sweep 180 → 60 Hz + sine sub 55 Hz thump gain 0.9; (d) Surge = 2 osc detune leo thang + noise riser 0.8s; (e) UI tick = square 880 Hz / 20ms. Mọi envelope qua setTargetAtTime/linearRamp (KHÔNG setTimeout); node tái dùng từ pool; noise buffer tạo 1 lần; giới hạn 32 node đồng thời, vượt thì drop sự kiện thấp ưu tiên.
- Score popup pool + DIGIT ATLAS: pre-render chữ số 0-9 lên offscreen canvas, vẽ điểm bằng drawImage — không string-concat trong RAF.
- Nền parallax 3 lớp sao pooled wrap-around + nebula gradient cache một lần (không tạo CanvasGradient trong frame loop).
- VERIFICATION GATE 2: stress test 200 particle + shake + graze liên tục: frame p95 ≤ 16.9ms, không glitch audio, heap snapshot 3 run liên tiếp không tăng đáng kể.

ITERATION 3 — ENTERPRISE HARDENING (bền vững sản phẩm):
- VISIBILITY API: document visibilitychange + window blur → pause tức thì (đóng băng accumulator, mute master gain, overlay TAP ĐỂ TIẾP TỤC); resume gán lại lastTime = performance.now() để chống spiral of death. Tab ẩn 10 phút: RAM đứng yên, không tiếng.
- LOCALSTORAGE: key 'luon-song-neon/v1', JSON { best, runs, grazeTotal, maxCombo, sound } — đọc/ghi bọc try/catch (quota/blocked), fallback biến in-memory.
- NEAR-MISS HITBOX −20%: hitbox va chạm = 0.8 × bán kính thị giác; vành graze 1.0–1.25 × bán kính kích hoạt near-miss (+5 điểm, combo +1, surge meter +12%); so khoảng cách bằng squared-distance, cấm sqrt trong hot path.
- INSTANT REPLAY < 150ms: ring buffer Float32Array(720) lưu (x, y) @ 120Hz × 3 giây + mảng Byte đánh dấu sự kiện; khi chết: hitstop 90ms → NGAY LẬP TỨC phát lại 3s ở timeScale 0.5 với ghost mờ, camera tĩnh → hiện RESULT; tổng từ chết đến replay hiển thị ≤ 150ms.
- FPS GOVERNOR: nếu trung bình frame > 17.5ms trong 60 frame → tự hạ particle budget 50%, tiếp tục → tắt glow layer (graceful degradation, người chơi không nhận ra).
- VERIFICATION GATE 3: pass 100% checklist nghiệm thu dưới đây.

ENTERPRISE ACCEPTANCE CRITERIA (điều kiện bàn giao — pass tất cả hoặc không bàn giao):
A1. STANDALONE 100%: một file index.html duy nhất, chạy trực tiếp qua file://, bật DevTools offline/block-all-requests vẫn full tính năng.
A2. 0 ASSET NGOÀI: không ảnh, không font ngoài (system-ui stack), không CDN, không import — mọi hình/âm vẽ và tổng hợp runtime.
A3. 60 FPS LOCKED: đo performance.now() trong bot-run 5 phút — ≥ 99% frame < 16.9ms trên profile CPU throttle 4× (máy trung cấp).
A4. 0 GC ALLOCATION TRONG RAF: không new object/array/closure/string-concat trong frame loop; xác minh bằng 3 heap snapshot liên tiếp, delta ≤ 0.1%.
A5. Touch-to-render latency ≤ 1 frame; restart ≤ 100ms; chết → replay hiển thị ≤ 150ms.
A6. Deterministic: cùng seed spawner → cùng chuỗi cổng (phục vụ replay và kiểm chứng).
A7. Tab pause/resume không bug vật lý, không mất âm, không tụt pin nền.
A8. Code chuẩn: strict mode, mọi hằng số trong CONFIG object đầu file, không dead code, không console.log trong bản final.

TECHNICAL BLUEPRINT (giá trị khởi đầu authoritative — được tinh chỉnh ±15% nếu có rationale hiệu năng/cảm giác, ghi chú lý do):
1. PALETTE: nền dọc 3 stop #050510 → #1a0b2e → #0d1b3e; cổng an toàn gradient #00f5ff → #0088ff; gai hazard #ff2d78; lõi tàu #ffffff glow additive; ribbon HSL hue chạy 190 → 310 theo combo; UI chữ #e8f6ff, accent điểm #ffd23f.
2. VẬT LÝ: toàn bộ như Iteration 1 (spring k=140, c=14, dt=1/120, semi-implicit Euler: v += a·dt rồi p += v·dt; verlet ribbon 14 đốt, 3 relaxation passes).
3. DIFFICULTY: D(t) = smoothstep(t / 180) điều biến đồng thời speed 420→980 và gap 320→190; hazard density 0.12 → 0.38; đảm bảo 3 giây đầu luôn an toàn tuyệt đối (onboarding).
4. COMBO & SURGE: combo +1 mỗi cổng vượt/graze; cửa sổ decay 4 giây reset về 0; multiplier = 1 + floor(combo/5), cap 8×; surge meter +12% mỗi graze (~8–9 graze là đầy → nhịp bùng ~45–60s); Surge 5 giây: timeScale 0.55, điểm ×2, ribbon 7 màu, thêm layer pad nhạc — sau đó meter về 0 và cooldown 10s.
5. AUDIO: chỉ tổng hợp, tần số như bảng Iteration 2; music bed = drone 55 Hz + fifth 82.4 Hz gain 0.05 chạy suốt run.
6. RENDER ORDER: nebula → sao 3 lớp → cổng → ribbon → tàu → particle (lighter) → shake transform → UI.
7. TEXT: mọi số vẽ bằng digit atlas; chuỗi UI nằm trong string table VI (có cấu trúc sẵn EN) cho i18n.
8. ENTERPRISE HOOKS: stub adBreak(type) gọi trước RESULT (chỗ chèn interstitial) và track(event, data) no-op — đánh dấu comment chèn SDK sau; không thu thập PII, GDPR-safe.
9. UX FLOW: BOOT (nền tối, TAP ĐỂ BẮT ĐẦU — chờ gesture mở audio) → MENU (best score, hướng dẫn 1 dòng: KÉO ĐỂ LƯỚN) → RUN → DEATH → REPLAY → RESULT (điểm, best, max combo, tổng graze) → tap anywhere restart ≤ 100ms.
10. SELF-REVIEW CUỐI: đọc lại toàn bộ file, xóa mọi thứ không phục vụ criteria, chạy tay 3 lần mỗi gate, xác nhận A1–A8 trước khi xuất bản.
```
