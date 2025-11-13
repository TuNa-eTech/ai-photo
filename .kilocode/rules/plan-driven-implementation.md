---
alwaysApply: true
---
## Brief overview
- This rule set is project-specific and enforces a plan-driven approach for developing and deploying new features in the ImageAIWraper project.
- Every new feature or major change must begin with a written implementation plan, saved in the `.implementation_plan` directory.

## Communication style
- All feature discussions and PRs must reference the relevant implementation plan file.
- Plans should be clear, concise, and actionable, outlining the steps and rationale for the feature.

## Development workflow
- For each new feature or significant change:
  - Create a new implementation plan file in `.implementation_plan/` (e.g., `feature-<name>-plan.md`).
  - **Each implementation plan must include a markdown status checklist at the top of the file to track progress of all key steps (see `.implementation_plan/process-image-endpoint-plan.md` for example).**
  - The plan must include: feature description, goals, technical approach, affected components, test strategy, and deployment steps.
  - Review and refine the plan with the team before starting implementation.
  - Only begin coding after the plan is approved/documented.
  - Update the plan as needed if requirements or approach change during development.

## Coding best practices
- Implementation must follow the approved plan.
- Any deviation from the plan must be documented in the plan file and justified in the PR.

## Project context
- The `.implementation_plan` directory is the single source of truth for feature plans.
- Plans should be versioned and retained for project history and onboarding.

## Other guidelines
- Use the plan template provided in `.implementation_plan/plan-template.md` as a starting point for all new plans.
- Regularly review and update implementation plans to reflect actual project progress and lessons learned.
