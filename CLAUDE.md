# AGENTS.md - ImageAIWraper Repository Guide

## Build, Lint, Test Commands

### Backend (NestJS/TypeScript)
- **Build:** `cd server && yarn build`
- **Lint:** `cd server && yarn lint`
- **Test all:** `cd server && yarn test`
- **Test single file:** `cd server && yarn test -- image-processing.spec.ts`
- **Test watch:** `cd server && yarn test:watch`
- **Test coverage:** `cd server && yarn test:cov`

### iOS (SwiftUI)
- **Build:** `cd AIPhotoApp && xcodebuild build -scheme imageaiwrapper`
- **Test all:** `cd AIPhotoApp && xcodebuild test -scheme imageaiwrapper -destination 'platform=iOS Simulator,name=iPhone 17' -parallel-testing-enabled NO | xcpretty`
- **Test single file:** `cd AIPhotoApp && xcodebuild test -scheme imageaiwrapper -only-testing:imageaiwrapperTests/ImageProcessingViewModelTests -parallel-testing-enabled NO`
- **Test in Xcode:** Press ⌘U

## Architecture & Structure

**Subprojects:**
- `server/` - NestJS backend (TypeScript), Firebase Auth, Prisma ORM, Gemini API integration
- `AIPhotoApp/` - Native iOS app (SwiftUI), Firebase Auth, image processing UI
- `landing-page/`, `web-cms/` - Supporting web services

**Key APIs & Services:**
- `POST /v1/users/register` - User profile management (requires Firebase idToken)
- `POST /v1/images/process` - AI image processing with Gemini
- `GET /v1/templates` - Fetch available AI templates
- `GET /v1/templates/categories` - Fetch template categories for filtering
- **Admin Templates (web-cms):**
  - `GET/POST/PUT/DELETE /v1/admin/templates/{slug}` - Full CRUD for template management
  - `POST/DELETE /v1/admin/templates/{slug}/trending` - Manual trending management
  - `POST/DELETE /v1/admin/templates/{slug}/publish` - Publish/unpublish templates
- Database: Prisma ORM with PostgreSQL (configured via `DATABASE_URL`)
- External: Firebase Admin SDK, Gemini API

## Code Style Guidelines

**TypeScript/NestJS** (server/):
- PascalCase for classes, camelCase for variables/functions, kebab-case for files/dirs
- Strict typing—no `any`. JSDoc for public methods. One export per file.
- Small functions (<20 lines), single responsibility, avoid nesting. Test all public functions.
- ESLint+Prettier configured; run `yarn format` and `yarn lint`

**Swift/SwiftUI** (AIPhotoApp/):
- Use `@Observable` for view models, avoid `@State` for model observation
- PascalCase for types, camelCase for variables. Single responsibility, <200 lines per class
- Write unit tests in `imageaiwrapperTests/`, UI tests in `imageaiwrapperUITests/`
- Accessibility labels required; support Dynamic Type

**Both:**
- TDD mandatory: write tests before implementation. High coverage required for business logic/auth
- JSDoc/comments for public APIs. English only. No magic numbers—use named constants
- Error handling: raise exceptions for unexpected errors, add context on catch
- Use `class-validator` (TS) for DTOs, proper input validation

## Trending Template Management

**Web CMS Features (v1.2):**
- **Manual Trending:** Admins can manually mark templates as trending via `isTrendingManual` field
- **Visual Indicators:** Orange "TRENDING" badges with fire icons in admin table
- **Trending Filter:** Filter templates by trending status (all/manual/none)
- **Quick Actions:** One-click trending toggle in template management table

**API Endpoints:**
- `POST /v1/admin/templates/{slug}/trending` - Mark template as trending
- `DELETE /v1/admin/templates/{slug}/trending` - Remove from trending
- Query parameter `?trending=manual|none|all` for filtering

**Frontend Components:**
- `TrendingBadge` - Animated badge component with manual/auto trending support
- `TemplateTable` - Dedicated trending column with toggle actions
- `TemplatesFilters` - Trending filter dropdown in admin interface

**Response Format:**
All API responses use camelCase fields (`thumbnailUrl`, `publishedAt`, `usageCount`, `isTrendingManual`, `createdAt`, `updatedAt`)

## Key Notes

- **Authentication:** 100% Firebase Auth (no backend login). All protected endpoints verify `Authorization: Bearer <idToken>`
- **Testing:** `.box-testing/` contains test data/scripts. Coverage tools: `jest` for backend, Xcode for iOS
- **TDD Workflow:** Required for all features. Failing tests first, then implementation. See `.clinerules/tdd-feature-development.md` and `.documents/workflow.md`
- **Documentation:** Source of truth in `.documents/`. Architecture in `.memory-bank/`. Update both on major changes
- **Environment:** Node.js ≥20, Xcode latest, Docker for containerization. Configure `.env` from `.env.example`
