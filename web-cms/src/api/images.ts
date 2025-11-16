/**
 * Images API Client
 * 
 * Handles image processing operations
 */

import { apiClient } from './client'

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
  original_dimensions?: {
    width: number
    height: number
  }
  processed_dimensions: {
    width: number
    height: number
  }
}

export interface ProcessImageResponse {
  processed_image_base64: string
  metadata: ProcessImageMetadata
}

/**
 * Process an image with AI template
 */
export async function processImage(
  request: ProcessImageRequest
): Promise<ProcessImageResponse> {
  return apiClient.post<ProcessImageResponse>(
    '/v1/images/process',
    request,
    { timeout: 180000 } // 3 minutes timeout
  )
}

