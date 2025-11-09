/**
 * Credits and IAP API Functions
 * 
 * Endpoints for credits balance, transactions, and IAP products
 */

import { apiClient } from './client'

// ============================================================================
// TYPES
// ============================================================================

export interface CreditsBalance {
  credits: number
}

export interface IAPProduct {
  id: string
  product_id: string
  name: string
  description?: string
  credits: number
  price?: number
  currency?: string
  display_order: number
}

export interface IAPProductsList {
  products: IAPProduct[]
}

export interface Transaction {
  id: string
  type: 'purchase' | 'usage' | 'bonus'
  amount: number
  product_id?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
}

export interface TransactionHistory {
  transactions: Transaction[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

export interface TransactionHistoryParams {
  limit?: number
  offset?: number
}

// ============================================================================
// CREDITS API
// ============================================================================

/**
 * Get credits balance
 * GET /v1/credits/balance
 */
export async function getCreditsBalance(): Promise<CreditsBalance> {
  return apiClient.get<CreditsBalance>('/v1/credits/balance')
}

/**
 * Get transaction history
 * GET /v1/credits/transactions
 */
export async function getTransactionHistory(
  params?: TransactionHistoryParams
): Promise<TransactionHistory> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.offset) queryParams.append('offset', String(params.offset))
  
  const queryString = queryParams.toString()
  return apiClient.get<TransactionHistory>(`/v1/credits/transactions${queryString ? `?${queryString}` : ''}`)
}

// ============================================================================
// IAP PRODUCTS API
// ============================================================================

/**
 * Get IAP products list (public, no auth required)
 * GET /v1/iap/products
 */
export async function getIAPProducts(): Promise<IAPProductsList> {
  return apiClient.get<IAPProductsList>('/v1/iap/products')
}

