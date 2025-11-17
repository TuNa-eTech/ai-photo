# Web CMS Platform Guide

## Overview

Web-based Content Management System for managing AI image templates, assets, and administrative operations.

**Base URL**: `http://localhost:5173` (development)

**Technology Stack**:
- React 18 with TypeScript
- Material-UI (MUI) v5 for UI components
- Vite for development and building
- Axios for HTTP client with envelope response handling

**Authentication**:
- Firebase Authentication in production
- Development authentication for local development
- Auto-refresh token handling with 401 retry logic

## Core Features

### Template Management

The Web CMS provides comprehensive template management capabilities:

#### List & Filter Templates
- **Location**: `/templates`
- **Features**:
  - Search by name or slug
  - Filter by status (draft, published, archived)
  - Filter by visibility (public, private)
  - Filter by trending status (all, manual trending, not trending)
  - Sort by (updated, newest, popular, name)
  - Tag-based filtering
  - Real-time pagination and loading states

#### Template Table Display
- **Thumbnail Preview**: Visual representation of each template
- **Status Indicators**: Color-coded chips for status and visibility
- **Trending Badges**: =% Visual indicators for manually marked trending templates
- **Tags Display**: Scrollable tag list with "show more" indicators
- **Usage Metrics**: Formatted usage count with locale formatting
- **Published Dates**: Relative time display ("2 days ago")
- **Action Buttons**: View, Edit, Trending toggle, Publish/Unpublish, Delete

#### Template CRUD Operations
- **Create**: New template creation with auto-generated slugs
- **Edit**: Full template field editing with immediate validation
- **Publish**: One-click publishing with thumbnail validation
- **Delete**: Safe deletion with confirmation dialogs
- **Assets**: Image upload and management (thumbnail, preview, cover)

### Trending Template Management P NEW

The trending system allows administrators to highlight popular or featured templates:

#### Manual Trending Control
- **Toggle Trending**: Click the fire icon in the template table to toggle trending status
- **Visual Indicators**: Orange animated fire badges for trending templates
- **Bulk Operations**: Filter by trending status to manage multiple templates
- **Trending Filter**: Dedicated filter dropdown with options:
  - "All Templates" - Show all templates regardless of trending status
  - "=% Manual Trending" - Show only manually marked trending templates
  - "Not Trending" - Show templates not marked as trending

#### Trending Badge Component
- **Size Variants**: Small, medium, large for different UI contexts
- **Animation**: Subtle pulse effect for trending items
- **Tooltips**: Contextual information on hover
- **Responsive**: Adapts to different screen sizes

#### API Integration
- **POST** `/v1/admin/templates/{slug}/trending` - Mark template as trending
- **DELETE** `/v1/admin/templates/{slug}/trending` - Remove from trending
- **Query Parameter**: `trending=manual|none|all` for filtering

## UI Components

### TemplateTable Component
- **Location**: `web-cms/src/components/templates/TemplateTable.tsx`
- **Features**:
  - Responsive table design with Material-UI Paper elevation
  - Hover effects and row selection
  - Inline status and trending indicators
  - Action button groups with tooltip guidance
  - Empty state handling with call-to-action
  - Loading states with skeleton placeholders

### TemplatesFilters Component
- **Location**: `web-cms/src/components/templates/TemplatesFilters.tsx`
- **Features**:
  - Search field with icon and clear functionality
  - Multi-select dropdowns for status, visibility, and trending
  - Tag input with comma-separated format
  - Reset button to clear all active filters
  - Responsive layout with flexbox wrapping

### TrendingBadge Component
- **Location**: `web-cms/src/components/common/TrendingBadge.tsx`
- **Features**:
  - Multiple size options (small, medium, large)
  - Icon and text variations
  - Animated pulse effect for trending items
  - Customizable tooltips
  - Accessibility support with ARIA labels

### TemplateFormDialog Component
- **Location**: `web-cms/src/components/templates/TemplateFormDialog.tsx`
- **Features**:
  - Modal form with validation
  - Auto-slug generation from template name
  - Tag management with autocomplete
  - Image upload integration
  - Real-time field validation
  - Save draft and publish actions

## API Client & Data Handling

### API Client Configuration
- **Base Client**: `web-cms/src/api/client.ts`
- **Features**:
  - Envelope response unwrapping
  - Automatic 401 token refresh and retry
  - Error handling with user-friendly messages
  - Request/response interceptors
  - Bearer token authentication

### Template API Functions
- **Location**: `web-cms/src/api/templates.ts`
- **Functions**:
  - `getAdminTemplates()` - List with filtering and pagination
  - `getAdminTemplate()` - Single template details
  - `createTemplate()` - Create new template
  - `updateTemplate()` - Update existing template
  - `deleteTemplate()` - Delete template
  - `publishTemplate()` / `unpublishTemplate()` - Status management
  - `setTemplateTrending()` / `unsetTemplateTrending()` - Trending control

### Type Definitions
- **Location**: `web-cms/src/types/template.ts`
- **Key Types**:
  - `TemplateAdmin` - Full template interface with camelCase fields
  - `AdminTemplatesQueryParams` - Query parameters with trending filter
  - `CreateTemplateRequest` / `UpdateTemplateRequest` - API request types
  - `TemplateAsset` - Asset management types

## Response Format Standards

### Envelope Pattern
All API responses follow a consistent envelope format:

```json
{
  "success": true,
  "data": {
    "templates": [...]
  },
  "error": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-11-17T10:00:00Z"
  }
}
```

### Field Naming Convention
- **Frontend**: Uses camelCase (e.g., `thumbnailUrl`, `publishedAt`, `usageCount`)
- **API Response**: Returns camelCase fields directly from backend
- **Database**: Uses snake_case (handled by service layer transformation)

## Development Workflow

### Local Development
```bash
cd web-cms
yarn install
yarn dev    # Start development server at http://localhost:5173
yarn build  # Build for production
yarn preview # Preview production build
```

### Environment Configuration
- **Development**: Uses `http://localhost:8080` for backend API
- **Production**: Uses configured backend URL via environment variables
- **Authentication**: Firebase config for production, dev auth for local

### Testing
```bash
cd web-cms
yarn test           # Run unit tests with Vitest
yarn test:ui        # Run tests with UI interface
yarn test:coverage  # Generate coverage report
```

## Styling & Design System

### Material-UI Theming
- **Primary Color**: Indigo (#3f51b5)
- **Secondary Color**: Pink (#e91e63)
- **Success**: Green (#4caf50)
- **Warning**: Orange (#ff9800)
- **Error**: Red (#f44336)

### Design Principles
- **Responsive**: Mobile-first design with breakpoint considerations
- **Accessible**: WCAG 2.1 AA compliance with proper ARIA labels
- **Consistent**: Unified spacing, typography, and component usage
- **Performance**: Optimized rendering with React.memo and lazy loading

### Custom Components
- **Glass morphism effects**: Modern glass-like appearance for cards
- **Animated transitions**: Smooth state changes and hover effects
- **Loading skeletons**: Professional loading state placeholders
- **Empty states**: Helpful empty state illustrations and actions

## Security Considerations

### Authentication Flow
- Firebase ID token verification
- Automatic token refresh on expiry
- Secure token storage in memory
- 401 error handling with automatic retry

### Input Validation
- Client-side validation with real-time feedback
- Server-side validation as authoritative source
- XSS protection through proper sanitization
- File upload validation with type and size limits

### Error Handling
- User-friendly error messages
- Graceful degradation for API failures
- Consistent error logging and monitoring
- Recovery actions for common error scenarios

## Performance Optimizations

### Bundle Optimization
- Code splitting with lazy loading
- Tree shaking for unused dependencies
- Image optimization and lazy loading
- Service worker for caching strategies

### API Optimizations
- Request debouncing for search inputs
- Pagination for large data sets
- Optimistic updates for better UX
- Response caching with proper invalidation

## Deployment & Production

### Build Process
```bash
cd web-cms
yarn build
# Output: dist/ directory
```

### Environment Variables
- `VITE_API_BASE_URL` - Backend API endpoint
- `VITE_FIREBASE_CONFIG` - Firebase authentication configuration
- `VITE_APP_VERSION` - Application version identifier

### Hosting Considerations
- Static hosting compatible (Vercel, Netlify, AWS S3)
- Proper cache headers for assets
- SEO optimization with meta tags
- Progressive Web App capabilities

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live template updates
- **Advanced Analytics**: Usage analytics and template performance metrics
- **Batch Operations**: Multi-select for bulk template operations
- **Advanced Search**: Full-text search with highlighting
- **Template Categories**: Hierarchical category management
- **Preview System**: Interactive template preview with sample images

### Technical Improvements
- **Offline Support**: Service worker for offline template management
- **Performance Monitoring**: Real user monitoring (RUM) integration
- **Internationalization**: Multi-language support with i18n
- **Accessibility**: Enhanced keyboard navigation and screen reader support
- **Mobile App**: Progressive Web App with mobile-optimized interface