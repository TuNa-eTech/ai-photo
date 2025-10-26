# Environment Setup Guide

## Quick Start

### 1. Copy environment template
```bash
cp .env.example .env.local
```

### 2. Setup Firebase Admin SDK

Place your `firebase-adminsdk.json` file in the server root directory.

**File structure:**
```
server/
├── firebase-adminsdk.json  ← Your Firebase service account key
├── .env.local              ← Your local configuration
├── .env.example            ← Template (committed to git)
└── src/
```

### 3. Configure Database

Default configuration (Docker):
```env
DATABASE_URL="postgresql://imageai:imageai_pass@localhost:55432/imageai_db?schema=public"
```

### 4. Start Development Server

```bash
npm run start:dev
```

## Environment Modes

### Production-like Mode (Recommended)

Use real Firebase Authentication with your iOS/Web app:

**`.env.local`:**
```env
# Production-like mode
DATABASE_URL="postgresql://imageai:imageai_pass@localhost:55432/imageai_db?schema=public"
PORT=8080
CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# DEV_AUTH_ENABLED is NOT set = Firebase Auth enabled
# Uses firebase-adminsdk.json for token verification
NODE_ENV=development
```

**Testing:**
```bash
# Get Firebase token from your iOS app or Web CMS
# Use it in Authorization header
curl -X POST http://localhost:8080/v1/users/register \
  -H "Authorization: Bearer <YOUR_FIREBASE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

### DevAuth Mode (Quick Testing Only)

Bypass Firebase for quick API testing:

**`.env.local`:**
```env
DATABASE_URL="postgresql://imageai:imageai_pass@localhost:55432/imageai_db?schema=public"
PORT=8080

# Enable DevAuth (NEVER use in production!)
DEV_AUTH_ENABLED=1
DEV_AUTH_TOKEN=dev
```

**Testing:**
```bash
# Use simple "dev" token
curl -X POST http://localhost:8080/v1/users/register \
  -H "Authorization: Bearer dev" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

## Firebase Admin SDK Setup

### Priority Order

The server loads Firebase credentials in this order:

1. **`firebase-adminsdk.json` file** (recommended for local dev)
2. **Environment variables** (for production/Docker)
3. **Application Default Credentials** (GOOGLE_APPLICATION_CREDENTIALS)

### Option 1: Using JSON File (Recommended for Local)

Place `firebase-adminsdk.json` in server root:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@your-project.iam.gserviceaccount.com",
  ...
}
```

### Option 2: Using Environment Variables (For Docker/Production)

Add to `.env.local`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Common Configurations

### Local Development with iOS App

```env
# .env.local
DATABASE_URL="postgresql://imageai:imageai_pass@localhost:55432/imageai_db?schema=public"
PORT=8080
CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
NODE_ENV=development

# Uses firebase-adminsdk.json
```

### Local Development with Web CMS

```env
# .env.local
DATABASE_URL="postgresql://imageai:imageai_pass@localhost:55432/imageai_db?schema=public"
PORT=8080
CORS_ALLOWED_ORIGINS="http://localhost:5173"
NODE_ENV=development

# Uses firebase-adminsdk.json
```

### Quick API Testing (No Frontend)

```env
# .env.local
DATABASE_URL="postgresql://imageai:imageai_pass@localhost:55432/imageai_db?schema=public"
PORT=8080
DEV_AUTH_ENABLED=1
DEV_AUTH_TOKEN=dev
```

## Testing Your Setup

### 1. Check Server Started Successfully

```bash
curl http://localhost:8080
# Expected: {"success":true,"data":"Hello World!","meta":{...}}
```

### 2. Test Authentication

**With Firebase (Production-like):**
```bash
# Get token from Firebase Auth
# Use in Authorization header
curl -X POST http://localhost:8080/v1/users/register \
  -H "Authorization: Bearer <FIREBASE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'
```

**With DevAuth:**
```bash
curl -X POST http://localhost:8080/v1/users/register \
  -H "Authorization: Bearer dev" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'
```

### 3. Expected Responses

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Test",
    "email": "test@example.com",
    "avatar_url": null,
    "created_at": "2025-10-26T10:00:00.000Z",
    "updated_at": "2025-10-26T10:00:00.000Z"
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2025-10-26T10:00:00.000Z"
  }
}
```

**Auth Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "Invalid or expired token"
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2025-10-26T10:00:00.000Z"
  }
}
```

## Troubleshooting

### "Failed to load firebase-adminsdk.json"

- Check file exists: `ls -la firebase-adminsdk.json`
- Check file is valid JSON: `cat firebase-adminsdk.json | jq .`
- Check file permissions: `chmod 600 firebase-adminsdk.json`

### "Invalid or expired token" with valid Firebase token

- Check `DEV_AUTH_ENABLED` is not set (or set to 0)
- Verify `firebase-adminsdk.json` project matches your Firebase project
- Check token is not expired (Firebase tokens expire after 1 hour)

### CORS errors from Web CMS

Add Web CMS URL to CORS_ALLOWED_ORIGINS:
```env
CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

## Security Notes

- ✅ `.env.local` is gitignored - safe to store secrets
- ✅ `firebase-adminsdk.json` is gitignored - safe to store
- ✅ `.env.example` is committed - template only, no secrets
- ❌ **NEVER commit `.env.local` or `firebase-adminsdk.json`**
- ❌ **NEVER enable DevAuth in production**

## References

- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- NestJS Config: https://docs.nestjs.com/techniques/configuration
- Prisma: https://www.prisma.io/docs/

