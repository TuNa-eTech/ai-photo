/**
 * Template Types
 * 
 * Based on: .documents/features/template-spec.md
 * Covers both public templates and admin templates
 */

/**
 * Public Template (for end users - iOS app)
 */
export interface Template {
  id: string
  name: string
  thumbnailUrl?: string
  publishedAt?: string
  usageCount?: number
}

/**
 * Templates List Response
 */
export interface TemplatesList {
  templates: Template[]
}

/**
 * Admin Template (full details for CMS)
 */
export interface TemplateAdmin {
  id: string
  slug: string
  name: string
  description?: string
  prompt?: string
  negativePrompt?: string
  modelProvider?: string
  modelName?: string
  thumbnailUrl?: string
  status: TemplateStatus
  visibility: TemplateVisibility
  publishedAt?: string
  usageCount?: number
  isTrendingManual?: boolean
  createdAt: string
  updatedAt: string
  tags?: string[]
}

/**
 * Template Status
 */
export type TemplateStatus = 'draft' | 'published' | 'archived'

/**
 * Template Visibility
 */
export type TemplateVisibility = 'public' | 'private'

/**
 * Templates List Response (Admin)
 */
export interface TemplatesAdminList {
  templates: TemplateAdmin[]
}

/**
 * Create Template Request
 */
export interface CreateTemplateRequest {
  slug?: string
  name: string
  description?: string
  prompt?: string
  negativePrompt?: string
  modelProvider?: string
  modelName?: string
  status?: TemplateStatus
  visibility?: TemplateVisibility
  tags?: string[]
  isTrendingManual?: boolean
}

/**
 * Update Template Request
 */
export interface UpdateTemplateRequest {
  name?: string
  description?: string
  prompt?: string
  negativePrompt?: string
  modelProvider?: string
  modelName?: string
  status?: TemplateStatus
  visibility?: TemplateVisibility
  tags?: string[]
  isTrendingManual?: boolean
}

/**
 * Templates Query Parameters
 */
export interface TemplatesQueryParams {
  limit?: number
  offset?: number
  q?: string
  tags?: string
  sort?: TemplateSortOption
}

/**
 * Admin Templates Query Parameters (extends public with more filters)
 */
export interface AdminTemplatesQueryParams {
  limit?: number
  offset?: number
  q?: string
  tags?: string
  status?: TemplateStatus
  visibility?: TemplateVisibility
  sort?: AdminTemplateSortOption
  trending?: 'all' | 'manual' | 'none'
}

/**
 * Sort options for public templates
 */
export type TemplateSortOption = 'newest' | 'popular' | 'name'

/**
 * Sort options for admin templates (includes 'updated')
 */
export type AdminTemplateSortOption = TemplateSortOption | 'updated'

/**
 * Template Asset
 */
export interface TemplateAsset {
  id: string
  templateId: string
  kind: AssetKind
  url: string
  sortOrder: number
  createdAt: string
}

/**
 * Asset Kind
 */
export type AssetKind = 'thumbnail' | 'preview' | 'cover'

/**
 * Upload Asset Request (multipart/form-data)
 */
export interface UploadAssetRequest {
  kind: AssetKind
  file: File
}

/**
 * Update Asset Request
 */
export interface UpdateAssetRequest {
  kind?: AssetKind
  sortOrder?: number
}

/**
 * Template Assets List Response
 */
export interface TemplateAssetsList {
  assets: TemplateAsset[]
}
