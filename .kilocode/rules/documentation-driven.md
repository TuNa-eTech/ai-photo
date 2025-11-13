---
alwaysApply: true
---
## Brief overview
- This rule set is project-specific and mandates that all development work must strictly follow the documentation provided in the `.documents` directory.
- The `.documents` directory is the single source of truth for requirements, architecture, and workflow.

## Communication style
- All questions, clarifications, and implementation discussions should reference specific documents or sections within `.documents`.
- When in doubt, consult `.documents` before asking for further clarification.

## Development workflow
- Before starting any new feature, bugfix, or refactor, review the relevant documentation in `.documents`.
- If documentation is missing or unclear, update `.documents` first or request clarification before proceeding with code changes.
- All pull requests and code reviews must reference the relevant `.documents` file(s) that justify the change.

## Coding best practices
- Code should reflect the requirements, constraints, and patterns described in `.documents`.
- If a coding decision is not covered by `.documents`, document the rationale and propose an update to `.documents` for future reference.

## Project context
- The `.documents` directory should be kept up to date with all major architectural, design, and workflow decisions.
- All architectural designs must be documented in `.documents`, and should include visual diagrams using Mermaid syntax for clarity.
- Example Mermaid diagram for a simple service architecture:
  ```mermaid
  graph TD
    Client -->|HTTP| API
    API -->|gRPC| Service
    Service -->|SQL| Database
  ```
- Any deviation from `.documents` must be explicitly documented and justified.

## Other guidelines
- Encourage a documentation-first approach: update or create documentation before implementing significant changes.
- Use clear references to `.documents` in commit messages, code comments, and discussions (e.g., "Implements as described in .documents/api-spec.md").
- Regularly review `.documents` for accuracy and completeness as part of the development cycle.
