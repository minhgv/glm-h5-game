# Đom Đóm Neon

- **Ngày:** 2026-08-20
- **Genre:** Arcide One-Thumb Grappling-Swing Infinite Climber (Cơ chế: Latch-Polarity Swing + Rhythm Combo + Near-Miss Heat)
- **Mô tả:** Bạn là đom đóm cuối cùng của Lễ hội Đèn lồng vĩnh cửu: giữ ngón tay để quăng mình quay quanh đèn lồng, thả ra đúng khoảnh khắc đỉnh tiếp tuyến để vọt lên trời vô tận. Mỗi lần buông hoàn hảo là một nốt nhạc lên thang ngũ cung, mỗi lần lao sượt qua tơ lụa chết chóc là một nhịp tim Near-Miss đốt nóng Overdrive.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
/goal — STANDING GOAL (Enterprise Arcade Studio)
Xây dựng 'Đom Đóm Neon' thành sản phẩm arcade H5 thương mại hoá được, phân biệt tuyệt đối với game 业余 (amateur) theo 5 chỉ tiêu đứng:
1. RETENTION: Time-to-first-fun < 3 giây từ tap đầu tiên; vòng chết→retry < 400ms (1 tap); session trung bình mục tiêu ≥ 4 phút.
2. FEEL: 'Swing-weight' vật lý phải nặng và rõ ràng — mỗi lần latch có trọng lượng (reel-in), mỗi lần release có tiếng vút (tangent boost); không bao giờ có cảm giác trôi.
3. ORIGINALITY: Cơ chế Latch-Polarity (chỉ móc được đèn cùng cực tính với mình, cực tính đảo theo spark hút được) tạo ra bài toán định tuyến tức thời ở tốc độ cao — đây là dấu vân tay gameplay, không được làm mờ đi vì độ khó.
4. MONETIZATION-READY: Luồng điểm (Perfect chain, Near-Miss Heat, Overdrive ×2) và Daily Seed (deterministic RNG) phải được đo được, hiển thị rõ, sẵn sàng gắn leaderboard/quảng cáo reward sau này mà không đổi kiến trúc.
5. ZERO-DEPENDENCY DISCIPLINE: 1 file HTML duy nhất, 0 asset ngoài, 0 network call, 0 thư viện — mọi hình vẽ là Canvas2D procedural, mọi âm thanh là WebAudio synthesizer runtime.

═══════════════════════════════════════
AUTONOMOUS ITERATION LOOP — Agent tự trị 3 giai đoạn, mỗi giai đoạn KHOA toàn bộ tiêu chí mới sang bước sau, được phép tự quyết định chi tiết kỹ thuật con, KHÔNG được giảm scope tiêu chí nghiệm thu:

■ ITERATION 1 — CORE ENGINE (nền tảng, không juice):
- Canvas 1080×1920 virtual design-space, letterbox scale-to-fit, DPR clamp ≤ 2 (HiDPI sắc nét nhưng chặn GPU mobile yếu).
- Fixed-step physics: accumulator, SIM_HZ = 120 (dt = 1/120s), clamp frame delta ≤ 50ms (anti spiral-of-death), render interpolation alpha = acc/dt cho chuyển động mượt tuyệt đối tại mọi refresh rate.
- 1-thumb input: pointer events thống nhất (touch/mouse/pen), vùng chạm toàn màn hình, hold = latch đèn hợp cực gần nhất (auto-select theo điểm số), release = văng tiếp tuyến. Không nút, không HUD bắt buộc trong lối chơi.
- Scene FSM: BOOT → MENU → RUN → REPLAY → GAMEOVER, chuyển cảnh 0 allocation.
- Physics blueprint (đơn vị virtual-px):
 · Tether pendulum: ω' = ω + (−(g/L)·sin θ)·dt; g = 2200; L co dần khi hold (reel-in): L' = L − 90·dt, floor 210px → cảm giác 'quay càng lâu càng nhanh'.
 · Tangential release: v = ω·L vuông góc bán kính, +15% impulse nếu release trong Perfect Window 12° quanh đỉnh tiếp tuyến đi lên.
 · Gravity tự do 2200 px/s², air drag v ×= (1 − 0.9·dt), terminal ~2600 px/s.
 · Collision: circle-circle swept (relative motion segment × circle) — không tunnel ở 120Hz.
- Lantern Spawn Director: khoảng cách đèn lerp(420→680, t/90s), biên độ sine-path của đèn tăng theo độ cao, RNG deterministic mulberry32(seed = dailySeed) cho Daily Run.
- Hoàn tất khi: chơi được 60 giây liên tục, điểm/latch hoạt động, chết và retry được trong < 400ms.

■ ITERATION 2 — ENTERPRISE JUICE (cảm giác studio):
- Object pooling toàn phần: ParticlePool 512 (ring buffer), TrailPool 64 điểm đom đóm, SparkPool 48, FloatTextPool 24 — khởi tạo 1 lần ở BOOT, RAF loop 0 allocation, 0 array.push/grow, 0 closure mới.
- Screen shake: trauma model — offset = maxOffset × trauma², trauma decay 1.6/s, rotational shake ≤ 1.2°.
- Hitstop: timescale 0 trong 90ms khi Near-Miss và 140ms khi Perfect chain ≥ 5 (đọng khung hình tạo weight).
- Squash & stretch đom đóm: scale 1.25/0.8 theo hướng vận tốc lúc latch, hồi nén lerp 8/s.
- Procedural WebAudio 0-asset (graph: master gain → DynamicsCompressor → destination, khởi tạo lazy):
 · unlockAudio: tạo/resume AudioContext trong handler cử chỉ đầu tiên (pointerdown), unlock trước mọi âm thanh.
 · Latch = pluck tam giác 220Hz cơ sở, exp decay 0.18s. Release = whoosh (noise buffer 0.4s qua bandpass sweep 300→2400Hz). Perfect = chime 2 tầng quãng 5. Death = saw gliss xuống 3 semitone + waveshaper méo nhẹ.
 · Combo ladder: thang ngũ cung C#-minor (C#, E, F#, G#, B) — mỗi Perfect chain +1 bậc, pitch = base × 2^(n/12) theo chuỗi scale, chain reset về bậc 0 khi dở dang.
 · Overdrive актив: thêm lớp arpeggio 16th-note delay-feedback 0.22s.
- Bảng màu gradient (brand-lock, không đổi): nền twilight dọc #0B1026 → #1B1035 → #2E1A47; cực NHIỆT (warm) #FFC94D → #FF4D9D; cực LẠNH (cool) #3DFFB4 → #4DE8FF; đom đóm player lõi trắng ấm #FFF6E0 viền theo cực tính hiện tại; chết chóc = tơ lụa đỏ #FF3355 alpha 0.9.
- Hoàn tất khi: mọi sự kiện game (latch/release/perfect/spark/near-miss/death) đều có ≥ 2 lớp phản hồi (visual + audio, ± shake/haptic vibrate(8) nếu có navigator.vibrate).

■ ITERATION 3 — ENTERPRISE HARDENING (bền vững thương mại):
- Visibility API: document.visibilitychange → pause FSM + audioContext.suspend(); resume chỉ bằng tap (chống mất mạng swing khi quay lại tab).
- LocalStorage schema v1 có version + try/catch quota/security: {ver:1, best, totalRuns, settings:{sfx:true, haptic:true}} — load an toàn khi bị chặn, migrate theo ver.
- Near-miss hitbox −20%: hitbox gây chết = visualR × 0.80 (thiên về người chơi — caro enterprise), Near-Miss zone = visualR × 1.35: sượt qua mà không chết → +Heat 12%, Heat 100% = Overdrive 6s (điểm ×2, arpeggio bật).
- Instant Replay < 150ms: ring buffer 9 snapshot trạng thái (pos, vel, trail segment) @60Hz, khi chết phát lại ở timescale 0.35 với vignette tối + tia đỏ, tổng thời lượng ≤ 1.2s rồi mới hiện GAMEOVER — người chơi hiểu CHẾT VÌ SAO.
- Resize/orientationchange/safe-area-inset: re-layout letterbox không mất trạng thái run; chặn pull-to-refresh và double-tap-zoom (touch-action:none, user-select:none).
- Hoàn tất khi: kill app giữa run → mở lại không crash; 10 lần chết liên tục đều có replay mượt; tắt/bật tab âm thanh không lệch.

═══════════════════════════════════════
ENTERPRISE ACCEPTANCE CRITERIA (nghiệm thu cuối — TẤT CẢ phải đạt, self-verify trước khi bàn giao):
✓ Standalone 100%: 1 file .html mở bằng file:// chạy đầy đủ — 0 asset ngoài, 0 CDN, 0 font tải về (dùng font stack hệ thống), 0 network request.
✓ 60 FPS locked: budget logic + render ≤ 12ms trên thiết bị tầm trung; dev HUD (gõ F3) hiển thị FPS/ms/frame-alloc để tự kiểm chứng.
✓ 0 GC allocation trong RAF: mọi vector/tin nhắn/đối tượng được preallocate ở BOOT và tái sử dụng; cấm string concat, array literal, closure mới, DOM write bên trong vòng RAF.
✓ Input 1-thumb hoàn hảo: PointerEvent coalesced, latency cảm nhận < 1 frame, tap nhầm mép màn hình không bao giờ chết oan (hitbox −20% đã bảo chứng).
✓ Audio: unlock đúng cử chỉ đầu tiên, không tiếng 'pop' click (envelope attack ≥ 5ms), im lặng tuyệt đối khi tab ẩn.
✓ Fairness: mọi cái chết đều thấy được trong Instant Replay; RNG deterministic cho Daily Seed (2 người chơi cùng seed gặp cùng layout).
✓ Retention loop: chết→retry 1 tap < 400ms; hiển thị BEST và 'cách 1 mốc điểm' ngay trên màn chết.

TECHNICAL BLUEPRINT (GLM tự định nghĩa, Agent có thể tinh chỉnh hằng số nhưng không đổi kiến trúc):
• Kiến trúc: module IIFE đơn scope, các hệ = plain object + mảng SoA preallocated (x,y,vx,vy,life… Float32Array), không class instantiation trong gameplay loop.
• Scoring: latch 10đ, Perfect 25đ × chain multiplier (1 + 0.25·chain, cap ×8), spark 5đ, height tick 1đ/40px; Near-Miss 15đ. Hiện floating-text pooled, hàng đơn vị ngăn cách locale 'vi-VN'.
• Difficulty curve: lanternGap = lerp(420, 680, min(1, t/90)); silk-hazard density bắt đầu giây 20, tỷ lệ = 0.15 + 0.002·t; tốc độ sine-path đèn = 30 + 0.8·t px/s, cap 140.
• Overdrive: Heat +12/near-miss, −4/s decay, ở 100 bật 6s ×2 điểm và nhiệt reset.
• Trail render: polyline gradient theo cực tính + additive globalCompositeOperation 'lighter', shadowBlur chỉ bật cho player (tối ưu GPU mobile).
• Chữ: font stack 'Segoe UI', system-ui, sans-serif — weight 600 cho số liệu, 800 cho title; mọi text vẽ Canvas fillText, cache measureText ra khỏi RAF.
```
