import { PrismaService } from '../prisma/prisma.service';
import { CreditsBalanceResponseDto, TransactionHistoryResponseDto } from './dto';
export declare class CreditsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getCreditsBalance(firebaseUid: string): Promise<CreditsBalanceResponseDto>;
    checkCreditsAvailability(firebaseUid: string, amount: number): Promise<boolean>;
    deductCredits(firebaseUid: string, amount: number, productId?: string): Promise<void>;
    addCredits(firebaseUid: string, amount: number, productId?: string, transactionId?: string, appleTransactionId?: string, appleOriginalTransactionId?: string, transactionData?: string): Promise<void>;
    addRewardCredit(firebaseUid: string, source?: string): Promise<{
        credits_added: number;
        new_balance: number;
    }>;
    getTransactionHistory(firebaseUid: string, limit?: number, offset?: number): Promise<TransactionHistoryResponseDto>;
}
