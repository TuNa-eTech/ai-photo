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