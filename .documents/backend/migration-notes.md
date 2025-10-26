# Migration Notes: Go Backend → NestJS

Last updated: 2025-10-25

Documentation of the migration from Go backend to NestJS backend, including changes, decisions, and compatibility notes.

## Migration Overview

**Status:** ✅ Completed (Phase 1 - Public Templates API)
**Date:** October 2025
**Scope:** Replace Go HTTP API with NestJS + Prisma while maintaining API compatibility

## What Changed

### Backend Technology Stack
- **From:** Go 1.25+ with net/http, pgx driver
- **To:** NestJS (Node.js) with Prisma ORM
- **Database:** PostgreSQL 15 (unchanged)
- **Authentication:** Firebase Auth (unchanged)

### File Structure Changes
```
# Before (Go)
backend/
├── cmd/api/main.go
├── internal/
│   ├── api/          # HTTP handlers
│   ├── auth/         # Firebase middleware
│   ├── database/     # pgx queries
│   └── models/       # DTOs
└── migrations/       # SQL migrations

# After (NestJS)
server/
├── src/
│   ├── main.ts       # Bootstrap
│   ├── auth/         # BearerAuthGuard
│   ├── common/       # Envelope, filters
│   ├── prisma/       # Database service
│   └── templates/    # Module
└── prisma/
    ├── schema.prisma # Prisma schema
    └── migrations/   # Prisma migrations
```

### Authentication Implementation

**Go Implementation:**
```go
// internal/auth/auth.go
func (fa *FirebaseAuth) AuthMiddleware(next http.Handler) http.Handler {
    // Extract Bearer token
    // Verify with Firebase Admin SDK
    // Attach user to context
}
```

**NestJS Implementation:**
```typescript
// src/auth/bearer-auth.guard.ts
@Injectable()
export class BearerAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract Bearer token
    // Verify with Firebase Admin SDK or DevAuth
    // Return true/false or throw UnauthorizedException
  }
}
```

### Response Envelope Pattern

**Go Implementation:**
```go
// Manual envelope wrapping in handlers
func OK(w http.ResponseWriter, r *http.Request, data interface{}) {
    envelope := APIResponse{
        Success: true,
        Data:    data,
        Meta:    buildMeta(r),
    }
    // JSON marshal and write
}
```

**NestJS Implementation:**
```typescript
// Global EnvelopeInterceptor
@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any): Envelope<any> => {
        return ok(data); // Auto-wrap in envelope
      }),
    );
  }
}
```

### Database Access

**Go Implementation:**
```go
// internal/database/postgres.go
func (db *PostgresDB) ListTemplates(query TemplateQuery) ([]Template, error) {
    rows, err := db.conn.Query(`
        SELECT id, name, thumbnail_url, published_at, usage_count
        FROM templates 
        WHERE name ILIKE $1
        ORDER BY published_at DESC
        LIMIT $2 OFFSET $3
    `, query.Q, query.Limit, query.Offset)
    // Manual row scanning
}
```

**NestJS Implementation:**
```typescript
// src/templates/templates.service.ts
async listTemplates(query: QueryTemplatesDto) {
  return this.prisma.template.findMany({
    where: query.q ? { name: { contains: query.q } } : {},
    orderBy: this.buildOrderBy(query.sort),
    take: query.limit,
    skip: query.offset,
  });
}
```

## What Stayed the Same

### API Contract
- ✅ Same endpoint paths (`/v1/templates`)
- ✅ Same query parameters (`limit`, `offset`, `q`, `tags`, `sort`)
- ✅ Same envelope response format
- ✅ Same HTTP status codes
- ✅ Same authentication mechanism (Firebase ID tokens)

### Client Compatibility
- ✅ iOS app works without changes
- ✅ Web CMS works without changes
- ✅ Same base URL (`http://localhost:8080`)
- ✅ Same Bearer token authentication

### Database Schema
- ✅ PostgreSQL 15 (unchanged)
- ✅ Same table structure (templates table)
- ✅ Same field names and types
- ✅ Same constraints and indexes

## Development Experience Improvements

### Type Safety
- **Before:** Manual SQL queries with potential runtime errors
- **After:** Type-safe Prisma queries with compile-time validation

### Code Organization
- **Before:** Flat structure with manual dependency injection
- **After:** Modular NestJS structure with decorator-based DI

### Error Handling
- **Before:** Manual envelope wrapping in each handler
- **After:** Global interceptors and filters handle consistently

### Development Tools
- **Before:** Manual migration scripts and SQL files
- **After:** Prisma CLI with schema management and migrations

## Configuration Changes

### Environment Variables
```bash
# Removed (Go-specific)
DB_HOST=db
DB_USER=imageai
DB_PASSWORD=imageai_pass
DB_NAME=imageai_db
FIREBASE_SERVICE_ACCOUNT=/path/to/service-account.json

# Added (NestJS-specific)
DATABASE_URL=postgres://imageai:imageai_pass@db:5432/imageai_db?sslmode=disable
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
DEV_AUTH_TOKEN=dev-secret-token-123
```

### Docker Configuration
```yaml
# docker-compose.yml changes
services:
  # Removed
  backend:
    build: ./backend
    ports: ["8080:8080"]
  
  # Added
  server:
    build: ./server
    ports: ["8080:8080"]
```

## Migration Process

### Phase 1: Foundation (Completed)
1. ✅ Scaffold NestJS application
2. ✅ Implement BearerAuthGuard with Firebase + DevAuth
3. ✅ Add global envelope interceptor and exception filter
4. ✅ Create Prisma schema and service
5. ✅ Implement GET /v1/templates endpoint
6. ✅ Add E2E tests
7. ✅ Update Docker configuration

### Phase 2: Admin Endpoints (Future)
1. 🔄 POST /v1/admin/templates (create)
2. 🔄 PUT /v1/admin/templates/{id} (update)
3. 🔄 DELETE /v1/admin/templates/{id} (delete)
4. 🔄 POST /v1/admin/templates/{id}/assets (upload)
5. 🔄 POST /v1/admin/templates/{id}/publish (publish)

### Phase 3: Extended Features (Future)
1. 🔄 POST /v1/users/register (user registration)
2. 🔄 POST /v1/images/process (image processing)
3. 🔄 Template versions and taxonomy
4. 🔄 Asset management and CDN integration

## Testing Strategy

### E2E Tests
- **Before:** Go test with httptest package
- **After:** Jest + Supertest with NestJS testing utilities

### Test Data
- Maintained `.box-testing/` directory structure
- Updated test scripts to use new DevAuth token format
- Same test scenarios and assertions

### Coverage
- Unit tests for services and guards
- Integration tests for database operations
- E2E tests for complete request flows

## Performance Considerations

### Database Queries
- **Before:** Manual SQL optimization
- **After:** Prisma query optimization with connection pooling

### Memory Usage
- **Before:** Go's efficient memory management
- **After:** Node.js with proper garbage collection tuning

### Startup Time
- **Before:** Fast Go binary startup
- **After:** Node.js startup with dependency loading

## Security Considerations

### Authentication
- Same Firebase token verification
- Same DevAuth pattern for development
- Enhanced with NestJS guard system

### Input Validation
- **Before:** Manual validation in handlers
- **After:** DTOs with class-validator decorators

### Error Information
- Maintained same error response format
- No sensitive information leakage
- Structured error codes for client handling

## Rollback Plan

If rollback is needed:
1. Stop NestJS server container
2. Start Go backend container
3. Revert Docker Compose configuration
4. Update environment variables
5. Test API endpoints

## Lessons Learned

### Benefits
- ✅ Better TypeScript integration
- ✅ Improved developer experience
- ✅ Type-safe database operations
- ✅ Consistent error handling
- ✅ Modular architecture

### Challenges
- ⚠️ Learning curve for NestJS patterns
- ⚠️ Prisma schema management
- ⚠️ Node.js memory usage
- ⚠️ Migration complexity

### Recommendations
- Start with simple endpoints (like templates listing)
- Maintain API compatibility during migration
- Use comprehensive E2E tests
- Document all configuration changes
- Plan for gradual feature migration

## References

- Migration Plan: `.implementation_plan/nest-migration-plan.md`
- NestJS Architecture: `.documents/backend/nestjs-architecture.md`
- API Specification: `swagger/openapi.yaml`
- Test Scripts: `.box-testing/scripts/`


