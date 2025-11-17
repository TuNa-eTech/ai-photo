import { IsEnum } from 'class-validator';

/**
 * Asset Kind enum
 */
export enum AssetKind {
  THUMBNAIL = 'thumbnail',
  PREVIEW = 'preview',
  COVER = 'cover',
  SAMPLE = 'sample',
}

/**
 * DTO for uploading template assets
 * POST /v1/admin/templates/{slug}/assets
 * Content-Type: multipart/form-data
 */
export class UploadAssetDto {
  @IsEnum(AssetKind)
  kind: AssetKind;
}

/**
 * Response type for uploaded asset
 */
export interface AssetUploadResponse {
  id: string;
  template_id: string;
  kind: string;
  url: string;
  sort_order: number;
  created_at: string;
}
