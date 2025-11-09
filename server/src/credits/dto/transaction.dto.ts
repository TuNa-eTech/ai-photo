/**
 * Transaction DTO for response
 */
export class TransactionDto {
  id: string;
  type: 'purchase' | 'usage' | 'bonus';
  amount: number;
  product_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: Date;
}

