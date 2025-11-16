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
  thumbnail_url?: string
  published_at?: string
  usage_count?: number
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
  negative_prompt?: string
  model_provider?: string
  model_name?: string
  thumbnail_url?: string
  status: TemplateStatus
  visibility: TemplateVisibility
  published_at?: string
  usage_count?: number
  created_at: string
  updated_at: string
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
  negative_prompt?: string
  model_provider?: string
  model_name?: string
  status?: TemplateStatus
  visibility?: TemplateVisibility
  tags?: string[]
}

/**
 * Update Template Request
 */
export interface UpdateTemplateRequest {
  name?: string
  description?: string
  prompt?: string
  negative_prompt?: string
  model_provider?: string
  model_name?: string
  status?: TemplateStatus
  visibility?: TemplateVisibility
  tags?: string[]
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
  template_id: string
  kind: AssetKind
  url: string
  sort_order: number
  created_at: string
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
  sort_order?: number
}

/**
 * Template Assets List Response
 */
export interface TemplateAssetsList {
  assets: TemplateAsset[]
}

