import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';

export enum ImageQuality {
  STANDARD = 'standard',
  HIGH = 'high',
}

export class GenerateImageDto {
  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  negativePrompt?: string;

  @IsString()
  imageBase64: string;

  @IsInt()
  @Min(512)
  @Max(2048)
  @IsOptional()
  width?: number = 1024;

  @IsInt()
  @Min(512)
  @Max(2048)
  @IsOptional()
  height?: number = 1024;

  @IsEnum(ImageQuality)
  @IsOptional()
  quality?: ImageQuality = ImageQuality.STANDARD;
}

