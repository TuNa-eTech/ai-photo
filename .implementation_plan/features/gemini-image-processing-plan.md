# Implementation Plan: Gemini Image Processing (Long HTTP + Background URLSession)

**Created:** 2025-10-27  
**Status:** Ready to Start  
**Approach Selected:** Long HTTP (60s) + Background URLSession + Local Notifications  
**Assigned:** Backend Team + iOS Team  
**Estimated Time:** 5-7 days  

---

## Status Checklist

### Phase 1: Backend Implementation (2-3 days)
- [x] **Setup & Configuration** ✅
  - [x] Create Gemini API key and test access
  - [x] Add environment variables to `.env`
  - [x] Create `gemini.config.ts` for configuration
  - [x] Update `.env.example` with Gemini vars
  
- [x] **Gemini Service Module** ✅
  - [x] Create `src/gemini/` module structure
  - [x] Implement `GeminiService` with `generateImage()` method
  - [x] Implement request payload builder
  - [x] Implement response parser
  - [x] Implement `validateImageBase64()` utility
  - [x] Create custom exceptions (GeminiAPIException, ContentPolicyException)
  - [x] Add timeout handling (45s for Gemini, 60s for HTTP)
  - [x] Add logging for requests and errors
  
- [x] **Images Module** ✅
  - [x] Create `src/images/` module structure
  - [x] Create `ProcessImageDto` with validation
  - [x] Create `ImagesController` with `POST /v1/images/process`
  - [x] Integrate GeminiService in controller
  - [x] Integrate TemplatesService for template lookup
  - [x] Add BearerAuthGuard protection
  - [x] Implement envelope response format
  - [x] Add error handling for all error types
  
- [ ] **Analytics Logging (Optional for MVP)**
  - [ ] Create `generation_logs` table migration
  - [ ] Implement logging service
  - [ ] Log metadata (no image data) on success/failure
  
- [x] **Testing** ✅
  - [x] Unit tests: `gemini.service.spec.ts` (7 tests - all passing)
    - [x] Test successful generation
    - [x] Test timeout handling
    - [x] Test content policy violation
    - [x] Test invalid response format
    - [x] Test image validation
  - [x] E2E tests: `images.e2e-spec.ts` ✅ (4 tests - all passing)
    - [x] POST without auth → 401
    - [x] POST without required fields → 400
    - [x] POST with invalid template → 404
    - [x] POST with invalid image format → 400/404

### Phase 2: iOS Implementation (2-3 days)
- [ ] **Models & DTOs**
  - [ ] Create `ProcessImageRequest.swift`
  - [ ] Create `ProcessImageResponse.swift`
  - [ ] Create `Project.swift` model
  - [ ] Create `ProjectMetadata.swift` (Codable)
  
- [ ] **Storage Manager**
  - [ ] Create `ProjectsStorageManager.swift`
  - [ ] Implement `saveProject()` method
    - [ ] Create project directory
    - [ ] Save original image (JPEG 80%)
    - [ ] Save processed image (JPEG 90%)
    - [ ] Generate and save thumbnail (200x200, 70%)
    - [ ] Save metadata.json
  - [ ] Implement `loadAllProjects()` method
  - [ ] Implement `deleteProject()` method
  - [ ] Implement `getProject(id:)` method
  - [ ] Add sorting and filtering support
  
- [ ] **API Client**
  - [ ] Create `ImageProcessingAPIClient.swift`
  - [ ] Implement `processImage()` with timeout (60s)
  - [ ] Implement `validateImage()` (optional)
  - [ ] Add envelope response unwrapping
  - [ ] Add error mapping (API errors → app errors)
  
- [ ] **Background Processing Support**
  - [ ] Create `BackgroundImageProcessor.swift`
  - [ ] Configure Background URLSession
  - [ ] Implement URLSession delegates
  - [ ] Handle background completion
  - [ ] Save/restore pending jobs (UserDefaults)
  - [ ] Show local notification on completion
  - [ ] Update AppDelegate for background events
  
- [ ] **Image Utilities**
  - [ ] Create `UIImage+Compression.swift` extension
    - [ ] `compressForUpload()` → JPEG 70%, max 1920px
    - [ ] `resized(maxDimension:)` method
    - [ ] `resized(to:)` method for thumbnails
  - [ ] Create `UIImage+CoreImageFilters.swift`
    - [ ] `applyAnimeFilter()` for optimistic preview
    - [ ] `applyPortraitFilter()` for optimistic preview
    - [ ] `applyVintageFilter()` for optimistic preview
  
- [ ] **ViewModel**
  - [ ] Create `ImageProcessingViewModel.swift`
  - [ ] Implement `@Published` states (processingState, progress, etc.)
  - [ ] Implement `processImage()` async method
  - [ ] Implement `generateOptimisticPreview()` method
  - [ ] Implement `animateProgressBar()` method
  - [ ] Add error handling for all error types
  - [ ] Add haptic feedback on state changes
  
- [ ] **UI Views**
  - [ ] Create `ImagePickerView.swift` (photo picker wrapper)
  - [ ] Create `ImageProcessingView.swift`
    - [ ] Status text display
    - [ ] Image preview (optimistic → final)
    - [ ] Progress bar with percentage
    - [ ] Cancel button (optional)
  - [ ] Create `ProcessingResultView.swift`
    - [ ] Before/after comparison slider
    - [ ] Save, Share, Re-generate buttons
    - [ ] Navigate to "My Projects"
  - [ ] Update `TemplateDetailView.swift`
    - [ ] Add "Use Template" button
    - [ ] Navigate to ImageProcessingView
  
- [ ] **My Projects Screen**
  - [ ] Create `MyProjectsView.swift`
  - [ ] Grid layout with thumbnails
  - [ ] Pull-to-refresh
  - [ ] Tap to view detail
  - [ ] Swipe to delete
  - [ ] Empty state view
  - [ ] Sort options (date, template)
  - [ ] Filter by template (optional)
  
- [ ] **Testing**
  - [ ] Unit tests: `ProjectsStorageManagerTests.swift`
    - [ ] Test save project
    - [ ] Test load projects
    - [ ] Test delete project
    - [ ] Test project metadata encoding/decoding
  - [ ] Unit tests: `ImageProcessingViewModelTests.swift`
    - [ ] Test processImage() success flow
    - [ ] Test error handling (network, timeout, etc.)
    - [ ] Test optimistic preview generation
    - [ ] Test progress animation
  - [ ] UI tests: `ImageProcessingUITests.swift`
    - [ ] Test full flow: select template → pick image → process → save
    - [ ] Test cancel during processing
    - [ ] Test retry after error
    - [ ] Test navigation to My Projects

### Phase 3: Integration & Testing (1 day)
- [ ] **Backend Deployment**
  - [ ] Add Gemini API key to production environment
  - [ ] Deploy to staging
  - [ ] Test with real Gemini API
  - [ ] Monitor logs and performance
  
- [ ] **iOS Testing**
  - [ ] Update `AppConfig.swift` with staging URL
  - [ ] Test on simulator with staging backend
  - [ ] Test on real device with staging backend
  - [ ] Test with various image sizes and formats
  - [ ] Test edge cases (airplane mode, background app, etc.)
  
- [ ] **End-to-End Testing**
  - [ ] Happy path: select template → process → save → view history
  - [ ] Error scenarios: network error, timeout, rate limit
  - [ ] Performance: measure total time from pick image to saved
  - [ ] Memory: check for memory leaks during processing
  
- [ ] **Documentation**
  - [ ] Update `.memory-bank/context.md` with completed feature
  - [ ] Update `.memory-bank/architecture.md` with new components
  - [ ] Update OpenAPI spec (`swagger/openapi.yaml`)
  - [ ] Add API endpoint to Postman collection
  
- [ ] **Polish**
  - [ ] Add loading animations and transitions
  - [ ] Add haptic feedback
  - [ ] Add success/error sound effects (optional)
  - [ ] Review all error messages for clarity
  - [ ] Final UI/UX review

---

## Overview

Implement image processing feature using Gemini API with **Long-running HTTP + Optimistic UI** approach. Backend acts as stateless proxy, iOS app handles local storage and history.

**Key Decision:** Phương án 1 (Long HTTP + Optimistic UI) cho MVP
- Simple backend (stateless)
- Good UX (instant preview → final result)
- No storage cost
- Privacy-first

---

## Architecture

### Backend (NestJS)

```
src/
├── gemini/
│   ├── gemini.module.ts
│   ├── gemini.service.ts
│   ├── gemini.service.spec.ts
│   ├── dto/
│   │   ├── generate-image.dto.ts
│   │   └── gemini-response.dto.ts
│   └── exceptions/
│       ├── gemini-api.exception.ts
│       └── content-policy.exception.ts
│
└── images/
    ├── images.module.ts
    ├── images.controller.ts
    ├── images.controller.spec.ts
    ├── images.service.ts
    ├── images.service.spec.ts
    └── dto/
        ├── process-image.dto.ts
        └── process-image-response.dto.ts
```

### iOS App

```
AIPhotoApp/AIPhotoApp/
├── Models/
│   ├── Project.swift
│   └── DTOs/
│       ├── ProcessImageRequest.swift
│       └── ProcessImageResponse.swift
│
├── Repositories/
│   ├── ImageProcessingAPIClient.swift
│   └── ProjectsStorageManager.swift
│
├── ViewModels/
│   └── ImageProcessingViewModel.swift
│
├── Views/
│   ├── ImageProcessing/
│   │   ├── ImageProcessingView.swift
│   │   ├── ProcessingResultView.swift
│   │   └── ImagePickerView.swift
│   └── Projects/
│       ├── MyProjectsView.swift
│       ├── ProjectDetailView.swift
│       └── ProjectGridItem.swift
│
└── Utilities/
    └── Extensions/
        ├── UIImage+Compression.swift
        └── UIImage+CoreImageFilters.swift
```

---

## API Contract

### Request

```typescript
POST /v1/images/process
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "template_id": "uuid",
  "image_base64": "data:image/jpeg;base64,...",
  "options": {
    "width": 1024,
    "height": 1024,
    "quality": "standard"
  }
}
```

### Response (Success)

```typescript
{
  "success": true,
  "data": {
    "processed_image_base64": "data:image/jpeg;base64,...",
    "metadata": {
      "template_id": "uuid",
      "template_name": "Anime Style",
      "model_used": "imagen-3-fast",
      "generation_time_ms": 8500,
      "original_dimensions": { "width": 1920, "height": 1080 },
      "processed_dimensions": { "width": 1024, "height": 1024 }
    }
  },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2025-10-27T10:30:00Z"
  }
}
```

---

## Key Components

### 1. GeminiService (Backend)

**Responsibilities:**
- Call Gemini API with timeout
- Build request payload (prompt + image + config)
- Parse response and extract base64 image
- Handle errors (timeout, content policy, API errors)
- Validate image size and format

**Key Methods:**
```typescript
async generateImage(dto: GenerateImageDto): Promise<GeminiResponse>
validateImageBase64(base64: string): ValidationResult
```

---

### 2. ImagesController (Backend)

**Responsibilities:**
- Validate request DTO
- Get template from database
- Call GeminiService
- Return envelope response
- Handle errors and log analytics

**Endpoint:**
```typescript
@Post('process')
@UseGuards(BearerAuthGuard)
@Timeout(60000)
async processImage(@Body() dto: ProcessImageDto)
```

---

### 3. ProjectsStorageManager (iOS)

**Responsibilities:**
- Save projects to FileManager (original + processed + thumbnail)
- Save metadata to UserDefaults or Core Data
- Load all projects with sorting/filtering
- Delete projects and cleanup files

**Storage Structure:**
```
~/Documents/Projects/
  /{project-uuid}/
    /metadata.json
    /original.jpg
    /processed.jpg
    /thumbnail.jpg
```

---

### 4. ImageProcessingViewModel (iOS)

**Responsibilities:**
- Compress image before upload
- Generate optimistic preview (Core Image)
- Call API with progress tracking
- Animate progress bar smoothly
- Handle errors and retry
- Save result to local storage

**State:**
```swift
@Published var processingState: ProcessingState
@Published var optimisticPreview: UIImage?
@Published var finalResult: UIImage?
@Published var progress: Double
```

---

### 5. ImageProcessingView (iOS)

**Responsibilities:**
- Display processing status and progress
- Show optimistic preview → final result transition
- Handle user interactions (cancel, retry)
- Navigate to result view

---

## Testing Strategy

### Backend Tests

**Unit Tests (Jest):**
- GeminiService: API calls, response parsing, error handling
- ImagesController: Request validation, template lookup, response format

**E2E Tests (Supertest):**
- Full flow with mocked Gemini API
- Error scenarios (401, 404, 413, 429, 504)

**Total Target:** 30+ tests, > 80% coverage

---

### iOS Tests

**Unit Tests (Swift Testing):**
- ProjectsStorageManager: CRUD operations
- ImageProcessingViewModel: Processing flow, error handling
- Image utilities: Compression, filters, validation

**UI Tests (XCTest):**
- Full user flow: select → process → save → view
- Error handling UI
- Cancel and retry flows

**Total Target:** 25+ tests, > 70% coverage

---

## Performance Targets

| Metric | Target | Maximum |
|--------|--------|---------|
| Image compression (iOS) | < 500ms | 1s |
| Optimistic preview generation | < 100ms | 200ms |
| API processing time | 5-15s | 60s |
| Base64 decode (iOS) | < 200ms | 500ms |
| Save to disk (iOS) | < 300ms | 1s |
| **Total user wait** | **6-17s** | **62s** |

---

## Dependencies

### Backend
```json
{
  "@nestjs/axios": "^3.0.0",
  "@nestjs/config": "^3.0.0",
  "rxjs": "^7.8.0"
}
```

### iOS
```swift
// No external dependencies
// Use built-in: Foundation, UIKit, CoreImage
```

---

## Environment Variables

### Backend `.env`
```bash
# Gemini API
GEMINI_API_KEY=AIzaSy...
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=imagen-3-fast
GEMINI_TIMEOUT_MS=45000

# Database (existing)
DATABASE_URL=postgresql://...

# Firebase (existing)
FIREBASE_PROJECT_ID=...
```

### iOS `AppConfig.swift`
```swift
// Development
let API_BASE_URL = "http://192.168.1.123:8080"

// Production
let API_BASE_URL = "https://api.example.com"
```

---

## Risk Mitigation

### Risk 1: Gemini API Timeout
**Impact:** High (user waiting > 60s)  
**Mitigation:**
- Set 45s timeout on Gemini API call
- Set 60s timeout on HTTP request
- Show clear error message with retry option
- Log timeouts for monitoring

### Risk 2: Large Payload Size
**Impact:** Medium (slow upload on 3G/4G)  
**Mitigation:**
- Compress image to ~500KB-1MB
- Show upload progress
- Validate size before upload
- Reject > 10MB

### Risk 3: Content Policy Violations
**Impact:** Low (rare but possible)  
**Mitigation:**
- Catch ContentPolicyException
- Show user-friendly message
- Don't save to history
- Log for monitoring

### Risk 4: Memory Issues (iOS)
**Impact:** Medium (large images)  
**Mitigation:**
- Compress images aggressively
- Release UIImage references after save
- Use @autoreleasepool for batch operations
- Test with memory profiler

---

## Rollout Plan

### Stage 1: Development (Day 1-5)
- Implement backend + iOS in parallel
- Unit tests for all components
- Local integration testing

### Stage 2: Staging (Day 6)
- Deploy backend to staging
- Test iOS app with staging backend
- E2E testing with real Gemini API

### Stage 3: Beta (Day 7)
- Deploy to production
- Release to TestFlight beta testers
- Monitor logs and user feedback

### Stage 4: Production (Week 2)
- Gradual rollout to all users
- Monitor metrics (success rate, avg time, error rate)
- Iterate based on feedback

---

## Success Criteria

### Backend
- ✅ API responds within 60s for 95% of requests
- ✅ Error rate < 2%
- ✅ Gemini API success rate > 95%
- ✅ All tests passing

### iOS
- ✅ Smooth UX (optimistic preview → final result)
- ✅ Projects saved successfully
- ✅ My Projects loads instantly
- ✅ No memory leaks
- ✅ All tests passing

### User Experience
- ✅ 80% of users successfully process at least 1 image
- ✅ Average time from pick image to saved < 20s
- ✅ Retry success rate > 90%
- ✅ User satisfaction score > 4.0/5.0

---

## Follow-up Tasks (Phase 2)

- [ ] Add Push Notifications for completion (when app killed)
- [ ] Add Server-Sent Events for real-time progress
- [ ] Implement iCloud sync for projects
- [ ] Add batch processing (multiple images)
- [ ] Add custom prompt override
- [ ] Implement on-device preview using CoreML
- [ ] Add social sharing with attribution
- [ ] Implement template marketplace

---

## References

- Feature Spec: `.documents/features/gemini-image-processing.md`
- Integration Guide: `.documents/integrations/gemini-api-nestjs.md`
- Gemini API Docs: https://ai.google.dev/gemini-api/docs/imagen
- NestJS HTTP Module: https://docs.nestjs.com/techniques/http-module
- iOS Image Processing: https://developer.apple.com/documentation/coreimage

---

## Notes

### Why Long HTTP (not polling/websocket)?
- ✅ Simplest implementation for MVP
- ✅ Backend stays stateless (easy to scale)
- ✅ No job queue needed
- ✅ Works with standard HTTP clients
- ⚠️ User must keep app open during processing

### Why Optimistic UI?
- ✅ Instant feedback (feels faster)
- ✅ Reduces perceived wait time
- ✅ Better than blank screen
- ✅ Uses iOS native Core Image (fast)

### Why Local Storage Only?
- ✅ Zero storage cost
- ✅ Privacy-first (no server storage)
- ✅ Fast access (local disk)
- ✅ Simple architecture
- ⚠️ No cross-device sync (Phase 2 feature)

---

## Implementation Order

**Week 1:**
1. Backend: Gemini integration
2. Backend: Images endpoint
3. iOS: Storage manager
4. iOS: API client
5. iOS: ViewModel

**Week 2:**
6. iOS: UI views
7. Testing (backend + iOS)
8. Integration testing
9. Polish & deploy
10. Beta release

---

## Approval

- [ ] Technical Lead reviewed and approved
- [ ] Backend Team ready to start
- [ ] iOS Team ready to start
- [ ] Gemini API key obtained
- [ ] Documentation complete

**Approved by:** _____________  
**Date:** _____________  
**Start Date:** _____________  
**Target Completion:** _____________

