# Technology & Tooling

_This file documents the technologies used, development setup, technical constraints, dependencies, and tool usage patterns._

## Technologies Used
- **Frontend:**
    - Swift, SwiftUI, MVVM, async/await, Observable, MainActor.
    - Interface-driven: AuthManagerProtocol, APIClientProtocol, dễ test/mock.
    - Firebase SDK (Google/Apple login, ID token).
    - Đầy đủ unit test cho ViewModel, API, xác thực, mock network, test error case.
- **Backend:**
    - Go (Golang, >=1.18, ưu tiên >=1.16 để không dùng io/ioutil)
    - Firebase Admin SDK (for ID token verification)
    - Google Gemini API (tích hợp thực tế cho AI image processing)
    - PostgreSQL (recommended for data storage)
    - Object Storage (e.g., S3, GCS, or MinIO)
- **AI:**
    - Google Gemini (tích hợp thực tế, xử lý ảnh base64, prompt động)

## Development Setup
- **Frontend:**
    1. Open `imageaiwrapper.xcodeproj` in Xcode.
    2. Select a simulator or a connected device.
    3. Click the "Run" button.
- **Backend:**
    1. Ensure Go (>=1.18) is installed.
    2. Place the Firebase service account JSON in the `backend/` directory.
    3. Create a `.env` file in the `backend/` directory (see `.env.example` for template) or set environment variables directly.
    4. To tắt xác thực Firebase Auth cho local/test, thêm `DISABLE_AUTH=true` vào `.env`.
    5. Tạo file `templates.json` trong backend/ để định nghĩa các template AI style.
    6. Tất cả ảnh gốc và ảnh kết quả đều lưu trực tiếp trên ổ đĩa (backend/ và backend/processed/).
    7. From the `backend/` directory, run `go run main.go` to start the server.
    8. The backend listens on port 8080 by default (or as set in `.env`/env vars).
    9. The backend automatically loads environment variables from `.env` using [github.com/joho/godotenv](https://github.com/joho/godotenv) for local development. In production/Docker, use real environment variables.


## Technical Constraints
- The application is for iOS only.
- **Authentication is 100% handled by Firebase Auth (client-side login, backend verifies idToken). Backend KHÔNG cung cấp API login, chỉ xác thực idToken.**
- **API `/v1/users/register` chỉ để lưu/cập nhật profile user, không xác thực đăng nhập.**
- Đầy đủ unit test cho ViewModel, API, xác thực, mock network, test error case.
- TODO: Hoàn thiện các TODO (API thực tế trong ViewModel, ví dụ fetchTemplates).
- TODO: Bổ sung thêm UI test (UITest) cho các flow chính nếu muốn tăng độ tin cậy.
- TODO: Bổ sung test cho các edge case (network timeout, backend 500, ...).
- TODO: Đảm bảo BASE_URL được config động qua Info.plist/environment.
- Secret keys and prompts for AI APIs must be handled securely on the backend.
- The backend is containerizable for deployment.

## Dependencies
- **Frontend:**
    - Firebase iOS SDK (Google/Apple login, ID token)
- **Backend:**
    - Go (Golang >=1.18, ưu tiên >=1.16 để không dùng io/ioutil)
    - Firebase Admin SDK for Go (`firebase.google.com/go/v4`)
    - Google API Client for Go (`google.golang.org/api/option`)
    - Google Gemini API (manual HTTP, có thể mở rộng dùng SDK)
    - [github.com/joho/godotenv](https://github.com/joho/godotenv) (for loading `.env` in local development)
    - PostgreSQL driver (if using Postgres)
    - Object storage SDK (if using S3, GCS, etc.)

## Tool Usage Patterns
- Xcode is used for all frontend development.
- Go tools (`go run`, `go mod tidy`, etc.) are used for backend development and dependency management.
- The backend loads environment variables from a `.env` file (if present) for local development, and from the environment in production.
- Firebase Console is used for managing authentication and service accounts.
- **Sau khi đăng nhập Firebase thành công, app iOS phải gọi API `/v1/users/register` (gửi idToken + profile info) để lưu/cập nhật thông tin user.**
- Đầy đủ unit test cho ViewModel, API, xác thực, mock network, test error case.
- TODO: Hoàn thiện các TODO (API thực tế trong ViewModel, ví dụ fetchTemplates).
- TODO: Bổ sung thêm UI test (UITest) cho các flow chính nếu muốn tăng độ tin cậy.
- TODO: Bổ sung test cho các edge case (network timeout, backend 500, ...).
- TODO: Đảm bảo BASE_URL được config động qua Info.plist/environment.
- Google Gemini API: tích hợp manual HTTP, truyền prompt động, xử lý ảnh base64, nhận kết quả base64, decode và lưu file.
- Không dùng io/ioutil (Go >=1.16), thay bằng os.ReadFile, io.ReadAll.
- Cấu hình email pgAdmin phải dùng email hợp lệ (không dùng domain .local).
- Integration test API bằng curl:
  ```
  curl -X POST http://localhost:8080/v1/images/process -H "Content-Type: application/json" -d '{"template_id": "example", "image_path": "test_img.png"}'
  ```
  (Khi DISABLE_AUTH=true, không cần header Authorization)
- File-based storage: kiểm tra file kết quả trong backend/processed/
- Template: chỉnh sửa backend/templates.json để thêm/sửa template AI style.
