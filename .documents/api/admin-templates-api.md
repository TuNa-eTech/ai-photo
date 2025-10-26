# Admin Templates API

## Overview

Full CRUD API for template management with file upload support.

**Base URL**: `/v1/admin/templates`

**Authentication**: Required (Bearer token via Firebase or DevAuth)

**Related Endpoints**:
- Public Templates API: `GET /v1/templates` (documented in OpenAPI spec)
  - Returns only `published` + `public` templates
  - Security filters applied server-side
  - Supports query params: `limit`, `offset`, `q`, `tags`, `sort`

## Endpoints

### List Templates

```http
GET /v1/admin/templates
```

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "anime-portrait-style",
      "name": "Anime Portrait Style",
      "description": "Transform photos into anime-style portraits",
      "prompt": "Transform this photo into a beautiful anime-style portrait with vibrant colors...",
      "negative_prompt": "realistic photo, 3D render, low quality...",
      "model_provider": "gemini",
      "model_name": "gemini-1.5-pro",
      "status": "published",
      "visibility": "public",
      "thumbnailUrl": "http://localhost:8080/public/thumbnails/anime-portrait-thumbnail-1761451580086.jpg",
      "publishedAt": "2025-10-26T10:00:00.000Z",
      "usageCount": 1250,
      "tags": ["anime", "portrait", "art"],
      "createdAt": "2025-10-25T10:00:00.000Z",
      "updatedAt": "2025-10-26T10:00:00.000Z"
    }
  ]
}
```

### Get Template by Slug

```http
GET /v1/admin/templates/{slug}
```

**Parameters**:
- `slug` (string, required): Template slug

**Response**: Same as single template object above

**Errors**:
- `404`: Template not found

### Create Template

```http
POST /v1/admin/templates
```

**Request Body**:
```json
{
  "slug": "my-template",
  "name": "My Template",
  "description": "Optional description",
  "prompt": "Transform this photo into...",
  "negativePrompt": "blurry, low quality...",
  "modelProvider": "gemini",
  "modelName": "gemini-1.5-pro",
  "status": "draft",
  "visibility": "public",
  "tags": ["tag1", "tag2"]
}
```

**Validation**:
- `slug`: Required, lowercase alphanumeric with hyphens, unique
- `name`: Required, non-empty string
- `prompt`: Optional, AI prompt template for image generation
- `negativePrompt`: Optional, what to avoid in generated images
- `modelProvider`: Optional, AI provider (default: gemini)
- `modelName`: Optional, specific model name/version (default: gemini-1.5-pro)
- `status`: Optional, enum: draft | published | archived (default: draft)
- `visibility`: Optional, enum: public | private (default: public)
- `tags`: Optional, array of strings

**Response**: Created template object

**Errors**:
- `400`: Validation error (invalid slug format, duplicate slug)

### Update Template

```http
PUT /v1/admin/templates/{slug}
```

**Request Body**: Same as create (all fields optional except constraints)

**Note**: Cannot change `slug` field

**Response**: Updated template object

**Errors**:
- `404`: Template not found
- `400`: Validation error

### Delete Template

```http
DELETE /v1/admin/templates/{slug}
```

**Response**: `204 No Content`

**Side Effects**:
- Deletes template record from database
- Deletes associated thumbnail file from disk

**Errors**:
- `404`: Template not found

### Publish Template

```http
POST /v1/admin/templates/{slug}/publish
```

**Validation**:
- Template must have `thumbnailUrl` set

**Response**: Updated template object with `status: "published"` and `publishedAt` set

**Errors**:
- `404`: Template not found
- `400`: Cannot publish without thumbnail

### Unpublish Template

```http
POST /v1/admin/templates/{slug}/unpublish
```

**Response**: Updated template object with `status: "draft"`

### Upload Asset

```http
POST /v1/admin/templates/{slug}/assets
```

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `kind` (string): Asset type, currently only "thumbnail"
- `file` (file): Image file

**File Validation**:
- **Type**: image/jpeg, image/jpg, image/png, image/webp, image/gif
- **Size**: Max 5MB

**Response**:
```json
{
  "kind": "thumbnail",
  "url": "http://localhost:8080/public/thumbnails/my-template-thumbnail-1761451580086.jpg",
  "uploaded_at": "2025-10-26T10:00:00.000Z"
}
```

**Side Effects**:
- Saves file to `server/public/thumbnails/`
- Deletes old thumbnail if exists
- Updates template `thumbnailUrl` in database

**Errors**:
- `404`: Template not found
- `400`: Invalid file type or size
- `400`: Missing file or kind field

## Data Types

### Template Status

```typescript
enum TemplateStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived'
}
```

### Template Visibility

```typescript
enum TemplateVisibility {
  public = 'public',
  private = 'private'
}
```

### Asset Kind

```typescript
enum AssetKind {
  thumbnail = 'thumbnail'
  // Future: preview, cover, banner
}
```

## Error Responses

All errors follow envelope format:

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "timestamp": "2025-10-26T10:00:00.000Z",
    "path": "/v1/admin/templates"
  }
}
```

## Examples

### Create and Upload Flow

```bash
# 1. Create template
curl -X POST http://localhost:8080/v1/admin/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "my-template",
    "name": "My Template",
    "description": "Test template"
  }'

# 2. Upload thumbnail
curl -X POST http://localhost:8080/v1/admin/templates/my-template/assets \
  -H "Authorization: Bearer $TOKEN" \
  -F "kind=thumbnail" \
  -F "file=@/path/to/image.jpg"

# 3. Publish
curl -X POST http://localhost:8080/v1/admin/templates/my-template/publish \
  -H "Authorization: Bearer $TOKEN"
```

### Update with New Thumbnail

```bash
# Upload new thumbnail (automatically deletes old one)
curl -X POST http://localhost:8080/v1/admin/templates/my-template/assets \
  -H "Authorization: Bearer $TOKEN" \
  -F "kind=thumbnail" \
  -F "file=@/path/to/new-image.jpg"
```

## Implementation Files

- Controller: `server/src/templates/templates-admin.controller.ts`
- Service: `server/src/templates/templates.service.ts`
- DTOs: `server/src/templates/dto/`
- Schema: `server/prisma/schema.prisma`

