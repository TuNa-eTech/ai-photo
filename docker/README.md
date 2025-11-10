# Docker Compose Setup

## Deployment Checklist

Trước khi deploy, đảm bảo đã hoàn thành các bước sau:

- [ ] File `firebase-adminsdk.json` đã được đặt trong thư mục `server/`
- [ ] File `.env` đã được tạo và cấu hình đúng
- [ ] `DEV_AUTH_ENABLED=0` nếu dùng Firebase Auth (hoặc `=1` nếu dùng DevAuth)
- [ ] Firebase domains đã được thêm vào Firebase Console (nếu dùng Firebase)
- [ ] Production domains đã được thêm vào `CORS_ALLOWED_ORIGINS`
- [ ] Đã build containers: `docker-compose build`
- [ ] Đã chạy migrations: `docker-compose exec server npx prisma migrate deploy`
- [ ] Đã kiểm tra logs: `docker-compose logs server`

## Quick Start

1. **Chuẩn bị Firebase credentials (nếu dùng Firebase Auth):**
   ```bash
   # Đặt file firebase-adminsdk.json vào thư mục server/
   # File này sẽ được copy vào Docker image khi build
   ```

2. **Tạo file `.env` từ template:**
   ```bash
   cd docker
   cp .env.example .env
   ```

3. **Chỉnh sửa file `.env` với các giá trị của bạn:**
   - Cấu hình `DEV_AUTH_ENABLED` (0 = Firebase, 1 = DevAuth)
   - Thêm production domains vào `CORS_ALLOWED_ORIGINS` nếu cần
   - Cấu hình Firebase cho web-cms nếu cần

4. **Build và khởi động services:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

5. **Chạy database migrations (bắt buộc):**
   ```bash
   docker-compose exec server npx prisma migrate deploy
   ```

6. **Kiểm tra services:**
   ```bash
   docker-compose ps
   docker-compose logs server
   ```

## Environment Variables

Docker Compose sẽ tự động load các biến môi trường từ file `.env` trong thư mục `docker/`.

### Cách hoạt động:

1. **File `.env`** (không commit vào git) - chứa các giá trị thực tế
2. **docker-compose.yml** - sử dụng syntax `${VAR:-default}` để:
   - Load giá trị từ file `.env` nếu có
   - Sử dụng giá trị mặc định nếu không có trong `.env`

### Tạo file `.env`:

Tạo file `.env` trong thư mục `docker/` với nội dung:

```env
# ============================================
# Server Configuration
# ============================================
PORT=8080
NODE_ENV=production

# CORS allowed origins (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:4173,http://localhost:4174

# Database connection (inside Docker network, use service name 'db')
DATABASE_URL=postgresql://imageai:imageai_pass@db:5432/imageai_db?schema=public

# DevAuth Configuration (for local development only)
# Set to "1" to enable DevAuth, "0" to use Firebase Auth
DEV_AUTH_ENABLED=0
DEV_AUTH_TOKEN=dev

# Firebase Admin SDK (required when DEV_AUTH_ENABLED=0)
# Option 1: Use firebase-adminsdk.json file (recommended)
# - Place firebase-adminsdk.json in server/ directory
# - File will be copied into Docker image during build
# - No need to set environment variables below

# Option 2: Use environment variables (alternative)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ============================================
# Database Configuration
# ============================================
POSTGRES_USER=imageai
POSTGRES_PASSWORD=imageai_pass
POSTGRES_DB=imageai_db

# ============================================
# Web-CMS Configuration
# ============================================
VITE_API_BASE_URL=http://localhost:8080

# DevAuth Configuration (for local development)
# Set to "1" to enable DevAuth, "0" to use Firebase Auth
VITE_DEV_AUTH=0
VITE_DEV_AUTH_TOKEN=dev

# Firebase Configuration (Production)
# Required when VITE_DEV_AUTH=0
VITE_FIREBASE_API_KEY=AIzaSyDtZOusqBU-cIppOUjuyf4CBN8XC7x_j3M
VITE_FIREBASE_AUTH_DOMAIN=imageai-41077.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=imageai-41077
VITE_FIREBASE_STORAGE_BUCKET=imageai-41077.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=507160530687
VITE_FIREBASE_APP_ID=1:507160530687:web:410d81f0bf1b78cae3c6ca

# ============================================
# Landing Page Configuration
# ============================================
# VITE_API_BASE_URL is shared with web-cms above

# ============================================
# PgAdmin Configuration
# ============================================
PGADMIN_DEFAULT_EMAIL=admin@gmail.com
PGADMIN_DEFAULT_PASSWORD=admin123
```

## Services

Tất cả services sử dụng Dockerfile để build và chạy:

```bash
docker-compose up -d
```

Services:
- **Server**: http://localhost:8080 (NestJS API)
- **Web-CMS**: http://localhost:5173 (Vite build, serve với Node.js)
- **Landing-Page**: http://localhost:5174 (Vite build, serve với Node.js)
- **PgAdmin**: http://localhost:5050 (Database management)
- **PostgreSQL**: localhost:55432

**Lưu ý**: 
- Tất cả services đều được build từ Dockerfile
- Frontend services (web-cms, landing-page) được build thành static files và serve với `serve` package
- Server sử dụng multi-stage build để tối ưu image size

## Environment Variables Priority

1. **File `.env`** trong thư mục `docker/` (highest priority)
2. **Giá trị mặc định** trong `docker-compose.yml` (fallback)

## Notes

- File `.env` không được commit vào git (đã có trong `.gitignore`)
- Nếu không có file `.env`, docker-compose sẽ sử dụng các giá trị mặc định
- Server cũng có thể load từ `.env.local` hoặc `.env` trong thư mục `server/` (theo cấu hình NestJS ConfigModule)
- Trong Docker, environment variables từ `docker-compose.yml` sẽ override các giá trị từ file `.env` trong container

## Troubleshooting

### Server không load environment variables

- Kiểm tra file `.env` có tồn tại trong thư mục `docker/`
- Kiểm tra syntax của file `.env` (không có spaces xung quanh `=`)
- Xem logs: `docker-compose logs server`

### Database connection error

- Đảm bảo `DATABASE_URL` trong `.env` sử dụng service name `db` (không phải `localhost`)
- Format: `postgresql://user:password@db:5432/database?schema=public`
- Kiểm tra database container đang chạy: `docker-compose ps db`

### Firebase Authentication Setup

**Cấu hình Firebase Admin SDK:**

1. **Chuẩn bị file credentials:**
   - Đặt file `firebase-adminsdk.json` trong thư mục `server/`
   - File này sẽ được tự động copy vào Docker image khi build
   - File này **KHÔNG** được commit vào git (đã có trong `.gitignore`)

2. **Cấu hình trong `.env`:**
   ```env
   DEV_AUTH_ENABLED=0  # Sử dụng Firebase Auth
   ```

3. **Rebuild server container:**
   ```bash
   docker-compose build server
   docker-compose up -d server
   ```

4. **Kiểm tra Firebase Admin SDK:**
   - Xem logs: `docker-compose logs server | grep Firebase`
   - File sẽ được load từ `/app/firebase-adminsdk.json` trong container

**Lưu ý**: 
- Nếu `DEV_AUTH_ENABLED=1`, server sẽ sử dụng DevAuth (không cần Firebase)
- Nếu `DEV_AUTH_ENABLED=0`, server sẽ sử dụng Firebase Auth (cần file `firebase-adminsdk.json`)

### User Registration Required

**Quan trọng**: Sau khi database được tạo mới, user cần được đăng ký trước khi sử dụng các API.

**Workflow:**
1. User login với Firebase → nhận Firebase token
2. Gọi `POST /v1/users/register` với Firebase token:
   ```bash
   curl -X POST http://localhost:8080/v1/users/register \
     -H "Authorization: Bearer <firebase_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "User Name",
       "email": "user@example.com"
     }'
   ```
3. Sau đó mới có thể sử dụng các API khác như:
   - `GET /v1/credits/transactions`
   - `GET /v1/credits/balance`
   - `GET /v1/users/me`
   - etc.

**Lỗi thường gặp:**
- `404 user_not_found`: User chưa được đăng ký → Cần gọi `/v1/users/register` trước

### Web-CMS Firebase Configuration

**Cấu hình Firebase cho web-cms:**

1. **Thêm Firebase domains vào Firebase Console:**
   - Truy cập: https://console.firebase.google.com/project/imageai-41077/authentication/settings
   - Vào tab "Authorized domains"
   - Thêm các domains: `localhost`, `127.0.0.1`, và production domains

2. **Cấu hình trong `.env`:**
   ```env
   VITE_DEV_AUTH=0  # Sử dụng Firebase Auth
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   # ... các biến Firebase khác
   ```

3. **Rebuild web-cms container:**
   ```bash
   docker-compose build web-cms
   docker-compose up -d web-cms
   ```

**Lưu ý**: 
- Firebase configuration được pass vào container qua build arguments
- Các biến `VITE_*` được embed vào code khi build (không thể thay đổi runtime)
- Nếu thay đổi Firebase config, cần rebuild container

### Database Migrations

**Quan trọng**: Sau khi tạo database mới hoặc khi có migration mới, **bắt buộc** phải chạy Prisma migrations:

```bash
cd docker
docker-compose exec server npx prisma migrate deploy
```

**Khi nào cần chạy migrations:**
- Sau khi chạy `docker-compose down -v` (xóa database volume)
- Sau khi tạo database mới
- Khi có migration mới trong `server/prisma/migrations/`
- Sau khi rebuild server container

**Lưu ý**: 
- Dockerfile đã được cấu hình để copy thư mục `prisma` vào container, nên có thể chạy migration trực tiếp trong container
- Nếu không chạy migrations, các API sẽ báo lỗi "table does not exist"

**Kiểm tra migration status:**
```bash
docker-compose exec server npx prisma migrate status
```

**Kiểm tra bảng đã được tạo:**
```bash
docker-compose exec db psql -U imageai -d imageai_db -c "\dt"
```

**⚠️ Cảnh báo**: 
- `docker-compose down -v` sẽ **xóa toàn bộ dữ liệu** trong database
- Chỉ dùng khi muốn reset database hoàn toàn
- Nếu muốn giữ dữ liệu, chỉ dùng `docker-compose down` (không có `-v`)

-------------------------- Hướng dẫn deploy bằng Docker Context -----------------------
Chắc chắn rồi. Đây là hướng dẫn đầy đủ, cụ thể từng bước để bạn deploy bằng **Docker Context** qua SSH, bao gồm cả bước sửa lỗi "passphrase" bạn vừa gặp.

Chúng ta sẽ thực hiện 3 phần cài đặt (chỉ làm 1 lần) và 1 phần deploy (làm mỗi khi cập nhật code).

-----

### 🏗️ Phần 1: Chuẩn bị trên Server (Làm 1 lần)

Bạn cần một user riêng (không phải `root`) để deploy và cấp quyền cho user đó chạy Docker.

1.  Đăng nhập vào server `new_server` của bạn với quyền `root` (hoặc user có `sudo`).

2.  Tạo user `deployer` (bạn có thể đặt tên khác nếu muốn):

    ```bash
    adduser deployer
    ```

    (Hệ thống sẽ yêu cầu bạn tạo mật khẩu cho user này).

3.  Thêm user `deployer` vào nhóm `docker` để cho phép user này chạy các lệnh Docker:

    ```bash
    usermod -aG docker deployer
    ```

4.  **Quan trọng:** Đăng xuất (logout) khỏi server và đăng nhập lại với tư cách `deployer` (hoặc khởi động lại server) để quyền `docker` được áp dụng.

-----

### 🔑 Phần 2: Thiết lập SSH Key (Làm 1 lần)

Bây giờ, từ **máy Local**, bạn cần "dạy" server tin tưởng máy local của bạn bằng SSH Key.

1.  Trên **máy Local**, chạy lệnh sau để sao chép "chìa khoá" của bạn lên server:

    ```bash
    ssh-copy-id deployer@new_server
    ```

      * Nó sẽ hỏi bạn mật khẩu của user `deployer` (mật khẩu bạn đã tạo ở Phần 1). Đây là lần duy nhất nó hỏi mật khẩu này.

2.  Kiểm tra để chắc chắn bạn có thể SSH mà không cần mật khẩu (nó có thể vẫn hỏi *passphrase* của key, chúng ta sẽ sửa ở phần sau):

    ```bash
    ssh deployer@new_server
    ```

-----

### 💻 Phần 3: Cấu hình trên máy Local (Làm 1 lần)

Đây là bước quan trọng nhất: "Mở khoá" key của bạn và tạo Docker Context.

1.  **"Mở khoá" Key (Fix lỗi Passphrase):**
    Trên **máy Local**, chạy lệnh `ssh-add` để "nhớ" passphrase của bạn:

    ```bash
    ssh-add ~/.ssh/id_rsa
    ```

      * Nó sẽ hỏi `Enter passphrase for key...`.
      * Hãy **nhập passphrase (mật khẩu của file key)**.
      * Sau khi chạy xong, `ssh-agent` của máy Mac sẽ "nhớ" key này.

2.  **Tạo Docker Context:**
    Xoá context cũ (nếu có) và tạo context mới, trỏ đến user `deployer` của bạn:

    ```bash
    # Xoá context cũ cho chắc
    docker context rm prod_host

    # Tạo context mới
    docker context create prod_host --docker "host=ssh://deployer@new_server"
    ```

3.  **Kiểm tra cuối cùng:**
    Kích hoạt context mới và thử một lệnh Docker.

    ```bash
    # Kích hoạt context
    docker context use prod_host

    # Thử chạy lệnh docker ps (lệnh này sẽ chạy trên SERVER)
    docker ps
    ```

    Nếu lệnh `docker ps` chạy thành công và trả về danh sách container (kể cả là danh sách rỗng) mà **không hỏi bất kỳ mật khẩu hay passphrase nào**, thì bạn đã cài đặt thành công\!

-----

### 🚀 Phần 4: Quy trình Deploy (Mỗi lần cập nhật)

Giờ đây, mỗi khi bạn muốn deploy code mới, quy trình của bạn sẽ vô cùng đơn giản.

1.  Đảm bảo file `docker-compose.yml` của bạn (ở máy local) có cấu hình `build`:

    ```yaml
    version: '3.8'
    services:
      my-app:
        build: .
        image: my-production-app:latest # Đặt tên image để dễ quản lý
        ports:
          - "80:80"
        restart: unless-stopped
      # Thêm các services khác như postgres, redis...
      db:
        image: postgres:15
        # ...
    ```

2.  Từ **máy Local** (trong thư mục dự án), bạn chỉ cần chạy 2 lệnh:

    ```bash
    # 1. Chọn môi trường là server
    docker context use prod_host

    # 2. Deploy (build và khởi chạy)
    docker-compose up -d --build
    ```

**Điều gì sẽ xảy ra?**
Docker sẽ:

  * Build image trên máy local của bạn.
  * Tự động đẩy (push) image đó qua đường hầm SSH an toàn lên server.
  * Khởi chạy (hoặc cập nhật) container trên server.

Chúc mừng\! Bạn đã thiết lập xong luồng deploy hiện đại từ local lên self-host.

**Mẹo nhỏ:** Khi code xong, đừng quên chuyển về môi trường local:

```bash
docker context use default
```