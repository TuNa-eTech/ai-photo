# ImageAIWraper

AI-powered photo styling platform for iOS, with a secure, scalable Go backend and modern TDD/documentation-driven workflow.

---

## 🚀 Overview

**ImageAIWraper** is a modern iOS application and Go backend system that enables users to apply advanced AI styles (e.g., Gemini) to their photos. The project is designed for seamless integration, security, and extensibility, using Firebase Auth for authentication and a robust, testable architecture.

---

## 🏗️ Architecture

- **iOS App:** Native SwiftUI app for user interaction, photo selection, and AI style application.
- **Backend:** Go service (containerized) for template management, image processing (via Gemini API), and secure file storage.
- **Authentication:** 100% via Firebase Auth (Google/Apple login on iOS, backend verifies idToken). No backend login API.
- **Profile Management:** `/v1/users/register` API for storing/updating user profile (not authentication).
- **AI Processing:** Gemini API integration for real-time, high-quality image transformation.
- **Testing:** Centralized `.box-testing/` directory for all test data, scripts, and sandbox code.

---

## ✨ Key Features

- Google/Apple login via Firebase Auth (no backend login).
- Browse and select AI style templates.
- Upload and process photos with Gemini AI.
- View, download, and share processed images.
- Admins can add/edit templates and upgrade backend without affecting the app.
- Modern, minimal UI/UX with SwiftUI.

---

## 🔒 Authentication & User Flow

1. **User logs in** via Google/Apple (Firebase Auth) in the iOS app.
2. **App calls** `/v1/users/register` (POST, sends idToken + profile info) to store/update user profile.
3. **All protected API calls** (e.g., `/v1/images/process`) require `Authorization: Bearer <idToken>`.
4. **No backend login API**; all authentication is via Firebase Auth.

---

## 🛠️ Setup & Development

### Prerequisites

- Go >= 1.18
- Xcode (latest, with SwiftUI support)
- Firebase project (with Google/Apple sign-in enabled)
- Gemini API access (for image processing)
- (Optional) PostgreSQL, S3/GCS/MinIO for storage

### Backend Setup

1. Clone the repo and enter `backend/`.
2. Place your Firebase service account JSON in `backend/`.
3. Copy `.env.example` to `.env` and configure environment variables:
    - `FIREBASE_SERVICE_ACCOUNT`, `PORT`, `DATABASE_URL`, `GEMINI_API_KEY`, etc.
4. Run the backend:
    ```bash
    cd backend
    go run main.go
    ```
5. API runs on `http://localhost:8080` by default.

### iOS App Setup

1. Open `app_ios/imageaiwrapper.xcodeproj` in Xcode.
2. Add your `GoogleService-Info.plist` to the project.
3. Configure Firebase Auth (Google/Apple) in the Firebase Console.
4. Build and run on a simulator or device.

---

## 📑 API Endpoints (Summary)

- `POST /v1/users/register`  
  Register/update user profile (requires idToken, not for authentication).

- `POST /v1/images/process`  
  Process an image with a selected AI template (requires idToken).

- `GET /v1/templates`  
  List available AI style templates (requires idToken).

See [`swagger/openapi.yaml`](swagger/openapi.yaml) and `.documents/api_specification.md` for full details.

---

## 🧪 Testing & TDD

- All test data, scripts, and sandbox code are in `.box-testing/`.
- Backend: Run Go unit/integration tests with `go test ./...`.
- iOS: Run unit/UI tests in Xcode (`⌘U`).
- Follow TDD: write tests before implementation, keep coverage high.

---

## 📝 Documentation-Driven Development

- All requirements, architecture, and workflow are documented in `.documents/`.
- Memory bank (`.memory-bank/`) tracks architecture, tech, product, and context for onboarding and maintenance.
- See `.memory-bank/tasks.md` for reusable task patterns (e.g., Firebase Auth + register API).

---

## 🤝 Contributing

- Follow documentation-driven and TDD workflows.
- Update `.documents/` and `.memory-bank/` with every major change.
- See `.memory-bank/tasks.md` for common patterns and onboarding.

---

## 📂 Project Structure

```
.
├── app_ios/                # iOS SwiftUI app
├── backend/                # Go backend service
├── .documents/             # Source of truth for requirements, API, workflow
├── .memory-bank/           # Architecture, tech, product, context, tasks
├── .box-testing/           # Test data, scripts, sandbox code
├── swagger/openapi.yaml    # OpenAPI spec
└── README.md
```

---

## 📣 License

MIT License. See `LICENSE` file for details.
