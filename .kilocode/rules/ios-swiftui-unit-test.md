---
alwaysApply: true
---
## Brief overview
- Quy tắc này hướng dẫn cách chạy, viết, và duy trì unit test cho dự án iOS SwiftUI sử dụng Xcode, Swift, và XCTest.
- Áp dụng cho mọi dự án SwiftUI/iOS trong workspace này.

## Communication style
- Luôn báo cáo kết quả test rõ ràng: số lượng test pass/fail, lỗi chi tiết.
- Khi gặp lỗi test, ưu tiên log lỗi đầu tiên và hướng dẫn cách fix.
- Khi hướng dẫn test, cung cấp cả lệnh CLI và hướng dẫn thao tác trong Xcode.

## Development workflow
- Mọi tính năng hoặc bugfix đều phải có unit test đi kèm.
- Viết test trước (TDD) hoặc song song với code logic.
- Đảm bảo test chạy được trên simulator phổ biến (ví dụ: iPhone 17).
- Khi thêm file test mới, luôn kiểm tra "Target Membership" phải tick vào target test (ví dụ: imageaiwrapperTests).
- Khi di chuyển file logic, phải đảm bảo test liên quan cũng được cập nhật đường dẫn và target.

## Coding best practices
- Sử dụng XCTest cho unit test, ưu tiên test logic thuần (không phụ thuộc UI).
- Đặt tên hàm test rõ ràng, theo pattern: `test<Functionality>_<ExpectedBehavior>`.
- Khi mock network/API, sử dụng MockURLSession hoặc các class mock tương tự.
- Đảm bảo class test và mock phải là `final` hoặc khai báo `@unchecked Sendable` nếu cần.
- Tránh dùng async/await trong test nếu không cần thiết, nhưng nếu dùng phải wrap bằng expectation hoặc Task.
- Khi test fail, luôn assert rõ ràng lý do (XCTAssertEqual, XCTAssertNil, XCTAssertThrowsError...).

## Project context
- Test code phải nằm trong thư mục `app_ios/imageaiwrapperTests/`.
- File test phải có hậu tố `Tests.swift`.
- Đảm bảo file logic (ví dụ: RegisterUserAPI.swift) thuộc target app chính, file test thuộc target test.
- Khi chạy test tự động, dùng lệnh:
  ```
  cd app_ios
  xcodebuild test -scheme imageaiwrapper -destination 'platform=iOS Simulator,name=iPhone 17' -parallel-testing-enabled NO | xcpretty
  ```
- Có thể chạy test từng file với flag `-only-testing:<Target>/<TestClass>`.

## Other guidelines
- Khi gặp lỗi "Cannot find 'X' in scope", kiểm tra lại target membership và đường dẫn file.
- Khi gặp lỗi "extra trailing closure passed in call", kiểm tra API đã chuyển sang async/await chưa.
- Khi gặp lỗi "main actor-isolated conformance ... cannot be used in nonisolated context", cần wrap decode/encode trong Task hoặc chuyển model về struct thuần.
- Luôn clean build folder (⇧⌘K) khi thay đổi file test/logic lớn.
- Ưu tiên chạy test tuần tự, không song song để tránh lỗi memory hoặc race condition.
