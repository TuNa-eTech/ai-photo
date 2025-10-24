# Tech

Last updated: 2025-10-24

Technologies
- Backend: Go (net/http), pgx (github.com/jackc/pgx/v5/stdlib), standard library.
- Database: PostgreSQL 15 (Docker).
- Auth:
  - Production: Firebase Admin (service account JSON), AdminOnly middleware via custom claim or ADMIN_EMAILS whitelist.
  - Local Dev: DevAuth (email/password) issuing a bearer token for admin endpoints.
- Frontends:
  - iOS: SwiftUI.
  - Web CMS: Vite + React + TypeScript.
- Containerization: Docker Compose (Postgres, Backend, optional Web CMS/Preview, pgAdmin).
- Tooling: curl, jq, yq (for scripting), migrate CLI (optional), psql via docker exec/run.

Environment & Configuration
- Backend entrypoints:
  - backend/cmd/api/main.go (recommended runtime entry; production policy).
  - backend/main.go (alt entry; ensure consistency with production policy).
- Environment variables:
  - Database:
    - DATABASE_URL=postgres://imageai:…@host:5432/imageai_db?sslmode=disable (host-run)
    - Or granular: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (Dockerized backend).
  - TEMPLATE_SOURCE=db to use Postgres (fallbacks to files for certain read-paths if not set).
  - Firebase:
    - FIREBASE_SERVICE_ACCOUNT (path to service account JSON).
    - ADMIN_EMAILS (comma-separated emails for admin whitelist).
  - Dev Auth (local only):
    - DEV_AUTH_ENABLED=1
    - DEV_ADMIN_EMAIL=admin@example.com
    - DEV_ADMIN_PASSWORD=admin123
  - CORS (if used): CORS_ALLOWED_ORIGINS, CORS_ALLOWED_HEADERS, CORS_ALLOWED_METHODS.
  - Assets:
    - ASSETS_DIR, ASSETS_BASE_URL (used for storing template assets).
- Ports:
  - Backend container: 8080 (exposed).
  - Host-run backend (dev): typically 8081 (to avoid 8080 conflict).
  - Postgres container: 5432 exposed to host.

Local Development Setup
- Recommended E2E path (stable):
  1) docker compose up -d db backend
  2) Obtain DevAuth token:
     POST http://localhost:8080/v1/dev/login with body {"email":"admin@example.com","password":"admin123"}
     Use Authorization: Bearer <token> for subsequent admin requests.
  3) Run tests via .box-testing scripts:
     - sh .box-testing/scripts/test_create_template.sh
     - sh .box-testing/scripts/test_upload_template_asset.sh
     Ensure .box-testing/sandbox/env.yaml contains:
     - apiBaseUrl: http://localhost:8080
     - idToken: Bearer <dev_token>
- Optional host-run backend:
  - go run cmd/api/main.go with PORT=8081
  - Connect to DB container on host port 5432 using IPv4 DSN:
    DATABASE_URL=postgres://imageai:imageai_pass@127.0.0.1:5432/imageai_db?sslmode=disable
  - See Troubleshooting for DB auth issues.

Database & Migrations
- Schema is defined in backend/migrations:
  - 0004_create_templates_and_versions.up.sql
  - 0005_create_template_taxonomy_and_assets.up.sql
  - 0006_add_usage_count.up.sql
- Migrate methods:
  - Preferred in-container psql (robust across systems):
    cat 0004 0005 0006 | docker exec -i imageaiwrapper-db psql -U imageai -d imageai_db -v ON_ERROR_STOP=1
  - Makefile uses migrate CLI against host port (requires local psql/migrate installed and DB auth working).
- Default credentials (Docker):
  - POSTGRES_USER=imageai
  - POSTGRES_PASSWORD=imageai_pass
  - POSTGRES_DB=imageai_db
  - pg_hba.conf defaults include host all all all scram-sha-256 + trust for local 127.0.0.1/::1 inside container.

Auth Patterns
- Firebase Admin:
  - AuthMiddleware verifies ID token, AdminOnly checks claim or ADMIN_EMAILS whitelist.
  - Production policy requires FIREBASE_SERVICE_ACCOUNT and no insecure fallbacks.
- DevAuth (local only):
  - /v1/dev/login issues a bearer token stored in-memory (devTokens).
  - DevAuthMiddleware validates bearer tokens for admin endpoints when enabled.
  - Do not enable in production.

Observability & Debugging (dev)
- internal/api/middleware.go: RequestID, logging (status, duration, body snippet for errors).
- Temporary dev logging added:
  - internal/api/admin_templates.go: include cause in error envelope for create failures (remove/guard before prod).
  - internal/database/postgres.go: log DSN (password masked) & ping errors (keep masked; guard before prod).

Dependencies & Versions
- Go Modules: backend/go.mod (pgx v5 driver via stdlib, joho/godotenv).
- Docker images:
  - postgres:15
  - dpage/pgadmin4 (optional)
  - node:20-alpine (for Web CMS dev & preview)
  - backend runtime: scratch (static binary built to build/imageai-backend)
- Frontend package manager: pnpm for Web CMS.

Testing
- Backend:
  - Unit/integration: go test ./... (see .clinerules/RUN_TESTS.md & .documents/workflows/run-tests.md).
- iOS:
  - Xcode (⌘U) or xcodebuild with -parallel-testing-enabled NO.
- Web CMS:
  - pnpm vitest
- E2E (admin):
  - Preferred via Docker backend + DevAuth using .box-testing scripts.
  - See .documents/workflows/run-tests.md → Admin API E2E (Docker + DevAuth).

Constraints & Notes
- Public template listing does not expose prompts; prompts live in server-side template_versions.
- Publish requires thumbnail to be present (validation enforced).
- Assets are persisted under ASSETS_DIR with BASE_URL mapping; ensure mount present in docker-compose.
- Keep any debug-only logging out of production builds/deployments (security & noise considerations).
