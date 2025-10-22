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
