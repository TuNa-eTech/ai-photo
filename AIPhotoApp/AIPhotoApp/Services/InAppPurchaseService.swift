//
//  InAppPurchaseService.swift
//  AIPhotoApp
//
//  In-App Purchase service using StoreKit 2
//

import Foundation
import StoreKit

@Observable
final class InAppPurchaseService {
    var products: [Product] = []
    var isLoading = false
    var errorMessage: String?
    
    private let productIds: [String] = [
        "com.aiimagestylist.credits.starter",
        "com.aiimagestylist.credits.popular",
        "com.aiimagestylist.credits.bestvalue"
    ]
    
    init() {
        Task {
            await loadProducts()
        }
    }
    
    /// Load products from App Store
    @MainActor
    func loadProducts() async {
        isLoading = true
        errorMessage = nil
        
        do {
            // Load products from StoreKit
            let storeProducts = try await Product.products(for: productIds)
            
            // Filter only consumable products and sort by display order
            products = storeProducts
                .filter { $0.type == .consumable }
                .sorted { product1, product2 in
                    // Sort by product ID order (starter, popular, bestvalue)
                    let order1 = productIds.firstIndex(of: product1.id) ?? Int.max
                    let order2 = productIds.firstIndex(of: product2.id) ?? Int.max
                    return order1 < order2
                }
            
            isLoading = false
        } catch {
            errorMessage = "Failed to load products: \(error.localizedDescription)"
            isLoading = false
            print("❌ Failed to load products: \(error)")
        }
    }
    
    /// Purchase a product and return transaction data (JSON format)
    /// For iOS 26+, we serialize transaction info to JSON since jwsRepresentation is not available
    @MainActor
    func purchase(_ product: Product) async throws -> String {
        do {
            // Initiate purchase
            let result = try await product.purchase()
            
            switch result {
            case .success(let verification):
                // Verify transaction
                switch verification {
                case .verified(let transaction):
                    // Get transaction data from StoreKit 2
                    // StoreKit 2 Transaction doesn't have jwsRepresentation in iOS 26+
                    // We'll create a JSON payload with transaction details
                    // Server will verify using transaction ID with Apple API
                    let transactionInfo: [String: Any] = [
                        "transaction_id": String(transaction.id),
                        "original_transaction_id": String(transaction.originalID),
                        "product_id": transaction.productID,
                        "purchase_date": transaction.purchaseDate.timeIntervalSince1970,
                        "environment": transaction.environment.rawValue
                    ]
                    
                    // Serialize to JSON string
                    guard let jsonData = try? JSONSerialization.data(withJSONObject: transactionInfo),
                          let jsonString = String(data: jsonData, encoding: .utf8) else {
                        throw InAppPurchaseError.purchaseFailed(NSError(domain: "InAppPurchase", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to serialize transaction data"]))
                    }
                    
                    // Finish the transaction
                    await transaction.finish()
                    
                    return jsonString
                    
                case .unverified(_, let error):
                    throw InAppPurchaseError.verificationFailed(error)
                }
                
            case .userCancelled:
                throw InAppPurchaseError.userCancelled
                
            case .pending:
                throw InAppPurchaseError.pending
                
            @unknown default:
                throw InAppPurchaseError.unknown
            }
        } catch {
            if let iapError = error as? InAppPurchaseError {
                throw iapError
            }
            throw InAppPurchaseError.purchaseFailed(error)
        }
    }
    
    /// Get product by product ID
    func getProduct(by productId: String) -> Product? {
        return products.first { $0.id == productId }
    }
}

// MARK: - Errors

enum InAppPurchaseError: LocalizedError {
    case userCancelled
    case pending
    case verificationFailed(Error)
    case purchaseFailed(Error)
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .userCancelled:
            return "Purchase was cancelled"
        case .pending:
            return "Purchase is pending"
        case .verificationFailed(let error):
            return "Transaction verification failed: \(error.localizedDescription)"
        case .purchaseFailed(let error):
            return "Purchase failed: \(error.localizedDescription)"
        case .unknown:
            return "Unknown error occurred"
        }
    }
}

