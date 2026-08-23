# CỰ ĐẢO: POLARITY RUSH

- **Ngày:** 2026-08-23
- **Genre:** Arcade Physics Dodger – One-thumb infinite vertical climber lai guidance-thuần-vật-lý: đảo cực +/- để bị HÚT hoặc bị ĐẨY bởi các node từ trường, đan mình qua giếng neon vô tận
- **Mô tả:** Bạn là một quả cầu mang điện tích duy nhất giữa giếng từ trường hỗn loạn: chạm 1 lần để đảo cực – trái dấu thì bị hút slingshot, cùng dấu thì bị đẩy né nguy hiểm. Càng 'cào râu' sát tử thần (graze) càng combo nổ, thời gian chậm lại và synth bậc thang lên theo mỗi chuỗi nghịch tử.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal – STANDING GOAL (Enterprise Arcade Studio):
Ship 1 tựa game H5 arcade THƯƠNG MẠI đạt chuẩn portal toàn cầu (Poki/CrazyGames/Yandex Games): load <2s trên 4G, hiểu cách chơi <10 giây, độ sâu mastery 50+ giờ, cơ chế IP độc quyền chưa có trên thị trường (Polarity-Slingshot Dodger). Phân biệt tuyệt đối với game amateur: không dùng asset có sẵn, không template tutorial, mọi juice được tính bằng công thức, mọi con số tunable nằm trong 1 bảng CONFIG. KPI nội bộ: D1 retention ≥35%, average session ≥4 phút, 'one more run' rate ≥3 run/liên tiếp. Agent phải tự đưa ra quyết định thiết kế khi thiếu thông tin, không dừng để hỏi.

=== AUTONOMOUS ITERATION LOOP (tự lặp, mỗi vòng: BUILD → SELF-VERIFY → GATE; fail gate thì refactor rồi mới sang vòng sau) ===

■ ITERATION 1 – CORE ENGINE:
- Canvas 1920×1080 HiDPI: width/height = cssSize × min(devicePixelRatio,2), ctx.setTransform(scale,0,0,scale,0,0); world units = 1080-height portrait-first, letterbox trên desktop.
- Fixed-step physics: accumulator, dt = 1/120s, SPIRAL-OF-DEATH guard (accumulator clamp ≤ 0.25s), render dùng interpolation alpha = acc/dt để vẽ smooth giữa 2 tick.
- 1-thumb input: touchstart/touchmove = điều khiển ngang quả cầu (targetX lerp), TAP ngắn (<180ms, di chuyển <12px) = ĐẢO CỰC +/-; mouse + Space làm fallback desktop.
- Core loop: giếng cuộn vô tận (camera scroll), spawn node từ trường +/-, quả cầu chịu lực Coulomb từ mọi node trong bán kính 520px.
- Gate 1: chơi được 60 giây liên tục, 60 FPS trên Chrome desktop, không lỗi tunnel xuyên node.

■ ITERATION 2 – ENTERPRISE JUICE:
- Particle pooling: 512 struct pre-allocated ở boot (typed-array-style free-list), 0 particle được tạo trong runtime; spawn = đổi chủ sở hữu slot.
- Screen shake theo mô hình trauma: offset = trauma² × 14px × noise, trauma decay 1.6/s; cộng 0.25 graze / 0.5 flip sát mặt / 1.0 death.
- Hitstop: timescale = 0.05 trong 70ms khi đạt mốc combo ×4 mỗi 16 graze; death freeze 90ms trước slow-mo.
- Procedural WebAudio 0-asset + unlockAudio: AudioContext resume ở gesture đầu tiên; master chain = compressor → destination. Bảng synth: (a) nhạc nền pad = 2 triangle 55Hz & 82.5Hz + LFO 0.1Hz quét lowpass 200–900Hz; (b) bậc thang combo = 2 saw detune ±7 cent qua lowpass 1800Hz Q=4, scale pentatonic A-minor [220.00, 261.63, 293.66, 329.63, 392.00], index = combo%5, +1 octave mỗi 16 combo; (c) graze = white-noise buffer loop qua bandpass 2200Hz Q=8, gain 0.25 decay 80ms; (d) flip = square 660→330Hz exponential ramp 70ms; (e) death = sub sine 110→40Hz 400ms + noise burst lowpass 500Hz.
- Trail ribbon 24 đoạn additive ('lighter'): cyan #00F0FF khi cực +, magenta #FF2E88 khi cực −, đổi màu snap trong 120ms kèm flash ring.
- Gate 2: 10 run tự playtest, 'cảm giác đã' ≥7/10; Allocation instrumentation trên RAF = 0 object mới.

■ ITERATION 3 – ENTERPRISE HARDENING:
- Visibility API: document.hidden → pause toàn bộ (dừng AudioContext.suspend, freeze accumulator); resume ramp time-scale 0→1 trong 600ms chống burst vật lý.
- LocalStorage (try/catch đầy đủ, versioned key 'cudao.v1'): best score, best combo, tổng run, top-10 local leaderboard, toggle audio/haptics (navigator.vibrate 15ms khi flip, 40ms death nếu được phép).
- Near-miss hitbox −20%: hitbox va chạm thực = 80% bán kính hiển thị của hazard (visual r=18 → collide r=14.4); band graze 14.4→46px; graze cho điểm nhưng va chạm thì chết → người chơi ĐƯỢC KHUYẾN KHÍCH bay sát.
- Instant Replay <150ms: ring buffer 180 frame (3s @60Hz) chứa {px,py,scroll,nodePos[]}; khi chết: phát replay 0.45× tốc độ với letterbox + tag 'INSTANT REPLAY', độ trễ khởi động đo được <150ms, replay xong mới hiện màn hình kết quả.
- Gate 3: chuyển tab 20 lần liên tục không lệch thời gian; replay mượt; mọi dữ liệu sống sót qua reload.

=== ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu bắt buộc) ===
1. Standalone 100%: 1 file HTML duy nhất, mở bằng file:// vẫn chạy đầy đủ; 0 request ngoài, 0 asset ngoài, 0 CDN, 0 font ngoài.
2. 60 FPS locked: frame budget tổng (logic + render) ≤12ms trên laptop trung cấp;建华 giảm tự động (tắt trail/particle 50%) nếu frame time >20ms kéo dài 30 frame.
3. 0 GC allocation trong RAF: không object/array literal, không closure tạo mới, không string concat, không array method trả về mảng mới (map/filter/slice); heap snapshot delta = 0 trên 1000 frame liên tiếp; mọi temp vector dùng module-scope tái sử dụng; UI text chỉ build khi dirty-flag bật.
4. Công bằng tuyệt đối: pattern spawn có seed, guaranteed-solvable (luôn tồn tại path ≥1.2× hitbox),难度 ramp theo công thức không theo độ hận.

=== TECHNICAL BLUEPRINT (định nghĩa chi tiết bởi Director) ===
• BẢNG MÀU: nền gradient dọc #05060F → #0B1030 → #1A0B2E; cực + cyan #00F0FF (glow shadowBlur 24), cực − magenta #FF2E88 (glow 24); spark vàng #FFD166; hazard đỏ #FF4D4D; UI trắng #F5F7FF alpha 0.92. Vignette radial 0→0.55 đen ở mép.
• CÔNG THỨC VẬT LÝ: F = k·q_player·q_node / max(r², r_min²) với k = 9×10⁴, r_min = 42px (softening chống vô định); a = F/m (m=1); drag v ×= (1 − 3.2·dt); speed cap |v| ≤ 780 px/s; player r = 14; sub-step khi |v|·dt > r_collide chống xuyên; camera scroll = 140 + min(t×3.5, 380) px/s. Node trái dấu hút (slingshot tăng tốc), cùng dấu đẩy (nhút nhát thoát hiểm) – flip đúng thời điểm là TOÀN BỘ kỹ năng.
• COMBO SYSTEM: graze event = +1 combo, +25 × mult điểm, combo timer refresh 2.5s (decay về 0 khi hết); mult = 1 + floor(combo/8), cap ×8; polarity streak (số flip liên tiếp không chết) mỗi flip +2% speed-run bonus, cap +40% – rủi ro cao thưởng cao; điểm baseline +10/giây sống + 2×scroll/100 mỗi node qua. Hiện floating text '+25 ×4' chỉ khi dirty (pool 16 label tái sử dụng).
• ĐỘ KHÓ: density node = 6 + floor(t/12), cap 14 node màn hình; tỉ lệ node đỏ (hazard thuần) 12% → 30%; mỗi 45s một 'SURGE' 8s: scroll ×1.35, nhạc +1 octave, nền gradient lật màu.
• JUICE ĐỊNH LƯỜNG: hitstop 70ms (mốc combo), 90ms (death); trauma table ở trên; graze spark 6 hạt/patch, death burst 48 hạt; chromatic aberration offset 2px trong 120ms sau flip (vẽ 2 layer lệch alpha 0.35).
• MONETIZATION HOOKS (chuẩn thương mại, không phá trải nghiệm): 'Second Wind' revive 1 lần/run bằng rewarded-ad hoặc giữ combo; interstitial sau run thứ 3, cooldown 180s; cosmetic trail unlock theo mốc combo (×2,×4,×8) – chuyển đổi sang IAP skin sau khi KPI chứng minh.
• CẤU TRÚC CODE: IIFE strict mode; CONFIG = object đông lạnh mọi hằng số tunable; các module tên: Engine(timing), Input, Physics, Spawner, Render, Audio, JuiceFX, Replay, Store, Game FSM (BOOT→MENU→RUN→REPLAY→DEAD→RUN).
```
