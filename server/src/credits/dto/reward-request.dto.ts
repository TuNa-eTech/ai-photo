import { IsOptional, IsString } from 'class-validator';

/**
 * Reward request DTO
 * For rewarded ads credit addition
 */
export class RewardRequestDto {
  @IsOptional()
  @IsString()
  source?: string; // Optional, e.g., "rewarded_ad" for tracking
}

