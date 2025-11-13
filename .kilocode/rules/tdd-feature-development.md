---
alwaysApply: true
---
## Brief overview
- This rule set is project-specific and mandates strict adherence to Test-Driven Development (TDD) for every new feature or bugfix implementation in the ImageAIWraper project.
- The guidelines ensure that all code changes are testable, maintainable, and verifiable through automated tests.

## Communication style
- All feature discussions, PRs, and code reviews must reference the relevant tests and TDD process.
- When proposing or reviewing a feature, explicitly state the test cases and expected behaviors before implementation.

## Development workflow
- For every new feature or bugfix:
  - Begin by writing failing tests that define the expected behavior (unit, integration, or UI tests as appropriate).
  - Only write the minimum implementation code required to make the tests pass.
  - Refactor code for clarity and maintainability after tests pass.
  - Ensure all tests are automated and run in CI before merging.
- Pull Requests must include new or updated tests covering the change. PRs without tests will not be approved unless justified.

## Coding best practices
- Use the appropriate testing framework for each platform (XCTest for iOS, Go's `testing` package for backend).
- Write clear, focused tests that cover both typical and edge cases.
- Maintain high test coverage for business logic, authentication, and critical user flows.
- Use code coverage tools (Xcode for iOS, `go test -cover` for Go) to monitor and improve coverage.

## Project context
- TDD is required for all code in both the SwiftUI iOS app and Go backend.
- Tests must be located in the designated test directories:
  - iOS: `app_ios/imageaiwrapperTests/` (unit), `app_ios/imageaiwrapperUITests/` (UI)
  - Backend: `*_test.go` files in relevant backend packages

## Other guidelines
- Document any deviations from TDD in the PR description and update `.documents/workflow.md` if exceptions become common.
- Use the code examples in `.documents/workflow.md` as templates for new tests.
- Regularly review and refactor tests to keep them relevant and maintainable.
