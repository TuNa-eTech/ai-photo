/**
 * Templates API Functions
 * 
 * Public and Admin endpoints for templates management
 * Based on: .documents/features/template-spec.md
 */

import { apiClient } from './client'
import type {
  TemplatesList,
  TemplateAdmin,
  TemplatesAdminList,
  TemplatesQueryParams,
  AdminTemplatesQueryParams,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateAsset,
  TemplateAssetsList,
  UploadAssetRequest,
  UpdateAssetRequest,
} from '../types'

/**
 * Build query string from params
 */
function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

// ============================================================================
// PUBLIC TEMPLATES API (for end users - iOS)
// ============================================================================

/**
 * Get templates list (public)
 * GET /v1/templates
 */
export async function getTemplates(params?: TemplatesQueryParams): Promise<TemplatesList> {
  const queryString = params ? buildQueryString(params as Record<string, string | number | boolean | undefined>) : ''
  return apiClient.get<TemplatesList>(`/v1/templates${queryString}`)
}

// ============================================================================
// ADMIN TEMPLATES API
// ============================================================================

/**
 * Get templates list (admin with filters)
 * GET /v1/admin/templates
 */
export async function getAdminTemplates(
  params?: AdminTemplatesQueryParams
): Promise<TemplatesAdminList> {
  const queryString = params ? buildQueryString(params as Record<string, string | number | boolean | undefined>) : ''
  return apiClient.get<TemplatesAdminList>(`/v1/admin/templates${queryString}`)
}

/**
 * Get template detail (admin)
 * GET /v1/admin/templates/{slug}
 */
export async function getAdminTemplate(slug: string): Promise<TemplateAdmin> {
  return apiClient.get<TemplateAdmin>(`/v1/admin/templates/${slug}`)
}

/**
 * Create template (admin)
 * POST /v1/admin/templates
 */
export async function createTemplate(data: CreateTemplateRequest): Promise<TemplateAdmin> {
  return apiClient.post<TemplateAdmin>('/v1/admin/templates', data)
}

/**
 * Update template (admin)
 * PUT /v1/admin/templates/{slug}
 */
export async function updateTemplate(
  slug: string,
  data: UpdateTemplateRequest
): Promise<TemplateAdmin> {
  return apiClient.put<TemplateAdmin>(`/v1/admin/templates/${slug}`, data)
}

/**
 * Delete template (admin)
 * DELETE /v1/admin/templates/{slug}
 */
export async function deleteTemplate(slug: string): Promise<void> {
  return apiClient.delete<void>(`/v1/admin/templates/${slug}`)
}

/**
 * Publish template (admin)
 * POST /v1/admin/templates/{slug}/publish
 * 
 * Guard: Requires thumbnail_url to be present, otherwise returns 422
 */
export async function publishTemplate(slug: string): Promise<TemplateAdmin> {
  return apiClient.post<TemplateAdmin>(`/v1/admin/templates/${slug}/publish`)
}

/**
 * Unpublish template (admin)
 * POST /v1/admin/templates/{slug}/unpublish
 */
export async function unpublishTemplate(slug: string): Promise<TemplateAdmin> {
  return apiClient.post<TemplateAdmin>(`/v1/admin/templates/${slug}/unpublish`)
}

// ============================================================================
// ADMIN TEMPLATE ASSETS API
// ============================================================================

/**
 * Get template assets (admin)
 * GET /v1/admin/templates/{slug}/assets
 */
export async function getTemplateAssets(slug: string): Promise<TemplateAssetsList> {
  return apiClient.get<TemplateAssetsList>(`/v1/admin/templates/${slug}/assets`)
}

/**
 * Upload template asset (admin)
 * POST /v1/admin/templates/{slug}/assets
 * 
 * Multipart/form-data upload
 */
export async function uploadTemplateAsset(
  slug: string,
  request: UploadAssetRequest
): Promise<TemplateAsset> {
  const formData = new FormData()
  formData.append('kind', request.kind)
  formData.append('file', request.file)

  const axios = apiClient.getAxiosInstance()
  const response = await axios.post<TemplateAsset>(
    `/v1/admin/templates/${slug}/assets`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
}

/**
 * Update template asset (admin)
 * PUT /v1/admin/templates/{slug}/assets/{id}
 * 
 * Use to promote preview to thumbnail or change sort_order
 */
export async function updateTemplateAsset(
  slug: string,
  assetId: string,
  data: UpdateAssetRequest
): Promise<TemplateAsset> {
  return apiClient.put<TemplateAsset>(`/v1/admin/templates/${slug}/assets/${assetId}`, data)
}

/**
 * Delete template asset (admin)
 * DELETE /v1/admin/templates/{slug}/assets/{id}
 */
export async function deleteTemplateAsset(slug: string, assetId: string): Promise<void> {
  return apiClient.delete<void>(`/v1/admin/templates/${slug}/assets/${assetId}`)
}

