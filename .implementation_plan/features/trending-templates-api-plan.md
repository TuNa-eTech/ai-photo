# Implementation Plan: Trending Templates API

## Status Checklist

- [X] OpenAPI/Swagger specification updated
- [X] Backend: Controller route added
- [X] Backend: Service method implemented
- [X] Backend: API tested (route verified, requires real token for full test)
- [X] iOS: Repository method added
- [X] iOS: HomeViewModel updated
- [X] iOS: App ready for testing on simulator
- [X] Documentation updated (architecture.md)
- [ ] Code reviewed and merged (pending user verification)

## 1. Overview

**Feature:** Add dedicated `/v1/templates/trending` endpoint to fetch trending templates efficiently.

**Goals:**
- Improve home screen performance by fetching only trending templates
- Enable backend-controlled trending logic (threshold, algorithm)
- Reduce bandwidth and client-side filtering
- Support pagination for trending templates

**Affected Components:**
- Backend: `templates.controller.ts`, `templates.service.ts`
- iOS App: `TemplatesRepository.swift`, `HomeViewModel.swift`
- API Spec: `swagger/openapi.yaml`

## 2. Technical Approach

### 2.1 API Design

**Endpoint:**
```
GET /v1/templates/trending
```

**Query Parameters:**
- `limit` (optional, integer, default: 20, max: 50)
- `offset` (optional, integer, default: 0)

**Response Format:** (matches existing `/v1/templates`)
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "name": "Template Name",
        "thumbnail_url": "http://...",
        "published_at": "ISO8601",
        "usage_count": 1234
      }
    ]
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

**Trending Logic:**
- Filter: `status = published`, `visibility = public`, `usage_count >= 500`
- Sort: `usage_count DESC`
- Limit: configurable via query param (default 20)

**Authentication:** Requires Bearer token (Firebase ID token)

### 2.2 Backend Implementation

**File:** `server/src/templates/templates.controller.ts`
```typescript
@Get('trending')
async listTrending(@Query() query: QueryTemplatesDto) {
  return this.templatesService.listTrendingTemplates(query);
}
```

**File:** `server/src/templates/templates.service.ts`
```typescript
async listTrendingTemplates(query: QueryTemplatesDto): Promise<{ templates: ApiTemplate[] }> {
  const { limit = 20, offset = 0 } = query;
  
  const where = {
    status: TemplateStatus.published,
    visibility: 'public',
    usageCount: { gte: 500 } // Trending threshold
  };
  
  const rows = await this.prisma.template.findMany({
    where,
    orderBy: { usageCount: 'desc' },
    take: Math.min(limit, 50), // Cap at 50
    skip: offset,
    select: {
      id: true,
      name: true,
      thumbnailUrl: true,
      publishedAt: true,
      usageCount: true,
    },
  });
  
  return { templates: rows.map((r) => this.mapToApi(r)) };
}
```

**Reuse:** `QueryTemplatesDto` (existing), `mapToApi` (existing)

### 2.3 iOS App Implementation

**File:** `AIPhotoApp/Repositories/TemplatesRepository.swift`

Add new method:
```swift
func listTrendingTemplates(
    limit: Int?,
    offset: Int?,
    bearerIDToken: String,
    tokenProvider: (() async throws -> String)?
) async throws -> TemplatesListResponse
```

Implementation: Similar to `listTemplates` but hit `/v1/templates/trending` endpoint.

**File:** `AIPhotoApp/ViewModels/HomeViewModel.swift`

Update `fetchFromAPI` to call new method:
```swift
func fetchTrendingFromAPI(repo: TemplatesRepositoryProtocol, 
                          bearerIDToken: String, 
                          limit: Int? = 20,
                          tokenProvider: (() async throws -> String)? = nil) {
    // Call repo.listTrendingTemplates
    // Update trendingTemplates directly (no filter needed)
}
```

Update `onAppear` in `TemplatesHomeView.swift` to call `fetchTrendingFromAPI` instead of `fetchFromAPI`.

### 2.4 OpenAPI/Swagger Update

**File:** `swagger/openapi.yaml`

Add new path under `/v1/templates/trending`:
```yaml
/v1/templates/trending:
  get:
    summary: List trending templates
    description: Returns templates with high usage count (trending)
    tags:
      - Templates
    security:
      - BearerAuth: []
    parameters:
      - name: limit
        in: query
        schema:
          type: integer
          default: 20
          maximum: 50
      - name: offset
        in: query
        schema:
          type: integer
          default: 0
    responses:
      '200':
        description: List of trending templates
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/Envelope'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/TemplatesList'
```

## 3. Testing Strategy

### 3.1 Backend Testing

**Manual Test (curl):**
```bash
# Get valid Firebase token first
TOKEN="your_firebase_id_token"

# Test trending endpoint
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/v1/templates/trending?limit=10"

# Verify response structure matches /v1/templates
# Verify all returned templates have usage_count >= 500
# Verify sorted by usage_count DESC
```

**Expected:**
- Status 200
- Returns 10 templates (or less if not enough trending)
- All templates have `usage_count >= 500`
- Sorted by usage_count descending

### 3.2 iOS App Testing

**Simulator Test:**
1. Clean build and run app
2. Login with Firebase account
3. Observe home screen loads trending templates
4. Check Xcode console for API logs:
   - `➡️ API Request: GET .../v1/templates/trending?limit=20`
   - `⬅️ API Response: 200 ...`
5. Verify 4-6 templates display on home screen
6. Tap "See All" → verify AllTemplatesView shows all templates

**Edge Cases:**
- No templates have usage >= 500 → should show empty or fallback
- API returns error → should show error banner with retry

## 4. Deployment Steps

1. **Backend:**
   - Update code
   - Run TypeScript build: `yarn build`
   - Restart server: `yarn start:prod`
   - Test endpoint with curl

2. **iOS App:**
   - Update code
   - Clean build (⇧⌘K)
   - Run on simulator
   - Verify home screen loads data

3. **Documentation:**
   - Update `.memory-bank/architecture.md` with new endpoint
   - Update API changelog if exists

## 5. Rollback Plan

If issues occur:
- Backend: Remove new route, restart server (old endpoint still works)
- iOS: Revert to use `/v1/templates` with client-side filtering
- Both are backward compatible

## 6. Future Enhancements

- Add time-based trending (e.g., trending this week)
- Add category-specific trending (e.g., trending portraits)
- Cache trending results in Redis (5-minute TTL)
- Add engagement rate (views/usage ratio)
- A/B test different trending thresholds

## 7. Notes

- Trending threshold (500) is configurable in service
- Can be moved to env var later: `TRENDING_THRESHOLD=500`
- Keep `/v1/templates` for full list with filters
- Trending API is read-only, no mutations

