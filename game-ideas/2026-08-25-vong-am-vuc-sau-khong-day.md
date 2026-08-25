# Vọng Âm: Vực Sâu Không Đáy

- **Ngày:** 2026-08-25
- **Genre:** Arcade Survival / Sonar-Reveal — one-thumb hold-to-charge sonar pulse, blind-dodge theo trí nhớ, graze near-miss combo, risk/reward thông-tin-vs-đe-dọa
- **Mô tả:** Bạn là sinh vật phát quang giữa vực sâu tăm tối: màn hình gần như đen, chỉ hé lộ khi bạn nạp và giải phóng sóng vọng âm — nhưng mỗi pulse thu hút đàn săn mồi. Nạp bằng 1 ngón tay, né hụt sát nút để ăn graze combo, sống sót bằng trí nhớ và lòng tham thông tin.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal: Sản xuất 'Vọng Âm: Vực Sâu Không Đáy' — arcade H5 one-thumb thương mại hạng Enterprise: standalone 100% trong 1 file index.html, chơi offline ngay, game-feel ngang studio thương mại (deterministic physics, juice chuẩn, hardening đầy đủ), khác biệt hoàn toàn sản phẩm amateur, sẵn sàng đăng itch.io/web-portal và monetize.

VISION & HOOK: Người chơi là sinh vật phát quang giữa vực sâu không đáy. Màn hình TỐI. Chạm-giữ để nạp Vọng Âm — thả để sóng lan tỏa (R(t) = R0 + 2200*t) hé lộ predator và tinh thể trong vành sáng chạy. Cái giá: mỗi pulse tăng aggro của đàn săn mồi (mức thu hút = 1.15 ^ số pulse gần đây). Càng ping nhiều càng thấy rõ — càng bị săn. Đó là vòng lặp nghiện: information vs aggression. CORE LOOP 30s: trôi -> nạp -> pulse -> thu orb / graze né predator -> combo stack -> tier-up flare -> boss wave mỗi 60s -> chết -> instant replay -> 1-chạm chơi lại.

ROLE: Agent đóng Game Director + Senior Gameplay Engineer + Audio Designer. Tự do quyết định mọi chi tiết kỹ thuật, không hỏi lại, tự nghiệm thu checklist của mỗi vòng trước khi sang vòng kế.

=== AUTONOMOUS ITERATION LOOP ===

ITERATION 1 — CORE ENGINE (chơi được, đúng, mượt):
- 1 file index.html duy nhất, Canvas2D full-viewport; backing store = css * min(devicePixelRatio, 2) chuẩn 1080p HiDPI; design space 1920x1080 letterbox-scale.
- Fixed-step physics: dt = 1/120s, accumulator + interpolation alpha cho render; clamp frame-delta 0.25s chống spiral-of-death; RNG seeded mulberry32 để deterministic.
- Input 1-thumb: pointerdown = nạp pulse (bán kính 180–640px theo thời gian nạp 0.15–1.2s, có ring-progress trực quan), pointermove kéo player bằng spring-damper (k=120, c=14), pointerup = phát sóng.
- Entities pre-allocated: player, 6 predator archetypes, orb field 24, tối đa 4 pulse đồng thời. State machine: BOOT -> TITLE -> PLAY -> REPLAY -> GAMEOVER.
- Vật lý: v += a*dt; drag v *= pow(0.86, dt*60); predator steering = clamp(desired * maxSpeed - v, maxForce 900px/s2); camera lerp theo player + look-ahead theo v.
- DoD vòng 1: chơi liền mạch 3 phút không lỗi logic, không jank hiển thị.

ITERATION 2 — ENTERPRISE JUICE (cảm giác đắt tiền):
- Particle pooling: ring-buffer 512 slot pre-allocate, spawn ghi đè slot cũ nhất; tuyệt đối không new particle trong gameplay.
- Screen shake theo trauma model: offset = trauma^2 * 26px * hash-noise, decay 1.8/s; graze = 0.15, tier-up = 0.3, death = 1.0.
- Hitstop: timeScale = 0 trong 40ms (graze) / 90ms (death) / 120ms (tier-up), ease về 1 trong 80ms.
- Procedural WebAudio 0-asset: unlockAudio() tại pointerdown đầu tiên (resume AudioContext + silent buffer); master chain = masterGain 0.8 -> DynamicsCompressor(threshold -18dB, ratio 12) -> destination.
- Synth spec: ping = sine 880Hz exp-glide về 140Hz trong 0.6s + bandpass-noise 'water' 0.3s; charge-tick mỗi 80ms leo bảng pentatonic [220, 262, 330, 392, 440, 523, 587, 659, 784, 880] Hz; graze = triangle 1560Hz 40ms stereo-pan theo hướng bay; death = sawtooth 110->30Hz 0.8s + lowpass 400Hz noise burst; tier-up = 2-note chord detune +7 cent.
- Palette: nền gradient dọc #04060D -> #0A1628 -> #10263F; pulse cyan #22D3EE vẽ additive (globalCompositeOperation lighter); orb tím #A78BFA; threat hồng #F43F5E; combo gold #FBBF24, flare #FDE68A; player lõi #E8F4FD; font = system-ui stack (không font ngoài).
- Combo system: graze +1 stack, orb +2, mỗi predator hé lộ trong 1 pulse +3; stack decay 2.5s không event; multiplier = 1 + floor(stack/5), cap x8; mỗi lần multiplier x2: chord + flash viền màn + trauma 0.3.
- DoD vòng 2: mọi event gameplay đều có âm-thanh + hiệu-ứng + rung tương xứng; audio chỉ phát sau user-gesture.

ITERATION 3 — ENTERPRISE HARDENING (chuẩn ship):
- Visibility API: blur/hidden -> tự pause + mute + reset clock tránh dt-jump; focus lại hiển thị đếm 3-2-1 trước khi resume.
- LocalStorage bọc try/catch, key versioned 'vong_am_v1': best score, best combo, mute, tổng số lượt chơi.
- Near-miss hitbox: hitbox vật lý thu -20% so sprite (hitR = 0.8 * visualR) để va chạm 'fair'; vùng graze = 1.0–1.4 * hitR, kích hoạt khi đạn/predator xâm nhập rồi rời vùng (một lần mỗi đối tượng).
- Instant Replay: ring-buffer 120 snapshot (typed-array pre-alloc: x, y, rot, alpha mỗi entity); death -> hitstop 90ms -> replay 1.5s ở tốc độ 0.5x + vignette đỏ; độ trễ death->replay < 150ms.
- DoD vòng 3: tab-switch 10 lần không lệch state; kill app giữa chừng vẫn giữ best; graze đọc được bằng mắt (flash + tick âm).

=== ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu bắt buộc) ===
A1. Standalone 100%: đúng 1 file index.html, không fetch/XHR/import mạng, chạy được offline airplane-mode và cả qua file:// trực tiếp.
A2. 0 asset ngoài: không file ảnh/font/audio; visual thuần Canvas2D, audio thuần WebAudio procedural, mọi chữ dùng font-stack hệ điều hành.
A3. 60 FPS locked: physics fixed-step 120Hz + render 60Hz, frame budget p95 < 16.6ms trên GPU tích hợp; đọc kích thước viewport đúng 1 lần mỗi resize (không layout thrash).
A4. 0 GC allocation trong RAF: pre-allocate toàn bộ object/mảng/vector; cấm new / array-literal / closure / string-concat trong frame-path; kiểm chứng bằng DevTools Allocation Timeline: 30s chơi = 0 heap growth.
A5. Game-feel thương mại: hitstop + shake + graze + combo-tier audio tạo cảm giác 'đắt tiền'; death->replay < 150ms; toàn bộ gameplay thao tác được bằng 1 ngón tay cái.
A6. Vòng tự trị: agent chạy QA checklist sau MỖI iteration; iteration sau chỉ bắt đầu khi iteration trước pass toàn bộ; nếu conflict spec thì ưu tiên A1–A4. Mọi magic number gom vào const CONFIG ở đầu file để tune.
```
