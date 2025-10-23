# Run Tests (Local)

Status: Stable  
Updated: 2025-10-23  
Owner: @anhtu

Backend (Go)
- Run all unit & integration tests:
  ```
  cd backend
  go test ./...
  ```
- Coverage:
  ```
  go test -cover ./...
  ```

iOS (Swift/SwiftUI)
- Xcode: open `AIPhotoApp/AIPhotoApp.xcodeproj`, select test target, press ⌘U.
- CLI (example):
  ```
  xcodebuild test \
    -project AIPhotoApp/AIPhotoApp.xcodeproj \
    -scheme AIPhotoApp \
    -destination "platform=iOS Simulator,name=iPhone 17" \
    -parallel-testing-enabled NO | xcpretty
  ```
Notes:
- Run sequentially (no parallel) to avoid memory issues.
- Use `-only-testing:<Target>/<TestClass>` to run a specific test class.

Web CMS (Vite + React + TS)
- Run:
  ```
  cd web-cms
  pnpm i
  pnpm vitest
  ```

References
- .clinerules/RUN_TESTS.md (additional tips)
- features/template-spec.md (acceptance for Template-related features)
