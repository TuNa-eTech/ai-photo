# Product

Last updated: 2025-10-26

Why this project exists
- Deliver an AI-driven photo styling/generation experience using reusable "Templates".
- Empower admins (non-engineers) to create/manage templates and test AI generation from a professional web CMS.
- Provide clients (iOS, Web) with consistent, secure APIs for browsing and applying templates.

Problems it solves
- Centralized management of template metadata, AI prompts, model configuration, taxonomy (tags), assets (thumbnail/preview), lifecycle (draft/published/archived), and metrics (usage_count).
- Separation of public vs admin concerns (public listing hides prompts, admin can manage full details).
- Predictable backend APIs enabling clients to integrate without coupling to model/provider details.
- Testing and validation of AI prompts before deployment to end users.

How it should work
- Admin creates a Template (slug, name, description, status, visibility, tags).
- Admin configures AI settings (prompt, negative prompt, model provider, model name).
- Admin uploads assets (thumbnail required to publish).
- Admin tests template with image generator (upload file or paste URL).
- Admin views side-by-side comparison of original and AI-processed images.
- Admin publishes templates to make them visible to end users (public + published).
- Clients browse templates and process images using provider-backed prompts (server-side only).

User experience goals
- Professional, modern UI with Material-UI v7 design system.
- Fast, reliable admin workflows: create template, configure AI, upload thumbnail, test generation, publish in minutes.
- Intuitive template testing with dual input modes (file upload / URL paste).
- Clear visual feedback with loading states, error messages, and success notifications.
- Responsive design working on desktop, tablet, and mobile devices.
- Stable local E2E path using Docker to avoid environment issues (DB/auth).
- Predictable versioning and safe defaults to minimize regressions.

Current features (Web CMS)
- **Dashboard**: Overview with stats (total, published, drafts, usage) and recent templates list.
- **Templates List**: Full CRUD with advanced filters (search, status, visibility, tags, sort), pagination.
- **Template Detail**: 2-column layout with comprehensive info display and image generator.
- **Image Generator**: Test AI generation with file upload or URL paste, see side-by-side comparison.
- **Create/Edit Forms**: Tabbed interface (Basic Info, AI Prompts, Media, Settings) with character counters.
- **Professional UI**: Custom theme (Indigo + Teal), Inter font, consistent spacing and colors.
- **Firebase Auth**: Secure authentication with email/password.

Out of scope (current)
- Complex multi-provider orchestration (focus: Gemini).
- Advanced moderation/compliance beyond basic validation.
- Public exposure of prompts in listing (intentionally server-side only).
- Async job queue for long-running image processing (planned for Phase 2).
- Test history storage and replay (planned for Phase 2).

Key references
- .documents/web-cms/architecture.md (Web CMS architecture and components).
- .implementation_plan/ui-ux-redesign-summary.md (UI/UX redesign details).
- .implementation_plan/template-detail-page-summary.md (Template detail implementation).
- .documents/workflows/run-tests.md (Admin API E2E via Docker + DevAuth).
- .documents/troubleshooting/db-auth.md (local Postgres auth issues and fixes).
