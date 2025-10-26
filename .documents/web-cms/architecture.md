# Web CMS Architecture

Last updated: 2025-10-26

## Overview

The Web CMS is a professional admin interface built with modern web technologies for managing AI image templates and testing image generation capabilities.

## Tech Stack

- **Framework**: Vite 7 + React 19
- **Language**: TypeScript 5.9
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Query v5 (for server state)
- **Routing**: React Router v7
- **Authentication**: Firebase Auth
- **HTTP Client**: Axios
- **Date Formatting**: date-fns v4
- **Build Tool**: Vite with TypeScript

## Project Structure

```
web-cms/
├── src/
│   ├── api/                    # API client layer
│   │   ├── client.ts          # Base axios client with interceptors
│   │   ├── templates.ts       # Templates API functions
│   │   └── images.ts          # Image processing API
│   ├── auth/                   # Authentication
│   │   ├── AuthContext.tsx    # Firebase auth context
│   │   ├── hooks/             # Auth hooks (useAuth)
│   │   └── ProtectedRoute.tsx # Route guard
│   ├── components/             # UI components
│   │   ├── common/            # Shared components
│   │   │   ├── LoadingState.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── dashboard/         # Dashboard components
│   │   │   └── StatsCard.tsx
│   │   ├── layout/            # Layout components
│   │   │   └── AppLayout.tsx  # Main app layout
│   │   └── templates/         # Template-specific components
│   │       ├── TemplateTable.tsx
│   │       ├── TemplateFormDialog.tsx
│   │       ├── TemplateInfoCard.tsx
│   │       ├── ImageGeneratorForm.tsx
│   │       ├── ResultDisplay.tsx
│   │       └── TemplatesFilters.tsx
│   ├── pages/                  # Page components
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── Templates/
│   │   │   ├── TemplatesListPage.tsx
│   │   │   └── TemplateDetailPage.tsx
│   │   └── Login/
│   │       └── LoginPage.tsx
│   ├── router/
│   │   └── routes.tsx         # Route configuration
│   ├── theme/
│   │   └── theme.ts           # Material-UI theme
│   ├── types/
│   │   ├── template.ts        # Template types
│   │   └── index.ts           # Exported types
│   ├── App.tsx                # Root component
│   └── main.tsx               # Entry point
├── public/                     # Static assets
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Key Components

### 1. API Client Layer

#### Base Client (`api/client.ts`)
- Axios instance with base URL configuration
- Request interceptor: injects Firebase auth token
- Response interceptor: unwraps envelope format
- Error handling with custom APIClientError class
- Token refresh on 401 errors

```typescript
// Envelope format
{
  data: T,           // Success response
  meta?: { ... }     // Optional metadata
}

// Error format
{
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

#### Templates API (`api/templates.ts`)
- `getAdminTemplates()` - List templates with filters
- `getAdminTemplate(slug)` - Get single template
- `createTemplate(data)` - Create new template
- `updateTemplate(slug, data)` - Update template
- `deleteTemplate(slug)` - Delete template
- `publishTemplate(slug)` - Publish template
- `unpublishTemplate(slug)` - Unpublish template

#### Images API (`api/images.ts`)
- `processImage(request)` - Process image with AI template
- `uploadImage(file)` - Upload image file (future)

### 2. Theme System (`theme/theme.ts`)

Custom Material-UI theme with professional design:

```typescript
{
  palette: {
    primary: { main: '#3f51b5' },    // Indigo
    secondary: { main: '#009688' },   // Teal
    background: {
      default: '#f4f6f8',            // Light gray
      paper: '#ffffff'                // White
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1-h6: { ... }                   // Consistent hierarchy
  },
  spacing: 8,                         // 8px base unit
  shape: { borderRadius: 8 },        // Soft corners
  components: {
    MuiButton: { ... },              // Custom button styles
    MuiPaper: { ... },               // Custom paper styles
    // ... more overrides
  }
}
```

### 3. Layout Components

#### AppLayout (`components/layout/AppLayout.tsx`)
- Main application layout with navigation
- Features:
  - Top AppBar with logo and navigation tabs
  - User menu with email display and logout
  - Active route highlighting
  - Beta badge
  - Nested routes with React Router Outlet

### 4. Page Components

#### Dashboard (`pages/Dashboard/DashboardPage.tsx`)
- Overview page with key metrics
- Features:
  - Stats cards (Total, Published, Drafts, Usage)
  - Recent templates list (last 5)
  - Quick navigation to templates

#### Templates List (`pages/Templates/TemplatesListPage.tsx`)
- Main templates management page
- Features:
  - Advanced filters (search, status, visibility, tags, sort)
  - Create new template button
  - Templates table with actions (edit, delete, publish/unpublish, view)
  - Pagination
  - Snackbar notifications

#### Template Detail (`pages/Templates/TemplateDetailPage.tsx`)
- Comprehensive template view and testing
- Features:
  - 2-column layout (info + generator)
  - Template information display
  - Image generator form (upload/URL)
  - Side-by-side result comparison
  - Edit dialog integration
  - Loading and error states

### 5. Template Components

#### TemplateInfoCard (`components/templates/TemplateInfoCard.tsx`)
- Displays full template information
- Features:
  - Large thumbnail display
  - Status and visibility badges
  - Tags display
  - Usage statistics
  - AI Configuration accordion (prompt, model)
  - Metadata accordion (slug, ID, dates)
  - Edit button

#### ImageGeneratorForm (`components/templates/ImageGeneratorForm.tsx`)
- Form for testing image generation
- Features:
  - Dual input mode (Upload File / Paste URL) with tabs
  - File validation (type, size)
  - URL validation (format)
  - Image preview (4:3 ratio)
  - Generate button with loading state
  - Error handling and display

#### ResultDisplay (`components/templates/ResultDisplay.tsx`)
- Displays generation results
- Features:
  - Side-by-side comparison (Original | Processed)
  - 1:1 aspect ratio boxes
  - Zoom buttons (opens full size)
  - Download button
  - Compare button (opens both images)
  - Responsive grid layout

#### TemplateFormDialog (`components/templates/TemplateFormDialog.tsx`)
- Create/Edit template dialog
- Features:
  - Tabbed interface (4 tabs):
    1. Basic Info: name, slug, description
    2. AI Prompts: prompt, negative prompt, model config
    3. Media: thumbnail upload with preview
    4. Settings: status, visibility, tags
  - Character counters (prompt: 2000, negative prompt: 1000)
  - Validation and error display
  - Loading states
  - Responsive design

#### TemplateTable (`components/templates/TemplateTable.tsx`)
- Modern table with enhanced UX
- Features:
  - Large thumbnails (56x56px)
  - Multi-line template info
  - Color-coded status chips
  - Tags with overflow indicator
  - Hover effects
  - Icon-based action buttons with tooltips
  - Empty state display

### 6. Common Components

#### LoadingState (`components/common/LoadingState.tsx`)
- Centered loading spinner with message
- Used for page-level loading

#### EmptyState (`components/common/EmptyState.tsx`)
- Professional empty state display
- Features icon, title, description, and action button

## Authentication Flow

1. User navigates to Web CMS
2. `ProtectedRoute` checks auth state
3. If not authenticated → redirect to `/login`
4. User logs in with Firebase (email/password)
5. Firebase returns ID token
6. Token stored in Firebase Auth context
7. API client injects token in all requests
8. Backend validates token with Firebase Admin SDK

## Data Flow

### Templates List Flow
```
1. User opens /templates
2. TemplatesListPage renders
3. React Query fetches getAdminTemplates()
4. API client calls GET /v1/admin/templates with filters
5. Backend returns { data: { templates: [...], meta: {...} } }
6. Response unwrapped by interceptor
7. Data displayed in TemplateTable
```

### Image Generation Flow
```
1. User navigates to /templates/{slug}
2. TemplateDetailPage fetches template data
3. User uploads/pastes image in ImageGeneratorForm
4. User clicks "Generate Image"
5. Form validates input
6. Calls processImage({ template_id, image_path })
7. API client posts to /v1/images/process
8. Backend processes image (10-30s)
9. Returns { processed_image_url }
10. ResultDisplay shows side-by-side comparison
```

## State Management

### Server State (React Query)
- All API calls managed by React Query
- Automatic caching and revalidation
- Query keys for cache invalidation
- Loading and error states handled automatically

```typescript
// Example usage
const { data, isLoading, error } = useQuery({
  queryKey: ['templates', 'admin'],
  queryFn: () => getAdminTemplates(filters)
})
```

### Local State (React Hooks)
- Component-level state with useState
- Form state management
- Dialog open/close states
- Snackbar notifications

## Styling Approach

1. **Material-UI Components**: Primary UI building blocks
2. **Custom Theme**: Consistent colors, typography, spacing
3. **sx Prop**: Inline styles for one-off customizations
4. **Component Overrides**: Global style overrides in theme

```typescript
// Example
<Button
  variant="contained"
  sx={{
    py: 1.5,              // padding-y: 1.5 * 8px = 12px
    fontWeight: 600,
    '&:hover': {
      bgcolor: 'primary.dark'
    }
  }}
>
  Generate
</Button>
```

## Responsive Design

- Mobile-first approach
- Breakpoints: xs, sm, md, lg, xl
- Grid system with flexbox
- Responsive typography
- Stack/collapse layouts on mobile

## Error Handling

1. **API Errors**: Caught by API client, wrapped in APIClientError
2. **UI Display**: Snackbar notifications for user feedback
3. **Form Validation**: Inline error messages
4. **Loading States**: Skeleton screens and spinners
5. **Empty States**: Professional empty state components

## Build & Deployment

### Development
```bash
cd web-cms
yarn install
yarn dev           # Runs on http://localhost:5173
```

### Production Build
```bash
yarn build         # Output: dist/
yarn preview       # Preview production build
```

### Environment Variables
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... other Firebase config
```

## Testing Strategy (Future)

1. **Unit Tests**: Component logic with Vitest
2. **Integration Tests**: API client with MSW
3. **E2E Tests**: User flows with Playwright
4. **Visual Regression**: Storybook + Chromatic

## Performance Optimizations

1. **Code Splitting**: Lazy load routes with React.lazy()
2. **Image Optimization**: Responsive images with srcset
3. **Caching**: React Query automatic caching
4. **Bundle Analysis**: Vite bundle analyzer
5. **Tree Shaking**: Automatic with Vite

## Security

1. **Authentication**: Firebase Auth with JWT tokens
2. **CORS**: Backend configured for Web CMS origin
3. **XSS Prevention**: React auto-escapes content
4. **CSRF**: Not applicable (stateless JWT)
5. **Input Validation**: Client-side + server-side

## Future Enhancements

1. **Async Image Processing**: Polling mechanism every 2s
2. **File Upload**: Direct file upload to backend
3. **Test History**: Store and display previous tests
4. **Advanced Analytics**: Charts and usage metrics
5. **Bulk Operations**: Multi-select and batch actions
6. **Dark Mode**: Theme toggle
7. **Internationalization**: Multi-language support
8. **Real-time Updates**: WebSocket for live notifications

## References

- [Material-UI Documentation](https://mui.com/)
- [React Query Documentation](https://tanstack.com/query)
- [Vite Documentation](https://vitejs.dev/)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- `.implementation_plan/ui-ux-redesign-summary.md` - UI/UX redesign details
- `.implementation_plan/template-detail-page-summary.md` - Template detail implementation

