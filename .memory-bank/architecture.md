# Architecture

Last updated: 2025-10-26

System overview
- iOS app (SwiftUI) consumes public APIs for browsing templates and processing images.
  - Uses Repository Protocol pattern for testability (TemplatesRepositoryProtocol).
  - ViewModels use @Observable for reactive state management.
  - Implements liquid glass beige minimalist UI design.
- Web CMS (Vite + React + TS + Material-UI v7) for admins to manage templates and test image generation.
  - Professional UI with custom theme (Indigo + Teal), Inter font, responsive layout.
  - Features: Dashboard, Templates List, Template Detail with Image Generator, Create/Edit forms.
- Backend (NestJS + Prisma) exposes:
  - Public endpoints (templates listing with security filters: published + public only).
  - Admin endpoints (templates CRUD, assets, publish/unpublish).
  - Envelope response format with standardized error handling.
- PostgreSQL stores templates with prompts, tags, metadata, and usage statistics.
- Local dev uses Docker Compose for Postgres and NestJS runtime container. DevAuth can be enabled for admin endpoints in local.
- Comprehensive test coverage: 85 tests (38 backend + 47 iOS) with 100% pass rate.

Key code paths (backend)
- Entrypoint:
  - server/src/main.ts (NestJS bootstrap with global interceptors, filters, CORS).
- HTTP layer:
  - server/src/app.module.ts (root module configuration).
  - server/src/templates/templates.controller.ts (Public templates listing).
  - server/src/templates/templates-admin.controller.ts (Admin templates CRUD).
  - server/src/templates/templates.service.ts (business logic with security filters).
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
- Testing:
  - server/src/templates/templates.service.spec.ts (23 unit tests with mocked Prisma).
  - server/test/templates.e2e-spec.ts (15 e2e tests with DevAuth).

Database schema (PostgreSQL)
- Tables (see server/prisma/schema.prisma):
  - templates (id UUID, slug String unique, name String, description String, prompt String, negativePrompt String, modelProvider String, modelName String, status enum, visibility enum, thumbnailUrl String, publishedAt DateTime, usageCount Int, tags String[], createdAt DateTime, updatedAt DateTime).
  - Enums: TemplateStatus (draft, published, archived), TemplateVisibility (public, private).
  - Future: template_versions, template_assets (to be added for prompt management and multiple assets).
- Migrations:
  - Prisma migrations in server/prisma/migrations/
  - Latest: 20251026115941_add_prompt_fields (added prompt, negativePrompt, modelProvider, modelName)
  - Previous: 20251026105027_add_admin_fields_to_templates (added admin fields)
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

Web CMS architecture (web-cms/)
- Built with Vite + React 19 + TypeScript + Material-UI v7
- Project structure:
  - src/api/ → API client layer (axios-based with envelope unwrapping)
    - client.ts → Base API client with auth interceptor
    - templates.ts → Templates API functions
    - images.ts → Image processing API functions
  - src/components/ → Reusable UI components
    - common/ → LoadingState, EmptyState
    - dashboard/ → StatsCard
    - layout/ → AppLayout (navigation, header, user menu)
    - templates/ → TemplateTable, TemplateFormDialog, TemplateInfoCard, ImageGeneratorForm, ResultDisplay, TemplatesFilters
  - src/pages/ → Page-level components
    - Dashboard/DashboardPage.tsx → Stats and recent templates
    - Templates/TemplatesListPage.tsx → Templates list with CRUD
    - Templates/TemplateDetailPage.tsx → Template detail with image generator
    - Login/LoginPage.tsx → Firebase auth login
  - src/theme/theme.ts → Custom Material-UI theme (Indigo + Teal, Inter font)
  - src/types/ → TypeScript type definitions (TemplateAdmin, CreateTemplateRequest, etc.)
  - src/auth/ → Firebase auth context and hooks
  - src/router/routes.tsx → React Router v6 configuration
- Key features:
  - Dashboard with stats cards and recent templates list
  - Templates list with filters, search, pagination
  - Template detail page with 2-column layout (info + generator)
  - Image generator with dual input mode (file upload / URL paste)
  - Side-by-side result comparison
  - Create/Edit template dialog with tabbed interface (Basic, AI Prompts, Media, Settings)
  - Professional theme with consistent spacing, colors, typography
  - Responsive design (mobile-friendly)
  - Loading states, error handling, user feedback (snackbars)

iOS app architecture (AIPhotoApp/)
- Built with SwiftUI + Firebase SDK
- Project structure:
  - Models/DTOs/ → Data transfer objects matching backend API schema
    - TemplatesDTOs.swift → TemplateDTO with computed properties (isNew, isTrending)
  - Repositories/ → API client layer with protocol-based architecture
    - TemplatesRepository.swift → Implements TemplatesRepositoryProtocol for testability
  - ViewModels/ → Observable view models for business logic
    - HomeViewModel.swift → Manages template state, fetching, filtering, favorites
    - AuthViewModel.swift → Firebase authentication
  - Views/ → SwiftUI views with liquid glass design
    - Home/ → Template browsing (TemplatesHomeView, CompactHeader, HeroStatsCard)
    - Common/ → Reusable components (GlassComponents, GlassBackgroundView)
    - Authentication/ → Login/signup flows
  - Utilities/ → Shared utilities
    - Networking/ → APIClient with envelope handling and 401 retry
    - Constants/ → Design tokens (GlassTokens with beige color palette)
- Testing:
  - AIPhotoAppTests/TemplateDTOsTests.swift → 20 tests for DTO decoding and computed properties
  - AIPhotoAppTests/HomeViewModelTests.swift → 27 tests for ViewModel logic and API integration
  - Uses MockTemplatesRepository conforming to TemplatesRepositoryProtocol for isolated testing
- Key patterns:
  - Repository Protocol pattern for dependency injection and testability
  - @Observable for reactive ViewModels (no @Published needed)
  - APIClient with envelope unwrapping and standardized error handling
  - AsyncImage for loading thumbnails from URLs with fallback SF Symbols
  - Dynamic subtitle/tag generation based on template metadata

References
- .implementation_plan/ui-ux-redesign-summary.md → Web CMS redesign details
- .implementation_plan/template-detail-page-summary.md → Template detail implementation
- .documents/workflows/run-tests.md → Admin API E2E (Docker + DevAuth)
- .documents/troubleshooting/db-auth.md → DB auth issues and fixes
- server/src/templates/templates.service.ts → Prisma query details
- server/src/templates/templates.controller.ts → request handling and validation
- .implementation_plan/nest-migration-plan.md → Migration from Go to NestJS
