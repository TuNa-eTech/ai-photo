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

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface IAPProductAdmin extends IAPProduct {
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface IAPProductsAdminList {
  products: IAPProductAdmin[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

export interface CreateIAPProductRequest {
  product_id: string
  name: string
  description?: string
  credits: number
  price?: number
  currency?: string
  is_active?: boolean
  display_order?: number
}

export interface UpdateIAPProductRequest {
  name?: string
  description?: string
  credits?: number
  price?: number
  currency?: string
  is_active?: boolean
  display_order?: number
}

export interface IAPProductsAdminParams {
  limit?: number
  offset?: number
  search?: string
  is_active?: boolean
  sort_by?: 'displayOrder' | 'name' | 'created_at' | 'updated_at'
  sort_order?: 'asc' | 'desc'
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

// ============================================================================
// ADMIN IAP PRODUCTS API
// ============================================================================

/**
 * Get all IAP products (admin view)
 * GET /v1/admin/iap-products
 */
export async function getAdminIAPProducts(
  params?: IAPProductsAdminParams
): Promise<IAPProductsAdminList> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.offset) queryParams.append('offset', String(params.offset))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.is_active !== undefined) queryParams.append('isActive', String(params.is_active))
  if (params?.sort_by) queryParams.append('sortBy', params.sort_by)
  if (params?.sort_order) queryParams.append('sortOrder', params.sort_order)

  const queryString = queryParams.toString()
  return apiClient.get<IAPProductsAdminList>(`/v1/admin/iap-products${queryString ? `?${queryString}` : ''}`)
}

/**
 * Get IAP product by ID (admin view)
 * GET /v1/admin/iap-products/:productId
 */
export async function getAdminIAPProduct(productId: string): Promise<IAPProductAdmin> {
  return apiClient.get<IAPProductAdmin>(`/v1/admin/iap-products/${productId}`)
}

/**
 * Create new IAP product
 * POST /v1/admin/iap-products
 */
export async function createIAPProduct(
  data: CreateIAPProductRequest
): Promise<IAPProductAdmin> {
  return apiClient.post<IAPProductAdmin>('/v1/admin/iap-products', data)
}

/**
 * Update IAP product
 * PUT /v1/admin/iap-products/:productId
 */
export async function updateIAPProduct(
  productId: string,
  data: UpdateIAPProductRequest
): Promise<IAPProductAdmin> {
  return apiClient.put<IAPProductAdmin>(`/v1/admin/iap-products/${productId}`, data)
}

/**
 * Delete IAP product
 * DELETE /v1/admin/iap-products/:productId
 */
export async function deleteIAPProduct(productId: string): Promise<void> {
  return apiClient.delete<void>(`/v1/admin/iap-products/${productId}`)
}

/**
 * Activate IAP product
 * POST /v1/admin/iap-products/:productId/activate
 */
export async function activateIAPProduct(productId: string): Promise<IAPProductAdmin> {
  return apiClient.post<IAPProductAdmin>(`/v1/admin/iap-products/${productId}/activate`)
}

/**
 * Deactivate IAP product
 * DELETE /v1/admin/iap-products/:productId/activate
 */
export async function deactivateIAPProduct(productId: string): Promise<IAPProductAdmin> {
  return apiClient.delete<IAPProductAdmin>(`/v1/admin/iap-products/${productId}/activate`)
}

