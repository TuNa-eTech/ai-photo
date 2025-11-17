import {
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ImageQuality {
  STANDARD = 'standard',
  HIGH = 'high',
}

class ProcessImageOptions {
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

export class ProcessImageDto {
  @IsString()
  template_id: string;

  @IsString()
  image_base64: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ProcessImageOptions)
  @IsOptional()
  options?: ProcessImageOptions;
}
