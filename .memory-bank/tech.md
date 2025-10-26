# Tech

Last updated: 2025-10-25

Technologies
- Backend: NestJS (Node.js), Prisma ORM (@prisma/client), PostgreSQL driver.
- Database: PostgreSQL 15 (Docker).
- Auth:
  - Production: Firebase Admin SDK, BearerAuthGuard with Firebase token verification.
  - Local Dev: DevAuth (DEV_AUTH_TOKEN env variable) for admin endpoints.
- Frontends:
  - iOS: SwiftUI.
  - Web CMS: Vite + React + TypeScript.
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
  - Template model with id, name, thumbnailUrl, publishedAt, usageCount.
  - Future: template_versions, tags, template_tags, template_assets models.
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
- Package manager: Yarn
- NestJS packages: @nestjs/core, @nestjs/common, @nestjs/config, @nestjs/platform-express, @nestjs/serve-static
- Database: @prisma/client, prisma (dev dependency)
- Firebase: firebase-admin
- File upload: multer (via @nestjs/platform-express), @types/multer
- Validation: class-validator, class-transformer
- Docker images:
  - postgres:15
  - dpage/pgadmin4 (optional)
  - node:20-alpine (for NestJS server)
- Frontend package manager: pnpm for Web CMS (React + Vite + Material UI).

Testing
- Backend:
  - Unit/integration: yarn test (Jest + Supertest).
  - E2E: yarn test:e2e
- iOS:
  - Xcode (⌘U) or xcodebuild with -parallel-testing-enabled NO.
- Web CMS:
  - pnpm vitest
- E2E (admin):
  - Preferred via Docker NestJS + DevAuth using .box-testing scripts.
  - See .documents/workflows/run-tests.md → Admin API E2E (Docker + DevAuth).

Constraints & Notes
- Public template listing does not expose prompts; prompts live in server-side template_versions (future).
- Publish requires thumbnail to be present (validation enforced - future).
- Assets are persisted under ASSETS_DIR with BASE_URL mapping; ensure mount present in docker-compose (future).
- NestJS global interceptors and filters provide consistent envelope responses.
- Prisma migrations are version-controlled and applied via CLI.
