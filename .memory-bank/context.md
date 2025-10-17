# Project Context

_This file tracks the current work focus, recent changes, and next steps. Keep it concise and factual._

## Current Work Focus
- [x] Hoàn thiện và kiểm thử endpoint `/v1/images/process` (Go backend): xử lý ảnh (tích hợp Gemini API thực tế), lưu trữ file thực tế, truy vấn template động từ DB, cho phép bật/tắt xác thực qua DISABLE_AUTH.
- [x] Hoàn thiện app iOS: xác thực Firebase (Google/Apple), chọn template, chọn ảnh, gửi request backend, nhận và hiển thị ảnh kết quả, test cơ bản.
- [x] Đổi tên và hoàn thiện các file implementation plan theo rule.
- [x] Cập nhật tài liệu, memory bank, và kiểm thử tích hợp end-to-end.
- [x] Chuẩn hóa flow xác thực: backend KHÔNG còn API login, chỉ xác thực idToken từ Firebase Auth, bổ sung API `/v1/users/register` chỉ để lưu thông tin profile user (không xác thực đăng nhập).
- [x] Đã cập nhật OpenAPI, backend, và iOS integration cho flow mới: mọi endpoint bảo vệ đều yêu cầu Authorization: Bearer <idToken>.

## Recent Changes
- [x] Đã tích hợp Gemini API vào backend, xử lý ảnh thực tế, lưu ảnh trả về, truy vấn prompt động từ DB.
- [x] Đã hoàn thiện app iOS: xác thực Firebase, xử lý ảnh, test cơ bản.
- [x] Đã đổi tên file implementation plan cho đúng rule (`implementation-auth-plan.md`, `implementation-process-image-endpoint-plan.md`).
- [x] Đã fix lỗi pgAdmin (email cấu hình), hướng dẫn khởi động lại dịch vụ.
- [x] Viết unit test cho ImageProcessingViewModel (test case: không có selectedImage).
- [x] Cập nhật tài liệu `.documents/gemini-api-integration-backend.md`, `.documents/api_specification.md`, `.implementation_plan/implementation-process-image-endpoint-plan.md` đồng bộ với code thực tế.
- [x] Khởi tạo thư mục `.box-testing` làm sandbox kiểm thử toàn diện (test data, script, tài liệu test, sandbox code, test case đặc biệt).
- [x] Di chuyển file test_img.png từ backend/ sang `.box-testing/images/` để chuẩn hóa quản lý test data.
- [x] Đã loại bỏ hoàn toàn API login backend, chuyển sang xác thực 100% qua Firebase Auth (idToken).
- [x] Đã bổ sung API `/v1/users/register` (Go backend) để lưu/cập nhật profile user, không xử lý xác thực đăng nhập.
- [x] Đã cập nhật OpenAPI, tài liệu, code backend, và iOS integration cho flow xác thực mới.

## Next Steps
## Next Steps
- [ ] Viết thêm unit test cho ImageProcessingViewModel (mock network: thành công, lỗi backend).
- [ ] Viết unit test cho flow xác thực mới: backend `/v1/users/register` và Swift RegisterUserAPI.
- [ ] Tiếp tục kiểm thử end-to-end với app iOS và backend.
- [ ] Tiếp tục cập nhật tài liệu, memory bank khi có thay đổi lớn.
- [ ] Chuẩn hóa việc lưu trữ test data, script, tài liệu test, sandbox code vào `.box-testing` theo cấu trúc mới.
