# Kế hoạch phát triển Backend bằng Golang

Đây là kế hoạch chi tiết để phát triển backend cho dự án bằng Go.

## 1. Thiết lập Dự án và Cấu trúc Thư mục

- **Khởi tạo Go module:** `go mod init github.com/<your-username>/imageai-backend`
- **Cấu trúc thư mục (gợi ý):**
  ```
  /backend
  ├── cmd/api/
  │   └── main.go         # Điểm khởi chạy chính của ứng dụng
  ├── internal/
  │   ├── api/            # HTTP handlers, routing, middleware
  │   ├── auth/           # Logic xác thực, tạo và kiểm tra JWT
  │   ├── config/         # Tải cấu hình từ file hoặc biến môi trường
  │   ├── database/       # Tương tác với cơ sở dữ liệu (PostgreSQL)
  │   ├── image/          # Logic xử lý ảnh, gọi AI API
  │   ├── models/         # Định nghĩa các struct (User, Template)
  │   └── storage/        # Lưu file tạm trực tiếp vào hệ thống file local
  ├── go.mod
  ├── go.sum
  └── Dockerfile
  ```

## 2. Cấu hình (Configuration)

-   Tạo một module (`internal/config`) để đọc cấu hình từ biến môi trường hoặc file `.env`.
-   **Các cấu hình cần thiết:**
    -   Chuỗi kết nối đến Database (PostgreSQL).
    -   Khóa bí mật để ký JWT (JWT secret key).
    -   Port cho server (ví dụ: `8080`).
    -   API Key cho Gemini (hoặc AI API khác).
    -   Thư mục lưu file tạm trên hệ thống file local.

## 3. Lớp API (API Layer)

-   **Chọn HTTP Router:** Sử dụng một thư viện phổ biến như `chi` hoặc `gin-gonic` để định nghĩa các route.
-   **Định nghĩa các Routes:**
    -   `POST /v1/auth/register`: Đăng ký người dùng mới.
    -   `POST /v1/auth/login`: Đăng nhập.
    -   `GET /v1/templates`: Lấy danh sách các template.
    -   `POST /v1/images/process`: Yêu cầu xử lý ảnh.
-   **Middleware:** Viết các middleware cho logging, CORS, và quan trọng nhất là xác thực JWT cho các route cần bảo vệ.

## 4. Logic Xử lý Ảnh (Image Processing)

-   Đây là logic cốt lõi, được gọi bởi handler của route `POST /v1/images/process`.
-   **Luồng xử lý:**
    1.  Nhận `template_id` và `image_path` từ request.
    2.  Truy vấn database để lấy `prompt` bí mật của template.
    3.  Lấy AI API key từ cấu hình.
    4.  Tải ảnh gốc từ dịch vụ lưu trữ (storage).
    5.  Gửi request đến AI API (Gemini) kèm theo `prompt` và dữ liệu ảnh.
    6.  Nhận ảnh đã xử lý từ AI API.
    7.  Tải ảnh kết quả lên lại dịch vụ lưu trữ.
    8.  Trả về URL của ảnh kết quả cho client.

## 5. Tương tác với Database và Storage

-   **Database:** Sử dụng thư viện `pgx` để tương tác với PostgreSQL. Viết các câu lệnh SQL để thực hiện các thao tác CRUD (Create, Read, Update, Delete) cho `users` và `templates`.
-   **Storage:** Lưu file tạm trực tiếp vào hệ thống file local. File của user chỉ là file tạm và sẽ được xóa ngay sau khi user load thành công.


-   Viết một `Dockerfile` để đóng gói ứng dụng Go thành một container nhẹ, sẵn sàng để triển khai.

## 6. Đóng gói (Docker)

-   Viết một `Dockerfile` để đóng gói ứng dụng Go thành một container nhẹ, sẵn sàng để triển khai.

## Kế hoạch thực hiện (chia theo giai đoạn)

1.  **Giai đoạn 1: Nền tảng**
    -   Thiết lập cấu trúc dự án, database, và nạp cấu hình.
    -   Xây dựng chức năng đăng ký, đăng nhập và tạo JWT.

2.  **Giai đoạn 2: Tính năng cốt lõi**
    -   Xây dựng API để lấy danh sách template.
    -   Hoàn thiện luồng xử lý ảnh chính (tích hợp với AI API và storage).

3.  **Giai đoạn 3: Hoàn thiện và Triển khai**
    -   Viết `Dockerfile`.
    -   Thiết lập CI/CD để tự động build và deploy lên môi trường Staging.
    -   Kiểm thử toàn diện (End-to-End) với ứng dụng iOS.
