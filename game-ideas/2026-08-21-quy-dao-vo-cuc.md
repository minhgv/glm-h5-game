# Quỹ Đạo Vô Cực

- **Ngày:** 2026-08-21
- **Genre:** Arcade Orbital Survival 1-thumb (hold/release) — physics quán tính quỹ đạo + graze-to-score + rhythm survival
- **Mô tả:** Giữ ngón tay để xoắn spiral vào lõi phát sáng, thả ra để văng ra ngoài — càng gần lõi quay càng điên loạn theo bảo toàn mômen động lượng, và càng lướt SÁT thiên thạch thì combo nhân điểm càng khủng. Một ngón tay, một phản xạ tim đập, nghìn lượt 'chơi thêm lần nữa'.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — STANDING GOAL (Enterprise Arcade Game Studio)
Xây dựng 'Quỹ Đạo Vô Cực': game arcade H5 THƯƠNG MẠI, ship thành 1 file index.html standalone duy nhất, mở là chơi < 1 giây, session 45-90s, nhắm D1 retention >= 40%, chạy mượt trên Android 2GB RAM màn 360px. Phân định tuyệt đối với game amateur: có juice pipeline (pool-shake-hitstop), audio procedural 0-asset, GC-discipline, pause/replay/persistence đầy đủ. Không server, không asset ngoài, không font ngoài.

=== GAME SPEC ===
- Input duy nhất: GIỮ (pointerdown) = phanh ly tâm, r giảm, xoắn vào lõi; THẢ (pointerup) = trôi ra ngoài. Người chơi điều khiển BÁN KÍNH, tốc độ góc là hệ quả vật lý.
- Người chơi = sao chổi tím bay quanh lõi vàng tại tâm màn hình; thu stardust (vàng), né thiên thạch (magenta) và Xung Lõi — sóng xung kích tròn phóng theo đúng nhịp BPM nhạc nền.
- Cảm giác cốt lõi (CORE FEEL): bảo toàn mômen động lượng L — thu hẹp bán kính thì quay KHẤN GOÁNG nhanh (săn điểm sát lõi = nguy hiểm hơn, điểm nhân cao hơn). Risk-reward thuần túy vật lý.
- GRAZE TO SURVIVE: lướt qua vùng sáng quanh hazard mà không chạm hitbox chết -> tăng HEAT. Heat decay 2.0/s buộc người chơi phải liên tục mạo hiểm. Heat đầy 12 -> double-tap kích hoạt SIÊU TÂN: hitstop 250ms, đảo gradient nền, mọi hazard trên màn nổ thành stardust.
- Chết: va chạm thật -> shatter 64 hạt + Instant Replay 150ms + về menu trong 2s, loop lại ngay (F5 não: 'lượt này graze nhiều hơn').
- Meta nhẹ: daily seed (mỗi ngày một timeline thiên thạch giống nhau cho mọi người — so điểm bạn bè), best score, mute, số lượt chơi.

=== VÒNG LẶP TỰ TRỊ — AUTONOMOUS ITERATION LOOP ===
Nguyên tắc: làm XONG từng vòng, tự kiểm tra DoD (Definition of Done) trước khi sang vòng sau. Fail mục nào -> sửa NGAY trong vòng đó, KHÔNG được mang nợ sang vòng mới. Sau mỗi vòng: mở Debug Overlay (phím ~) tự đo, tick checklist, rồi mới tiếp tục.

-- VÒNG 1: CORE ENGINE (gameplay trần, chưa đẹp) --
1. Canvas nội bộ 1080x1920, DPR clamp [1, 2.5], letterbox scale-to-fit giữ tỉ lệ, ctx = { alpha: false, desynchronized: true }. Lõi tại (540, 960).
2. Fixed-step physics: accumulator pattern, SIM_DT = 1/120s, render interpolation alpha = acc/SIM_DT, spiral-of-death guard (max 5 substep/frame, phần dư bị vứt).
3. 1-thumb chuẩn: một cặp pointerdown/pointerup duy nhất ăn toàn màn hình, touch-action:none, chặn contextmenu/select/zoom cử chỉ, hit-test không cần tọa độ.
4. Vật lý quỹ đạo (đơn vị px trong không gian 1080x1920): giữ -> r -= 260*dt; thả -> r += 200*dt; clamp r trong [120, 880]; bảo toàn L: omega = L / r^2 với L = 5.0e5 px^2/s (tự hiệu chỉnh để lap tại r=400 ~ 2s, tại r=200 ~ 0.5s, clamp omega <= 14 rad/s). Vị trí: angle += omega*dt; x = 540 + r*cos, y = 960 + r*sin.
5. Spawner director theo seeded RNG (mulberry32, seed = FNV-1a của chuỗi YYYYMMDD): BPM 100 -> 180 theo elapsed, mật độ hazard ti lệ elapsed^0.85, quy tắc anti-cluster: không quá 2 hazard trong cung 60 độ cùng dải bán kính -> luôn tồn tại path sống.
6. Render primitive: nền 3 lớp sao parallax precomputed, lõi pulse scale theo beat, comet + trail ring-buffer 24 điểm, hazard tròn magenta, stardust vàng, sóng xung lõi là vòng tròn nở dần.
7. Va chạm circle-circle trong substep 1/120 (swept nhờ bước nhỏ).
DoD V1: chạy 10 phút không crash; đổi r không bị 'nhảy' vị trí; tắt interpolation phải THẤY rõ stutter (chứng minh interpolation sống); timeline replay được giống nhau khi dùng cùng seed.

-- VÒNG 2: ENTERPRISE JUICE (nghiện thị giác + thính giác) --
1. PARTICLE POOLING: pool 512 hạt preallocated kiểu structure-of-arrays (Float32Array x, y, vx, vy, life, maxLife, size, colorIndex) + con trỏ vòng recycle. Tuyệt đối KHÔNG new trong loop. Trail comet cũng là ring buffer fixed.
2. SCREEN SHAKE kiểu trauma: shake = trauma^2; trauma decay 1.6/s; offset = shake * 18px * noise(-1..1); rotate canvas = shake * 0.015 rad. Graze +0.15, chết = 1.0, siêu tân = 0.7. Shake áp vào world-space, KHÔNG áp vào UI.
3. HITSTOP: timescale = 0 trong 60ms (graze lớn) / 120ms (siêu tân charge) / 250ms (chết); hitstop chỉ đóng băng physics, particle tia sáng vẫn chạy (đắt giá hơn nhiều).
4. PROCEDURAL WEBAUDIO 0-ASSET: AudioContext tạo + unlock tại pointerdown đầu tiên (resume + play buffer 1 sample im lặng); graph: musicBus -> DelayNode 0.28s feedback 0.35 (space echo) -> DynamicsCompressor -> destination; sfxBus thẳng vào compressor.
   - Sequencer 16 bước, scale A minor pentatonic: A2=110, C3=130.81, D3=146.83, E3=164.81, G3=196, A3=220. Kick = sine pitch-env 150->40Hz trong 90ms mỗi beat 1; hat = noise buffer 8ms qua highpass 7kHz mỗi beat lẻ; bass = triangle mỗi 4 bước; lead arpeggio thêm dần nốt theo combo tier (1x im -> 8x full 6 nốt).
   - SFX: graze = noise 40ms bandpass 5-8kHz gain 0.12 (như tiếng gió sượt tai); collect = sine gliss 880->1320Hz 60ms; chết = saw gliss 220->28Hz 600ms + noise burst; siêu tân = sub sine 55Hz 800ms + noise sweep lowpass 200Hz->8kHz; heat tier-up = 2 nốt harmonics quinta (220+330Hz) 120ms.
   - BPM nhạc = BPM director: nhạc nhanh dần THEO khó khăn, người chơi nghe nhịp là biết sóng xung lõi sắp tới.
5. Near-miss visual: khi vào graze band, hazard sáng bừng viền cyan + tia sáng kéo theo hướng chuyển động tương đối.
DoD V2: 50 SFX dồn dập không rèch (compressor sống); nghe nhạc đoán được nhịp hazard; graze gây cảm giác 'sượt tim đập' thật sự (tự chơi 5 lượt, nếu không muốn graze thì cân bằng lại lợi ích heat).

-- VÒNG 3: ENTERPRISE HARDENING (chống throttling, mất focus, mất mạng, chết chìm) --
1. VISIBILITY API: visibilitychange -> pause loop (dừng RAF), audioCtx.suspend(); trở lại -> resume + GRACE 500ms không spawn hazard mới và frame đầu không tính va chạm (chết oan vì lag là imei ban hàng).
2. LOCAL STORAGE (mọi truy cập bọc try/catch cho private mode): qdvc_best, qdvc_runs, qdvc_mute, qdvc_daily (ngày của seed đang chạy). Kill app -> mở lại vẫn còn best.
3. NEAR-MISS HITBOX -20%: hitbox chết = 0.8 x (R_hazard + R_player) so với visual; graze band = 0.8R đến 1.35 x R_hazard, mỗi hazard chỉ tính graze 1 lần mỗi 250ms. Người chơi NGHĨ là sượt kì diệu -> thực ra là thiết kế công bằng.
4. INSTANT REPLAY <150ms: ring buffer 60 snapshot (60 FPS = 1s gần nhất), mỗi snapshot chỉ là các mảng Float32Array position+radius của player + hazard; khi chết: đóng băng 250ms hitstop rồi chiếu replay 0.5x dạng bóng mờ alpha 0.4 ngay trong canvas, tổng độ trễ từ frame chết đến khi replay lên màn <= 150ms.
5. Delta-time clamp: frame bị throttled (dt > 250ms) -> vứt, không simulate nhảy vọt.
DoD V3: chuyển tab 10 lần liên tiếp không mất audio / không double-loop / không chết oan; replay chiếu đúng khoảnh khắc va chạm; heap không phình sau 20 phút chơi.

=== TIÊU CHUẨN NGHIỆM THU ENTERPRISE (chỉ ship khi tick HẾT) ===
1. STANDALONE 100%: đúng 1 file index.html, chạy trực tiếp qua file://, DevTools Network = 0 request ngoài, airplane mode vẫn chơi đầy đủ.
2. 0 ASSET NGOÀI: không ảnh, không font, không file âm thanh, không CDN — mọi hình là canvas primitive, mọi âm là WebAudio synthesis, mọi chữ là system-ui.
3. 60 FPS LOCKED: p95 frame time <= 16.67ms trên laptop 2019+, budget nội bộ 12ms/render; Debug Overlay (phím ~) hiển thị fps + số particle sống để tự đo.
4. 0 GC ALLOCATION TRONG RAF: không new Object/Array/closure, không string concat, không array method tạo mảng mới, không toFixed trong loop — dùng scratch variables + pool + integer counter chỉ build string khi giá trị đổi; verify bằng DevTools Allocation Timeline: steady-state không có bar mới.
5. Audio im lặng tuyệt đối trước gesture đầu tiên; tab ẩn = pause + im; localStorage persist qua reload.
6. Cả 3 vòng đạt đủ DoD.

=== TECHNICAL BLUEPRINT ===
- Bảng màu: nền gradient dọc #05010F -> #12082B -> #0F1B3D; lõi radial #FFC857 -> #FF6B35 -> transparent; comet #9D6BFF trail gradient sang #3EF2E0; stardust #FFD166; hazard #FF2E88 viền #FF9BB3; graze ring #3EF2E0 alpha 0.35; UI trắng ngà #F5F3FF, số tabular-nums. Khi SIÊU TÂN: đảo ngược toàn bộ gradient nền 2s (flash trắng -> nền sáng tối).
- Công thức tổng hợp: r_hold = r - 260*dt; r_release = r + 200*dt; omega = L/r^2 với L = 5.0e5; điểm mỗi vòng = 10 x multiplier khi qua góc 0; heat: +0.35/graze, decay 2.0/s; tier 1x/2x/4x/8x tại heat 1/3/6/10; siêu tân tại heat >= 12 rồi reset về 0.
- Combo psychology: graze cooldown 250ms/hazard ngăn farm; decay bắt người chơi phải duy trì nhịp mạo hiểm; sóng lõi theo BPM biến âm nhạc thành gameplay (nghe = né được).
- Quy tắc code: mọi hằng số lên đầu file trong CONFIG object; mọi state là plain typed array hoặc số; render tách hoàn toàn khỏi simulate (interpolation); một biến global GAME đóng gói toàn bộ.
```
