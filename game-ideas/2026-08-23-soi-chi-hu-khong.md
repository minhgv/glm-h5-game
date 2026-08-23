# Sợi Chỉ Hư Không

- **Ngày:** 2026-08-23
- **Genre:** Arcade One-Thumb Orbital-Flow — tether-chaining (vật lý neo-quỹ đạo) kết hợp rhythm-resonance dodger procedural
- **Mô tả:** Bạn là tia sáng bị mắc trong hư không: tự động xoay quanh các neo ánh sáng, giữ ngón tay để cắt dây bay theo tiếp tuyến, thả để neo vào điểm kế tiếp — neo đúng nhịp 128 BPM sẽ nhân chuỗi combo thác lũ. Cảm giác chơi: đu đưa — phóng — sượt qua tử thần — nổ tung âm sắc, một ngón tay, không giây nào được nghỉ.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — Xây dựng 'Sợi Chỉ Hư Không' (Void Tether): game H5 Arcade thương mại đẳng cấp studio. Standalone 100% (đúng 1 file index.html, 0 asset ngoài, 0 network request, chạy được qua file://). 60 FPS locked ở 1080p HiDPI trên thiết bị tầm trung 2020. Zero-GC trong game loop. Một ngón tay điều khiển toàn bộ. Sẵn sàng thương mại hoá: ad-break point an toàn giữa sector, leaderboard local, không thu thập dữ liệu (GDPR-friendly). Phân biệt amateur: bug-free, juice chuẩn studio, accessibility (reduced-motion, chế độ colorblind), audio procedural WebAudio không file.

VÒNG LẶP TỰ TRỊ (Autonomous Iteration Loop) — sau MỖI iteration agent PHẢI: build → self-audit theo checklist của iteration đó → đo FPS/heap bằng DevTools instrumentation → chỉ được sang iteration kế khi checklist đạt 100%:

═══ ITERATION 1 — CORE ENGINE (nền đúng, chưa juice) ═══
• Canvas 1080×1920 logical (portrait), HiDPI: backing store = CSS size × min(devicePixelRatio, 2.5), ctx.setTransform; letterbox fit; xử lý resize/orientationchange.
• Fixed-step physics: dt = 1/120s, accumulator pattern, MAX_FRAME_TIME = 0.25s (chống spiral of death), render interpolation alpha = acc/dt. Tích phân semi-implicit Euler: v += a·dt rồi p += v·dt.
• Cơ chế 1 thumb: GIỮ = cắt dây → bay tiếp tuyến với tốc độ tiếp tuyến hiện tại + gravity g = 1400 px/s². NHẢ = neo vào anchor gần nhất trong bán kính bắt 260px (ưu tiên nón ±60° quanh hướng vận tốc). Neo xong ràng buộc về quỹ đạo tròn bằng spring-damper critically damped (k = 180, c = 2·√k, ζ = 1), settle ≤ 120ms, không giật.
• Quỹ đạo: θ += ω·dt với ω = 2.6·(1 + min(chain,20)·0.02) rad/s; tether decay r(t) = r0 − 42·px/s tạo áp lực phải rời neo đúng lúc.
• World procedural: mulberry32 seeded RNG; camera leo dọc vô hạn; difficulty D = 1 + distance/1200 (cap 8); anchor spacing 320→520px; hazard magenta mật độ 0.08→0.35 theo D; BẮT BUỘC solvability check: luôn tồn tại anchor kế trong 90% tầm bay tối ưu (không lộ chết oan).
• Input: Pointer Events toàn màn hình + chuột/Space cho QA desktop; input latency < 50ms; chấp nhận cả touchstart fallback iOS cũ.
• Exit criteria: vòng chơi vô hạn ổn định, chết/score cơ bộ, 60 FPS pin, checklist I.1–I.6 pass.

═══ ITERATION 2 — ENTERPRISE JUICE (cảm giác studio) ═══
• Particle pool: 512 slot preallocated, ring-buffer ghi đè slot cũ nhất bằng index swap — KHÔNG tạo object/mảng/chuỗi nào trong RAF.
• Screen shake: trauma model — shake = trauma², trauma decay 1.6/s, offset = shake × 26px × (sin(t·97.3), cos(t·81.7)) — mượt, không jitter ngẫu nhiên từng frame.
• Hitstop: reso-hit = 45ms, chết = 90ms (timescale = 0, render vẫn vẽ, input buffer không mất).
• WebAudio 0-asset, khởi tạo qua unlockAudio() ở gesture đầu tiên (ctx.resume() + verify state): Latch = triangle pluck 220→440Hz pitch-env 80ms qua lowpass sweep 2000→400Hz. Reso-hit = sine perfect fifth 660Hz + 990Hz decay 300ms + shimmer 1320Hz/60ms. Graze = white-noise buffer 60ms qua bandpass 3kHz Q=8 gain 0.25. Chết = saw 300→60Hz 400ms + noise burst. Ambient pad = 2 saw detune ±0.5Hz @ 55Hz qua lowpass LFO 0.1Hz. Metronome 128 BPM: kick sine pitch-drop 150→40Hz/90ms mỗi beat — dùng chung clock với pulse visual của anchor (audio-sync visual). Mọi gain dùng ramp 5ms chống click/pop.
• Rhythm resonance: latch trong cửa sổ ±60ms quanh beat = RESO HIT → nhân chuỗi, bùng chromatic burst 120ms,anchor sáng gold.
• Trail: 24 điểm lịch sử vị trí vẽ gradient #F5F7FF → #8A7CFF theo tốc độ.
• Exit criteria: juice checklist 12/12, bùng nổ 200 hạt không gây spike frame.

═══ ITERATION 3 — ENTERPRISE HARDENING ═══
• Visibility API: tab ẩn → pause loop + audio.suspend(); quay lại → warm-up 1 frame rồi chạy; chống timer drift.
• LocalStorage versioned key 'voidtether.v1' (JSON schema có version + migrate an toàn): best score, sector đạt được, settings (SFX/music/reduced-motion/colorblind).
• Near-miss hitbox: hitbox chết = 80% bán kính hazard; graze ring = 118% bán kính → thưởng GRAZE +50×m — cho cảm giác sượt qua tử thần gây adrenal.
• Instant Replay: ring buffer 5 giây @ 30Hz (Float32Array flat, 150 samples × (x,y,theta) cho mọi entity), khi chết phát lại tốc độ 0.6×, bắt đầu render replay < 150ms sau va chạm — không stall, không allocation.
• Death flow: replay → tap 1 lần RESTART, vào gameplay mới < 400ms.
• Exit criteria: tab-switch 20 lần không leak audio/timer; restart 50 lần heap flat.

═══ NGHIỆM THU ENTERPRISE (mỗi mục PHẢI đo được, không cảm tính) ═══
A1. Standalone 100%: DevTools Network = 0 request ngoài, chạy offline file://.
A2. 60 FPS locked: median ≥ 60 FPS, p99 frame ≤ 17.5ms; physics fixed-step tách rạch ròi khỏi render (đổi Hz màn hình không đổi gameplay).
A3. Zero-GC trong RAF: Chrome Allocation instrumentation 60s gameplay → 0 allocation steady-state; heap snapshot trước/sau diff = flat.
A4. 0 asset ngoài: mọi hình vẽ bằng Canvas2D API thuần, mọi âm tổng hợp WebAudio procedural.
A5. Input: 1 thumb toàn màn hình, latency < 50ms, không dead-zone, không cần độ chính xác vị trí.
A6. Audio: unlock ngay gesture đầu, không click/pop, suspend khi tab ẩn.
A7. Replay: hiển thị < 150ms sau death, playback 30fps mượt.
A8. Persistence: score/settings sống qua reload, schema migrate không mất dữ liệu.

═══ TECHNICAL BLUEPRINT (agent tự do tinh chỉnh số liệu, không được hạ chuẩn) ═══
• Bảng màu: nền gradient dọc #050510 → #0B1026 → #1B1F4B + 3 radial nebula lerp-hue chậm theo camera; anchor cyan #4EF3E8, resonance gold #FFC94A, hazard magenta #FF3D6E, spark trắng #F5F7FF, trail tím #8A7CFF. Colorblind mode: hazard chuyển #FFB800 + sọc chéo pattern.
• Combo & scoring: distance 10đ/s × m; latch +25×m; reso-hit +200×m; graze +50×m; m = 1 + floor(chain/4) cap ×8; chết reset chain; hiển thị m bằng độ dày quầng sáng quanh spark (UI không chữ số during flow — chữ chỉ hiện khi chain đứt).
• Camera: lerp vị trí Y mượt, look-ahead 180px theo vận tốc, giới hạn speed để không lay người chơi.
• State machine: BOOT → MENU → RUN → HITSTOP → REPLAY → RESULT; mỗi state có entry/exit tách bạch, không logic rải rác.
• Kiến trúc code: IIFE strict mode, namespace module hoá (Engine/Audio/Particles/World/UI/Storage), không framework, không build step, mọi hằng số gameplay gom vào CONFIG object đầu file để tuning.
```
