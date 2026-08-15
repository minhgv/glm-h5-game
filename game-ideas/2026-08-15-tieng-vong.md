# Tiếng Vọng (Echo Depth)

- **Ngày:** 2026-08-15
- **Genre:** Arcade / Casual — One-touch echolocation survival
- **Mô tả:** Bạn là Hạt Sáng rơi vào hang động tối tuyệt đối: gõ nhẹ để phát sóng vọng âm soi đường, nhưng mỗi tiếng vọng cũng đánh thức những Người Nghe săn mồi bằng âm thanh. Càng im lặng càng an toàn — càng nhìn thấy càng nguy hiểm.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
# TIẾNG VỌNG — Master Prompt Production-Ready (H5 Arcade)

Bạn là senior game engineer + designer. Xây dựng game H5 arcade one-touch **Tiếng Vọng** thành phẩm production-ready: single-page, **zero-asset** (không image/audio file — 100% Canvas 2D procedural + WebAudio procedural), portrait-first, 60fps mobile mid-range, offline-capable sau lần load đầu, bundle ≤ 60KB gzip, không dependency ngoài.

## 1. Ý TƯỞNG CỐT LÕI (Design Pillars)
- **Căng thẳng thấy-vs-sống**: người chơi mù bẩm sinh; ping để nhìn, nhưng ping tố cáo vị trí bạn. Mọi quyết định là đánh đổi thông-tin/liều-rủi-ro trong < 1 giây.
- **Âm thanh chính là UI**: nhạc nền gần như tĩnh lặng; growl của kẻ địch, chuông tinh âm, tiếng vọng là radar thật — chơi được bằng tai.
- **Zero-asset, procedural mọi thứ**: terrain, SFX, VFX sinh tại runtime; load < 3s, chạy mọi máy.
- **One-touch thuần**: một ngón tay, chơi mọi nơi, session 30–180 giây, vòng lặp thử-lại tức thì (≤ 1.2s từ chết đến đang chơi).

## 2. GAMEPLAY LOOP
**Loop giây** (trong game): giữ ngón tay = bay lên — buông = rơi → gõ nhẹ = phát ping (tốn 1 pip, hồi 2.5s) → sóng soi tường + làm Tinh Âm kêu lên (+điểm × combo, +1 pip) → nhưng sóng chạm Người Nghe = chúng lao về điểm phát ping → né bằng im lặng + nghe growl → xuống sâu hơn, điểm tăng.
**Loop session**: chết → xem điểm/best → Đi sâu hơn / Hồi sinh (1 lần, hook ad stub) → immediately retry. Mỗi 250m có milestone toast + hợp âm thưởng (dopamine nhịp đều).

## 3. ĐIỀU KHIỂN (một cử chỉ, hai chức năng)
- **Giữ** (hold, mọi vị trí màn hình): lực đẩy lên; thả: rơi tự do.
- **Gõ nhẹ** (tap): pointer down→up < 150ms VÀ dịch chuyển < 12px → phát PING. Ngược lại coi là hold/thrust. Phân loại tại pointerup, thrust tính lũy kế từ pointerdown (không mất input).
- Desktop: giữ Space = thrust, phím F hoặc nhấp chuống nhanh = ping, P = pause.
- Input→response ≤ 50ms; dùng pointer events unify; polling mỗi sim step.

## 4. CƠ CHẾ & PHYSICS (hằng số sản xuất)
| Thông số | Giá trị |
|---|---|
| Trọng lực | 1400 px/s² |
| Lực đẩy (net) | −1400 px/s² khi hold |
| vy clamp | ±620 px/s |
| vx tự động | 240→420 px/s (ramp tuyến tính, max tại depth 1000m) |
| Sim | fixed timestep 120Hz + accumulator, render interpolation |
| Ping wavefront | tốc 640 px/s, bán kính max 900px, sống 1.6s |
| Reveal tường | alpha = exp(−t/1.6), cutoff 2.75s |
| Ping pips | 3 pip, hồi 2.5s/pip; mỗi Tinh Âm +1 pip tức thì |
| Thân vỏ (hull) | 3 điểm; đâm tường −1 + knockback 240px/s pháp tuyến + i-frame 1.2s; hull 0 = vỡ |
| Graze | bay cách tường ≤ 26px liên tục ≥ 0.25s → +2 điểm/s × combo (spark báo hiệu) |
| Combo | window 4s, nhân dần ×1→×8 (cap); Tinh Âm = 10 × combo điểm |
| Score tổng | floor(depth_m) + Σ tinh âm + graze points |

## 5. SINH THẾ GIỚI (PROCEDURAL TERRAIN)
- Ranh giới trên/dưới = value-noise 1D (3 octave, lerp mượt) + RNG seedable mulberry32; chunk 512px, sinh trước 3 chunk, giữ cửa sổ 1280px quanh player, dọn phía sau.
- **Bảo đảm đường đi**: khe hở tối thiểu ≥ 150px mọi depth (sinh xong clamp về min-gap).
- Tinh Âm: cụm 3 viên dọc đường sine trung tâm ± jitter, mỗi 400–700px một cụm.
- Người Nghe spawn tại pocket rộng, cách cụm Tinh Âm ≥ 250px (tránh bẫy không-lối-thoát).
- **Daily Challenge**: seed = YYYYMMDD → cùng cave trên mọi máy; badge NGÀY + top 5 cục bộ theo seed.

## 6. AI KẺ ĐỊCH
- **Người Nghe (Listener)**: lơ lửng 60px/s; khi wavefront chạm → trạng thái HUNT 2.8s: lao 520px/s (giảm dần) về **điểm phát ping** (không phải vị trí player — tạo cơ hội giả tiếng động/sống sót nhờ đó), cooldown 4s. Chỉ hiển thị khi được soi + afterimage silhouette alpha 0.12 tại vị trí cuối (dấu 'ảnh sonar' đặc trưng).
- **Tiên Tri (Sage)**, depth ≥ 800m, xuất hiện mỗi ~600px: mỗi 6–10s phát **counter-ping** đỏ (ring R 700px): soi地形 miễn phí NHƯNG mọi Listener trong vùng chuyển target thành PLAYER thật — buộc người chơi định thời gian di chuyển giữa các tiếng vọng của địch.
- Va chạm Listener↔player = mất hết hull (chết), trừ khi đang i-frame.

## 7. WEBAUDIO PROCEDURAL SFX (đề bài synthesis — CẤM file audio)
Chuỗi master: voices → bus sfx/music → DynamicsCompressor → destination; Convolver reverb (impulse = white noise decay mũ 1.8s) wet 0.18. Voice manager tối đa 24 voice, steal-oldest.
| SFX | Công thức |
|---|---|
| Ping | sine 880→180Hz sweep mũ 0.32s, env A5ms/D0.4s; osc 2 detune ×1.465 gain 0.25; send reverb 0.35 |
| Tinh Âm | triangle pentatonic [C4,D4,E4,G4,A4,C5,D5,E5,G5,A5], index = min(combo−1,9), decay 0.5s + harmonic ×2 gain 0.15 |
| Graze spark | noise buffer bandpass 2.4kHz Q6, 0.08s, gain 0.12 |
| Đâm tường | sine 110→45Hz 0.25s gain 0.5 + noise lowpass 400Hz 0.15s (sync screenshake) |
| Chết | sub 90→28Hz 0.9s + cluster 5 osc detuned quanh 220Hz tắt 1.4s, reverb 0.6 |
| Listener growl | brown noise lowpass 160Hz, LFO 5.5Hz depth 0.7, gain = clamp(1 − dist/600) × 0.22 — **radar bằng tai** |
| Hunt alert | 2 nốt E2→G2 saw lowpass 300Hz 0.28s |
| Sage counter-ping | sine 520→1040Hz swell 0.5s + tremolo 14Hz — timbre riêng, học được bằng tai |
| Milestone | 3 nốt nhanh C6-E6-G6 sine 40ms |
| UI click | square 900Hz 18ms −18dB |
| Ambient | 2 sine 55/55.7Hz gain 0.04 + drip ngẫu nhiên 4–9s (1400→380Hz 0.09s + echo ×3 −6dB) |
- AudioContext unlock lazy sau gesture đầu tiên; resume khi visibilitychange; mute persist. Không một âm nào phát trước gesture.

## 8. VFX / PARTICLE (toàn bộ Canvas 2D, composite `lighter`)
- Ping ring: 2 stroke chồng (4px alpha 0.9 + 14px alpha 0.12), màu hsl(174,90%,60%), hue +14°/mỗi bậc combo; radial gradient alpha 0.05.
- Tường được soi: polyline 2 lớp (rộng-mờ + mảnh-sáng), alpha = cường độ reveal.
- Player: mote r10 + trail 18 particle glow, hue trôi 180→300 theo combo.
- Nhặt Tinh Âm: burst 14 particle + hex ring mở 0.4s + floating text pool `+10×N`.
- Đâm tường: 10 spark cam + shake 7px/0.18s + vignette đỏ 0.35 decay; Chết: 40 particle vỡ + slow-mo 0.35× 0.6s + overlay xám.
- Counter-ping Sage: ring đỏ + eye-flash 0.3s trên mọi Listener trong vùng.
- **CẤM shadowBlur trong loop** (vẽ 2 lớp thay thế). DPR cap 2.
- Pool cứng: 512 particle (Low 256), 64 float text, 16 ring — **0 cấp phát trong frame**.

## 9. UI / HUD / MÀN HÌNH
- HUD: depth trái-trên (tabular-nums, 1 số thập phân + 'm'); combo giữa-trên (scale spring 1→1.35→1, 180ms); 3 pip ping dưới-giữa (vòng quét cooldown); pause phải-trên. Font system-ui; mọi nút ≥ 44px; safe-area inset.
- Title: nền hang + auto-ping chậm, logo glow pulse 3s, best score, 'Chạm để bắt đầu'.
- Death: Score lớn + badge NEW BEST, Max combo, Tinh Âm; nút **Đi sâu hơn** (tap→chơi ≤ 1.2s); Chia sẻ (clipboard: `Tôi xuống 1.482m trong Tiếng Vọng — vượt tôi đi!`); Hồi sinh 1 lần/run (hook watchAd stub, đầy hull, i-frame 2s).
- Settings: Âm thanh, Giảm flash (tắt shake/flash), Chất lượng Cao/Thấp → persist `localStorage tv.settings`.
- Accessibility: màu không phải tín hiệu duy nhất (kẻ địch phân biệt bằng audio + hình khối silhouette riêng).

## 10. DIFFICULTY & PACING
| Depth | Khe hang | Nội dung |
|---|---|---|
| 0–150m | 320–420px | Không Listener; hint diegetic in mờ trên tường: 'gõ nhẹ — vọng âm', 'giữ — bay lên' |
| 150–500m | 260–340px | 1 Listener/màn, vx 280 |
| 500–900m | 210–300px | 2 Listeners + hải lưu ±120px/s đổi chiều 4–7s (particle mờ chỉ hướng) |
| 900m+ | 190–260px | Sage + 3 Listeners, vx 420 |

## 11. KIẾN TRÚC KỸ THUẬT
- Vanilla ES2020 (hoặc TS), không engine; build esbuild; state machine BOOT→TITLE⇄PLAY⇄PAUSE→DEAD.
- rAF + fixed 120Hz accumulator (panic max 5 step/frame) + render interpolation alpha.
- Mọi object dynamic dùng pool; `?debug` overlay: fps, sim ms, draw calls, particle count, alloc/frame (=0 bắt buộc).
- visibilitychange → auto-pause (không chết vì pause); pagehide flush best. localStorage: `tv.best`, `tv.bestDaily`, `tv.settings` (< 5KB).

## 12. PERFORMANCE BUDGET (cổng nghiệm thu)
- Đích: Snapdragon 665 / iPhone 11, Chrome mobile: **trung bình ≥ 55fps trong soak 10 phút**, p99 frame ≤ 20ms; CPU frame ≤ 8ms laptop 2020.
- Draw calls ≤ 220/frame; heap ≤ 120MB; không GC pause > 8ms khi chơi (bản ghi Performance 2 phút: sawtooth phẳng).
- Payload ≤ 60KB gzip, 0 media request; boot→playable ≤ 3s @ Fast 3G; Lighthouse mobile Performance ≥ 95.

## 13. ACCEPTANCE CRITERIA (Definition of Done)
- [ ] Full loop: title → play → death → retry ≤ 1.2s, 0 lỗi console production build
- [ ] 50 tap tự nhiên: 100% phân loại đúng ping/hold (0 trigger nhầm)
- [ ] Ping soi tường + Tinh Âm chuông tăng nốt theo combo; Listener HUNT về đúng điểm phát ping
- [ ] Blindfold test nội bộ 5/5: đoán gần/xa Listener chỉ bằng growl
- [ ] Cùng seed daily → cùng cave trên 2 máy khác nhau
- [ ] Soak 10 phút đạt trọn budget mục 12; alloc/frame = 0
- [ ] Mute + reduce-flash + quality persist qua reload; không âm trước gesture đầu
- [ ] Chơi 1 tay portrait thuần, mọi touch target ≥ 44px

## 14. NON-GOALS (đừng làm)
Multiplayer, backend, sprite/image assets, PWA đầy đủ (chỉ cache shell), iAP thật (chỉ ad stub).

## 15. MỐC TRIỂN KHAI
M1 bay+ping+tường (playable) → M2 Tinh Âm/combo/scoring → M3 Listener+Sage+daily → M4 audio đầy đủ+juice VFX → M5 settings+perf pass → M6 soak test+ship.
```
