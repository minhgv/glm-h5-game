# AGENTS.md — Quy tắc bắt buộc cho Coding Agent (OpenCode / GLM-5.3)

> **Repository:** `glm-h5-game` (Monorepo H5 Mini-Games)  
> **Model chủ lực:** **GLM-5.3** (Z.AI Coding Plan / OpenCode)  
> **Tiêu chuẩn chất lượng:** **Enterprise Arcade Studio Standard** (Zero-Build, 60 FPS Locked, Native WebAudio, Zero External Assets)

---

## 1. Triết lý phát triển & 6 Quy tắc kỹ thuật bất khả xâm phạm (Non-Negotiable)

Mọi game sản xuất trong repository này phải đạt tiêu chuẩn thương mại hóa (Shippable), hoạt động mượt mà trên thiết bị di động tầm trung, không lỗi State Machine, an toàn âm thanh và hỗ trợ cả Touch lẫn Keyboard.

### 1.1. Zero Build Step & Plain ES Modules
- Sử dụng cấu trúc module thuần `<script type="module">`.
- **CẤM** phụ thuộc vào bundler (Webpack/Vite), CDN bên ngoài hoặc `npm install` để chạy game.
- Toàn bộ game phải chạy được ngay trên bất kỳ Static Web Server nào (`python3 -m http.server`).

### 1.2. Fixed-Timestep Simulation (60Hz) & Interpolated Render
- Tách biệt hoàn toàn giữa **Vật lý/Logic (`update(step)`)** và **Hiển thị (`render(alpha)`)**:
  - `step = 1 / 60` (cố định 60Hz). Mọi tính toán vị trí, gia tốc, va chạm chỉ chạy trong `update(step)`.
  - Hàm `render(alpha)` chỉ nhận hệ số nội suy `alpha` để vẽ, **tuyệt đối không thay đổi trạng thái vật lý** trong hàm render.
- Giới hạn `maxSubSteps = 5` và `clampDt = 0.25s` để chống hiện tượng *Spiral of Death* khi tab bị giật hoặc người chơi mở DevTools.

### 1.3. Zero-Allocation Hot Loop (Object Pooling)
- **Khóa cứng 60 FPS — CẤM cấp phát bộ nhớ mới (`new Object()`, `new Array()`) trong `requestAnimationFrame`**:
  - Toàn bộ Particle VFX, Bullets, Floating Texts, Spawns phải dùng **Object Pool** với dung lượng cấp phát tĩnh định sẵn (Static Pool).
  - Tái sử dụng hạt cũ qua cơ chế `swap-remove` khi hết vòng đời.
  - Ngăn chặn hoàn toàn hiện tượng giật cục do Garbage Collection (GC Spikes).

### 1.4. WebAudio Procedural Synthesizer (0 External Assets)
- 100% âm thanh được sinh động bằng WebAudio API `OscillatorNode` + `GainNode` + `BiquadFilterNode` (không tải file MP3/WAV ngoài):
  - Hỗ trợ âm sắc pitch-sweep tone (nhảy, ăn điểm, powerup) và filtered noise burst (va chạm, tiếng nổ).
  - **Lazy Initialization & Autoplay Unlock:** Tự động mở khóa `AudioContext` qua sự kiện `pointerdown` / `touchstart` đầu tiên của người dùng.
  - Mặc định `masterVolume ≤ 0.4`, hỗ trợ lưu trạng thái Mute.

### 1.5. Responsive Virtual Viewport & Ergonomics
- Canvas dựng trên một **độ phân giải ảo logic cố định** (ví dụ: `1080 × 1920` cho màn hình dọc Portrait).
- CSS tự động căn giữa và scale letterbox linh hoạt trên mọi kích thước màn hình điện thoại & Desktop.
- Bắt buộc gắn thuộc tính CSS `touch-action: none;` trên thẻ canvas để triệt tiêu độ trễ cuộn trang của trình duyệt.
- **Hitbox công bằng:** Giảm 20% bounding box va chạm của nhân vật so với hình ảnh thực để tạo cảm giác né sát nút (Near-Miss) kịch tính.

### 1.6. Page Visibility API & State Machine
- Game phải được quản lý qua State Machine rõ ràng: `BOOT ➔ MENU ➔ PLAYING ➔ PAUSED ➔ GAMEOVER`.
- Tự động gắn listener `document.addEventListener('visibilitychange')`:
  - Khi ẩn tab: Tự động pause game loop và ngắt AudioContext.
  - Khi hiện tab: Reset `lastTime = 0` để tránh nhảy vọt frame khi tiếp tục chơi.
- Lưu trữ điểm cao (Highscore) và cài đặt qua `localStorage` bọc trong `try/catch` an toàn.

---

## 2. Quy ước cấu trúc thư mục & Modular 3-File

Mỗi tựa game được đóng gói độc lập trong thư mục `games/<slug>/` và chia tách module rõ ràng để chống nghẽn output stream:

```
games/<slug>/
├── index.html        # Khung DOM, meta mobile viewport, canvas container, HUD overlay (<200 dòng)
├── style.css         # CSS responsive layout, typography, animations, HUD layout (<200 dòng)
├── game.js           # Engine loop, State machine, Input, Audio synth, Particle pool, Logic (<800 dòng)
├── PROMPT.md         # Master Prompt & PRD đặc tả kỹ thuật gốc từ GLM
└── README.md         # Hướng dẫn chơi, phím điều khiển, bảng tham số tuning
```

---

## 3. Quy trình thực thi & Kiểm thử tự động (Self-Verification)

Mỗi khi nhận lệnh code hoàn thiện hoặc nâng cấp game:

1. **Đọc kỹ `PROMPT.md`** để nắm trọn vẹn Gameplay Loop và hệ số cân bằng (Game Balance).
2. **Triển khai tuần tự qua 3 Giai đoạn (3-Phase Implementation):**
   - **Phase 1 (Core Engine):** Dựng `index.html`, `style.css`, Canvas rendering context HiDPI và bộ lắng nghe phím/touch.
   - **Phase 2 (Physics & Gameplay):** Xây dựng vòng lặp Fixed-timestep, logic tương tác, va chạm Near-miss, WebAudio Synth và Object-pooled Particle VFX.
   - **Phase 3 (Juice & Hardening):** Thêm Screen Shake, Hitstop, Animation Easing, Visibility API tab-pause, lưu Highscore vào LocalStorage và Instant Replay (<150ms).
3. **Tự động kiểm tra tính toàn vẹn (0 Prompt):**
   - Chạy lệnh `node --check game.js` đảm bảo không có bất kỳ lỗi cú pháp nào.
   - Đảm bảo mã nguồn hoàn chỉnh 100%, tuyệt đối không để lại code stub hay comment dở dang (`// TODO...`).
