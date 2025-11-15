# ImageAIWraper

AI-powered photo styling platform for iOS, with a secure, scalable NestJS backend and modern TDD/documentation-driven workflow.

---

## 🚀 Overview

**ImageAIWraper** is a modern iOS application and NestJS backend system that enables users to apply advanced AI styles (e.g., Gemini) to their photos. The project is designed for seamless integration, security, and extensibility, using Firebase Auth for authentication and a robust, testable architecture.

---

## 🏗️ Architecture

- **iOS App:** Native SwiftUI app for user interaction, photo selection, and AI style application.
- **Backend:** NestJS service (containerized) for template management, image processing (via Gemini API), and comprehensive file storage system.
- **File Storage:** Local storage with database metadata using Prisma ORM, supporting thumbnail generation, file deduplication, and multiple asset types.
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
- Advanced file storage system with metadata, thumbnails, and deduplication.
- Template asset management (thumbnail, preview, cover, sample images).
- Admins can add/edit templates and manage assets through admin interface.
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

- Node.js >= 20
- Yarn package manager
- Xcode (latest, with SwiftUI support)
- Firebase project (with Google/Apple sign-in enabled)
- Docker & Docker Compose
- Gemini API access (for image processing)
- (Optional) PostgreSQL, S3/GCS/MinIO for storage

### Backend Setup

1. Clone the repo and enter `server/`.
2. Place your Firebase service account JSON in `server/` (filename: `firebase-adminsdk.json`).
3. Copy `.env.example` to `.env` and configure environment variables:
    - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
    - `PORT`, `DATABASE_URL`, `GEMINI_API_KEY`
    - `API_BASE_URL` (important for file URL generation)
    - `CORS_ALLOWED_ORIGINS` for web apps
4. Run the backend:
    ```bash
    cd server
    npm run start:dev
    ```
5. API runs on `http://localhost:8080` by default.

### Docker Deployment (Production)

1. **Configure Environment**: Set up `docker/.env` with production values:
   ```bash
   API_BASE_URL=https://your-api-domain.com
   NODE_ENV=production
   DEV_AUTH_ENABLED=0  # Use Firebase Auth in production
   ```

2. **Deploy with Docker Compose**:
   ```bash
   cd docker
   docker-compose up -d --build
   ```

3. **Services Deployed**:
   - **PostgreSQL Database** (port 55432)
   - **NestJS API Server** (port 8080)
   - **Web CMS Admin Panel** (port 5173)
   - **Landing Page** (port 5174)
   - **Adminer DB Admin** (port 5050)

4. **Database Migration**:
   ```bash
   docker exec -it <container-name> npx prisma migrate deploy
   ```

### iOS App Setup

1. Open `app_ios/imageaiwrapper.xcodeproj` in Xcode.
2. Add your `GoogleService-Info.plist` to the project.
3. Configure Firebase Auth (Google/Apple) in the Firebase Console.
4. Build and run on a simulator or device.

---

## 📑 API Endpoints (Summary)

### Public Endpoints
- `GET /v1/templates` - List published AI style templates
- `GET /v1/templates/categories` - List template categories
- `GET /v1/templates/trending` - List trending templates

### User Endpoints (Firebase Auth Required)
- `POST /v1/users/register` - Register/update user profile (requires idToken)
- `POST /v1/images/process` - Process an image with selected AI template
- `GET /v1/images` - List user's processed images

### Admin Endpoints (Firebase Auth Required)
- `GET /v1/admin/templates` - List all templates (admin view)
- `POST /v1/admin/templates` - Create new template
- `PUT /v1/admin/templates/{slug}` - Update template
- `DELETE /v1/admin/templates/{slug}` - Delete template
- `POST /v1/admin/templates/{slug}/publish` - Publish template
- `POST /v1/admin/templates/{slug}/assets` - Upload template assets (thumbnail, preview, cover, sample)
- `DELETE /v1/admin/templates/{slug}/assets/{assetId}` - Delete template asset

### File Storage System
- **Automatic thumbnail generation** for uploaded images
- **File deduplication** using SHA256 hashing
- **Metadata extraction** (dimensions, format, quality)
- **Multiple asset types** per template (thumbnail, preview, cover, sample)
- **URL generation** based on `API_BASE_URL` environment variable

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
├── server/                 # NestJS backend service
│   ├── src/
│   │   ├── files/          # File storage service and controllers
│   │   ├── templates/      # Template management with asset system
│   │   ├── images/         # Image processing endpoints
│   │   ├── users/          # User profile management
│   │   ├── auth/           # Firebase authentication
│   │   └── prisma/         # Database schema and migrations
│   ├── public/             # Static file serving (thumbnails, uploads)
│   └── prisma/             # Database schema and migration files
├── docker/                 # Docker compose configuration
│   ├── docker-compose.yml  # Multi-service deployment
│   └── .env               # Production environment variables
├── web-cms/               # Admin panel for template management
├── landing-page/          # Public landing page
├── .documents/            # Source of truth for requirements, API, workflow
├── .memory-bank/          # Architecture, tech, product, context, tasks
├── .box-testing/          # Test data, scripts, sandbox code
├── swagger/openapi.yaml   # OpenAPI spec
└── README.md
```

---

## 📣 License

MIT License. See `LICENSE` file for details.
