## Improve Template Thumbnail Upload UX
Last performed: 2025-10-22

Goal:
- Fix upload UX for template assets in Web Admin: correct loading states, consistent notifications, minimal client-side validation, and avoid stale slug when creating drafts.

Files touched:
- web_admin/src/api/admin/templates.ts
- web_admin/src/pages/Admin/TemplateFormDrawer.tsx

Changes implemented (A, B, G, C):
- [x] A: Proper pending/disable state using React Query mutation with slug at mutate-time
  - Refactor `useUploadTemplateAssetMutation` signature to accept slug per mutate call:
    - Before: `useUploadTemplateAssetMutation(slug: string)` fixed at hook-creation time
    - After:  `useUploadTemplateAssetMutation()` and call `mutateAsync({ slug, kind, file })`
  - Prevents stale slug in create mode after auto-draft creation.
  - Buttons disabled during pending; label shows “Uploading…”.

- [x] B: Copy/tooltip updates
  - `Thumbnail URL` helperText updated to:
    - “Enter a public image URL or upload below. Recommended: square 1:1, ≥ 512px, ≤ 1MB (PNG/JPG).”
  - Upload buttons include tooltips describing recommended sizes.

- [x] G: Local Snackbar success/error in form
  - Added local `Snackbar/Alert` in `TemplateFormDrawer`.
  - Success: “Uploaded successfully”.
  - Error: API message or fallback “Upload failed”.

- [x] C: Client-side validation (size, type, dimensions)
  - Max size ~1MB for both thumbnail and preview.
  - Thumbnail: near 1:1 (tolerance 10%), min 512x512.
  - Preview: shortest side ≥ 512px.
  - Blocks upload with clear Snackbar messages if invalid.

Rationale:
- Improve reliability and user feedback during uploads.
- Prevent double-click duplicate uploads and stale state issues.
- Establish clear quality guidelines for images to ensure consistent UI.

Steps to reproduce and verify:
1) Create mode
   - Open New Template, type Name (auto-slug), try Upload Thumbnail with a valid square ≥ 512px ≤ 1MB:
     - Expect: Button disabled while uploading, label shows “Uploading…”, on success Snackbar, `thumbnail_url` auto-filled, assets refetched.
   - Try invalid file (e.g., large size or non-square small image):
     - Expect: Upload blocked with Snackbar error; no request made.

2) Edit mode
   - Upload Preview images (valid constraints).
     - Expect: Pending state + success Snackbar, `Preview Gallery` updates after refetch.
   - Use “Make Thumbnail” on a preview:
     - Expect: `thumbnail_url` set to that preview URL, gallery refetched (existing behavior preserved).

Important notes / gotchas:
- Do not set Content-Type manually for multipart; browser sets boundary.
- Keep axios/form-data as is; optionally add onUploadProgress in client if progress bar needed.
- Asset kinds:
  - `thumbnail` (single, 1:1) — used for admin list avatar.
  - `preview` (multiple) — for gallery and showcasing.
  - `cover` — currently unused; hide or drop until future requirement.

Diff summary (high-level):
- api/admin/templates.ts:
  - Changed `useUploadTemplateAssetMutation(slug)` to `useUploadTemplateAssetMutation()` and `mutate({ slug, kind, file })`.
  - Invalidate queries using `variables.slug` from mutate.
- pages/Admin/TemplateFormDrawer.tsx:
  - Replace direct `uploadTemplateAsset` call with `uploadMut.mutateAsync({ slug, kind, file })`.
  - Add local Snackbar, helper text, tooltips.
  - Add client-side validation for size/dimensions.
  - Buttons disabled during `uploadMut.isPending`.

Rollback plan:
- Revert the hook signature back to `useUploadTemplateAssetMutation(slug)` and adjust call sites.
- Remove Snackbar/validation blocks and restore previous helper text.
- Ensure to re-run the app to verify no stale imports remain.

Future enhancements (optional):
- Show Preview Gallery in create mode once a draft slug exists.
- Add drag-and-drop area for uploads.
- Add progress bar via axios onUploadProgress.
- Optional client-side compression/cropping for thumbnails.

## Standardize .documents
Last performed: 2025-10-23

Goal:
- Reorganize and standardize the documentation under `.documents` to be concise, documentation-driven, and aligned with repository paths (web-cms).

Files touched (moved/created/updated):
- Moved/renamed:
  - project_architecture.md → architecture/system-architecture.md
  - data-model-templates.md → architecture/data-model/templates.md
  - api-response-standard.md → api/standards.md
  - api-user-register-sequence.mmd → api/sequences/user-register.mmd
  - gemini-api-integration-backend.md → integrations/gemini-backend.md
  - ios26-swiftui-features.md → platform-guides/ios.md
  - usecase_process_image.md → features/image-processing.md
  - template-spec.md → features/template-spec.md
  - workflow.md → workflows/doc-driven.md
  - api_specification.md → api/spec-legacy.md
  - ui_ux_design.md → product/ui-ux.md
  - ui_home_concept.md → product/ui-home-concept.md
  - web_admin.md → platform-guides/web_admin.legacy.md
  - web_admin_dashboard.md → platform-guides/web_admin_dashboard.legacy.md
  - auth/flow-login-register.md → auth/login-register.md
  - auth/flow-refresh-logout.md → auth/refresh-logout.md
- Created:
  - README.md (index + conventions + PR checklist)
  - platform-guides/web-cms.md (canonical guide for Web CMS)
  - workflows/run-tests.md (Go/iOS/Web CMS quick-start)
  - templates/spec-template.md, templates/runbook-template.md, templates/rfc-template.md
- Updated references:
  - features/template-spec.md → use `architecture/data-model/templates.md`, `architecture/system-architecture.md`, `platform-guides/web-cms.md`, `workflows/doc-driven.md`, `api/standards.md`
  - architecture/system-architecture.md → `web-cms/*` (implemented) thay vì `web_admin/* (planned)`
  - product/ui-ux.md → “Web CMS” và link architecture/system-architecture.md
  - api/spec-legacy.md, auth/usecase_auth.legacy.md → thêm Legacy header
- Fixed cross-links in auth docs:
  - login-register.md ↔ refresh-logout.md

Steps implemented:
- [x] Create directory structure and move/rename files
- [x] Add canonical Web CMS guide and mark legacy docs
- [x] Create README index and templates
- [x] Update cross-document references to new paths
- [x] Fix internal links in auth docs
- [x] Verify no stray references to old paths (`project_architecture.md`, `data-model-templates.md`, `workflow.md`, `api-response-standard.md`, `web_admin`)

Important notes:
- Keep OpenAPI canonical at `swagger/openapi.yaml` (do not duplicate in .documents).
- Use features/* specs as Acceptance source for PRs; keep payload details in Swagger.
- Legacy docs retained with headers for historical context.

Acceptance:
- .documents contains standardized structure with updated references.
- Search for old references returns 0 results.
- Memory Bank updated to reflect “web-cms” and docs organization.
