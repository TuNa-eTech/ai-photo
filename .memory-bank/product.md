# Product Description

_This file explains why the project exists, the problems it solves, how it should work, and user experience goals._

## Why This Project Exists
- [x] ImageAIWraper ra đời nhằm cung cấp một nền tảng xử lý ảnh AI hiện đại, dễ tích hợp, cho phép người dùng cuối (qua app iOS) và các hệ thống khác dễ dàng sử dụng các mô hình AI mới nhất (Gemini, v.v.) mà không cần hiểu sâu về backend hay AI.

## Problems It Solves
- [x] Đơn giản hóa quy trình tích hợp AI image processing cho mobile app.
- [x] Giải quyết bài toán xác thực bảo mật (Firebase Auth), quản lý template AI động, lưu trữ ảnh hiệu quả.
- [x] Loại bỏ hoàn toàn backend login, xác thực 100% qua Firebase Auth (idToken), chỉ dùng API `/v1/users/register` để lưu/cập nhật profile user (không xác thực đăng nhập).
- [x] Cho phép mở rộng, thay thế, nâng cấp mô hình AI mà không ảnh hưởng tới trải nghiệm người dùng.
- [x] Đảm bảo trải nghiệm liền mạch từ đăng nhập, chọn template, upload ảnh, nhận kết quả AI.

## How It Should Work
- [x] Người dùng đăng nhập bằng Google/Apple trên app iOS (xác thực Firebase).
- [x] Sau khi đăng nhập Firebase thành công, app tự động gọi API `/v1/users/register` (gửi idToken + profile info) để lưu/cập nhật thông tin user (không xác thực đăng nhập).
- [x] Người dùng chọn template AI style, chọn ảnh từ thiết bị.
- [x] App gửi request tới backend, backend xác thực, truy vấn template, encode ảnh, gọi Gemini API, nhận kết quả, lưu file processed.
- [x] App nhận URL ảnh kết quả, hiển thị cho người dùng, cho phép tải về/chia sẻ.
- [x] Quản trị viên có thể thêm/sửa template AI, nâng cấp backend mà không ảnh hưởng tới app.

## User Experience Goals
- [x] Đăng nhập nhanh, bảo mật, hỗ trợ Google/Apple (không cần backend login, xác thực 100% qua Firebase Auth).
- [x] Sau khi đăng nhập, profile user được lưu/cập nhật tự động qua API `/v1/users/register` (không cần thao tác thủ công).
- [x] UI/UX hiện đại, trực quan, thao tác tối giản.
- [x] Xử lý ảnh AI nhanh, kết quả chất lượng cao, phản hồi rõ ràng.
- [x] Dễ mở rộng, bảo trì, tích hợp thêm AI model mới hoặc tính năng mới mà không ảnh hưởng tới user.
