# Migration Plan: Replace Go backend with NestJS + Yarn

Status Checklist - Phase 1 (Public API)
- [x] Parse OpenAPI and list endpoints/schemas
- [x] Create implementation plan file
- [x] Scaffold NestJS app in server/ using Yarn
- [x] Add base configuration (ConfigModule, env validation, per-env config)
- [x] Choose ORM: Prisma + PostgreSQL, initialize schema and migrations
- [x] Port DB models required for public API (templates)
- [x] Seed initial data (ported from backend/templates.json or seed-templates)
- [x] Implement response envelope interceptor (match EnvelopeTemplatesList and EnvelopeError)
- [x] Implement Auth guard (Firebase/DevAuth stub) aligning with bearerAuth
- [x] Implement Templates module: controller, service, repository/query with filters/sorting/pagination
- [x] E2E tests (Jest + Supertest) for /v1/templates with query params and envelopes
- [x] Dockerize Nest server and update docker-compose to preserve :8080
- [x] Update READMEs and operational docs
- [x] Deprecate/Archive Go backend docs and migration path notes

Status Checklist - Phase 2 (Admin API)
- [x] Add admin fields to Prisma schema (slug, description, status, visibility, tags)
- [x] Create migration: 20251026105027_add_admin_fields_to_templates
- [x] Implement admin CRUD endpoints controller (templates-admin.controller.ts)
- [x] Implement full admin service methods (create, update, delete, publish, unpublish)
- [x] Add file upload support with multer
- [x] Implement thumbnail upload endpoint (POST /v1/admin/templates/{slug}/assets)
- [x] Add static file serving with ServeStaticModule
- [x] Implement automatic file cleanup (delete old thumbnails)
- [x] Create admin DTOs (CreateTemplateDto, UpdateTemplateDto, UploadAssetDto)
- [x] Update web-cms to use admin endpoints
- [x] Implement thumbnail upload UI in TemplateFormDialog
- [x] Test full CRUD workflow (create, edit, delete, publish/unpublish)
- [x] Create sample data for testing (.box-testing/json/templates-sample.json)
- [x] Create import script for sample data
- [x] Update memory bank documentation
- [x] Create API documentation (.documents/api/admin-templates-api.md)

Next Steps - Phase 3 (Future)
- [ ] Add filtering/sorting to admin list endpoint
- [ ] Implement template_versions table for prompts
- [ ] Add template_assets table for multiple asset types
- [ ] Add comprehensive E2E tests for admin endpoints
- [ ] iOS app integration with new template fields

Goals
- Replace existing Go backend with a NestJS service that preserves API contract and base URL so the web-cms and iOS app do not break.
- Documentation-first: update .documents to reflect architecture, setup, and workflows.
- Keep port minimal for first milestone: implement the public Templates read-only API from OpenAPI, then iterate to admin endpoints.

Scope for Milestone 1 (Public Templates API)
- Implement GET /v1/templates with:
  - Query params: limit (default 20), offset (default 0), q (search name/slug), tags (comma-separated slugs), sort (newest|popular|name, default newest).
  - Response envelope: EnvelopeTemplatesList (success, data.templates[], meta).
  - 401 response (EnvelopeError) if bearer token is required per spec (see Note below).
- Data fields:
  - id (string, e.g., slug)
  - name (string)
  - thumbnail_url (string uri)
  - published_at (datetime)
  - usage_count (int)

API Contract Source
- swagger/openapi.yaml (v1.0.1)
  - Server: http://localhost:8080
  - GET /v1/templates secured by bearerAuth (JWT from Firebase or DevAuth)
  - Envelopes: EnvelopeTemplatesList, EnvelopeError
  - Note: The description says “Public” but security is set to bearerAuth. We will implement bearer guard for parity, and allow a DevAuth token shortcut in local/dev per existing practice.

Technical Decisions
- Runtime: Node 20+
- Framework: NestJS
- Package manager: Yarn
- ORM: Prisma (with @prisma/client)
  - Rationale: fast schema iteration, easy generator support, good Postgres support.
- Database: PostgreSQL (reuse existing Postgres setup in docker-compose)
- Config: @nestjs/config with class-validator for env validation
- Response envelope: custom interceptor to wrap success results to match Go envelope style
- Error handling: global exception filter mapping HttpException to EnvelopeError
- Auth: Guard
  - Phase 1: DevAuth stub guard (read an env DEV_AUTH_TOKEN or accept “dev” token)
  - Phase 2: Firebase token verification (if required later by product)

Directory Layout (server/)
- server/
  - src/
    - main.ts
    - app.module.ts
    - common/
      - interceptors/envelope.interceptor.ts
      - filters/http-exception.filter.ts
      - dto/envelope.dto.ts
      - guards/bearer-auth.guard.ts (DevAuth placeholder)
    - config/
      - configuration.ts
      - validation.ts
    - prisma/
      - prisma.service.ts
      - prisma.module.ts
    - templates/
      - templates.module.ts
      - templates.controller.ts
      - templates.service.ts
      - dto/query-templates.dto.ts
      - dto/template.dto.ts
      - entities/template.entity.ts (optional)
    - health/
      - health.module.ts
      - health.controller.ts
  - prisma/
    - schema.prisma
    - migrations/
  - test/
    - e2e/
      - templates.e2e-spec.ts
  - package.json
  - tsconfig*.json
  - Dockerfile
  - .env.example

DB Model (minimal for Milestone 1)
- Table: Template
  - id: String (slug, unique, primary key)
  - name: String
  - thumbnailUrl: String
  - publishedAt: DateTime
  - usageCount: Int (default 0)
- Future: taxonomy tables and joins for tag filtering if needed (for Milestone 1, tags can be deferred to uses of an existing join table. If tags are essential now, add: Tag, TemplateTag many-to-many with slug on Tag).

Mapping Query Params
- limit: number, default 20, min 1
- offset: number, default 0, min 0
- q: string (search name or id/slug)
- tags: string (comma-separated), if taxonomy present, filter by tag slugs; else placeholder (return unfiltered until taxonomy is ported)
- sort:
  - newest => orderBy publishedAt desc
  - popular => orderBy usageCount desc
  - name => orderBy name asc

Response Envelope
- Success
  {
    "success": true,
    "data": { "templates": [ ... ] },
    "meta": { "requestId": "...", "timestamp": "..." }
  }
- Error
  {
    "success": false,
    "error": { "code": "unauthorized", "message": "...", "details": { ... } },
    "meta": { "requestId": "...", "timestamp": "..." }
  }

Plan Steps and Commands

1) Scaffold NestJS app (requires approval)
- Command:
  npx @nestjs/cli new server --package-manager yarn --skip-git
- Rationale: Create standard Nest app with yarn.lock managed by Yarn.

2) Add dependencies
- Runtime:
  yarn add @nestjs/config class-validator class-transformer
- ORM:
  yarn add @prisma/client
  yarn add -D prisma
- Testing (preinstalled with Nest): jest, supertest (verify presence; add if missing)

3) Initialize Prisma
- Command:
  npx prisma init
- Configure DATABASE_URL in .env, point to Postgres from docker-compose.

4) Define schema.prisma (minimal)
model Template {
  id           String   @id
  name         String
  thumbnailUrl String
  publishedAt  DateTime
  usageCount   Int      @default(0)

  @@map("templates")
}
- Then:
  npx prisma migrate dev --name init_templates
  npx prisma generate

5) Implement common envelope and error handling
- EnvelopeInterceptor: wraps successful responses into success/data/meta structure.
- HttpExceptionFilter: maps HttpException to success:false, error, meta.

6) Implement Auth guard (DevAuth)
- Read Authorization: Bearer <token> header.
- Accept a token that matches DEV_AUTH_TOKEN (from env) in local/dev.
- For now, enforce guard on /v1/templates to match OpenAPI. If token missing/invalid, throw 401 with EnvelopeError.

7) Implement Templates module
- DTO (query-templates.dto.ts) using class-validator for limit/offset/q/tags/sort.
- Service: build Prisma query with where/orderBy/take/skip.
- Controller: GET /v1/templates returns EnvelopeTemplatesList.

8) E2E Test with Supertest
- Start app in test env.
- Test authenticated call returns 200 and envelope structure.
- Test invalid/missing token returns 401 envelope.
- Test pagination/sorting basic assertions.

9) Dockerization
- Dockerfile for server:
  - Node 20-alpine
  - Install deps (yarn install --frozen-lockfile)
  - Generate Prisma client
  - Build (yarn build)
  - CMD: node dist/main.js
- Update docker/docker-compose.yml:
  - Replace go backend service with server (Nest) on 8080
  - Ensure Postgres service as-is
  - Networks/volumes remain unchanged where possible

10) Data seeding
- Option A: reuse backend/templates.json by writing a simple Nest script to import via Prisma.
- Option B: re-run existing Go seed-templates workflow against the new DB then cut over (temporary).
- Target: minimal seed to demo public endpoint.

11) Web-CMS compatibility
- Maintain base URL http://localhost:8080 and path /v1/templates.
- Ensure envelope and field names match OpenAPI.
- If front-end expects additional fields, add projections.

12) Documentation updates (.documents)
- .documents/backend/architecture-nest.md
  - Architecture diagram, modules, config, ORM, error handling, auth flow.
- .documents/workflows/run-tests.md (update with Yarn/Nest commands and prisma test DB strategy)
- .documents/api-spec-mapping.md (mapping from Go -> Nest modules/endpoints)
- .documents/troubleshooting/db-auth.md (Nest/Prisma specific notes)
- Keep documentation as “single source of truth” per project rule.

Rollout Strategy
- Stand up Nest service locally with docker-compose on a distinct container.
- Once feature parity (public templates) is verified, stop the Go container.
- Stage next milestones (admin endpoints, assets, taxonomy) and port incrementally.

Risk/Notes
- Security mismatch: Spec says public but sets bearerAuth. We will match spec and require bearer in dev. Confirm with product if truly public in future, then update OpenAPI and remove guard.
- Taxonomy/tags: If used in UI, we need tag tables and relations before the tags filter works.
- Web-CMS assumption: ensure CMS or app doesn’t rely on additional fields.

Runbook (after scaffold)
- Local dev:
  - cd server
  - yarn start:dev
- DB migrate:
  - npx prisma migrate dev
- Test:
  - yarn test
  - yarn test:e2e
- Seed:
  - yarn ts-node ./scripts/seed.ts (to be added)

Next Actions (requires approval to run commands)
1) Scaffold server/ via Nest CLI (Yarn)
2) Add config, Prisma, base modules/files
3) Implement GET /v1/templates and tests
4) Dockerize and update compose
