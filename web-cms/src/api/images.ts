/**
 * Images API Client
 * 
 * Handles image processing operations
 */

import { apiClient } from './client'

export interface ProcessImageRequest {
  template_id: string
  image_path: string
}

export interface ProcessImageResponse {
  processed_image_url: string
}

/**
 * Process an image with AI template
 */
export async function processImage(
  request: ProcessImageRequest
): Promise<ProcessImageResponse> {
  return apiClient.post<ProcessImageResponse>(
    '/v1/images/process',
    request
  )
}

/**
 * Upload an image file to the server
 * Returns the image path for use in processImage
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)

  const response = await apiClient.post<{ image_path: string }>(
    '/v1/images/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.image_path
}

