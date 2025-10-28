# Gemini Image Processing với FCM - Implementation Summary

**Created:** 2025-10-27  
**Approach:** Async Job Queue + FCM Push Notifications  
**Timeline:** 4 weeks (10-14 working days)  
**Status:** Ready for implementation  

---

## 🎯 **Executive Summary**

Thay vì xử lý sync (Long HTTP), chúng ta sẽ implement async architecture với:
- **Backend:** Job queue (BullMQ + Redis) xử lý background
- **Notification:** FCM push khi job complete
- **iOS:** Polling as backup nếu push fail
- **Result:** User có thể kill app và vẫn nhận notification

---

## 📚 **Documents Created**

### 1. **Integration Guide: FCM**
**File:** `.documents/integrations/fcm-push-notifications.md`

**Content:**
- ✅ Architecture với Mermaid diagram
- ✅ Backend implementation (Jobs, Queue, FCM services)
- ✅ iOS implementation (FCM SDK, notification handling)
- ✅ Redis schema design
- ✅ Testing strategy
- ✅ Cost estimation ($255-505/month cho 10k users)
- ✅ Monitoring & alerts
- ✅ Migration plan

### 2. **Implementation Plan: FCM**
**File:** `.implementation_plan/gemini-image-processing-fcm-plan.md`

**Content:**
- ✅ Detailed checklist (100+ tasks) divided into 5 phases
- ✅ Phase 1: Backend Infrastructure (3-4 days)
- ✅ Phase 2: Image Processing Queue (2-3 days)
- ✅ Phase 3: iOS Implementation (3-4 days)
- ✅ Phase 4: Testing (2-3 days)
- ✅ Phase 5: Deployment (1-2 days)
- ✅ API changes & new endpoints
- ✅ Data models (Job entity, Redis keys)
- ✅ Performance targets
- ✅ Risk mitigation
- ✅ Success criteria

### 3. **Feature Spec: Updated**
**File:** `.documents/features/gemini-image-processing.md`

**Updates:**
- ✅ Changed approach from "stateless proxy" to "async queue"
- ✅ Updated user journey (6 steps instead of 5)
- ✅ Updated architecture diagram (added Redis + FCM)
- ✅ Updated goals (added FCM, polling, 24h TTL)

### 4. **OpenAPI Spec: Updated**
**File:** `swagger/openapi.yaml`

**Changes:**
- ✅ Updated `POST /v1/images/process` (now returns 202 with job_id)
- ✅ Added `GET /v1/images/jobs/{jobId}` (get job status & result)
- ✅ Added `GET /v1/images/jobs` (list user's jobs)
- ✅ New schemas: `ProcessImageRequestAsync`, `JobCreatedData`, `JobStatusData`, `JobListItem`
- ✅ Complete examples for all endpoints

---

## 🏗️ **Architecture Changes**

### **Before (Long HTTP):**
```
iOS → Backend (proxy) → Gemini → Backend → iOS
(blocking 5-30s, user must keep app open)
```

### **After (Async + FCM):**
```
iOS → Backend (202 job_id)
         ↓
    Redis Queue → Worker → Gemini
         ↓
    FCM → iOS (push notification)
         ↓
    iOS → Backend (fetch result)
```

---

## 🆕 **New Components**

### **Backend (NestJS):**
```
✅ Redis (ioredis) - job storage
✅ BullMQ - job queue
✅ JobsService - CRUD operations on jobs
✅ JobsController - GET /v1/images/jobs endpoints
✅ FCMService - send push notifications
✅ ImageProcessingProcessor - background worker
✅ Updated ImagesController - async flow
```

### **iOS (SwiftUI):**
```
✅ FirebaseMessaging SDK
✅ FCM token management
✅ Push notification handlers (UNUserNotificationCenterDelegate)
✅ JobsStorageManager - temp storage for original images
✅ Updated ImageProcessingViewModel - async + polling
✅ Updated API client - job endpoints
```

---

## 📊 **API Changes**

### **1. POST /v1/images/process (UPDATED)**

**Before:**
```json
// Response: 200 OK (after 5-30s)
{
  "success": true,
  "data": {
    "processed_image_base64": "...",
    "metadata": { ... }
  }
}
```

**After:**
```json
// Request: added device_token
{
  "template_id": "uuid",
  "image_base64": "...",
  "device_token": "fcm-token-..." // NEW
}

// Response: 202 Accepted (immediate)
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

### **2. GET /v1/images/jobs/:jobId (NEW)**

```json
// Response: 200 OK
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "completed", // pending | processing | completed | failed
    "created_at": "...",
    "completed_at": "...",
    "result": {  // Only if status = completed
      "processed_image_base64": "...",
      "metadata": { ... }
    }
  }
}
```

### **3. GET /v1/images/jobs (NEW)**

```json
// Response: 200 OK
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
    ],
    "total": 25
  }
}
```

---

## 📈 **Performance Comparison**

| Metric | Long HTTP (Old) | Async + FCM (New) |
|--------|----------------|-------------------|
| Initial response | 5-30s (blocking) | < 500ms ✅ |
| User can kill app | ❌ No | ✅ Yes |
| User can background app | ⚠️ ~30s only | ✅ Unlimited |
| Backend state | Stateless | Stateful (Redis) |
| Notification | ❌ None | ✅ Push + Polling |
| Job history | ❌ No | ✅ 24h in Redis |
| Retry capability | Manual only | ✅ Auto + Manual |
| Concurrent jobs | 1 at a time | ✅ Multiple |

---

## 💰 **Cost Estimation**

### **Monthly Costs (10,000 users):**

| Service | Usage | Cost/Month |
|---------|-------|------------|
| Redis Cloud | 250MB | $5 |
| FCM | 500k notifications | $0 (free tier) |
| Gemini API | 50k images @ $0.005 | $250-500 |
| **Total** | | **$255-505** |

**Per user:** $0.025-0.05/month

### **Scaling Costs:**

| Users | Redis | FCM | Gemini | Total |
|-------|-------|-----|--------|-------|
| 1K | $0 (free) | $0 | $25-50 | $25-50 |
| 10K | $5 | $0 | $250-500 | $255-505 |
| 100K | $50 | $60 | $2,500-5,000 | $2,610-5,110 |

---

## ⏱️ **Timeline**

### **Week 1: Backend Foundation**
- Day 1-2: Redis + BullMQ setup
- Day 3-4: Jobs module
- Day 5: FCM integration

### **Week 2: Backend Processing**
- Day 1-2: Queue processor
- Day 3: Update Images API
- Day 4-5: Backend testing

### **Week 3: iOS Implementation**
- Day 1-2: FCM SDK + notifications
- Day 3: API client updates
- Day 4: ViewModel updates
- Day 5: UI updates

### **Week 4: Testing & Deployment**
- Day 1-2: Integration testing
- Day 3: Load testing
- Day 4: Staging deployment
- Day 5: Production rollout

**Total: 4 weeks (20 working days)**

---

## ✅ **Ready to Start?**

### **Prerequisites:**
- [ ] Redis installed/configured
- [ ] Firebase project ready
- [ ] FCM credentials available
- [ ] Budget approved ($255-505/month)
- [ ] Team capacity confirmed (2 backend + 1 iOS)

### **Dependencies:**
```json
// Backend
{
  "@nestjs/bullmq": "^10.0.0",
  "bullmq": "^5.0.0",
  "ioredis": "^5.3.0"
}

// iOS
pod 'FirebaseMessaging', '~> 10.0'
```

### **First Steps:**
1. ✅ Review all documents
2. 📝 Get stakeholder approval
3. 🔧 Setup Redis locally
4. 💻 Start Phase 1: Backend Infrastructure

---

## 📁 **Reference Documents**

| Document | Purpose | Location |
|----------|---------|----------|
| **FCM Integration Guide** | How to integrate FCM | `.documents/integrations/fcm-push-notifications.md` |
| **Implementation Plan** | 100+ task checklist | `.implementation_plan/gemini-image-processing-fcm-plan.md` |
| **Feature Spec** | Updated requirements | `.documents/features/gemini-image-processing.md` |
| **OpenAPI Spec** | API contract | `swagger/openapi.yaml` |
| **Gemini Integration** | Gemini API guide | `.documents/integrations/gemini-api-nestjs.md` |

---

## 🎓 **Key Decisions**

### **Why FCM over Background URLSession?**
1. ✅ Better UX (notification when done)
2. ✅ Works after device restart
3. ✅ Supports multiple concurrent jobs
4. ✅ Can retry failed jobs
5. ✅ Job history in Redis

### **Why Redis over Database?**
1. ✅ Fast (in-memory)
2. ✅ TTL support (auto cleanup after 24h)
3. ✅ BullMQ native support
4. ✅ Simple key-value storage

### **Why BullMQ over other queues?**
1. ✅ Node.js native
2. ✅ Redis-based
3. ✅ Excellent retry logic
4. ✅ Bull Board for monitoring
5. ✅ Strong TypeScript support

---

## ⚠️ **Risks & Mitigation**

| Risk | Impact | Mitigation |
|------|--------|------------|
| FCM delivery failure (5-10%) | High | Polling as backup every 3s |
| Redis data loss | High | Enable persistence (RDB + AOF) |
| Queue overflow | Medium | Monitor + alert + auto-scale |
| iOS notifications disabled | Low | Detect + show message + polling works |

---

## 🎯 **Success Criteria**

### **Technical:**
- ✅ Job creation < 100ms
- ✅ Processing success rate > 95%
- ✅ FCM delivery rate > 95%
- ✅ All tests passing (60+ backend, 25+ iOS)

### **User Experience:**
- ✅ 90% receive notification within 20s
- ✅ Works when app killed
- ✅ 95% job completion rate
- ✅ User satisfaction > 4.5/5.0

---

## 📞 **Next Steps**

1. **Review all documents** (this summary + referenced docs)
2. **Ask questions** if anything unclear
3. **Get approval** from stakeholders
4. **Setup infrastructure** (Redis, Firebase)
5. **Start implementation** following Phase 1 checklist

---

## 🚀 **Let's Build!**

All documentation is complete and ready. The team can start implementation immediately following the detailed checklists in the implementation plan.

**Estimated completion:** 4 weeks from start  
**Confidence level:** High (detailed plan + proven technologies)  
**Risk level:** Low-Medium (with mitigations in place)  

---

**Questions? Review the detailed docs or ask for clarification!**

