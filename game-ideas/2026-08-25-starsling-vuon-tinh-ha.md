# Starsling: Vươn Tinh Hà

- **Ngày:** 2026-08-25
- **Genre:** Arcade One-Thumb Orbital Climber — giữ ngón tay để bám quỹ đạo ngôi sao, thả để văng theo tiếp tuyến; endless vertical, procedural audio, graze combo
- **Mô tả:** Một ngón tay, cả vũ trụ: hold để xoay quanh sao, release đúng khoảnh khắc để slingshot mình lên trời sâu. Mỗi lần bám là một nốt pentatonic vang lên — bạn vừa chơi, vừa soạn giao hưởng của riêng mình, và cú ngã chỉ là hợp âm kết.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
Bạn là LEAD ENGINEER kiêm GAME DIRECTOR của một studio arcade enterprise. Nhiệm vụ: TỰ TRỊ — tự lặp, tự audit, tự fix tới khi vượt toàn bộ checklist nghiệm thu. Không xin phép, không dừng giữa chừng, không tuyên bố hoàn thành sớm.

=== /goal (STANDING GOAL) ===
Ship STARSLING: VƯƠN TINH HÀ — arcade one-thumb orbital climber chuẩn thương mại, dạng 1 file index.html duy nhất, chạy 100% offline qua file://. Chuẩn enterprise nghĩa là: core loop gây nghiện trong 3 giây đầu tiên (hold = bám quỹ đạo, release = văng tiếp tuyến), session 90–120 giây, retention bằng best-score + deterministic seed để chia sẻ thử thách, juice/feel ngang sản phẩm studio publishing lớn. Phân biệt tuyệt đối với game sinh viên/amateur: zero asset ngoài, zero jank, zero dropped frame, zero leak — mọi chi tiết đều có chủ đích nghệ thuật và kỹ thuật.

=== AUTONOMOUS ITERATION LOOP (bắt buộc tuần tự) ===
Mỗi giai đoạn: PLAN (viết checklist nhỏ) → BUILD → SELF-AUDIT (chạy thật, đo thật). PASS mới được sang giai đoạn sau; FAIL → sửa rồi audit lại, tối đa 3 vòng mỗi giai đoạn, ghi rõ nguyên nhân fail vào chú thích nội bộ. Cấm declare done trước khi FINAL AUDIT toàn bộ pass.

[ITERATION 1 — CORE ENGINE]
- Canvas 1080×1920 design space, HiDPI: dpr = min(devicePixelRatio, 2), setTransform đúng 1 lần mỗi khung, xử lý resize/orientationchange an toàn, viewport meta chặn zoom/scroll.
- Fixed-step physics: dt = 1/120s, accumulator pattern, clamp frame delta ≤ 0.25s, render interpolation theo alpha; toàn bộ tọa độ dùng virtual unit độc lập DPI.
- Input 1-thumb thuần: pointer events duy nhất — pointerdown: snap vào sao gần nhất trong bán kính capture; pointerup: tangent release; input được xử lý ngay trong frame chạm (không đợi poll).
- Camera bám theo trục y (lerp 0.12), spawn sao bằng RNG mulberry32 có seed, seed hiển thị góc màn hình để chia sẻ.
- Định nghĩa DONE của vòng này: bay → bám → văng → chết (rơi khỏi màn dưới hoặc va asteroid) → chơi lại được trong 1 chạm.

[ITERATION 2 — ENTERPRISE JUICE]
- Particle pool 512 particle preallocate (TTL, alpha fade, reuse tuyệt đối); comet trail là ring buffer 60 điểm tái sử dụng.
- Screen shake hệ trauma: shake = trauma^2, offset ≤ 24px, roll ≤ 0.6 độ, decay 1.2/s; graze +0.3 trauma, death +1.0.
- Hitstop: freeze timescale 70ms khi perfect release, 90ms khi death.
- Procedural WebAudio 0-asset: graph master gain → compressor → destination; nhạc cụ = pluck (triangle, exponential decay) + sub sine thấp hơn 1 octave + noise-hat (AudioBuffer white-noise 0.5s sinh đúng 1 lần lúc boot); âm giai pentatonic minor gốc 110Hz với hệ số [1.000, 1.189, 1.335, 1.498, 1.782]; mỗi lần capture lên 1 bậc, wrap octave mỗi 5 bậc (tối đa +2 octave) — chơi càng hay, giai điệu càng cao; death = pitch sweep 400→60Hz trong 0.6s + noise crash; perfect release = nhảy quãng 5. unlockAudio: tạo/resume AudioContext tại pointerdown đầu tiên, mọi node preallocate và reuse, cấm new node trong gameplay loop.
- Combo system: graze asteroid (visual chạm nhưng hitbox không chạm) → +1 combo + note ghost; perfect release (góc thoát trong ±6 độ cửa sổ tối ưu hướng lên) → ×2 combo; combo decay sau 4s không capture; score = 100 × tier × 1.1^combo; floating text lấy từ pool, không tạo chuỗi mới trong RAF (preallocate template).

[ITERATION 3 — ENTERPRISE HARDENING]
- Visibility API: visibilitychange → pause toàn bộ loop + audio.suspend(); resume an toàn bằng cách bỏ frame delta lớn, không double-update.
- LocalStorage bọc try/catch: ss_best, ss_runs, ss_muted, ss_seed; nút mute hit-target ≥ 44px.
- Near-miss hitbox −20%: hitbox chết của player = 80% hình hiển thị → sống sót sát nút được thưởng graze (asteroid bị grazed nổ particle + trauma nhẹ, không chết) — tạo cảm giác may mắn cực đại.
- Instant Replay < 150ms: ring buffer 150 snapshot (x, y, angle, alive cho player + tối đa 64 entity); khi chết, replay 1.2s ở tốc 0.5× với vignette + nhãn REPLAY, khởi phát chậm nhất 2 frame sau death frame.

=== ENTERPRISE ACCEPTANCE CRITERIA (FINAL AUDIT — phải pass 100%) ===
1. Standalone 100%: mở trực tiếp bằng file:// không cần server; cấm fetch/XHR/CDN/import map/mọi network call.
2. 0 asset ngoài: không một file ảnh/font/audio/video nào; toàn bộ hình là vector canvas, toàn bộ âm thanh procedural WebAudio.
3. 60 FPS locked: debug overlay đo budget — physics ≤ 2ms, render ≤ 8ms, tổng frame ≤ 16.6ms; giữ ≥ 59fps liên tục 5 phút trên Chrome desktop và Android mid-range.
4. 0 garbage-collection allocation trong RAF: hot path (update + render) không new, không object/array literal, không closure, không concat chuỗi, không .map/.filter; pool mọi thứ; verify bằng Allocation Timeline 5 phút heap phẳng.
5. 1-thumb hoàn chỉnh: chơi trọn vẹn từ mở màn đến death screen chỉ bằng 1 pointer.
6. Robustness: double-tap zoom, pull-to-refresh, xoay ngang/dọc, background/foreground 20 lần liên tiếp — không leak AudioNode, không crash với seed bất kỳ.

=== TECHNICAL BLUEPRINT (được tinh chỉnh khi build, giữ nguyên tinh thần) ===
- Bảng màu: nền gradient dọc #05060f → #170b2b → #2a0f3d; sao theo tier vàng #ffd166 → cam #ff7b54 → xanh #4cc9f0; comet trail gradient #72efdd → #b892ff → #ff6b9d; UI trắng mờ rgba(255,255,255,.92); asteroid tím #9d4edd viền #f72585.
- Công thức: bán kính quỹ đạo r = clamp(khoảng cách, 90, 240); vận tốc góc omega = ±(v_in/r) × 1.15 (giữ chiều tiếp tuyến lúc vào); release v = omega × r, cap 1400 v.u/s; trọng lực 380 v.u/s² chỉ khi tự do; asteroid tự quay 0.8–2.2 rad/s.
- Spawning: 1 sao mỗi 280 v.u leo lên, lệch ngang ±360, đường chim bay luôn có ít nhất 1 sao trong tầm capture; tier tăng mỗi 1500 v.u; asteroid xuất hiện từ 1200 v.u với mật độ tỉ lệ log(tier).
- UX: mở màn chỉ có 1 nút chạm khổng lồ không chữ; HUD tối giản; death screen hiện score, best, seed, nút chơi lại to đạt chuẩn mobile.
- Codebase: 1 IIFE strict mode, 0 dependency, module hóa bằng object literal: Config, RNG, Input, Physics, Audio, FX, Replay, Storage, Loop.
```
