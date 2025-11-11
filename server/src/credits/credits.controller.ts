import { Controller, Get, Post, Body, Req, UseGuards, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { CreditsService } from './credits.service';
import {
  CreditsBalanceResponseDto,
  TransactionHistoryResponseDto,
  PurchaseRequestDto,
  PurchaseResponseDto,
  RewardRequestDto,
  RewardResponseDto,
} from './dto';
import { IAPService } from '../iap/iap.service';

@Controller('v1/credits')
@UseGuards(BearerAuthGuard)
export class CreditsController {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly iapService: IAPService,
  ) {}

  /**
   * GET /v1/credits/balance
   * Get current credits balance
   */
  @Get('balance')
  async getBalance(
    @Req() req: Request & { firebaseUid?: string },
  ): Promise<CreditsBalanceResponseDto> {
    const firebaseUid = req.firebaseUid!;
    return this.creditsService.getCreditsBalance(firebaseUid);
  }

  /**
   * GET /v1/credits/transactions
   * Get transaction history
   */
  @Get('transactions')
  async getTransactions(
    @Req() req: Request & { firebaseUid?: string },
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<TransactionHistoryResponseDto> {
    const firebaseUid = req.firebaseUid!;
    return this.creditsService.getTransactionHistory(firebaseUid, limit, offset);
  }

  /**
   * POST /v1/credits/purchase
   * Process purchase: verify JWT transaction and add credits
   */
  @Post('purchase')
  async purchase(
    @Req() req: Request & { firebaseUid?: string },
    @Body() dto: PurchaseRequestDto,
  ): Promise<PurchaseResponseDto> {
    const firebaseUid = req.firebaseUid!;
    const result = await this.iapService.processPurchase(
      firebaseUid,
      dto.transaction_data,
      dto.product_id,
    );

    return {
      transaction_id: result.transactionId,
      credits_added: result.creditsAdded,
      new_balance: result.newBalance,
    };
  }

  /**
   * POST /v1/credits/reward
   * Add reward credit from rewarded ads
   */
  @Post('reward')
  async reward(
    @Req() req: Request & { firebaseUid?: string },
    @Body() dto: RewardRequestDto,
  ): Promise<RewardResponseDto> {
    const firebaseUid = req.firebaseUid!;
    const result = await this.creditsService.addRewardCredit(
      firebaseUid,
      dto.source || 'rewarded_ad',
    );

    return {
      credits_added: result.credits_added,
      new_balance: result.new_balance,
    };
  }
}

