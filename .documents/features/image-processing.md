# Usecase: Xử lý ảnh với AI Style (`process-image`)

## Mục tiêu
Cho phép người dùng đã xác thực gửi yêu cầu xử lý ảnh với một template AI đã chọn, nhận về ảnh kết quả đã được áp dụng style.

---

## Actors
- **User (đã đăng nhập qua Firebase)**
- **Backend API (Go, xác thực bằng Firebase Admin SDK)**

---

## Luồng chính (Main Flow)
1. Người dùng đăng nhập thành công trên app iOS (qua Firebase Auth).
2. Người dùng chọn một template AI style từ danh sách.
3. Người dùng upload ảnh gốc lên hệ thống (lưu ý: upload ảnh là bước riêng, không nằm trong usecase này).
4. App iOS gửi request POST tới endpoint `/v1/images/process` với:
    - Header: `Authorization: Bearer <firebase-id-token>`
    - Body: `{ "template_id": "<id>", "image_path": "<path>" }`
5. Backend xác thực Firebase ID token:
    - Nếu token không hợp lệ/hết hạn/thất lạc → trả về 401 Unauthorized.
6. Backend kiểm tra dữ liệu đầu vào:
    - Nếu thiếu `template_id` hoặc `image_path` → trả về 400 Bad Request.
7. Backend kiểm tra sự tồn tại của template và ảnh:
    - Nếu không tìm thấy → trả về 404 Not Found.
8. Backend thực hiện xử lý ảnh với template AI (gọi Edge Function hoặc AI service).
    - Nếu có lỗi hệ thống → trả về 500 Internal Server Error.
9. Nếu thành công, backend trả về 200 OK với `processed_image_url` (public URL ảnh kết quả).

---

## Luồng phụ/ngoại lệ (Alternative/Exception Flows)
- **Token không hợp lệ/hết hạn:** Trả về 401 Unauthorized.
- **Dữ liệu đầu vào thiếu/sai:** Trả về 400 Bad Request.
- **Không tìm thấy template hoặc ảnh:** Trả về 404 Not Found.
- **Lỗi hệ thống:** Trả về 500 Internal Server Error.

---

## Điều kiện tiên quyết
- Người dùng đã đăng nhập và có Firebase ID token hợp lệ (có thể tắt xác thực bằng biến môi trường `DISABLE_AUTH=true` khi phát triển local).
- Ảnh gốc đã được upload thành công và có `image_path` hợp lệ (file phải nằm trong thư mục backend/).
- Template AI style tồn tại trong hệ thống (được định nghĩa trong file `templates.json`).

---

## Lưu ý triển khai & kiểm thử
- Có thể tắt xác thực Firebase Auth cho môi trường local bằng biến `DISABLE_AUTH=true` trong file `.env`.
- Logic xử lý AI hiện tại là giả lập (chưa tích hợp Gemini/Edge Function thực tế).
- Ảnh kết quả được lưu vào thư mục `backend/processed/`, trả về đường dẫn file nội bộ.
- Template được truy vấn từ file `backend/templates.json`.

---

## Kết quả mong đợi
- Ảnh kết quả được xử lý thành công và trả về public URL cho client (hoặc đường dẫn file nội bộ khi test local).
- Các trường hợp lỗi được trả về đúng mã lỗi và thông báo rõ ràng.

---

## Kết quả kiểm thử tích hợp (Integration Test)
- Request hợp lệ trả về: `{"processed_image_url":"/processed/processed_test_img.png"}`
- Ảnh kết quả được lưu đúng vị trí, có thể kiểm tra file thực tế.
- Các trường hợp lỗi (thiếu trường, ảnh/template không tồn tại) trả về đúng mã lỗi.

---

## Liên kết tài liệu liên quan
- `.documents/api_specification.md` (đặc tả chi tiết API)
- `.memory-bank/context.md` (trạng thái phát triển hiện tại)
