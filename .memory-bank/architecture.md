# Architecture

_This file documents the system architecture, source code paths, key technical decisions, design patterns, and component relationships._

## System Architecture
- The project follows a client-server architecture.
- Client: Native iOS app built with SwiftUI using MVVM. Networking goes through a reusable API client with detailed logging (APIClient), interface-driven via protocols for testability.
- Server: Go backend (entrypoint: backend/cmd/api/main.go), Dockerized for local/dev. Persists user profiles to PostgreSQL.
- Authentication: Client-side login with Firebase Auth (Google/Apple). Backend will verify Firebase ID tokens (todo) and currently accepts Bearer for register API stub. No classic backend login/password.
- Data persistence:
  - user_profiles table in Postgres for storing/updating a user’s profile (email unique, name, avatar_url).
  - processed images saved to disk (backend/processed/).
  - AI templates managed via JSON file (templates.json) and helper functions.
- Observability/Debug:
  - iOS APIClient prints request and response details (method, URL, headers with redaction, pretty JSON body, status, duration).
  - Backend provides simple logging middleware and Dockerized flow.

```mermaid
flowchart LR
  subgraph iOS App (SwiftUI)
    V[View] --> VM[AuthViewModel]
    VM --> UR[UserRepository]
    UR --> AC[APIClient]
  end

  AC -- HTTP/JSON --> API[/Go Backend/]
  API --> H1[RegisterUserHandler]
  API --> H2[ProcessImageHandler]

  H1 --> DB[(PostgreSQL)]
  H2 --> FS[(File Storage)]
  H2 --> TPL[templates.json]
  H2 --> AI[Gemini API]

  classDef client fill:#eef,stroke:#99f
  classDef server fill:#efe,stroke:#9f9
  classDef storage fill:#ffe,stroke:#cc0
  class iOS App (SwiftUI) client
  class API,H1,H2 server
  class DB,FS,TPL storage
```

## Source Code Paths
- iOS app:
  - AIPhotoApp/AIPhotoApp/ (SwiftUI app; Views, ViewModels, Services, Utilities, Repositories)
  - AIPhotoApp/AIPhotoApp/Utilities/Networking/APIClient.swift (common API client with logging)
- Backend:
  - backend/cmd/api/main.go (server entrypoint, route wiring)
  - backend/internal/api/handlers.go (HTTP handlers)
  - backend/internal/database/postgres.go (Postgres connection + UpsertUserProfile)
  - backend/internal/models/models.go (DTOs, domain structs)
  - backend/internal/image/image.go (image processing stub/logic)
  - backend/internal/storage/storage.go (file storage helpers)
  - backend/migrations/ (SQL migrations)
  - docker/docker-compose.yml (db + backend services)
  - backend/Dockerfile (multi-stage build; Go 1.25)

## Key Technical Decisions
- MVVM + interface-driven UI on iOS. APIClientProtocol enables easy mocking in tests.
- Centralized networking with APIClient that logs requests and responses; headers like Authorization are redacted in logs.
- No backend login/password flows; Firebase Auth handles identity. Backend will verify ID tokens (todo).
- Postgres selected for persistence of user profiles; migrations managed by golang-migrate.
- Dockerized local dev for backend and Postgres; iOS uses simulator hitting host localhost:8080.
- Keep image processing artifacts on disk for simplicity in dev; can move to object storage (S3/GCS/MinIO) later.

## Design Patterns in Use
- MVVM (iOS) with @Observable ViewModels.
- Repository pattern for backend integration (UserRepository).
- Protocol-driven development (e.g., APIClientProtocol).
- Middleware for HTTP logging/instrumentation on backend.

## Component Relationships & Critical Paths
1. Authentication (client):
   - User signs in with Google/Apple; Firebase returns ID token.
   - AuthViewModel stores session; pre-fills profile name/email.
2. Register user profile:
   - iOS calls POST /v1/users/register with Authorization: Bearer <idToken> and JSON body {name,email,avatar_url}.
   - Backend handler parses, and now persists via database.UpsertUserProfile(...) into user_profiles table.
   - On success returns JSON {user_id,message}; iOS logs both request/response.
3. Process image:
   - iOS will (todo) call /v1/images/process with template_id and image_path.
   - Backend validates inputs, checks template and file existence, processes via Gemini, writes processed file to backend/processed/, returns processed_image_url.
4. Templates:
   - Managed by templates.json via database helpers (GetTemplateByID).

## Recent Architectural Changes
- iOS:
  - Added APIClient with detailed logging and redaction.
  - Refactored UserRepository to use APIClientProtocol (401 maps to .unauthorized).
  - ProfileCompletionView: defer focus to avoid accessory/inputView constraint conflicts; removed unsupported keyboard toolbar hiding.
- Backend:
  - Added Postgres helper (pgx stdlib) in backend/internal/database/postgres.go.
  - Created migration 0002_create_user_profiles_table.up.sql and applied via containerized golang-migrate.
  - RegisterUserHandler now persists user profile into Postgres (user_profiles) before responding.
  - Backend Dockerfile updated to golang:1.25-alpine to satisfy go.mod go >= 1.25.2.

## Data Model Notes
- user_profiles:
  - id SERIAL PRIMARY KEY
  - email VARCHAR(255) UNIQUE NOT NULL
  - name VARCHAR(255) NOT NULL
  - avatar_url TEXT NULL
  - created_at TIMESTAMP DEFAULT NOW()
  - updated_at TIMESTAMP DEFAULT NOW()
- Note: A separate users table exists from an earlier migration (with password_hash) but is not used by current Firebase-based flow. Consider consolidating/repurposing later with a clear separation of auth vs profile.

## Open Items / Next Steps (Architecture)
- Backend: Implement real Firebase ID token verification in RegisterUserHandler (Firebase Admin SDK).
- Consider consolidating user tables or documenting the separation (auth vs profile) in OpenAPI and code.
- Add integration tests for register flow (assert DB upsert).
- Expand observability (structured logs, metrics, traces) and add error handling for DB/network issues.
