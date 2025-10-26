# Fix iOS Simulator Network Access

## Vấn đề
iOS Simulator không thể access `localhost:8080` vì `localhost` trong simulator trỏ về chính simulator, không phải máy host.

## Giải pháp

### Option 1: Dùng IP Address thực (Recommended)

1. **Lấy IP máy Mac:**
```bash
# Mở Terminal và chạy:
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1

# Hoặc đơn giản hơn:
ipconfig getifaddr en0

# Kết quả sẽ giống: 192.168.1.123
```

2. **Update AppConfig.swift:**
```swift
// AIPhotoApp/Utilities/Constants/AppConfig.swift
static let backendBaseURL = URL(string: "http://192.168.1.123:8080")!  // Thay bằng IP của bạn
```

3. **Update backend env:**
```bash
# server/.env hoặc docker-compose.yml
API_BASE_URL=http://192.168.1.123:8080
```

4. **Restart backend và app**

### Option 2: Configure backend để accept connections từ network

**File:** `server/src/main.ts`

Verify có dòng này:
```typescript
await app.listen(8080, '0.0.0.0'); // Listen on all interfaces, not just localhost
```

### Option 3: Dùng ngrok (cho testing)

```bash
# Install ngrok
brew install ngrok

# Expose backend
ngrok http 8080

# Copy https URL và update AppConfig.swift
```

## Testing

Sau khi update IP:

1. Test từ Terminal:
```bash
curl -I http://YOUR_IP:8080/public/thumbnails/minimalist-modern-art-thumbnail-1761475409064.jpeg
```

2. Test từ Safari trên simulator:
```
http://YOUR_IP:8080/public/thumbnails/minimalist-modern-art-thumbnail-1761475409064.jpeg
```

3. Nếu cả 2 đều OK → App sẽ load được images

## Debug Logs

Sau khi restart app, check Xcode console:

```
📦 DTO: Minimalist Modern Art
   - thumbnailURL: http://192.168.1.123:8080/public/thumbnails/...
   - isNew: false, isTrending: true

🖼️ Loading image: http://192.168.1.123:8080/public/thumbnails/...
```

Nếu vẫn thấy "Failed: ..." → check firewall hoặc network settings.

