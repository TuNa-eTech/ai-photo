# Architecture

_This file documents the system architecture, source code paths, key technical decisions, design patterns, and component relationships._

## System Architecture
- The project follows a client-server architecture.
- **Client:** A native iOS application built with SwiftUI.
- **Server:** A custom Go backend service, deployed as a containerized application.
- **Authentication:** User authentication is handled by Firebase Auth (client-side login, backend verifies Firebase ID tokens).
- The client communicates with the Go backend for template management, image upload, and AI image processing.

## Source Code Paths
- `app_ios/`: Contains the source code for the iOS application.
- `backend/`: Contains the Go backend service, including authentication, API handlers, and business logic.

## Key Technical Decisions
- **Migration to Go Backend:** The project migrated from a Supabase backend to a custom Go backend for greater flexibility and control.
- **Firebase Auth Integration:** Authentication is now handled by Firebase Auth. The iOS app uses Firebase SDK for login, and the backend verifies ID tokens using Firebase Admin SDK.
- **Environment Variable-Based Configuration:** All sensitive and deployment-specific configuration for the Go backend (e.g., Firebase service account path, server port, database URL, AI API keys) is managed via environment variables. The backend loads these using a central config struct and loader (`internal/config/config.go`). Required variables are validated at startup, and sensible defaults are provided where appropriate.
    - Supported variables:
        - `FIREBASE_SERVICE_ACCOUNT` (required)
        - `PORT` (default: 8081)
        - `DATABASE_URL` (optional)
        - `GEMINI_API_KEY` (optional)
- **AI Processing:** The backend securely manages AI API keys and prompts, and handles all calls to the AI image processing API (e.g., Gemini).
- **SwiftUI for iOS:** The iOS application is built with SwiftUI for a modern, declarative UI.

## Design Patterns in Use
- **MVVM:** The iOS application uses the Model-View-ViewModel (MVVM) design pattern.
- **Middleware:** The Go backend uses middleware for authentication and request validation.

## Component Relationships & Critical Paths
1. The SwiftUI app fetches template data from the Go backend API.
2. The user selects a template and uploads an image to the backend.
3. The app calls the `/v1/images/process` endpoint, passing the template ID and image path, with a Firebase ID token in the `Authorization` header.
4. The backend verifies the Firebase ID token, retrieves the secret prompt, calls the AI API, and saves the result to object storage.
5. The app receives the URL of the processed image and displays it to the user.

## Recent Architectural Changes
- Migrated backend from Supabase/Edge Functions to a custom Go service.
- Integrated Firebase Authentication for secure, scalable user management.
- Updated all documentation and memory bank files to reflect the new architecture.
