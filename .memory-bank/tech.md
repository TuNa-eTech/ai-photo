# Tech

Last updated: 2025-10-26

Technologies
- Backend: NestJS (Node.js), Prisma ORM (@prisma/client), PostgreSQL driver.
- Database: PostgreSQL 15 (Docker).
- Auth:
  - Production: Firebase Admin SDK, BearerAuthGuard with Firebase token verification.
  - Local Dev: DevAuth (DEV_AUTH_TOKEN env variable) for admin endpoints.
- Frontends:
  - iOS: SwiftUI (iOS 17+), Firebase SDK, Liquid Glass Beige design system.
    - Design tokens: GlassTokens (beige palette: #F5E6D3, #F4E4C1, #E8D5D0, text #4A3F35)
    - Glass effects: .ultraThinMaterial, gradient overlays, blur, shadows
    - Animations: Spring transitions, organic blob motion, haptic feedback
  - Web CMS: Vite 7 + React 19 + TypeScript 5.9 + Material-UI v7 + React Query v5 + React Router v7.
    - Custom theme: Indigo primary (#3f51b5) + Teal secondary (#009688), Inter font
- Containerization: Docker Compose (Postgres, NestJS Server, optional Web CMS/Preview, pgAdmin).
- Tooling: yarn, prisma CLI, curl, jq, yq (for scripting), psql via docker exec/run.

Environment & Configuration
- Backend entrypoint:
  - server/src/main.ts (NestJS bootstrap with global configuration).
- Environment variables:
  - Database:
    - DATABASE_URL=postgres://imageai:imageai_pass@db:5432/imageai_db?sslmode=disable (Docker).
    - DATABASE_URL=postgres://imageai:imageai_pass@127.0.0.1:5432/imageai_db?sslmode=disable (host).
  - Firebase:
    - FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (service account credentials).
    - ADMIN_EMAILS (comma-separated emails for admin whitelist - future feature).
  - Dev Auth (local only):
    - DEV_AUTH_ENABLED=1
    - DEV_AUTH_TOKEN=dev-secret-token-123
  - Gemini API:
    - GEMINI_API_KEY (Google Gemini API key for image processing).
    - GEMINI_MODEL (default: gemini-2.5-flash-image).
    - GEMINI_TIMEOUT_MS (default: 45000).
    - USE_MOCK_IMAGE (set to 'true' to use mock_dev/test_img.png instead of real API - saves costs in development).
  - CORS: CORS_ALLOWED_ORIGINS (comma-separated origins).
  - Server: PORT=8080
- Ports:
  - NestJS server: 8080 (exposed).
  - Postgres container: 5432 exposed to host.

Local Development Setup
- Current preferred setup (best DX):
  1) Start only DB in Docker:
     ```bash
     cd docker
     docker-compose up -d db
     ```
  2) Run server locally:
     ```bash
     cd server
     export DATABASE_URL="postgresql://imageai:imageai_pass@localhost:55432/imageai_db?schema=public"
     export DEV_AUTH_ENABLED=1
     export DEV_AUTH_TOKEN=dev
     export PORT=8080
     yarn start:dev
     ```
  3) Run web-cms locally:
     ```bash
     cd web-cms
     yarn dev
     ```
  4) Access:
     - Web CMS: http://localhost:5173
     - API: http://localhost:8080
     - DB: localhost:55432
- Benefits:
  - Hot reload for both server and web-cms
  - File uploads work directly (no volume mapping issues)
  - Easy debugging with local processes
  - DB isolated in container
- Alternative (full Docker):
  - docker-compose up -d db server web_cms
  - Need volume mapping for public/ directory

Database & Migrations
- Schema is defined in server/prisma/schema.prisma:
  - Template model with id, slug, name, description, prompt, negativePrompt, modelProvider, modelName, status, visibility, thumbnailUrl, publishedAt, usageCount, tags, createdAt, updatedAt.
  - Enums: TemplateStatus (draft, published, archived), TemplateVisibility (public, private).
  - Future: template_versions, template_assets models.
- Recent migrations:
  - 20251026115941_add_prompt_fields (added prompt, negativePrompt, modelProvider, modelName)
  - 20251026105027_add_admin_fields_to_templates (added slug, status, visibility, tags, dates)
- Migrate methods:
  - Prisma migrations: npx prisma migrate dev
  - Generate client: npx prisma generate
  - Reset database: npx prisma migrate reset
- Default credentials (Docker):
  - POSTGRES_USER=imageai
  - POSTGRES_PASSWORD=imageai_pass
  - POSTGRES_DB=imageai_db

Auth Patterns
- Firebase Admin:
  - BearerAuthGuard verifies Firebase ID token via Firebase Admin SDK.
  - Production policy requires Firebase service account credentials.
- DevAuth (local only):
  - DEV_AUTH_TOKEN environment variable for simple token-based auth.
  - BearerAuthGuard checks token against DEV_AUTH_TOKEN when DEV_AUTH_ENABLED=1.
  - Do not enable in production.

Observability & Debugging (dev)
- NestJS built-in logging with request/response tracking.
- Global exception filter maps HTTP exceptions to envelope errors.
- Envelope interceptor wraps all successful responses.
- Prisma query logging available in development mode.

Dependencies & Versions
- Node.js: 20+
- Package manager: Yarn (backend + web-cms)
- Backend:
  - NestJS packages: @nestjs/core, @nestjs/common, @nestjs/config, @nestjs/platform-express, @nestjs/serve-static
  - Database: @prisma/client, prisma (dev dependency)
  - Firebase: firebase-admin
  - File upload: multer (via @nestjs/platform-express), @types/multer
  - Validation: class-validator, class-transformer
- Web CMS:
  - React 19.1.1, TypeScript 5.9
  - Vite 7.1.7, React Router 7.9.4
  - Material-UI 7.3.4, @emotion/react, @emotion/styled
  - React Query 5.90.5 (for server state)
  - Firebase 12.4.0 (for auth)
  - Axios 1.12.2 (HTTP client)
  - date-fns 4.1.0 (date formatting)
- Docker images:
  - postgres:15
  - dpage/pgadmin4 (optional)
  - node:20-alpine (for NestJS server)

Testing

Backend (NestJS + Jest + Supertest)
- Unit tests (23 passing):
  ```bash
  cd server
  yarn test templates.service.spec.ts
  ```
- E2E tests (15 passing):
  ```bash
  cd server
  yarn test:e2e templates.e2e-spec.ts
  ```
- Run all tests:
  ```bash
  cd server
  yarn test
  yarn test:e2e
  ```
- Coverage:
  ```bash
  cd server
  yarn test:cov
  ```

iOS (Swift Testing + XCTest)
- Unit tests (47 passing):
  ```bash
  cd AIPhotoApp
  
  # Build and run tests (recommended)
  xcodebuild test \
    -scheme AIPhotoApp \
    -destination 'platform=iOS Simulator,name=iPhone 17' \
    -only-testing:AIPhotoAppTests \
    -parallel-testing-enabled NO \
    2>&1 | xcpretty --color --test
  
  # Or build once, run multiple times (faster)
  xcodebuild build-for-testing \
    -scheme AIPhotoApp \
    -destination 'platform=iOS Simulator,name=iPhone 17'
  
  xcodebuild test-without-building \
    -scheme AIPhotoApp \
    -destination 'platform=iOS Simulator,name=iPhone 17' \
    -only-testing:AIPhotoAppTests \
    -parallel-testing-enabled NO \
    2>&1 | xcpretty --color --test
  
  # Or in Xcode: Cmd+U
  ```
- Important flags:
  - `-parallel-testing-enabled NO`: Required for deterministic async tests
  - `xcpretty --color --test`: Clean formatted output
  - `-only-testing:AIPhotoAppTests`: Run only unit tests (not UI tests)
- Test organization:
  - AIPhotoAppTests/TemplateDTOsTests.swift (20 tests): DTO decoding, computed properties
  - AIPhotoAppTests/HomeViewModelTests.swift (27 tests): ViewModel logic, API integration

Web CMS (Vitest + React Testing Library)
- Unit tests:
  ```bash
  cd web-cms
  yarn test
  ```
- UI tests:
  ```bash
  cd web-cms
  yarn test:ui
  ```
- Coverage:
  ```bash
  cd web-cms
  yarn test:coverage
  ```
- E2E (future): Playwright

Admin API E2E (Docker + DevAuth)
- Preferred via Docker NestJS + DevAuth using .box-testing scripts
- See .documents/workflows/run-tests.md → Admin API E2E (Docker + DevAuth)

Test Coverage Summary (as of 2025-10-26)
- Backend: 38 tests (23 unit + 15 e2e) - 100% passing
- iOS: 47 tests (unit) - 100% passing
- Total: 85 tests - 100% passing ✅

Constraints & Notes
- Public template listing does not expose prompts; prompts managed server-side only.
- Prompts currently stored directly in Template model (Phase 1), will migrate to template_versions table (Phase 2).
- Publish requires thumbnail to be present (validation enforced).
- Assets are persisted in public/thumbnails/ with pattern: {slug}-{kind}-{timestamp}.{ext}.
- Automatic file cleanup: old thumbnails deleted on upload, all files deleted on template delete.
- NestJS global interceptors and filters provide consistent envelope responses.
- Web CMS uses envelope unwrapping in API client interceptor for cleaner code.
- Prisma migrations are version-controlled and applied via CLI.
- Web CMS theme customizable via src/theme/theme.ts (Material-UI createTheme).
- Image processing currently synchronous (10-30s timeout), async job queue planned for Phase 2.
- Mock image mode: Set `USE_MOCK_IMAGE=true` to bypass GeminiService and return `mock_dev/test_img.png` (saves API costs during development).

iOS-Specific Best Practices
- **JSONDecoder + CodingKeys Pattern:**
  - NEVER combine `.convertFromSnakeCase` with explicit CodingKeys
  - Problem: `.convertFromSnakeCase` converts `thumbnail_url` → `thumbnailUrl` (lowercase "u"), conflicts with Swift property `thumbnailURL` (uppercase "URL")
  - Solution: Use explicit CodingKeys WITHOUT `.convertFromSnakeCase`
  - Always provide custom decoder when working with backend APIs that use snake_case
  - Example: `TemplatesRepository.customDecoder` - only sets `.iso8601` for dates
- **iOS Simulator Network:**
  - Simulator CANNOT access host's `localhost` - `localhost` in simulator = simulator itself
  - Solution: Use Mac's actual IP address (e.g., `192.168.1.123:8080`)
  - Find IP: `ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1`
  - Update `AppConfig.swift` with Mac IP for local testing
  - Backend MUST listen on `0.0.0.0` (all interfaces), not just `localhost`
  - See `SIMULATOR_NETWORK_FIX.md` for detailed troubleshooting
- **AsyncImage Best Practices:**
  - Always handle all phases: `.success`, `.failure`, `.empty`
  - Use `@State` for parent ViewModels to ensure persistence across view updates
  - Avoid applying blur effects to actual images - use gradient overlays for text readability instead
  - Add debug logging in DEBUG builds to track loading failures
- **State Management:**
  - Use `@State private var` for ViewModels in views to prevent re-initialization
  - Pass ViewModels explicitly to child views (dependency injection)
  - Use `@Observable` macro for ViewModels (not `@StateObject`)
- **API Integration:**
  - Always use Repository Protocol pattern for testability
  - Mock repositories in tests, never make real network calls
  - Handle 401 retry with token refresh via tokenProvider closure
  - Use envelope unwrapping in repositories to simplify ViewModel code
