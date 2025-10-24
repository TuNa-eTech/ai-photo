# Admin Templates UI — Redo Plan (Web CMS)

Status: Planning  
Owner: Web CMS  
Last updated: 2025-10-23

This plan rebuilds the entire Admin Templates CRUD UI from scratch to align with the consolidated spec and correct UX flow.

References:
- Spec: .documents/features/template-spec.md
- API: swagger/openapi.yaml
- Docs-first rules: .clinerules/documentation-driven.md
- Plan-driven rules: .clinerules/plan-driven-implementation.md
- TDD rules: .clinerules/tdd-feature-development.md

Checklist
- [ ] Remove legacy Admin Template UI (AdminTemplates.tsx, TemplateFilters.tsx, TemplateFormDrawer.tsx)
- [ ] Scaffold new route structure and pages
- [ ] Implement List page (filters/sort/search/pagination)
- [ ] Implement Create page (RHF + Zod, slug handling)
- [ ] Implement Edit page (RHF + Zod, slug handling)
- [ ] Implement Assets module (upload previews, set thumbnail, delete, reorder)
- [ ] Implement Publish/Unpublish with guard
- [ ] Wire API layer (admin templates + assets)
- [ ] Ensure absolute thumbnail_url is rendered correctly
- [ ] Tests (Vitest + MSW + RTL) for key flows
- [ ] Update docs and memory bank if impacted

1) Goals
- Rebuild Admin Templates UI in web-cms to fully match spec:
  - Admin List with filter/sort/search/pagination
  - Admin Create/Edit form with validations
  - Assets management: upload preview, set single thumbnail, delete, reorder
  - Publish/Unpublish with guard: must have valid thumbnail_url before publish
  - Render absolute thumbnail_url (no relative paths)
- Adopt TDD with MSW/RTL and use TanStack Query+Axios envelope unwrapping

Non-goals
- Backend refactor (beyond wiring and error handling)
- iOS client changes
- Analytics/dashboard

2) Information Architecture & Routing
- Base route: /admin/templates
  - List: /admin/templates
  - Create: /admin/templates/new
  - Edit: /admin/templates/:slug
- Files
  - web-cms/src/pages/Admin/Templates/
    - List.tsx
    - Create.tsx
    - Edit.tsx
    - components/
      - Filters.tsx
      - Table.tsx
      - Pagination.tsx
      - Form.tsx
      - AssetsManager.tsx
      - AssetCard.tsx
      - UploadDropzone.tsx
      - PublishBar.tsx
- Remove legacy
  - web-cms/src/pages/Admin/AdminTemplates.tsx
  - web-cms/src/pages/Admin/TemplateFilters.tsx
  - web-cms/src/pages/Admin/TemplateFormDrawer.tsx

3) UX Flow (aligned to spec)
- List
  - Filters: q (name/slug), tags, status (draft/published/archived), visibility (public/private), sort (updated|newest|popular|name)
  - Pagination: limit, offset
  - Table displays: name, slug, status, visibility, published_at, usage_count, updated_at, actions (Edit, Delete, Publish/Unpublish)
  - Thumbnail column shows absolute thumbnail_url if present
- Create
  - Fields: name (required), slug (auto-suggest from name; editable), description?, visibility (public/private), tags?, categories?
  - Submit: POST /v1/admin/templates
  - After create success -> redirect to Edit page (slug)
- Edit
  - Same fields as Create; PUT /v1/admin/templates/{slug}
  - Assets section:
    - Upload preview images (multipart/form-data)
    - Promote a preview to thumbnail (demote existing thumbnail to preview)
    - Delete assets
    - Reorder previews (sort_order)
  - Publish/Unpublish actions:
    - POST /v1/admin/templates/{slug}/publish
    - POST /v1/admin/templates/{slug}/unpublish
    - Guard: publish fails with 422 if thumbnail_url missing
- Error handling
  - Show envelope error.message on failure
  - Validation errors (422): map details to form field-level errors
- Empty states
  - No templates match filter -> EmptyState component with reset filters
  - No assets yet -> prompt to upload

4) API Contracts (from spec)
- List: GET /v1/admin/templates
  - Query: limit, offset, q, tags, status, visibility, sort
- Create: POST /v1/admin/templates 201
- Detail: GET /v1/admin/templates/{slug}
- Update: PUT /v1/admin/templates/{slug}
- Delete: DELETE /v1/admin/templates/{slug}
- Publish: POST /v1/admin/templates/{slug}/publish
- Unpublish: POST /v1/admin/templates/{slug}/unpublish
- Assets
  - List: GET /v1/admin/templates/{slug}/assets
  - Upload: POST /v1/admin/templates/{slug}/assets (multipart)
    - Form: kind ∈ {thumbnail, cover, preview}; file (png|jpeg)
  - Update: PUT /v1/admin/templates/{slug}/assets/{id} (kind?, sort_order?)
  - Delete: DELETE /v1/admin/templates/{slug}/assets/{id}

Notes
- Ensure backend returns absolute thumbnail_url; spec updated to require ASSETS_BASE_URL absolute
- Envelope: { success, data, error?, meta? }; client unwraps and throws on error

5) API Layer (client)
- Location
  - web-cms/src/api/admin/templates.ts (admin templates CRUD + publish/unpublish)
  - web-cms/src/api/admin/templateAssets.ts (assets CRUD)
- Functions
  - listTemplates(params)
  - createTemplate(payload)
  - getTemplate(slug)
  - updateTemplate(slug, payload)
  - deleteTemplate(slug)
  - publishTemplate(slug)
  - unpublishTemplate(slug)
  - listTemplateAssets(slug)
  - uploadTemplateAsset(slug, formData)
  - updateTemplateAsset(slug, id, payload)
  - deleteTemplateAsset(slug, id)
- Axios setup is in src/api/client.ts; ensure Authorization and 401 retry; envelope unwrap on success, throw on error

6) State Management & Data Fetch
- TanStack Query for data queries/mutations
  - Keys: ['admin-templates', listParams], ['admin-templates', slug], ['admin-templates', slug, 'assets']
  - Invalidate on create/update/delete/publish/unpublish/uploads
- Forms
  - React Hook Form + Zod schemas
  - Instant slug suggestion from name (kebab-case); allow edit; check server error for duplicate slug

7) Validation (Zod Draft)
- Template
  - name: z.string().min(1)
  - slug: z.string().min(1).regex(/^[a-z0-9-]+$/)
  - description?: z.string().max(2000).optional()
  - visibility: z.enum(['public', 'private'])
  - tags?: z.array(z.string()).optional()
- Asset upload
  - kind: z.enum(['thumbnail', 'cover', 'preview'])
  - file: accept png|jpeg; max 12MB (client-side check)
- Map 422 validation_error to form fields; display messages

8) Components (Sketch)
- List.tsx
  - Uses Filters, Table, Pagination
  - Query state in URL (search params)
- Filters.tsx
  - Controls: q, tags (multi-select), status, visibility, sort
- Table.tsx
  - Columns: thumbnail, name/slug, status, visibility, published_at, usage_count, updated_at, actions
- Pagination.tsx
  - limit, offset; next/prev
- Form.tsx
  - RHF + Zod; fields and submit; create/edit modes
- AssetsManager.tsx
  - UploadDropzone, list of AssetCard
  - Promote to thumbnail (PUT kind: 'thumbnail')
  - Delete, Reorder (PUT sort_order)
- PublishBar.tsx
  - Publish/Unpublish buttons; disabled states and guard warning
- UploadDropzone.tsx
  - Accept png|jpeg; show progress; call uploadTemplateAsset

9) Testing Strategy
- Unit/Integration (Vitest + MSW + RTL)
  - List page: render, filtering, sorting, pagination requests and results
  - Create page: form validation, success redirect, 422 mapping
  - Edit page: load detail, update success, error handling
  - Assets: upload (multipart), promote thumbnail, delete, reorder (update sort_order)
  - Publish/Unpublish: guard behavior when no thumbnail present (422)
- API mocks (MSW)
  - Handlers for all endpoints above with envelope format
- Coverage
  - Critical paths and regressions; run in CI

10) Deletion & Migration Plan
- Remove legacy files (git rm) and update router references
- Introduce new routes and lazy imports if needed
- Progressive scaffold: List -> Create -> Edit -> Assets -> Publish flow
- Rollback: keep a branch snapshot of old implementation for reference

11) Error Handling & Edge Cases
- Absolute thumbnail_url: display gracefully even if missing (fallback image/initials)
- Duplicate slug on create/edit
- Upload failure (network/size/type)
- Publish guard fails (422): show clear banner/toast
- Unauthorized (401): auto refresh via client; show login if persists
- Server errors (5xx): retry affordance or error banner

12) Accessibility & i18n
- Labels for inputs and buttons; keyboard accessible uploads
- Announce toasts for screen readers
- Strings ready for i18n (en/vi)

13) Performance
- Virtualize table if needed at scale (out of scope for MVP)
- Debounced search; memoize derived lists

14) Implementation Steps (Detailed)
1. Delete legacy pages and references
2. Create route entries for /admin/templates, /new, /:slug
3. API layer for admin templates and assets
4. List page with Filters/Table/Pagination; wire queries
5. Create page with Form; on success redirect to Edit
6. Edit page; include AssetsManager and PublishBar
7. Assets upload/promote/delete/reorder flows
8. Publish/Unpublish actions and UI
9. Tests for all flows; fix defects
10. Final polish; docs/memory-bank update

15) Open Questions
- Tag/category source for filters (static list vs server-provided)? If server-provided, add GET tags/categories endpoints in future.
- Sort default on List: use 'updated' as default for admin list (spec allows updated|newest|popular|name).
- Pagination metadata: consider adding to Envelope meta later (total, hasMore, nextOffset).

Approval
- Implementation will begin after plan approval.
