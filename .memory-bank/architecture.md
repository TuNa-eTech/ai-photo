# Architecture

_This file documents the system architecture, source code paths, key technical decisions, design patterns, and component relationships._

## System Architecture
- The project follows a client-server architecture.
- **Client:** Native iOS app built with SwiftUI, MVVM pattern, interface-driven (AuthManagerProtocol, APIClientProtocol), tách lớp rõ ràng, dễ test/mock.
- **Server:** Custom Go backend, containerized, xác thực 100% qua Firebase Auth (idToken), không còn API login.
- **Authentication:** User authentication handled by Firebase Auth (client-side login, backend verifies Firebase ID tokens). App tự động gọi API `/v1/users/register` sau khi đăng nhập để sync profile user.
- **Test:** Đầy đủ unit test cho ViewModel, API, xác thực, mock network, test error case. Đã có test coverage tốt cho business logic, API, xác thực.
- The client communicates with the Go backend for template management, image upload, AI image processing, and user profile registration.

## Source Code Paths
- `app_ios/`: Contains the source code for the iOS application.
- `backend/`: Contains the Go backend service, including authentication, API handlers, and business logic.
- `.box-testing/`: Centralized sandbox for all test data (images, JSON, edge cases), test scripts, testing documentation, experimental code, and special test cases. Used for both backend and iOS testing workflows.

## Key Technical Decisions
- **MVVM + Interface-driven:** iOS app sử dụng MVVM, interface-driven (AuthManagerProtocol, APIClientProtocol), tách lớp rõ ràng, dễ test/mock.
- **Test Coverage:** Đã có unit test cho ViewModel, API, xác thực, mock network, test error case. Đảm bảo test coverage tốt cho business logic, API, xác thực.
- **Standardized Test Sandbox:** All test data, scripts, testing documentation, and sandbox code are now managed in `.box-testing/` for consistency, maintainability, and to support TDD/documentation-driven workflows.
- **Firebase Auth Integration:** Authentication is now handled by Firebase Auth. The iOS app uses Firebase SDK for login, and the backend verifies ID tokens using Firebase Admin SDK.
- **Environment Variable-Based Configuration:** All sensitive and deployment-specific configuration for the Go backend (e.g., Firebase service account path, server port, database URL, AI API keys, auth toggle) is managed via environment variables.
- **File-Based Storage:** Ảnh gốc và ảnh kết quả được lưu trực tiếp trên ổ đĩa (thư mục backend/ và backend/processed/).
- **Template Management:** Danh sách template AI style được lưu trong file backend/templates.json, truy vấn qua hàm GetTemplateByID.
- **AI Processing:** Đã tích hợp Gemini API thực tế cho xử lý ảnh (backend/internal/image/image.go, backend/internal/api/handlers.go).
- **SwiftUI for iOS:** The iOS application is built with SwiftUI for a modern, declarative UI.

## Design Patterns in Use
- **MVVM:** The iOS application uses the Model-View-ViewModel (MVVM) design pattern.
- **Middleware:** The Go backend uses middleware for authentication and request validation.

## Component Relationships & Critical Paths
1. The SwiftUI app fetches template data from the Go backend API (TODO: cần hoàn thiện API thực tế trong ViewModel).
2. The user selects a template and uploads an image to the backend (mock upload, sẽ hoàn thiện sau).
3. Sau khi đăng nhập Firebase thành công, app gọi API `/v1/users/register` (POST, gửi idToken + profile info) để lưu/cập nhật thông tin profile user (không xác thực đăng nhập).
4. The app calls the `/v1/images/process` endpoint, passing the template ID and image path, with a Firebase ID token in the `Authorization` header (hoặc không cần nếu DISABLE_AUTH=true).
5. The backend xác thực token (nếu bật), kiểm tra dữ liệu, truy vấn template động từ DB, kiểm tra file ảnh gốc.
6. Backend encode ảnh gốc base64, lấy prompt từ template, gọi Gemini API, nhận ảnh kết quả base64, decode và lưu file kết quả vào processed/, trả về đường dẫn file.
7. The app receives the URL of the processed image and displays it to the user.

## Recent Architectural Changes
- Đã review và xác nhận kiến trúc MVVM, interface-driven, tách lớp tốt, code rõ ràng, dễ test/mock.
- Đã kiểm tra coverage test: đầy đủ unit test cho ViewModel, API, xác thực, mock network, test error case.
- Đã kiểm tra flow xác thực, đăng ký user, xử lý ảnh, đồng bộ backend.
- Đã kiểm tra các tiện ích APIClient, AuthManager, RegisterUserAPI, Logger.
- Đã kiểm tra UI/UX, accessibility, khả năng mở rộng.
- Đã cập nhật tài liệu, memory bank, và checklist test cho các thành phần chính.
