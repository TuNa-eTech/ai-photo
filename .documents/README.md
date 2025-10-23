# Project Documentation Index (.documents)

Status: Stable  
Updated: 2025-10-23  
Owner: @anhtu

Purpose
- Single source of truth for requirements, architecture, API contracts, and workflows.
- Documentation-first: update docs and Swagger before implementing significant changes.
- Keep content concise, practical, and directly mapped to source code.

Sources of Truth
- API contract: swagger/openapi.yaml
- Code paths: see links in each feature/spec
- Data model: architecture/data-model/*
- Memory Bank: .memory-bank/* (project context and decisions)

Directory Structure
- product/
  - overview.md — Product goals, scope, non-goals, success metrics
  - ui-ux.md — UI/UX principles and visual language
  - ui-home-concept.md — Home page concept notes
- architecture/
  - system-architecture.md — System diagram (Mermaid), platform components
  - data-model/
    - templates.md — PostgreSQL data model for Templates
- api/
  - standards.md — Envelope, errors, security, versioning conventions
  - sequences/
    - user-register.mmd — Sequence diagram(s)
  - openapi (canonical): swagger/openapi.yaml (outside .documents)
- features/
  - template-spec.md — End-to-end spec for Templates (public + admin + assets)
  - image-processing.md — Spec for image processing flow
- auth/
  - login-register.md — Auth flows
  - refresh-logout.md — Refresh/logout flows
- platform-guides/
  - ios.md — iOS integration guide and patterns
  - web-cms.md — Web CMS guide (supersedes legacy “web_admin” docs)
  - legacy: web_admin.legacy.md, web_admin_dashboard.legacy.md
- integrations/
  - gemini-backend.md — Backend integration with Gemini APIs
- workflows/
  - doc-driven.md — Documentation-driven workflow
  - run-tests.md — Local test commands and references
- rfc/
  - … future design proposals (optional)
- templates/
  - spec-template.md — Template for feature specs
  - runbook-template.md — Template for operational runbooks
  - rfc-template.md — Template for RFCs

Conventions for Every Spec
- Header metadata: Status, Version, Updated, Owner
- Purpose and Scope
- Sources of Truth: Swagger path(s), code paths, migrations
- Main Flow (Mermaid) where relevant
- Business Rules (explicit and testable)
- Acceptance Criteria
- Changelog (brief, append-only)

How to Work with Docs
1) Before coding:
   - Update or create the relevant spec under features/ (use templates/spec-template.md)
   - If API changes are needed, update swagger/openapi.yaml and reference it from the spec
2) During implementation:
   - Keep specs in sync with code paths and migrations
3) After implementation:
   - Ensure Acceptance is met and tests exist
   - Update Changelog in the spec and link the PR

PR Checklist (copy into PR descriptions)
- [ ] Spec updated (or created) under features/ with Acceptance and Changelog
- [ ] Swagger updated and consistent with behavior
- [ ] Code paths referenced in the doc are correct
- [ ] Tests added/updated and pass locally (see workflows/run-tests.md)
- [ ] If deprecating or replacing docs, mark old files as legacy and link to the new source

Maintenance
- Bi-weekly hygiene pass: verify links, sync spec ↔ Swagger ↔ code.
- Avoid duplication: link to Swagger for payload details; keep docs focused on behavior, rules, and examples.
- For large changes, start an RFC in rfc/ then merge results into the relevant spec.

Spec Placement and Lifecycle
- Where to store specs:
  - features/: End-to-end feature specs per initiative (e.g., template-spec.md, image-processing.md). Use templates/spec-template.md.
  - architecture/: System-level and data-model docs (e.g., system-architecture.md, data-model/*.md).
  - api/: API-wide standards and sequences (api/standards.md, api/sequences/*). Canonical OpenAPI at swagger/openapi.yaml.
  - platform-guides/: Platform-specific guides (ios.md, web-cms.md, backend guidance if added).
  - auth/: Cross-cutting auth flows (login-register.md, refresh-logout.md).
  - integrations/: External services (e.g., gemini-backend.md).
  - workflows/: Team processes (doc-driven.md) and testing (run-tests.md).
  - rfc/: Large architectural proposals prior to implementation (use templates/rfc-template.md).

- When to create a feature spec (features/*.md):
  - Before coding any new feature/epic with cross-layer impact (API/DB/UI) or risk.
  - When API changes (add/remove fields/endpoints) or data-model changes occur (include Swagger and migrations links).
  - When cross-platform behavior must be standardized with explicit Acceptance.
  - When doing large/risky refactors that require testable acceptance criteria.

- How to use a spec effectively:
  - Treat specs as Acceptance source in PRs; check off Acceptance when done.
  - Keep payload/schema details in Swagger (link to swagger/openapi.yaml from the spec).
  - Structure every spec with: Header metadata, Purpose & Scope, Sources of Truth (Swagger/code paths/migrations), Main Flow (Mermaid) if needed, Business Rules, Acceptance, Changelog.
  - Lifecycle: Draft/update spec → update Swagger if API changes → implement → update spec Changelog and confirm Acceptance.

- When to use an RFC:
  - For wide-impact or uncertain design decisions. After agreement, summarize into a concise features/* spec for implementation.

Notes
- “web-cms” is the canonical name for the Web Admin in this repo. Legacy “web_admin” references are kept only for historical context and are superseded by platform-guides/web-cms.md.
