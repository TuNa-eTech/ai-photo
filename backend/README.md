# ImageAIWraper Backend

Go backend cho hệ thống AI Image Stylist: cung cấp REST API bảo mật, quản lý template, assets, và tích hợp với Postgres.

## Tính năng chính
- REST API chuẩn hóa (envelope response pattern)
- Quản lý Template, Asset, Taxonomy (CRUD, publish/unpublish)
- Xác thực qua Firebase Auth (Google/Apple)
- Lưu trữ file asset (local hoặc Docker volume)
- Tích hợp Postgres, migrate tự động
- OpenAPI 3.1 spec: `swagger/openapi.yaml`

## Yêu cầu hệ thống
- Go 1.21+
- Docker & Docker Compose (khuyến nghị)
- Postgres 14+
- (Dev) Firebase project & file cấu hình `.env.local`

## Cài đặt & chạy local

### 1. Clone repo & cài Go module
```bash
git clone https://github.com/TuNa-eTech/ai-photo.git
cd ai-photo/backend
go mod download
```

### 2. Cấu hình môi trường
- Copy file mẫu:
  ```bash
  cp .env.example .env.local
  ```
- Sửa các biến kết nối DB, Firebase, ASSETS_DIR nếu cần.

### 3. Chạy Postgres & backend bằng Docker Compose
```bash
cd ../docker
docker-compose up -d
```
- Backend sẽ chạy ở `http://localhost:8080`
- Postgres mặc định port 5432

### 4. Chạy backend thủ công (không Docker)
```bash
cd backend
go run main.go
```

## Migrate database
```bash
cd backend
make migrate-up
```
- Hoặc dùng lệnh trong `Makefile` (xem chi tiết trong file)

## Chạy kiểm thử
- Chạy toàn bộ unit & integration test:
  ```bash
  cd backend
  go test ./...
  ```
- Kiểm tra coverage:
  ```bash
  go test -cover ./...
  ```

## Tài liệu API
- OpenAPI spec: `swagger/openapi.yaml`
- Tham khảo chi tiết endpoint, schema, ví dụ response.

## Cấu trúc thư mục chính
- `cmd/`         : entrypoint (api, seed-templates)
- `internal/`    : logic core (api, database, storage, image, models)
- `assets/`      : lưu file upload (gắn Docker volume)
- `migrations/`  : file migrate DB
- `build/`       : build output (nếu có)
- `test/`        : test/mocks (nếu có)

## Lưu ý bảo mật & vận hành
- Không commit file `.env.local` chứa secret lên git.
- Đảm bảo CORS đúng cho web admin dev/prod.
- Sử dụng Firebase Admin để xác thực token ở môi trường production.
- File asset nên lưu S3/CDN ở production (ASSETS_BASE_URL).

## Đóng góp & phát triển
- Theo dõi tài liệu `.documents/`, `.memory-bank/` để nắm quy trình, kiến trúc, API.
- Mọi thay đổi lớn cần có implementation plan và test đi kèm.

---

**Liên hệ:**  
- [Tu-eTech Team](mailto:anhtu.it.se@gmail.com)
