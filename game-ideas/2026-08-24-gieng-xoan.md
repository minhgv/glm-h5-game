# Giếng Xoán (Spiral Well)

- **Ngày:** 2026-08-24
- **Genre:** Arcade One-Thumb / Orbital-Physics Slicer — quản lý động lượng quay (angular momentum) quanh mỏ neo rơi tự do để cắt node và cào near-miss trong giếng không đáy
- **Mô tả:** Bạn là lưỡi dao ánh sáng bị xích vào mỏ neo đang rơi trong giếng không đáy: giữ ngón tay để cuộn sát trục — quay vụn vụt như vận động viên trượt băng rút tay, thả ra để văng xoắn rộng. Cắt node bằng tốc độ临界, cạo tường bằng cú near-miss nghẹt thở, và đừng bao giờ để động lượng quay rơi về 0.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — STANDING GOAL (Enterprise Arcade Standard)
Xây dựng hoàn chỉnh tựa H5 arcade one-thumb 'GIẾNG XOÁN' ở chất lượng thương mại của một studio arcade chuyên nghiệp (CrazyGames/Poki-ready): build single-file chạy ngay khi paste vào browser, session loop 3–5 phút, high-score chase + combo tier tạo D1 retention, có hook chèn quảng cáo (điểm chết → 'Revive/Restart gate'), phân biệt tuyệt đối với game amateur: fixed-step physics, particle pooling, procedural WebAudio 0-asset, tab-safe, GC-free render loop. Không prototype, không placeholder, không TODO.

AUTONOMOUS ITERATION LOOP — agent TỰ LẶP 3 GIAI ĐOẠN, mỗi giai đoạn phải tự kiểm tra theo Definition of Done (DoD) trước khi sang giai đoạn sau; nếu fail → sửa rồi lặp lại chính giai đoạn đó (tối đa 3 vòng sửa/giai đoạn):

ITERATION 1 — CORE ENGINE (DoD: chơi được 60fps, chết/win/redo hoạt động)
- Canvas 1080p HiDPI: width/height = 1080×1920 logical, scale theo devicePixelRatio (cap 2.5), ctx.setTransform một lần, resize handler không tái tạo object.
- Fixed-step physics: accumulator, dt cố định 1/120s, max frame clamp 0.25s, render interpolation alpha cho player/anchor/particles; timescale biến toàn cục để phục vụ hitstop/slow-mo.
- Input 1-thumb: pointerdown = CUỘN (r giảm), pointerup = THẢ (r tăng); fallback Space; ăn cả touch/mouse, preventDefault chống scroll-zoom.
- Physics lõi: player ở tọa độ cực (r, θ) quanh anchor. HOLD: r -= 520·dt (px/s), clamp [r_min=48, r_max=0.42·min(W,H)]. RELEASE: r += 300·dt. BẢO TOÀN ĐỘNG LƯỢNG QUAY: khi r đổi, ω_new = ω_old·(r_old/r_new)² — đây là 'skater-spin' tạo cảm giác gây nghiện; clamp ω ∈ [0.5, 18] rad/s; v_tangential = ω·r. Anchor rơi thẳng: v_well = 140 px/s khởi đầu, +6 px/s mỗi 10s depth, cap 420.
- Entities: node đỏ #FF4D6D (chết nếu chạm khi v_t < v_cut=520 px/s — cắt nếu ≥), node tím #B388FF (bonus điểm), node lime #B9FF66 (nạp 1 lần 'Overdrive' ×2 tốc cắt 4s), tường hai bên giếng cong hình sin nhẹ (hàm wall(y,t)). Circle-vs-circle và circle-vs-wall collision.
- Game states: BOOT → READY (tap để unlockAudio + start) → PLAY → PAUSE → GAMEOVER; HUD: depth (m), score, combo, best.

ITERATION 2 — ENTERPRISE JUICE (DoD: mỗi hiệu ứng có trigger rõ, audio chạy iOS Safari sau unlock)
- Particle pool: pre-allocate 512 particle plain-object, free-list index swap, KHÔNG tạo object trong RAF; trail player = ring buffer 24 điểm vẽ gradient 2-stop #7DF9FF→transparent với lineWidth giảm dần.
- Screen shake: trauma ∈ [0,1], offset = trauma²·14px·(noise), decay 1.8/s; hitstop: timescale=0 trong 45ms (cắt thường) / 90ms (tier-up); НЕ dùng setTimeout trong RAF path.
- Procedural WebAudio 0-asset: AudioContext khởi tạo MỖI pointerdown đầu tiên (unlockAudio pattern cho iOS); master chain: DynamicsCompressor → gain 0.35. SFX: (a) SLICE = sawtooth sweep 180→720Hz trong 70ms + highpass Q4 + noise burst 30ms; (b) COMBO NOTE = thang pentatonic f = 261.63·2^(n/12), n ∈ {0,3,5,7,10,12,15,17,19,22,24}, mỗi combo +1 bậc, tier-up reset +1 octave; (c) WALL NEAR-MISS = filtered noise (bandpass 2.5kHz, Q8) 120ms; (d) DEATH = sine drop 400→40Hz 500ms + lowpass noise; (e) TIER-UP = 2 osc detune +7 cent đồng thời. Tất cả node audio stop/schedule xong tự dispose qua onended.
- Visual juice: bloom giả bằng shadowBlur chỉ bật cho player + anchor (rẻ), chromatic flash 60ms khi tier-up (vẽ 2 lớp offset ±3px mix cyan/magenta), node vỡ = 12–20 particle directional theo v_t, vignette tĩnh gradient radial vẽ 1 lần offscreen canvas.

ITERATION 3 — ENTERPRISE HARDENING (DoD: tab-switch an toàn, replay chạy, close-reopen giữ best)
- Visibility API: document.addEventListener('visibilitychange') → hidden: pause + audioContext.suspend(); visible: chờ user tap resume. Pagehide cũng lưu state.
- LocalStorage schema 'gieng-xoan-v1': {best, totalRuns, settings{sfx,haptics}} — try/catch mọi access (private mode safe); navigator.vibrate(15) khi cắt nếu haptics.
- NEAR-MISS hitbox -20%: khi player overlap tường/node-trần với margin hitbox thu 20% nhưng chưa va chạm thật → trigger: slow-mo timescale 0.65 trong 120ms + score 40·mult + shake nhẹ + 'whoosh' — cảm giác 'cạo râu'超高.
- INSTANT REPLAY <150ms: ring-buffer 10 snapshot (mỗi 16ms, ~16 dòng dữ liệu: r, θ, anchorY, entities-dirty-flag) → khi chết: replay 1.2× tốc kèm filter grayscale + letterbox, tổng delay từ input chết → replay hiển thị < 150ms (đo bằng performance.now()).
- Difficulty curve sigmoid theo depth: spawn rate = 1.8 + 1.1·(1-e^(-depth/800)); pattern generator có seedable PRNG (mulberry32) để daily-challenge tương lai.

ENTERPRISE ACCEPTANCE CRITERIA — NGHIỆM THU BẮT BUỘC (checklist tự động, ALL-PASS mới ship):
1. Standalone 100%: 1 file HTML duy nhất, 0 request mạng, 0 asset ngoài, 0 CDN, 0 font ngoài (dùng system font stack + số vẽ canvas).
2. 60 FPS locked: RAF delta histogram ≥ 55fps trên máy trung bình; frame budget CPU ≤ 8ms/frame đo bằng performance.now() trong chính game (debug overlay F1).
3. 0 GC allocation trong RAF: tất cả vector/particle/temp object pre-allocated ở BOOT; cấm closures/array methods tạo mảng mới (map/filter/concat/spread) trong loop cập nhật; kiểm chứng bằng chạy 10.000 frame với --js-flags='--expose-gc' + gc() heuristic heap không tăng ngoài mức chặn.
4. HiDPI 1080p sắc nét trên DPR 1–3; không moiré, không blur text.
5. Touch 1-thumb hoàn hảo: mọi action chính = hold/release một ngón; hit target ≥ 44px tương đương; không cần đa điểm chạm.
6. Tab-safe: ẩn tab 10 phút → quay lại không crash, không âm thanh zombie, physics không 'teleport' (accumulator clamp).
7. Audio unlock chuẩn iOS Safari; im lặng tuyệt đối trước gesture đầu tiên.
8. 0 lỗi console ở mọi luồng: boot → chơi 3 phút → chết → replay → restart ×5.

TECHNICAL BLUEPRINT (agent tự do tinh chỉnh số liệu nhưng giữ nguyên hệ thức):
- BẢNG MÀU: nền giếng gradient dọc #05060E→#0B1026, dust parallax #1E2749 alpha 0.35; player blade #7DF9FF→#00E5FF; anchor #FFD166 lõi + #FFE8A3 halo; danger #FF4D6D, bonus #B388FF, energy #B9FF66; tường #16203D fill + viền neon #4E6EFF 2px + glow; combo tier 1–4 đổi màu score trắng→vàng #FFD166→cam #FF8C42→trắng-nóng #FFFFFF kèm pulse.
- CÔNG THỨC VẬ LÝ (đơn vị px, s): ω' = ω·(r/r')² ; v_t = ω·r ; điều kiện CẮT: v_t ≥ 520 ; chết khi chạm node đỏ với v_t < 520 hoặc chạm tường thật (hitbox full); v_well(depth) = min(140 + 0.6·depth_s, 420) với depth_s = giây chơi; r_min=48, r_max=0.42·min(W,H); recoil khi bounce: ω *= -0.35.
- COMBO SYSTEM: cắt node +1 combo, near-miss +1 combo; combo decay 2.5s không sự kiện → reset; multiplier = 1 + floor(combo/8), cap ×8; TIER-UP mỗi 16 combo: hitstop 90ms + flash + pitch ladder reset +1 octave; score: node 100·mult, near-miss 40·mult, milestone depth mỗi 500m +250; chết mất toàn bộ combo — rủi ro/lợi nhuận đúng chất arcade.
- AUDIO SYNTH CHI TIẾT: sampleRate mặc định; envelope A5ms-D-slope; pentatonic base C4 261.63Hz; noise dùng AudioBuffer 1s white-noise sinh lúc boot (không phải asset ngoài); limiter chống clip khi ≥6 SFX chồng nhau.
- RENDER ORDER: vignette offscreen → dust → walls → nodes → trail → player → anchor → particles → HUD → flash overlay.
- SELF-VERIFICATION PROTOCOL: sau mỗi iteration, agent chạy qua checklist DoD + Acceptance bằng cách instrument code (debug overlay, frame timer, alloc counter) và chỉ output bản FINAL khi all-pass; nếu môi trường không chạy được browser thì rà soát tĩnh từng mục và ghi chú xác nhận từng dòng trong báo cáo nội bộ.
```
