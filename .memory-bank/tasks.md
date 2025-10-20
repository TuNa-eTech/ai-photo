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
1. Đảm bảo backend đã build và chạy thành công (`go run ./cmd/api/main.go`).
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

---

## Run Database Migrations (Local Dev)
**Last performed:** 2025-10-19
**Files/Configs:**
- `backend/migrations/*.up.sql`
- `docker/docker-compose.yml`

**Steps (recommended with containerized golang-migrate):**
1. Start Postgres:
   ```bash
   cd docker
   docker compose up -d db
   ```
2. Apply migrations using containerized migrate (shares DB container network namespace):
   ```bash
   docker run --rm -v "$(pwd)/../backend/migrations:/migrations" \
     --network container:imageaiwrapper-db \
     migrate/migrate:latest \
     -path=/migrations \
     -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable" up
   ```
3. Verify tables:
   ```bash
   docker exec -e PGPASSWORD=imageai_pass -it imageaiwrapper-db \
     psql -U imageai -d imageai_db -c "\dt"
   ```
4. (Optional) Roll back one step:
   ```bash
   docker run --rm -v "$(pwd)/../backend/migrations:/migrations" \
     --network container:imageaiwrapper-db \
     migrate/migrate:latest \
     -path=/migrations \
     -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable" down 1
   ```

**Notes:**
- Host `migrate` may fail with SCRAM auth. Prefer containerized approach.

---

## Persist User Profile to Postgres (Register API)
**Last performed:** 2025-10-19
**Files to modify:**
- `backend/internal/api/handlers.go` (call Upsert on success)
- `backend/internal/database/postgres.go` (pgx stdlib, DSN from env, UpsertUserProfile)
- `backend/migrations/0002_create_user_profiles_table.up.sql`
- `backend/Dockerfile` (Go 1.25)

**Steps:**
1. Add migration for `user_profiles`:
   ```sql
   CREATE TABLE IF NOT EXISTS user_profiles (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     name VARCHAR(255) NOT NULL,
     avatar_url TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```
2. Implement Postgres helper (pgx stdlib) and Upsert:
   - `database.UpsertUserProfile(ctx, email, name, avatarURL)`
3. Wire handler:
   - In `RegisterUserHandler`, call Upsert before returning response.
4. Update toolchain & deps:
   - `backend/Dockerfile` → `golang:1.25-alpine`
   - `go get github.com/jackc/pgx/v5/stdlib && go mod tidy`
5. Rebuild backend:
   ```bash
   cd docker && docker compose up -d --build backend
   ```
6. Test and verify:
   ```bash
   curl -X POST http://localhost:8080/v1/users/register \
     -H "Authorization: Bearer test" \
     -H "Content-Type: application/json" \
     --data '{"name":"Full Name","email":"user@example.com","avatar_url":""}'
   docker exec -e PGPASSWORD=imageai_pass -it imageaiwrapper-db \
     psql -U imageai -d imageai_db -c \
     "SELECT id,email,name,avatar_url FROM user_profiles ORDER BY id DESC LIMIT 10;"
   ```

**Notes:**
- Backend DB vars come from Docker Compose (`DB_HOST=db`, etc.) or `DATABASE_URL`.

---

## iOS APIClient Logging & Integration
**Last performed:** 2025-10-19
**Files to modify:**
- `AIPhotoApp/AIPhotoApp/Utilities/Networking/APIClient.swift` (new)
- `AIPhotoApp/AIPhotoApp/Repositories/UserRepository.swift` (refactor to APIClientProtocol)

**Steps:**
1. Create APIClient with NetworkLogger (redacts Authorization/cookies, pretty JSON bodies).
2. Refactor `UserRepository` to use `APIClientProtocol`:
   - Build request with `APIRequest.json(...)`
   - Call `client.send(..., authToken: <Firebase ID token>)`
   - Map 401 to `.unauthorized` to trigger token refresh path in ViewModel.
3. Verify logs in Xcode console when calling Register API.

**Notes:**
- `AppConfig.backendBaseURL` must point to backend (http://localhost:8080 for Simulator).
- Logging is enabled by default in DEBUG; can be toggled via `client.logger.enabled`.

---

## ProfileCompletionView Keyboard Constraint Fix
**Last performed:** 2025-10-19
**Files to modify:**
- `AIPhotoApp/AIPhotoApp/Views/Authentication/ProfileCompletionView.swift`

**Steps:**
1. Defer setting focus inside `.onAppear` using `DispatchQueue.main.async`.
2. Remove unsupported API `.toolbar(.hidden, for: .keyboard)` to avoid build error.

**Result:**
- Reduces AutoLayout warnings related to accessory/inputView conflicts.

---

## Backend Docker Toolchain Upgrade (Go 1.25)
**Last performed:** 2025-10-19
**Files to modify:**
- `backend/Dockerfile`

**Steps:**
1. Update base image:
   ```
   FROM golang:1.25-alpine AS builder
   ```
2. Rebuild:
   ```bash
   cd docker && docker compose up -d --build backend
   ```

**Reason:**
- go.mod requires Go >= 1.25.2, older images fail during `go mod download`.

---

## API Response Envelope Adoption
**Last performed:** 2025-10-19
**Files to modify:**
- `backend/internal/api/responder.go` (new; envelope structs + helpers)
- `backend/internal/api/middleware.go` (RequestIDMiddleware, LoggingMiddleware with requestId)
- `backend/cmd/api/main.go` (wire RequestIDMiddleware in handler chain)
- `backend/internal/api/handlers.go` (refactor to use OK/BadRequest/…)
- `.documents/api-response-standard.md` (standard doc)
- `swagger/openapi.yaml` (update schemas/responses – pending)

**Steps:**
1. Implement envelope types and helper writers (OK/Created/BadRequest/…).
2. Add RequestID middleware (set/forward `X-Request-ID`, attach to context).
3. Wire chain: `RequestIDMiddleware → LoggingMiddleware → mux`.
4. Refactor handlers to use helpers.
5. Update docs (.documents/api-response-standard.md) and Swagger (pending).
6. Rebuild backend and test.

**Notes:**
- All future endpoints should adopt the envelope for consistency.
- Include `meta.requestId` and `meta.timestamp` for every response.

---

## API Manual Test via Sandbox `env.yaml`
**Last performed:** 2025-10-19
**Files/Configs:**
- `.box-testing/sandbox/env.yaml` (idToken, email, name)

**Steps:**
1. Read `idToken`, `email`, `name` from `env.yaml`.
2. Call:
   ```bash
   curl -s -D - -X POST http://localhost:8080/v1/users/register \
     -H "Authorization: Bearer <idToken>" \
     -H "Content-Type: application/json" \
     --data '{"name":"<name>","email":"<email>","avatar_url":""}'
   ```
3. Expect 200 and envelope JSON with `success=true`, `data.user_id`, and `meta.requestId`.
4. Verify DB update:
   ```bash
   docker exec -e PGPASSWORD=imageai_pass -it imageaiwrapper-db \
     psql -U imageai -d imageai_db -c \
     "SELECT id,email,name,avatar_url,created_at,updated_at FROM user_profiles ORDER BY id DESC LIMIT 5;"
   ```

**Notes:**
- If Firebase Admin verification is enabled (FIREBASE_SERVICE_ACCOUNT set), ensure `idToken` is valid and not expired.
