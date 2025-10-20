# Technology & Tooling

_This file documents the technologies used, development setup, technical constraints, dependencies, and tool usage patterns._

## Technologies Used
- Frontend (iOS):
  - Swift, SwiftUI, MVVM, async/await, @Observable ViewModels, MainActor where appropriate
  - Protocol-driven: APIClientProtocol, repository pattern for testability
  - Firebase SDK (Google/Apple login, ID token)
  - Unit tests for ViewModels and business logic (XCTest); UI tests for critical flows
- Backend (Go):
  - Go >= 1.25 (Docker toolchain uses golang:1.25-alpine to satisfy go.mod >= 1.25.2)
  - Firebase Admin SDK (todo: verify ID tokens server-side)
  - PostgreSQL for persistence (user_profiles)
  - golang-migrate for schema migrations
  - pgx stdlib driver for database/sql connectivity
  - Simple file storage for images under backend/ and backend/processed/
- AI:
  - Google Gemini (manual HTTP integration planned/partial for image processing)

## Development Setup
- iOS:
  1) Open `AIPhotoApp/AIPhotoApp.xcodeproj` in Xcode.
  2) Select simulator (e.g., iPhone 17) and Run.
  3) Ensure `AppConfig.backendBaseURL` points to the backend (http://localhost:8080 for Simulator).
  4) API requests use APIClient with detailed logging; logs appear in Xcode console.

- Backend (local without Docker):
  1) Install Go >= 1.25.
  2) Set required env vars (see “Environment Variables”).
  3) Run the correct entrypoint:
     - `cd backend && go run ./cmd/api/main.go`
     - or build: `cd backend && go build -o app ./cmd/api/main.go && ./app`
     Note: Do not run a stray `main.go` at backend root; use `./cmd/api/main.go`.
  4) PostgreSQL must be available; run migrations before starting features that depend on schema (see “Migrations”).

- Backend (Docker + Docker Compose):
  1) Start Postgres:
     - `cd docker && docker compose up -d db`
  2) Apply migrations using containerized golang-migrate (recommended for local):
     - `docker run --rm -v "$(pwd)/backend/migrations:/migrations" --network container:imageaiwrapper-db migrate/migrate:latest -path=/migrations -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable" up`
  3) Build/Run backend:
     - `cd docker && docker compose up -d --build backend`
  4) Verify backend logs:
     - `docker logs --tail 200 imageaiwrapper-backend`
  5) Verify DB:
     - `docker exec -e PGPASSWORD=imageai_pass -it imageaiwrapper-db psql -U imageai -d imageai_db -c "SELECT id,email,name,avatar_url,created_at,updated_at FROM user_profiles ORDER BY id DESC LIMIT 10;"`

## Environment Variables
- Backend (read by app or Docker Compose):
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE` (defaults: db, 5432, imageai, imageai_pass, imageai_db, disable)
  - `DATABASE_URL` (optional) overrides individual DB_* vars, e.g. `postgres://user:pass@host:5432/db?sslmode=disable`
  - `PORT` (default 8080)
  - `FIREBASE_SERVICE_ACCOUNT` (required in production; not enforced in current local stub)
  - `GEMINI_API_KEY` (if integrating Gemini in backend)
- Docker Compose sets DB env for backend service:
  - See `docker/docker-compose.yml` for DB container and backend environment.

## Migrations
- Files live in `backend/migrations/` and follow `*.up.sql` naming.
- Local host vs container:
  - Preferred (local dev): run golang-migrate in a container sharing the DB container network namespace:
    ```
    docker run --rm -v "$(pwd)/backend/migrations:/migrations" \
      --network container:imageaiwrapper-db \
      migrate/migrate:latest \
      -path=/migrations \
      -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable" up
    ```
  - Makefile target (host) uses `localhost` but may fail due to auth/SCRAM; use the containerized approach above for reliability.
- Example:
  - 0001_create_users_table.up.sql (legacy, auth-oriented)
  - 0002_create_user_profiles_table.up.sql (current profile storage used by `/v1/users/register`)
- Creating a migration:
  - `migrate create -ext sql -dir backend/migrations -seq create_<name>`

## Dependencies
- iOS:
  - Firebase iOS SDK (Google/Apple login, ID token)
- Backend:
  - `firebase.google.com/go/v4` (Admin SDK) [todo: integrate token verification in register handler]
  - `google.golang.org/api/option` (if using Google APIs)
  - `github.com/jackc/pgx/v5/stdlib` (Postgres driver via database/sql)
  - `github.com/joho/godotenv` (for local env loading, if used)
  - `github.com/golang-migrate/migrate/v4/cmd/migrate` (CLI) or dockerized `migrate/migrate`

## Tool Usage Patterns
- iOS logging:
  - APIClient prints:
    - “➡️ API Request: METHOD URL”
    - Headers (sensitive fields redacted)
    - Request body (pretty JSON)
    - “⬅️ API Response: STATUS METHOD URL (xx.x ms)”
    - Response headers (redacted sensitive)
    - Response body (pretty JSON)
  - Toggle logging:
    - `var client = APIClient(); client.logger.enabled = true/false` (enabled by default in DEBUG)
- Backend run (Docker):
  - `cd docker && docker compose up -d db`
  - Apply migrations (containerized)
  - `cd docker && docker compose up -d --build backend`
- Integration check (register user):
  - `curl -X POST http://localhost:8080/v1/users/register -H "Authorization: Bearer <token-or-stub>" -H "Content-Type: application/json" -d '{"name":"Full Name","email":"user@example.com","avatar_url":""}'`
  - Verify DB row exists in `user_profiles`.

## Technical Constraints
- iOS-only client.
- Authentication is via Firebase Auth; backend does not implement classic login.
- `/v1/users/register` is for storing/updating user profile, not for authentication.
- Postgres is the source of truth for profile persistence; images persisted to disk for dev.
- Keep Go toolchain >= 1.25 to satisfy go.mod and Dockerfile.
- Future:
  - Implement Firebase ID token verification server-side in register handler.
  - Consider consolidating earlier `users` table with `user_profiles` or keep separated (auth vs profile) and document in OpenAPI.

## Reference Commands (Quick Runbook)
- Start DB: `cd docker && docker compose up -d db`
- Migrate: see “Migrations” (containerized migrate command)
- Rebuild backend: `cd docker && docker compose up -d --build backend`
- Verify DB: psql SELECT from `user_profiles`
- From iOS simulator, test Google/Apple login → app will auto-call register → check Xcode console logs and DB row.
