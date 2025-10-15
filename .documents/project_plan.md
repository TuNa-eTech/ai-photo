# Kế hoạch Triển khai Dự án - AI Image Stylist

Đây là tài liệu theo dõi tiến độ các công việc cần làm để hoàn thành dự án. Đánh dấu `[ ]` vào các mục đã hoàn thành.

---

### Giai đoạn 1: Thiết lập Hạ tầng Backend

*Mục tiêu: Xây dựng nền tảng hạ tầng vững chắc cho backend service.*

- [ ] **1.1. Thiết lập Cơ sở dữ liệu:**
  - [ ] Chọn và triển khai một hệ quản trị cơ sở dữ liệu (ví dụ: PostgreSQL).
  - [ ] Thiết kế schema và tạo các bảng cần thiết (`users`, `templates`, ...).
- [ ] **1.2. Thiết lập Dịch vụ Lưu trữ (Storage):**
  - [ ] Chọn và cấu hình một giải pháp lưu trữ đối tượng (ví dụ: MinIO, AWS S3).
  - [ ] Tạo các bucket/container cần thiết cho ảnh gốc và ảnh đã xử lý.
- [ ] **1.3. Quản lý Secrets:**
  - [ ] Thiết lập một giải pháp quản lý biến môi trường và các thông tin nhạy cảm (API keys, connection strings).
  - [ ] Thêm API Key của Gemini (hoặc AI API khác) vào hệ thống quản lý secret.

---

### Giai đoạn 2: Phát triển Backend Service (Go)

*Mục tiêu: Hoàn thành logic xử lý cốt lõi của ứng dụng.*

- [ ] **2.1. Khởi tạo Project Go:**
  - [ ] Cấu trúc thư mục cho project backend.
  - [ ] Khởi tạo Go module.
- [ ] **2.2. Phát triển các API Endpoint:**
  - [ ] Xây dựng endpoint cho xác thực (đăng ký, đăng nhập).
  - [ ] Xây dựng endpoint để lấy danh sách templates.
  - [ ] Xây dựng endpoint `process-image` để xử lý ảnh:
    - [ ] Nhận `template_id` và thông tin ảnh từ request.
    - [ ] Lấy `prompt` và API key một cách an toàn.
    - [ ] Tải ảnh gốc từ storage.
    - [ ] Gọi đến Gemini API với prompt và ảnh.
    - [ ] Upload ảnh kết quả vào storage.
    - [ ] Trả về URL của ảnh kết quả.
- [ ] **2.3. Xử lý lỗi:**
  - [ ] Bổ sung logic xử lý lỗi cho tất cả các bước.
- [ ] **2.4. Viết Unit Test:**
  - [ ] Viết unit test cho các business logic quan trọng.
- [ ] **2.5. Đóng gói và Triển khai:**
  - [ ] Viết Dockerfile để đóng gói ứng dụng Go.
  - [ ] Triển khai service lên môi trường Staging để kiểm thử.

---

### Giai đoạn 3: Phát triển Frontend (iOS App)

*Mục tiêu: Xây dựng một ứng dụng iOS hoàn chỉnh, mượt mà và dễ sử dụng.*

- [ ] **3.1. Thiết lập Project Xcode:**
  - [ ] Thiết lập networking layer để giao tiếp với backend Go.
  - [ ] Cấu hình các biến môi trường để kết nối đến các môi trường backend (Staging, Production).
- [ ] **3.2. Xây dựng luồng Xác thực:**
  - [ ] Tạo màn hình Đăng nhập / Đăng ký.
  - [ ] Tích hợp với API xác thực của backend.
- [ ] **3.3. Xây dựng các màn hình chính:**
  - [ ] Màn hình Thư viện Template (lấy dữ liệu từ API).
  - [ ] Màn hình Chọn ảnh (dùng `PHPickerViewController`).
  - [ ] Màn hình Tải lên và Xử lý (gọi API `process-image`).
  - [ ] Màn hình Hiển thị kết quả.
- [ ] **3.4. Hoàn thiện tính năng:**
  - [ ] Thêm chức năng "Lưu ảnh vào thư viện".
  - [ ] Xử lý các trạng thái UI (loading, error, success).

---

### Giai đoạn 4: Tích hợp và Kiểm thử cuối cùng

*Mục tiêu: Đảm bảo toàn bộ hệ thống hoạt động trơn tru từ đầu đến cuối.*

- [ ] **4.1. Kiểm thử E2E (End-to-End):**
  - [ ] Thực hiện kiểm thử hoàn chỉnh luồng người dùng: Đăng nhập -> Chọn template -> Upload ảnh -> Nhận kết quả -> Lưu ảnh.
- [ ] **4.2. Viết UI Tests (Tùy chọn):**
  - [ ] Viết test cho các luồng giao diện quan trọng.

---

### Giai đoạn 5: Triển khai

*Mục tiêu: Đưa ứng dụng đến tay người dùng.*

- [ ] **5.1. Chuẩn bị App Store:**
  - [ ] Hoàn thiện các thông tin cần thiết cho App Store Connect (icon, screenshots, mô tả...).
- [ ] **5.2. Phân phối:**
  - [ ] Đưa ứng dụng lên TestFlight để mời người dùng thử nghiệm.
  - [ ] Gửi ứng dụng để Apple xét duyệt.