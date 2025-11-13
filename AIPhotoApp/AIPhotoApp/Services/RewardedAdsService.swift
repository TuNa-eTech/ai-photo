//
//  RewardedAdsService.swift
//  AIPhotoApp
//
//  Service for loading and showing rewarded ads using Google Mobile Ads SDK
//

import Foundation
import UIKit
import GoogleMobileAds

// MARK: - Protocol

protocol RewardedAdsServiceProtocol {
    func loadRewardedAd() async
    func showRewardedAd(presenting viewController: UIViewController) async throws -> Bool
    var isAdLoaded: Bool { get }
}

// MARK: - Implementation

final class RewardedAdsService: NSObject, RewardedAdsServiceProtocol {
    private var rewardedAd: RewardedAd?
    private(set) var isAdLoaded: Bool = false
    
    private let adUnitID: String
    
    init(adUnitID: String = AdsConfig.rewardedAdsID) {
        self.adUnitID = adUnitID
        super.init()
        // Don't preload immediately - wait for SDK to fully initialize
        // Preload will happen when user actually needs the ad
    }
    
    /// Load rewarded ad from AdMob
    /// Based on official Google AdMob examples pattern
    @MainActor
    func loadRewardedAd() async {
        // If ad is already loaded, don't reload
        if isAdLoaded {
            return
        }
        
        // Create request (following official example pattern)
        let request = Request()
        
        #if DEBUG
        print("🔧 Loading rewarded ad. Ad Unit ID: \(adUnitID)")
        #endif
        
        // Load ad (following official example: simple, no retry logic)
        // SDK handles initialization automatically
        do {
            rewardedAd = try await RewardedAd.load(with: adUnitID, request: request)
            rewardedAd?.fullScreenContentDelegate = self
            isAdLoaded = true
            #if DEBUG
            print("✅ Rewarded ad loaded successfully")
            #endif
        } catch {
            // Log error (official examples also log errors)
            #if DEBUG
            print("❌ Failed to load rewarded ad: \(error.localizedDescription)")
            print("   Ad Unit ID: \(adUnitID)")
            #if targetEnvironment(simulator)
            print("   💡 For best results, test on a real device")
            #endif
            #endif
            
            isAdLoaded = false
            rewardedAd = nil
        }
    }
    
    /// Show rewarded ad and return true if user earned reward
    /// Flow: Load ad first, then present (following official examples)
    @MainActor
    func showRewardedAd(presenting viewController: UIViewController) async throws -> Bool {
        // Reset reward state
        didEarnReward = false
        
        // Ensure ad is loaded before presenting
        if !isAdLoaded || rewardedAd == nil {
            await loadRewardedAd()
        }
        
        // Check if ad is ready
        guard let ad = rewardedAd, isAdLoaded else {
            throw RewardedAdsError.adNotLoaded
        }
        
        // Use continuation to wait for ad completion
        return try await withCheckedThrowingContinuation { continuation in
            // Store continuation for use in delegate callbacks
            self.pendingContinuation = continuation
            self.pendingAd = ad
            
            // Present ad (following official examples pattern)
            ad.present(from: viewController) { [weak self] in
                // This closure is called when user earns reward
                // Mark reward earned so we resolve continuation with true on dismiss
                guard let self = self else { return }
                self.didEarnReward = true
                #if DEBUG
                print("✅ User earned reward from ad → will grant credit on dismiss")
                #endif
            }
        }
    }
    
    // MARK: - Private
    
    private var pendingContinuation: CheckedContinuation<Bool, Error>?
    private var pendingAd: RewardedAd?
    private var didEarnReward: Bool = false
}

// MARK: - FullScreenContentDelegate

extension RewardedAdsService: FullScreenContentDelegate {
    /// Called when user earned reward
    @MainActor
    func rewardedAd(_ rewardedAd: RewardedAd, userDidEarn reward: AdReward) {
        // Some SDK versions may still call this; keep as backup
        print("✅ Rewarded ad: User earned reward (delegate)")
        didEarnReward = true
    }
    
    /// Called when ad failed to present
    @MainActor
    func ad(_ ad: FullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        print("❌ Rewarded ad failed to present: \(error.localizedDescription)")
        isAdLoaded = false
        rewardedAd = nil
        
        // Resume continuation with error
        if let continuation = pendingContinuation {
            pendingContinuation = nil
            continuation.resume(throwing: RewardedAdsError.presentationFailed(error))
        }
    }
    
    /// Called when ad was dismissed
    @MainActor
    func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) {
        print("ℹ️ Rewarded ad dismissed")
        isAdLoaded = false
        rewardedAd = nil
        
        // Resume continuation with result
        if let continuation = pendingContinuation {
            pendingContinuation = nil
            let result = didEarnReward
            didEarnReward = false
            continuation.resume(returning: result)
        }
        
        // Reload ad for next time
        Task {
            await loadRewardedAd()
        }
    }
}

// MARK: - Errors

enum RewardedAdsError: LocalizedError {
    case adNotLoaded
    case presentationFailed(Error)
    case userCancelled
    
    var errorDescription: String? {
        switch self {
        case .adNotLoaded:
            return NSLocalizedString("l10n.ads.notReady", comment: "Ad not ready")
        case .presentationFailed(let error):
            return String(
                format: NSLocalizedString("l10n.ads.cannotPresentWithError", comment: "Cannot present ad with error"),
                error.localizedDescription
            )
        case .userCancelled:
            return NSLocalizedString("l10n.ads.userCancelled", comment: "User closed ad before completion")
        }
    }
}

