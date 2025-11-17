import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { TemplateStatus, TemplateVisibility } from '@prisma/client';

/**
 * DTO for updating an existing template
 * PUT /v1/admin/templates/{slug}
 */
export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

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

  @IsOptional()
  @IsBoolean()
  isTrendingManual?: boolean;
}
