# Architecture

Last updated: 2025-10-24

System overview
- iOS app (SwiftUI) consumes public APIs for browsing templates and processing images.
- Web CMS (Vite + React + TS) for admins to manage Templates and Assets.
- Backend (Go) exposes:
  - Public endpoints (templates listing, image processing).
  - Admin endpoints (templates CRUD, assets, publish/unpublish).
- PostgreSQL stores templates, versions, tags, assets, and metrics.
- Local dev uses Docker Compose for Postgres and a runtime backend container. DevAuth can be enabled for admin endpoints in local.

Key code paths (backend)
- Entrypoints:
  - backend/cmd/api/main.go (runtime entry with Firebase auth in production policy).
  - backend/main.go (alt entry; ensure consistent with production constraints).
- HTTP layer:
  - internal/api/routes.go (mux bindings).
  - internal/api/admin_templates.go (Admin Templates CRUD, publish/unpublish).
  - internal/api/admin_assets.go (Admin Template assets upload/list/update/delete).
  - internal/api/middleware.go (logging, CORS, RequestID).
  - internal/api/dev_auth.go (DevAuth for local-only admin auth via token).
  - internal/api/responder.go (envelope responses & helpers).
- Auth:
  - internal/auth/auth.go (Firebase Admin, middleware, AdminOnly).
- Data access:
  - internal/database/postgres.go (pgx driver, DSN/envs, connection).
  - internal/database/admin_templates.go (list/get/create/update/delete templates, tags, assets; publish/unpublish).
  - internal/database/database.go (file-based fallbacks for templates/users in certain flows).
- Models:
  - internal/models/models.go (DTOs/types: CreateTemplateInput, TemplateAdmin, TemplateAssetAdmin, etc).
- Image processing:
  - internal/image/image.go (processing stub/integration area).

Database schema (PostgreSQL)
- Tables (see backend/migrations):
  - templates (id UUID, slug UNIQUE, name, description, status [draft|published|archived], visibility [public|private], usage_count INT, current_version_id, timestamps).
  - template_versions (template_id FK, version, prompt_template, parameters JSONB, etc).
  - tags, template_tags (M:N).
  - template_assets (id UUID, template_id FK, kind [thumbnail|cover|preview], url, sort_order).
- Migrations in order:
  - 0004_create_templates_and_versions.up.sql
  - 0005_create_template_taxonomy_and_assets.up.sql
  - 0006_add_usage_count.up.sql

Local development patterns
- Preferred E2E path: Dockerized backend container connects to DB via Docker network:
  - DB_HOST=db, DB_USER=imageai, DB_PASSWORD=imageai_pass, DB_NAME=imageai_db.
  - Admin auth via DevAuth (DEV_AUTH_ENABLED=1) → /v1/dev/login to obtain token for Authorization: Bearer <token>.
- Host-run backend (go run on :8081) can be used but may hit DB auth issues to container Postgres; see Troubleshooting.

Admin Templates flow (high-level)
- POST /v1/admin/templates → database.CreateAdminTemplate:
  - INSERT into templates (slug, name, description, status, visibility).
  - Upsert tags (tags table) and mapping (template_tags).
  - Upsert thumbnail asset if provided (template_assets with kind=thumbnail).
- POST /v1/admin/templates/{slug}/assets (multipart) → saves assets under /assets mount; updates DB.
- POST /v1/admin/templates/{slug}/publish → requires thumbnail; sets status=published, published_at=NOW().

Observability (dev)
- Logging middleware records status, duration, and error envelopes.
- Temporary debug logs (dev-only):
  - internal/api/admin_templates.go adds cause in error details to surface DB failures during local debug.
  - internal/database/postgres.go logs DSN (masked) and ping errors for connection diagnosis.
- Remove/guard these logs before production.

Containers
- docker/docker-compose.yml:
  - services:
    - db (postgres:15) exposed on host 5432 with persistent volume.
    - backend (runtime image built from build/imageai-backend, port 8080) with envs for DB and DevAuth.
    - web_cms and web_cms_preview (optional dev HMR/preview).
    - pgadmin (optional).
- backend/Dockerfile.runtime (scratch + CA certs + static binary).

References
- .documents/workflows/run-tests.md → Admin API E2E (Docker + DevAuth).
- .documents/troubleshooting/db-auth.md → DB auth issues and fixes.
- backend/internal/database/admin_templates.go → SQL details.
- backend/internal/api/admin_templates.go → request handling and validation.
