# Workflow: TDD Backend-to-Frontend Feature Development

> **This workflow must be followed for every new feature or major change. All steps must be documented and referenced in PRs, code comments, and team discussions.**

---

## 1. Documentation-First: Define the Feature

- **Write or update the usecase in `.documents/`**  
  - Describe the user story, actors, main/exception flows, preconditions, and expected results.
  - Reference related API specs and memory bank context.
  - **Add at least one Mermaid chart** to visually clarify the main flow, usecase, or system interaction. Keep diagrams up to date as the feature evolves.
- **Review and refine the usecase with the team.**
- **Link all related documents** (API spec, architecture, etc.).

---

## 2. Implementation Plan

- **Create a new plan file in `.implementation_plan/`**  
  - Use a clear, descriptive filename (e.g., `feature-<name>-plan.md`).
  - The plan must include:
    - Overview and goals
    - Types/structs/classes to be added/modified
    - Main files and functions to implement
    - Dependencies and constraints
    - **Test scenarios:** List all expected test cases (success, failure, edge, integration, UI) for both backend and frontend. These should be derived from the usecase and documented before implementation.
    - Test strategy (unit, integration, UI)
    - **Mermaid chart(s):** Add or update Mermaid diagrams to illustrate the technical flow, architecture, or component relationships relevant to the feature.
    - Implementation order
    - Notes on toggling auth, local dev, or other environment variables
    - **Status Checklist:** Add a markdown checklist at the top of the plan file to track progress of each implementation step (see `.implementation_plan/process-image-endpoint-plan.md` for example).
- **Review and approve the plan before coding.**

---

## 3. Backend: TDD-First Implementation

- **Define and document all backend test scenarios before writing code.**
  - List all success, failure, and edge cases based on the usecase and implementation plan.
  - Place these scenarios in the implementation plan or as comments in the test files.
- **Write failing unit tests for all new backend logic.**
  - Place tests in the appropriate `*_test.go` files.
  - Cover all main and exception flows described in the usecase and test scenarios.
- **Stub out new structs, functions, and endpoints.**
- **Implement the minimum code to make tests pass.**
- **Refactor for clarity and maintainability after tests pass.**
- **Write integration tests** (e.g., using curl or test clients) to cover end-to-end flows.
- **Document any new patterns or decisions in `.memory-bank/` as needed.**

---

## 4. Frontend: TDD-First Implementation

- **Define and document all frontend test scenarios before writing code.**
  - List all UI, integration, and edge cases based on the usecase and implementation plan.
  - Place these scenarios in the implementation plan or as comments in the test files.
- **Write or update UI/UX requirements in `.documents/` as needed.**
- **Write failing UI/unit tests for new frontend logic.**
  - Place tests in the appropriate test directories (e.g., `app_ios/imageaiwrapperTests/`).
- **Stub out new views, view models, and utilities.**
- **Implement the minimum code to make tests pass.**
- **Refactor for clarity and maintainability after tests pass.**
- **Test integration with backend using real/local endpoints.**

---

## 5. Keep Documentation and Memory Bank in Sync

- **Update `.documents/` and `.implementation_plan/` to reflect any changes or discoveries.**
- **Update `.memory-bank/context.md` with current work, recent changes, and next steps.**
- **If new patterns or repetitive tasks are discovered, update `.memory-bank/tasks.md`.**
- **If architecture or tech stack changes, update `.memory-bank/architecture.md` and `tech.md`.**

---

## 6. Review, Test, and Finalize

- **Run all unit and integration tests (backend and frontend).**
- **Verify all acceptance criteria from the usecase are met.**
- **Review code and documentation with the team.**
- **Prepare PR with references to all relevant documentation and plans.**
- **After merge, update memory bank context and tasks as needed.**

---

## 7. Example References

- See `.documents/usecase_process_image.md` and `.implementation_plan/process-image-endpoint-plan.md` for real examples.
- See `.memory-bank/context.md`, `architecture.md`, `tech.md`, and `tasks.md` for documentation-driven and TDD patterns.

---

**Note:**  
- All deviations from this workflow must be documented and justified in the plan and PR.
- This workflow is the single source of truth for feature development in this project.
