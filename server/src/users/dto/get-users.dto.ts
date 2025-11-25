import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum UserTypeFilter {
    ALL = 'all',
    ANONYMOUS = 'anonymous',
    REAL = 'real',
}

export class GetUsersDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(UserTypeFilter)
    type?: UserTypeFilter = UserTypeFilter.ALL;
}
