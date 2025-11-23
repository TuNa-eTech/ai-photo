import { IsArray, IsOptional, ValidateNested, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTemplateDto } from './update-template.dto';

/**
 * Bulk Update Template DTO
 * Allows updating multiple templates with the same changes
 */
export class BulkUpdateTemplateDto {
    @IsArray()
    @IsString({ each: true })
    templateIds: string[];

    @ValidateNested()
    @Type(() => BulkUpdateFieldsDto)
    updates: BulkUpdateFieldsDto;
}

/**
 * Fields that can be bulk updated
 * Subset of UpdateTemplateDto excluding slug and other unique fields
 */
export class BulkUpdateFieldsDto {
    @IsOptional()
    @IsEnum(['draft', 'published', 'archived'])
    status?: 'draft' | 'published' | 'archived';

    @IsOptional()
    @IsEnum(['public', 'private'])
    visibility?: 'public' | 'private';

    @IsOptional()
    @IsBoolean()
    isTrendingManual?: boolean;

    @IsOptional()
    @IsString()
    modelProvider?: string;

    @IsOptional()
    @IsString()
    modelName?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;
}
