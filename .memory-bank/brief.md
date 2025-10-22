# Brief

Foundation document defining core requirements and goals. Owner-maintained; update as the project evolves.

Last updated: 2025-10-21

## Project Summary
AI Image Stylist is a cross-platform system:
- iOS app (SwiftUI) for end-users to browse AI templates and generate stylized photos.
- Go backend (Postgres) providing secure APIs with an envelope response format.
- Web Admin (React) for internal curation and management of template metadata, assets, and taxonomy.

Authentication is unified via Firebase Auth (Google/Apple). Clients attach Firebase ID token as Authorization: Bearer.

## Core Requirements (MVP)
- iOS
  - Home screen “Liquid Glass” UI per UI spec.
  - Fetch templates from GET /v1/templates using Bearer token, handle 401 refresh.
  - Show template name and support evolving fields (thumbnail_url, published_at, usage_count) when data is available.

- Backend
  - /v1/templates supports:
    - Fields: thumbnail_url, published_at, usage_count
    - Query params: limit, offset, q, tags (CSV), sort (newest|popular|name)
  - Envelope response structure with meta.requestId/timestamp.
  - Postgres queries support filtering, sorting, and thumbnail join; file-source fallback maintained.
  - OpenAPI 3.1 spec in swagger/openapi.yaml.

- Web Admin (Phase 1)
  - Auth via Firebase (Google).
  - Templates list: filters (q/tags/sort), pagination (limit/offset), columns: name, published_at (relative), usage_count, thumbnail, actions.
  - Template detail (read-only) ready for future editing.

## Non-Goals (current)
- Admin CRUD endpoints (Phase 2).
- SSR for web admin.
- Advanced roles/permissions beyond admin.
- Billing/invoicing.

## Quality and Process
- Documentation-driven: .documents is the single source of truth; swagger represents the API contract.
- Plan-driven: each feature requires an implementation plan with a status checklist under .implementation_plan/.
- TDD: tests accompany new features; deterministic, mocked external calls in CI.

## Acceptance (MVP/Phase 1)
- iOS: renders templates list from backend with envelope handling and 401 retry.
- Backend: returns correct filtering/sorting; schema includes usage_count; swagger matches behavior.
- Web Admin: authenticated listing and detail views; correct query composition for /v1/templates; tests pass (vitest/RTL/MSW).

## Risks and Considerations
- Data population of thumbnail_url/published_at/usage_count must be completed for full UI.
- CORS must allow http://localhost:5173 for web admin dev.
- Future pagination metadata (meta.total/hasMore) may be added for better UX.
