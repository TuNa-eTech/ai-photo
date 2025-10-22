# Database Migration Guide (Postgres)

## 1. Cài đặt golang-migrate

**MacOS (Homebrew):**
```bash
brew install golang-migrate
```
**Hoặc cài qua Go:**
```bash
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

## 2. Cấu trúc thư mục migration

- Mọi file migration đặt tại: `backend/migrations/`
- File `.up.sql`: lệnh tạo bảng, thêm cột, v.v.
- File `.down.sql`: lệnh rollback (drop bảng, xóa cột, ...)

## 3. Chạy migration

**Từ máy host (khi Postgres đã chạy qua docker-compose):**
```bash
migrate -path backend/migrations -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable" up
```

**Nếu chạy từ trong container backend:**
- Host sẽ là `db` (tên service trong docker-compose):
```bash
migrate -path backend/migrations -database "postgres://imageai:imageai_pass@db:5432/imageai_db?sslmode=disable" up
```

## 4. Tạo migration mới

```bash
migrate create -ext sql -dir backend/migrations -seq <tên_migration>
```

## 5. Lưu ý

- Sau khi migrate thành công, refresh lại pgAdmin sẽ thấy bảng mới.
- Nên commit file migration vào git.
- Không nên sửa file migration đã apply, hãy tạo migration mới nếu cần thay đổi schema.

## 6. Tài liệu

- [golang-migrate/migrate](https://github.com/golang-migrate/migrate)

---

## 7. Schema rationale: users vs user_profiles và kế hoạch hợp nhất

### 7.1 Vì sao tách 2 bảng?
- Tách trách nhiệm:
  - `users`: dữ liệu cốt lõi cho xác thực và nhận diện (email, password_hash, created_at).
  - `user_profiles`: dữ liệu hồ sơ mở rộng, thường xuyên thay đổi (name, avatar_url, timestamps).
- Hiệu năng:
  - Bảng `users` nhỏ gọn, dễ index theo email, tối ưu truy vấn đăng nhập.
- Bảo mật & quyền truy cập:
  - Có thể áp dụng chính sách khác nhau giữa dữ liệu đăng nhập (nhạy cảm) và hồ sơ (ít nhạy cảm hơn).
- Linh hoạt mở rộng:
  - Dễ thêm/sửa các trường hồ sơ mà không ảnh hưởng luồng auth.

Lưu ý hiện trạng: liên kết giữa 2 bảng dùng `email` UNIQUE (không dùng FK `user_id`). Cách này đơn giản nhưng có rủi ro đồng bộ khi đổi email.

### 7.2 Quyết định hợp nhất (migration `0003_unify_users_table.up.sql`)
Để đơn giản hóa và hỗ trợ SSO/OAuth (người dùng có thể không có password nội bộ), hệ thống chuyển sang hợp nhất:
- Cho phép `password_hash` NULL:
  - `ALTER COLUMN password_hash DROP NOT NULL`
- Thêm các cột hồ sơ vào `users` nếu chưa có:
  - `name`, `avatar_url`, `updated_at`
- Gộp dữ liệu từ `user_profiles` sang `users` theo `email` (ON CONFLICT DO UPDATE):
  - Ưu tiên dữ liệu profile mới nhất

Trích đoạn chính:
```sql
ALTER TABLE IF EXISTS users
  ALTER COLUMN password_hash DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

INSERT INTO users (email, name, avatar_url, created_at, updated_at)
SELECT p.email, p.name, NULLIF(p.avatar_url, ''), COALESCE(p.created_at, NOW()), COALESCE(p.updated_at, NOW())
FROM user_profiles p
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
```

### 7.3 Quy trình khuyến nghị khi triển khai hợp nhất
1) Chạy migration `0003_unify_users_table.up.sql` để:
   - Nới lỏng ràng buộc `password_hash`
   - Thêm cột profile vào `users` (nếu thiếu)
   - Merge dữ liệu profile sang `users` theo `email`
2) Xác minh dữ liệu:
   - Đếm số bản ghi `users` trước/sau
   - Kiểm tra ngẫu nhiên một số email có profile để đảm bảo `name`/`avatar_url` đã đồng bộ
3) Sau khi xác nhận, có thể xóa bảng `user_profiles` bằng một migration riêng:
   - Ví dụ: `0004_drop_user_profiles_table.up.sql`
   - Lưu ý rollback: cân nhắc không thể khôi phục nguyên trạng profile nếu đã drop

### 7.4 Ảnh hưởng tới ứng dụng
- API/Auth:
  - Các luồng đăng nhập có thể hoạt động với người dùng SSO (password_hash NULL).
- Truy vấn dữ liệu người dùng:
  - Lấy `name`/`avatar_url` trực tiếp từ `users`, giảm JOIN.
- Bảo trì:
  - Nếu sau này cần mở rộng hồ sơ phức tạp (preferences JSONB, địa chỉ…), có thể cân nhắc tái tách bảng theo nhu cầu.

Ghi chú:
- Nội dung này tuân thủ định hướng documentation-first theo `.clinerules/documentation-driven.md`.
- Nếu cần tài liệu kiến trúc tổng quát, có thể tạo thêm `.documents/db-schema.md` để chuẩn hóa quyết định này ở cấp hệ thống.
