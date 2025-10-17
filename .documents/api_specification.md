# Tài liệu Đặc tả API - AI Image Stylist

Tài liệu này đặc tả chi tiết các API endpoint được sử dụng trong dự án.

---

## Lưu ý về xác thực

- **Backend KHÔNG cung cấp API login.**
- **Toàn bộ xác thực (Google/Apple) được thực hiện qua Firebase Auth trên client (iOS app).**
- **Backend chỉ xác thực Firebase ID token (JWT) gửi từ client qua header `Authorization: Bearer <firebase-id-token>`.**
- Nếu cần lưu thông tin profile user, sử dụng API register (mô tả bên dưới).

---

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

---

## 2. API: `register-user`

API này dùng để đăng ký hoặc cập nhật thông tin profile user trên backend. Không xử lý xác thực đăng nhập, chỉ lưu thông tin profile.

- **Endpoint:** `/v1/users/register`
- **Method:** `POST`
- **Authentication:** Bắt buộc. Yêu cầu header `Authorization: Bearer <firebase-id-token>`
- **Headers:**
  - `Content-Type: application/json`
- **Body Schema (JSON):**
  ```json
  {
    "name": "string",
    "email": "string",
    "avatar_url": "string"
  }
  ```
  - `name` (bắt buộc): Tên hiển thị của user.
  - `email` (bắt buộc): Email user (nên lấy từ Firebase).
  - `avatar_url` (tùy chọn): Link ảnh đại diện.

### **Responses**

#### **200 OK - Success**
- **Mô tả:** Đăng ký/cập nhật profile thành công.
- **Body Schema (JSON):**
  ```json
  {
    "user_id": "string",
    "message": "User registered/updated successfully."
  }
  ```

#### **400 Bad Request**
- **Mô tả:** Thiếu trường bắt buộc hoặc dữ liệu không hợp lệ.
- **Body Schema (JSON):**
  ```json
  {
    "error": "Invalid request body. name and email are required."
  }
  ```

#### **401 Unauthorized**
- **Mô tả:** Token không hợp lệ, hết hạn, hoặc thiếu.
- **Body Schema (JSON):**
  ```json
  {
    "error": "Unauthorized. Invalid, expired, or missing Firebase authentication token."
  }
  ```

#### **500 Internal Server Error**
- **Mô tả:** Lỗi server khi lưu thông tin user.
- **Body Schema (JSON):**
  ```json
  {
    "error": "An internal server error occurred while registering the user."
  }
  ```
