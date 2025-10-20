# Tài liệu Quy trình Phát triển & Triển khai

Tài liệu này định nghĩa các quy trình chuẩn cho việc phát triển, kiểm thử và triển khai dự án AI Image Stylist.

## 1. Quản lý mã nguồn (Git)

### **1.1. Chiến lược Branch**

Dự án sẽ tuân theo mô hình GitFlow đơn giản hóa:

- **`main`:**
  - Đây là nhánh chính, luôn ở trạng thái sẵn sàng để phát hành (production-ready).
  - Chỉ được merge code từ nhánh `develop` sau khi đã kiểm thử kỹ lưỡng.
  - Không ai được commit trực tiếp lên `main`.

- **`develop`:**
  - Nhánh tích hợp chính cho các tính năng mới.
  - Tất cả các nhánh `feature` sẽ được merge vào đây.
  - Đây là nơi thực hiện các hoạt động kiểm thử tích hợp.

- **`feature/<feature-name>`:**
  - Mỗi tính năng mới (ví dụ: `feature/user-profile`, `feature/image-comparison-slider`) phải được phát triển trên một nhánh riêng, được tạo từ `develop`.
  - Tên nhánh cần rõ ràng, mô tả ngắn gọn tính năng.
  - Sau khi hoàn thành, nhánh này sẽ được merge trở lại `develop` thông qua một Pull Request.

### **1.2. Pull Request (PR) & Code Review**

- Mọi thay đổi muốn merge vào `develop` hoặc `main` đều phải thông qua một Pull Request.
- Mỗi PR cần ít nhất một người khác trong team review và chấp thuận (approve).
- **Nội dung PR cần có:**
  - Mô tả rõ ràng những gì đã thay đổi và tại sao.
  - Liên kết đến các task/issue liên quan (nếu có).

---

## 4. Test-Driven Development (TDD) Guidelines

### 4.1. TDD Principles

- All new features and bugfixes must be developed using TDD: write tests before writing implementation code.
- Tests must be automated and run as part of the CI/CD pipeline.
- Code is not considered "done" until all relevant tests pass.

### 4.2. Required Test Types

- **iOS (Swift/SwiftUI):**
  - Unit tests for all business logic, ViewModels, and utility classes (using XCTest or the project's chosen test framework).
  - UI tests for critical user flows (using XCTest UI testing).
- **Backend (Go):**
  - Unit tests for all handlers, middleware, and business logic (using Go's built-in `testing` package).
  - Integration tests for API endpoints and database interactions.

### 4.3. TDD Workflow

#### iOS Example

1. Write a failing unit test for a new ViewModel method in `app_ios/imageaiwrapperTests/`.
2. Implement the minimum code to make the test pass.
3. Refactor code for clarity/efficiency.
4. Repeat for UI tests in `app_ios/imageaiwrapperUITests/` for new screens or flows.

**Sample Swift Unit Test:**
```swift
import XCTest
@testable import imageaiwrapper

final class HomeViewModelTests: XCTestCase {
    func testTemplateListLoads() {
        let vm = HomeViewModel()
        vm.loadTemplates()
        XCTAssertFalse(vm.templates.isEmpty)
    }
}
```

#### Go Backend Example

1. Write a failing test in a new or existing `*_test.go` file.
2. Implement the minimum code to pass the test.
3. Refactor as needed.
4. Repeat for all new handlers, middleware, and business logic.

**Sample Go Unit Test:**
```go
package auth

import "testing"

func TestVerifyIDToken_InvalidToken(t *testing.T) {
    _, err := VerifyIDToken("invalid-token")
    if err == nil {
        t.Fatal("expected error for invalid token")
    }
}
```

### 4.4. PR/Test Requirements

- Every PR must include tests for new/changed code.
- PRs without tests will not be approved unless justified in the PR description.
- All tests must pass in CI before merging.

### 4.5. Test Coverage

- Aim for high coverage of business logic and critical flows.
- Use code coverage tools (Xcode for iOS, `go test -cover` for Go) to monitor and improve coverage.

---

## 2. CI/CD (Tích hợp và Triển khai liên tục)

Để đảm bảo chất lượng và tự động hóa, dự án sẽ sử dụng GitHub Actions.

### **2.1. Workflow cho Backend (Go Service)**

- **Trigger:** Khi một Pull Request được merge vào nhánh `develop` và có sự thay đổi trong thư mục `backend/`.
- **Các bước (Jobs):**
  1.  **Build & Test:**
      - Build ứng dụng Go.
      - Chạy unit test.
  2.  **Build Docker Image:** Xây dựng một Docker image cho backend service.
  3.  **Deploy to Staging:** Tự động triển khai Docker image lên môi trường Staging.
- **Triển khai lên Production:** Việc triển khai lên môi trường Production sẽ được thực hiện thủ công sau khi đã xác nhận tính năng hoạt động ổn định trên Staging.

### **2.2. Workflow cho Frontend (iOS App)**

- **Trigger:** Khi một Pull Request được merge vào nhánh `develop`.
- **Các bước (Jobs):**
  1.  **Build & Test:**
      - Build ứng dụng iOS.
      - Chạy Unit Tests và UI Tests trên một simulator.
- **Phân phối (Deployment):** Việc build và phân phối phiên bản mới cho TestFlight/App Store sẽ được thực hiện thủ công từ Xcode hoặc qua một workflow riêng được trigger bằng tay.

---

## 3. Quản lý Môi trường

Dự án sẽ có ít nhất 2 môi trường backend riêng biệt:

---

## Hướng dẫn chạy Backend (Go)

**Để chạy backend đúng entrypoint:**
- Sử dụng lệnh:
  ```
  go run ./cmd/api/main.go
  ```
  hoặc build từ đúng source:
  ```
  go build -o app ./cmd/api/main.go
  ./app
  ```
- **Không chạy** `go run ./cmd/api/main.go` ở thư mục backend root, vì file này không đăng ký đầy đủ các API handler.

**Lý do:**  
- File entrypoint chuẩn là `backend/cmd/api/main.go`. Nếu chạy nhầm file `backend/main.go`, API sẽ không hoạt động đúng (truy cập `/` sẽ trả về 404).

**Kiểm tra:**  

1.  **Staging/Development:**
    - Dùng cho việc phát triển và kiểm thử các tính năng mới.
    - Sử dụng một môi trường riêng với dữ liệu giả (mock data).
    - API keys và URLs cho môi trường này sẽ được lưu trong một file cấu hình riêng của ứng dụng iOS (ví dụ: `Staging.xcconfig`).

2.  **Production:**
    - Môi trường cho người dùng cuối.
    - Dữ liệu thật, được backup thường xuyên.
    - API keys và URLs được lưu trong file `Production.xcconfig` và không được commit vào Git (sẽ được inject vào lúc build).

Việc chuyển đổi giữa các môi trường trong ứng dụng iOS sẽ được quản lý bằng Build Configurations trong Xcode.

---

## Backend Database Migrations (Local Dev)

Sử dụng golang-migrate dạng container để áp dụng migration vào Postgres chạy bằng Docker, tránh lỗi auth trên host.

1) Khởi động Postgres:
```bash
cd docker
docker compose up -d db
```

2) Áp dụng migrations (chia sẻ network với container DB):
- Nếu đang ở thư mục repo root:
```bash
docker run --rm \
  -v "$(pwd)/backend/migrations:/migrations" \
  --network container:imageaiwrapper-db \
  migrate/migrate:latest \
  -path=/migrations \
  -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable" up
```
- Nếu đang ở thư mục docker:
```bash
docker run --rm \
  -v "$(pwd)/../backend/migrations:/migrations" \
  --network container:imageaiwrapper-db \
  migrate/migrate:latest \
  -path=/migrations \
  -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable" up
```

3) Kiểm tra bảng:
```bash
docker exec -e PGPASSWORD=imageai_pass -it imageaiwrapper-db \
  psql -U imageai -d imageai_db -c "\dt"
```

4) (Tuỳ chọn) Rollback 1 bước:
```bash
docker run --rm \
  -v "$(pwd)/backend/migrations:/migrations" \
  --network container:imageaiwrapper-db \
  migrate/migrate:latest \
  -path=/migrations \
  -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable" down 1
```

Notes:
- Host `migrate` có thể fail do SCRAM; ưu tiên cách containerized như trên.

---

## Backend Build/Run (Docker, Go 1.25 toolchain)

Dockerfile backend đã nâng cấp lên Go 1.25 để phù hợp `go.mod (>= 1.25.2)`.

Build & chạy backend:
```bash
cd docker
docker compose up -d --build backend
```

Xem log:
```bash
docker logs --tail 200 imageaiwrapper-backend
```

---

## Register User Persistence (Postgres)

API `/v1/users/register` nay đã persist profile vào bảng `user_profiles` (email unique, name, avatar_url).

Test nhanh:
```bash
curl -X POST http://localhost:8080/v1/users/register \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  --data '{"name":"Full Name","email":"user@example.com","avatar_url":""}'
```

Xác minh DB:
```bash
docker exec -e PGPASSWORD=imageai_pass -it imageaiwrapper-db \
  psql -U imageai -d imageai_db -c \
  "SELECT id,email,name,avatar_url,created_at,updated_at FROM user_profiles ORDER BY id DESC LIMIT 10;"
```

---

## iOS API Client Logging

App iOS sử dụng `APIClient` in chi tiết:
- Request: METHOD + URL, headers (Authorization/cookies được REDACTED), body JSON (pretty).
- Response: status code, headers (redaction), body JSON (pretty), duration ms.

Tích hợp ở `UserRepository`:
- Dùng `APIRequest.json(...)` tạo request.
- Gọi `client.send(..., authToken: <Firebase ID token>)`.
- Map 401 → `.unauthorized` để ViewModel refresh token.

Lưu ý:
- Đảm bảo `AppConfig.backendBaseURL` trỏ đúng backend (http://localhost:8080 cho Simulator).
- Logger mặc định bật ở DEBUG; có thể tắt/bật: `client.logger.enabled = true/false`.
