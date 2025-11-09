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
    
    // Server products (for credits mapping)
    private var serverProducts: [IAPProduct] = []
    
    // StoreKit products (from InAppPurchaseService)
    var products: [Product] {
        iapService.products
    }
    
    /// Get credits count for a product ID from server metadata
    func getCreditsForProduct(_ productId: String) -> Int? {
        return serverProducts.first { $0.product_id == productId }?.credits
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
            
            creditsBalance = balance
            isLoading = false
        } catch {
            errorMessage = "Failed to load credits: \(error.localizedDescription)"
            isLoading = false
            print("❌ Failed to refresh credits balance: \(error)")
        }
    }
    
    /// Load IAP products from StoreKit and server
    @MainActor
    func loadProducts() async {
        // Load from both sources in parallel
        async let storeKitProducts = iapService.loadProducts()
        async let serverProductsTask = loadIAPProductsFromServer()
        
        await storeKitProducts
        await serverProductsTask
    }
    
    /// Purchase a product
    @MainActor
    func purchaseProduct(_ product: Product) async {
        isPurchasing = true
        errorMessage = nil
        successMessage = nil
        
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
            errorMessage = error.errorDescription
            isPurchasing = false
            print("❌ Purchase failed: \(error)")
        } catch {
            errorMessage = "Purchase failed: \(error.localizedDescription)"
            isPurchasing = false
            print("❌ Purchase failed: \(error)")
        }
    }
    
    /// Get IAP products from server (for credits mapping)
    @MainActor
    func loadIAPProductsFromServer() async {
        do {
            serverProducts = try await creditsRepository.getIAPProducts()
            print("📦 Loaded \(serverProducts.count) IAP products from server")
        } catch {
            print("⚠️ Failed to load IAP products from server: \(error)")
            // Non-fatal error, StoreKit products are primary
            serverProducts = []
        }
    }
}

