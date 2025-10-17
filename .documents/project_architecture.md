# Dự án "AI Image Stylist" - Tài liệu Kiến trúc & Kỹ thuật

## 1. Tổng quan

Dự án "AI Image Stylist" là một hệ thống cho phép người dùng chỉnh sửa ảnh của họ bằng công nghệ AI. Người dùng chọn một "phong cách" (template) có sẵn, tải ảnh của mình lên, và nhận lại một phiên bản ảnh đã được biến đổi.

Kiến trúc dự án bao gồm một ứng dụng iOS gốc (SwiftUI) và một backend service được viết bằng Go.

## 2. Luồng người dùng (User Flow)

1.  **Xác thực:** Người dùng đăng nhập/đăng ký vào ứng dụng thông qua backend service.
2.  **Mở ứng dụng:** Người dùng thấy màn hình chính hiển thị danh sách các template chỉnh sửa ảnh được tải từ backend.
3.  **Chọn Template:** Người dùng nhấn vào một template họ thích.
4.  **Tải ảnh lên:** Ứng dụng yêu cầu người dùng chọn ảnh. Sau khi chọn, ảnh được upload lên backend service.
5.  **Xử lý:** Ứng dụng gửi yêu cầu xử lý đến backend, báo cho backend biết ảnh nào cần xử lý và theo template nào. Ứng dụng hiển thị một chỉ báo đang xử lý.
6.  **Nhận kết quả:** Backend sau khi xử lý xong sẽ trả về URL của ảnh kết quả cho ứng dụng. Ứng dụng hiển thị ảnh mới cho người dùng.
7.  **Lưu ảnh:** Người dùng có thể lưu ảnh kết quả về thư viện ảnh của thiết bị.

## 3. Kiến trúc hệ thống với Backend Go

Kiến trúc tổng thể bao gồm một ứng dụng di động và một backend service tùy chỉnh viết bằng Go.

**Sơ đồ:** `[App SwiftUI]` <---> `[Backend Go]` ---> `[AI API (Gemini)]`

### 3.1. Xác thực (Authentication)
- **Vai trò:** Quản lý danh tính người dùng thông qua Firebase Authentication.
- **Luồng hoạt động mới:**
    - Đăng nhập/đăng ký được thực hiện trên client (iOS app) sử dụng Firebase SDK (Email/Mật khẩu, Apple, Google, v.v.).
    - Sau khi xác thực thành công, Firebase sẽ cấp JWT token (ID token) cho client.
    - Mọi request từ client đến backend sẽ đính kèm header `Authorization: Bearer <firebase-id-token>`.
    - Backend sử dụng Firebase Admin SDK (với service account) để xác thực và giải mã token, lấy thông tin người dùng từ claims của Firebase.
    - Backend KHÔNG còn cấp JWT token riêng, cũng không còn endpoint đăng nhập/đăng ký.

- **Lưu ý:** 
    - Backend chỉ xác thực token do Firebase cấp, không tự quản lý mật khẩu hay thông tin đăng nhập.
    - Các endpoint yêu cầu xác thực sẽ kiểm tra tính hợp lệ của Firebase ID token và lấy thông tin user từ đó.
    - Service account JSON của Firebase phải được cấu hình cho backend.

- **Sơ đồ cập nhật:** `[App SwiftUI + Firebase SDK]` <---> `[Backend Go (verify Firebase JWT)]` ---> `[AI API (Gemini)]`
### 3.2. Cơ sở dữ liệu (Database)

- **Vai trò:** Lưu trữ thông tin về các templates và người dùng.
- **Công nghệ:** Một cơ sở dữ liệu quan hệ như PostgreSQL được khuyến nghị.
- **Cấu trúc bảng `templates` (ví dụ):**
  | Tên cột | Kiểu dữ liệu | Chú thích |
  | :--- | :--- | :--- |
  | `id` | `text` | Khóa chính, định danh duy nhất (vd: "anime-style") |
  | `created_at` | `timestampz` | Thời gian tạo |
  | `name` | `text` | Tên hiển thị của template (vd: "Phong cách Anime") |
  | `thumbnail_url`| `text` | URL đến ảnh đại diện của template |
  | `prompt` | `text` | **Prompt bí mật**, dùng để gửi cho AI API |

- **Bảo mật:**
  - Logic nghiệp vụ trong backend sẽ kiểm soát quyền truy cập dữ liệu.
  - Cột `prompt` không bao giờ được gửi về cho client.

### 3.3. Lưu trữ (Storage)

- **Vai trò:** Lưu trữ file ảnh.
- **Giải pháp:** Có thể sử dụng một dịch vụ lưu trữ đối tượng (object storage) như Amazon S3, Google Cloud Storage, hoặc tự host một giải pháp như MinIO.
- **Cấu trúc:**
  1.  Ảnh gốc do người dùng tải lên.
  2.  Ảnh đã qua xử lý bởi AI.

### 3.4. Logic xử lý (Backend Go Service)

- **Vai trò:** Thực thi logic nghiệp vụ chính một cách an toàn.
- **Cấu trúc:** Backend service sẽ được đặt trong thư mục `backend/`.
- **Endpoint `process-image` (ví dụ):**
  - **Trigger:** HTTP request từ ứng dụng SwiftUI.
  - **Request Body:** `{ "template_id": "anime-style", "image_path": "path/to/image.jpg" }`.
  - **Luồng hoạt động:**
    1.  **Xác thực Request:** Kiểm tra JWT token của người dùng.
    2.  **Lấy Prompt:** Truy vấn `prompt` từ cơ sở dữ liệu dựa trên `template_id`.
    3.  **Lấy API Key:** Truy cập API Key của Gemini từ biến môi trường hoặc một dịch vụ quản lý secret.
    4.  **Tải ảnh gốc:** Tải file ảnh từ nơi lưu trữ.
    5.  **Gọi AI API (Gemini):**
        - Gửi request chứa `prompt` và dữ liệu ảnh đến AI API.
        - Nhận về dữ liệu ảnh đã xử lý.
    6.  **Lưu kết quả:** Upload ảnh kết quả lên dịch vụ lưu trữ.
    7.  **Trả về URL:** Trả về JSON response cho client: `{ "processed_image_url": "..." }`.

### 3.5. Luồng xử lý lỗi (Error Handling)

- **Tại Backend:**
    - Nếu có bất kỳ lỗi nào xảy ra, backend sẽ log lỗi chi tiết và trả về một mã lỗi HTTP tương ứng (ví dụ: `400`, `500`) cùng một thông điệp lỗi ngắn gọn cho client.
- **Tại App SwiftUI:**
    - Ứng dụng sẽ bắt các mã lỗi HTTP và hiển thị thông báo phù hợp cho người dùng.

## 4. Môi trường & Triển khai

- **Backend:** Backend Go sẽ được đóng gói thành một Docker container và triển khai trên một nền tảng hosting (ví dụ: AWS, Google Cloud, DigitalOcean).
- **Cấu hình:** Các thông tin nhạy cảm như API keys, thông tin kết nối cơ sở dữ liệu sẽ được quản lý thông qua biến môi trường.

### 4.1. Biến môi trường cho Backend Go

#### Hỗ trợ file `.env` cho phát triển cục bộ

- Backend Go tự động tải các biến môi trường từ file `.env` (nếu có) ở thư mục gốc backend khi khởi động (chỉ dùng cho phát triển/local).
- Sử dụng thư viện [github.com/joho/godotenv](https://github.com/joho/godotenv).
- Trong môi trường production/Docker, nên cấu hình biến môi trường qua hệ thống host hoặc Docker Compose/secrets.

Backend Go sử dụng các biến môi trường sau để cấu hình:

| Tên biến                  | Bắt buộc | Mô tả                                                      | Giá trị mẫu                                  |
|---------------------------|----------|------------------------------------------------------------|----------------------------------------------|
| FIREBASE_SERVICE_ACCOUNT  | Có       | Đường dẫn tới file JSON service account của Firebase        | /app/secret/firebase-service-account.json    |
| PORT                      | Không    | Cổng mà backend sẽ lắng nghe (mặc định: 8080)              | 8080                                         |
| DATABASE_URL              | Không    | URL kết nối tới cơ sở dữ liệu (PostgreSQL, v.v.)            | postgres://user:pass@host:5432/dbname        |
| GEMINI_API_KEY            | Không    | API key cho dịch vụ AI Gemini                              | sk-xxx...                                    |

**Lưu ý:**  
- Nếu thiếu `FIREBASE_SERVICE_ACCOUNT`, backend sẽ không khởi động và báo lỗi rõ ràng.
- Có thể mở rộng thêm các biến môi trường khác cho các dịch vụ tích hợp trong tương lai.
- Mọi giá trị mặc định và logic kiểm tra biến môi trường được thực hiện trong code Go (`internal/config/config.go`).

**Ví dụ cấu hình Docker Compose:**
```yaml
services:
  backend:
    image: imageai-backend:latest
    environment:
      - FIREBASE_SERVICE_ACCOUNT=/run/secrets/firebase-service-account.json
      - PORT=8080
      - DATABASE_URL=postgres://user:pass@host:5432/dbname
      - GEMINI_API_KEY=sk-xxx...
    secrets:
      - firebase-service-account
```

## 5. Các bước phát triển gợi ý

1.  **Thiết lập Backend:**
    -   Thiết lập cơ sở dữ liệu.
    -   Thiết lập dịch vụ lưu trữ file.
    -   Lấy API key của Gemini.
2.  **Phát triển Backend Service (Go):**
    -   Xây dựng các endpoint cho xác thực, quản lý template, và xử lý ảnh.
    -   Tích hợp với cơ sở dữ liệu, dịch vụ lưu trữ, và AI API.
3.  **Phát triển ứng dụng SwiftUI:**
    -   Tích hợp networking layer để giao tiếp với backend Go.
    -   Xây dựng giao diện và luồng người dùng.
4.  **Kiểm thử:**
    -   Kiểm thử toàn bộ luồng, bao gồm cả các trường hợp lỗi.
