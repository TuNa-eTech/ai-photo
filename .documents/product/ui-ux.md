# UI/UX Design

Last updated: 2025-10-21

This document defines the user interface and experience guidelines for:
- iOS App (Liquid Glass Home)
- Web CMS (Phase 1: Templates list and detail)

Sources of truth:
- architecture/system-architecture.md
- swagger/openapi.yaml
- iOS code: AIPhotoApp/AIPhotoApp/Views and ViewModels

## iOS App (Liquid Glass Home)

Objectives
- Deliver a visually appealing “Liquid Glass” experience that highlights template discovery.
- Fast, responsive lists with graceful empty/loading states.
- Filter/search interactions that feel native and unobtrusive.

Key Components (implemented)
- GlassBackgroundView: Glassmorphism background with subtle blur and noise.
- GlassCard: Elevated card surface for template tiles and sub-panels.
- Chips: Filter chips (e.g., tags, quick filters).
- FAB: Floating action button for primary/secondary actions depending on context.
Paths:
- AIPhotoApp/AIPhotoApp/Views/Common/GlassComponents.swift
- AIPhotoApp/AIPhotoApp/Views/Home/TemplatesHomeView.swift

Home Screen Behavior
- Data source: GET /v1/templates with params { limit, offset, q, tags, sort }.
- Search (q): Debounced input to avoid excessive network calls.
- Tags: Client-side multi-select; send CSV via tags param.
- Sort: newest|popular|name (mapped directly to backend).
- Pagination: limit/offset. Load more on scroll or user action.
- Empty states:
  - “No results” for q/tags filters.
  - “No templates yet” when dataset is empty.
- Loading states:
  - Skeletons/shimmers for list cards.
- Error states:
  - Display envelope error.message when present; suggest retry.

Tile Layout
- Thumbnail (if available); fallback to placeholder gradient if missing.
- Title: Template name (1–2 lines, truncation with ellipsis).
- Meta inline (if present): published_at (relative), usage_count (compact number).

Accessibility
- Dynamic Type support for text.
- VoiceOver labels for tiles: “{Template name}, published {relative}, used {count} times”.

Performance
- Use LazyVGrid/LazyVStack.
- Avoid re-computation in body; push logic to ViewModel where possible.

Acceptance Criteria (iOS Home)
- Renders templates with name and thumbnail when available.
- Filters/search/sort update the list correctly.
- Envelope error messages are visible on failure.
- ATS exception allows http://localhost during development only.

## Web Admin (Phase 1)

Objectives
- Efficient data table for template catalog exploration and monitoring.
- Clear filter/search/sort controls matching backend capabilities.
- Auth-protected routes using Firebase.

Pages
1) Login
   - Google sign-in (Firebase).
   - Redirect to /templates on success.

2) Templates List (/templates)
   - Filters bar:
     - q (search box, debounced)
     - tags (CSV entry or simple multiselect; richer UX later)
     - sort enum (newest|popular|name)
   - Table columns:
     - Thumbnail (avatar-size image; fallback initial if missing)
     - Name
     - Published At (relative, or “—” if missing)
     - Usage Count (compact format)
     - Actions (View)
   - Pagination:
     - limit, offset controls (e.g., page size select, next/prev)
   - Loading/Empty/Error:
     - Skeleton rows while loading
     - “No results” when filters yield no items
     - Show envelope error.message on failure

3) Template Detail (/templates/:id)
   - Read-only fields:
     - id/slug, name
     - published_at (relative), usage_count
     - thumbnails (list if multiple available later)
     - tags/categories (display only for Phase 1)
   - Prepares for Phase 2 edit forms.

Interaction Model
- All queries use TanStack Query with cache keys [‘templates’, params].
- URL search params mirror filters to support reload/share.
- Single 401 refresh-and-retry in Axios interceptor via Firebase SDK.
- Envelope handling:
  - If !success or !data → surface error.message; log requestId for debugging.

Accessibility
- Keyboard navigable table/filter controls.
- High contrast text/colors passing AA wherever possible.
- Table rows with aria-label including name.

Performance
- Server-side pagination; minimal client-side filtering.
- Avoid heavy re-renders by stabilizing column cell renderers and memoizing filters.

Visual Style
- Use Material UI components with a clean, neutral theme.
- Consistent spacing and density suitable for data tables (MUI density="compact" acceptable).
- Avoid overly decorative visuals; prioritize clarity.

Acceptance Criteria (Web Admin Phase 1)
- Auth required to access /templates and /templates/:id.
- GET /v1/templates is called with proper limit/offset/q/tags/sort.
- Table renders required columns; navigation to detail works.
- Error and loading states follow the envelope pattern.
- Basic tests:
  - Login → Templates list happy path with MSW.
  - Filters affect query params and refetch.
  - ProtectedRoute redirects unauthenticated user to /login.

Future Enhancements (Phase 2)
- CRUD forms for template metadata, tags/categories management.
- Asset management (upload/URL), sortable previews.
- Pagination metadata (meta.total/hasMore/nextOffset) for richer UX.
- Admin-only security via Firebase Admin verification middleware.
