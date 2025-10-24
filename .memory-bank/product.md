# Product

Last updated: 2025-10-24

Why this project exists
- Deliver an AI-driven photo styling/generation experience using reusable “Templates”.
- Empower admins (non-engineers) to create/manage templates and assets from a web CMS.
- Provide clients (iOS, Web) with consistent, secure APIs for browsing and applying templates.

Problems it solves
- Centralized management of template metadata, taxonomy (tags), assets (thumbnail/preview), lifecycle (draft/published/archived), and metrics (usage_count).
- Separation of public vs admin concerns (public listing hides prompts, admin can manage full details).
- Predictable backend APIs enabling clients to integrate without coupling to model/provider details.

How it should work
- Admin creates a Template (slug, name, description, status, visibility, tags).
- Admin uploads assets (thumbnail required to publish).
- Admin publishes templates to make them visible to end users (public + published).
- Clients browse templates and process images using provider-backed prompts (server-side only).

User experience goals
- Fast, reliable admin workflows: create template, upload thumbnail, publish in minutes.
- Stable local E2E path using Docker to avoid environment issues (DB/auth).
- Predictable versioning and safe defaults to minimize regressions.

Out of scope (current)
- Complex multi-provider orchestration (focus: Gemini).
- Advanced moderation/compliance beyond basic validation.
- Public exposure of prompts in listing (intentionally server-side only).

Key references
- .documents/workflows/run-tests.md (Admin API E2E via Docker + DevAuth).
- .documents/troubleshooting/db-auth.md (local Postgres auth issues and fixes).
