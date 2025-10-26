# Project Architecture (Documentation-Driven)

Last updated: 2025-10-25

Authoritative overview of system components, data flow, and operational concerns. Complements `swagger/openapi.yaml` and other `.documents/*` files.

## System Overview

- Clients
  - iOS App (SwiftUI + Observation): end-user experience for browsing templates and generating styled images.
  - Web Admin (React + Vite + TypeScript): internal tool for data curation and operations (Phase 1: read-only list/detail; Phase 2: CRUD).

- Backend
  - NestJS HTTP API with envelope responses.
  - Postgres 15 as primary datastore with Prisma ORM.
  - Containerized runtime with Docker Compose for local development.
  - Stateless app with Firebase ID token (JWT) authentication (Authorization: Bearer).

- Authentication
  - Firebase Auth (Google/Apple).
  - iOS and Web obtain Firebase ID token; backend validates on protected routes.

- API Contract
  - OpenAPI 3.1 in `swagger/openapi.yaml`.
  - Envelope pattern: `{ success, data?, error?, meta{ requestId, timestamp } }`.
  - MVP endpoints: `/v1/templates`, `/v1/users/register`, `/v1/images/process`.

## High-level Architecture

```mermaid
graph TD
  subgraph Clients
    iOS[iOS App (SwiftUI + Observation)]
    Admin[Web Admin (React + Vite + TS)]
  end

  subgraph Auth
    Firebase[Firebase Auth]
  end

  subgraph Backend
    API[(NestJS HTTP API)]
    PG[(Postgres 15 + Prisma)]
  end

  iOS -->|Firebase Sign-In| Firebase
  Admin -->|Firebase Sign-In| Firebase
  iOS -->|Bearer ID Token| API
  Admin -->|Bearer ID Token| API
  API -->|Prisma ORM| PG
```

## Repository Structure (relevant paths)

- iOS app: `AIPhotoApp/AIPhotoApp/*`
  - Views, ViewModels, Repositories, Utilities/Networking (API client, envelope handling, 401 retry)
- Backend: `server/*`
  - `src/auth` (BearerAuthGuard, Firebase Admin SDK)
  - `src/common` (envelope interceptor, exception filter, DTOs)
  - `src/templates` (controller, service, DTOs)
  - `src/prisma` (Prisma service, module)
  - `prisma` (schema, migrations)
- Swagger: `swagger/openapi.yaml`
- Web Admin: `web-cms/*` (implemented; Phase 2 CRUD + assets)
- Documentation: `.documents/*`
- Memory Bank: `.memory-bank/*`
- Plans: `.implementation_plan/*`

## Critical Flows

### 1) List Templates (GET /v1/templates)
- Inputs: `limit`, `offset`, `q`, `tags` (CSV), `sort` (`newest|popular|name`)
- Auth: Bearer Firebase ID token
- Backend:
  - Parse query params → build `QueryTemplatesDto`
  - Prisma: query `Template` model with filters, sorting, pagination
  - Global EnvelopeInterceptor wraps response
- Output: `EnvelopeTemplatesList` with `templates: Template[]`
  - `Template`: `id`, `name`, `thumbnailUrl?`, `publishedAt?`, `usageCount?`
- Client:
  - iOS or Web Admin unpacks envelope; handles 401 with single token refresh and retry

### 2) Process Image (POST /v1/images/process)
- Inputs: `template_id`, `image_path` (already uploaded)
- Backend:
  - Resolve template prompts/config, call AI service, persist result, return processed URL via envelope
- Output: `EnvelopeProcessImageSuccess { processed_image_url }`

### 3) Register/Update User (POST /v1/users/register)
- Inputs: `name`, `email`, `avatar_url?`
- Output: `EnvelopeUserRegisterSuccess`

## Data Model (excerpt)

- templates (Prisma model)
  - id (String, PK), name (String), thumbnailUrl (String?), publishedAt (DateTime?), usageCount (Int, default 0)
- Future models (to be migrated from Go schema):
  - template_versions, template_assets, tags, template_tags

Migration notes:
- Current: Basic Template model implemented
- Future: Migrate template_versions, taxonomy, and assets from Go schema

## Security

- Client-side:
  - Use Firebase SDK to manage auth state and ID token; attach Bearer header.
  - Single 401 refresh-and-retry pattern.
- Server-side:
  - BearerAuthGuard validates Firebase JWT on protected endpoints.
  - DevAuth mode for local development (DEV_AUTH_TOKEN).
  - For future admin-only endpoints (Phase 2), enforce Firebase Admin verification and admin claims.

## CORS (development)

- Allow origin: `http://localhost:5173` (Vite dev server).
- Allow methods: `GET, POST` (extend as necessary).
- Allow headers: `Authorization, Content-Type`.
- Credentials: not required for this admin app.
- Configure in NestJS main.ts with CORS_ALLOWED_ORIGINS environment variable.

## Non-Functional Requirements

- Reliability:
  - Clear error handling via envelope errors (`APIError` with `code`, `message`, `details`).
- Observability:
  - Include `meta.requestId` and `meta.timestamp` in responses.
  - Prefer structured JSON logs with requestId correlation in backend.
- Performance:
  - List queries should be indexed appropriately (e.g., on `published_at`, `usage_count`, `name`, and join keys).
  - Pagination via `limit/offset` on server.
- Security:
  - Validate all inputs; sanitize query params for SQL.
  - Restrict CORS to known dev origin; production origin TBD.
- Extensibility:
  - Prepare for pagination metadata in `meta` (total/hasMore/nextOffset).
  - Plan for admin CRUD endpoints and assets uploads.

## Web Admin Architecture (Phase 1)

- Stack: Vite + React + TS, React Router, TanStack Query, Axios, MUI, Firebase SDK
- Structure:
  - `src/api` (axios client, envelope unwrap, templates API)
  - `src/auth` (firebase, useAuth, ProtectedRoute)
  - `src/pages/Templates` (TemplatesList, TemplateDetail)
  - `src/components` (DataTable, Filters)
  - `src/types` (envelope, template)
  - `src/router` (routes)
- Routing:
  - `/login` (public)
  - `/templates` (protected, list)
  - `/templates/:id` (protected, detail)
- Testing:
  - Vitest + RTL + MSW
  - Handlers for GET `/v1/templates`

## iOS Architecture (MVP)

- MVVM-like with Observation:
  - Views (SwiftUI) consume `HomeViewModel`
  - Repository handles network calls via APIClient
  - APIClient manages envelope decoding and 401 retry
- UI:
  - “Liquid Glass” components (`GlassBackgroundView`, `GlassCard`, `Chips`, `FAB`)
  - Home templates list with filters and search

## Risks and Mitigations

- Missing data for `thumbnail_url`, `published_at`, `usage_count`
  - Seed and populate DB to showcase UI fields; use graceful fallbacks in UI
- CORS misconfiguration blocks web admin dev
  - Add/verify middleware; document env-controlled origins
- Pagination UX without metadata
  - Start with `limit/offset`; plan `meta.total/hasMore/nextOffset` in future
- Admin security (Phase 2)
  - Use Firebase Admin verification and claims to gate admin endpoints

## References

- API: `swagger/openapi.yaml`
- Memory: `.memory-bank/*`
- iOS Networking: `AIPhotoApp/AIPhotoApp/Utilities/Networking/APIClient.swift`
- NestJS Templates: `server/src/templates/templates.controller.ts`
- Prisma Service: `server/src/prisma/prisma.service.ts`
- Migration Plan: `.implementation_plan/nest-migration-plan.md`
