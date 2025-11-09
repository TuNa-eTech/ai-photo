# Templates API Integration Analysis

**Date:** 2025-10-26  
**Scope:** Backend ↔ iOS App Integration for Templates API

## Executive Summary

Phân tích chi tiết về tích hợp API Templates giữa NestJS backend và iOS SwiftUI app. Phát hiện **6 vấn đề cần fix** trước khi production, bao gồm 1 lỗi security critical.

---

## 🔍 Current State Analysis

### Backend (NestJS + Prisma)

**OpenAPI Specification (`swagger/openapi.yaml`):**
```yaml
GET /v1/templates
- Security: bearerAuth (Firebase ID token)
- Query params: limit, offset, q, tags, sort
- Response: EnvelopeTemplatesList
  - success: boolean
  - data.templates: [Template]
    - id: string
    - name: string
    - thumbnail_url?: string
    - published_at?: string (ISO8601)
    - usage_count?: number
```

**Implementation (`templates.service.ts`):**
```typescript
async listTemplates(query: QueryTemplatesDto) {
  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { id: { contains: q, mode: 'insensitive' } }
    ];
  }
  // ⚠️ NO FILTER for status/visibility
  
  const rows = await prisma.template.findMany({ where, orderBy, take, skip });
  return { templates: rows.map(mapToApi) };
}
```

**Database Schema (`schema.prisma`):**
```prisma
model Template {
  id             String
  slug           String @unique
  name           String
  status         TemplateStatus @default(draft)     // draft | published | archived
  visibility     TemplateVisibility @default(public) // public | private
  thumbnailUrl   String?
  publishedAt    DateTime?
  usageCount     Int @default(0)
  tags           String[]
  // ... more fields
}
```

### iOS App (SwiftUI)

**DTOs (`TemplatesDTOs.swift`):**
```swift
struct TemplateDTO: Codable {
  let id: String
  let name: String
  let thumbnailURL: URL?  // ✅ Có
  // ❌ THIẾU published_at
  // ❌ THIẾU usage_count
}
```

**Repository (`TemplatesRepository.swift`):**
```swift
func listTemplates(bearerIDToken: String) async throws -> TemplatesListResponse {
  // ✅ Envelope handling correct
  // ✅ 401 retry logic
  // ✅ Bearer auth
}
```

**ViewModel (`HomeViewModel.swift`):**
```swift
struct TemplateItem {
  let id: UUID
  let slug: String
  let title: String
  let thumbnailSymbol: String?  // ❌ SF Symbol, không phải URL
  let isNew: Bool               // ❌ Không map từ API
  let isTrending: Bool          // ❌ Không map từ API
}

func fetchFromAPI(repo: TemplatesRepository) {
  let items = resp.templates.map { dto in
    TemplateItem(
      slug: dto.id,
      title: dto.name,
      thumbnailSymbol: nil  // ❌ Không dùng dto.thumbnailURL
    )
  }
}
```

---

## 🚨 Issues Identified

### 1. **CRITICAL: Security - No Published Filter**

**Severity:** 🔴 **CRITICAL**  
**Impact:** Privacy/Security breach

**Problem:**
Backend API `/v1/templates` trả về **TẤT CẢ** templates, bao gồm:
- Draft templates (chưa ready)
- Archived templates (đã xóa)
- Private templates (nội bộ admin)

OpenAPI spec nói: "_Trả về danh sách Templates cho người dùng cuối (public + published)_"

Nhưng code **KHÔNG có** WHERE filter:
```typescript
// ❌ Missing filter
where: {
  status: 'published',
  visibility: 'public'
}
```

**Expected Behavior:**
Chỉ users nhìn thấy templates:
- status = 'published'
- visibility = 'public'

**Fix Required:**
```typescript
async listTemplates(query: QueryTemplatesDto) {
  const where: any = {
    status: TemplateStatus.published,  // ✅ Add this
    visibility: 'public'                // ✅ Add this
  };
  
  if (q) {
    where.AND = [
      { OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { id: { contains: q, mode: 'insensitive' } }
      ]}
    ];
  }
  // ... rest of query
}
```

---

### 2. **iOS DTO Missing Fields**

**Severity:** 🟡 **HIGH**  
**Impact:** UI không hiển thị đầy đủ info

**Problem:**
Backend trả về:
- ✅ `id`
- ✅ `name`
- ✅ `thumbnail_url`
- ✅ `published_at` (ISO8601 string)
- ✅ `usage_count` (number)

iOS DTO chỉ decode:
- ✅ `id`
- ✅ `name`
- ✅ `thumbnailURL`
- ❌ **THIẾU** `published_at`
- ❌ **THIẾU** `usage_count`

**Impact:**
- Không thể sort by "newest" (cần published_at)
- Không thể sort by "popular" (cần usage_count)
- Không thể hiển thị stats (HeroStatsCard shows mock data)
- Không thể tính isNew flag (templates trong 7 ngày gần đây)

**Fix Required:**
```swift
struct TemplateDTO: Codable {
  let id: String
  let name: String
  let thumbnailURL: URL?
  let publishedAt: Date?      // ✅ Add this
  let usageCount: Int?        // ✅ Add this
  
  enum CodingKeys: String, CodingKey {
    case id, name
    case thumbnailURL = "thumbnail_url"
    case publishedAt = "published_at"    // ✅ Add
    case usageCount = "usage_count"      // ✅ Add
  }
}
```

---

### 3. **Thumbnail URL Not Used**

**Severity:** 🟡 **HIGH**  
**Impact:** Không hiển thị ảnh thật

**Problem:**
- Backend trả `thumbnail_url`: `"http://localhost:8080/public/thumbnails/anime-style.jpg"`
- iOS DTO decode thành `thumbnailURL: URL?`
- Nhưng ViewModel **không sử dụng**, thay vào đó dùng SF Symbol

**Current Code:**
```swift
func fetchFromAPI(...) {
  let items = resp.templates.map { dto in
    TemplateItem(
      slug: dto.id,
      title: dto.name,
      thumbnailSymbol: nil  // ❌ Hardcoded nil
    )
  }
}
```

**Fix Required:**
1. TemplateItem cần thêm `thumbnailURL: URL?` field
2. Map từ DTO
3. UI components (CardGlassSmall/Large) dùng AsyncImage thay SF Symbol

```swift
struct TemplateItem {
  let thumbnailURL: URL?     // ✅ Add this
  let thumbnailSymbol: String? // Keep for fallback
}

// In fetchFromAPI:
TemplateItem(
  thumbnailURL: dto.thumbnailURL,           // ✅ Use real URL
  thumbnailSymbol: "photo"                   // Fallback
)
```

---

### 4. **Category/Tags Mismatch**

**Severity:** 🟠 **MEDIUM**  
**Impact:** Filtering không hoạt động

**Problem:**
- **Backend:** Template có `tags: String[]` field (e.g., `["anime", "portrait"]`)
- **API:** Query param `tags` có nhưng service code comment: "_TODO: tags filter requires taxonomy tables. Ignored for milestone 1_"
- **iOS:** `TemplateCategory` hardcoded local (All, Portrait, Landscape, Artistic, Vintage, Abstract)

**Impact:**
- User tap category "Portrait" → không filter được
- Backend tags không match với iOS categories
- Cần mapping layer hoặc API hỗ trợ tags filter

**Fix Options:**

**Option A: Backend implement tags filter**
```typescript
// In listTemplates()
if (query.tags) {
  const tagList = query.tags.split(',').map(t => t.trim());
  where.tags = { hasSome: tagList };  // Prisma array filter
}
```

**Option B: iOS fetch tất cả, filter local**
```swift
var filteredTemplates: [TemplateItem] {
  var list = allTemplates
  if selectedCategory != .all {
    list = list.filter { item in
      item.tags?.contains(selectedCategory.id) ?? false
    }
  }
  // ...
}
```

**Recommendation:** Option A (backend filter) cho performance tốt hơn với large dataset.

---

### 5. **isNew/isTrending Logic Undefined**

**Severity:** 🟠 **MEDIUM**  
**Impact:** UI filters không chính xác

**Problem:**
- iOS TemplateItem có `isNew: Bool`, `isTrending: Bool`
- Backend không có fields này
- Cần logic để compute từ `published_at` và `usage_count`

**Current Behavior:**
- Mock data hardcoded isNew/isTrending
- fetchFromAPI() maps tất cả về `false`

**Fix Required:**
Define business rules và implement:

```swift
extension TemplateDTO {
  var isNew: Bool {
    guard let publishedAt = publishedAt else { return false }
    let daysSincePublish = Calendar.current.dateComponents(
      [.day], 
      from: publishedAt, 
      to: Date()
    ).day ?? 999
    return daysSincePublish <= 7  // New = trong 7 ngày
  }
  
  var isTrending: Bool {
    guard let count = usageCount else { return false }
    return count >= 100  // Trending = >= 100 uses
  }
}

// In ViewModel:
TemplateItem(
  isNew: dto.isNew,
  isTrending: dto.isTrending
)
```

---

### 6. **Missing Pagination Metadata**

**Severity:** 🟢 **LOW**  
**Impact:** UX pagination không tối ưu

**Problem:**
- API response không có `meta.total`, `meta.hasMore`
- iOS không biết còn data hay hết
- Không thể show "Loading 12 of 120 templates"

**Current State:**
```json
{
  "success": true,
  "data": { "templates": [...] },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
    // ❌ THIẾU total, hasMore
  }
}
```

**Fix Required (Backend):**
```typescript
async listTemplates(query: QueryTemplatesDto) {
  const where = { ... };
  
  // Get total count
  const total = await prisma.template.count({ where });
  
  const rows = await prisma.template.findMany({
    where, orderBy, take: query.limit, skip: query.offset
  });
  
  return {
    templates: rows.map(mapToApi),
    meta: {
      total,
      limit: query.limit,
      offset: query.offset,
      hasMore: (query.offset + rows.length) < total
    }
  };
}
```

**Fix Required (iOS):**
```swift
struct TemplatesListResponse: Codable {
  let templates: [TemplateDTO]
  let meta: PaginationMeta?  // ✅ Add this
}

struct PaginationMeta: Codable {
  let total: Int?
  let limit: Int?
  let offset: Int?
  let hasMore: Bool?
}
```

---

## 📊 Summary Table

| Issue | Severity | Impact | Backend Fix | iOS Fix | Priority |
|-------|----------|--------|-------------|---------|----------|
| No published filter | 🔴 CRITICAL | Security breach | ✅ Required | - | P0 |
| Missing DTO fields | 🟡 HIGH | UI incomplete | - | ✅ Required | P0 |
| Thumbnail not used | 🟡 HIGH | No images | - | ✅ Required | P0 |
| Tags not working | 🟠 MEDIUM | Filtering broken | ✅ Recommended | ✅ Optional | P1 |
| isNew/Trending logic | 🟠 MEDIUM | Filters wrong | - | ✅ Required | P1 |
| No pagination meta | 🟢 LOW | UX not optimal | ✅ Nice to have | ✅ Nice to have | P2 |

---

## ✅ Recommended Action Plan

### Phase 0: Critical Security Fix (MUST DO NOW)
- [ ] Backend: Add status/visibility filter to listTemplates()
- [ ] Test: Verify draft/archived templates không visible
- [ ] Deploy hotfix

### Phase 1: Core Integration (THIS SPRINT)
- [ ] iOS: Add publishedAt, usageCount to TemplateDTO
- [ ] iOS: Add thumbnailURL to TemplateItem
- [ ] iOS: Update ViewModel mapping logic
- [ ] iOS: Replace SF Symbols with AsyncImage in cards
- [ ] iOS: Implement isNew/isTrending logic
- [ ] Test: End-to-end flow với real data

### Phase 2: Enhanced Features (NEXT SPRINT)
- [ ] Backend: Implement tags filter in listTemplates()
- [ ] Backend: Add pagination metadata (total, hasMore)
- [ ] iOS: Add PaginationMeta to response
- [ ] iOS: Implement infinite scroll
- [ ] iOS: Add pull-to-refresh
- [ ] Test: Pagination và filtering

### Phase 3: Polish (FUTURE)
- [ ] Add image caching (SDWebImage or Kingfisher)
- [ ] Add loading placeholders for thumbnails
- [ ] Add error states for failed image loads
- [ ] Add analytics tracking for template views

---

## 📁 Files to Modify

### Backend:
1. `server/src/templates/templates.service.ts` - Add published filter
2. `server/src/templates/dto/query-templates.dto.ts` - Add tags validation (optional)
3. `server/test/templates.e2e-spec.ts` - Add tests for filtering

### iOS:
1. `AIPhotoApp/AIPhotoApp/Models/DTOs/TemplatesDTOs.swift` - Add missing fields
2. `AIPhotoApp/AIPhotoApp/ViewModels/HomeViewModel.swift` - Update mapping
3. `AIPhotoApp/AIPhotoApp/Views/Common/GlassComponents.swift` - AsyncImage support
4. Test: Add unit tests for DTO decoding

---

## 🧪 Testing Checklist

### Backend Tests:
- [ ] Draft templates không xuất hiện trong /v1/templates
- [ ] Private templates không xuất hiện
- [ ] Published + public templates xuất hiện
- [ ] Tags filter hoạt động (if implemented)
- [ ] Pagination correct với limit/offset

### iOS Tests:
- [ ] TemplateDTO decode đúng all fields
- [ ] thumbnailURL display ảnh thật
- [ ] isNew flag correct cho templates mới
- [ ] isTrending flag correct cho templates popular
- [ ] Category filter hoạt động
- [ ] Search hoạt động

### Integration Tests:
- [ ] E2E: User login → fetch templates → hiển thị đúng
- [ ] E2E: Filter by category → kết quả đúng
- [ ] E2E: Search templates → kết quả đúng
- [ ] E2E: Scroll pagination → load more correct

---

## 📚 References

- OpenAPI Spec: `swagger/openapi.yaml`
- Backend Service: `server/src/templates/templates.service.ts`
- iOS DTOs: `AIPhotoApp/AIPhotoApp/Models/DTOs/TemplatesDTOs.swift`
- iOS ViewModel: `AIPhotoApp/AIPhotoApp/ViewModels/HomeViewModel.swift`
- Brief: `.memory-bank/brief.md`

---

## ✅ IMPLEMENTATION STATUS

**Date Completed:** October 26, 2025

**All critical issues (P0) have been resolved. See `api-integration-implementation.md` for full implementation report.**

