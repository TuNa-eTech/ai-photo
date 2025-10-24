# Troubleshooting: Local DB Authentication (PostgreSQL in Docker)

Status: Stable  
Updated: 2025-10-24  
Owner: @anhtu

Summary
- Symptom: Admin API POST /v1/admin/templates returned 500 with cause “FATAL: password authentication failed for user 'imageai'”.
- Context: Postgres runs in Docker (port 5432 exposed). Backend was run both:
  - Inside Docker (service `backend`, port 8080) → connects via internal hostname `db` → OK.
  - On host via `go run` (port 8081) → connects to 127.0.0.1:5432 → SASL auth failures observed.

Root causes observed
- Host → container DB authentication mismatch or confusion between ::1 vs 127.0.0.1.
- `pg_hba.conf` requires `scram-sha-256` for host connections (default). Password resets must be applied and verified correctly.
- `psql` not installed on host → tests done using `docker run postgres:15 psql` and `docker exec` inside container.

Effective resolution(s)
1) Prefer Dockerized backend for local E2E
   - Backend connects to DB internally using:
     - DB_HOST=db
     - DB_USER=imageai
     - DB_PASSWORD=imageai_pass
     - DB_NAME=imageai_db
   - DevAuth enabled to simplify auth in local env.
   - .box-testing env configured to hit http://localhost:8080.

2) If you must run backend via `go run` on host
   - Use IPv4 DSN to avoid ::1:
     ```
     DATABASE_URL=postgres://imageai:imageai_pass@127.0.0.1:5432/imageai_db?sslmode=disable
     ```
   - Reset password inside container if needed:
     ```
     docker exec -it imageaiwrapper-db psql -U imageai -d imageai_db \
       -c "ALTER USER imageai WITH PASSWORD 'imageai_pass';"
     ```
   - Verify auth method:
     - `pg_hba.conf` contains: `host all all all scram-sha-256`
     - From a clean container, test host connectivity:
       ```
       docker run --rm -e PGPASSWORD=imageai_pass postgres:15 \
         psql -h host.docker.internal -U imageai -d imageai_db -c "\dt"
       ```
   - Ensure port 5432 is mapped:
     - `docker ps` should show `0.0.0.0:5432->5432/tcp`

Verification commands
- Inside DB container:
  ```
  docker exec -e PGPASSWORD=imageai_pass -i imageaiwrapper-db sh -lc \
    'psql -h 127.0.0.1 -U imageai -d imageai_db -c "SELECT current_user, inet_server_addr(), inet_server_port();"'
  ```
- From a fresh container (to simulate host client):
  ```
  docker run --rm -e PGPASSWORD=imageai_pass postgres:15 \
    psql -h host.docker.internal -U imageai -d imageai_db -c "SELECT current_user, current_database();"
  ```

E2E workflow (recommended)
1) Start services:
   ```
   cd docker
   docker compose up -d db backend
   ```
2) Get DevAuth token:
   ```
   curl -s -X POST http://localhost:8080/v1/dev/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123"}'
   ```
3) Update .box-testing/sandbox/env.yaml:
   ```
   apiBaseUrl: http://localhost:8080
   idToken: Bearer <DEV_TOKEN>
   ```
4) Run tests:
   ```
   sh .box-testing/scripts/test_create_template.sh
   sh .box-testing/scripts/test_upload_template_asset.sh
   ```
Expected results: both return 201 Created.

Notes
- Keep error detail logging only in dev. Remove or guard before shipping.
- See .documents/workflows/run-tests.md (Admin API E2E section) for canonical steps.
