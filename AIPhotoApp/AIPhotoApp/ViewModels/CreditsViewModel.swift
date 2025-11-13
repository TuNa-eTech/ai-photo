//
//  CreditsViewModel.swift
//  AIPhotoApp
//
//  ViewModel for credits and IAP management
//

import Foundation
import Observation
import StoreKit
#if canImport(UIKit)
import UIKit
#endif

@Observable
final class CreditsViewModel {
    // Dependencies
    private let creditsRepository: CreditsRepositoryProtocol
    private let iapService: InAppPurchaseService
    private let authService: AuthService
    private let rewardedAdsService: RewardedAdsServiceProtocol
    
    // UI State
    var creditsBalance: Int = 0
    var isLoading: Bool = false
    var isPurchasing: Bool = false
    var isWatchingAd: Bool = false
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
    
    @MainActor
    init(
        creditsRepository: CreditsRepositoryProtocol? = nil,
        iapService: InAppPurchaseService? = nil,
        authService: AuthService? = nil,
        rewardedAdsService: RewardedAdsServiceProtocol? = nil
    ) {
        // Initialize dependencies in body to avoid main actor isolation issue with default parameters
        // Default parameters are evaluated in nonisolated context, but init body runs on @MainActor
        self.creditsRepository = creditsRepository ?? CreditsRepository()
        self.iapService = iapService ?? InAppPurchaseService()
        self.authService = authService ?? AuthService()
        self.rewardedAdsService = rewardedAdsService ?? RewardedAdsService()
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
            errorMessage = String(format: NSLocalizedString("l10n.credits.loadFailed", comment: "Failed to load credits"), error.localizedDescription)
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
            
            errorMessage = String(format: NSLocalizedString("l10n.credits.loadFailed", comment: "Failed to load credits"), error.localizedDescription)
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
            errorMessage = NSLocalizedString("l10n.purchase.productNotAvailable", comment: "Product not available")
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
            successMessage = String(format: NSLocalizedString("l10n.purchase.success", comment: "Purchase success"), response.credits_added)
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
                errorMessage = NSLocalizedString("l10n.purchase.pending", comment: "Purchase pending")
                
            case .verificationFailed(let underlyingError):
                errorMessage = NSLocalizedString("l10n.purchase.verificationFailed", comment: "Verification failed")
                print("❌ Verification failed: \(underlyingError.localizedDescription)")
                
            case .purchaseFailed(let underlyingError):
                errorMessage = String(format: NSLocalizedString("l10n.purchase.failedWithError", comment: "Purchase failed with error"), underlyingError.localizedDescription)
                print("❌ Purchase failed: \(underlyingError.localizedDescription)")
                
            case .unknown:
                errorMessage = NSLocalizedString("l10n.purchase.unknown", comment: "Unknown purchase error")
                print("❌ Unknown purchase error")
            }
        } catch {
            errorMessage = String(format: NSLocalizedString("l10n.purchase.failedGeneric", comment: "Purchase failed"), error.localizedDescription)
            isPurchasing = false
            print("❌ Purchase failed: \(error.localizedDescription)")
        }
    }
    
    /// Watch rewarded ad and add credit if user completes
    /// Flow: showRewardedAd will handle loading if needed
    @MainActor
    func watchRewardedAd(presenting viewController: UIViewController) async {
        isWatchingAd = true
        errorMessage = nil
        successMessage = nil
        
        do {
            // Show ad (it will load if not already loaded)
            let didEarnReward = try await rewardedAdsService.showRewardedAd(presenting: viewController)
            
            // 3. If user earned reward, add credit to account
            if didEarnReward {
                let token = try await authService.fetchFirebaseIDToken(forceRefresh: false)
                let response = try await creditsRepository.addRewardCredit(
                    bearerIDToken: token,
                    tokenProvider: { try await self.authService.fetchFirebaseIDToken(forceRefresh: true) }
                )
                
                // 4. Update credits balance
                creditsBalance = response.new_balance
                successMessage = NSLocalizedString("l10n.ads.rewardReceived", comment: "Received reward credit")
                isWatchingAd = false
                
                // Haptic feedback on success
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.success)
                
                // Post notification for balance update
                NotificationCenter.default.post(
                    name: .creditsBalanceUpdated,
                    object: nil,
                    userInfo: ["newBalance": response.new_balance]
                )
            } else {
                // User closed ad before completing
                isWatchingAd = false
                errorMessage = NSLocalizedString("l10n.ads.mustComplete", comment: "Must complete ad to earn credit")
            }
        } catch let error as RewardedAdsError {
            isWatchingAd = false
            
            switch error {
            case .adNotLoaded:
                errorMessage = NSLocalizedString("l10n.ads.notReady", comment: "Ad not ready")
            case .presentationFailed(let underlyingError):
                errorMessage = String(format: NSLocalizedString("l10n.ads.cannotPresentWithError", comment: "Cannot present ad with error"), underlyingError.localizedDescription)
            case .userCancelled:
                // User cancelled - don't show error
                break
            }
        } catch {
            isWatchingAd = false
            errorMessage = String(format: NSLocalizedString("l10n.ads.watchError", comment: "Error watching ad"), error.localizedDescription)
            print("❌ Failed to watch rewarded ad: \(error.localizedDescription)")
        }
    }
}

