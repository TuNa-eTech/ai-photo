# API Specification (Documentation-Driven)

Last updated: 2025-10-21

Authoritative contract for backend APIs. This document complements and references the canonical OpenAPI file: `swagger/openapi.yaml` (OpenAPI 3.1).

Sources of truth:
- swagger/openapi.yaml
- .documents/project_architecture.md
- .documents/web_admin.md

## Authentication

- All protected endpoints require Firebase ID Token (JWT) in the HTTP header:
  - Authorization: Bearer <idToken>
- 401 is returned when the token is missing/invalid/expired.
- Clients should implement a single refresh-and-retry flow.

## CORS (development)

- Allow origin: http://localhost:5173 (Vite dev server)
- Allowed methods: GET, POST (extend as needed)
- Allowed headers: Authorization, Content-Type
- Do not allow credentials by default for this admin app.

## Envelope Response Pattern

All responses follow the envelope structure:

```json
{
  "success": true,
  "data": { /* typed payload, e.g., TemplatesList */ },
  "error": {
    "code": "string",
    "message": "string",
    "details": { "any": "object" }
  },
  "meta": {
    "requestId": "string",
    "timestamp": "ISO-8601 date-time"
  }
}
```

- success: boolean
- data: present when success=true
- error: present when success=false
- meta: always present; includes requestId and timestamp
- Future: pagination metadata may be added to meta (e.g., total, hasMore, nextOffset)

## Schemas (excerpt)

- Template
  - id: string
  - name: string
  - thumbnail_url?: uri
  - published_at?: date-time (ISO-8601)
  - usage_count?: integer (>= 0)

- TemplatesList
  - templates: Template[]

- ProcessImageSuccess
  - processed_image_url: uri

- Envelope variants (see swagger/openapi.yaml):
  - EnvelopeTemplatesList
  - EnvelopeProcessImageSuccess
  - EnvelopeUserRegisterSuccess
  - EnvelopeError

## Endpoints

### GET /v1/templates

List published templates with advanced filtering/sorting.

Query parameters:
- limit: integer (default: 20, min: 1)
- offset: integer (default: 0, min: 0)
- q: string (search by name/slug, ILIKE)
- tags: string (CSV of tag slugs, e.g., "anime,portrait")
- sort: string enum ["newest", "popular", "name"] (default: "newest")

Authentication:
- Requires Authorization: Bearer <idToken>

200 Response (EnvelopeTemplatesList):
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "anime-style",
        "name": "Phong cách Anime",
        "thumbnail_url": "https://your-storage/templates/anime-style-thumb.jpg",
        "published_at": "2025-10-20T07:30:00Z",
        "usage_count": 120345
      }
    ]
  },
  "meta": {
    "requestId": "8f9a1b2c3d4e5f6a",
    "timestamp": "2025-10-20T07:30:00Z"
  }
}
```

401 Response (EnvelopeError):
```json
{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "Token không hợp lệ hoặc thiếu"
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2025-10-20T07:30:00Z"
  }
}
```

Notes:
- Backend SQL joins `template_assets` where `kind='thumbnail'` to populate `thumbnail_url`.
- Sorting:
  - newest → published_at DESC (fallback to created_at if applicable)
  - popular → usage_count DESC
  - name → name ASC

### POST /v1/users/register

Create/update user profile (profile-only, not login).

Security:
- bearerAuth required

Request body schema: UserRegisterRequest
200 Response: EnvelopeUserRegisterSuccess
Errors: 400 (validation), 401 (auth), 500 (server error)

See swagger/openapi.yaml for exact schemas and examples.

### POST /v1/images/process

Process an image with a selected template.

Security:
- bearerAuth required

Request body schema: ProcessImageRequest
- template_id: string
- image_path: string (path to uploaded source image)

200 Response: EnvelopeProcessImageSuccess
- processed_image_url: string (uri)

Errors:
- 400 invalid input
- 401 unauthorized
- 404 not found (template/image)
- 500 server error

See swagger/openapi.yaml for the canonical definitions and examples.

## Pagination Metadata (Future)

For improved UX in admin and iOS, consider extending meta with:
```json
"meta": {
  "requestId": "string",
  "timestamp": "ISO-8601",
  "total": 123,
  "hasMore": true,
  "nextOffset": 40
}
```

Clients (iOS/Web) should be ready to consume these fields if added in a backward-compatible manner.

## Error Handling Guidance

- On non-2xx HTTP statuses, clients should parse EnvelopeError and display `error.message`.
- For 401, clients perform a single token refresh via Firebase SDK, then retry the request once.
- On repeated failure, surface the error to the user with actionable context.
