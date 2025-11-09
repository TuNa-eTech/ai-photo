import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';
import {
  CreditsBalanceResponseDto,
  TransactionHistoryResponseDto,
  TransactionDto,
} from './dto';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get credits balance for a user
   */
  async getCreditsBalance(firebaseUid: string): Promise<CreditsBalanceResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { credits: true },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'user_not_found',
        message: 'User not found',
      });
    }

    return {
      credits: user.credits,
    };
  }

  /**
   * Check if user has enough credits
   */
  async checkCreditsAvailability(firebaseUid: string, amount: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { credits: true },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'user_not_found',
        message: 'User not found',
      });
    }

    return user.credits >= amount;
  }

  /**
   * Deduct credits from user account
   */
  async deductCredits(
    firebaseUid: string,
    amount: number,
    productId?: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'user_not_found',
        message: 'User not found',
      });
    }

    if (user.credits < amount) {
      throw new ForbiddenException({
        code: 'insufficient_credits',
        message: 'Insufficient credits',
      });
    }

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Update user credits
      await tx.user.update({
        where: { firebaseUid },
        data: {
          credits: {
            decrement: amount,
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: TransactionType.usage,
          amount: -amount, // Negative for usage
          productId: productId || null,
          status: TransactionStatus.completed,
        },
      });
    });

    this.logger.log(`Deducted ${amount} credits from user ${firebaseUid}. New balance: ${user.credits - amount}`);
  }

  /**
   * Add credits to user account
   */
  async addCredits(
    firebaseUid: string,
    amount: number,
    productId?: string,
    transactionId?: string,
    appleTransactionId?: string,
    appleOriginalTransactionId?: string,
    transactionData?: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'user_not_found',
        message: 'User not found',
      });
    }

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Update user credits
      const updatedUser = await tx.user.update({
        where: { firebaseUid },
        data: {
          credits: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: TransactionType.purchase,
          amount: amount, // Positive for purchase
          productId: productId || null,
          appleTransactionId: appleTransactionId || null,
          appleOriginalTransactionId: appleOriginalTransactionId || null,
          transactionData: transactionData || null,
          status: TransactionStatus.completed,
        },
      });

      this.logger.log(`Added ${amount} credits to user ${firebaseUid}. New balance: ${updatedUser.credits}`);
    });
  }

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(
    firebaseUid: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<TransactionHistoryResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'user_not_found',
        message: 'User not found',
      });
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          amount: true,
          productId: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.transaction.count({
        where: { userId: user.id },
      }),
    ]);

    const transactionDtos: TransactionDto[] = transactions.map((t) => ({
      id: t.id,
      type: t.type as 'purchase' | 'usage' | 'bonus',
      amount: t.amount,
      product_id: t.productId || undefined,
      status: t.status as 'pending' | 'completed' | 'failed' | 'refunded',
      created_at: t.createdAt,
    }));

    return {
      transactions: transactionDtos,
      meta: {
        total,
        limit,
        offset,
      },
    };
  }
}

