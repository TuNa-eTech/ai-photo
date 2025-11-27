import {
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CreditsService } from './credits.service';
import { AdminTransactionHistoryResponseDto } from './dto';

/**
 * Admin Credits Controller
 * Endpoints for admin to view all transactions across all users
 */
@Controller('v1/admin/transactions')
@UseGuards(BearerAuthGuard, AdminGuard)
export class CreditsAdminController {
  constructor(private readonly creditsService: CreditsService) {}

  /**
   * GET /v1/admin/transactions
   * Get all transactions across all users (admin view)
   */
  @Get()
  async getAllTransactions(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('userId') userId?: string,
    @Query('type') type?: 'purchase' | 'usage' | 'bonus',
  ): Promise<AdminTransactionHistoryResponseDto> {
    return this.creditsService.getAdminTransactionHistory(
      limit,
      offset,
      userId,
      type,
    );
  }
}
