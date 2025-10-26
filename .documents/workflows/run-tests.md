# Run Tests (Local)

Status: Stable  
Updated: 2025-10-26  
Owner: @anhtu

## Test Coverage Summary

| Platform | Tests | Status |
|----------|-------|--------|
| Backend Unit | 23 | ✅ 100% |
| Backend E2E | 15 | ✅ 100% |
| iOS Unit | 47 | ✅ 100% |
| **Total** | **85** | **✅ 100%** |

---

## Backend (NestJS + Jest + Supertest)

### Unit Tests (23 passing)
```bash
cd server
yarn test templates.service.spec.ts
```

### E2E Tests (15 passing)
```bash
cd server
yarn test:e2e templates.e2e-spec.ts
```

### Run All Tests
```bash
cd server
yarn test
yarn test:e2e
```

### Coverage
```bash
cd server
yarn test:cov
```

**Test Files:**
- `server/src/templates/templates.service.spec.ts` - 23 unit tests with mocked Prisma
- `server/test/templates.e2e-spec.ts` - 15 e2e tests with DevAuth

---

## iOS (Swift Testing + XCTest)

### Unit Tests (47 passing)

**Recommended: Build and run tests**
```bash
cd AIPhotoApp

xcodebuild test \
  -scheme AIPhotoApp \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -only-testing:AIPhotoAppTests \
  -parallel-testing-enabled NO \
  2>&1 | xcpretty --color --test
```

**Faster: Build once, run multiple times**
```bash
cd AIPhotoApp

# Build once
xcodebuild build-for-testing \
  -scheme AIPhotoApp \
  -destination 'platform=iOS Simulator,name=iPhone 17'

# Run tests (repeatable)
xcodebuild test-without-building \
  -scheme AIPhotoApp \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -only-testing:AIPhotoAppTests \
  -parallel-testing-enabled NO \
  2>&1 | xcpretty --color --test
```

**Xcode GUI**
- Open `AIPhotoApp.xcodeproj`
- Press **⌘U** to run all tests
- Or right-click test class → "Run Tests"

**Important Flags:**
- `-parallel-testing-enabled NO` - **Required** for deterministic async tests
- `xcpretty --color --test` - Clean formatted output
- `-only-testing:AIPhotoAppTests` - Run only unit tests (not UI tests)

**Test Files:**
- `AIPhotoAppTests/TemplateDTOsTests.swift` - 20 tests for DTO decoding, computed properties
- `AIPhotoAppTests/HomeViewModelTests.swift` - 27 tests for ViewModel logic, API integration

**Notes:**
- Async tests require 100ms sleep for Task completion
- Use MockTemplatesRepository conforming to TemplatesRepositoryProtocol
- Tests run on iOS Simulator (iPhone 17)

---

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
