# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 2025-11-17 - Trending Template Management System ⭐

#### Added - Web CMS Trending Features
- **Trending Badge Component**: New `TrendingBadge` component with animated fire icons
  - Multiple size options (small, medium, large) with responsive design
  - Animated pulse effect for trending items using CSS keyframes
  - Orange color scheme (#ff9800) with hover effects
  - Accessible tooltips and ARIA labels for screen readers
- **Template Table Enhancements**: Added dedicated trending column and controls
  - Fire icon buttons in actions column for quick trending toggle
  - Visual trending badge display in dedicated column
  - Tooltip guidance ("Mark as trending" / "Remove from trending")
  - Hover effects with color transitions
- **Advanced Filtering**: Enhanced template filtering with trending options
  - "All Templates" - Shows all templates regardless of trending status
  - "🔥 Manual Trending" - Shows only manually marked trending templates
  - "Not Trending" - Shows templates not marked as trending
  - Filter works in combination with existing filters (status, visibility, tags)

#### Added - Backend Trending API
- **New Endpoints**: Manual trending control endpoints
  - `POST /v1/admin/templates/{slug}/trending` - Mark template as trending
  - `DELETE /v1/admin/templates/{slug}/trending` - Remove from trending
  - `GET /v1/admin/templates?trending=manual|none|all` - Filter by trending status
- **Enhanced DTOs**: Updated template creation/update DTOs
  - `isTrendingManual?: boolean` field added to both create and update DTOs
  - Proper validation and default value handling
- **Service Layer**: Added `setTrending()` method for status management
  - Updates database field `isTrendingManual`
  - Returns updated template with transformed camelCase fields

#### Fixed - API Response Field Naming 🐛
- **Problem**: Backend returned snake_case fields while frontend expected camelCase
- **Solution**: Updated backend service to return camelCase fields directly
  - `thumbnail_url` → `thumbnailUrl`
  - `published_at` → `publishedAt`
  - `usage_count` → `usageCount`
  - `negative_prompt` → `negativePrompt`
  - `model_provider` → `modelProvider`
  - `model_name` → `modelName`
  - `created_at` → `createdAt`
  - `updated_at` → `updatedAt`
  - `is_trending_manual` → `isTrendingManual`
- **Frontend Updates**: Updated all type definitions and components to use camelCase
  - Updated `TemplateAdmin` interface in `web-cms/src/types/template.ts`
  - Updated all template components to use camelCase properties
  - Fixed TypeScript compilation errors across all template files

#### Enhanced - Documentation Updates
- **API Documentation**: Updated `.documents/api/admin-templates-api.md`
  - Added trending management endpoints documentation
  - Updated query parameters to include trending filter
  - Updated response examples to show camelCase fields and trending data
- **Platform Guide**: Created comprehensive `.documents/platform-guides/web-cms.md`
  - Complete web-cms architecture and feature documentation
  - Detailed trending system implementation guide
  - Component documentation with examples and usage patterns
- **Template Spec**: Updated `.documents/features/template-spec.md`
  - Added trending management section with API endpoints
  - Updated changelog to version 1.2 with trending features
  - Documented camelCase response format
- **Implementation Summary**: Updated `.documents/implementation-summary-admin-templates.md`
  - Added trending system implementation details
  - Updated to Phase 3 with comprehensive testing checklist
  - Added changelog with version history

#### Technical Implementation Details
- **Component Architecture**: Reusable `TrendingBadge` component for consistency
  - Props: `isTrendingManual`, `size`, `showIcon`, `tooltip`
  - Animated state transitions with CSS transforms
  - Material-UI theming integration
- **State Management**: Client-side state with optimistic updates
  - Immediate UI updates before API response
  - Error handling with rollback on failure
  - Consistent state across filter and table components
- **API Integration**: Enhanced API client with trending support
  - `setTemplateTrending()` and `unsetTemplateTrending()` functions
  - Updated `getAdminTemplates()` with trending filter parameter
  - Proper error handling and response transformation

### 2025-01-XX - Project Storage & Management

#### Added - Project Delete Functionality ⭐
- **iOS**: Delete projects from grid view and detail view
  - Delete button (X icon) on each project card (top-right corner)
  - Context menu (long press) for delete option
  - Delete button in project detail view toolbar
  - Confirmation dialog before deletion (prevents accidental deletion)
  - Haptic feedback on delete action
  - Error handling with alert messages
  - Auto-refresh project list after deletion
  - Image cache cleanup after deletion
- **Implementation**: 
  - `MyProjectsView`: Added delete UI (button, context menu, confirmation dialog)
  - `ProjectDetailView`: Added delete button in toolbar
  - `ProjectsViewModel.deleteProject()`: Enhanced error handling and logging
  - `ProjectsStorageManager.deleteProject()`: Removes project and associated image files

#### Fixed - Duplicate Project Creation 🐛
- **Root Cause**: Background URLSession delegate called multiple times on app relaunch without duplicate checks
- **Solution**: 
  - Added `requestId` tracking in `UserDefaults` to prevent duplicate saves
  - Check `requestId` before saving project
  - Fallback duplicate detection by `templateId + createdAt` (within 5 seconds window)
  - Reload from disk before duplicate check to ensure latest data
- **Implementation**:
  - `ProjectsStorageManager.saveProject()`: Added `requestId` parameter and duplicate detection
  - `BackgroundImageProcessor`: Pass `requestId` when saving projects
  - `savedRequestIds` stored in UserDefaults with cleanup (limits to 500 most recent)
  - Automatic cleanup of old request IDs (>1000 entries)

#### Fixed - Projects Not Appearing After App Restart 🐛
- **Root Cause**: `getAllProjects()` only returned in-memory cache, not reloading from disk
- **Solution**: 
  - `getAllProjects()` now always reloads from disk before returning
  - Added `reloadProjectsFromDisk()` public method for force reload
  - Improved migration logic to preserve data if migration fails
  - Better error handling: don't clear cache on decode failure (preserve existing data)
- **Implementation**:
  - `ProjectsStorageManager.getAllProjects()`: Calls `reloadProjectsFromDisk()` before returning
  - `ProjectsStorageManager.reloadProjectsFromDisk()`: Public method with proper error handling
  - Migration only removes old directory after successful verification
  - Decode errors log warnings but preserve existing cache

#### Added - Persistent Pending Tasks
- **Background Processing**: Pending tasks now persist to UserDefaults
  - Restore pending tasks on app restart
  - Handle background URLSession delegate callbacks correctly
  - Cleanup old pending tasks (>24 hours)
  - Validation: Only restore tasks if temp files still exist
- **Implementation**:
  - `BackgroundImageProcessor.persistPendingTasks()`: Save to UserDefaults
  - `BackgroundImageProcessor.restorePendingTasks()`: Restore on init
  - `BackgroundImageProcessor.cleanupOldPendingTasks()`: Remove stale tasks

#### Changed - Project Storage Location
- **Migration**: Projects moved from Documents to Application Support directory
  - Application Support: Hidden from Files app, better for app-specific data
  - Automatic migration from old location on first launch
  - File protection: `completeUntilFirstUserAuthentication` for privacy
  - Safe migration: Only removes old directory after successful migration
- **Storage Structure**:
  - `Application Support/Projects/projects.json` - Project metadata
  - `Application Support/Projects/{projectId}.jpg` - Processed images
  - `Application Support/Projects/{projectId}-metadata.json` - Image metadata

### 2025-10-26 (PM) - Critical Fixes & Trending API

#### Added - Trending Templates API ⭐
- **Backend**: New `GET /v1/templates/trending` endpoint
  - Returns templates with `usage_count >= 500` sorted by usage DESC
  - Query params: `limit` (max 50), `offset`
  - Optimized for Home screen performance (server-side filtering vs client-side)
  - Implemented in `TemplatesController.listTrending()` and `TemplatesService.listTrendingTemplates()`
  - Full OpenAPI/Swagger documentation with examples
- **iOS**: `TemplatesRepository.listTrendingTemplates()` protocol method
  - `HomeViewModel.fetchTrendingFromAPI()` for Home screen
  - `HomeViewModel.fetchAllTemplatesFromAPI()` for AllTemplatesView

#### Fixed - Critical iOS Image Loading Bug 🐛
- **Root Cause**: JSONDecoder `.convertFromSnakeCase` + explicit CodingKeys = CONFLICT
  - `.convertFromSnakeCase` converted `thumbnail_url` → `thumbnailUrl` (lowercase "u")
  - Swift property was `thumbnailURL` (uppercase "URL" per Swift conventions)
  - Decoder ignored explicit CodingKeys, tried to decode non-existent key
  - Result: `thumbnailURL = nil` (silent failure)
- **Solution**: Created custom JSONDecoder in `TemplatesRepository` WITHOUT `.convertFromSnakeCase`
  - Only sets `.iso8601` for date decoding
  - Relies on explicit CodingKeys for snake_case → camelCase mapping
- **Impact**: All thumbnail images now load correctly from backend

#### Changed - iOS Home Screen Simplification (MVP)
- **Simplified UI Design**:
  - Removed: Search bar, filters, categories, featured carousel, recent results
  - New user experience: Only "Trending Templates" section with "See All" button
  - Existing user experience: "My Projects" history + condensed trending list (6 items)
  - Created `SimpleHeader.swift` (avatar + greeting + settings only)
  - Created `AllTemplatesView.swift` for full templates with search/filters
  - Created `Project.swift` model for future user projects feature
- **UI Improvements**:
  - Removed blur effect from `CardGlassSmall` images (clear thumbnails)
  - Added gradient overlay on card bottoms for text readability
  - Increased card height (180→200pt), improved spacing (12→14pt)
  - Text: white with shadow for contrast on images
  - Added template count display and empty state UI
  - Better "See All" button styling (capsule with background)
- **State Management Fix**:
  - Changed `HomeViewModel` from `let` to `@State private var` in `TemplatesHomeView`
  - Prevents ViewModel re-initialization on view updates
  - Ensures data persistence across UI refreshes

#### Added - iOS Debug Logging
- `TemplateDTO.init(from:)` logs URL creation failures in DEBUG
- `TemplatesRepository` logs decoded template counts and sample data
- `HomeViewModel` logs each DTO's thumbnail URL during mapping
- `CardGlassSmall` logs image loading attempts with full URLs
- Enables easy troubleshooting of network/decoding issues

#### Added - Documentation & Guides
- Created `SIMULATOR_NETWORK_FIX.md` - iOS Simulator network troubleshooting
  - Explains why Simulator can't access `localhost`
  - Step-by-step guide to use Mac's IP address
  - Backend configuration requirements
  - Multiple solutions (IP address, ngrok, physical device)
- Created `.implementation_plan/trending-templates-api-plan.md`
  - Full implementation plan with status checklist
  - Design, testing, deployment steps
- Updated OpenAPI spec (`swagger/openapi.yaml`) with trending endpoint
- Updated all memory bank files with critical learnings
- Updated `.documents/platform-guides/ios.md` with:
  - **Critical Patterns & Gotchas** section (JSONDecoder, Simulator network)
  - Updated code examples with fixes
  - Expanded troubleshooting section
  - Updated project structure

#### Changed - TemplateDTO Improvements
- Updated `isTrending` threshold: `100` → `500` (more selective)
- Added custom `init(from decoder:)` for graceful URL decoding
- Added debug logging for URL creation failures

### 2025-10-26 (AM) - Templates API Integration (iOS ↔ Backend) ✅

**Backend Security & Enhancements**
- **Security Filters**: `/v1/templates` now only returns `published` + `public` templates to end users
- **Tags Filtering**: Implemented `tags` query parameter with Prisma `hasSome` query
- **Response Mapping**: Comprehensive `DbTemplate` → `ApiTemplate` mapping with snake_case fields
- **Type Safety**: Clear separation between public (`ApiTemplate`) and admin (`ApiTemplateAdmin`) types

**iOS DTOs & ViewModels**
- **TemplateDTO Updates**:
  - Added `publishedAt: Date?` and `usageCount: Int?` fields
  - Computed property `isNew` (published within 7 days)
  - Computed property `isTrending` (usage count >= 100)
  - Conforms to `Hashable` and `Identifiable` for SwiftUI collections
- **Repository Protocol Pattern**:
  - Created `TemplatesRepositoryProtocol` for dependency injection and testability
  - `TemplatesRepository` implements protocol with real API client
  - `MockTemplatesRepository` for isolated unit testing
- **HomeViewModel Enhancements**:
  - `fetchFromAPI()` now consumes real backend data via repository protocol
  - Dynamic subtitle generation: "New • Popular • 150 uses"
  - Dynamic tag generation: "New", "Trending", "Popular"
  - Featured templates prioritize trending/new items (max 3)
  - Changed `favorites` to `private(set)` with `toggleFavorite()` method
- **UI Components**:
  - Updated `CardGlassSmall` and `CardGlassLarge` with `AsyncImage` for real thumbnails
  - SF Symbols as fallback when `thumbnailURL` is nil
  - Loading states with `ProgressView`

**Comprehensive Test Coverage (85 tests - 100% passing)**
- **Backend Unit Tests (23)**:
  - `TemplatesService.listTemplates()`: security filters, search, tags, sorting, pagination, response mapping
  - Test files: `server/src/templates/templates.service.spec.ts`
- **Backend E2E Tests (15)**:
  - `/v1/templates` endpoint with DevAuth
  - Query parameters: `limit`, `offset`, `q`, `tags`, `sort`
  - Response format validation (snake_case, null omission)
  - Edge cases (empty results, error handling)
  - Test files: `server/test/templates.e2e-spec.ts`
- **iOS Unit Tests (47)**:
  - **TemplateDTO Tests (20)**: Decoding, computed properties, Hashable, Identifiable
  - **HomeViewModel Tests (27)**: Initialization, API fetching, template mapping, filtering, search, favorites, featured logic
  - Uses Swift Testing framework (`@Test`, `@Suite`)
  - Mock pattern with `MockTemplatesRepository` conforming to protocol
  - Fixed async timing issues (100ms sleep for Task completion)
  - Test files: `AIPhotoAppTests/TemplateDTOsTests.swift`, `AIPhotoAppTests/HomeViewModelTests.swift`

**Files Updated**
- Backend: `templates.service.ts`, `templates.service.spec.ts`, `templates.e2e-spec.ts`
- iOS: `TemplatesDTOs.swift`, `TemplatesRepository.swift`, `HomeViewModel.swift`, `GlassComponents.swift`
- iOS Tests: `TemplateDTOsTests.swift`, `HomeViewModelTests.swift`
- Documentation: Updated memory bank and test workflows

**Testing Commands**
- Backend: `yarn test templates.service.spec.ts`, `yarn test:e2e templates.e2e-spec.ts`
- iOS: `xcodebuild test -scheme AIPhotoApp -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:AIPhotoAppTests -parallel-testing-enabled NO`

#### Added - Web CMS Template Detail Page
- **Template Detail Page** with 2-column layout (info + generator)
  - `TemplateInfoCard` component: displays full template information with accordions
  - `ImageGeneratorForm` component: dual-mode input (file upload / URL paste) with validation
  - `ResultDisplay` component: side-by-side comparison of original and processed images
  - Image processing API client (`api/images.ts`)
  - Loading states, error handling, and user feedback (snackbars)
  - Full TypeScript typing and integration with React Query

#### Added - Web CMS Professional UI/UX Redesign
- **Custom Material-UI Theme**: Indigo primary (#3f51b5) + Teal secondary (#009688), Inter font
- **AppLayout Component**: Navigation bar with logo, menu tabs, user dropdown
- **Enhanced TemplateFormDialog**: Tabbed interface (Basic Info, AI Prompts, Media, Settings)
  - Character counters for prompt fields (2000/1000 characters)
  - Model configuration accordion
  - Improved visual hierarchy
- **Redesigned TemplateTable**: 
  - Modern design with hover effects
  - Larger thumbnails (56x56px)
  - Color-coded status chips
  - Enhanced action buttons with tooltips
- **Dashboard Page**: Stats cards (Total, Published, Drafts, Usage) and recent templates list
- **Utility Components**: `LoadingState`, `EmptyState` for consistent UX
- **Responsive Filters**: Flexbox layout replacing old Grid system

#### Added - Prompt Fields Implementation (Phase 1)
- **Database Schema**: Added `prompt`, `negativePrompt`, `modelProvider`, `modelName` fields to Template model
- **Migration**: `20251026115941_add_prompt_fields`
- **DTOs**: Updated `CreateTemplateDto` and `UpdateTemplateDto` with new fields
- **Service Layer**: Updated service to handle prompt fields
- **Web CMS**: Full UI support for prompt fields in forms and display
- **Sample Data**: Updated all 13 templates with realistic AI prompts

#### Documentation
- Created `.implementation_plan/ui-ux-redesign-summary.md` - Complete UI/UX redesign details
- Created `.implementation_plan/template-detail-page-summary.md` - Template detail implementation
- Created `.documents/web-cms/architecture.md` - Web CMS architecture documentation
- Created `web-cms/README.md` - Setup and development guide
- Updated `.memory-bank/context.md` - Current work focus and recent changes
- Updated `.memory-bank/architecture.md` - Web CMS architecture overview

#### Changed
- Web CMS now uses Material-UI v7 with professional theme throughout
- Replaced Grid components with Stack/Box for better compatibility
- Template detail page now has dedicated route (`/templates/:slug`)
- Dashboard is now the home page (`/`)

#### Fixed
- TypeScript compilation errors in new components
- Grid2 import issues in Material-UI v7
- Unused import warnings

---

### 2025-10-26 (Earlier)

#### Added - iOS Profile Screen
- **ProfileView**: Full profile screen with card-based layout
- **Profile Components**: HeroCard, StatCard, SettingsRow, SettingsToggleRow, DangerButton
- **ProfileEditView**: Modal for editing profile (name, email)
- **SignOut**: Added signOut() method to AuthViewModel
- Integration with CompactHeader settings button

#### Added - iOS UI Redesign (Beige + Liquid Glass)
- **New Color Palette**: Beige theme (#F5E6D3, #D4C4B0, #F4E4C1, #E8D5D0)
- **Minimalist Glass Effects**: Reduced blur (25→15), shadow (25→18), border thickness
- **Updated Components**: GlassComponents, TemplatesHomeView, CompactHeader, HeroStatsCard, CategoryChip
- **Dark Text**: Changed all text to dark brown (#4A3F35) for proper contrast

---

### 2025-10-25

#### Added - Admin CRUD Endpoints (Phase 2)
- `GET /v1/admin/templates` - List with full admin fields
- `POST /v1/admin/templates` - Create template
- `GET /v1/admin/templates/{slug}` - Get by slug
- `PUT /v1/admin/templates/{slug}` - Update template
- `DELETE /v1/admin/templates/{slug}` - Delete with file cleanup
- `POST /v1/admin/templates/{slug}/publish` - Publish with validation
- `POST /v1/admin/templates/{slug}/unpublish` - Unpublish
- `POST /v1/admin/templates/{slug}/assets` - Upload thumbnail

#### Added - Prisma Schema Updates
- Added `slug` (unique), `description`, `status`, `visibility`, `tags`, `createdAt`, `updatedAt`
- Enums: `TemplateStatus` (draft, published, archived), `TemplateVisibility` (public, private)
- Migration: `20251026105027_add_admin_fields_to_templates`

#### Added - File Upload System
- Multer integration for file uploads
- Static file serving via ServeStaticModule
- Automatic cleanup: old thumbnails deleted on upload, all files deleted on template delete
- File pattern: `{slug}-{kind}-{timestamp}.{ext}`

#### Added - Web CMS Features
- Create template with form validation
- Edit template with thumbnail change support
- Delete template with confirmation
- Publish/unpublish with status updates
- Sample data import script with 13 templates

#### Changed
- Local development setup: Only DB in Docker, server and web-cms run on host for hot-reload
- Admin endpoints now use full `TemplateAdmin` type with all fields
- Public endpoints use minimal `Template` type for end users

---

### 2025-10-24

#### Added - NestJS Backend
- Migrated from Go to NestJS with TypeScript
- Prisma ORM for PostgreSQL database access
- Firebase Auth integration with Admin SDK
- DevAuth for local development
- Envelope response format for all endpoints
- Global exception filter and interceptors

#### Added - Templates API
- `GET /v1/templates` - Public endpoint for iOS app
- Basic CRUD structure

#### Added - Docker Setup
- PostgreSQL 15 container with persistent volume
- NestJS runtime container with hot-reload
- Web CMS dev and preview containers
- PgAdmin for database management

---

## Future Roadmap

### Next Phase (Priority)
- [ ] Implement async job queue for image processing (polling every 2s)
- [ ] Add file upload endpoint (`/v1/images/upload`)
- [ ] Test Template Detail page with real backend API
- [ ] Add test history storage and display

### Phase 2 (Template Versions)
- [ ] Implement `template_versions` table for prompt history
- [ ] Add prompt version management in Web CMS
- [ ] Support A/B testing with multiple prompts

### Phase 3 (Advanced Features)
- [ ] Add `template_assets` table for multiple asset types
- [ ] Implement advanced analytics dashboard
- [ ] Add bulk operations (multi-select, batch actions)
- [ ] Dark mode support
- [ ] Internationalization (i18n)

### Quality Improvements
- [ ] E2E tests for Web CMS (Playwright)
- [ ] Unit tests for components (Vitest)
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

---

## Notes

### Breaking Changes
- **2025-10-26**: Web CMS routes changed (Dashboard is now home `/`, templates at `/templates`)
- **2025-10-25**: Template schema updated with new admin fields (migration required)
- **2025-10-24**: Migrated from Go to NestJS (complete rewrite)

### Dependencies
- React 19, Material-UI v7, React Query v5, Vite 7
- NestJS 11, Prisma 6, PostgreSQL 15
- Firebase Auth, Axios
- SwiftUI (iOS), Firebase SDK (iOS)

### Known Issues
- Image processing is synchronous (can timeout for large images)
- No test history storage yet
- Bundle size could be optimized with code splitting

---

For detailed implementation notes, see:
- `.implementation_plan/` - Feature implementation details
- `.documents/` - API and architecture documentation
- `.memory-bank/` - Project context and decisions

