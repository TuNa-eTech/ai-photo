# Tài liệu Đặc tả API - AI Image Stylist

Tài liệu này đặc tả chi tiết các API endpoint được sử dụng trong dự án.

## 1. API: `process-image`

Đây là API chính để xử lý ảnh, được gọi từ ứng dụng client (SwiftUI).

- **Endpoint:** `/v1/images/process`
- **Method:** `POST`
- **Authentication:** Bắt buộc. Yêu cầu có header `Authorization` chứa Firebase ID token (JWT) do Firebase cấp.
  - `Authorization: Bearer <firebase-id-token>`
  - Backend sẽ xác thực token này bằng Firebase Admin SDK (service account).

---

### **Request**

- **Headers:**
  - `Content-Type: application/json`

- **Body Schema (JSON):**

  ```json
  {
    "template_id": "string",
    "image_path": "string"
  }
  ```

- **Mô tả các trường:**
  - `template_id` (bắt buộc): `id` của template được chọn.
  - `image_path` (bắt buộc): Đường dẫn (path) của ảnh gốc đã được upload.

---

### **Responses**

#### **200 OK - Success**

- **Mô tả:** Trả về khi ảnh được xử lý thành công.
- **Body Schema (JSON):**

  ```json
  {
    "processed_image_url": "string"
  }
  ```
  - `processed_image_url`: URL công khai (public URL) của ảnh kết quả.

---

#### **400 Bad Request - Lỗi Dữ liệu đầu vào**

- **Mô tả:** Trả về khi request body không hợp lệ (thiếu trường, sai kiểu dữ liệu).
- **Body Schema (JSON):**

  ```json
  {
    "error": "Invalid request body. template_id and image_path are required."
  }
  ```

---

#### **401 Unauthorized - Lỗi Xác thực**

- **Mô tả:** Trả về khi Firebase ID token không hợp lệ, hết hạn, hoặc bị thiếu.
- **Body Schema (JSON):**

  ```json
  {
    "error": "Unauthorized. Invalid, expired, or missing Firebase authentication token."
  }
  ```

---

#### **404 Not Found - Không tìm thấy**

- **Mô tả:** Trả về khi `template_id` hoặc `image_path` không tồn tại trong hệ thống.
- **Body Schema (JSON):**

  ```json
  {
    "error": "Template or image not found."
  }
  ```

---

#### **500 Internal Server Error - Lỗi Server**

- **Mô tả:** Trả về khi có lỗi xảy ra ở phía server (ví dụ: gọi API của Gemini thất bại, không thể lưu file...).
- **Body Schema (JSON):**

  ```json
  {
    "error": "An internal server error occurred while processing the image."
  }
  ```
