# Plan: Firebase ID Token Verification + Users Schema Unification

Status Checklist
- [x] Implement conditional Firebase Admin verification middleware (code)
- [x] Prefer verified email from token in RegisterUserHandler (code)
- [ ] Configure FIREBASE_SERVICE_ACCOUNT and mount in Docker
- [ ] Validate end-to-end with real ID token from iOS app
- [ ] Decide schema strategy: keep separate vs unify
- [ ] If unify: write and apply migration 0003
- [ ] Update OpenAPI and docs to reflect final schema
- [ ] Add integration tests for register and DB persistence

Scope
- Enforce verification of Firebase ID tokens using Firebase Admin SDK (server-side).
- Consider unifying legacy users (0001) and user_profiles (0002) into a single canonical users table to avoid duplication and confusion.

Current State (DONE in code)
- Firebase Admin middleware available and wired conditionally:
  - File: backend/cmd/api/main.go
  - If env FIREBASE_SERVICE_ACCOUNT is present, /v1/users/register uses fa.AuthMiddleware
- Handler prefers verified email from token:
  - File: backend/internal/api/handlers.go
  - Uses verified claims email if present, otherwise request body email
- Profile persistence:
  - File: backend/internal/database/postgres.go (UpsertUserProfile)
  - Table: user_profiles (from migration 0002)
- Docker Go toolchain upgraded to Go 1.25 (to satisfy go.mod >= 1.25.2)

Part A — Enable Firebase Admin Verification (Ops)
1) Prepare Service Account
- Obtain Firebase service account JSON (Firebase Console → Project settings → Service accounts → Generate new private key).
- Save on host, e.g.: /abs/path/to/firebase-service-account.json

2) Update docker-compose.yml (backend service)
Add:
  environment:
    FIREBASE_SERVICE_ACCOUNT: /run/secrets/firebase-service-account.json
  volumes:
    - /abs/path/to/firebase-service-account.json:/run/secrets/firebase-service-account.json:ro
Notes:
- Use an absolute path on host. Do not commit the JSON to git.
- On start, main.go will auto-enable the middleware if FIREBASE_SERVICE_ACCOUNT is set.

3) Rebuild/Run
- cd docker && docker compose up -d --build backend
- Verify logs show: "AuthMiddleware enabled for /v1/users/register (Firebase Admin SDK)"

4) Validate end-to-end
- From iOS app, authenticate with Google/Apple → obtain Firebase ID token.
- App calls POST /v1/users/register with Authorization: Bearer <idToken>.
- Expected 401 if token invalid/expired; expected 200 when token valid and body has required fields.

Part B — Schema Strategy: users vs user_profiles
Context
- 0001_create_users_table.up.sql created users(email UNIQUE, password_hash NOT NULL, created_at).
- 0002_create_user_profiles_table.up.sql created user_profiles(email UNIQUE, name NOT NULL, avatar_url, timestamps).
- Current flow with Firebase does not use password_hash. Only profile is needed.
- Options:

Option 1: Keep tables separate (Auth vs Profile)
- Retain users (auth legacy) for potential future password-compatible scenarios.
- Continue using user_profiles for current Firebase-based profile persistence.
Pros: Minimal change, safer. Cons: Duplication/confusion for newcomers.

Option 2: Unify into users (Recommended for Firebase-only projects)
- Make users the canonical table for identities (email unique).
- Add name and avatar_url to users; remove password_hash requirement (or drop column).
- Migrate existing rows from user_profiles → users (insert or update).
- Deprecate user_profiles afterward.

Option 3: Rename user_profiles → users and archive legacy users
- If legacy users is empty or not needed, drop legacy users or rename to users_auth.
- Rename user_profiles to users and ensure columns match desired model.

Proposed Unification Plan (Option 2)
- Create migration 0003_unify_users_table.up.sql (draft SQL below; review before applying):

BEGIN;

-- 1) Ensure users has required columns and relaxed constraints
ALTER TABLE IF EXISTS users
  ALTER COLUMN password_hash DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

-- 2) Merge data from user_profiles into users by email
INSERT INTO users (email, name, avatar_url, created_at, updated_at)
SELECT p.email, p.name, NULLIF(p.avatar_url, ''), COALESCE(p.created_at, NOW()), COALESCE(p.updated_at, NOW())
FROM user_profiles p
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

COMMIT;

-- Optional cleanup (execute in a follow-up migration after verification)
-- DROP TABLE user_profiles;

Notes:
- The above removes NOT NULL on password_hash to avoid violating current Firebase flow; if we don’t use passwords at all, consider dropping the column later.
- Validate the merged schema carefully in staging before dropping user_profiles.

Code Changes After Unification
- Update persistence call in backend to target users instead of user_profiles:
  - Adjust database.UpsertUserProfile to UpsertUser (update SQL to target users).
- Update queries and integration tests accordingly.
- Update docs and OpenAPI to reflect single table.

Test Plan
- Unit/integration tests:
  - Register flow → assert row exists in target table (users if unified).
  - 401 on invalid/expired tokens when FIREBASE_SERVICE_ACCOUNT present.
- Manual DB checks:
  - psql SELECT id,email,name,avatar_url FROM users ORDER BY id DESC LIMIT 10;

Rollout Strategy
- Apply 0003 on staging first; verify data merged correctly.
- Switch backend to write to users; keep user_profiles read-only during cutover.
- After bake time, drop user_profiles in a separate migration.

Backout Plan
- If issues appear: revert backend to user_profiles; rollback 0003 if safe; or re-insert from users to user_profiles (mirror logic).

Appendix — Useful Commands
- Start DB:
  cd docker && docker compose up -d db
- Migrate (containerized):
  docker run --rm -v "$(pwd)/../backend/migrations:/migrations" --network container:imageaiwrapper-db migrate/migrate:latest -path=/migrations -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable" up
- Rebuild backend:
  cd docker && docker compose up -d --build backend
- Verify DB:
  docker exec -e PGPASSWORD=imageai_pass -it imageaiwrapper-db psql -U imageai -d imageai_db -c "SELECT id,email,name,avatar_url,created_at,updated_at FROM user_profiles ORDER BY id DESC LIMIT 10;"
  -- If unified:
  docker exec -e PGPASSWORD=imageai_pass -it imageaiwrapper-db psql -U imageai -d imageai_db -c "SELECT id,email,name,avatar_url,created_at,updated_at FROM users ORDER BY id DESC LIMIT 10;"
