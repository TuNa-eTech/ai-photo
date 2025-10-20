# Project Context

_This file tracks the current work focus, recent changes, and next steps. Keep it concise and factual._

## Current Work Focus
- [x] Tích hợp lớp common APIClient (Swift) để in log API/method/headers/body/response, hỗ trợ Bearer token.
- [x] Refactor UserRepository (iOS) sử dụng APIClient để mọi call tự động in log và xử lý lỗi chuẩn.
- [x] Khắc phục cảnh báo AutoLayout bàn phím trong ProfileCompletionView (defer focus bằng DispatchQueue.main.async).
- [x] Bổ sung lưu trữ profile user vào Postgres trong backend:
  - Thêm migration `0002_create_user_profiles_table.up.sql`
  - Thêm `database.UpsertUserProfile(ctx, email, name, avatarURL)` dùng pgx/stdlib
  - Sửa `RegisterUserHandler` để gọi Upsert trước khi trả response
- [x] Cập nhật Dockerfile backend lên Go 1.25 để phù hợp yêu cầu `go.mod (>=1.25.2)`.
- [x] Áp dụng migrate qua container `migrate/migrate` (network namespace của DB container) và verify DB.
- [x] Triển khai chuẩn API response dạng envelope (success/data/error/meta) và RequestID middleware (X-Request-ID).
- [x] Refactor handlers dùng helpers OK/BadRequest/… để thống nhất response.
- [x] Test API qua sandbox `.box-testing/sandbox/env.yaml` (idToken/email/name) và verify DB cập nhật.
- [ ] TODO: Hoàn thiện các API thực tế trong ViewModel (ví dụ fetchTemplates, process image flow từ app).

## Recent Changes
- [x] iOS: Thêm `Utilities/Networking/APIClient.swift` (logger, redaction, pretty JSON).
- [x] iOS: `UserRepository` chuyển sang `APIClientProtocol`, mapping lỗi 401 -> .unauthorized.
- [x] iOS: `ProfileCompletionView` bỏ `.toolbar(.hidden, for: .keyboard)` (không hỗ trợ), defer focus để tránh xung đột constraint inputView/accessoryView.
- [x] Backend: Thêm `backend/internal/database/postgres.go` (pgx stdlib, DSN từ env, UpsertUserProfile).
- [x] Backend: Sửa `RegisterUserHandler` để persist vào Postgres (bảng `user_profiles`).
- [x] Backend: Thêm migration `0002_create_user_profiles_table.up.sql`.
- [x] Backend: Cập nhật `backend/Dockerfile` dùng `golang:1.25-alpine` và rebuild.
- [x] Migrate DB và xác nhận dữ liệu:
  - Gọi `POST /v1/users/register` → 200
  - `SELECT ... FROM user_profiles` → thấy bản ghi `anhtu.it.se@gmail.com | Phone Anh Tu`.
- [x] Cập nhật documentation: hướng dẫn migrate, rebuild docker backend, verify DB.
- [x] Chuẩn hóa API response (envelope) + RequestID middleware; refactor handlers; test thực tế với env.yaml.

## Next Steps
- [ ] iOS: Hoàn thiện các API khác (fetch templates, process image) dùng APIClient; thêm unit/UI tests tương ứng.
- [ ] Backend: Bổ sung verify Firebase ID token bằng Firebase Admin SDK trong `RegisterUserHandler`.
- [ ] Đồng bộ schema: Xem xét hợp nhất `users` và `user_profiles` (hoặc duy trì mục đích riêng, cập nhật OpenAPI).
- [ ] Viết integration test cho `/v1/users/register` (Go) để verify DB upsert.
- [ ] Cập nhật OpenAPI (swagger/openapi.yaml) cho `user_profiles` nếu cần.
- [ ] Tài liệu hóa quy trình migrate và verify DB trong `.documents/workflow.md` (đã bổ sung – tiếp tục duy trì).
