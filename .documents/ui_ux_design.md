# Tài liệu Thiết kế UI/UX - AI Image Stylist

Tài liệu này phác thảo các màn hình chính và luồng tương tác người dùng cho ứng dụng.

## 1. Nguyên tắc thiết kế

- **Tối giản:** Giao diện cần sạch sẽ, trực quan, tập trung vào chức năng chính.
- **Nhanh chóng:** Người dùng có thể tạo ra một bức ảnh theo phong cách mới với ít bước nhất có thể.
- **Trực quan:** Hiển thị rõ ràng các template và kết quả trước/sau khi xử lý.

---

## 2. Bảng màu và Font

- **Bảng màu (gợi ý):**
  - **Nền chính:** Màu trắng hoặc xám rất nhạt (`#FFFFFF`, `#F8F9FA`).
  - **Màu nhấn (Accent):** Một màu nổi bật cho các nút và thành phần quan trọng (ví dụ: xanh dương `#007AFF`).
  - **Văn bản:** Màu đen hoặc xám đậm (`#212529`).
- **Font chữ:** Sử dụng font hệ thống của iOS (San Francisco) để đảm bảo tính nhất quán và dễ đọc.

---

## 3. Các màn hình chính (Wireframes)

### **Màn hình 1: Thư viện Template (Gallery View)**

- **Bố cục:** Một grid view (dạng lưới) hiển thị các template.
- **Thành phần:**
  - **Thanh điều hướng (Navigation Bar):**
    - Tiêu đề: "AI Image Stylist".
    - Nút User Profile/Login ở góc phải.
  - **Lưới Template:**
    - Mỗi item trong lưới là một hình chữ nhật bo góc.
    - Hiển thị `thumbnail_url` của template.
    - Tên của template (`name`) được đặt bên dưới ảnh thumbnail.
- **Tương tác:**
  - Nhấn vào một template sẽ điều hướng đến Màn hình 2.

---

### **Màn hình 2: Chọn ảnh & Xử lý (Editor View)**

- **Bố cục:** Chia làm 3 phần chính theo chiều dọc.
- **Thành phần:**
  - **Phần 1: Template đã chọn:**
    - Hiển thị lại ảnh thumbnail và tên của template đã chọn ở phía trên cùng.
  - **Phần 2: Vùng chọn ảnh:**
    - Một khung lớn ở giữa màn hình.
    - Ban đầu, hiển thị một icon "+" hoặc "Upload Image" lớn.
    - Sau khi người dùng chọn ảnh, ảnh gốc sẽ được hiển thị ở đây.
  - **Phần 3: Nút hành động:**
    - Một nút lớn ở dưới cùng với tiêu đề "Generate Image".
- **Tương tác:**
  - Nhấn vào vùng chọn ảnh sẽ mở thư viện ảnh của hệ thống (Image Picker).
  - Sau khi chọn ảnh, nút "Generate Image" sẽ được kích hoạt.
  - Nhấn "Generate Image" sẽ điều hướng đến Màn hình 3.

---

### **Màn hình 3: Đang xử lý (Loading View)**

- **Bố cục:** Đơn giản, tập trung vào việc thông báo trạng thái.
- **Thành phần:**
  - Một `ProgressView` (vòng xoay loading) ở giữa màn hình.
  - Một dòng chữ bên dưới: "Đang xử lý, vui lòng chờ..." hoặc "Generating your masterpiece...".
- **Tương tác:**
  - Màn hình này sẽ tự động chuyển đến Màn hình 4 khi nhận được kết quả từ backend.
  - Nếu có lỗi, một `Alert` (thông báo) sẽ được hiển thị.

---

### **Màn hình 4: Hiển thị kết quả (Result View)**

- **Bố cục:** So sánh ảnh trước và sau.
- **Thành phần:**
  - **Thanh điều hướng:**
    - Nút "Back" để quay lại Màn hình 1.
  - **Vùng hiển thị ảnh:**
    - Hiển thị ảnh đã được AI xử lý (`processed_image_url`).
    - (Tùy chọn nâng cao) Có thể có một thanh trượt để so sánh ảnh gốc và ảnh kết quả.
  - **Các nút hành động:**
    - Nút "Save to Library": Lưu ảnh kết quả vào thư viện ảnh của người dùng.
    - Nút "Share": Mở giao diện chia sẻ của hệ thống.
    - Nút "Try Another Style": Quay lại Màn hình 1.

---

## 4. Luồng xác thực

- **Khi mở ứng dụng:** Nếu người dùng chưa đăng nhập, một màn hình modal sẽ hiện lên yêu cầu đăng nhập/đăng ký.
- **Màn hình Login/Register:** Cung cấp các tùy chọn đăng nhập bằng Email/Password, Apple, Google.