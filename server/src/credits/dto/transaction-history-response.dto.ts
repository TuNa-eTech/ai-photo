import { TransactionDto } from './transaction.dto';

/**
 * Transaction history response DTO
 */
export class TransactionHistoryResponseDto {
  transactions: TransactionDto[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
