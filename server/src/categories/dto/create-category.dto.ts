import { IsString, IsOptional, IsUrl, IsInt, Min } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number;
}
