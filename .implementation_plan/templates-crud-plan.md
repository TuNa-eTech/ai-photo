# Web Admin – Main Screen (Dashboard) with Templates CRUD (Plan – Updated)

Last updated: 2025-10-22

Owner: PM/Tech Lead  
Scope: Design and implement the main screen for web-admin focused on Templates management (CRUD), including image assets upload (thumbnail/preview) for BOTH Create and Edit. This plan follows documentation-first and plan-driven rules.

References
- .documents/web_admin_dashboard.md (updated with Create+Edit uploads)
- swagger/openapi.yaml (updated with /v1/admin/templates/{slug}/assets)
- .documents/api_specification.md (keep in sync with Swagger)
- .memory-bank/*

---

## Status Checklist

- [x] UX wireframe for Main Screen (dashboard) with Templates focus
- [x] Component hierarchy and routing updates
- [x] Frontend types for Admin (TemplateAdmin, Create/Update DTOs, TemplateAssetAdmin)
- [x] Admin API contracts in swagger (GET/POST/PUT/DELETE /v1/admin/templates; publish/unpublish)
- [x] Backend middleware: DevAuth for dev, CORS; Firebase Admin path ready for prod
- [x] Backend admin endpoints implementation (CRUD + publish/unpublish)
- [x] Frontend admin API module (list, getById, create, update, delete, publish/unpublish)
- [x] Forms: react-hook-form + zod validation schemas
- [x] UI components: Templates Admin table, TemplateFormDrawer, ConfirmDialog, BulkActions controls
- [x] Assets API in swagger: GET/POST /v1/admin/templates/{slug}/assets; PUT/DELETE /v1/admin/templates/{slug}/assets/{id}
- [x] Backend assets endpoints implemented (upload/list/update/delete) + static /assets
- [x] Frontend assets API + hooks (list/upload/update/delete)
- [x] Upload UI in Edit Drawer (Upload Thumbnail/Preview, Preview Gallery, Make Thumbnail, Delete)
- [x] Upload UI in Create Drawer (auto-create draft on first upload; update thumbnail_url live)
- [x] Publish validation requires thumbnail (422 mapping)
- [ ] Tests (frontend MSW + RTL; backend handlers + integration) – pending to extend for uploads
- [x] Docs: update .documents/web_admin_dashboard.md and swagger/openapi.yaml
- [x] Acceptance review and handoff (CRUD + uploads flow verified in Docker)

---

## Goals

- Make Templates management the primary experience upon sign-in.
- Support Create, Read, Update, Delete with clear validation and feedback.
- Provide admin-only capabilities (secured via Firebase Admin in prod; DevAuth in dev).
- Maintain envelope pattern and server-driven filtering/sorting/pagination.
- Support image uploads (thumbnail/preview) in BOTH Create and Edit.

---

## Main Screen (Dashboard) Concept

Layout:
- Sidebar: Dashboard/Templates, Users (future), Tags/Categories (future), Settings (future)
- Top Bar: Search (future), + New Template, Avatar menu
- Content: Templates List + Filters + Bulk actions; Create/Edit via right Drawer

Filters: q, tags (CSV), status, visibility, sort (updated/newest/popular/name), limit/offset

Columns: Thumb (48x48), Slug, Name, Status, Visibility, Published, Updated, Usage, Tags

Bulk actions: Publish/Unpublish/Delete

---

## Component Hierarchy

```
App
 └─ AdminLayout
     ├─ SidebarNav
     ├─ TopBar (+ New Template)
     └─ TemplatesMain
         ├─ TemplatesFilters
         ├─ BulkActionsBar
         ├─ TemplatesAdminTable
         │   ├─ TableHeader
         │   └─ TableRow
         ├─ PaginationControls
         └─ TemplateFormDrawer (create/edit)
             ├─ Basic (slug, name, description)
             ├─ State (status, visibility)
             ├─ Taxonomy (tags CSV for now)
             └─ Assets
                 ├─ Thumbnail URL (optional URL)
                 ├─ Upload Thumbnail (multipart)
                 ├─ Upload Preview (multipart)
                 └─ Preview Gallery (Make Thumbnail, Delete; reorder = future)
         └─ ConfirmDialog
```

Routing:
- `/` and `/templates` → TemplatesMain

---

## Frontend Types (summary)

- TemplateAdmin, AdminTemplatesList, CreateTemplateInput, UpdateTemplateInput  
- TemplateAssetAdmin { id, url, kind ('thumbnail'|'preview'), sort_order, created_at? }

---

## Admin API Contracts (Swagger)

Security:
- Dev: DevAuth; Prod: Firebase Admin verification with admin claims.

Endpoints (CRUD):
- GET/POST/PUT/DELETE /v1/admin/templates
- GET /v1/admin/templates/{slug}
- POST /v1/admin/templates/{slug}/publish
- POST /v1/admin/templates/{slug}/unpublish

Assets:
- GET /v1/admin/templates/{slug}/assets
- POST /v1/admin/templates/{slug}/assets (multipart; file:image/png|image/jpeg; kind=thumbnail|preview)
- PUT /v1/admin/templates/{slug}/assets/{id} (kind/sort_order; unique thumbnail enforced)
- DELETE /v1/admin/templates/{slug}/assets/{id}

Static:
- /assets/templates/{slug}/{filename}

Validation:
- Publish requires thumbnail; otherwise 422 ("validation_thumbnail_required", fields:["thumbnail_url"])

Envelope:
- success/data/error/meta throughout

---

## Backend Implementation Notes

- CORS: allow dev origin http://localhost:5173; headers Authorization, Content-Type
- DB: `template_assets` table; helper upsertThumbnail on create/update; enforce thumbnail uniqueness on promote
- Storage: ASSETS_DIR=/assets, ASSETS_BASE_URL=/assets; Docker mounts ../backend/assets:/assets
- Code paths:
  - internal/api/admin_templates.go (CRUD + publish/unpublish)
  - internal/api/admin_assets.go (assets)
  - internal/database/admin_templates.go (CRUD + publish validation)
  - internal/database/admin_assets.go (assets list/insert/update/delete)
  - internal/storage/storage.go (save file)

---

## Frontend Admin API Module (src/api/admin/templates.ts)

CRUD:
- listAdminTemplates, getAdminTemplate, createAdminTemplate, updateAdminTemplate, deleteAdminTemplate, publishTemplate, unpublishTemplate

Assets:
- listTemplateAssets, uploadTemplateAsset, updateTemplateAsset, deleteTemplateAsset

Hooks:
- useAdminTemplatesQuery, useCreateTemplateMutation, useUpdateTemplateMutation, useDeleteTemplateMutation, usePublishTemplateMutation, useUnpublishTemplateMutation
- useTemplateAssetsQuery, useUploadTemplateAssetMutation, useUpdateTemplateAssetMutation, useDeleteTemplateAssetMutation

---

## UI Behavior Details

Create Drawer:
- User can upload Thumbnail/Preview before saving:
  - On first upload, the app auto-creates a draft (if not exists) using current form values (slug/name/status/visibility/tags).
  - After draft exists, uploads go to /assets; thumbnail uploads update `thumbnail_url` and show live preview.
- Submit "Create" completes record.

Edit Drawer:
- Full assets management with Preview Gallery:
  - Upload Preview, Make Thumbnail, Delete
- Status/visibility editable.

Publish/Unpublish:
- Publish requires thumbnail; surface backend 422 if missing; show message in UI.

---

## Testing (to extend)

Frontend (MSW + RTL)
- List + filters render
- Create with early upload (auto draft) → verify thumbnail_url populated
- Edit: upload preview → make thumbnail → publish
- Error states: 422 publish without thumbnail; 413 too large; 415 unsupported

Backend
- Handlers validation
- Assets endpoints (content type/size, promote uniqueness)
- Integration around CRUD + publish guard

---

## Risks & Mitigation

- Upload in Create flow requires implicit draft creation → handled by auto-create on first upload.
- Public URLs from local static server vs CDN: abstracted via ASSETS_BASE_URL.
- Reordering of previews deferred to later.

---

## Rollout Steps

1) Swagger and docs (done)  
2) Backend CRUD + assets (done)  
3) Frontend CRUD + forms (done)  
4) Frontend assets UI (Create+Edit) (done)  
5) E2E in Docker (done)  
6) Tests expansion (pending)  
7) Handoff (this doc + updated dashboard doc)

---

## Acceptance Criteria (Updated)

- CRUD: Create/Edit/Delete stable with clear validation.
- Publish/Unpublish working; publish blocked without thumbnail (422).
- Assets upload works in BOTH Create and Edit:
  - Create: auto draft + upload; thumbnail_url updated on thumbnail upload.
  - Edit: gallery with upload preview, make thumbnail, delete.
- List view renders Thumb from `thumbnail_url`.
- Swagger paths updated and accurate.
- Dockerized dev environment (backend+web) up and functional.
