import { IsString, IsOptional, IsEnum, IsArray, Matches } from 'class-validator';
import { TemplateStatus, TemplateVisibility } from '@prisma/client';

/**
 * DTO for creating a new template
 * POST /v1/admin/templates
 */
export class CreateTemplateDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @IsOptional()
  @IsString()
  modelProvider?: string;

  @IsOptional()
  @IsString()
  modelName?: string;

  @IsOptional()
  @IsEnum(TemplateStatus)
  status?: TemplateStatus;

  @IsOptional()
  @IsEnum(TemplateVisibility)
  visibility?: TemplateVisibility;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

