import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export type SortKey = 'newest' | 'popular' | 'name';

export class QueryTemplatesDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 20;
  })
  limit: number = 20;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  })
  offset: number = 0;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value : undefined))
  tags?: string;

  @IsIn(['newest', 'popular', 'name'])
  @Transform(({ value }) => {
    const v = String(value || '').toLowerCase();
    return v === 'popular' || v === 'name' ? v : 'newest';
  })
  sort: SortKey = 'newest';
}
