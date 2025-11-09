//
//  CreditsViewModel.swift
//  AIPhotoApp
//
//  ViewModel for credits and IAP management
//

import Foundation
import Observation
import StoreKit

@Observable
final class CreditsViewModel {
    // Dependencies
    private let creditsRepository: CreditsRepositoryProtocol
    private let iapService: InAppPurchaseService
    private let authService: AuthService
    
    // UI State
    var creditsBalance: Int = 0
    var isLoading: Bool = false
    var isPurchasing: Bool = false
    var errorMessage: String?
    var successMessage: String?
    
    // Hard-coded credits mapping (matches server seed data)
    // This mapping is synchronized with server/scripts/seed-iap-products.ts
    private let creditsMapping: [String: Int] = [
        "com.aiimagestylist.credits.starter": 10,
        "com.aiimagestylist.credits.popular": 50,
        "com.aiimagestylist.credits.bestvalue": 100
    ]
    
    // StoreKit products (from InAppPurchaseService)
    var products: [Product] {
        iapService.products
    }
    
    /// Get credits count for a product ID from hard-coded mapping
    func getCreditsForProduct(_ productId: String) -> Int? {
        return creditsMapping[productId]
    }
    
    init(
        creditsRepository: CreditsRepositoryProtocol = CreditsRepository(),
        iapService: InAppPurchaseService = InAppPurchaseService(),
        authService: AuthService = AuthService()
    ) {
        self.creditsRepository = creditsRepository
        self.iapService = iapService
        self.authService = authService
    }
    
    /// Load credits balance from server
    @MainActor
    func refreshCreditsBalance() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let token = try await authService.fetchFirebaseIDToken(forceRefresh: false)
            let balance = try await creditsRepository.getCreditsBalance(
                bearerIDToken: token,
                tokenProvider: { try await self.authService.fetchFirebaseIDToken(forceRefresh: true) }
            )
            
            // Check if task was cancelled before updating UI
            try Task.checkCancellation()
            
            creditsBalance = balance
            isLoading = false
        } catch is CancellationError {
            // Task was cancelled - log for debugging
            isLoading = false
            errorMessage = "Request was cancelled: CancellationError"
            print("⚠️ Credits balance request was cancelled: CancellationError")
            return
        } catch let error as CreditsRepository.NetworkError {
            // Handle cancelled requests - show error for debugging
            if case .cancelled = error {
                isLoading = false
                errorMessage = "Request was cancelled: NetworkError.cancelled"
                print("⚠️ Credits balance request was cancelled: NetworkError.cancelled")
                return
            }
            
            // Other network errors should be shown to user
            errorMessage = "Failed to load credits: \(error.localizedDescription)"
            isLoading = false
            print("❌ Failed to refresh credits balance: \(error.localizedDescription)")
        } catch {
            // Check if it's a cancellation error
            if error is CancellationError {
                isLoading = false
                errorMessage = "Request was cancelled: \(type(of: error))"
                print("⚠️ Credits balance request was cancelled: \(error)")
                return
            }
            
            errorMessage = "Failed to load credits: \(error.localizedDescription)"
            isLoading = false
            print("❌ Failed to refresh credits balance: \(error.localizedDescription)")
        }
    }
    
    /// Load IAP products from StoreKit only (no server call needed)
    @MainActor
    func loadProducts() async {
        // Check for cancellation before and after loading
        do {
            try Task.checkCancellation()
            await iapService.loadProducts()
            try Task.checkCancellation()
        } catch is CancellationError {
            // Task was cancelled - log for debugging
            print("⚠️ Load products request was cancelled: CancellationError")
            return
        } catch {
            // Other errors are logged but don't block the UI
            print("⚠️ Failed to load IAP products: \(error.localizedDescription)")
        }
    }
    
    /// Purchase a product
    @MainActor
    func purchaseProduct(_ product: Product) async {
        isPurchasing = true
        errorMessage = nil
        successMessage = nil
        
        // Verify product is available
        guard iapService.products.contains(where: { $0.id == product.id }) else {
            errorMessage = "Product not available. Please try again."
            isPurchasing = false
            return
        }
        
        do {
            // 1. Purchase product using StoreKit
            let transactionData = try await iapService.purchase(product)
            
            // 2. Send transaction data to server
            let token = try await authService.fetchFirebaseIDToken(forceRefresh: false)
            let response = try await creditsRepository.purchaseCredits(
                transactionData: transactionData,
                productId: product.id,
                bearerIDToken: token,
                tokenProvider: { try await self.authService.fetchFirebaseIDToken(forceRefresh: true) }
            )
            
            // 3. Update credits balance
            creditsBalance = response.new_balance
            successMessage = "Successfully purchased \(response.credits_added) credits!"
            isPurchasing = false
            
            // Haptic feedback on success
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.success)
            
            // Post notification for balance update
            NotificationCenter.default.post(
                name: .creditsBalanceUpdated,
                object: nil,
                userInfo: ["newBalance": response.new_balance]
            )
        } catch let error as InAppPurchaseError {
            isPurchasing = false
            
            // Don't show error alert for user cancellation (expected behavior)
            switch error {
            case .userCancelled:
                // User intentionally cancelled - don't show error
                break
                
            case .pending:
                // Purchase is pending approval
                errorMessage = "Your purchase is pending approval. Credits will be added once approved."
                
            case .verificationFailed(let underlyingError):
                errorMessage = "Transaction verification failed. Please contact support if this persists."
                print("❌ Verification failed: \(underlyingError.localizedDescription)")
                
            case .purchaseFailed(let underlyingError):
                errorMessage = "Purchase failed: \(underlyingError.localizedDescription)"
                print("❌ Purchase failed: \(underlyingError.localizedDescription)")
                
            case .unknown:
                errorMessage = "An unexpected error occurred. Please try again."
                print("❌ Unknown purchase error")
            }
        } catch {
            errorMessage = "Purchase failed: \(error.localizedDescription)"
            isPurchasing = false
            print("❌ Purchase failed: \(error.localizedDescription)")
        }
    }
}

