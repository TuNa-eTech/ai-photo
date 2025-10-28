# Implementation Plan: Gemini Image Processing với FCM Push Notifications

**Created:** 2025-10-27  
**Status:** Planning  
**Approach:** Async Job Queue + FCM Push Notifications  
**Estimated Time:** 10-14 days  

---

## Status Checklist

### Phase 1: Backend Infrastructure Setup (3-4 days)

#### Redis & Job Queue
- [ ] **Redis Setup**
  - [ ] Install Redis locally (brew install redis)
  - [ ] Configure Redis connection in NestJS
  - [ ] Setup Redis module with ioredis
  - [ ] Test Redis connection
  - [ ] Add Redis to docker-compose.yml
  
- [ ] **BullMQ Integration**
  - [ ] Install BullMQ dependencies (`@nestjs/bullmq`, `bullmq`)
  - [ ] Create Queue module
  - [ ] Configure BullMQ with Redis connection
  - [ ] Setup queue monitoring (Bull Board - optional)
  
#### Jobs Module
- [ ] **Module Structure**
  - [ ] Create `src/jobs/` directory structure
  - [ ] Create Jobs module, service, controller
  - [ ] Define Job entity interface
  - [ ] Create Job DTOs (CreateJobDto, JobStatusDto, JobResultDto)
  
- [ ] **Jobs Service**
  - [ ] Implement `createJob()` method
  - [ ] Implement `getJob()` method
  - [ ] Implement `updateJob()` method
  - [ ] Implement `markCompleted()` method
  - [ ] Implement `markFailed()` method
  - [ ] Implement `getUserJobs()` method
  - [ ] Implement `getPendingJobs()` method
  - [ ] Add Redis key management with TTL (24h)
  
- [ ] **Jobs Controller**
  - [ ] GET `/v1/images/jobs/:jobId` - Get job status
  - [ ] GET `/v1/images/jobs` - Get user's jobs
  - [ ] Add authentication guard
  - [ ] Add authorization check (job.userId === user.uid)
  
#### FCM Integration
- [ ] **FCM Service**
  - [ ] Create FCM module and service
  - [ ] Verify Firebase Admin SDK initialized
  - [ ] Implement `sendJobCompletionNotification()`
  - [ ] Implement `sendJobFailedNotification()`
  - [ ] Add error handling for invalid tokens
  - [ ] Add logging for notification delivery
  
- [ ] **Device Token Management**
  - [ ] Add deviceToken field to User model (optional)
  - [ ] Create endpoint POST `/v1/users/device-token`
  - [ ] Store device token in Redis or DB
  - [ ] Update token on each app launch

### Phase 2: Image Processing with Queue (2-3 days)

#### Queue Processor
- [ ] **Image Processing Processor**
  - [ ] Create `src/queue/processors/image-processing.processor.ts`
  - [ ] Implement `@Processor('image-processing')`
  - [ ] Implement `process()` method
    - [ ] Get template from DB
    - [ ] Call GeminiService
    - [ ] Update job status
    - [ ] Store result in Redis
    - [ ] Send FCM notification
  - [ ] Add error handling and retry logic
  - [ ] Configure retry strategy (3 retries, exponential backoff)
  
#### Update Images Module
- [ ] **Images Controller**
  - [ ] Update POST `/v1/images/process` to async mode
    - [ ] Accept `device_token` parameter (optional)
    - [ ] Create job via JobsService
    - [ ] Add job to BullMQ queue
    - [ ] Return 202 Accepted with job_id immediately
  - [ ] Add envelope response format
  - [ ] Keep old synchronous endpoint as `/v1/images/process-sync` (optional)
  
- [ ] **ProcessImageDto**
  - [ ] Add `device_token?: string` field
  - [ ] Add `async?: boolean` field (default: true)
  - [ ] Keep existing validation
  
#### Gemini Service (no changes needed)
- [ ] Verify GeminiService works as-is
- [ ] Ensure proper error handling
- [ ] Ensure timeout handling (45s)

### Phase 3: iOS Implementation (3-4 days)

#### FCM SDK Setup
- [ ] **Firebase Setup**
  - [ ] Add FirebaseMessaging to Podfile
  - [ ] Run `pod install`
  - [ ] Add GoogleService-Info.plist (if not exists)
  - [ ] Configure AppDelegate for FCM
  - [ ] Request notification permissions
  - [ ] Register for remote notifications
  
- [ ] **Token Management**
  - [ ] Implement FCM token delegate
  - [ ] Save token to UserDefaults
  - [ ] Send token to backend on login
  - [ ] Update token when changed
  
#### Push Notification Handling
- [ ] **Notification Delegates**
  - [ ] Implement `UNUserNotificationCenterDelegate`
  - [ ] Handle foreground notifications (willPresent)
  - [ ] Handle notification tap (didReceive)
  - [ ] Parse notification data (jobId, type)
  
- [ ] **Job Completion Handler**
  - [ ] Create `handleJobCompletion(jobId:)` method
  - [ ] Fetch job result from backend
  - [ ] Load original image from temp storage
  - [ ] Save project to ProjectsStorageManager
  - [ ] Clean up temp data
  - [ ] Show success UI
  
#### API Client Updates
- [ ] **ImageProcessingAPIClient**
  - [ ] Update `processImage()` to async version
    - [ ] Send device_token
    - [ ] Return job_id immediately
  - [ ] Add `getJobStatus(jobId:)` method
  - [ ] Add `getJobResult(jobId:)` method
  - [ ] Add polling logic as backup
  
#### Temp Storage for Original Images
- [ ] **JobsStorageManager** (new)
  - [ ] Create temp directory for job images
  - [ ] `saveOriginalImage(jobId:image:template:)` method
  - [ ] `loadOriginalImage(jobId:)` method
  - [ ] `cleanupJobData(jobId:)` method
  - [ ] Auto-cleanup old job data (> 24h)
  
#### ViewModel Updates
- [ ] **ImageProcessingViewModel**
  - [ ] Update `processImage()` for async flow
  - [ ] Add polling as backup (every 3s, max 60s)
  - [ ] Listen for push notification events
  - [ ] Handle job completion from push
  - [ ] Handle job completion from polling
  - [ ] Add state: `.processing(jobId:)`
  - [ ] Save pending jobs to UserDefaults
  - [ ] Check pending jobs on init
  
#### UI Updates
- [ ] **Processing View**
  - [ ] Update status messages
    - "Uploading..." → "Processing started..."
    - "Processing in background..."
    - "You can close the app"
  - [ ] Remove progress bar (indeterminate only)
  - [ ] Add "View Jobs" button
  
- [ ] **Jobs List View** (new, optional)
  - [ ] Show all user's jobs
  - [ ] Status badges (pending, processing, completed, failed)
  - [ ] Tap to view result (if completed)
  - [ ] Retry button (if failed)

### Phase 4: Testing (2-3 days)

#### Backend Tests
- [ ] **Unit Tests: JobsService**
  - [ ] Test createJob()
  - [ ] Test getJob()
  - [ ] Test updateJob()
  - [ ] Test markCompleted()
  - [ ] Test markFailed()
  - [ ] Test Redis TTL
  - [ ] Test getUserJobs()
  
- [ ] **Unit Tests: FCMService**
  - [ ] Test sendJobCompletionNotification()
  - [ ] Test sendJobFailedNotification()
  - [ ] Test error handling (invalid token)
  - [ ] Mock Firebase Admin SDK
  
- [ ] **Unit Tests: ImageProcessingProcessor**
  - [ ] Test successful processing
  - [ ] Test Gemini API error
  - [ ] Test timeout
  - [ ] Test retry logic
  - [ ] Test notification sending
  
- [ ] **E2E Tests**
  - [ ] POST /v1/images/process → 202 with job_id
  - [ ] GET /v1/images/jobs/:jobId → job status
  - [ ] POST without auth → 401
  - [ ] GET with wrong user → 403
  - [ ] Full flow: create job → process → notify → get result
  
#### iOS Tests
- [ ] **Unit Tests: ImageProcessingViewModel**
  - [ ] Test processImage() creates job
  - [ ] Test polling logic
  - [ ] Test handle push notification
  - [ ] Test pending jobs restoration
  
- [ ] **Unit Tests: JobsStorageManager**
  - [ ] Test save original image
  - [ ] Test load original image
  - [ ] Test cleanup
  - [ ] Test auto-cleanup old data
  
- [ ] **Integration Tests**
  - [ ] Test full flow with mock backend
  - [ ] Test push notification handling
  - [ ] Test polling fallback
  - [ ] Test app kill & reopen
  
- [ ] **UI Tests**
  - [ ] Process image → kill app → receive push → open → see result
  - [ ] Process image → keep app open → receive push → see result
  - [ ] Process image → network error → retry
  - [ ] Multiple concurrent jobs

#### Manual Testing Scenarios
- [ ] **Happy Path**
  - [ ] Process image with app open → receive push → complete
  - [ ] Process image → kill app → receive push → open → complete
  
- [ ] **Error Scenarios**
  - [ ] Process with no internet → error
  - [ ] Process → backend timeout → error
  - [ ] Process → Gemini API error → error + notification
  
- [ ] **Edge Cases**
  - [ ] Process 3 images concurrently
  - [ ] Kill app during upload
  - [ ] Turn off WiFi mid-processing
  - [ ] Disable notifications → polling should work
  - [ ] Device restart → pending jobs should clear

### Phase 5: Deployment & Monitoring (1-2 days)

#### Infrastructure
- [ ] **Production Setup**
  - [ ] Setup Redis Cloud or AWS ElastiCache
  - [ ] Configure Redis connection for production
  - [ ] Setup BullMQ queue in production
  - [ ] Configure FCM with production Firebase credentials
  - [ ] Test FCM delivery to production
  
#### Monitoring
- [ ] **Metrics & Logging**
  - [ ] Log job creation
  - [ ] Log processing start/complete
  - [ ] Log FCM notification sent/failed
  - [ ] Track average processing time
  - [ ] Track job failure rate
  - [ ] Track FCM delivery rate
  
- [ ] **Dashboards**
  - [ ] BullMQ dashboard (Bull Board)
  - [ ] Redis monitoring
  - [ ] Job metrics (Grafana/Datadog)
  
- [ ] **Alerts**
  - [ ] Alert if job failure rate > 5%
  - [ ] Alert if FCM delivery rate < 95%
  - [ ] Alert if average processing time > 30s
  - [ ] Alert if Redis memory > 80%
  - [ ] Alert if queue size > 100
  
#### Documentation
- [ ] **Update Documents**
  - [ ] Update `.memory-bank/context.md`
  - [ ] Update `.memory-bank/architecture.md`
  - [ ] Update OpenAPI spec with new endpoints
  - [ ] Update README with FCM setup instructions
  - [ ] Create deployment guide
  
#### Rollout
- [ ] **Staged Rollout**
  - [ ] Deploy to staging
  - [ ] Beta test with 10 users (1 week)
  - [ ] Fix issues
  - [ ] Deploy to 25% users (1 week)
  - [ ] Monitor metrics
  - [ ] Deploy to 50% users (1 week)
  - [ ] Full rollout to 100%

---

## Architecture Overview

### Backend Stack
```
NestJS
├── Redis (job storage, 24h TTL)
├── BullMQ (job queue)
├── Gemini API (image processing)
└── Firebase FCM (push notifications)
```

### iOS Stack
```
SwiftUI
├── FirebaseMessaging (FCM)
├── URLSession (API calls)
├── FileManager (temp storage)
└── UserDefaults (pending jobs)
```

---

## API Changes

### New Endpoints

#### 1. POST /v1/images/process (Updated)
```typescript
Request:
{
  "template_id": "uuid",
  "image_base64": "data:image/jpeg;base64,...",
  "device_token": "fcm-token-...", // NEW (optional)
  "options": { ... }
}

Response (202 Accepted):
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "pending",
    "estimated_time_seconds": 15,
    "message": "Processing started. You will receive a notification when complete."
  }
}
```

#### 2. GET /v1/images/jobs/:jobId (NEW)
```typescript
Response (200 OK):
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "completed", // pending | processing | completed | failed
    "created_at": "2025-10-27T10:00:00Z",
    "completed_at": "2025-10-27T10:00:15Z",
    "result": {  // Only if status = completed
      "processed_image_base64": "data:image/jpeg;base64,...",
      "metadata": { ... }
    },
    "error": {  // Only if status = failed
      "code": "gemini_api_error",
      "message": "..."
    }
  }
}
```

#### 3. GET /v1/images/jobs (NEW)
```typescript
Response (200 OK):
{
  "success": true,
  "data": {
    "jobs": [
      {
        "job_id": "uuid",
        "status": "completed",
        "template_id": "uuid",
        "created_at": "...",
        "completed_at": "..."
      }
    ]
  }
}
```

#### 4. POST /v1/users/device-token (NEW)
```typescript
Request:
{
  "device_token": "fcm-token-..."
}

Response (200 OK):
{
  "success": true,
  "data": {
    "message": "Device token updated"
  }
}
```

---

## Data Models

### Job (Redis)
```typescript
interface Job {
  id: string;
  userId: string;
  templateId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  imageSize: number;
  requestedDimensions: { width: number; height: number };
  
  processedImageBase64?: string;
  metadata?: { ... };
  
  errorCode?: string;
  errorMessage?: string;
  
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
  
  deviceToken?: string;
  notificationSent: boolean;
  notificationSentAt?: Date;
}
```

### Redis Keys
```
jobs:{jobId} = Job (JSON, TTL 24h)
jobs:user:{userId} = Set<jobId> (TTL 7d)
jobs:pending = SortedSet (score = timestamp)
```

### iOS Models
```swift
struct PendingJob: Codable {
  let jobId: String
  let templateId: String
  let templateName: String
  let originalImagePath: String
  let startedAt: Date
}

// Stored in UserDefaults
pendingJobs: [jobId: PendingJob]
```

---

## Performance Targets

| Metric | Target | Maximum |
|--------|--------|---------|
| Job creation time | < 100ms | 500ms |
| Queue latency | < 1s | 5s |
| Processing time | 5-15s | 60s |
| Push notification delivery | < 3s | 10s |
| Polling interval | 3s | - |
| Job TTL | 24h | - |
| **Total user wait** | **6-20s** | **70s** |

---

## Cost Estimation

### Monthly Costs (assuming 10,000 users)

| Service | Usage | Cost |
|---------|-------|------|
| Redis Cloud | 250MB | $5/month |
| FCM | 500k notifications | $0 (free tier) |
| Gemini API | 50k images | ~$250-500 |
| **Total** | | **$255-505/month** |

### Cost per user per month
- **Average:** $0.03/user (33 cents per 10 users)
- **Break-even:** Need ~$0.10/user revenue (subscription or ads)

---

## Risks & Mitigation

### Risk 1: FCM Notification Delivery Failure
**Impact:** High (user không biết job done)  
**Probability:** Medium (5-10% failure rate typical)  
**Mitigation:**
- ✅ Implement polling as backup (every 3s)
- ✅ Log FCM delivery failures
- ✅ Retry notification 3 times
- ✅ Show "Check Status" button in UI

### Risk 2: Redis Data Loss
**Impact:** High (mất job results)  
**Probability:** Low (with persistence enabled)  
**Mitigation:**
- ✅ Enable Redis persistence (RDB + AOF)
- ✅ 24h TTL acceptable (short-lived data)
- ✅ Backup to DB for critical jobs (optional)

### Risk 3: Queue Overflow
**Impact:** Medium (slow processing)  
**Probability:** Medium (during peak traffic)  
**Mitigation:**
- ✅ Monitor queue size
- ✅ Alert if size > 100
- ✅ Auto-scale workers
- ✅ Rate limit per user (5 concurrent jobs)

### Risk 4: iOS Background Fetch Disabled
**Impact:** Low (polling still works)  
**Probability:** Low (most users allow notifications)  
**Mitigation:**
- ✅ Detect if notifications disabled
- ✅ Show message to enable
- ✅ Polling works without notifications

---

## Testing Strategy

### Unit Tests (60+ tests)
- Backend: JobsService (15), FCMService (10), Processor (15)
- iOS: ViewModel (10), StorageManager (10)

### E2E Tests (20+ tests)
- Backend: API endpoints, job lifecycle
- iOS: Full user flows

### Load Tests
- 100 concurrent jobs
- 1000 jobs/hour
- Measure queue latency, processing time

---

## Success Criteria

### Backend
- ✅ Job creation < 100ms
- ✅ Processing success rate > 95%
- ✅ FCM delivery rate > 95%
- ✅ Queue latency < 5s
- ✅ All tests passing

### iOS
- ✅ Push notification works when app killed
- ✅ Polling works as backup
- ✅ Result saved successfully
- ✅ No memory leaks
- ✅ All tests passing

### User Experience
- ✅ 90% of users receive notification within 20s
- ✅ 95% of jobs complete successfully
- ✅ 80% of users complete at least 1 job
- ✅ User satisfaction > 4.5/5.0

---

## Migration from Long HTTP

### Compatibility Plan

**Option 1: Parallel Implementation**
- Keep `/v1/images/process` as synchronous (backward compatible)
- Add `/v1/images/process-async` for new async flow
- iOS can use either based on feature flag

**Option 2: Gradual Migration**
- Week 1: Deploy async backend
- Week 2: Update iOS to use async
- Week 3: Deprecate sync endpoint
- Week 4: Remove sync endpoint

**Recommended:** Option 2 with feature flag

---

## Timeline

### Week 1: Backend Foundation
- Day 1-2: Redis + BullMQ setup
- Day 3-4: Jobs module
- Day 5: FCM integration

### Week 2: Backend Processing
- Day 1-2: Queue processor
- Day 3: Update Images API
- Day 4-5: Testing

### Week 3: iOS Implementation
- Day 1-2: FCM SDK + notifications
- Day 3: API client updates
- Day 4: ViewModel updates
- Day 5: UI updates

### Week 4: Testing & Deployment
- Day 1-2: Integration testing
- Day 3: Load testing
- Day 4: Staging deployment
- Day 5: Production rollout

**Total: 4 weeks (20 working days)**

---

## Dependencies

### Backend
```json
{
  "@nestjs/bullmq": "^10.0.0",
  "bullmq": "^5.0.0",
  "ioredis": "^5.3.0",
  "firebase-admin": "^12.0.0" // already installed
}
```

### iOS
```ruby
# Podfile
pod 'FirebaseMessaging', '~> 10.0'
```

---

## References

- Feature Spec: `.documents/features/gemini-image-processing.md`
- FCM Integration: `.documents/integrations/fcm-push-notifications.md`
- Gemini API: `.documents/integrations/gemini-api-nestjs.md`
- OpenAPI Spec: `swagger/openapi.yaml`
- BullMQ Docs: https://docs.bullmq.io/
- FCM Docs: https://firebase.google.com/docs/cloud-messaging
- Redis Docs: https://redis.io/docs/

---

## Approval

- [ ] Technical Lead reviewed and approved
- [ ] Backend Team capacity confirmed
- [ ] iOS Team capacity confirmed
- [ ] Redis infrastructure ready
- [ ] FCM credentials ready
- [ ] Budget approved ($255-505/month)

**Approved by:** _____________  
**Date:** _____________  
**Start Date:** _____________  
**Target Completion:** _____________ (4 weeks)

