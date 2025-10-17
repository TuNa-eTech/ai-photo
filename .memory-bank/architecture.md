# Architecture

_This file documents the system architecture, source code paths, key technical decisions, design patterns, and component relationships._

## System Architecture
- The project follows a client-server architecture.
- **Client:** A native iOS application built with SwiftUI.
- **Server:** A custom Go backend service, deployed as a containerized application.
- **Authentication:** User authentication is handled by Firebase Auth (client-side login, backend verifies Firebase ID tokens). **Backend KHÔNG cung cấp API login, chỉ xác thực idToken. Nếu cần lưu profile user, gọi API `/v1/users/register` (profile only, không xác thực đăng nhập).**
- The client communicates with the Go backend for template management, image upload, AI image processing, and user profile registration.

## Source Code Paths
- `app_ios/`: Contains the source code for the iOS application.
- `backend/`: Contains the Go backend service, including authentication, API handlers, and business logic.
- `.box-testing/`: Centralized sandbox for all test data (images, JSON, edge cases), test scripts, testing documentation, experimental code, and special test cases. Used for both backend and iOS testing workflows.

## Key Technical Decisions
## Key Technical Decisions
- **Standardized Test Sandbox:** All test data, scripts, testing documentation, and sandbox code are now managed in `.box-testing/` for consistency, maintainability, and to support TDD/documentation-driven workflows. Test images (e.g., `test_img.png`) and other artifacts are no longer stored in backend/ but moved to `.box-testing/images/`.
- **Migration to Go Backend:** The project migrated from a Supabase backend to a custom Go backend for greater flexibility and control.
- **Firebase Auth Integration:** Authentication is now handled by Firebase Auth. The iOS app uses Firebase SDK for login, and the backend verifies ID tokens using Firebase Admin SDK.
- **Environment Variable-Based Configuration:** All sensitive and deployment-specific configuration for the Go backend (e.g., Firebase service account path, server port, database URL, AI API keys, auth toggle) is managed via environment variables. The backend loads these using a central config struct and loader (`internal/config/config.go`). Required variables are validated at startup, and sensible defaults are provided where appropriate.
    - Supported variables:
        - `FIREBASE_SERVICE_ACCOUNT` (required)
        - `PORT` (default: 8080)
        - `DATABASE_URL` (optional)
        - `GEMINI_API_KEY` (optional)
        - `DISABLE_AUTH` (optional, set to true to disable Firebase Auth for local dev/test)
- **File-Based Storage:** Ảnh gốc và ảnh kết quả được lưu trực tiếp trên ổ đĩa (thư mục backend/ và backend/processed/). Hàm SaveProcessedImage lưu file, ImageExists kiểm tra tồn tại file.
- **Template Management:** Danh sách template AI style được lưu trong file backend/templates.json, truy vấn qua hàm GetTemplateByID.
- **AI Processing:** Đã tích hợp Gemini API thực tế cho xử lý ảnh (backend/internal/image/image.go, backend/internal/api/handlers.go). Ảnh gốc được encode base64, gửi prompt động từ template, nhận ảnh kết quả base64 từ Gemini, lưu file processed.
- **SwiftUI for iOS:** The iOS application is built with SwiftUI for a modern, declarative UI.

## Design Patterns in Use
- **MVVM:** The iOS application uses the Model-View-ViewModel (MVVM) design pattern.
- **Middleware:** The Go backend uses middleware for authentication and request validation.

## Component Relationships & Critical Paths
1. The SwiftUI app fetches template data from the Go backend API.
2. The user selects a template and uploads an image to the backend.
3. Sau khi đăng nhập Firebase thành công, app gọi API `/v1/users/register` (POST, gửi idToken + profile info) để lưu/cập nhật thông tin profile user (không xác thực đăng nhập).
4. The app calls the `/v1/images/process` endpoint, passing the template ID and image path, with a Firebase ID token in the `Authorization` header (hoặc không cần nếu DISABLE_AUTH=true).
5. The backend xác thực token (nếu bật), kiểm tra dữ liệu, truy vấn template động từ DB, kiểm tra file ảnh gốc.
6. Backend encode ảnh gốc base64, lấy prompt từ template, gọi Gemini API, nhận ảnh kết quả base64, decode và lưu file kết quả vào processed/, trả về đường dẫn file.
7. The app receives the URL of the processed image and displays it to the user.

## Recent Architectural Changes
- Đã loại bỏ hoàn toàn API login backend, chuyển sang xác thực 100% qua Firebase Auth (idToken).
- Đã bổ sung API `/v1/users/register` (Go backend) để lưu/cập nhật profile user, không xử lý xác thực đăng nhập.
- Đã cập nhật OpenAPI, tài liệu, code backend, và iOS integration cho flow xác thực mới.
- Khởi tạo `.box-testing` làm sandbox kiểm thử toàn diện, chuẩn hóa lưu trữ test data, script, tài liệu test, sandbox code, test case đặc biệt cho cả backend và iOS.
- Đã di chuyển test_img.png từ backend/ sang `.box-testing/images/`.
- Đã tích hợp Gemini API thực tế vào backend, xử lý ảnh AI, lưu ảnh trả về, truy vấn prompt động từ DB.
- Đã hoàn thiện app iOS: xác thực Firebase, xử lý ảnh, test cơ bản.
- Đã đổi tên file implementation plan cho đúng rule (`implementation-auth-plan.md`, `implementation-process-image-endpoint-plan.md`).
- Đã fix lỗi pgAdmin (email cấu hình), hướng dẫn khởi động lại dịch vụ.
- Viết unit test cho ImageProcessingViewModel (test case: không có selectedImage).
- Updated all documentation and memory bank files to reflect the new architecture.
