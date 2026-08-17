# TRUYỀN SẤM

- **Ngày:** 2026-08-17
- **Genre:** Arcade One-Thumb Orbit-Slingshot — Push-Your-Luck Chain Runner
- **Mô tả:** Bạn là một tia sấm nối mạch giữa những đám mây bão: giữ ngón tay để neo vào quỹ đạo và nạp điện, buông ra để phóng vọt theo tiếp tuyến. Càng quay đủ vòng trước khi thả, hệ số nhân càng lớn — nhưng vành đai mây co hẹp dần: liều thêm một vòng hay thoát ngay?
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal
Xây dựng TRUYỀN SẤM — arcade H5 one-thumb chuẩn thương mại: người chơi là tia sấm truyền tải giữa các đám mây bão theo cơ chế orbit-slingshot push-your-luck. Mục tiêu Enterprise: hiểu gameplay trong 3 giây đầu, session 60–180 giây, chết là do lỗi người chơi (không phải lỗi engine), có thể gắn rewarded-ad-continue và skin sau này. Phân biệt 100% với game amateur: fixed-step physics, 0-allocation RAF, procedural audio 0-asset, juice đầy đủ, hardening production.

AUTONOMOUS ITERATION LOOP — agent tự lặp qua 3 giai đoạn. Mỗi giai đoạn KẾT THÚC BẮT BUỘC chạy checklist của nó; nếu fail → sửa code → chạy lại checklist (tối đa 5 vòng mỗi giai đoạn, nếu vẫn fail thì thu hẹp phạm vi rồi thử lại):

[ITERATION 1 — CORE ENGINE]
- 1 file HTML duy nhất, Canvas 2D, render target 1920x1080 logic-scale, HiDPI: canvas.width = css*dpr, ctx.setTransform(dpr,0,0,dpr,0,0).
- Fixed-step physics: accumulator, dt = 1/120s, semi-implicit Euler; render với interpolation alpha; clamp frame delta tối đa 100ms (anti spiral-of-death).
- Điều khiển 1-thumb: touchstart = latch vào mây gần nhất trong bán kính snap 260px → vào orbit; touchend = phóng theo vector tiếp tuyến. Có fallback chuột cho desktop.
- Camera scroll dọc vô hạn (bolt bốc lên), spawn mây procedural theo seed + difficulty ramp theo score.
- Vòng chơi: chết → màn kết → tap để restart < 400ms, không reload trang.
- CHECKLIST I: giữ-nhả mượt ở 60fps; góc phóng đúng tiếp tuyến (kiểm tra bằng debug vector); chết chỉ do va chạm thật.

[ITERATION 2 — ENTERPRISE JUICE]
- Particle pool 512 slot pre-allocated (mảng cố định + free-list, cấm new/literal trong frame); tia sấm vẽ bằng polyline zigzag procedural re-generate mỗi 40ms.
- Screen shake: trauma model, offset = maxAmp * trauma^2, decay 2.2/s, max 14px.
- Hitstop: freeze physics 70–90ms khi near-miss và khi va chạm chết.
- WebAudio 0-asset: unlockAudio() trên gesture đầu tiên (resume AudioContext trong handler); thunder = noise-buffer 1.2s qua biquad lowpass sweep; sub-bass sine sweep; tick orbit = thang ngũ cung tăng theo combo; compressor ở master bus.
- Trail gradient cho bolt, fake bloom bằng globalCompositeOperation = lighter.
- CHECKLIST II: không nghe thấy click/pop digital ở ranh giới buffer; juice không làm frame time vượt 16.9ms.

[ITERATION 3 — ENTERPRISE HARDENING]
- Visibility API: tab ẩn → pause loop + audioContext.suspend(); hiện lại → reset accumulator rồi resume (không delta-jump).
- LocalStorage versioned {v, best, runs, mute} bọc try/catch (chế độ private mode không crash).
- Near-miss system: hitbox tử thương thu 20% so với hình vẽ; vành đai 100%–125% kích hoạt CLOSE: +điểm ×multiplier, hitstop nhẹ, slow-mo 0.3s (timeScale 0.45 → 1 easing).
- Instant Replay: ring buffer 10 frame/s × 3 giây vị trí + trạng thái; khi chết, dựng lại chuỗi 1.5s cuối dưới dạng ghost fading rồi mới hiện màn kết — tổng độ trễ chết → replay hiển thị < 150ms.
- CHECKSHOT III: full acceptance bên dưới pass 100%.

ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu cuối):
1. Standalone 100%: đúng 1 file HTML, 0 asset bên ngoài, 0 network request, 0 webfont — mở trực tiếp qua file:// chạy đầy đủ.
2. 60 FPS locked trên thiết bị phổ thông: frame time p95 < 16.9ms, không có long-task > 50ms trong gameplay.
3. 0 garbage-collection allocation trong RAF: không new object, không closure, không array/string literal, không concat trong frame path — chỉ dùng pool + Float32Array/Int32Array pre-allocated; xác nhận bằng allocation breakpoint / Performance panel heap flat.
4. Input latency: xử lý trên touchstart (không đợi touchend), touch → phản hồi视觉 < 50ms.
5. Ổn định: không memory leak qua 10 lần restart (heap phẳng), audio tôn trọng autoplay-policy (im lặng cho đến gesture, mute hoạt động, không crash khi bị chặn).

TECHNICAL BLUEPRINT (agent tự do tinh chỉnh nhưng không hạ chuẩn):
- Bảng màu storm-dusk: nền dọc #050510 → #0B1026 → #141B3C + tinh vân radial tím #2B1055 alpha 0.25; mây an toàn gradient #7DE2FF → #3B82F6 viền trắng-lạnh; mây hazard #FF4D6D → #C9184A; bolt lõi #FFFFFF quấn #FFF7C2 → #FFD60A; vành near-miss #B14DED; UI chữ #E8F1FF.
- Công thức: vận tốc tự do 540 px/s (world-units theo chiều cao 1080); khi latch: chuyển hệ tọa độ cực, bán kính co r(t) = r0 * max(0.62, 1 − 0.14t); vận tốc góc ω = 2.6 * (1.35 ^ sốVòngĐủ) rad/s (mỗi vòng đủ tăng tốc quay — cảm giác nạp điện); phóng: v = tiếp tuyến * (620 + 180*sốVòngĐủ) px/s; gió ngang drift = 24*sin(t*0.7 + seedMây).
- Combo system: latch mây mới +1 streak; multiplier = 1 + 0.25*streak, cap 8x; số vòng đủ trước khi rời quyết định charge tier x1–x4 nhân vào điểm của cú phóng; chạm hazard/mất độ cao = reset streak; mỗi cú near-miss +2 điểm nền × multiplier.
- Spawning: khoảng cách mây 380–560 px dọc, lệch ngang ±320 px clamp trong playfield, tỷ lệ mây hazard 0.18 → 0.42 theo score; sét rod (chết ngay, đứng giữa 2 mây) xuất hiện từ score 300; bảo đảm luôn tồn tại ≥ 1 đường sống (solver kiểm tra trước khi lock layout).
- Synthesizer: master gain 0.8 → DynamicsCompressor; thunder = 1.2s white-noise buffer qua lowpass sweep 200→60Hz + gain exp-decay 0.9s, kèm sine sub 40→30Hz; tick orbit = ngũ cung [0,2,5,7,10] semitone trên nền A3: f = 220 * 2^(st/12), mỗi vòng đủ lên 1 bậc,共振 filter Q tăng theo multiplier; chết = sawtooth 110Hz pitch-down 0.4s + noise burst; UI click = square 660Hz 30ms; nhịp nền tăng tempo 100→140 BPM theo multiplier.
```
