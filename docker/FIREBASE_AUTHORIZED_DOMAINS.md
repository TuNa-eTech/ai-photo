# Firebase Authorized Domains Configuration

## Lỗi: `auth/unauthorized-domain`

Lỗi này xảy ra khi domain của ứng dụng web-cms không được thêm vào danh sách **Authorized domains** trong Firebase Console.

## Cách sửa:

### 1. Truy cập Firebase Console

1. Đi tới: https://console.firebase.google.com/
2. Chọn project: **imageai-41077**
3. Vào **Authentication** → **Settings** → **Authorized domains**

### 2. Thêm các domains cần thiết

Thêm các domains sau vào danh sách:

#### Development (Local):
- `localhost`
- `127.0.0.1` (nếu cần)

#### Docker (Production-like):
- `localhost:5173` (nếu Firebase hỗ trợ port trong domain)
- Hoặc chỉ cần `localhost` (Firebase thường tự động cho phép localhost với mọi port)

#### Production (khi deploy):
- `yourdomain.com`
- `www.yourdomain.com`
- `yourdomain.vercel.app` (nếu dùng Vercel)
- `yourdomain.netlify.app` (nếu dùng Netlify)

### 3. Lưu ý:

- Firebase **tự động cho phép** `localhost` và `127.0.0.1` cho development
- Nếu vẫn gặp lỗi với `localhost:5173`, có thể do:
  - Firebase chưa nhận diện được domain
  - Cần clear cache và rebuild
  - Hoặc thử truy cập qua `http://127.0.0.1:5173` thay vì `localhost`

### 4. Kiểm tra lại:

Sau khi thêm domain, rebuild và test lại:

```bash
cd docker
docker-compose build web-cms
docker-compose up web-cms
```

Truy cập: `http://localhost:5173` và thử login.

## Troubleshooting

### Vẫn gặp lỗi sau khi thêm domain?

1. **Clear browser cache** và cookies
2. **Rebuild container**: `docker-compose build --no-cache web-cms`
3. **Kiểm tra Firebase config** trong `.env` có đúng không
4. **Kiểm tra console log** để xem domain nào đang được sử dụng

### Development workaround:

Nếu cần test nhanh, có thể tạm thời enable DevAuth:

```env
# Trong docker/.env
VITE_DEV_AUTH=1
VITE_DEV_AUTH_TOKEN=dev
```

Sau đó rebuild: `docker-compose build web-cms`

