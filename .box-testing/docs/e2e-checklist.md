# E2E Manual Test Checklist – ImageAIWraper

> Checklist này dùng cho kiểm thử end-to-end giữa app iOS và backend. Tick vào từng bước khi đã kiểm thử thành công. Ghi chú lỗi/edge case nếu phát hiện.

## 1. Đăng nhập & xác thực
- [ ] Đăng nhập bằng Google trên app iOS (Firebase Auth)
- [ ] Đăng nhập bằng Apple trên app iOS (Firebase Auth)
- [ ] Sau đăng nhập, app tự động gọi API `/v1/users/register` (profile được lưu/cập nhật thành công)

## 2. Quản lý template
- [ ] Lấy danh sách template AI từ backend thành công
- [ ] Chọn template bất kỳ, hiển thị thông tin đúng

## 3. Upload & xử lý ảnh AI
- [ ] Chọn ảnh từ thiết bị, upload lên backend thành công
- [ ] Gửi request xử lý ảnh (API `/v1/images/process`) với template đã chọn
- [ ] Nhận kết quả AI (ảnh đã xử lý) và hiển thị đúng trên app
- [ ] Lưu ảnh kết quả về thiết bị thành công

## 4. Xử lý lỗi & edge case
- [ ] Thử upload ảnh lỗi/không hợp lệ, app báo lỗi rõ ràng
- [ ] Gửi request với template không tồn tại, app báo lỗi đúng
- [ ] Token hết hạn/không hợp lệ, app tự logout hoặc báo lỗi xác thực
- [ ] Mất kết nối mạng, app báo lỗi và cho retry

## 5. Khác
- [ ] UI/UX mượt mà, không crash, không lag
- [ ] Kiểm thử trên nhiều thiết bị/simulator khác nhau
- [ ] Ghi chú bug/edge case phát hiện:

---

> Khi hoàn thành, cập nhật trạng thái vào memory bank hoặc báo lại cho team.
