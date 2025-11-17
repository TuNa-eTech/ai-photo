export interface ProcessImageMetadata {
  template_id: string;
  template_name: string;
  model_used: string;
  generation_time_ms: number;
  original_dimensions?: {
    width: number;
    height: number;
  };
  processed_dimensions: {
    width: number;
    height: number;
  };
}

export interface ProcessImageResponse {
  processed_image_base64: string;
  metadata: ProcessImageMetadata;
}
