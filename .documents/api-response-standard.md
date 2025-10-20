# API Response Envelope Standard

This document defines the standardized JSON response envelope and related conventions used across the backend.

## Goals
- Consistent, predictable response structure for all endpoints
- Clear success vs error separation
- Built-in metadata for tracing (requestId, timestamp) and pagination
- Easy to document (OpenAPI) and consume (iOS client, other SDKs)

## JSON Envelope

### Success (200/201/…)
```json
{
  "success": true,
  "data": { /* domain payload */ },
  "error": null,
  "meta": {
    "requestId": "08b338f8b7a0…",
    "timestamp": "2025-10-19T12:34:56Z",
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 123,
      "totalPages": 7,
      "nextCursor": "opaque-token-optional"
    }
  }
}
```

### Error (400/401/403/404/409/422/429/500…)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "missing_fields",
    "message": "name and email are required",
    "details": {
      "fields": ["name", "email"]
    }
  },
  "meta": {
    "requestId": "08b338f8b7a0…",
    "timestamp": "2025-10-19T12:34:56Z"
  }
}
```

Notes:
- `requestId`: provided via RequestID middleware. Mirrors/forwards `X-Request-ID` header when provided, otherwise generated.
- `timestamp`: server-side UTC (RFC3339).
- `pagination`: only included for list endpoints.

## HTTP Status ↔ Body Conventions
- 200 OK: `success=true`, `data` present
- 201 Created: `success=true`, created resource returned in `data`
- 204 No Content: rarely used; prefer 200 with empty `data` for envelope consistency
- 400 Bad Request: `success=false`, `error.code="invalid_request"` or `"missing_fields"`
- 401 Unauthorized: `success=false`, `error.code="unauthorized"`
- 403 Forbidden: `success=false`, `error.code="forbidden"`
- 404 Not Found: `success=false`, `error.code="not_found"`
- 409 Conflict: `success=false`, `error.code="conflict"`
- 422 Unprocessable Entity: `success=false` (validation errors)
- 429 Too Many Requests, 500 Internal Server Error: `success=false`

## Go Types and Helpers (implemented)
- File: `backend/internal/api/responder.go`
  - Types:
    - `APIResponse[T any]`
    - `APIError`
    - `Meta`, `Pagination`
  - Writers:
    - `WriteJSON`, `OK`, `Created`, `NoContent`
    - `BadRequest`, `Unauthorized`, `Forbidden`, `NotFound`, `Conflict`, `Unprocessable`, `TooMany`, `ServerError`
  - Meta utilities:
    - `buildMeta` uses requestId + timestamp
    - `WithRequestID` to attach requestId to context

## Request ID Middleware (implemented)
- File: `backend/internal/api/middleware.go`
  - `RequestIDMiddleware`: ensures `X-Request-ID` header exists, writes it back to response, and stores in request context
  - `LoggingMiddleware`: logs method/path with requestId when available
- Wire-up (implemented):
  - File: `backend/cmd/api/main.go`
  - Chain: `RequestIDMiddleware → LoggingMiddleware → mux`

## Refactored Handlers (using envelope)
- File: `backend/internal/api/handlers.go`
  - `ProcessImageHandler` and `RegisterUserHandler` now use `OK/BadRequest/NotFound/Unauthorized/ServerError` helpers

## OpenAPI/Swagger Guidance (to update)
- Add reusable schemas under `components/schemas`:
  - `ApiError`, `Meta`, `Pagination`, and response-specific envelopes e.g. `Envelope_UserRegisterResponse`
- Define standard responses for each endpoint (200, 400, 401, 404, 500) returning the envelope
- Example component:
```yaml
components:
  schemas:
    ApiError:
      type: object
      required: [code, message]
      properties:
        code: { type: string, example: "missing_fields" }
        message: { type: string, example: "name and email are required" }
        details: { type: object, additionalProperties: true }
    Meta:
      type: object
      properties:
        requestId: { type: string }
        timestamp: { type: string, format: date-time }
        pagination:
          $ref: "#/components/schemas/Pagination"
    Pagination:
      type: object
      properties:
        page: { type: integer }
        perPage: { type: integer }
        total: { type: integer }
        totalPages: { type: integer }
        nextCursor: { type: string }
```

## iOS Client Decoding (recommendation)
- Decode an envelope type for generic handling:
```swift
struct Envelope<T: Decodable>: Decodable {
  let success: Bool
  let data: T?
  let error: APIErrorResp?
  let meta: MetaResp?
}
struct APIErrorResp: Decodable {
  let code: String
  let message: String
  let details: [String: AnyDecodable]?
}
struct MetaResp: Decodable {
  let requestId: String?
  let timestamp: String?
  let pagination: PaginationResp?
}
```
- APIClient can decode `Envelope<T>` and check `success` to decide error handling and logging.
- Alternatively, for minimal change, keep decoding `T` directly while gradually migrating calls to the envelope format.

## Testing
- Manual test (example, already validated):
  ```
  curl -s -D - -X POST http://localhost:8080/v1/users/register \
    -H "Authorization: Bearer <idToken>" \
    -H "Content-Type: application/json" \
    --data '{"name":"Full Name","email":"user@example.com","avatar_url":""}'
  ```
- Expected envelope response with `success` and `meta.requestId`.
- Verify persistence by checking DB tables as needed.

## Rollout Notes
- All new/updated endpoints should adopt this envelope.
- Keep middleware in the chain for consistent `X-Request-ID`.
- Update Swagger definitions incrementally across endpoints.
- Add integration tests to assert envelope shape and error codes.
