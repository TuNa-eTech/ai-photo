# Fix: iOS Simulator Cannot Load Images from Localhost

## 🐛 Problem

iOS Simulator shows placeholder images instead of real thumbnails because:
- `localhost:8080` in Simulator points to the Simulator itself, NOT your Mac
- Backend is running on your Mac at `localhost:8080`
- Simulator cannot reach it

## ✅ Solution

### Step 1: Find Your Mac's IP Address

Open Terminal and run:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

Or simpler:

```bash
ipconfig getifaddr en0
```

Example output: `192.168.1.123`

### Step 2: Update iOS App Config

**File:** `AIPhotoApp/AIPhotoApp/Utilities/Constants/AppConfig.swift`

Change line 19:

```swift
// FROM:
private static let baseURLString = "http://localhost:8080"

// TO (use your actual IP):
private static let baseURLString = "http://192.168.1.123:8080"
```

### Step 3: Update Backend Environment Variable

**File:** `server/.env` (create if doesn't exist)

Add or update:

```bash
API_BASE_URL=http://192.168.1.123:8080
```

This makes backend return correct URLs in `thumbnail_url` field.

### Step 4: Restart Backend

```bash
cd server
yarn start:dev
```

Or if using Docker:

```bash
cd docker
docker-compose down
docker-compose up
```

### Step 5: Restart iOS App

1. Clean build: ⇧⌘K (Shift + Command + K)
2. Run app
3. Check Xcode console for logs:

```
📦 DTO: Minimalist Modern Art
   - thumbnailURL: http://192.168.1.123:8080/public/thumbnails/...
   
🖼️ Loading image: http://192.168.1.123:8080/public/thumbnails/...
```

## ✅ Verify It Works

### Test 1: Browser on Simulator

Open Safari on iOS Simulator and navigate to:
```
http://YOUR_IP:8080/public/thumbnails/minimalist-modern-art-thumbnail-1761475409064.jpeg
```

Should see the image.

### Test 2: Terminal

```bash
curl -I http://YOUR_IP:8080/public/thumbnails/minimalist-modern-art-thumbnail-1761475409064.jpeg
```

Should return `HTTP/1.1 200 OK`.

### Test 3: App

Images should now load in the app!

## 🔧 Alternative Solutions

### Option A: Use ngrok (temporary testing)

```bash
# Install
brew install ngrok

# Expose backend
ngrok http 8080

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update AppConfig.swift with ngrok URL
```

**Pros:** Works everywhere, HTTPS  
**Cons:** Temporary URL, expires after session

### Option B: Run on Physical Device

If you have a physical iPhone/iPad:
1. Connect via USB
2. Build to device
3. `localhost:8080` will work via USB connection

## 🚨 Troubleshooting

### Images still don't load?

**Check 1:** Firewall
```bash
# Temporarily disable macOS firewall
System Settings → Network → Firewall → Off
```

**Check 2:** Backend listening on all interfaces

In `server/src/main.ts`:
```typescript
await app.listen(8080, '0.0.0.0'); // NOT just 'localhost'
```

**Check 3:** Both Mac and Simulator on same network

If using WiFi, ensure Mac is connected to WiFi (not just Ethernet).

**Check 4:** Check debug logs

Xcode console should show:
- ✅ `🖼️ Loading image: http://YOUR_IP:...`
- ❌ If shows `Failed: ...` → Network issue
- ❌ If shows `No URL` → Backend not returning thumbnail_url

### Still having issues?

Check API response directly:

```bash
# Get a valid Firebase token first (from app logs)
TOKEN="your_firebase_token"

# Test API
curl -H "Authorization: Bearer $TOKEN" \
  "http://YOUR_IP:8080/v1/templates/trending?limit=1"
```

Verify `thumbnail_url` contains your IP address, not `localhost`.

## 📝 Production Notes

For production:
- Use proper domain name (e.g., `https://api.yourdomain.com`)
- Configure CORS properly
- Use HTTPS with valid SSL certificate
- Store `API_BASE_URL` in environment variables, not hardcoded

## 🎯 Quick Checklist

- [ ] Found Mac IP address
- [ ] Updated `AppConfig.swift` with Mac IP
- [ ] Updated `server/.env` with `API_BASE_URL`
- [ ] Restarted backend server
- [ ] Clean build iOS app (⇧⌘K)
- [ ] Verified API returns correct URLs with IP
- [ ] Images load in app! 🎉


