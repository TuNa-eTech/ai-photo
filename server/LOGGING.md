# API Logging Guide

## Overview

The server implements comprehensive logging for requests, responses, errors, and authentication events.

## Log Levels

### Development Mode (NODE_ENV=development)
- **error**: Critical errors and exceptions
- **warn**: Warnings (4xx errors, auth failures)
- **log**: General info (requests, responses, initialization)
- **debug**: Detailed debugging info (auth success, token verification)
- **verbose**: Extra detailed info

### Production Mode (NODE_ENV=production)
- **error**: Critical errors only
- **warn**: Warnings
- **log**: General info

## Log Categories

### 1. HTTP Request/Response Logs

**Logger Name:** `HTTP`

**Incoming Request:**
```
[HTTP] → POST /v1/users/register - 127.0.0.1 - Mozilla/5.0...
[HTTP]   Body: {"name":"Test User","email":"test@example.com"}
```

**Successful Response:**
```
[HTTP] ← POST /v1/users/register - 201 - 45ms
```

**Error Response:**
```
[HTTP] ← POST /v1/users/register - 400 - 12ms - ERROR: Validation failed
```

**Features:**
- Logs method, path, IP address, user agent
- Logs request body (with sensitive fields redacted)
- Logs response time and status code
- Separates errors from successful responses

### 2. Authentication Logs

**Logger Name:** `BearerAuthGuard`

**DevAuth Mode:**
```
[BearerAuthGuard] DevAuth: Authenticated as dev-user-uid-123 for /v1/users/register
```

**Firebase Auth Success:**
```
[BearerAuthGuard] Firebase Auth: Authenticated user abc123xyz for /v1/users/register
```

**Auth Failures:**
```
[BearerAuthGuard] Missing or invalid Authorization header for /v1/users/register
[BearerAuthGuard] Invalid DevAuth token for /v1/users/register
[BearerAuthGuard] Firebase token verification failed for /v1/users/register: auth/id-token-expired
```

### 3. Firebase Admin SDK Logs

**Logger Name:** `FirebaseAdmin`

**Initialization Success:**
```
[FirebaseAdmin] Initializing Firebase Admin SDK...
[FirebaseAdmin] Loading Firebase credentials from /path/to/firebase-adminsdk.json
[FirebaseAdmin] Firebase Project ID: imageai-41077
[FirebaseAdmin] ✅ Firebase Admin SDK initialized successfully via JSON file
```

**Initialization from Env Vars:**
```
[FirebaseAdmin] Loading Firebase credentials from environment variables
[FirebaseAdmin] Firebase Project ID: imageai-41077
[FirebaseAdmin] ✅ Firebase Admin SDK initialized successfully via environment variables
```

**Initialization Errors:**
```
[FirebaseAdmin] firebase-adminsdk.json not found at /path/to/file
[FirebaseAdmin] Firebase environment variables not found
[FirebaseAdmin] Failed to initialize Firebase Admin SDK: Error message
```

### 4. Exception/Error Logs

**Logger Name:** `ExceptionFilter`

**Client Errors (4xx):**
```
[ExceptionFilter] POST /v1/users/register - 400 validation_error: Validation failed {"validationErrors":["email must be an email"]}
[ExceptionFilter] POST /v1/users/register - 401 unauthorized: Invalid or expired token {}
```

**Server Errors (5xx):**
```
[ExceptionFilter] POST /v1/users/register - 500 internal_error: Internal Server Error
Error: Database connection failed
    at UsersService.registerUser (users.service.ts:25:11)
    at UsersController.register (users.controller.ts:18:34)
    ...
```

### 5. Bootstrap Logs

**Logger Name:** `Bootstrap`

**Server Startup:**
```
[Bootstrap] 🚀 Server is running on http://localhost:8080
[Bootstrap] 📝 Environment: development
[Bootstrap] 🔐 CORS Origins: http://localhost:5173, http://localhost:3000
[Bootstrap] 🔑 DevAuth: DISABLED (Firebase Auth)
```

## Configuration

### Enable/Disable Logging

Edit `.env.local`:

```env
# Development: Full logging
NODE_ENV=development

# Production: Essential logging only
NODE_ENV=production
```

### Sensitive Data Redaction

The logging interceptor automatically redacts sensitive fields from request bodies:

**Redacted Fields:**
- password
- token
- secret
- apiKey
- private_key
- privateKey

**Example:**
```
Input:  {"email":"test@example.com","password":"secret123"}
Logged: {"email":"test@example.com","password":"***REDACTED***"}
```

## Log Output Examples

### Successful User Registration

```
[HTTP] → POST /v1/users/register - 127.0.0.1 - curl/7.88.1
[HTTP]   Body: {"name":"Test User","email":"test@example.com"}
[BearerAuthGuard] Firebase Auth: Authenticated user abc123xyz for /v1/users/register
[HTTP] ← POST /v1/users/register - 201 - 45ms
```

### Failed Authentication

```
[HTTP] → POST /v1/users/register - 127.0.0.1 - curl/7.88.1
[BearerAuthGuard] Firebase token verification failed for /v1/users/register: auth/id-token-expired
[ExceptionFilter] POST /v1/users/register - 401 unauthorized: Invalid or expired token {}
[HTTP] ← POST /v1/users/register - 401 - 12ms - ERROR: Invalid or expired token
```

### Validation Error

```
[HTTP] → POST /v1/users/register - 127.0.0.1 - curl/7.88.1
[HTTP]   Body: {"name":"Test","email":"invalid-email"}
[BearerAuthGuard] Firebase Auth: Authenticated user abc123xyz for /v1/users/register
[ExceptionFilter] POST /v1/users/register - 400 validation_error: Validation failed {"validationErrors":["email must be an email"]}
[HTTP] ← POST /v1/users/register - 400 - 8ms - ERROR: Validation failed
```

### Server Initialization

```
[NestFactory] Starting Nest application...
[InstanceLoader] PrismaModule dependencies initialized +16ms
[InstanceLoader] ConfigHostModule dependencies initialized +1ms
[InstanceLoader] AppModule dependencies initialized +4ms
[InstanceLoader] ConfigModule dependencies initialized +0ms
[InstanceLoader] UsersModule dependencies initialized +0ms
[InstanceLoader] TemplatesModule dependencies initialized +0ms
[FirebaseAdmin] Initializing Firebase Admin SDK...
[FirebaseAdmin] Loading Firebase credentials from /path/to/firebase-adminsdk.json
[FirebaseAdmin] Firebase Project ID: imageai-41077
[FirebaseAdmin] ✅ Firebase Admin SDK initialized successfully via JSON file
[RoutesResolver] AppController {/}: +2ms
[RouterExplorer] Mapped {/, GET} route +2ms
[RoutesResolver] UsersController {/v1/users}: +0ms
[RouterExplorer] Mapped {/v1/users/register, POST} route +1ms
[RoutesResolver] TemplatesController {/v1/templates}: +0ms
[RouterExplorer] Mapped {/v1/templates, GET} route +0ms
[Bootstrap] 🚀 Server is running on http://localhost:8080
[Bootstrap] 📝 Environment: development
[Bootstrap] 🔐 CORS Origins: http://localhost:5173, http://localhost:3000
[Bootstrap] 🔑 DevAuth: DISABLED (Firebase Auth)
```

## Debugging Tips

### Enable Debug Logs

Set `NODE_ENV=development` in `.env.local` to see debug logs including:
- Firebase UID after successful authentication
- Detailed error messages
- Request body contents

### Filter Logs by Component

Use grep to filter logs by component:

```bash
# Only HTTP logs
npm run start:dev | grep HTTP

# Only Firebase logs
npm run start:dev | grep Firebase

# Only errors
npm run start:dev | grep ERROR
```

### Check Authentication Flow

```bash
curl -X POST http://localhost:8080/v1/users/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'

# Watch logs to see:
# 1. Request received
# 2. Auth verification (success/failure)
# 3. Response sent
```

## Production Considerations

### Log Aggregation

In production, consider using log aggregation services:
- **Datadog**: APM and log management
- **CloudWatch**: AWS native logging
- **Loggly**: Centralized logging
- **Papertrail**: Real-time log tailing

### Log Rotation

For self-hosted production:

```bash
# Using PM2
pm2 start dist/main.js --log-date-format 'YYYY-MM-DD HH:mm:ss' --merge-logs

# Using systemd with journalctl
journalctl -u imageai-server -f
```

### Performance Impact

Logging has minimal performance impact:
- Request logging: ~1-2ms overhead
- Error logging: Only on errors
- Debug logs: Disabled in production

## Security Notes

- ✅ Sensitive fields automatically redacted
- ✅ Stack traces only logged for 5xx errors
- ✅ Firebase tokens never logged
- ✅ IP addresses logged for audit trail
- ❌ Don't log PII (personally identifiable information) beyond what's necessary

## References

- NestJS Logger: https://docs.nestjs.com/techniques/logger
- Winston (advanced logging): https://github.com/winstonjs/winston
- Morgan (HTTP logging): https://github.com/expressjs/morgan

