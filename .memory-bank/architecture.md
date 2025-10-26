# Architecture

Last updated: 2025-10-25

System overview
- iOS app (SwiftUI) consumes public APIs for browsing templates and processing images.
- Web CMS (Vite + React + TS) for admins to manage Templates and Assets.
- Backend (NestJS + Prisma) exposes:
  - Public endpoints (templates listing, image processing).
  - Admin endpoints (templates CRUD, assets, publish/unpublish).
- PostgreSQL stores templates, versions, tags, assets, and metrics.
- Local dev uses Docker Compose for Postgres and NestJS runtime container. DevAuth can be enabled for admin endpoints in local.

Key code paths (backend)
- Entrypoint:
  - server/src/main.ts (NestJS bootstrap with global interceptors, filters, CORS).
- HTTP layer:
  - server/src/app.module.ts (root module configuration).
  - server/src/templates/templates.controller.ts (Templates CRUD endpoints).
  - server/src/templates/templates.service.ts (business logic).
  - server/src/templates/dto/ (request/response DTOs with validation).
- Auth:
  - server/src/auth/bearer-auth.guard.ts (Firebase token verification + DevAuth).
  - server/src/auth/firebase-admin.ts (Firebase Admin SDK initialization).
- Data access:
  - server/src/prisma/prisma.service.ts (Prisma client service).
  - server/prisma/schema.prisma (database schema definition).
  - server/prisma/migrations/ (database migrations).
- Common:
  - server/src/common/interceptors/envelope.interceptor.ts (response envelope wrapper).
  - server/src/common/filters/http-exception.filter.ts (error envelope mapping).
  - server/src/common/dto/envelope.dto.ts (envelope types and helpers).

Database schema (PostgreSQL)
- Tables (see server/prisma/schema.prisma):
  - templates (id UUID, slug String unique, name String, description String, status enum, visibility enum, thumbnailUrl String, publishedAt DateTime, usageCount Int, tags String[], createdAt DateTime, updatedAt DateTime).
  - Enums: TemplateStatus (draft, published, archived), TemplateVisibility (public, private).
  - Future: template_versions, template_assets (to be added for prompt management and multiple assets).
- Migrations:
  - Prisma migrations in server/prisma/migrations/
  - Latest: 20251026105027_add_admin_fields_to_templates (added admin fields)
  - Schema defined in Prisma format with @map directives for PostgreSQL compatibility.

Local development patterns
- Preferred E2E path: Dockerized NestJS container connects to DB via Docker network:
  - DATABASE_URL=postgres://imageai:imageai_pass@db:5432/imageai_db?sslmode=disable.
  - Admin auth via DevAuth (DEV_AUTH_ENABLED=1) → use DEV_AUTH_TOKEN for Authorization: Bearer <token>.
- Host-run NestJS (yarn start:dev) can be used with host Postgres connection.

Admin Templates flow (implemented)
- Public endpoints:
  - GET /v1/templates → TemplatesService.listTemplates (minimal fields for end users)
- Admin endpoints (templates-admin.controller.ts):
  - GET /v1/admin/templates → listAdminTemplates (full fields including slug, status, visibility, tags)
  - POST /v1/admin/templates → createTemplate (with validation: slug format, unique check)
  - GET /v1/admin/templates/{slug} → getTemplateBySlug
  - PUT /v1/admin/templates/{slug} → updateTemplate (cannot change slug)
  - DELETE /v1/admin/templates/{slug} → deleteTemplate (with file cleanup)
  - POST /v1/admin/templates/{slug}/publish → publishTemplate (validates thumbnail_url exists)
  - POST /v1/admin/templates/{slug}/unpublish → unpublishTemplate
  - POST /v1/admin/templates/{slug}/assets → uploadAsset (multer file upload, auto-cleanup old files)
- File handling:
  - Uploads saved to public/thumbnails/ with pattern: {slug}-{kind}-{timestamp}.{ext}
  - Old thumbnail deleted automatically when uploading new one
  - All files deleted when template is deleted
  - Static files served via ServeStaticModule at /public/*

Observability (dev)
- NestJS built-in logging with request/response tracking.
- Global exception filter maps HTTP exceptions to envelope errors.
- Envelope interceptor wraps all successful responses.
- Prisma query logging available in development mode.

Containers
- docker/docker-compose.yml:
  - services:
    - db (postgres:15) exposed on host 5432 with persistent volume.
    - server (NestJS runtime image, port 8080) with envs for DB and DevAuth.
    - web_cms and web_cms_preview (optional dev HMR/preview).
    - pgadmin (optional).
- server/Dockerfile (Node.js + NestJS build process).

References
- .documents/workflows/run-tests.md → Admin API E2E (Docker + DevAuth).
- .documents/troubleshooting/db-auth.md → DB auth issues and fixes.
- server/src/templates/templates.service.ts → Prisma query details.
- server/src/templates/templates.controller.ts → request handling and validation.
- .implementation_plan/nest-migration-plan.md → Migration from Go to NestJS.
