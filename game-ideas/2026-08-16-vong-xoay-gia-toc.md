# Vòng Xoay Gia Tốc — Angular Rush

- **Ngày:** 2026-08-16
- **Genre:** Arcade 1-Thumb Polar Runner (Bảo toàn Động Lượng Quay × Graze Near-Miss Economy)
- **Mô tả:** Bạn là sao chổi tự quay quanh lõi năng lượng trên 3 vành đai đồng tâm; gõ 1 ngón để nhảy vành — nhảy vào trong bạn quay NhanH hơn theo định luật bảo toàn động lượng (như vận động viên trượt băng thu tay), càng nhanh càng dễ chết nhưng càng 'cạo' được nhiều điểm near-miss. Cảm giác chơi: nhịp tim dồn theo tiếng drone tăng pitch, mỗi cú nhảy là một canh bạc giữa momentum và tử thần.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
MASTER PROMPT — VÒNG XOAY GIA TỐC (ANGULAR RUSH)
Game Studio Director Brief: xây game H5 Arcade thương mại chuẩn Enterprise, KHÔNG phải demo sinh viên.

/goal XÂY DỰNG MỘT TỰA GAME ARCADE THƯƠNG MẠI HOÁ ĐƯỢC: 'Vòng Xoay Gia Tốc' — polar one-thumb runner với USP = bảo toàn động lượng quay (nhảy vào trong → quay nhanh hơn) gắn với nền kinh tế điểm near-miss (graze). Sản phẩm cuối: 1 file index.html standalone 100%, 0 asset ngoài, chạy được từ file://, 60 FPS locked, 0 garbage-collection trong RAF, có meta-progression + instant replay + full settings — chất lượng đủ đóng gói lên portal (Poki/CrazyGames). Mọi tính năng phải phục vụ đúng 1 vòng lặp gây nghiện: RỦI RO (quay nhanh) → PHẦN THƯỞNG (graze × combo) → ĐỈNH ĐIỂM (overdrive) → CHẾT → MỘT LẦN NỮA.

NGUYÊN TẮC TỰ TRỊ (AUTONOMOUS — KHÔNG HỎI LẠI, KHÔNG DỪNG GIỮA CHỪNG):
Mỗi iteration: (1) BUILD đúng spec bên dưới → (2) SELF-TEST bằng checklist DoD (viết micro-test in-page nếu cần) → (3) chỉ PASS 100% mới được sang vòng sau; nếu FAIL thì sửa tối đa 3 lần, lần 3 vẫn fail → giữ nguyên spec nhưng đơn giản hoá cách code. Sau Iteration 3 chạy nghiễm thu cuối (mục ACCEPTANCE) và in bảng PASS/FAIL từng tiêu chí trước khi kết thúc.

=== ITERATION 1 — CORE ENGINE ===
- Canvas 1080×1920 logical; HiDPI: backing size = 1080 × min(devicePixelRatio, 2), ctx.setTransform(scale,0,0,scale,0,0); CSS 100dvh; overscroll-behavior:none; touch-action:none; chặn double-tap-zoom + long-press-menu.
- Vòng lặp: requestAnimationFrame → accumulator fixed-step dt = 1/120 s; clamp frameDelta ≤ 250 ms (tab-switch không nổ vật lý); render dùng interpolation alpha = acc/dt.
- Input 1-thumb: duy nhất pointerdown (chuẩn hoá pointer/mouse/touch); tap = hop sang rail kế tiếp theo chu kỳ R1→R2→R3→R1; hop R3→R1 là SLINGSHOT (đặc quyền tốc độ, xem 5.3); chỉ nhận pointer ĐẦU TIÊN, bỏ các pointer sau (chống lòng bàn tay).
- FSM: BOOT → MENU → RUN → PAUSE → REPLAY → DEAD; restart sạch hoàn toàn (không rò object, không listener trùng).
- Vật lý polar mỗi fixed-step: θ += ω·dt; r tích phân lò xo; va chạm tính TRỰC TIẾP trong toạ độ polar (rẻ hơn Cartesian).
- Spawner: hazard arc đặt trước theo θ trong cửa sổ 2π sắp tới; recycle khi đã đi qua; seed RNG mulberry32 cho deterministic.
- DoD: chơi trơn 120s không lỗi NaN/Infinity; bước vật lý đều; học cách chơi ≤ 5s (1 icon bàn tay + demo tự chạy sau 3s idle ở menu).

=== ITERATION 2 — ENTERPRISE JUICE ===
- Particle pool 512 prealloc + shockwave pool 24 + floating-text pool 16 (free-list, batch draw theo màu) — 0 allocation trong RAF.
- Comet trail: ring buffer 24 điểm, vẽ line taper gradient; parallax starfield 2 lớp (64 + 32 điểm) trôi ngược ω để khuếch đại cảm giác quay.
- Screen shake hệ trauma: shake = trauma²; offset = shake·18px, xoay ±shake·0.8°, noise = sin(t·47.3) + sin(t·31.7) per trục; decay 2.2/s; graze +0.12, hop +0.05, tier-up +0.35, death +0.7; mỗi event shake ≤ 250ms (không gây nauseated).
- Hitstop (timeScale = 0): death 120ms; tier-up 60ms; mốc combo mỗi ×10: 45ms; KHÔNG hitstop cho graze thường (phá nhịp chơi).
- Procedural WebAudio 0-asset (bảng tần số đầy đủ ở 5.6): unlockAudio() trong pointerdown đầu tiên (new AudioContext + resume, resume lại khi visible); TOÀN BỘ node/voice prealloc lúc init. Drone momentum 2 saw 55.0/55.5Hz qua lowpass cutoff 200–2400Hz map theo ω — người chơi NGHE THẤY mình đang nhanh bằng cách nào; graze ping pentatonic leo thang theo combo; overdrive mở lớp arpeggio 1/16.
- DoD: phân biệt được bằng tai ω cao/thấp khi đổi rail; zero-click rule (envelope attack/release ≥ 5ms, không pop); đo 0 alloc/frame bằng heap snapshot 60s.

=== ITERATION 3 — ENTERPRISE HARDENING ===
- Visibility API: document hidden hoặc window blur → auto PAUSE + audioCtx.suspend(); overlay ĐÃ TẠM DỪNG — chạm để tiếp tục (không auto-resume, tránh chết oan).
- LocalStorage key 'vxgt_v1' (mọi truy cập bọc try/catch, quota-full fallback default): {ver, best, totalRuns, sparksTotal, paletteUnlocked[], settings{audio,shake,motion}}.
- Near-miss hitbox −20%: visual r = 26px → lethal r = 20.8px; graze band 20.8–34px; 1 graze mỗi hazard mỗi lượt đi qua; debug overlay (?debug=1 hoặc gõ H) vẽ cả 2 hitbox để nghiệm thu.
- Instant Replay < 150ms: ring buffer 90 snapshot @ 30Hz (3s) prealloc bằng Float32Array ghi đè (0 copy garbage); khi chết replay 2.2s cuối ở tốc độ 0.35× slow-mo dùng đúng pipeline render, tap để skip.
- Anti-frustration: 0.8s spawn-grace sau start/restart; settings in-game: audio / shake / reduced-motion (giảm 50% particle) / palette — áp dụng ngay không reload.
- DoD: checklist hardening pass 100%; soak 30 phút heap flat ±2%; 50 lần tab-switch không đăng ký listener trùng.

=== ENTERPRISE ACCEPTANCE CRITERIA — NGHIỆM THU CUỐI (bắt buộc 100% PASS) ===
AC-1 Standalone: đúng 1 file index.html; mở bằng file:// chạy ĐỦ tính năng; DevTools Network = 0 request ngoài; không font/ảnh/icon/eval từ ngoài.
AC-2 Performance: 60 FPS @ 1080p HiDPI (dpr ≤ 2) trên Chrome Android mid-range; frame CPU budget ≤ 8ms; không rơi > 2 frame liên tiếp khi 300 particle + 20 hazards active.
AC-3 Zero-GC RAF: Allocation instrumentation 10 phút gameplay = 0 byte alloc trong update/render path (chỉ cho phép alloc lúc init/menu/restart); heap 30 phút dao động ±2%.
AC-4 Determinism: fixed-step + seeded RNG → cùng input script cho cùng kết quả (self-test: chạy 10.000 tap từ seed cố định, hash trạng thái, chạy lại, hash phải trùng khớp).
AC-5 Input: pointerdown → thay đổi hiển thị ≤ 1 frame; touch target ≥ 96px logical; double-tap-zoom và context-menu bị chặn hoàn toàn.
AC-6 Robust: 8 giờ soak không exception/NaN/Infinity; resize/rotate 20 lần không vỡ canvas; localStorage lỗi/đầy → game vẫn chạy với default.
AC-7 UX thương mại: từ chết → tap restart ≤ 400ms; hiển thị BEST + NEW BEST + dòng (hơn X% lượt chơi, công thức 100·(1−e^(−best/2200)) làm mềm); meta unlock hiện rõ điều kiện.

=== TECHNICAL BLUEPRINT (spec chi tiết đã chốt — implement đúng) ===

5.1 RENDER & KHÔNG GIAN
- Logical 1080×1920; lõi tại (540, 700); 3 rails bán kính 170 / 280 / 390; hazard là arc nằm TRÊN rail (tường tĩnh theo θ, blade tự quay, gate nhấp nháy) — player quay vào chúng, distance = cung đường đã đi.
- Render order: bg gradient → grid rings → hazards → sparks → trail → player → particles → shockwaves → floating text → vignette + flash overlays → HUD.
- Vignette pre-render 1 lần offscreen canvas, mỗi frame chỉ drawImage. HUD dirty-flag: chỉ chạm DOM/text khi giá trị đổi.

5.2 BẢNG MÀU (PALETTE NEBULA — mặc định)
- BG radial 3-stop: #05060F (0%) → #0B1026 (55%) → #131A3A (100%); rings rgba(148,163,184,0.08); lõi: dashes conic #22D3EE → #A78BFA quay 0.3 rad/s; player #F8FAFC, trail #F8FAFC → #67E8F9 → transparent; tường #FB7185; blade #F472B6; pulse gate #FB923C; spark #FDE68A; graze spark #A5F3FC; overdrive tint #FEF3C7 alpha 0.06 (composite lighter); death flash #FEF08A trong 90ms.
- Palette unlock theo best: SUNSET (≥1500): bg #1A0B2E→#3B0D2E, accents #FBBF24/#F87171/#FCA5A5. TOXIC (≥4000): bg #041F10→#0B2E13, accents #A3E635/#22D3EE/#FDE047. GOLD (≥10000): bg #141003→#2E2308, accents #FCD34D/#FDE68A/#FFF7DB.

5.3 CÔNG THỨC VẬT LÝ (rad, s, px-logical)
- θ(n+1) = θn + ω·dt.
- Hop: r'' = −k·(r − r_target) − c·r'; k = 180 s⁻², c = 2·0.85·√k ≈ 22.8 s⁻¹ (underdamped nhẹ, cảm giác nảy); hop cooldown 90ms.
- BẢO TOÀN ĐỘNG LƯỢNG khi chạm đích rail: ω_new = ω_old·(r_old/r_new)². Ví dụ R2→R1: ω ×2.71 (nóng); R2→R3: ω ×0.52 (thở). SLINGSHOT R3→R1: sau công thức trên cộng thêm ω ×1.15 rồi clamp ω ∈ [0.9, 4.2] rad/s.
- Baseline relaxation chống diverge: ω_base(r) = 1.6·(280/r)²; mỗi bước ω += (ω_base − ω)·dt/4 (hằng số 4s) — slingshot là lợi thế THỜI, phải tận dụng ngay.
- Distance: m += ω·r·dt/50; tier = ⌊m/500⌋.
- Va chạm polar: Δθ_eff = atan2(sin(θp−θh), cos(θp−θh)); chết khi |Δθ_eff| < (halfArc + angularHalfPlayer) VÀ |r_player − r_rail| < 20.8 + halfThickness. Pulse gate chỉ giết khi phase đóng (chu kỳ 1.6s, duty 55%, phase-lock theo spawn-time để người chơi ĐỌC được nhịp). Blade có ω_h riêng trong ±[0.4, 1.1] rad/s.

5.4 SPAWNER & ĐƯỜNG KHÓ
- Interval: T(m) = max(0.55, 1.4·0.93^tier) giây/hazard; gap góc tối thiểu = max(14°, 30°·0.94^tier).
- Phân bổ rail 45/35/20% (R1 khó hơn, đổi lại grazeMultiplier R1 = 1.5, R2 = 1.0, R3 = 0.8 — thưởng chơi nhanh ở trong cùng).
- Mở khoá hazard theo tier: tường (t0), blade (tier ≥ 2), pulse gate (tier ≥ 4), double-wall (tier ≥ 6), eclipse (tier ≥ 8: tối 0.5s mỗi 10s, chỉ còn trail phát sáng).
- Spark spawn 30% mỗi interval, LUÔN đặt trong gap an toàn (không bao giờ là bẫy).

5.5 COMBO & SCORING
- Graze: +1 combo, +25·mult điểm; spark: +2 combo, +50·mult; sống sót: +10·mult mỗi giây; tier-up: +200·mult; graze giữa lúc đang bay giữa 2 rail (mid-hop): ×1.5 điểm.
- Combo window 2.5s (mỗi graze/spark reset); hết window → CHAIN BREAK: combo = 0, floating text, âm thanh descending.
- mult = 1 + min(⌊combo/5⌋, 7) → tối đa ×8. OVERDRIDE khi combo ≥ 20: tổng điểm ×2, drone mở layer arpeggio, tint #FEF3C7, trail bùng sáng.

5.6 SYNTHESIZER (WebAudio 0-asset; mọi role prealloc ×8 voice, không tạo AudioNode sau init)
- Graph: [drone bus + sfx bus] → DynamicsCompressor(threshold −18dB, ratio 8, knee 6dB) → master gain 0.8 → destination.
- Momentum drone (liên tục): 2 saw 55.0Hz + 55.5Hz (beat 0.5Hz) → lowpass Q=8, cutoff = 200 + 2200·(ω−0.9)/(4.2−0.9) Hz, gain 0.14; overdrive thêm sub 27.5Hz gain 0.06.
- Graze ping: A-major pentatonic f = 440·2^(s/12), s ∈ {0,2,4,7,9}; note = combo mod 5, octave = min(⌊combo/5⌋, 2); triangle, attack 5ms, decay 0.18s, gain 0.12 — chuỗi graze tự thành giai điệu leo thang.
- Hop: noise bandpass 800Hz Q4 60ms + sine 90Hz thump 90ms, gain 0.18; slingshot thêm sweep sine 220→440Hz 120ms.
- Spark: sine gliss 1320→1760Hz 80ms gain 0.1. Tier-up: chime 660/880/1320Hz stagger 50ms triangle gain 0.15.
- Death: saw sweep 220→30Hz 0.6s (exponentialRamp) + noise crash lowpass 400Hz 0.5s gain 0.3; drone fade to 0. Chain break: 392→262Hz sine 120ms. Menu tap: 990Hz square 40ms gain 0.06.

5.7 JUICE BỔ SUNG
- Pattern: graze → 3 hạt #A5F3FC; spark → 6 hạt #FDE68A + shockwave; death → 64 hạt + shockwave kép + flash #FEF08A; sau hitstop lớn vẽ player 2 lớp lệch 2px alpha 0.25 trong 90ms (chromatic giả). Floating text dùng system font stack, số tabular.

5.8 REPLAY DATA LAYOUT
- Float32Array ring 90 slot: mỗi slot = {t, θ, r, ω, alive} của player + 64 hazard × 4 float (θ, halfArc, rail, type) ghi đè vòng — không bao giờ tạo mảng mới; playback chỉ ĐỌC và vẽ lại bằng pipeline render hiện có (không chạy lại vật lý).

5.9 CẤU TRÚC CODE (1 file, IIFE 'use strict', mục tiêu ~1500 dòng)
- CFG (frozen) → mulberry32(seed) → Pool(n, factory) → AudioBus{init, unlock, sfx, setMomentum(ω)} → Input{pointerdown, multi-guard} → Pools: Player, Hazard, Spark, Particle, Shockwave, FloatText, ReplayRing → Systems: physics(dt), spawner(dt), collision(dt), scoring(dt), juice(dt) → Render(alpha) → FSM → Save{load, save, migrate} → Boot.
- Hot path (RUN update + render) CẤM: string concat, array/object literal, tạo closure, truy cập DOM — HUD chỉ cập nhật qua dirty-flag.

XUẤT PHẨM CUỐI: file index.html duy nhất + hidden debug mode (?debug=1: FPS meter, hitbox visual/lethal −20%, allocation counter). Agent PHẢI in báo cáo AC-1 → AC-7 với PASS/FAIL trước khi kết thúc.
```
