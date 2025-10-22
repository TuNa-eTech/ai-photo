# Web Admin Specification

Last updated: 2025-10-21

Documentation-driven scope and guidelines for the React-based admin app located in `web_admin/`.

Sources of truth:
- .documents/project_architecture.md
- .documents/api_specification.md
- .documents/ui_ux_design.md
- swagger/openapi.yaml

## Scope

- Phase 1 (current): Authentication + Templates List (filters/pagination) + Template Detail (read-only).
- Phase 2 (future): CRUD for template metadata, assets management, tags/categories, versioning, publish/unpublish.

## Tech Stack

- Build: Vite + React + TypeScript
- Routing: React Router
- Server state: TanStack Query
- HTTP: Axios with interceptors (Bearer token injection, envelope handling, single 401 retry)
- UI: Material UI (MUI) with icons and emotion styling
- Auth: Firebase Web SDK (Google Sign-In)
- Testing: Vitest + React Testing Library + MSW
- Lint/Format: ESLint + Prettier

## Architecture and Structure (web_admin/)

- src/
  - api/
    - client.ts (Axios instance, interceptors, envelope unwrap)
    - templates.ts (GET /v1/templates calls, params typing)
  - auth/
    - firebase.ts (initializeApp/getAuth using env vars)
    - useAuth.ts (auth state, idToken accessor)
    - ProtectedRoute.tsx (route guard)
  - components/
    - DataTable.tsx (generic MUI table for list)
    - Filters/
      - TemplatesFilters.tsx (q, tags, sort, pagination controls)
  - pages/
    - Login.tsx
    - Templates/
      - TemplatesList.tsx
      - TemplateDetail.tsx
  - router/
    - routes.tsx (app routes; protected /templates and /templates/:id)
  - types/
    - envelope.ts (Envelope<T>, APIError, Meta)
    - template.ts (Template, TemplatesList from swagger)
  - utils/
    - format.ts (date to relative, compact number)
- .env.local (never commit): VITE_API_BASE_URL, VITE_FIREBASE_*

## Routing

- /login (public) → Google sign-in
- /templates (protected) → list view with filters and table
- /templates/:id (protected) → read-only detail view

ProtectedRoute logic:
- If not authenticated, redirect to /login
- If authenticated, render child route

## Authentication

- Firebase SDK:
  - Initialize with env vars:
    - VITE_FIREBASE_API_KEY
    - VITE_FIREBASE_AUTH_DOMAIN
    - VITE_FIREBASE_PROJECT_ID
    - VITE_FIREBASE_APP_ID
  - Sign-in with Google; on success, obtain Firebase ID token (getIdToken)
- Token usage:
  - Axios request interceptor adds `Authorization: Bearer <idToken>`
  - On 401, perform a single token refresh-and-retry, then surface error

## API Contract and Envelope

- Base URL: `import.meta.env.VITE_API_BASE_URL` (e.g., http://localhost:8080)
- Envelope response structure is authoritative (see .documents/api_specification.md)
- Clients must:
  - Inspect `success` and `data`
  - On error: read `error.message`, log `meta.requestId`, show user-friendly message

## Templates Listing

Endpoint:
- GET `/v1/templates`

Query params mapping:
- limit: number (default: 20; server default also 20)
- offset: number (default: 0)
- q: string (debounced search)
- tags: string (CSV, e.g., "anime,portrait")
- sort: "newest" | "popular" | "name" (default: "newest")

Table columns:
- Thumbnail: render avatar with fallback if `thumbnail_url` missing
- Name
- Published At: relative format (e.g., “2 days ago”), show “—” if missing
- Usage Count: compact number (e.g., 12.3k)
- Actions: View → navigate to detail

Pagination:
- Server-driven via limit/offset
- UI exposes page size and next/prev controls

Empty/Loading/Error states:
- Skeleton rows while loading
- “No results” for empty filtered sets
- Show `error.message` from envelope on failures

## Template Detail

- Route: `/templates/:id`
- Phase 1: read-only fields
  - id/slug, name
  - published_at (relative), usage_count
  - thumbnail(s) if available later
  - tags/categories (display only)
- Future edit forms in Phase 2

## CORS (Development)

- Backend must allow:
  - Origin: http://localhost:5173
  - Methods: GET, POST (extend as needed)
  - Headers: Authorization, Content-Type
- Credentials: not required for admin app
- Configure in backend middleware; control via env

## Environment Variables

- Create `.env.local` (do not commit)
  - VITE_API_BASE_URL=http://localhost:8080
  - VITE_FIREBASE_API_KEY=...
  - VITE_FIREBASE_AUTH_DOMAIN=...
  - VITE_FIREBASE_PROJECT_ID=...
  - VITE_FIREBASE_APP_ID=...

Provide `.env.local.example` with the variable names only.

## Testing

- Unit tests:
  - api/client.ts: envelope unwrap + error propagation
  - api/templates.ts: query param composition for q/tags/sort/pagination
- Component tests (RTL + MSW):
  - TemplatesList.tsx: renders rows from mocked envelope, filters/pagination trigger refetch
  - ProtectedRoute: redirects unauthenticated to /login
  - Login flow happy-path (simulated Firebase auth state)
- Test runner: Vitest (jsdom)
- Mock server: MSW handlers for GET /v1/templates

## Acceptance Criteria (Phase 1)

- Auth required to access /templates and /templates/:id
- GET /v1/templates invoked with correct params and Bearer token
- Envelope decoded; template list rendered with required columns
- Filters/search/sort and pagination function correctly
- States (loading/empty/error) behave per spec
- Tests pass locally (vitest), including MSW-backed tests

## Risks and Mitigations

- Missing data for `thumbnail_url`, `published_at`, `usage_count`
  - Use UI fallbacks; coordinate with backend to populate
- CORS blocks dev
  - Verify/update backend middleware; document required origins/headers
- 401 retry loop
  - Enforce single refresh-and-retry; avoid infinite retry behavior
- Pagination metadata
  - Start with `limit/offset`; consider `meta.total/hasMore/nextOffset` in future

## Setup (Reference)

Commands to run after scaffolding:
```bash
pnpm add react-router-dom @tanstack/react-query axios @mui/material @mui/icons-material @emotion/react @emotion/styled firebase
pnpm add -D typescript eslint prettier vitest @testing-library/react @testing-library/user-event jsdom msw @types/node @types/react @types/react-dom
```

Dev server:
- Vite default at http://localhost:5173
- Ensure backend running at VITE_API_BASE_URL and CORS is configured
