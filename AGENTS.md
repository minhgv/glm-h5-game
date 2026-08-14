# AGENTS.md — Quy tắc bắt buộc cho Coding Agent (OpenCode / GLM-5.3)

> Repository: `glm-h5-game` (Monorepo H5 Mini-Games)
> Model chủ lực: **GLM-5.3** (Z.AI Coding Plan)

---

## 1. Triết lý phát triển & Tiêu chuẩn chất lượng (MANDATORY)

- **Chuẩn hình ảnh Full HD 1080p Canvas & Procedural Art:**
  - Không vẽ hình khối cơ bản đơn sắc (cấm pixel/học sinh/prototype).
  - Sử dụng Canvas 2D / WebGL / CSS hiện đại với subpixel antialiasing (`ctx.imageSmoothingEnabled = true`, `imageSmoothingQuality = "high"`).
  - Render procedural vector, gradient đa tầng, shadow blur (rune/neon glow), particle effects (tia lửa, khói, bụi, vỡ mảnh).
- **Trải nghiệm Ergonomics & Mobile-First:**
  - Thiết kế Portrait Mobile-First (tối ưu touch), tự động scale responsive mượt mà trên cả Desktop (max-width container).
  - Độ trễ phản xạ người chơi: **250ms – 350ms**, trọng lực và quán tính được tune êm ái, tránh giật cục.
  - Hitbox công bằng: Giảm 20% bounding box collision để tạo khoảnh khắc né sát nút (Near-Miss) kịch tính.
- **WebAudio Procedural SFX (0 external asset bytes):**
  - Sử dụng WebAudio API oscillator + GainNode cho mọi âm thanh (nhấn nút, nảy, ăn điểm, game over, combo).
  - Tự động tích hợp cơ chế `unlockAudio()` khi người chơi chạm màn hình lần đầu để vượt rào cản Autoplay trên Mobile Safari/Chrome.

---

## 2. Quy ước cấu trúc thư mục & Độc lập từng Game

- Mỗi game được đóng gói trong **một thư mục con riêng biệt**: `games/<game-slug>/`
- Mỗi thư mục game bắt buộc gồm:
  1. `PROMPT.md`: Ý tưởng, PRD và Master Prompt ban đầu được sinh ra từ GLM.
  2. `index.html`: File ứng dụng độc lập chứa toàn bộ cấu trúc HTML5, CSS hiện đại và Engine JS logic.
  3. `README.md` (tùy chọn): Hướng dẫn chơi và ghi chú kỹ thuật ngắn gọn.
- **Không phụ thuộc vào CDN bên ngoài không ổn định**: Mọi thuật toán game loop, vật lý, đồ họa vector và âm thanh đều được tự triển khai sạch sẽ (Standalone Native).

---

## 3. Quy trình thực thi & Tự động Verify (0 Prompt)

1. **Đọc kỹ Master Prompt** trong `PROMPT.md` trước khi code.
2. **Tự động kiểm thử (Self-Verification):**
   - Đảm bảo file `index.html` được ghi đầy đủ, không cắt ngắn (`// ... code continues ...`).
   - Kiểm tra cú pháp JavaScript bằng lệnh: `node --check` (nếu tách file) hoặc validate DOM/JS tags.
   - Kiểm tra Game Loop 60 FPS requestAnimationFrame không gây memory leak (dọn dẹp event listener, object pooling cho particles).
3. **Báo cáo kết quả rõ ràng:**
   - Trạng thái: ✅ DONE
   - File đã tạo/sửa: `games/<slug>/index.html`
   - Tính năng đã tích hợp: Gameplay loop, SFX, Highscore localStorage, Particle VFX, Responsive Touch.
