# Architecture

Authoritative snapshot of the current system architecture, components, and critical paths.

Last updated: 2025-10-23

## System Overview

- Platform components:
  - iOS App (SwiftUI + Observation)
  - Backend API (Go 1.25+, Postgres 15)
  - Web Admin (React + Vite + TypeScript) — IMPLEMENTED
- Cross-cutting:
  - Authentication: Firebase Auth (Google/Apple) → client obtains ID token → Authorization: Bearer {idToken}
  - Envelope response pattern: { success, data?, error?, meta{ requestId, timestamp } }

## High-level Diagram

```mermaid
graph TD
  subgraph Clients
    iOS[iOS App (SwiftUI)]
    Admin[Web Admin (React + Vite)]
  end

  subgraph Auth
    Firebase[Firebase Auth]
  end

  subgraph Backend
    API[(Go API)]
    AssetsFS[/Static /assets/ volume/]
    PG[(Postgres 15)]
  end

  iOS -->|Bearer ID Token| API
  Admin -->|Bearer ID Token| API
  iOS --> Firebase
  Admin --> Firebase
  API --> PG
  API -->|serve static| AssetsFS
```

## Source Code Paths

- iOS
  - Views: `AIPhotoApp/AIPhotoApp/Views/...`
  - ViewModels: `AIPhotoApp/AIPhotoApp/ViewModels/...`
  - Networking: `AIPhotoApp/AIPhotoApp/Utilities/Networking/APIClient.swift`
  - Repositories: `AIPhotoApp/AIPhotoApp/Repositories/...`
  - Models/DTOs: `AIPhotoApp/AIPhotoApp/Models/DTOs/...`

- Backend
  - API handlers/middleware: `backend/internal/api/`
    - `handlers.go`, `middleware.go`, `routes.go`
    - Admin Templates CRUD: `admin_templates.go`
    - Admin Assets: `admin_assets.go` (list/upload/update/delete)
  - Data access: `backend/internal/database/`
    - `postgres.go`, `database.go`
    - Admin templates queries + publish guard: `admin_templates.go`
    - Template assets: `admin_assets.go`
  - Storage helpers: `backend/internal/storage/storage.go`
    - `AssetsDir()`, `AssetsBaseURL()`, `SaveTemplateAssetFile()`
  - Domain models: `backend/internal/models/models.go`
    - `TemplateAdmin`, `AdminTemplatesList`, `TemplateAssetAdmin`, Create/Update inputs
  - Entry points: `backend/cmd/api/main.go` (serves `/processed/` and `/assets/`)
  - Migrations: `backend/migrations/ (0001…0006)`

- Web Admin (Web CMS)
  - API client: `web-cms/src/api/client.ts` (Axios + envelope unwrap + Bearer + 401 retry)
  - Public templates API: `web-cms/src/api/templates.ts`
  - Admin API: `web-cms/src/api/admin/*` (CRUD + publish/unpublish + assets)
  - Types: `web-cms/src/types/{admin.ts, template.ts, envelope.ts}`
  - UI:
    - Pages: `web-cms/src/pages/Admin/*`, `web-cms/src/pages/Templates/*`
  - Auth: `web-cms/src/auth/*` (Firebase + ProtectedRoute)

- API Documentation
  - `swagger/openapi.yaml` (OpenAPI 3.1; includes assets endpoints & schemas)

## Key Technical Decisions

- Authentication via Firebase ID token (JWT) sent as Bearer header to backend.
- Envelope response format for consistency and observability.
- Web CMS uses TanStack Query for server state, Axios with interceptors, MUI for UI.
- Assets storage in dev: local Docker volume mounted at `/assets`, publicly served at `/assets/*`.
- Admin Assets upload requires `slug`; Create flow supports early upload by auto-creating a draft.

## Design Patterns

- Backend:
  - Handlers → database layer separation.
  - Context propagation for request-scoped values.
  - Table-/envelope-oriented responses with consistent error mapping (422 for validation).
  - Unique thumbnail enforcement by demoting other thumbnails to preview on promote.

- iOS:
  - MVVM-ish with Observation; Repository for network.
  - 401 refresh-and-retry via token provider.

- Web CMS:
  - React Router protected routes.
  - TanStack Query hooks per resource; mutations invalidate relevant queries.
  - React Hook Form + Zod for validation.

## Critical Implementation Paths

- GET /v1/templates (public listing for iOS)
  1) Client composes query: `limit`, `offset`, `q`, `tags` (CSV), `sort`.
  2) Sends Authorization: Bearer.
  3) Backend joins `template_assets(kind='thumbnail')`, applies filters/sort.
  4) Returns `EnvelopeTemplatesList`.

- Admin Templates CRUD (web-cms)
  - List: `GET /v1/admin/templates`
  - Create: `POST /v1/admin/templates`
  - Detail: `GET /v1/admin/templates/{slug}`
  - Update: `PUT /v1/admin/templates/{slug}`
  - Delete: `DELETE /v1/admin/templates/{slug}`
  - Publish / Unpublish: `POST /v1/admin/templates/{slug}/publish|unpublish` (publish requires thumbnail; else 422)

- Admin Assets
  - List: `GET /v1/admin/templates/{slug}/assets`
  - Upload: `POST /v1/admin/templates/{slug}/assets` (multipart; png/jpeg; `kind=thumbnail|preview`)
  - Update: `PUT /v1/admin/templates/{slug}/assets/{id}` (change kind/sort; unique thumbnail)
  - Delete: `DELETE /v1/admin/templates/{slug}/assets/{id}`
  - Static serving: `/assets/templates/{slug}/{filename}` via `main.go` + Docker volume

## Observability

- `meta.requestId` and `meta.timestamp` added to all envelopes.
- Recommend correlating requestId in backend logs.
- Pagination metadata (total/hasMore/nextOffset) can be added later in `meta`.

## Data Model Notes

- `templates`:
  - Core fields include `id/slug`, `name`, `published_at`, `usage_count`, `visibility`, `status`.
- `template_assets`:
  - `id`, `template_id`, `kind ('thumbnail'|'preview')`, `url`, `sort_order`, `created_at`.
  - Promote preview to thumbnail demotes existing thumbnails to preview.

## Deployment / Docker

- Services: db, backend, web (optional), pgadmin.
- Backend env:
  - `ASSETS_DIR=/assets`, `ASSETS_BASE_URL=/assets`
  - Dev auth toggles: `DEV_AUTH_ENABLED=1`, `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD`
  - CORS: `CORS_ALLOWED_ORIGINS=http://localhost:5173`, `CORS_ALLOWED_HEADERS=Authorization,Content-Type`
- Volumes:
  - `../backend/assets:/assets` (uploads)
  - `../backend/processed:/processed` (sample outputs)

## Risks / Considerations

- Local file storage vs production (S3/CDN) — abstract via `AssetsBaseURL()`.
- Ensure CORS headers are correct for Vite dev.
- Protect admin endpoints with Firebase Admin in production; DevAuth only for dev.
