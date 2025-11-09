import { TransactionDto } from './transaction.dto';
export declare class TransactionHistoryResponseDto {
    transactions: TransactionDto[];
    meta: {
        total: number;
        limit: number;
        offset: number;
    };
}
