# Implementation Plan: Web CMS Image Processing Integration

**Created:** 2025-10-27  
**Status:** Ready to Implement  
**Estimated Time:** 2-3 hours  

---

## Overview

Tích hợp API `/v1/images/process` vào web-cms để cho phép admin test image generation trong Template Detail page.

**Current State:**
- ✅ UI components đã có: `ImageGeneratorForm`, `ResultDisplay`
- ❌ API client (`api/images.ts`) đang define sai contract
- ❌ Chưa có logic convert File → base64
- ❌ Chưa handle base64 response đúng cách

**Goal:**
- Fix API client để match backend contract
- Add base64 conversion utility
- Update components để handle base64 data URIs
- Test với real backend API

---

## Status Checklist

- [ ] **Update API Client**
  - [ ] Fix `ProcessImageRequest` interface (template_id, image_base64, options)
  - [ ] Fix `ProcessImageResponse` interface (processed_image_base64, metadata)
  - [ ] Implement helper function để convert image base64 ↔ data URI

- [ ] **Add Image Utilities**
  - [ ] Create `utils/imageHelper.ts`
  - [ ] Add `fileToBase64(file: File): Promise<string>` function
  - [ ] Add `base64ToDataUri(base64: string, mimeType: string): string` function
  - [ ] Add image compression/validation helpers

- [ ] **Update ImageGeneratorForm**
  - [ ] Convert File → base64 khi user upload file
  - [ ] Show file size validation (max 10MB)
  - [ ] Show loading state during conversion
  - [ ] Pass base64 string to onGenerate callback

- [ ] **Update TemplateDetailPage**
  - [ ] Handle base64 request (pass to API correctly)
  - [ ] Handle base64 response (convert to blob/data URI for display)
  - [ ] Show processing metadata (generation time, model used)
  - [ ] Handle error states properly

- [ ] **Update ResultDisplay**
  - [ ] Handle base64 data URIs for display
  - [ ] Add download functionality for processed image
  - [ ] Show metadata (optional)

- [ ] **Testing**
  - [ ] Test with real backend API
  - [ ] Test with various image formats (JPEG, PNG)
  - [ ] Test with different file sizes (small, large)
  - [ ] Test error scenarios (invalid image, timeout, etc.)
  - [ ] Test loading states and user feedback

- [ ] **Polish**
  - [ ] Add progress indicator for conversion
  - [ ] Add error messages for validation
  - [ ] Add success snackbar messages
  - [ ] Review UI/UX for smooth experience

---

## Backend API Contract

### Request

```typescript
POST /v1/images/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "template_id": "uuid",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "options": {
    "width": 1024,
    "height": 1024,
    "quality": "standard"
  }
}
```

### Response

```typescript
{
  "success": true,
  "data": {
    "processed_image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "metadata": {
      "template_id": "uuid",
      "template_name": "Anime Style",
      "model_used": "imagen-3-fast",
      "generation_time_ms": 8500,
      "original_dimensions": { "width": 1920, "height": 1080 },
      "processed_dimensions": { "width": 1024, "height": 1024 }
    }
  },
  "meta": { "requestId": "req_123", "timestamp": "..." }
}
```

---

## Files to Modify

### 1. `web-cms/src/api/images.ts`

**Current Issues:**
- `ProcessImageRequest` defines `image_path` (wrong)
- `ProcessImageResponse` defines `processed_image_url` (wrong)

**Fix:**
```typescript
export interface ProcessImageRequest {
  template_id: string
  image_base64: string
  options?: {
    width?: number
    height?: number
    quality?: 'standard' | 'high'
  }
}

export interface ProcessImageMetadata {
  template_id: string
  template_name: string
  model_used: string
  generation_time_ms: number
  original_dimensions?: { width: number; height: number }
  processed_dimensions: { width: number; height: number }
}

export interface ProcessImageResponse {
  processed_image_base64: string
  metadata: ProcessImageMetadata
}
```

### 2. `web-cms/src/utils/imageHelper.ts` (NEW FILE)

**Create image conversion utilities:**
```typescript
/**
 * Convert File to base64 data URI
 */
export async function fileToBase64(file: File): Promise<string>

/**
 * Convert base64 string to data URI
 */
export function base64ToDataUri(base64: string, mimeType: string): string

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string }

/**
 * Compress image if needed
 */
export async function compressImageIfNeeded(file: File): Promise<File>
```

### 3. `web-cms/src/components/templates/ImageGeneratorForm.tsx`

**Changes:**
- Call `fileToBase64()` when user uploads file
- Pass `image_base64` to `onGenerate` callback (not `image_path`)
- Add loading state during base64 conversion
- Show file size validation

**Before:**
```typescript
const handleGenerate = async (): Promise<void> => {
  // ...
  imagePath = selectedFile.name // ❌ Wrong!
  await onGenerate(imagePath)
}
```

**After:**
```typescript
const handleGenerate = async (): Promise<void> => {
  if (inputMode === 'upload') {
    if (!selectedFile) return
    setError('')
    
    // Convert to base64
    const base64 = await fileToBase64(selectedFile)
    await onGenerate(base64)
  } else {
    await onGenerate(imageUrl)
  }
}
```

### 4. `web-cms/src/pages/Templates/TemplateDetailPage.tsx`

**Changes:**
- Update `handleGenerate` to accept base64 string
- Call API with correct payload
- Handle base64 response properly
- Display processed image using data URI
- Show metadata in UI

**Current:**
```typescript
const handleGenerate = async (imagePath: string): Promise<void> => {
  const result = await processImage({
    template_id: template.id,
    image_path: imagePath, // ❌ Wrong!
  })
  setGeneratedImageUrl(result.processed_image_url) // ❌ Wrong!
}
```

**Fixed:**
```typescript
const handleGenerate = async (imageBase64: string): Promise<void> => {
  const result = await processImage({
    template_id: template.id,
    image_base64: imageBase64,
  })
  
  // Response already in data URI format
  setGeneratedImageUrl(result.processed_image_base64)
  
  // Show metadata
  console.log('Generation time:', result.metadata.generation_time_ms, 'ms')
}
```

### 5. `web-cms/src/components/templates/ResultDisplay.tsx`

**No changes needed** - component already handles data URI URLs correctly via `<img src="data:image/jpeg;base64,..." />`

---

## Implementation Details

### File to Base64 Conversion

```typescript
// web-cms/src/utils/imageHelper.ts
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result) // Already in data URI format: "data:image/jpeg;base64,..."
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}
```

### Image Validation

```typescript
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file' }
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  return { valid: true }
}
```

### API Call in TemplateDetailPage

```typescript
const handleGenerate = async (imageBase64: string): Promise<void> => {
  if (!template) return

  setIsGenerating(true)
  setError('')
  setGeneratedImageUrl('')

  try {
    // Store original image URL
    setOriginalImageUrl(imageBase64)

    // Call process image API
    const result = await processImage({
      template_id: template.id,
      image_base64: imageBase64,
      options: {
        width: 1024,
        height: 1024,
        quality: 'standard',
      },
    })

    setGeneratedImageUrl(result.processed_image_base64)
    showSnackbar('Image generated successfully!', 'success')
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate image'
    setError(errorMessage)
    showSnackbar(errorMessage, 'error')
  } finally {
    setIsGenerating(false)
  }
}
```

---

## Testing Checklist

- [ ] Upload JPEG file → Success
- [ ] Upload PNG file → Success  
- [ ] Paste image URL → Success
- [ ] Upload large file (>10MB) → Show error
- [ ] Upload non-image file → Show error
- [ ] Processing timeout → Show error with retry
- [ ] Template without prompt → Show error
- [ ] Invalid template ID → Show error
- [ ] Network error → Show error with retry
- [ ] Success flow → Display result correctly
- [ ] Download result → Works correctly
- [ ] Compare view → Works correctly

---

## Error Handling

### 1. File Too Large

```typescript
if (file.size > 10 * 1024 * 1024) {
  setError('File size must be less than 10MB')
  return
}
```

### 2. Invalid Image Format

```typescript
if (!file.type.startsWith('image/')) {
  setError('Please select a valid image file (JPEG or PNG)')
  return
}
```

### 3. API Error

```typescript
catch (err) {
  const errorMessage = err instanceof Error 
    ? err.message 
    : 'Failed to generate image. Please try again.'
  
  setError(errorMessage)
  showSnackbar(errorMessage, 'error')
}
```

---

## UI/UX Enhancements

### 1. Progress Indicator

Add progress bar during base64 conversion:
```typescript
const [isConverting, setIsConverting] = useState(false)

const handleFileChange = async (event) => {
  setIsConverting(true)
  // ... convert file
  setIsConverting(false)
}
```

### 2. File Info Display

Show file size and dimensions:
```typescript
{selectedFile && (
  <Alert severity="info">
    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
  </Alert>
)}
```

### 3. Processing Metadata

Show generation time after success:
```typescript
{result.metadata && (
  <Alert severity="success">
    Generated in {result.metadata.generation_time_ms}ms using {result.metadata.model_used}
  </Alert>
)}
```

---

## Security & Validation

1. **File Size Limit:** Max 10MB
2. **File Type Validation:** Only JPEG and PNG
3. **Base64 Validation:** Backend validates format
4. **CORS:** Backend must allow web-cms origin
5. **Authentication:** Bearer token required for all requests

---

## Performance Considerations

1. **Base64 Conversion:** Happens in browser (client-side)
2. **File Size:** Max 10MB before upload (~14MB after base64 encoding)
3. **Network Transfer:** Entire image sent in single request
4. **Processing Time:** Backend expects 5-30s, UI should show loading state
5. **Memory:** Large images in memory during conversion - use streaming if possible

---

## Success Criteria

- ✅ Users can upload image files successfully
- ✅ Users can paste image URLs successfully
- ✅ Processed images display correctly in side-by-side view
- ✅ Error messages are clear and actionable
- ✅ Loading states provide good user feedback
- ✅ Download functionality works correctly
- ✅ All edge cases handled gracefully

---

## References

- Backend API Spec: `.documents/features/gemini-image-processing.md`
- Backend Implementation: `server/src/images/`
- Frontend Types: `web-cms/src/types/`
- Testing Guide: `.documents/workflow.md`

---

**Next Steps:**

1. Fix API client interface
2. Create imageHelper utility
3. Update ImageGeneratorForm
4. Update TemplateDetailPage
5. Test with backend API
6. Polish UI/UX

