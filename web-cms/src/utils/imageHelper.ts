/**
 * Image Helper Utilities
 * 
 * Functions for image conversion and validation
 */

/**
 * Convert File to base64 data URI
 * Returns data URI format: "data:image/jpeg;base64,..."
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result) // Already in data URI format
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateImageFile(file: File, maxSize?: number): ValidationResult {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)' }
  }

  // Check for specific image types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are supported' }
  }

  // Check file size (use provided maxSize or default 10MB)
  const maxFileSize = maxSize || 10 * 1024 * 1024
  if (file.size > maxFileSize) {
    const maxSizeMB = maxFileSize / 1024 / 1024
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)` }
  }

  return { valid: true }
}

/**
 * Validate image URL
 */
export function validateImageUrl(url: string): ValidationResult {
  // Basic URL validation
  if (!url.match(/^https?:\/\/.+/)) {
    return { valid: false, error: 'Please enter a valid URL starting with http:// or https://' }
  }
  
  // Check if it's an image URL
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const lowerUrl = url.toLowerCase()
  
  if (!imageExtensions.some(ext => lowerUrl.includes(ext))) {
    // If no image extension, assume it might be valid (could be a dynamic URL)
    return { valid: true }
  }
  
  return { valid: true }
}

/**
 * Get file size in human-readable format
 */
export function getFileSizeString(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }
}

/**
 * Compress image if needed (future enhancement)
 * For now, just validate and convert to base64
 */
export async function prepareImageForUpload(file: File): Promise<string> {
  const validation = validateImageFile(file)
  
  if (!validation.valid) {
    throw new Error(validation.error)
  }
  
  return await fileToBase64(file)
}

