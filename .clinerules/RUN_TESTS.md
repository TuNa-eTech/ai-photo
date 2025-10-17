# Hướng dẫn chạy kiểm thử tự động trên local

## 1. Backend (Go)

### Chạy toàn bộ unit & integration test:
```bash
cd backend
go test ./...
```
- Lệnh này sẽ tự động tìm và chạy tất cả các file `*_test.go` và `*_integration.go` trong toàn bộ project backend.
- Kết quả sẽ hiển thị số lượng test pass/fail, chi tiết lỗi nếu có.

### Kiểm tra coverage (bao phủ mã nguồn):
```bash
go test -cover ./...
```

---

## 2. iOS (Swift/SwiftUI)

### Chạy test trong Xcode:
- Mở project `imageaiwrapper.xcodeproj` bằng Xcode.
- Chọn target `imageaiwrapperTests` hoặc `imageaiwrapperUITests`.
- Nhấn ⌘U (Command + U) để chạy toàn bộ test.

### Chạy test bằng CLI (Terminal):
```bash
cd app_ios
xcodebuild test -scheme imageaiwrapper -destination 'platform=iOS Simulator,name=iPhone 15'
```
- Thay đổi `name=iPhone 15` thành simulator bạn có cài đặt.
- Kết quả sẽ hiển thị trong terminal.

---

## 3. Gợi ý tích hợp CI (nếu muốn tự động hóa)

- Backend: Thêm bước `go test ./...` vào workflow CI (GitHub Actions, GitLab CI, v.v.)
- iOS: Thêm bước `xcodebuild test ...` vào workflow CI.

---

## 4. Lưu ý

- Đảm bảo đã cài đặt đầy đủ Go, Xcode, simulator/device trước khi chạy test.
- Nếu test iOS cần Firebase/Google config, hãy chắc chắn file cấu hình (`GoogleService-Info.plist`) đã được thêm vào project.

---

## 5. Chạy unit test iOS tuần tự, không song song (sequential, no parallel)

- Để tránh quá tải bộ nhớ khi chạy unit test iOS, chỉ nên chạy từng file test một, tuần tự, và dùng formatter xcpretty để dễ đọc log.
- Thêm `-parallel-testing-enabled NO` vào lệnh xcodebuild để tắt chạy song song.
- Ví dụ chạy duy nhất file `ImageProcessingViewModelTests.swift` với xcpretty:

```bash
cd app_ios
xcodebuild test \
  -scheme imageaiwrapper \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -only-testing:imageaiwrapperTests/ImageProcessingViewModelTests \
  -parallel-testing-enabled NO | xcpretty
```

- Thay đổi `name=iPhone 17` thành simulator bạn có cài đặt.
- `-only-testing` giúp chỉ chạy đúng 1 file test, tránh quá tải.
- `-parallel-testing-enabled NO` đảm bảo test chạy tuần tự.
- `| xcpretty` giúp log dễ đọc hơn.

- Nếu dùng CI, nên thêm các flag này vào script test iOS.
