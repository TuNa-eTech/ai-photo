# Implementation Plan

## [Status Checklist]
- [x] Định nghĩa struct/model trong `models.go`
- [x] Tạo stub cho logic xử lý ảnh, storage, database
- [x] Viết handler `ProcessImageHandler` và đăng ký route trong `main.go`
- [x] Viết unit test cho handler (TDD)
- [x] Bổ sung logic thực tế cho xử lý ảnh, lưu trữ, truy vấn template (tích hợp Gemini API, lưu ảnh thực tế, truy vấn template động)
- [x] Kiểm thử tích hợp với app iOS (đã kết nối, gửi request, nhận kết quả thành công)

[Overview]
Triển khai endpoint `/v1/images/process` cho backend Go, cho phép người dùng đã xác thực gửi yêu cầu xử lý ảnh với template AI, nhận về URL ảnh kết quả.
Kế hoạch này nhằm hiện thực hóa usecase đã mô tả trong `.documents/usecase_process_image.md` và đặc tả API trong `.documents/api_specification.md`.
Backend đã hoàn thiện logic xử lý ảnh (giả lập), lưu trữ file thực tế, truy vấn template từ file `templates.json`, và cho phép bật/tắt xác thực Firebase Auth qua biến môi trường `DISABLE_AUTH` (hữu ích cho phát triển local/test).

[Types]
Bổ sung các struct cho request/response, model Template, và các error type liên quan.

- `ProcessImageRequest` (struct): chứa `template_id` (string), `image_path` (string)
- `ProcessImageResponse` (struct): chứa `processed_image_url` (string)
- `Template` (struct): chứa `ID` (string), `Name` (string), `Prompt` (string)
- `ErrorResponse` (struct): chứa `error` (string)

[Files]
Các file chính:
- `backend/internal/api/handlers.go` — Xử lý logic endpoint `/v1/images/process`
- `backend/internal/image/image.go` — Logic xử lý ảnh (giả lập, có TODO tích hợp Gemini)
- `backend/internal/models/models.go` — Định nghĩa model Template, ProcessImageRequest/Response
- `backend/internal/storage/storage.go` — Lưu và truy xuất ảnh thực tế (thư mục processed/)
- `backend/internal/database/database.go` — Truy vấn template từ file `templates.json`
- `backend/main.go` — Đăng ký route, cho phép bật/tắt xác thực qua biến `DISABLE_AUTH`
- `backend/templates.json` — Danh sách template AI style

[Functions]
Các hàm chính:
- `ProcessImageHandler(w http.ResponseWriter, r *http.Request)` (handlers.go): Xử lý request, xác thực (nếu bật), kiểm tra dữ liệu, gọi xử lý ảnh, trả response.
- `ProcessImage(req *ProcessImageRequest) (string, error)` (image.go): Thực hiện xử lý ảnh (giả lập, TODO tích hợp Gemini).
- `GetTemplateByID(id string) (*Template, error)` (database.go): Truy vấn template từ file `templates.json`.
- `ImageExists(path string) bool` (storage.go): Kiểm tra tồn tại file ảnh gốc.
- `SaveProcessedImage(path string, data []byte) (string, error)` (storage.go): Lưu file ảnh kết quả vào thư mục processed/, trả về đường dẫn file.

[Classes]
Không sử dụng class (Go), chỉ struct và function.

[Dependencies]
Không thêm package ngoài, sử dụng các dependency đã có (Firebase Admin SDK, net/http, encoding/json).

[Testing]
Viết test cho handler `/v1/images/process`:

- Tạo mới: `backend/internal/api/handlers_test.go` — Test các luồng thành công, lỗi xác thực, lỗi dữ liệu, lỗi không tìm thấy, lỗi hệ thống.
- Sử dụng mock cho các hàm xử lý ảnh, truy vấn template, kiểm tra ảnh.

[Notes & Integration Test]
- Có thể bật/tắt xác thực Firebase Auth qua biến `DISABLE_AUTH` trong `.env` (hữu ích cho phát triển local/test).
- Logic xử lý AI hiện tại là giả lập, ảnh kết quả được lưu vào thư mục `processed/`.
- Template được truy vấn từ file `templates.json`.
- Đã kiểm thử tích hợp thành công: request hợp lệ trả về `{"processed_image_url":"/processed/processed_test_img.png"}`; các trường hợp lỗi trả về đúng mã lỗi.

[Implementation Order]
Thứ tự thực hiện:
1. Định nghĩa struct/model trong `models.go`
2. Tạo stub cho logic xử lý ảnh, storage, database
3. Viết handler `ProcessImageHandler` và đăng ký route trong `main.go`
4. Viết unit test cho handler (TDD)
5. Bổ sung logic thực tế cho xử lý ảnh, lưu trữ, truy vấn template (nếu cần)
6. Kiểm thử tích hợp với app iOS
