# Swagger Documentation - Modular Structure

## Overview

This directory contains the OpenAPI 3.0 documentation for the AI Image Stylist API, organized in a modular structure for better maintainability.

## Structure

```
swagger/
├── index.yaml                 # Main OpenAPI spec (entry point)
├── openapi.yaml.old           # Previous monolithic version (backup)
├── paths/                     # API endpoint definitions
│   ├── templates.yaml         # Public templates endpoints
│   ├── templates-admin.yaml   # Admin template management
│   ├── images.yaml            # Image processing (synchronous)
│   ├── users.yaml             # User registration/profile
│   ├── credits.yaml           # Credits & transactions
│   ├── iap.yaml               # IAP products (public)
│   └── categories.yaml        # Categories CRUD
└── schemas/                   # Data models and DTOs
    ├── common.yaml            # Envelope, Error, Pagination
    ├── templates.yaml         # Template schemas
    ├── images.yaml            # Image processing schemas
    ├── users.yaml             # User schemas
    ├── credits.yaml           # Credits & transaction schemas
    └── iap.yaml               # IAP product schemas
```

## Key Changes from Previous Version

### ✅ Fixed Critical Issues

1. **Corrected Image Processing Flow**
   - Old: Documented as async with jobs (NOT implemented)
   - New: Documented as synchronous (matches actual implementation)
   - Removed: `/v1/images/jobs/*` endpoints (non-existent)

2. **Removed Deprecated Models**
   - Removed `ProcessedImage` model (table deleted from DB)
   - Removed `ProcessedImageStatus` enum

3. **Added Missing Endpoints**
   - Admin templates management (10+ endpoints)
   - Categories CRUD
   - User management with anonymous auth

### 📊 Coverage

| Module | Endpoints Documented | Status |
|--------|---------------------|--------|
| Templates (Public) | 3 | ✅ Complete |
| Templates (Admin) | 10 | ✅ Complete |
| Images | 1 | ✅ Fixed (sync) |
| Users | 3 | ✅ Complete |
| Credits | 4 | ✅ Complete |
| IAP | 1 | ✅ Complete |
| Categories | 5 | ✅ Complete |

**Total**: 27+ documented endpoints

## Usage

### View in Swagger Editor

**Online:**
1. Go to https://editor.swagger.io
2. Upload `index.yaml`
3. All referenced files will be loaded

**Local:**
```bash
# Install swagger-ui-watcher
npm install -g swagger-ui-watcher

# Start server
cd swagger
swagger-ui-watcher index.yaml
```

Open http://localhost:8000

### Validate Syntax

```bash
# Install validator
npm install -g @apidevtools/swagger-cli

# Validate
cd swagger
swagger-cli validate index.yaml
```

### Generate Client Code

```bash
# Install generator
npm install -g @openapitools/openapi-generator-cli

# Generate Swift client
openapi-generator-cli generate \
  -i swagger/index.yaml \
  -g swift5 \
  -o clients/swift

# Generate TypeScript client
openapi-generator-cli generate \
  -i swagger/index.yaml \
  -g typescript-axios \
  -o clients/typescript
```

## Maintenance

### Adding New Endpoints

1. **Create path definition** in `paths/[module].yaml`
2. **Create schemas** in `schemas/[module].yaml`
3. **Reference in index.yaml**:
   ```yaml
   paths:
     /v1/new/endpoint:
       $ref: './paths/module.yaml#/~1v1~1new~1endpoint'
   ```

### Editing Existing Endpoints

1. Find the path file in `paths/`
2. Edit the endpoint definition
3. No need to update `index.yaml` (references are stable)

### Adding New Schemas

1. Add schema to relevant file in `schemas/`
2. Reference from index.yaml if used globally:
   ```yaml
   components:
     schemas:
       NewSchema:
         $ref: './schemas/module.yaml#/components/schemas/NewSchema'
   ```

## Authentication

All endpoints (except `/v1/iap/products`) require Firebase authentication:

```http
Authorization: Bearer <firebase_id_token>
```

For local development, use `DEV_AUTH_TOKEN`:

```http
Authorization: Bearer dev
```

## API Base URL

- **Local**: http://localhost:8080
- **Production**: TBD

## Envelope Response Format

All responses use envelope format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-11-25T15:00:00Z"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human readable message"
  },
  "meta": { ... }
}
```

## Related Documentation

- **Architecture**: `.documents/web-cms/architecture.md`
- **Tech Stack**: `.memory-bank/tech.md`
- **Product**: `.memory-bank/product.md`
- **Workflows**: `.documents/workflows/`

## Version History

- **v2.0.0** (2025-11-25): Modular restructure, fix async→sync, add admin endpoints
- **v1.0.1**: Previous monolithic version (see `openapi.yaml.old`)
