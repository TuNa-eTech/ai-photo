# Tasks

Documentation of repetitive tasks and their workflows. Keep entries concise, actionable, and updated with dates.

Last updated: 2025-10-22

## Web Admin Phase 1 (Scaffold + Auth + List + Detail)
Last performed: 2025-10-21

Files to modify/create:
- /web_admin/** (scaffolded Vite React TS app)
- /.implementation_plan/web-admin-plan.md (status checklist)
- /.documents/web_admin.md (admin scope/spec)
- /.documents/api_specification.md (references swagger and envelope)
- /.documents/project_architecture.md (system overview)
- /.documents/ui_ux_design.md (iOS Liquid Glass + Admin list UX)

Steps:
1. Scaffold project
   - pnpm create vite@latest web_admin -- --template react-ts
   - cd web_admin
   - pnpm add react-router-dom @tanstack/react-query axios @mui/material @mui/icons-material @emotion/react @emotion/styled firebase
   - pnpm add -D typescript eslint prettier vitest @testing-library/react @testing-library/user-event jsdom msw @types/node @types/react @types/react-dom
2. Configure lint/test
   - Add ESLint/Prettier configs
   - Add vitest config (jsdom), setup-tests.ts, MSW handlers
3. Auth
   - src/auth/firebase.ts (initializeApp/getAuth)
   - src/auth/useAuth.ts (auth state + idToken retrieval)
   - src/auth/ProtectedRoute.tsx
4. API client
   - src/api/client.ts (Axios, Bearer injection, 401 refresh, envelope unwrap)
   - src/types/envelope.ts and src/types/template.ts (from swagger/openapi.yaml)
   - src/api/templates.ts (getTemplates(params))
5. Routing
   - src/router/routes.tsx (protected routes /templates, /templates/:id, /login)
6. Pages and components
   - src/pages/Login.tsx (Google sign-in)
   - src/pages/Templates/TemplatesList.tsx (filters q/tags/sort, table, pagination limit/offset)
   - src/pages/Templates/TemplateDetail.tsx (read-only)
   - src/components/DataTable.tsx (generic table)
   - src/components/Filters/TemplatesFilters.tsx
7. CORS
   - Ensure backend allows http://localhost:5173 and Authorization header
8. Tests
   - MSW handler for GET /v1/templates (EnvelopeTemplatesList)
   - RTL tests for TemplatesList and ProtectedRoute
9. Docs
   - Update .implementation_plan/web-admin-plan.md progress
   - Keep .documents files synchronized

Important considerations / gotchas:
- Debounce search (q) before refetch; maintain limit/offset on param changes
- tags passed as CSV; keep consistent encoding
- Single 401 refresh-and-retry via Firebase SDK, avoid infinite loops
- Envelope: check success and data presence; throw with error.message on APIError
- Accessibility: ensure focus and keyboard nav for MUI table and filters
- Do not commit .env.local (contains Firebase keys); provide .env.local.example instead

Example snippet (Axios envelope unwrap):
```ts
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getTemplates(params: GetTemplatesParams) {
  const res = await api.get('/v1/templates', { params });
  const env = res.data as Envelope<TemplatesList>;
  if (!env.success || !env.data) throw new Error(env.error?.message ?? 'API error');
  return env.data.templates;
}
```

---

## Templates CRUD + Assets Upload (Create + Edit)
Last performed: 2025-10-22

Files to modify/create (key):
- Backend
  - `backend/internal/models/models.go` (TemplateAdmin, TemplateAssetAdmin, DTOs)
  - `backend/internal/database/admin_templates.go` (CRUD + publish guard)
  - `backend/internal/database/admin_assets.go` (list/insert/update/delete)
  - `backend/internal/api/admin_templates.go` (handlers; route to assets subpaths)
  - `backend/internal/api/admin_assets.go` (multipart upload, list, update, delete)
  - `backend/internal/storage/storage.go` (AssetsDir/BaseURL/SaveTemplateAssetFile)
  - `backend/cmd/api/main.go` (static `/assets` serving)
  - `docker/docker-compose.yml` (ASSETS_DIR=/assets, ASSETS_BASE_URL=/assets; mount `../backend/assets:/assets`)
  - `swagger/openapi.yaml` (assets paths + schemas; CRUD already present)
- Frontend
  - `web_admin/src/types/admin.ts` (TemplateAdmin, Create/Update DTOs, TemplateAssetAdmin)
  - `web_admin/src/api/admin/templates.ts` (CRUD + assets API + hooks)
  - `web_admin/src/pages/Admin/AdminTemplates.tsx` (Thumb column, actions)
  - `web_admin/src/pages/Admin/TemplateFormDrawer.tsx` (Create+Edit with uploads)
- Docs
  - `.documents/web_admin_dashboard.md` (updated)
  - `.implementation_plan/templates-crud-plan.md` (updated)

Workflow (step-by-step):
1. Backend prepare
   - Add models for `TemplateAssetAdmin`
   - Implement DB operations: `ListTemplateAssets`, `InsertTemplateAsset`, `UpdateTemplateAsset` (demote others on thumbnail), `DeleteTemplateAsset`
   - Implement HTTP handlers:
     - GET `/v1/admin/templates/{slug}/assets`
     - POST `/v1/admin/templates/{slug}/assets` (multipart: `file` png/jpeg ≤ ~12MB, `kind` in thumbnail|preview)
     - PUT `/v1/admin/templates/{slug}/assets/{id}` (update kind/sort; ensure single thumbnail)
     - DELETE `/v1/admin/templates/{slug}/assets/{id}`
   - Serve static `/assets/*` and mount volume
   - Ensure publish guard requires existing thumbnail → 422 `validation_error` with fields ["thumbnail_url"]
2. Swagger update
   - Add assets endpoints + `TemplateAssetAdmin`, `EnvelopeTemplateAsset(s)` schemas
3. Frontend CRUD API + UI
   - CRUD functions + hooks for templates
   - Assets functions + hooks: list/upload/update/delete
   - Admin list table shows 48x48 Thumb via `thumbnail_url`
4. Create Drawer uploads
   - Provide “Upload Thumbnail/Preview” in Create
   - On first upload, auto-create draft template using current Slug/Name/Status/Visibility/Tags to obtain `slug`
   - Upload file; if thumbnail, update `thumbnail_url` in form and preview
   - Submit “Create” to finalize
5. Edit Drawer uploads
   - Provide “Upload Thumbnail/Preview”
   - Preview Gallery lists preview assets; actions: “Make Thumbnail”, “Delete”
6. Docker dev
   - `docker compose up -d` for db/backend/web
   - Rebuild backend: build static binary → compose build → up
7. Verification (curl quick tests)
   ```bash
   # Login dev
   TOKEN=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"admin123"}' http://localhost:8080/v1/dev/login | jq -r '.data.token')

   # Create template
   SLUG=demo-$(date +%s)
   curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -d "{\"slug\":\"$SLUG\",\"name\":\"Demo\",\"status\":\"draft\",\"visibility\":\"public\"}" \
     http://localhost:8080/v1/admin/templates | jq '.'

   # Upload preview
   curl -s -H "Authorization: Bearer $TOKEN" -F kind=preview -F file=@backend/processed/processed_test_img.png \
     http://localhost:8080/v1/admin/templates/$SLUG/assets | jq '.'

   # Promote to thumbnail
   AID=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/v1/admin/templates/$SLUG/assets | jq -r '.data[] | select(.kind=="preview") | .id' | head -n1)
   curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -X PUT -d '{"kind":"thumbnail"}' http://localhost:8080/v1/admin/templates/$SLUG/assets/$AID | jq '.'

   # Publish
   curl -s -H "Authorization: Bearer $TOKEN" -X POST http://localhost:8080/v1/admin/templates/$SLUG/publish | jq '.'
   ```
Important notes / gotchas:
- Create upload requires `slug`; handle by auto-draft creation on first upload.
- Enforce single thumbnail by demoting others to preview during promote.
- For production, replace local `/assets` with S3/CDN; keep `ASSETS_BASE_URL` abstraction.
- CORS: ensure `http://localhost:5173` and headers `Authorization,Content-Type` allowed.
- DevAuth is for local only; use Firebase Admin verification in production.

Follow-up testing (to add):
- MSW/RTL tests for create-draft-on-first-upload, gallery actions (promote/delete), and publish validation error (422).
- Backend table-driven tests for content type, payload size, and promote uniqueness.
