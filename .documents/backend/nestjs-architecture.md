# NestJS Backend Architecture

Last updated: 2025-10-25

Comprehensive guide to the NestJS backend implementation, covering modules, authentication, database access, and API patterns.

## Overview

The NestJS backend replaces the previous Go implementation while maintaining API compatibility. It provides:
- Type-safe database operations with Prisma ORM
- Firebase authentication via BearerAuthGuard
- Consistent envelope response pattern
- Global error handling and validation
- Development-friendly DevAuth mode

## Project Structure

```
server/
├── src/
│   ├── main.ts                    # Application bootstrap
│   ├── app.module.ts              # Root module
│   ├── auth/
│   │   ├── bearer-auth.guard.ts   # Authentication guard
│   │   └── firebase-admin.ts      # Firebase Admin SDK setup
│   ├── common/
│   │   ├── dto/
│   │   │   └── envelope.dto.ts    # Envelope types and helpers
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Global error handling
│   │   └── interceptors/
│   │       └── envelope.interceptor.ts   # Response wrapping
│   ├── prisma/
│   │   ├── prisma.module.ts       # Prisma module
│   │   └── prisma.service.ts      # Database service
│   └── templates/
│       ├── templates.module.ts     # Templates module
│       ├── templates.controller.ts # HTTP endpoints
│       ├── templates.service.ts    # Business logic
│       └── dto/
│           └── query-templates.dto.ts  # Request validation
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── test/
│   └── e2e/
│       └── templates.e2e-spec.ts  # E2E tests
└── package.json                   # Dependencies
```

## Core Modules

### 1. Authentication Module

**BearerAuthGuard** (`src/auth/bearer-auth.guard.ts`)
- Implements NestJS `CanActivate` interface
- Supports two modes:
  - **DevAuth**: Simple token validation against `DEV_AUTH_TOKEN` env var
  - **Firebase**: Firebase ID token verification via Firebase Admin SDK
- Throws `UnauthorizedException` with envelope error format

**Firebase Admin Setup** (`src/auth/firebase-admin.ts`)
- Singleton Firebase Admin app initialization
- Supports service account credentials or Application Default Credentials
- Environment variables: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

### 2. Common Module

**Envelope Interceptor** (`src/common/interceptors/envelope.interceptor.ts`)
- Global interceptor wrapping all successful responses
- Converts plain data to `{ success: true, data, meta }` format
- Preserves existing envelope responses

**Exception Filter** (`src/common/filters/http-exception.filter.ts`)
- Global exception handler mapping HTTP exceptions to envelope errors
- Maps status codes to error codes:
  - 401 → `unauthorized`
  - 403 → `forbidden`
  - 404 → `not_found`
  - 400 → `bad_request` / `validation_error`
- Includes validation errors in details

**Envelope DTOs** (`src/common/dto/envelope.dto.ts`)
- TypeScript interfaces for envelope responses
- Helper functions: `ok()`, `err()`, `makeMeta()`
- Consistent error structure across the API

### 3. Prisma Module

**Prisma Service** (`src/prisma/prisma.service.ts`)
- Injectable service providing Prisma client
- Handles database connection lifecycle
- Extends PrismaClient with custom methods if needed

**Database Schema** (`prisma/schema.prisma`)
- Current: Basic Template model
- Future: template_versions, tags, template_tags, template_assets
- PostgreSQL-specific configurations

### 4. Templates Module

**Controller** (`src/templates/templates.controller.ts`)
- `GET /v1/templates` endpoint
- Protected by `@UseGuards(BearerAuthGuard)`
- Query parameter validation via DTOs

**Service** (`src/templates/templates.service.ts`)
- Business logic for template operations
- Prisma queries with filtering, sorting, pagination
- Returns raw data (wrapped by EnvelopeInterceptor)

**DTOs** (`src/templates/dto/query-templates.dto.ts`)
- Request validation using class-validator
- Query parameters: limit, offset, q, tags, sort
- Type-safe parameter handling

## API Patterns

### Request Flow

```
Client Request → BearerAuthGuard → Controller → Service → Prisma → Database
                                                      ↓
Client Response ← EnvelopeInterceptor ← Controller ← Service ← Prisma ← Database
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "templates": [...]
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2025-10-25T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "Invalid or expired token",
    "details": {}
  },
  "meta": {
    "requestId": "def456",
    "timestamp": "2025-10-25T10:30:00Z"
  }
}
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgres://imageai:imageai_pass@db:5432/imageai_db?sslmode=disable

# Firebase (Production)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Dev Auth (Development)
DEV_AUTH_ENABLED=1
DEV_AUTH_TOKEN=dev-secret-token-123

# Server
PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### CORS Configuration

Configured in `main.ts`:
- Origins from `CORS_ALLOWED_ORIGINS` env var
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: Authorization, Content-Type
- Credentials: true

## Development Workflow

### Local Development

```bash
# Start database
docker compose up -d db

# Install dependencies
cd server
yarn install

# Run migrations
npx prisma migrate dev

# Start development server
yarn start:dev
```

### Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test with coverage
yarn test:cov
```

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_new_field

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## Migration from Go Backend

### Completed
- ✅ Basic NestJS application structure
- ✅ Firebase authentication via BearerAuthGuard
- ✅ Envelope response pattern
- ✅ Templates listing endpoint
- ✅ Prisma ORM integration
- ✅ Global error handling
- ✅ DevAuth for development

### In Progress / Future
- 🔄 Admin CRUD endpoints
- 🔄 Template versions and assets
- 🔄 Image processing endpoints
- 🔄 User registration endpoint
- 🔄 Comprehensive E2E tests
- 🔄 Admin authorization (claims-based)

### API Compatibility

The NestJS backend maintains full API compatibility with the previous Go implementation:
- Same endpoint paths (`/v1/templates`, etc.)
- Same envelope response format
- Same authentication mechanism (Firebase ID tokens)
- Same query parameters and validation

## Security Considerations

### Authentication
- Firebase ID tokens verified via Firebase Admin SDK
- DevAuth only enabled in development (`DEV_AUTH_ENABLED=1`)
- No session storage - stateless authentication

### Input Validation
- DTOs with class-validator decorators
- Global ValidationPipe with transform and whitelist
- SQL injection prevention via Prisma ORM

### Error Handling
- No sensitive information in error responses
- Structured error codes for client handling
- Request ID correlation for debugging

## Performance Considerations

### Database
- Prisma query optimization
- Proper indexing on filtered/sorted fields
- Connection pooling via Prisma

### Caching
- Future: Redis integration for template caching
- Future: CDN for static assets

### Monitoring
- Request/response logging
- Performance metrics collection
- Error tracking and alerting

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- Migration Plan: `.implementation_plan/nest-migration-plan.md`
- API Specification: `swagger/openapi.yaml`


