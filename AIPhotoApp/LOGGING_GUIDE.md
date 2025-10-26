# iOS App Logging Guide

## Overview

iOS app có comprehensive logging để track Firebase authentication và API requests.

## Log Levels

### 🔑 Authentication Logs

**Logger:** `[AuthViewModel]`

Khi user sign in với Google/Apple, bạn sẽ thấy:

```
🔑 [AuthViewModel] Firebase token obtained:
   • Length: 1234 chars
   • Prefix: eyJhbGciOiJSUz...
   • Suffix: ...XYZ1234abc

👤 [AuthViewModel] User profile:
   • Name: Nguyen Tu
   • Email: test@gmail.com

📤 [AuthViewModel] Calling registerUser API...
```

**Thành công:**
```
✅ [AuthViewModel] Registration successful
```

**Thất bại:**
```
❌ [AuthViewModel] Registration failed: Invalid or expired token
```

### 🔐 Repository Logs

**Logger:** `[UserRepository]`

Trước khi gửi API request:

```
🔐 [UserRepository] Sending request with token:
   • Length: 1234 chars
   • Prefix: eyJhbGciOiJSUz...
   • Suffix: ...XYZ1234abc
```

### ➡️ Network Logs

**Logger:** `APIClient` (NetworkLogger)

**Request:**
```
➡️ API Request: POST http://localhost:8080/v1/users/register
   Headers:
   • Content-Type: application/json
   • Accept: application/json
   • Authorization: Bearer eyJhbGciOiJSUz...XYZ1234abc (length: 1234)
   Body (JSON):
{
  "name": "Nguyen Tu",
  "email": "test@gmail.com",
  "avatar_url": "https://..."
}
```

**Response (Success):**
```
⬅️ API Response: 201 POST http://localhost:8080/v1/users/register (45.3 ms)
   Response (JSON):
{
  "success": true,
  "data": {
    "id": "user-id-123",
    "name": "Nguyen Tu",
    "email": "test@gmail.com",
    ...
  }
}
```

**Response (Error):**
```
⬅️ API Response: 401 POST http://localhost:8080/v1/users/register (12.5 ms)
   Response (JSON):
{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "Invalid or expired token"
  }
}
```

## Complete Sign In Flow Log Example

```
🔑 [AuthViewModel] Firebase token obtained:
   • Length: 1234 chars
   • Prefix: eyJhbGciOiJSUz...
   • Suffix: ...XYZ1234abc

👤 [AuthViewModel] User profile:
   • Name: Nguyen Tu
   • Email: tunguyen.dev.test@gmail.com

📤 [AuthViewModel] Calling registerUser API...

🔐 [UserRepository] Sending request with token:
   • Length: 1234 chars
   • Prefix: eyJhbGciOiJSUz...
   • Suffix: ...XYZ1234abc

➡️ API Request: POST http://localhost:8080/v1/users/register
   Headers:
   • Content-Type: application/json
   • Accept: application/json
   • Authorization: Bearer eyJhbGciOiJSUz...XYZ1234abc (length: 1234)
   Body (JSON):
{
  "name": "Nguyen Tu",
  "email": "tunguyen.dev.test@gmail.com",
  "avatar_url": "https://lh3.googleusercontent.com/..."
}

⬅️ API Response: 201 POST http://localhost:8080/v1/users/register (45.3 ms)
   Response (JSON):
{
  "success": true,
  "data": {
    "id": "325e12e1-95e4-47ac-89d1-3f6daacd2d4e",
    "name": "Nguyen Tu",
    "email": "tunguyen.dev.test@gmail.com",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "created_at": "2025-10-26T10:59:22.560Z",
    "updated_at": "2025-10-26T10:59:22.560Z"
  }
}

✅ [AuthViewModel] Registration successful
```

## Token Security

### Safe Logging ✅

Logs chỉ hiển thị:
- **Prefix:** First 15 characters
- **Suffix:** Last 10 characters
- **Length:** Total character count

**Example:**
```
eyJhbGciOiJSUz...XYZ1234abc (length: 1234)
```

### Never Logged ❌

- Full token content
- Private keys
- Passwords
- API secrets

## Debugging Tips

### 1. Verify Token Is Sent

Check logs for:
```
🔐 [UserRepository] Sending request with token:
   • Length: 1234 chars
```

If token length is 0 or very short → Firebase token not obtained!

### 2. Verify Token Format

Check Authorization header:
```
• Authorization: Bearer eyJhbGciOiJSUz...XYZ1234abc (length: 1234)
```

Should start with `eyJ` (JWT format) and be 1000+ chars.

### 3. Compare Token on Backend

**iOS Log:**
```
• Prefix: eyJhbGciOiJSUz...
• Suffix: ...XYZ1234abc
```

**Backend Log:**
```
[BearerAuthGuard] Firebase Auth: Authenticated user abc123xyz for /v1/users/register
```

If iOS sends token but backend says "Invalid token" → Check:
- Backend `.env.local` has `DEV_AUTH_ENABLED=0`
- Backend `firebase-adminsdk.json` is correct
- Token not expired (Firebase tokens expire after 1 hour)

### 4. Common Issues

**Issue:** Token length is 0
**Solution:** Firebase sign-in failed, check GoogleService-Info.plist

**Issue:** Token format is wrong (doesn't start with `eyJ`)
**Solution:** Not a valid JWT token, check AuthService

**Issue:** Backend says "Invalid token" but token looks correct
**Solution:** 
- Restart backend server
- Check backend is using Firebase Auth (not DevAuth)
- Check firebase-adminsdk.json project matches your Firebase project

## Enable/Disable Logging

### Development (Default)

Logging is automatically enabled in DEBUG builds.

### Production

Logging is automatically disabled in RELEASE builds.

### Manual Control

In `APIClient.swift`:
```swift
// Disable logging
APIClient.logger.enabled = false

// Enable logging
APIClient.logger.enabled = true
```

## Log Files Location

Logs appear in:
- **Xcode Console:** Run app from Xcode, logs in bottom panel
- **Device Console:** Use Console.app (Mac) → select device
- **Simulator Console:** `xcrun simctl spawn booted log stream --level debug`

## References

- `APIClient.swift` → Network logging with token safety
- `AuthViewModel.swift` → Authentication flow logging
- `UserRepository.swift` → API request logging
- `NetworkLogger` → Logging configuration

