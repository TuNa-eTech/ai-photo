# Web CMS - AI Image Stylist Admin

Web-based Admin CMS for managing templates in the AI Image Stylist system.

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **UI Framework**: Material UI 7 + Tailwind CSS 4
- **Routing**: React Router 7
- **State Management**: TanStack Query 5
- **HTTP Client**: Axios with envelope response handling
- **Authentication**: Firebase Auth (production) + DevAuth (local development)
- **Testing**: Vitest + React Testing Library + MSW

## Features

### Phase 1 (MVP) - ✅ Implemented

- ✅ Authentication with Firebase (Google Sign-In) or DevAuth
- ✅ Protected routes with automatic redirect
- ✅ API client with envelope response unwrapping
- ✅ Bearer token injection + 401 retry logic
- ✅ TypeScript types for all API contracts
- ✅ Templates API functions (CRUD + Assets management)
- 🔨 Templates List page (placeholder)
- 🔨 Template Detail page (placeholder)

### Phase 2 (To be implemented)

- ⏳ Full Templates CRUD UI with filters/pagination
- ⏳ Assets upload/management UI
- ⏳ Publish/Unpublish workflow
- ⏳ Comprehensive tests (unit + E2E)

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn package manager

### Environment Variables

Copy `.env.local` for local development:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080

# DevAuth (Local Development)
VITE_DEV_AUTH=1
VITE_DEV_AUTH_TOKEN=dev

# Firebase (Production) - uncomment and fill when deploying
# VITE_FIREBASE_API_KEY=
# VITE_FIREBASE_AUTH_DOMAIN=
# VITE_FIREBASE_PROJECT_ID=
# VITE_FIREBASE_STORAGE_BUCKET=
# VITE_FIREBASE_MESSAGING_SENDER_ID=
# VITE_FIREBASE_APP_ID=
```

### Installation

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Start dev server (port 5173)
yarn dev
```

Open http://localhost:5173 in your browser.

### Testing

#### Dev Auth Mode

When `VITE_DEV_AUTH=1`, the app uses simple token-based authentication:
- No Firebase required
- Click "Sign in (DevAuth)" on login page
- Token: `dev` (from `.env.local`)
- Mock user: `dev@example.com`

#### Firebase Mode

When `VITE_DEV_AUTH=0`:
- Requires Firebase project setup
- Google Sign-In popup
- Real Firebase authentication

### Build

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

### Linting

```bash
yarn lint
```

## Project Structure

```
web-cms/
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios client with envelope handling
│   │   └── templates.ts           # Templates API functions
│   ├── auth/
│   │   ├── firebase.ts            # Firebase initialization
│   │   ├── devAuth.ts             # DevAuth for local dev
│   │   ├── useAuth.ts             # Auth hook
│   │   └── ProtectedRoute.tsx    # Route guard component
│   ├── pages/
│   │   ├── Login/
│   │   │   └── LoginPage.tsx     # Login page
│   │   └── Templates/
│   │       ├── TemplatesListPage.tsx
│   │       └── TemplateDetailPage.tsx
│   ├── router/
│   │   └── routes.tsx             # App routes configuration
│   ├── types/
│   │   ├── envelope.ts            # Envelope response types
│   │   ├── template.ts            # Template types
│   │   ├── auth.ts                # Auth types
│   │   └── index.ts               # Type exports
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles + Tailwind
├── .env.example                   # Environment variables template
├── .env.local                     # Local development config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## API Integration

### Envelope Response Pattern

All API responses follow the envelope pattern:

```typescript
{
  success: boolean
  data: T | null
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  } | null
  meta: {
    requestId: string
    timestamp: string
  }
}
```

The API client automatically unwraps successful responses and converts errors to exceptions.

### Authentication

- **Header**: `Authorization: Bearer <token>`
- **Token Source**:
  - DevAuth: `VITE_DEV_AUTH_TOKEN` from env
  - Firebase: ID token from `currentUser.getIdToken()`
- **401 Handling**: Automatic token refresh + single retry

### API Endpoints

#### Public Templates
- `GET /v1/templates` - List templates (public + published)

#### Admin Templates
- `GET /v1/admin/templates` - List all templates with filters
- `GET /v1/admin/templates/:slug` - Get template detail
- `POST /v1/admin/templates` - Create template
- `PUT /v1/admin/templates/:slug` - Update template
- `DELETE /v1/admin/templates/:slug` - Delete template
- `POST /v1/admin/templates/:slug/publish` - Publish template
- `POST /v1/admin/templates/:slug/unpublish` - Unpublish template

#### Admin Assets
- `GET /v1/admin/templates/:slug/assets` - List assets
- `POST /v1/admin/templates/:slug/assets` - Upload asset (multipart)
- `PUT /v1/admin/templates/:slug/assets/:id` - Update asset
- `DELETE /v1/admin/templates/:slug/assets/:id` - Delete asset

## Testing the App

### 1. Start Backend Server

Make sure the NestJS backend is running on port 8080:

```bash
cd ../server
yarn start:dev
```

Or using Docker:

```bash
cd ../docker
docker compose up server
```

### 2. Start Web CMS

```bash
cd web-cms
yarn dev
```

### 3. Login

1. Open http://localhost:5173
2. You'll be redirected to `/login`
3. In DevAuth mode, click "Sign in (DevAuth)"
4. You'll be redirected to `/templates`

### 4. Verify Authentication

- Check that you see your email in the header
- Check that "Logout" button is visible
- Try accessing `/templates/:slug` - should work
- Try logout - should redirect to `/login`

## Development Guidelines

### Code Style

- Use TypeScript for all files
- Follow functional components + hooks pattern
- Use Material UI components for UI
- Use Tailwind utility classes for custom styling
- Prefer `async/await` over `.then()`

### API Client Usage

```typescript
import { getAdminTemplates } from '../api/templates'

// With TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['templates', filters],
  queryFn: () => getAdminTemplates(filters),
})

// Direct usage
try {
  const result = await getAdminTemplates({ limit: 20, offset: 0 })
  console.log(result.templates)
} catch (error) {
  if (error instanceof APIClientError) {
    console.error(error.code, error.message)
  }
}
```

### Authentication Usage

```typescript
import { useAuth } from '../auth'

function MyComponent() {
  const { user, loading, login, logout, getToken } = useAuth()

  if (loading) return <CircularProgress />
  if (!user) return <Navigate to="/login" />

  return <div>Welcome {user.email}</div>
}
```

## Documentation

See `.documents/` folder for comprehensive documentation:
- `.documents/platform-guides/web-cms.md` - Web CMS architecture
- `.documents/features/template-spec.md` - Template API spec
- `.documents/api/standards.md` - API envelope standard
- `swagger/openapi.yaml` - API specification

## License

Private - Internal use only
