import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number;
}
