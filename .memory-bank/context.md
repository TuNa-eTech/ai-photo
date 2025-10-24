# Context

Last updated: 2025-10-24

Current work focus
- Diagnose and fix 500 on POST /v1/admin/templates during E2E tests.
- Stabilize local E2E by running backend in Docker with DevAuth and Postgres in the same Docker network.

Recent changes
- Identified root cause: host-run backend (go run on :8081) failed SASL auth to Dockerized Postgres on 5432, causing “FATAL: password authentication failed for user 'imageai'”.
- Verified DB schema and credentials inside container; applied migrations (0004–0006) via psql inside container successfully.
- Added temporary debug logging:
  - internal/api/admin_templates.go: include error cause in dev responses to aid debugging.
  - internal/database/postgres.go: log DSN (password masked) and ping errors.
- Switched E2E tests to containerized backend (:8080) which connects to DB internally via env (DB_HOST=db, DB_PASSWORD=imageai_pass).
- Enabled and used DevAuth in container backend:
  - POST /v1/dev/login → token injected into .box-testing/sandbox/env.yaml.
  - Updated apiBaseUrl to http://localhost:8080.
- Confirmed success:
  - Create template: 201 Created.
  - Upload thumbnail asset: 201 Created.

Decisions
- Prefer Dockerized backend for local E2E to avoid host→container Postgres auth issues.
- Keep debug logging only for local development; remove or guard with build tags/env before production.

Next steps
- Optional: Revisit host-run backend connectivity (go run :8081) to DB container:
  - Ensure IPv4 DSN: postgres://imageai:imageai_pass@127.0.0.1:5432/imageai_db?sslmode=disable
  - Reset role password inside container if needed.
  - Verify host connectivity via `docker run --rm -e PGPASSWORD=imageai_pass postgres:15 psql -h host.docker.internal -U imageai -d imageai_db -c "\dt"`.
  - If instability persists, continue using Docker backend for E2E.
- Remove/guard debug error details before release.
- Proceed with publish flow (requires thumbnail) and complete admin asset use cases.

References
- .documents/workflows/run-tests.md → “Admin API E2E (Docker + DevAuth)” updated with instructions and troubleshooting.
- backend/internal/api/admin_templates.go, backend/internal/database/postgres.go (temporary debug logs).
