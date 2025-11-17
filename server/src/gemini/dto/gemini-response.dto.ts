export interface GeminiResponse {
  processedImageBase64: string;
  metadata: {
    modelUsed: string;
    generationTimeMs: number;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

export interface ValidationResult {
  valid: boolean;
  sizeBytes?: number;
  mimeType?: string;
  error?: string;
}
