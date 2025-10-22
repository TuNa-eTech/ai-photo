# Web Admin – Phase 1 Implementation Plan

Last updated: 2025-10-21

Owner: PM/Tech Lead  
Scope: Build a React-based admin (web_admin) for authentication, templates listing (filters/pagination), and template detail (read-only).  
References:  
- .documents/web_admin.md  
- .documents/api_specification.md  
- .documents/project_architecture.md  
- .documents/ui_ux_design.md  
- swagger/openapi.yaml  
- .memory-bank/* (brief, architecture, tech, product, tasks, context)

---

## Status Checklist

- [x] Scaffold Vite + React + TypeScript project in `web_admin/`
- [x] Configure ESLint, Prettier, TypeScript, Vitest setup (jsdom)
- [x] Install deps: react-router-dom, @tanstack/react-query, axios, @mui/material, @mui/icons-material, @emotion/react, @emotion/styled, firebase
- [x] Auth: Firebase config (env-based), Google sign-in, idToken retrieval, ProtectedRoute
- [x] API client: Axios instance, Bearer injection, single 401 refresh-and-retry, envelope handling
- [x] Types: `Envelope<T>`, `APIError`, `Meta`, `Template`, `TemplatesList` (from swagger)
- [x] Templates API module + React Query hooks
- [x] TemplatesList page: filters (q/tags/sort), table (thumbnail/name/published_at/usage_count), pagination (limit/offset)
- [x] TemplateDetail page: read-only view
- [ ] Tests: MSW handler for GET /v1/templates, unit tests for api/client & api/templates, RTL tests for TemplatesList and ProtectedRoute
- [ ] CORS verification in backend (dev): allow http://localhost:5173, headers Authorization, Content-Type
- [ ] Documentation: README (web_admin) + .env.local.example with required keys
- [x] Documentation set updated (.memory-bank and .documents) aligning with plan

---

## Goals

- Phase 1 (read/list/detail) for templates:
  - Authentication with Firebase (Google sign-in).
  - Fetch templates via GET /v1/templates using server-driven filtering/sorting and pagination.
  - Present a data-dense, accessible table using MUI with required columns and actions.
  - Provide a read-only detail view for template metadata to prepare for Phase 2 edits.

## Out of Scope (Phase 2 candidates)

- Admin CRUD endpoints for templates, tags/categories, assets (upload/URL).
- Versioning and publish/unpublish actions.
- Pagination metadata in envelope.meta (total/hasMore/nextOffset).
- Admin claims verification on backend (Firebase Admin middleware).

---

## Technical Approach

- Stack:
  - Vite + React + TypeScript
  - React Router (routing)
  - TanStack Query (server state)
  - Axios (HTTP, interceptors)
  - Material UI (UI components)
  - Firebase SDK (auth)
  - Vitest + RTL + MSW (testing)
  - ESLint + Prettier (lint/format)

- Envelope handling:
  - All API responses follow `{ success, data?, error?, meta }`.
  - client.ts unwraps envelope, throws with `error.message` if `success` is false or `data` missing.
  - Log/attach `meta.requestId` for debugging.

- Auth:
  - Firebase initialized from `.env.local` (never commit real keys).
  - Request interceptor injects `Authorization: Bearer <idToken>`.
  - On 401, refresh idToken via SDK once, retry request once; then surface error.

- CORS:
  - Backend (dev) should allow origin http://localhost:5173, headers `Authorization, Content-Type`, methods `GET, POST` (extend as needed).
  - No credentials required.

---

## Directory Structure (web_admin/)

- src/
  - api/
    - client.ts (axios + interceptors + envelope handling)
    - templates.ts (GET /v1/templates, params typing)
  - auth/
    - firebase.ts (initializeApp/getAuth)
    - useAuth.ts (auth state with idToken accessor)
    - ProtectedRoute.tsx (guard)
  - components/
    - DataTable.tsx
    - Filters/
      - TemplatesFilters.tsx (q, tags, sort, pagination controls)
  - pages/
    - Login.tsx
    - Templates/
      - TemplatesList.tsx
      - TemplateDetail.tsx
  - router/
    - routes.tsx
  - types/
    - envelope.ts
    - template.ts
  - utils/
    - format.ts (relative date, compact number)
- .env.local.example (document keys only)
- README.md (dev instructions)

---

## Routing Map

- /login (public)
- /templates (protected)
- /templates/:id (protected)

ProtectedRoute:
- If not authenticated → redirect /login
- Else render nested route

---

## API Contract

- Base URL: `import.meta.env.VITE_API_BASE_URL` (e.g., http://localhost:8080)
- Endpoint: GET `/v1/templates`
  - Query params: `limit`, `offset`, `q`, `tags` (CSV), `sort` (newest|popular|name)
- Types (from swagger/openapi.yaml):
  - `Template { id, name, thumbnail_url?, published_at?, usage_count? }`
  - `TemplatesList { templates: Template[] }`
  - Envelope variants per `.documents/api_specification.md`

---

## UI Behavior (Phase 1)

- TemplatesList:
  - Filters bar: q (debounced), tags (CSV or basic multiselect), sort enum.
  - Table columns: Thumbnail, Name, Published At (relative), Usage Count, Actions (View).
  - Pagination via limit/offset; expose page size and next/prev.
  - Loading: skeleton rows; Empty: “No results”; Error: show envelope `error.message`.

- TemplateDetail:
  - Show id/slug, name, published_at (relative), usage_count, tags/categories (display).
  - Placeholder areas for assets list (thumbnails) and metadata to be editable in Phase 2.

---

## Testing Strategy (TDD)

- Unit:
  - api/client.ts: envelope unwrap + error propagation
  - api/templates.ts: correct query param composition (q/tags/sort/pagination)
- Integration/Component:
  - TemplatesList.tsx: renders rows from MSW envelope; filters and pagination update query and refetch.
  - ProtectedRoute: redirects unauthenticated → /login; renders children when authenticated.
  - Login: simulated Firebase auth state (mock SDK)
- MSW Handlers:
  - GET /v1/templates returns `EnvelopeTemplatesList` with sample data.
- Runner/Env:
  - Vitest + jsdom; setup-tests.ts; ensure deterministic tests.

---

## Dev Setup & Commands

Scaffold (to be executed):
```bash
pnpm create vite@latest web_admin -- --template react-ts
cd web_admin
pnpm add react-router-dom @tanstack/react-query axios @mui/material @mui/icons-material @emotion/react @emotion/styled firebase
pnpm add -D typescript eslint prettier vitest @testing-library/react @testing-library/user-event jsdom msw @types/node @types/react @types/react-dom
```

Environment:
- `.env.local` (not committed):
  - VITE_API_BASE_URL=http://localhost:8080
  - VITE_FIREBASE_API_KEY=...
  - VITE_FIREBASE_AUTH_DOMAIN=...
  - VITE_FIREBASE_PROJECT_ID=...
  - VITE_FIREBASE_APP_ID=...

---

## Risks & Mitigations

- Missing data (thumbnail_url/published_at/usage_count)
  - UI fallbacks; coordinate backend seeding; graceful display (“—”, placeholders).
- CORS not configured
  - Add middleware in backend; parametrize allowed origins via env; document steps.
- 401 retry loop
  - Enforce single refresh-and-retry; prevent infinite loops via interceptor guards.
- Pagination UX without metadata
  - Start with limit/offset; plan meta.total/hasMore/nextOffset later.

---

## Rollout Steps

1) Scaffold app and install dependencies.
2) Setup lint/format/test configs.
3) Implement Firebase auth and ProtectedRoute.
4) Create Axios client with envelope + 401 handling.
5) Create types and API modules.
6) Build TemplatesList with filters/table/pagination.
7) Build TemplateDetail (read-only).
8) Add MSW handlers and tests; ensure green test suite.
9) Verify CORS in backend; adjust middleware if needed.
10) Write README and `.env.local.example`.
11) Commit and open PR referencing `.documents/*` and this plan.

---

## Acceptance Criteria

- Auth required for `/templates` and `/templates/:id`.
- GET `/v1/templates` called with correct params and Bearer token.
- Envelope decoded; list renders required columns; detail view loads correctly.
- Filters/search/sort and pagination function correctly.
- Loading/empty/error states per spec.
- Tests pass locally (Vitest + RTL + MSW).
- CORS allows http://localhost:5173 in dev.

---

## Timeline (Estimate)

- Day 1: Scaffold, dependencies, configs, Firebase auth + ProtectedRoute.
- Day 2: API client + types + templates API + TemplatesList core (table + fetch).
- Day 3: Filters/pagination wiring + TemplateDetail + tests (MSW/RTL).
- Day 4: Polish, CORS verification, docs (README + env example), PR.
