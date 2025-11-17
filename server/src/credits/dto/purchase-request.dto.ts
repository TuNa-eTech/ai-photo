import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Purchase request DTO
 * transaction_data: JSON string (iOS 26+) or JWT string (iOS 15-17) from StoreKit 2
 * - JSON format: {"transaction_id": "...", "original_transaction_id": "...", "product_id": "...", ...}
 * - JWT format: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." (from Transaction.jwsRepresentation)
 */
export class PurchaseRequestDto {
  @IsString()
  @IsNotEmpty()
  transaction_data: string;

  @IsString()
  @IsNotEmpty()
  product_id: string;
}
