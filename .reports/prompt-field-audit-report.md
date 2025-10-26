# Báo cáo Kiểm toán Field `prompt` trong Hệ thống

**Ngày báo cáo:** 2025-10-26  
**Người thực hiện:** AI Assistant  
**Phạm vi:** Toàn bộ hệ thống (Tài liệu, Backend, Web Admin, iOS)

---

## Executive Summary

Field `prompt` - thành phần **QUAN TRỌNG NHẤT** để xử lý ảnh với AI - hiện **THIẾU HOÀN TOÀN** trong toàn bộ hệ thống:
- ❌ Không có trong Prisma schema
- ❌ Không có trong DTOs (Backend)
- ❌ Không có trong Types (Web Admin)
- ❌ Không có trong UI Form
- ⚠️ Có đề cập trong tài liệu nhưng chưa implement

Điều này **ảnh hưởng nghiêm trọng** đến chức năng image processing API (POST /v1/images/process), vì không có prompt để gửi cho Gemini API.

---

## Chi tiết Kiểm toán

### 1. Tài liệu (.documents/)

#### ✅ Có đề cập đến prompt:

**`.documents/features/template-spec.md`** (line 88-89):
```markdown
### POST /v1/images/process
- Mục đích: Xử lý ảnh theo template đã chọn (sau khi upload ảnh).
- Lưu ý: prompt/params bí mật chỉ xử lý server-side; client không thấy.
```

**`.documents/architecture/data-model/templates.md`**:
- ERD diagram có `template_versions` table với field `prompt_template` (line 57-64)
- Mô tả versioning cho prompt/params (line 213-218)
- DDL migration có field `prompt_template TEXT NOT NULL` (line 136)

**`.documents/features/image-processing.md`**:
- Đề cập "Template được truy vấn từ file templates.json" (line 52)
- Có model `Template` với field `Prompt` (line 22)

**`.documents/integrations/gemini-backend.md`** (line 146):
```markdown
- Prompt nên lấy động từ template (truy vấn DB), không hardcode.
```

#### Kết luận Tài liệu:
✅ Tài liệu **có thiết kế đầy đủ** cho field prompt  
❌ Nhưng implementation **CHƯA ĐƯỢC THỰC HIỆN**

---

### 2. Backend Server (NestJS + Prisma)

#### ❌ Prisma Schema (`server/prisma/schema.prisma`):

**Hiện tại:**
```prisma
model Template {
  id           String             @id @default(uuid())
  slug         String             @unique
  name         String
  description  String?
  status       TemplateStatus     @default(draft)
  visibility   TemplateVisibility @default(public)
  thumbnailUrl String?            @map("thumbnail_url")
  publishedAt  DateTime?          @map("published_at")
  usageCount   Int                @default(0) @map("usage_count")
  tags         String[]           @default([])
  createdAt    DateTime           @default(now()) @map("created_at")
  updatedAt    DateTime           @updatedAt @map("updated_at")

  @@index([status])
  @@index([visibility])
  @@index([publishedAt])
  @@map("templates")
}
```

**Thiếu:**
- ❌ Field `prompt` 
- ❌ Bảng `template_versions` (theo data model spec)
- ❌ Field `model_provider`, `model_name`
- ❌ Field `negative_prompt`

#### ❌ DTOs (`server/src/templates/dto/`):

**CreateTemplateDto** thiếu:
```typescript
// Thiếu: prompt, model_provider, model_name, negative_prompt
```

**UpdateTemplateDto** thiếu:
```typescript
// Thiếu: prompt, model_provider, model_name, negative_prompt
```

#### ❌ Service (`server/src/templates/templates.service.ts`):

Types `ApiTemplateAdmin` thiếu:
```typescript
export type ApiTemplateAdmin = {
  // ... các field hiện tại
  // Thiếu: prompt, model_provider, model_name, negative_prompt
};
```

#### Kết luận Backend:
❌ **HOÀN TOÀN THIẾU** field prompt trong schema, DTOs, types, và logic

---

### 3. Web Admin (React + TypeScript)

#### ❌ Types (`web-cms/src/types/template.ts`):

**TemplateAdmin interface** thiếu:
```typescript
export interface TemplateAdmin {
  // ... các field hiện tại
  // Thiếu: prompt, model_provider, model_name, negative_prompt
}
```

**CreateTemplateRequest** thiếu:
```typescript
export interface CreateTemplateRequest {
  // ... các field hiện tại
  // Thiếu: prompt, model_provider, model_name, negative_prompt
}
```

**UpdateTemplateRequest** thiếu:
```typescript
export interface UpdateTemplateRequest {
  // ... các field hiện tại
  // Thiếu: prompt, model_provider, model_name, negative_prompt
}
```

#### ❌ UI Form (`web-cms/src/components/templates/TemplateFormDialog.tsx`):

**Không có UI input cho:**
- ❌ Prompt (textarea)
- ❌ Negative Prompt (textarea)
- ❌ Model Provider (select)
- ❌ Model Name (select)

**Form data state** thiếu:
```typescript
const [formData, setFormData] = useState<CreateTemplateRequest>({
  slug: '',
  name: '',
  description: '',
  status: 'draft',
  visibility: 'public',
  tags: [],
  // Thiếu: prompt, negative_prompt, model_provider, model_name
})
```

#### Kết luận Web Admin:
❌ **HOÀN TOÀN THIẾU** prompt trong types, API calls, và UI

---

### 4. Sample Data (`.box-testing/json/templates-sample.json`)

#### ❌ Sample templates thiếu prompt:

```json
{
  "slug": "anime-portrait-style",
  "name": "Anime Portrait Style",
  "description": "Transform your photos...",
  // Thiếu: prompt, negative_prompt, model_provider, model_name
}
```

---

### 5. Swagger/OpenAPI (`swagger/openapi.yaml`)

#### ⚠️ Đề cập nhưng không định nghĩa schema:

Line 21-22:
```yaml
description: |
  Lưu ý: Prompt không được trả về trong API công khai.
```

**Thiếu:**
- ❌ Admin schema với field prompt
- ❌ Model provider/name fields
- ❌ Template versions schema

---

## Phân tích Tác động

### 🔴 Critical Impact: Image Processing API

**Endpoint:** `POST /v1/images/process`

**Vấn đề:**
1. Backend cần prompt để gửi cho Gemini API
2. Hiện tại không có nơi lưu prompt
3. Image processing sẽ **KHÔNG THỂ HOẠT ĐỘNG** nếu không có prompt

**Code affected:**
- `.documents/integrations/gemini-backend.md` - Hướng dẫn tích hợp Gemini
- Future implementation của `/v1/images/process` endpoint

### 🟡 High Impact: Admin UX

**Vấn đề:**
- Admin không thể tạo/edit prompt trong CMS
- Không thể test template với AI provider
- Không thể versioning prompts

### 🟡 Medium Impact: Template Management

**Vấn đề:**
- Không thể quản lý model provider (Gemini, DALL-E, Midjourney...)
- Không thể quản lý model name/version
- Không thể A/B test prompts

---

## So sánh với Architecture Design

### Theo `.documents/architecture/data-model/templates.md`:

**Should have:**
```sql
CREATE TABLE template_versions (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES templates(id),
  version INT NOT NULL,
  prompt_template TEXT NOT NULL,
  negative_prompt TEXT,
  prompt_variables JSONB DEFAULT '{}',
  model_parameters JSONB DEFAULT '{}',
  ...
)

ALTER TABLE templates 
  ADD COLUMN current_version_id UUID REFERENCES template_versions(id);
```

**Current state:**
- ❌ No `template_versions` table
- ❌ No versioning system
- ❌ No prompt management

---

## Đề xuất Phương hướng

### 🎯 Chiến lược: 2-Phase Implementation

#### **Phase 1: Quick Fix (MVP) - Thêm prompt trực tiếp vào Template**

**Mục tiêu:** Đáp ứng nhanh nhu cầu image processing API

**Lý do:**
- ✅ Đơn giản, nhanh chóng implement
- ✅ Đủ để image processing hoạt động
- ✅ Dễ test và validate
- ✅ Có thể migrate sang versioning sau

**Implementation:**

1. **Schema Migration** (15 phút):
```prisma
model Template {
  // ... existing fields
  prompt           String?  // AI prompt template
  negativePrompt   String?  @map("negative_prompt")
  modelProvider    String   @default("gemini") @map("model_provider")
  modelName        String   @default("gemini-1.5-pro") @map("model_name")
}
```

2. **DTOs Update** (10 phút):
```typescript
// CreateTemplateDto, UpdateTemplateDto
@IsOptional()
@IsString()
prompt?: string;

@IsOptional()
@IsString()
negativePrompt?: string;

@IsOptional()
@IsString()
modelProvider?: string;

@IsOptional()
@IsString()
modelName?: string;
```

3. **Types Update** (5 phút):
```typescript
export interface TemplateAdmin {
  // ... existing fields
  prompt?: string
  negative_prompt?: string
  model_provider?: string
  model_name?: string
}
```

4. **UI Form** (30 phút):
```tsx
{/* Prompt Section */}
<Grid item xs={12}>
  <TextField
    fullWidth
    multiline
    rows={6}
    label="Prompt"
    value={formData.prompt}
    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
    helperText="AI prompt template for image generation/processing"
    placeholder="A stunning portrait in {style} style with {mood} atmosphere..."
  />
</Grid>

<Grid item xs={12}>
  <TextField
    fullWidth
    multiline
    rows={3}
    label="Negative Prompt"
    value={formData.negativePrompt}
    helperText="What to avoid in generated images"
    placeholder="blurry, low quality, distorted..."
  />
</Grid>

<Grid item xs={6}>
  <FormControl fullWidth>
    <InputLabel>Model Provider</InputLabel>
    <Select value={formData.modelProvider}>
      <MenuItem value="gemini">Gemini</MenuItem>
      <MenuItem value="openai">OpenAI DALL-E</MenuItem>
      <MenuItem value="midjourney">Midjourney</MenuItem>
    </Select>
  </FormControl>
</Grid>

<Grid item xs={6}>
  <TextField
    fullWidth
    label="Model Name"
    value={formData.modelName}
    placeholder="gemini-1.5-pro, gpt-4-vision..."
  />
</Grid>
```

5. **Sample Data Update** (5 phút):
```json
{
  "slug": "anime-portrait-style",
  "name": "Anime Portrait Style",
  "prompt": "Transform this photo into a beautiful anime-style portrait with vibrant colors, expressive eyes, and soft shading. Style: modern anime, high quality",
  "negative_prompt": "realistic, photographic, blurry, low quality",
  "model_provider": "gemini",
  "model_name": "gemini-1.5-pro"
}
```

**Ước tính:** ~1-2 giờ để complete Phase 1

---

#### **Phase 2: Full Versioning System (Future Enhancement)**

**Khi nào cần:**
- Khi cần A/B test prompts
- Khi cần rollback prompt versions
- Khi cần audit history
- Khi có nhiều hơn 50 templates

**Implementation:**
- Tạo bảng `template_versions`
- Migration data từ `templates.prompt` sang `template_versions`
- Update admin UI để manage versions
- Implement version picker

**Ước tính:** ~1-2 ngày

---

## Recommended Action Plan

### ✅ Immediate Actions (Today):

1. **[BLOCKER]** Implement Phase 1: Add prompt fields to schema
   - Priority: P0 (Critical)
   - Owner: Backend Dev
   - Time: 2 hours
   - Deliverables:
     - [ ] Migration file created
     - [ ] DTOs updated
     - [ ] Service methods updated
     - [ ] Tests pass

2. **[BLOCKER]** Update Web Admin UI with prompt inputs
   - Priority: P0 (Critical)
   - Owner: Frontend Dev
   - Time: 1 hour
   - Deliverables:
     - [ ] Types updated
     - [ ] Form fields added
     - [ ] Validation added

3. **[HIGH]** Update sample data with prompts
   - Priority: P1 (High)
   - Owner: QA/Dev
   - Time: 30 minutes
   - Deliverables:
     - [ ] templates-sample.json updated với realistic prompts

4. **[MEDIUM]** Update API documentation
   - Priority: P2 (Medium)
   - Owner: Tech Lead
   - Time: 30 minutes
   - Deliverables:
     - [ ] Swagger updated với prompt fields
     - [ ] admin-templates-api.md updated

### 📋 Follow-up Actions (This Week):

5. **Test image processing flow end-to-end**
   - Create template with prompt
   - Call /v1/images/process
   - Verify Gemini API receives correct prompt

6. **Update implementation plans**
   - Mark prompt fields as completed
   - Update feature-image-process-integration-plan.md

7. **Update memory bank**
   - Document prompt management strategy
   - Update architecture.md

### 🔮 Future Considerations:

8. **Phase 2: Template Versioning**
   - Create RFC for versioning system
   - Design migration strategy
   - Plan backward compatibility

---

## Security & Privacy Notes

### ✅ Prompt Privacy (Đã đúng theo design):

**Public API** (`GET /v1/templates`):
- ❌ KHÔNG expose prompt
- ✅ Chỉ trả về: id, name, thumbnail_url, published_at, usage_count

**Admin API** (`GET /v1/admin/templates`):
- ✅ CÓ expose prompt (admin only)
- ✅ Protected by BearerAuthGuard

**Image Processing** (`POST /v1/images/process`):
- ✅ Prompt xử lý server-side only
- ✅ Client chỉ gửi template_id, không thấy prompt

### 🔒 Recommendations:

1. **Không log prompt ra console/logs** (có thể chứa business secrets)
2. **Encrypt prompts trong DB backups** (nếu cần extra security)
3. **Audit log khi admin thay đổi prompt** (tracking changes)

---

## Checklist: Implementation Completion

### Backend:
- [ ] Add prompt, negativePrompt, modelProvider, modelName to Prisma schema
- [ ] Create migration: `20251026_add_prompt_fields`
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Update CreateTemplateDto with new fields
- [ ] Update UpdateTemplateDto with new fields
- [ ] Update ApiTemplateAdmin type with new fields
- [ ] Update templates.service.ts to handle new fields
- [ ] Test: Create template with prompt
- [ ] Test: Update template prompt
- [ ] Test: Get template by slug returns prompt (admin only)
- [ ] Test: Public API does NOT return prompt

### Web Admin:
- [ ] Update TemplateAdmin interface with prompt fields
- [ ] Update CreateTemplateRequest interface
- [ ] Update UpdateTemplateRequest interface
- [ ] Add Prompt textarea to TemplateFormDialog
- [ ] Add Negative Prompt textarea to TemplateFormDialog
- [ ] Add Model Provider select to TemplateFormDialog
- [ ] Add Model Name input to TemplateFormDialog
- [ ] Update form state to include new fields
- [ ] Update form validation
- [ ] Test: Create template with prompt via UI
- [ ] Test: Edit template prompt via UI
- [ ] Test: View template prompt in table (optional column)

### Data & Docs:
- [ ] Update templates-sample.json with realistic prompts
- [ ] Update swagger/openapi.yaml with admin schema
- [ ] Update .documents/api/admin-templates-api.md
- [ ] Update .memory-bank/architecture.md
- [ ] Update .memory-bank/context.md

### Testing:
- [ ] Unit test: TemplatesService with prompt fields
- [ ] Integration test: Admin CRUD with prompts
- [ ] E2E test: Create → Upload → Add prompt → Publish → Process image
- [ ] Manual test: Full flow in Docker environment

---

## Appendix: Example Prompts

### Good Prompt Examples:

**Anime Portrait:**
```
Transform this photo into a beautiful anime-style portrait with:
- Vibrant, saturated colors
- Large, expressive eyes with detailed highlights
- Soft cel-shading technique
- Clean line art
- Modern anime aesthetic (2020s style)
- Smooth skin with subtle blush
- Detailed hair with dynamic flow
- Professional anime character art quality
```

**Cyberpunk Neon:**
```
Transform this photo into a cyberpunk neon city scene:
- Futuristic urban environment with neon lights
- Purple, blue, and pink neon color palette
- Rainy reflective streets
- Holographic advertisements
- High-tech dystopian atmosphere
- Blade Runner aesthetic
- 4K ultra-detailed
- Cinematic lighting
```

**Oil Painting Classic:**
```
Transform this photo into a classical oil painting:
- Renaissance master style (Rembrandt, Vermeer)
- Rich, warm color palette with golden tones
- Visible brushstrokes and texture
- Dramatic chiaroscuro lighting
- Museum-quality fine art
- Realistic portrait with depth
- Subtle craquelure (aging effect)
- Professional art restoration quality
```

### Negative Prompt Examples:

**General:**
```
blurry, low quality, distorted, deformed, ugly, poor anatomy, bad proportions, extra limbs, cloned face, malformed, gross proportions, missing arms, missing legs, extra arms, extra legs, mutated hands, fused fingers, too many fingers, long neck, watermark, signature, text, logo
```

**Anime:**
```
realistic photo, 3D render, western cartoon, low quality, blurry, distorted face, bad anatomy
```

**Realistic:**
```
anime, cartoon, painting, drawing, illustration, digital art, artificial, fake
```

---

## Conclusion

Field `prompt` là thành phần **QUAN TRỌNG NHẤT** cho image processing API nhưng hiện **HOÀN TOÀN THIẾU** trong system. 

**Recommended approach:**
1. ✅ **Phase 1 (NOW):** Add prompt fields directly to Template model
2. 🔮 **Phase 2 (LATER):** Implement full versioning system when needed

**Estimated effort:** 2-3 hours để complete Phase 1 và unblock image processing feature.

**Risk if not implemented:** Image processing API **CANNOT WORK** without prompts.

---

**Report End**

