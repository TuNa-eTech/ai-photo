# Technology & Tooling

_This file documents the technologies used, development setup, technical constraints, dependencies, and tool usage patterns._

## Technologies Used
- **Frontend:**
    - Swift
    - SwiftUI
    - Firebase SDK (for authentication)
- **Backend:**
    - Go (Golang)
    - Firebase Admin SDK (for ID token verification)
    - PostgreSQL (recommended for data storage)
    - Object Storage (e.g., S3, GCS, or MinIO)
- **AI:**
    - Google Gemini (or other similar API)

## Development Setup
- **Frontend:**
    1. Open `imageaiwrapper.xcodeproj` in Xcode.
    2. Select a simulator or a connected device.
    3. Click the "Run" button.
- **Backend:**
    1. Ensure Go (>=1.18) is installed.
    2. Place the Firebase service account JSON in the `backend/` directory.
    3. Create a `.env` file in the `backend/` directory (see `.env.example` for template) or set environment variables directly.
    4. From the `backend/` directory, run `go run main.go` to start the server.
    5. The backend listens on port 8081 by default (or as set in `.env`/env vars).
    6. The backend automatically loads environment variables from `.env` using [github.com/joho/godotenv](https://github.com/joho/godotenv) for local development. In production/Docker, use real environment variables.


## Technical Constraints
- The application is for iOS only.
- All authentication is handled by Firebase Auth (client-side login, backend verifies tokens).
- Secret keys and prompts for AI APIs must be handled securely on the backend.
- The backend is containerizable for deployment.

## Dependencies
- **Frontend:**
    - Firebase iOS SDK
- **Backend:**
    - Go (Golang)
    - Firebase Admin SDK for Go (`firebase.google.com/go/v4`)
    - Google API Client for Go (`google.golang.org/api/option`)
    - [github.com/joho/godotenv](https://github.com/joho/godotenv) (for loading `.env` in local development)
    - PostgreSQL driver (if using Postgres)
    - Object storage SDK (if using S3, GCS, etc.)

## Tool Usage Patterns
- Xcode is used for all frontend development.
- Go tools (`go run`, `go mod tidy`, etc.) are used for backend development and dependency management.
- The backend loads environment variables from a `.env` file (if present) for local development, and from the environment in production.
- Firebase Console is used for managing authentication and service accounts.
