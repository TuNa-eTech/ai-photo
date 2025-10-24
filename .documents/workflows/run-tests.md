# Run Tests (Local)

Status: Stable  
Updated: 2025-10-23  
Owner: @anhtu

Backend (Go)
- Run all unit & integration tests:
  ```
  cd backend
  go test ./...
  ```
- Coverage:
  ```
  go test -cover ./...
  ```

iOS (Swift/SwiftUI)
- Xcode: open `AIPhotoApp/AIPhotoApp.xcodeproj`, select test target, press ⌘U.
- CLI (example):
  ```
  xcodebuild test \
    -project AIPhotoApp/AIPhotoApp.xcodeproj \
    -scheme AIPhotoApp \
    -destination "platform=iOS Simulator,name=iPhone 17" \
    -parallel-testing-enabled NO | xcpretty
  ```
Notes:
- Run sequentially (no parallel) to avoid memory issues.
- Use `-only-testing:<Target>/<TestClass>` to run a specific test class.

Web CMS (Vite + React + TS)
- Run:
  ```
  cd web-cms
  pnpm i
  pnpm vitest
  ```

References
- .clinerules/RUN_TESTS.md (additional tips)
- features/template-spec.md (acceptance for Template-related features)

---

Admin API E2E (Docker + DevAuth)
Status: Stable (use Docker backend to avoid host→DB auth mismatch)

1) Start Docker services (Postgres + Backend)
```
cd docker
docker compose up -d db backend
```

2) Obtain DevAuth token (backend container exposes DevAuth when DEV_AUTH_ENABLED=1)
```
curl -s -X POST http://localhost:8080/v1/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```
Copy `.data.token` from the response.

3) Configure test environment
Edit `.box-testing/sandbox/env.yaml`:
```
apiBaseUrl: http://localhost:8080
idToken: Bearer <DEV_TOKEN_HERE>
```

4) Run admin template tests
- Create template:
  ```
  sh .box-testing/scripts/test_create_template.sh
  ```
  Expected: 201 Created with data.slug matching the generated test slug
- Upload thumbnail asset:
  ```
  sh .box-testing/scripts/test_upload_template_asset.sh
  ```
  Expected: 201 Created with asset id/url

Troubleshooting (DB auth)
- Preferred: use the containerized backend (:8080) which connects internally to DB via env:
  DB_HOST=db, DB_USER=imageai, DB_PASSWORD=imageai_pass, DB_NAME=imageai_db
- If running backend via `go run` on host (:8081) and connecting to container Postgres on 5432:
  - Ensure port mapping exists: `docker ps` shows `0.0.0.0:5432->5432/tcp`
  - Use IPv4 DSN to avoid ::1:  
    `DATABASE_URL=postgres://imageai:imageai_pass@127.0.0.1:5432/imageai_db?sslmode=disable`
  - Reset password inside container if needed:  
    `docker exec -it imageaiwrapper-db psql -U imageai -d imageai_db -c "ALTER USER imageai WITH PASSWORD 'imageai_pass';"`
  - Verify `pg_hba.conf` allows scram (container default has: `host all all all scram-sha-256`)
  - From a clean container, test host connectivity:  
    `docker run --rm -e PGPASSWORD=imageai_pass postgres:15 psql -h host.docker.internal -U imageai -d imageai_db -c "\dt"`
  - If still failing, prefer using the Dockerized backend for local E2E.
