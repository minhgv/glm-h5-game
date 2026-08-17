# Song Sinh Neon (Neon Twins)

- **Ngày:** 2026-08-17
- **Genre:** Arcade One-Thumb Elastic-Tether Runner — người chơi không điều khiển nhân vật mà điều khiển NHỊP CĂNG sợi dây đàn hồi nối 2 orb bay qua đường hầm cổng neon, match-color gate, score-attack combo
- **Mô tả:** Hai orb song sinh lao qua đường hầm cổng neon nối bằng dây đàn hồi: giữ ngón tay để CO dây, thả để GIÃN — luồn đúng lỗ màu của từng orb, càng bay sát mép càng được thưởng Near-Miss x1.5 để combo nổ tung. Vòng lặp dopamine 8 giây: rủi ro càng cao, hitstop càng đã.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
MASTER PROMPT — SONG SINH NEON (H5 Arcade, 1-file, chuẩn Enterprise Arcade Studio)

=== PHẦN 0: /GOAL (STANDING GOAL) ===
/goal Xây dựng Song Sinh Neon — game H5 arcade one-thumb CHẤT THƯƠNG MẠI: 1 file index.html duy nhất mở trực tiếp bằng mobile browser, session 30s–5 phút, nhịp dopamine 8 giây/lần qua cơ chế risk-reward Near-Miss, đủ điều kiện commercial hoá (dùng làm playable ad, banner-safe zone, daily streak retention). Mọi quyết định kỹ thuật phục vụ 3 trụ: RESPONSIVE (input-to-photon dưới 1 frame), JUICE DÀY (hitstop, shake, procedural audio), ỔN ĐỊNH (60 FPS locked, 0 stutter, 0 allocation trong RAF). Đây là sản phẩm studio, KHÔNG PHẢI demo học sinh: không placeholder, không TODO, không asset ngoài. Cấm bàn giao khi chưa pass 8/8 checklist Acceptance ở Phần 2.

=== PHẦN 1: AUTONOMOUS ITERATION LOOP ===
Chạy tuần tự 3 iteration. Quy tắc tự trị: mỗi iteration gồm build -> self-test -> nếu bất kỳ mục nào FAIL thì sửa và lặp lại CHÍNH iteration đó (không được nhảy sang iteration kế), chỉ tiến khi iteration hiện tại 100% PASS.

ITERATION 1 — CORE ENGINE (nền móng):
- Canvas logic 1920x1080, scale theo devicePixelRatio (cap 2.0), letterbox giữ aspect 16:9, xử lý resize + safe-area inset notch.
- Fixed-step physics: accumulator pattern, SIM_DT = 1/120 giây, render interpolation bằng alpha; spiral-of-death guard (tối đa 5 step/frame, dư thời gian thì bỏ).
- Thực thể: 2 orb đối xứng qua trục tunnel nối bằng lò xo (spring tether), hệ gate gồm thanh bar với 2 lỗ màu cyan/magenta spawn theo khoảng cách.
- Input 1 thumb duy nhất: pointerdown = co dây, pointerup = giãn dây; desktop fallback Space/chuột; touch-action:none chống ghost-click 300ms, chống double-fire pointer.
- State machine dạng switch: BOOT -> MENU -> COUNTDOWN -> PLAY -> DYING(replay) -> RESULT; cấm dùng các flag boolean rời rạc.
- Collision: circle-vs-rect closest-point cho orb vs bar; chết khi orb chạm bar (lỗ sai màu hoặc thân bar).

ITERATION 2 — ENTERPRISE JUICE (hồn game):
- Particle pooling: 512 particle pre-allocate lúc boot, kết nối bằng free-list swap-deactivate; cấm toán tử new trong gameplay.
- Screen shake theo trauma model: shake = trauma mũ 2, decay 1.4/giây, offset = shake * 14px * noise; perfect pass +0.2 trauma, near-miss +0.45, death +1.0.
- Hitstop (đóng băng sim, render vẫn vẽ): perfect pass 40ms, near-miss 70ms, death 90ms.
- Procedural WebAudio 0-asset: audio context chỉ khởi tạo sau unlockAudio() tại pointerdown đầu tiên (autoplay policy); master chain: mọi nguồn -> DynamicsCompressor -> masterGain -> destination.
- Perfect pass = 1 note leo thang theo combo theo bảng tần số ở Phần 3; particle burst 16 hạt tại điểm cắt cổng; tether phát sáng theo độ căng thực (tăng glow width theo lực spring).
- Haptics nếu hỗ trợ: vibrate(10) perfect, vibrate(30) near-miss, vibrate([60,40,120]) death.

ITERATION 3 — ENTERPRISE HARDENING (bản lề thương mại):
- Visibility API: tab hidden -> pause sim + audio.suspend + dừng RAF; visible -> đếm ngược 3-2-1 rồi resume; test 10 lần switch không leak timer, không chồng âm.
- LocalStorage schema namespaced theo kiểu ssn.v1: best, lastScore, games, streak, muted; mọi truy cập bọc try/catch (private-mode safe), write throttle 1 lần/ván.
- Near-miss hitbox: hitbox dùng để ĐO near-miss bằng hitbox bar thu -20% kích thước, còn hitbox va chạm giữ nguyên 100% (đảm bảo chết là chết thật, chỉ việc đo độ gần là được nới).
- Instant Replay: ring buffer 120 frame-snapshot (mỗi snapshot: x,y của 2 orb + 8 gate gần nhất, lưu Float32Array pre-allocated); khi chết phát lại 1.2 giây ở tốc độ 0.25x với overlay tối 40%, sau đó mới hiện RESULT; tổng độ trễ từ frame va chạm đến khi replay chạy phải dưới 150ms.

=== PHẦN 2: ACCEPTANCE CRITERIA — NGHIỆM THU ENTERPRISE (in bảng PASS/FAIL từng mục) ===
1. Standalone 100%: mở qua file:// vẫn chạy đủ tính năng; 0 network request, 0 asset ngoài, 0 thư viện ngoài.
2. 60 FPS locked: RAF frame budget median dưới 12ms, p99 dưới 16.6ms; sim tách hoàn toàn khỏi render.
3. 0 GC allocation trong RAF: không có new / object literal / array literal / string concat trong vòng sim + render; audit từng hàm nóng + xác minh bằng heap snapshot trước/sau 5000 frame (delta dưới 0.1MB).
4. Input-to-photon dưới 1 frame: pointer event chỉ ghi vào input ring buffer, sim đọc ở step kế tiếp.
5. Audio chỉ khởi tạo sau user gesture; nút mute hoạt động và trạng thái lưu LocalStorage.
6. Tab switch 10 lần liên tục: không chồng tiếng, không tăng timer, không mất trạng thái ván.
7. Replay chết hiển thị dưới 150ms sau frame va chạm.
8. Readability: chơi 1 tay, chỉ nhìn silhouette + màu chức năng vẫn hiểu chuyện gì xảy ra (test: tắt glow vẫn phân biệt được orb A/orb B/bar).

=== PHẦN 3: TECHNICAL BLUEPRINT (Director spec — agent được tinh chỉnh số, không được đổi kiến trúc) ===
BẢNG MÀU: nền radial #070818 -> #0E1030, vignette tunnel #030309; Orb A #00F0FF core #EAFBFF; Orb B #FF2E88 core #FFF0F6; tether gradient cyan -> magenta vẽ composite operation lighter; gate bar viền neon 2px, thân trong suốt 12% alpha, lỗ cyan/magenta khớp màu orb; vàng combo #FFD166; đỏ nguy hiểm #FF4D4D; UI trắng 92%, font monospace tracking 0.2em.
VẬT LÝ: lò xo Hooke có damping dọc trục nối 2 orb: a = (-k * (L - L0) - c * vRel); k = 46 trên giây bình phương, c = 7.5 trên giây; L0 khi giữ = 64px, khi thả = 216px, chuyển L0 bằng easing 120ms; tốc độ tiến tunnel v = 300 px/s tăng +1.8% mỗi 500 điểm (cap 620 px/s); KHÔNG dùng gravity — độ khó đến từ tốc độ + khoảng cách gate; biên độ dao động 2 orb quanh trục = L/2 tạo đường sin kép tự nhiên.
SPAWN: khoảng cách gate 380px co về 260px theo hàm mượt theo score; vị trí lỗ đúng màu đổi bên bằng RNG mulberry32 seed từ performance.now lúc boot, kèm luật: không cho 2 lần đổi bên liên tiếp trong khoảng dưới 0.4 giây (tránh chuỗi impossible).
COMBO & SCORE: pass đúng +1 combo, điểm = ceil(100 * (1 + combo * 0.1)); NEAR-MISS (cách mép bar dưới 14px tính trên hitbox đã thu -20%) = +2 combo, hệ số điểm x1.5 trong 3 giây, stack tối đa x3 (tức tối đa 900 điểm/pass), kèm 24 hạt particle + trauma 0.45; va chạm = reset combo nhưng giữ score; BEST ghi ngay khi vượt qua LocalStorage.
SYNTH PRODEDURAL (WebAudio thuần): thang pentatonic Am [220.00, 261.63, 293.66, 329.63, 392.00] Hz nhân 2 mũ (floor(combo/5) mod 3) để leo octave; perfect pass: osc sawtooth qua lowpass sweep 2400Hz -> 320Hz trong 90ms, gain envelope attack 2ms decay 90ms; near-miss: thêm osc square 1 octave trên detune +7 cent; death: noise buffer 300ms + sine drop 180Hz -> 38Hz trong 450ms qua waveshaper; nhạc menu: kick sine 130 -> 40Hz mỗi 500ms + arp 16 bước định nghĩa bằng mảng tần số pre-computed; toàn bộ qua DynamicsCompressor threshold -18dB ratio 6 -> masterGain 0.8.
UI/UX: màn mở có vùng TO to (touch to start) kiêm unlockAudio; HUD: SCORE trái trên, COMBO giữa với scale pop 1.3x -> 1.0 trong 150ms khi tăng, BEST phải trên; chết: replay slow-mo -> bảng kết quả 3 số (Score / Combo max / Near-miss count) + nút Choi Lai chiếm 60% bề ngang đáy màn hình theo safe-area.

GIAO HÀNG: đúng 1 file index.html. Sau khi hoàn tất, agent tự chạy lại toàn bộ checklist Phần 2, in bảng PASS/FAIL 8 mục kèm số đo (frame time, heap delta, replay latency), và CHỈ bàn giao khi 8/8 PASS.
```
