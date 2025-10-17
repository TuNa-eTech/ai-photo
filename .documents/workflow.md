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

1.  **Staging/Development:**
    - Dùng cho việc phát triển và kiểm thử các tính năng mới.
    - Sử dụng một môi trường riêng với dữ liệu giả (mock data).
    - API keys và URLs cho môi trường này sẽ được lưu trong một file cấu hình riêng của ứng dụng iOS (ví dụ: `Staging.xcconfig`).

2.  **Production:**
    - Môi trường cho người dùng cuối.
    - Dữ liệu thật, được backup thường xuyên.
    - API keys và URLs được lưu trong file `Production.xcconfig` và không được commit vào Git (sẽ được inject vào lúc build).

Việc chuyển đổi giữa các môi trường trong ứng dụng iOS sẽ được quản lý bằng Build Configurations trong Xcode.
