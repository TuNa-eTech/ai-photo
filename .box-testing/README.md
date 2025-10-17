# .box-testing

**Mục đích:**  
`.box-testing` là khu vực sandbox kiểm thử toàn diện cho dự án ImageAIWraper. Thư mục này dùng để lưu trữ test data, script kiểm thử, tài liệu test, sandbox thử nghiệm code, và các test case đặc biệt mà không ảnh hưởng đến dữ liệu/logic chính của hệ thống.

## Cấu trúc thư mục chuẩn

```
.box-testing/
  images/           # Ảnh test, ảnh lỗi, ảnh edge case
  json/             # File JSON test, mock response
  scripts/          # Script kiểm thử tự động (shell, Go, Swift, v.v.)
  docs/             # Tài liệu test, checklist, hướng dẫn kiểm thử
  sandbox/          # Thử nghiệm code, PoC, ý tưởng mới, code tạm
  cases/            # Test case đặc biệt, input/output mẫu, edge case
  README.md         # (file này)
```

## Quy ước sử dụng

- **Không commit dữ liệu nhạy cảm hoặc ảnh thật của user.**
- Mọi file/script/tài liệu phải có mô tả rõ ràng, dễ hiểu.
- Khi có quy trình kiểm thử mới, cập nhật vào `docs/` và reference trong `.documents` hoặc memory bank.
- Khi phát triển tính năng mới, có thể thử nghiệm trước trong `sandbox/` trước khi tích hợp vào codebase chính.
- Định kỳ review, dọn dẹp các thử nghiệm cũ trong `sandbox/`.

## Liên kết với workflow dự án

- Chuẩn hóa test data cho unit test, integration test, manual test.
- Lưu checklist/manual test script tại `docs/`.
- Ghi lại workflow kiểm thử lặp lại trong `docs/` và cập nhật vào memory bank/tasks.md nếu cần.

---

**Mọi thành viên đều có thể sử dụng `.box-testing` để tăng hiệu quả kiểm thử, thử nghiệm, và phát triển an toàn.**
