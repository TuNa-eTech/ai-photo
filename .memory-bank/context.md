# Context

Short, factual snapshot of the current project state.

Last updated: 2025-10-23

## Current Focus
- Web Admin (React + Vite + TS):
  - Phase 2 completed for Templates management: full CRUD + publish/unpublish and image assets upload.
  - Upload available in BOTH Create and Edit:
    - Create: first upload auto-creates a draft (using current slug/name/status/visibility/tags), then uploads file to assets; thumbnail upload auto-fills `thumbnail_url`.
    - Edit: upload thumbnail/preview, preview gallery, make-thumbnail, delete.
  - Admin list shows Thumb (48x48), filters (q/tags/status/visibility/sort), pagination; actions include Edit/Delete and bulk Publish/Unpublish/Delete.

- Backend (Go + Postgres):
  - Admin endpoints implemented (envelope pattern):
    - GET/POST/PUT/DELETE /v1/admin/templates
    - GET /v1/admin/templates/{slug}
    - POST /v1/admin/templates/{slug}/publish
    - POST /v1/admin/templates/{slug}/unpublish
  - Assets endpoints implemented + static serving:
    - GET /v1/admin/templates/{slug}/assets
    - POST /v1/admin/templates/{slug}/assets (multipart, png/jpeg, ~12MB)
    - PUT /v1/admin/templates/{slug}/assets/{id} (kind/sort_order; unique thumbnail enforced)
    - DELETE /v1/admin/templates/{slug}/assets/{id}
    - Static /assets served from Docker volume (../backend/assets:/assets)
  - Publish requires existing thumbnail; returns 422 validation error if missing.

- iOS (SwiftUI):
  - Phase 1 remains stable: Home screen, GET /v1/templates with envelope handle + 401 retry.
  - No changes required for Phase 2 admin features.

## Recent Changes
- Implemented DB layer for `template_assets` (list/insert/update/delete); uniqueness on thumbnail promote.
- Added storage helpers (ASSETS_DIR/ASSETS_BASE_URL; file save).
- Wired static /assets in backend mux and Docker volume mount.
- Extended Swagger: assets endpoints + TemplateAssetAdmin schemas.
- Frontend:
  - API module and hooks for assets (list/upload/update/delete).
  - TemplateFormDrawer updated to support upload in Create + Edit.
  - Admin list Thumb column rendering from `thumbnail_url`.
- Docker:
  - backend env: ASSETS_DIR=/assets, ASSETS_BASE_URL=/assets, DEV auth envs
  - volumes: ../backend/assets:/assets

## Next Steps
- Tests:
  - Frontend: MSW handlers + RTL tests for upload flows (create-draft-on-upload, make-thumbnail, delete).
  - Backend: table-driven tests for assets handlers; integration for publish guard.
- Optional:
  - Reorder previews (drag/drop) → update `sort_order`.
  - Switch to Firebase Admin verification in prod; keep DevAuth in dev only.
  - Add envelope pagination metadata (meta.total/hasMore/nextOffset) if needed.

## Risks / Considerations
- File storage is local in dev; for prod consider S3/CDN. Abstract via `ASSETS_BASE_URL`.
- Enforce CORS for http://localhost:5173 with Authorization, Content-Type.
- Ensure admin-only endpoints protected in prod (Firebase Admin).

## References
- Swagger: swagger/openapi.yaml (assets + admin endpoints)
- Backend code:
  - internal/api/admin_templates.go, internal/api/admin_assets.go
  - internal/database/admin_templates.go, internal/database/admin_assets.go
  - internal/storage/storage.go
  - cmd/api/main.go (static /assets)
- Frontend code:
  - web-cms/src/api/admin/ (CRUD + assets)
  - web-cms/src/pages/Admin/
  - web-cms/src/pages/Templates/
