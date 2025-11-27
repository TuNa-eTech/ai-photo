/**
 * Admin Transaction DTO with user information
 */
export interface AdminTransactionDto {
  id: string;
  type: 'purchase' | 'usage' | 'bonus';
  amount: number;
  product_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: Date;
  // User information
  user: {
    id: string;
    name: string;
    email: string;
    is_anonymous: boolean;
  };
}

/**
 * Admin Transaction History Response DTO
 * Response for GET /v1/admin/transactions
 */
export interface AdminTransactionHistoryResponseDto {
  transactions: AdminTransactionDto[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
