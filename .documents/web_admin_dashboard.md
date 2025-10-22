# Web Admin – Templates Dashboard (CRUD + Assets Upload)

Last updated: 2025-10-22

Purpose
- Define UX, components, and data contracts for the admin dashboard focusing on Templates CRUD.
- Phase 2 enhancement: Image assets upload (thumbnail/preview) is supported in BOTH Create and Edit flows. Cover can be added later.

References
- .documents/web_admin.md
- .implementation_plan/templates-crud-plan.md
- swagger/openapi.yaml (updated with /v1/admin/templates/{slug}/assets endpoints)
- .documents/api_specification.md (keep in sync with Swagger)

Overview
- Default landing after sign-in (Firebase or DevAuth in development).
- Centered on Templates management: create, read, update, delete; publish/unpublish; archive (future).
- Uses server-driven filtering/sorting/pagination. Envelope response pattern maintained.

Layout
- Sidebar: Dashboard (Templates), Users (future), Tags/Categories (future), Settings (future)
- Top bar: Global search (future), + New Template, user avatar (sign-out)
- Main content: Templates List with filters and bulk actions; Create/Edit via Drawer

Filters and Sorting
- q: string (search by name/slug)
- tags: CSV (e.g., “anime,portrait”)
- status: draft|published|archived
- visibility: public|private
- sort: updated|newest|popular|name
- Pagination: limit, offset

Table Columns
- [ ] (Row select for bulk actions)
- Thumb (rounded 48x48, from `thumbnail_url`)
- Slug
- Name
- Status (draft/published/archived)
- Visibility (public/private)
- Published At (relative)
- Updated At (relative)
- Usage Count (compact)
- Tags

Actions
- Row actions:
  - Edit (opens TemplateFormDrawer)
  - Delete (ConfirmDialog)
- Bulk actions:
  - Publish / Unpublish
  - Delete (ConfirmDialog)
- Create:
  - + New Template (opens TemplateFormDrawer)

Create/Edit Drawer (RHF + zod)
- Common fields:
  - Slug (create only), Name, Description, Status, Visibility, Tags (CSV)
  - Thumbnail URL (optional URL field)
- Upload (Phase 2) — available in BOTH Create and Edit:
  - Buttons:
    - Upload Thumbnail (multipart/form-data)
    - Upload Preview (multipart/form-data)
  - Behavior in Create:
    - If no template exists yet, system auto-creates a draft using current Slug/Name/Status/Visibility/Tags to obtain a `slug` required by the upload endpoint.
    - After draft creation, uploads proceed to /assets endpoints.
    - If uploaded kind is thumbnail, the form auto-fills `thumbnail_url` with the returned URL and shows a live preview.
  - Behavior in Edit:
    - Upload actions work directly for the existing slug.
    - Preview Gallery:
      - Displays preview images (kind=preview)
      - Actions: Make Thumbnail (promote preview to thumbnail), Delete preview
      - (Reorder will be handled in a future iteration)
- Validation:
  - name: required
  - slug: required (create), regex ^[a-z0-9-]+$
  - thumbnail_url: optional URL (backend enforces thumbnail for publish)
  - status, visibility: required

Assets Model & API
- DB tables:
  - `template_assets(id, template_id, kind, url, sort_order, created_at)`
  - kind ∈ {thumbnail, preview} (cover reserved for later)
- Endpoints (see swagger/openapi.yaml):
  - GET /v1/admin/templates/{slug}/assets → list assets
  - POST /v1/admin/templates/{slug}/assets (multipart):
    - fields: file (png|jpeg, ≤ ~12MB), kind ∈ thumbnail|preview
  - PUT /v1/admin/templates/{slug}/assets/{id}:
    - body: { kind?: thumbnail|preview, sort_order?: number }
    - If kind=thumbnail → enforce uniqueness (previous thumbnail becomes preview)
  - DELETE /v1/admin/templates/{slug}/assets/{id}
- Static files:
  - Served under /assets (Docker mounts `../backend/assets:/assets`)
  - Public URLs look like /assets/templates/{slug}/{filename}

Admin API (CRUD)
- GET /v1/admin/templates (filters: q, tags, status, visibility, sort, limit, offset)
- GET /v1/admin/templates/{slug}
- POST /v1/admin/templates
- PUT /v1/admin/templates/{slug}
- DELETE /v1/admin/templates/{slug}
- POST /v1/admin/templates/{slug}/publish → requires existing `thumbnail` asset (backend returns 422 if missing)
- POST /v1/admin/templates/{slug}/unpublish
- Security: Firebase Admin verification middleware (prod) or DevAuth (dev). Endpoints follow the envelope format.

Envelope
- All responses follow:
  {
    success: boolean,
    data?: T,
    error?: { code?: string, message?: string, details?: object },
    meta?: { requestId?: string, timestamp?: string, total?: number, hasMore?: boolean, nextOffset?: number }
  }

UX Notes
- Create flow with uploads:
  1) User types Slug/Name
  2) Click Upload Thumbnail/Preview → system auto-creates draft if needed
  3) Upload proceeds; if thumbnail uploaded, field `thumbnail_url` is updated and preview shown
  4) Submit ‘Create’ finalizes record
- Edit flow:
  - Manage uploads & preview gallery; can Make Thumbnail and Delete.
- Publish requires a thumbnail. Backend returns 422 with fields=["thumbnail_url"] if missing.

Acceptance Criteria
- Create/Edit/Delete and Publish/Unpublish implemented with validation and user feedback.
- List view shows `thumbnail_url` correctly (Thumb column).
- Create Drawer supports file uploads (multipart) via auto draft creation.
- Edit Drawer supports uploads + gallery + Make Thumbnail + Delete.
- Admin-only endpoints secured; envelope pattern maintained; swagger updated.
- Tests pass for critical CRUD and authz handling.
