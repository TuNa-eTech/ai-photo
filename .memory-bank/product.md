# Product

Why this project exists, the problems it solves, how it should work, and the user experience goals.

Last updated: 2025-10-21

## Why this project exists
- Provide an AI-powered image styling experience where users can browse curated templates and generate stylized photos easily.
- Centralize template metadata and assets with a secure backend and an admin interface for curation and operations.
- Maintain consistent API contracts (envelope pattern) across platforms (iOS, web admin).

## Problems it solves
- Disconnected management of template metadata/assets.
- Manual/slow curation workflows without an admin UI.
- Inconsistent client behavior and error handling.
- Lack of structured pagination/filtering for large template sets.

## How it should work (end-to-end)
1) Authentication
   - Users (iOS) and admins (Web) authenticate via Firebase Auth (Google/Apple/Google).
   - Clients attach Firebase ID token as Authorization: Bearer to all API calls.

2) Discover and process templates (iOS)
   - iOS Home lists templates from GET /v1/templates with server-side filters/sorting and pagination (limit/offset, q, tags, sort).
   - User selects a template, uploads an image, triggers POST /v1/images/process.
   - The backend fetches secret prompts, calls AI service, persists result, returns processed image URL in envelope.

3) Curate templates (Web Admin)
   - Admin logs in via Firebase (Google).
   - Admin lists templates with filters (q/tags/sort) and pagination, views details.
   - Phase 2: Admin edits metadata (name, description, status, visibility), manages assets (thumbnail/cover/preview), tags, and versioning.

4) Backend
   - Go API validates Bearer token, serves envelope responses with meta (requestId, timestamp).
   - Data stored in Postgres; templates joined with template_assets(kind='thumbnail') for listing.
   - Migrations manage schema evolution (0001…0006+).

## User segments
- End users (iOS): browse templates, generate stylized images.
- Admin users (Web): manage templates, assets, taxonomy, and publishing lifecycle.

## MVP scope (confirmed)
- iOS: “Liquid Glass” Home UI/UX, GET /v1/templates integration with Bearer + 401 retry, base processing flow.
- Backend: /v1/templates supports fields (thumbnail_url, published_at, usage_count) and params (limit, offset, q, tags, sort).
- Web Admin Phase 1: Auth + templates list + detail (read-only).

## Future scope (Phase 2 proposals)
- Admin CRUD endpoints:
  - GET/POST /v1/admin/templates
  - GET/PUT/DELETE /v1/admin/templates/{slug}
  - POST /v1/admin/templates/{slug}/assets, DELETE /v1/admin/templates/{slug}/assets/{id}
  - POST/DELETE /v1/admin/templates/{slug}/tags
  - GET /v1/tags for filter/autocomplete
- Admin-only security via Firebase Admin verification middleware.
- Pagination metadata in envelope.meta (total/hasMore/nextOffset).
- Rich analytics for usage_count and popular sorting.

## UX goals
- iOS:
  - Aesthetic “Liquid Glass” visuals with smooth scrolling and responsive interactions.
  - Fast initial load, friendly empty states, explainable errors via envelope error messages.
- Web Admin:
  - Data-dense tables with clear filters, keyboard-friendly interactions.
  - Consistent look-and-feel via MUI, accessible UI, predictable navigation (React Router).
  - Latency-aware UI with skeletons/spinners, optimistic updates (Phase 2).

## Success metrics (indicative)
- Time to manage a template (admin): lower minutes per edit.
- iOS load time for templates list: under 300ms median (local).
- Error rate for API calls: < 1% and actionable messages.
- Coverage for critical logic paths: consistent unit/integration test pass rates.

## Non-goals (for now)
- Server-side rendered web admin.
- Multi-tenant roles beyond simple admin.
- Billing/payments integration.

## Dependencies and assumptions
- Firebase project configured for iOS and Web.
- Postgres available via Docker Compose or managed service.
- CORS configured for Vite dev origin (http://localhost:5173).
- Envelope contract remains stable per swagger/openapi.yaml.
