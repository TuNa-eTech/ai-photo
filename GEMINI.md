
## Project Overview

This project is an AI-powered photo styling platform for iOS. It consists of a native SwiftUI application for the frontend and a Go backend. The backend is responsible for managing user authentication, providing AI style templates, and processing images using the Gemini API. The project is containerized using Docker and follows a documentation-driven and test-driven development workflow.

## Building and Running

### Backend

To run the backend, you need to have Go installed.

1.  Navigate to the `backend` directory.
2.  Install the dependencies: `go mod tidy`
3.  Run the backend: `go run ./cmd/api/main.go`

The backend will be running on `http://localhost:8080`.

### Frontend

To run the frontend, you need to have Xcode installed.

1.  Open the `AIPhotoApp/AIPhotoApp.xcodeproj` file in Xcode.
2.  Build and run the project on a simulator or a physical device.

## Development Conventions

*   **Documentation-Driven Development:** All requirements, architecture, and workflow are documented in the `.documents/` directory.
*   **Test-Driven Development (TDD):** The project follows a TDD approach. All test data, scripts, and sandbox code are in the `.box-testing/` directory.
*   **API Specification:** The API is documented in the `swagger/openapi.yaml` file.
*   **Memory Bank:** The `.memory-bank/` directory tracks architecture, tech, product, and context for onboarding and maintenance.
