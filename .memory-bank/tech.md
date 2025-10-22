# Tech

Technologies, development setup, constraints, dependencies, and tool usage patterns.

Last updated: 2025-10-22

## Stacks and Frameworks

- iOS
  - Language/Runtime: Swift, SwiftUI (Observation framework: `@Observable`)
  - Auth: Firebase Auth (Google/Apple)
  - Storage: Keychain for persisting ID token
  - Networking: URLSession-based APIClient with envelope decoding, 401 retry via token provider
  - Build: Xcode project `AIPhotoApp.xcodeproj`
  - Tests: XCTest (unit/UI)

- Backend
  - Language: Go 1.25+
  - Database: Postgres 15
  - Runtime: Docker Compose (db + backend), static binary (`FROM scratch`)
  - API: REST, envelope response pattern (success/data/error/meta)
  - Auth: Firebase ID token (JWT) via Authorization: Bearer
  - Migrations: SQL files under `backend/migrations` (0001…0006)
  - Documentation: OpenAPI 3.1 at `swagger/openapi.yaml`
  - Tests: `go test ./...`, table-driven tests in `internal/*`

- Web Admin
  - Tooling: Vite + React + TypeScript
  - Routing: React Router
  - Data fetching: TanStack Query
  - HTTP: Axios with interceptors (Bearer injection, 401 refresh & retry-once)
  - UI: Material UI (MUI) (+ icons, emotion)
  - Forms/Validation: React Hook Form + Zod
  - Auth: Firebase Web SDK (Google sign-in) or DevAuth for local dev
  - Tests: Vitest + React Testing Library + MSW
  - Lint/Format: ESLint + Prettier
  - Env: `.env.local` with `VITE_API_BASE_URL` and `VITE_FIREBASE_*`

## API Conventions

- Envelope response
  - success: boolean
  - data: typed payload (e.g., `TemplatesList { templates: Template[] }`)
  - error: `{ code, message, details? }`
  - meta: `{ requestId, timestamp }` (+ optional pagination metadata later)

- Auth
  - Clients attach `Authorization: Bearer <Firebase ID token>`
  - Backend validates token; 401 for invalid/expired tokens
  - Clients (iOS/Web) implement 401 refresh-and-retry logic (single retry)

## Notable Endpoints (current)

Public (iOS)
- GET `/v1/templates`
  - Query params: `limit`, `offset`, `q`, `tags` (CSV), `sort` (newest|popular|name)
  - Fields in Template: `id`, `name`, `thumbnail_url?`, `published_at?`, `usage_count?`
- POST `/v1/users/register`
- POST `/v1/images/process`

Admin (Web)
- Templates CRUD:
  - GET `/v1/admin/templates`
  - GET `/v1/admin/templates/{slug}`
  - POST `/v1/admin/templates`
  - PUT `/v1/admin/templates/{slug}`
  - DELETE `/v1/admin/templates/{slug}`
  - POST `/v1/admin/templates/{slug}/publish`
  - POST `/v1/admin/templates/{slug}/unpublish`
- Assets:
  - GET `/v1/admin/templates/{slug}/assets`
  - POST `/v1/admin/templates/{slug}/assets` (multipart; `file`=png|jpeg; `kind`=thumbnail|preview)
  - PUT `/v1/admin/templates/{slug}/assets/{id}` (change `kind`/`sort_order`; enforce single thumbnail)
  - DELETE `/v1/admin/templates/{slug}/assets/{id}`
- Static:
  - `/assets/templates/{slug}/{filename}` (public URLs served by backend)

See `swagger/openapi.yaml` for the authoritative spec and examples.

## Database and Migrations

- Postgres 15
- Migrations:
  - 0004: templates/versioning
  - 0005: tags/categories/assets (`template_assets`)
  - 0006: `usage_count` on templates
- Listing joins `template_assets (kind='thumbnail')`, applies filters (q/tags) and sort.
- Assets table stores `id`, `template_id`, `kind ('thumbnail'|'preview')`, `url`, `sort_order`, `created_at`.

## Development Setup

- Backend
  - Run with Docker Compose (db + backend)
  - Serve static:
    - `/processed/*` from `/processed`
    - `/assets/*` from `/assets` (uploads)
  - Env:
    - `FIREBASE_SERVICE_ACCOUNT=/secrets/firebase-admin.json` (prod)
    - `ALLOW_INSECURE_ADMIN=1` (dev fallback; DO NOT USE IN PROD)
    - `DEV_AUTH_ENABLED=1`, `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD` (DevAuth for local)
    - `CORS_ALLOWED_ORIGINS=http://localhost:5173`
    - `CORS_ALLOWED_HEADERS=Authorization,Content-Type`
    - `ASSETS_DIR=/assets`
    - `ASSETS_BASE_URL=/assets`
  - Volumes (docker):
    - `../backend/assets:/assets`
    - `../backend/processed:/processed`
  - Build (local binary for runtime image):
    ```
    cd backend
    GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o build/imageai-backend ./cmd/api
    ```
  - Tests:
    - `cd backend && go test ./...`
    - Coverage: `go test -cover ./...`

- Web Admin
  - Dev server: Vite `http://localhost:5173`
  - Env `.env.local`:
    ```
    VITE_API_BASE_URL=http://localhost:8080
    VITE_DEV_AUTH=1
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_APP_ID=...
    ```
  - Upload flows:
    - Create Drawer: Upload Thumbnail/Preview available; first upload auto-creates a draft (using current Slug/Name/Status/Visibility/Tags) then uploads; thumbnail upload auto-sets `thumbnail_url`.
    - Edit Drawer: Upload Thumbnail/Preview; Preview Gallery with Make Thumbnail, Delete.
  - Testing:
    - `pnpm vitest`
    - MSW handlers for admin endpoints + assets
    - RTL for CRUD and upload behaviors

- iOS
  - Open `AIPhotoApp/AIPhotoApp.xcodeproj`
  - Tests (see `.clinerules/RUN_TESTS.md`):
    ```
    cd app_ios
    xcodebuild test \
      -scheme imageaiwrapper \
      -destination 'platform=iOS Simulator,name=iPhone 17' \
      -parallel-testing-enabled NO | xcpretty
    ```

## Constraints and Policies

- Documentation-driven development
  - `.documents` is the source of truth; Swagger must match behavior
- Plan-driven implementation
  - Each feature has a plan under `.implementation_plan/` with checklist
- TDD
  - Write failing tests before implementation or alongside; mock external services in CI
- Security and CORS
  - Firebase JWT verification on backend (prod); DevAuth only for local dev
  - CORS: allow `http://localhost:5173` with `Authorization, Content-Type`
  - iOS ATS exceptions for `http://localhost` during development only

## Tooling and Commands (reference)

- Go
  - `go mod tidy`
  - `go test ./...`
  - `go build ./cmd/api`
- Docker
  - `docker compose up -d`
  - `docker compose build --no-cache`
  - Logs: `docker compose logs --tail=100 backend|web`
- Node (web admin)
  - Package manager: `pnpm`
  - Test: `pnpm vitest`

## Observability and Logging

- Include `meta.requestId` in logs for correlation
- Prefer structured JSON logs in backend
- Consider OpenTelemetry for tracing/metrics later

## Known Gaps / Next Steps

- Backend:
  - Extend tests for assets endpoints + publish validation
  - Consider pagination metadata in `meta`
  - Production storage: switch `/assets` to S3/CDN; keep `ASSETS_BASE_URL` abstraction

- Web Admin:
  - Expand tests for create-draft-on-first-upload, gallery actions, and publish error states
  - Add drag/drop reorder for previews (update `sort_order`)
