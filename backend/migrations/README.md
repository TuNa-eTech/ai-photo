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
