# DAY CƯA — Đấu Diều Bão Gió

- **Ngày:** 2026-08-16
- **Genre:** Arcade Skill 1-thumb (H5 portrait) — Vật lý con lắc Verlet dây diều + duel cắt dây thời gian thực; điều khiển hyper-casual, độ sâu mid-core, nâng cấp theo wave (Mùa).
- **Mô tả:** Bạn không điều khiển chiếc diều — bạn điều khiển người thả diều: kéo ngón tay cái chạy theo gió, thu dây/thả dây, giật nhịp để dây ai-cưa-đứt-dây-ai. Mỗi lần cắt là pháo giấy, mỗi combo là cả cơn bão hồi gió đè đối thủ về phía dây bạn.
- **Nguồn:** GLM-5.3 (Z.AI Coding Plan)

---

## Master Prompt (Production-Ready)

```text
══════ /goal (STANDING GOAL — CHUẨN ENTERPRISE ARCADE STUDIO) ══════
Xây dựng và hoàn thiện DAY CƯA: game arcade H5 portrait, 1 file HTML standalone, thương mại hoá được (session 3–5 phút, mục tiêu retention D1 > 35%, mô hình rewarded-continue 1 lần/run). Chuẩn enterprise: deterministic physics, 0 garbage allocation trong RAF, audio 0-asset, graceful degradation (mất audio/mất localStorage vẫn chơi được), analytics hook no-op sẵn sàng cắm. Phân biệt amateur: MỌI con số kỹ thuật (màu, tần số, vật lý, độ khó) đều được định nghĩa trước ở blueprint này và không được biến tấu tùy hứng; mọi tradeoff phải ghi vào log DECISIONS cuối file.
Nguyên tắc đứng: (1) đúng 1 ngón cái — mọi cơ chế chỉ dùng 1 pointer đơn. (2) Chết luôn là lỗi đọc-gió của người chơi, không bao giờ là đòn không thể thấy. (3) p95 frame time < 16.7 ms trên mọi thiết bị mục tiêu, không ngoại lệ.

══════ VÒNG LẶP TỰ TRỊ (AUTONOMOUS ITERATION LOOP) ══════
Quy tắc: sau mỗi iteration, tự chạy CHECKLIST DoD của nó (đo bằng console timing + kiểm mắt). Nếu fail → sửa tối đa 3 vòng con rồi mới sang giai đoạn sau; mọi tradeoff còn tồn ghi vào DECISIONS. Không được bỏ, không được gộp iteration.

── ITERATION 1 — CORE ENGINE (chưa juice, chưa âm thanh) ──
• Canvas design-space 1080×1920, DPR clamp ×2, letterbox scale-to-fit, offscreen bg tĩnh vẽ 1 lần lúc boot.
• Fixed-step: dt = 1/60 s, accumulator, max 4 catch-up steps (chống spiral-of-death), render interpolation theo alpha.
• Dây diều: chuỗi Verlet 16 node, constraint relaxation 6 iterations/step. Diều = điểm khối với lift/drag theo công thức blueprint.
• Trường gió: tổng 3 octave sine + gust Poisson (công thức bên dưới).
• Input 1-thumb: pointermove X → anchor X (spring k=14 s⁻¹); Y → thu/thả dây (độ dài 45%..100%); tap nhanh <150 ms → TWITCH (giật dây, tension spike 250 ms — đây là động từ kỹ năng dùng để cắt).
• 1 enemy diều AI wand; cắt đứt dây enemy → enemy rơi; dây player đứt → chết → màn restart.
• DoD: input mượt không lag; phép thử giao đoạn dây đúng; FPS meter on-screen giữ 60; restart < 300 ms.

── ITERATION 2 — ENTERPRISE JUICE ──
• Particle pool SoA: Float32Array 2048 slot × 8 field, zero-alloc, tái sử dụng vòng ring.
• Screen shake theo TRAUMA model: offset = shake²·trauma, tối đa 18 px + xoay 2.2°, decay 1.8 s⁻¹.
• Hitstop: cắt dây 60 ms, player chết 180 ms (timeScale = 0, không dừng RAF).
• WebAudio procedural 0-asset: dựng toàn bộ graph lúc boot, unlockAudio() tại pointerdown đầu tiên (resume + start wind bed).
• Combo GIÓ MÙA + talisman + near-cut spark theo bảng synth/bảng combo bên dưới.
• DoD: mọi event quan trọng đều nghe thấy + thấy được; không frame nào > 20 ms khi 512 particle đang sống.

── ITERATION 3 — ENTERPRISE HARDENING ──
• Visibility API: tab ẩn → pause + audio.suspend + reset accumulator; resume không được để vật lý nhảy (bỏ delta lớn).
• LocalStorage schema daycua.v1: {best, talismans, settings, skins} — mọi truy cập bọc try/catch, fallback RAM.
• Near-miss hitbox: player hitbox thu 20% so với visual; vùng near-cut 14 px → slow-mo 120 ms + bonus điểm.
• INSTANT REPLAY: ring buffer 180 snapshot Float32Array cấp phát sẵn; chết → hitstop 180 ms → replay 3 giây cuối ×0.5 tốc độ có letterbox; độ trễ chết→replay < 150 ms (chỉ re-render từ buffer, cấm serialize).
• Perf audit: DevTools Allocation sampling 30 giây gameplay steady-state = 0 B/s.
• Standalone test: mở bằng file:// + airplane mode, chơi đủ 1 run không lỗi.

══════ ACCEPTANCE CRITERIA (NGHIỆM THU ENTERPRISE) ══════
1. Standalone 100%: 1 file HTML, Network panel = 0 request, chạy từ file://.
2. 0 asset ngoài: hình = Canvas2D procedural, âm = WebAudio synthesis thuần.
3. 60 FPS locked: p95 frame < 16.7 ms, không frame > 33 ms, dưới CPU throttle 4×.
4. 0 GC trong RAF: steady-state 0 B/s; không closure, không array/object literal, không string concat trong hot path; điểm số render bằng glyph atlas pre-rendered.
5. Input→render cùng frame; cold boot < 1 s; restart < 300 ms; chơi trọn game bằng 1 ngón trên màn ≥ 5 inch.

══════ TECHNICAL BLUEPRINT (CHUẨN HOÁ — KHÔNG BIẾN TÁU) ══════
[PALETTE] Nền bão hoàng hôn: linear-gradient dọc #0B1026 → #2B1A4E → #7A2E4F → #FF7A3D, mặt đất #12081F. Diều player: đỏ son #E8382F viền gold #F2B441; dây phát sáng rgba(255,236,170,α). Enemy tier: teal #29D9C2 (chậm), magenta #E14ECF (nhanh), bão #5B6B8C viền trắng. UI #F5EAD0; combo flame #FFD166→#EF476F. Mọi gradient tạo 1 lần lúc boot, cache offscreen.
[VẬT LÝ — px design-space] Gió: W(t,x) = Σ Ai·sin(ωi·t + ki·x + φi), A = 40/26/14 px/s, ω = 0.7/1.9/4.3 rad/s; gust Poisson λ = 1/6 s, boost +180 px/s decay τ = 1.2 s. Diều (m=1): a = (Laero + Ttension + G)/m; lift = Cl·|vrel|², Cl(α) = 1.2·sin(2α), α = góc dây–gió; drag = 0.02·|vrel|² ngược vrel. Dây Verlet: 16 node, segment nghỉ 34 px, gravity 900 px/s², damping 0.995, relaxation ×6; tension = độ giãn trung bình clip [0,1]. Twitch: tension ×2.2 trong 250 ms decay tuyến tính. CẮT DÂY: khi 2 đoạn dây giao nhau (sweep-and-prune theo trục x để loại cặp xa): tốc độ cưa = |Δv|·tension_attacker·sin(θ giao); damage tích lũy tại điểm giao, ngưỡng đứt 24 — bên đạt ngưỡng trước cắt đứt dây bên kia. Diều chạm diều KHÔNG chết, chỉ đẩy nhau (impulse 300).
[COMBO & SCORING] Cut = 100 × mult; talisman = 10; near-cut = 25; sống sót 1 đ/s. Combo window 4 s, mult = min(9, 1 + chain); combo ≥ 5 → HỒI GIÓ 2.5 s: gió ép mọi enemy về mặt phẳng dây player. Độ khó: spawn interval = max(0.9, 3.2 − 0.18·wave) s; enemy speed ×(1 + 0.07·wave); mỗi 60 s lên 1 MÙA (Nhẹ → Gió → Bão: nền tối dần, gió +35%, mưa particle). Seeded run hằng ngày bằng mulberry32 từ ngày hệ thống.
[AUDIO — mọi node tạo lúc boot] Wind bed: noise buffer 2 s loop → bandpass 400–900 Hz, LFO 0.13 Hz, gain scale theo tension. Cut: saw 180→58 Hz pitch-env 90 ms + noise HP 2 kHz 40 ms + sub sine 46 Hz 120 ms. Twitch: triangle pluck 320 Hz decay 60 ms. Talisman: FM bell, carrier 880 Hz, mod ratio 3.01, index decay 300 ms. Combo ladder ngũ cung just intonation: 220 Hz × [1, 9/8, 5/4, 3/2, 5/3, 2, 9/4, 5/2, 3] theo chain 1→9. Chết: noise LP sweep 6k→120 Hz 600 ms + heartbeat sine 55 Hz kép. Master chain: compressor −18 dB knee 24 → limiter −1 dBFS.
[MEMORY BUDGET] particles 2048×8 float; enemies pool 64 object; replay ring 180 snapshot × Float32Array; tổng heap steady ≤ 12 MB; sau boot không cấp phát động nữa. Analytics/monetize: window.__dc?.event(name) no-op; slot rewarded-continue = countdown 5 s, 1 lần/run.
```
