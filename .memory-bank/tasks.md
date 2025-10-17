## Integration Test Backend API `/v1/images/process`
**Last performed:** 2025-10-16
**Files to modify:**
- `backend/internal/api/handlers.go`
- `backend/internal/image/image.go`
- `backend/internal/storage/storage.go`
- `backend/internal/database/database.go`
- `backend/templates.json`
- `backend/.env`
- `backend/main.go`

**Steps:**
1. Đảm bảo backend đã build và chạy thành công (`go run main.go`).
2. Đặt file ảnh test (ví dụ: `test_img.png`) vào thư mục backend/.
3. Gửi request POST tới endpoint `/v1/images/process` với body:
   ```json
   { "template_id": "example", "image_path": "test_img.png" }
   ```
   (Có thể dùng curl, không cần header Authorization nếu DISABLE_AUTH=true)
4. Kiểm tra response trả về processed_image_url.
5. Kiểm tra file kết quả trong backend/processed/.
6. Thử các trường hợp lỗi: thiếu trường, ảnh/template không tồn tại, v.v.

**Important notes:**
- Có thể bật/tắt xác thực Firebase Auth qua biến DISABLE_AUTH trong .env.
- Template được định nghĩa trong backend/templates.json hoặc DB (truy vấn động).
- Logic xử lý AI đã tích hợp Gemini API thực tế: encode ảnh base64, truyền prompt động, nhận kết quả base64, decode và lưu file processed.
- Nếu cần thêm model AI mới, thêm endpoint mới, hoặc đổi tên file plan, hãy tham khảo các implementation plan mẫu (`.implementation_plan/implementation-auth-plan.md`, `.implementation_plan/implementation-process-image-endpoint-plan.md`).
- Khi fix lỗi pgAdmin, cần kiểm tra biến môi trường email hợp lệ, khởi động lại dịch vụ.

**Example result:**
```json
{"processed_image_url":"/processed/processed_test_img.png"}
```

---

## Firebase Auth + Register User API Pattern
**Last performed:** 2025-10-17
**Files to modify:**
- `backend/internal/api/handlers.go`
- `backend/internal/models/models.go`
- `backend/cmd/api/main.go`
- `swagger/openapi.yaml`
- `app_ios/Utils/RegisterUserAPI.swift`
- `.documents/api_specification.md`
- `.memory-bank/*` (context, architecture, tech, product)

**Steps:**
1. Xác thực người dùng qua Firebase Auth trên iOS app (Google/Apple login).
2. Sau khi đăng nhập thành công, lấy idToken từ Firebase SDK.
3. Gọi API backend `/v1/users/register` (POST, gửi idToken qua header Authorization, body gồm name, email, avatar_url).
4. Backend xác thực idToken, lưu/cập nhật thông tin profile user (không xác thực đăng nhập).
5. Tất cả các API bảo vệ khác đều yêu cầu header Authorization: Bearer <idToken>.
6. Không còn API login backend, không dùng email/password cho xác thực backend.

**Important notes:**
- API `/v1/users/register` chỉ để lưu/cập nhật profile user, không xác thực đăng nhập.
- Backend xác thực 100% qua Firebase Auth (idToken).
- iOS app phải gọi API này sau khi đăng nhập Firebase thành công.
- Đảm bảo cập nhật OpenAPI, tài liệu, memory bank khi thay đổi flow xác thực.

**Example implementation:**
- Swift:
  ```swift
  RegisterUserAPI.shared.registerUser(
      idToken: idToken,
      name: user.displayName ?? "",
      email: user.email ?? "",
      avatarURL: user.photoURL?.absoluteString
  ) { result in
      // handle result
  }
  ```
- Go handler: xem `RegisterUserHandler` trong `backend/internal/api/handlers.go`
