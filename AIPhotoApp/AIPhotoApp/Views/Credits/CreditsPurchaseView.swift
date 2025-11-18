//
//  CreditsPurchaseView.swift
//  AIPhotoApp
//
//  Credits purchase screen with IAP products
//

import SwiftUI
import StoreKit

struct CreditsPurchaseView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AuthViewModel.self) private var authViewModel
    
    @State private var creditsViewModel = CreditsViewModel()
    @State private var selectedProductId: String?
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 28) {
                        // Hero Credits Display
                        heroCreditsCard
                        
                        // Products Section
                        productsSection
                        
                        // Info Section
                        infoSection
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle(L10n.tr("l10n.credits.buyTitle"))
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(L10n.tr("l10n.common.close")) {
                        dismiss()
                    }
                    .foregroundStyle(GlassTokens.textPrimary)
                }
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        Task {
                            await refreshData()
                        }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                            .foregroundStyle(GlassTokens.textPrimary)
                    }
                    .disabled(creditsViewModel.isLoading || creditsViewModel.isPurchasing)
                }
            }
            .task {
                // Load initial data when view appears
                await creditsViewModel.refreshCreditsBalance()
                await creditsViewModel.loadProducts()
            }
            .alert(L10n.tr("l10n.common.error"), isPresented: .constant(creditsViewModel.errorMessage != nil)) {
                Button(L10n.tr("l10n.common.ok")) {
                    creditsViewModel.errorMessage = nil
                }
            } message: {
                if let error = creditsViewModel.errorMessage {
                    Text(error)
                }
            }
            .alert(L10n.tr("l10n.common.success"), isPresented: .constant(creditsViewModel.successMessage != nil)) {
                Button(L10n.tr("l10n.common.ok")) {
                    creditsViewModel.successMessage = nil
                }
            } message: {
                if let message = creditsViewModel.successMessage {
                    Text(message)
                }
            }
        }
    }
    
    // MARK: - Hero Credits Card
    
    private var heroCreditsCard: some View {
        HStack(spacing: 16) {
            // Compact icon with gradient
            ZStack {
                // Subtle glow
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [
                                GlassTokens.accent1.opacity(0.3),
                                GlassTokens.accent2.opacity(0.2)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 56, height: 56)
                    .blur(radius: 16)
                
                // Main icon
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [
                                GlassTokens.accent1,
                                GlassTokens.primary1.opacity(0.9)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 52, height: 52)
                    .overlay(
                        Circle()
                            .stroke(
                                GlassTokens.borderColor.opacity(0.2),
                                lineWidth: 1
                            )
                    )
                
                Image(systemName: "sparkles")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(GlassTokens.textPrimary.opacity(0.9))
            }
            .shadow(color: GlassTokens.accent1.opacity(0.2), radius: 8, x: 0, y: 4)
            
            // Credits info - Modern horizontal layout
            VStack(alignment: .leading, spacing: 6) {
                Text(L10n.tr("l10n.credits.balance"))
                    .font(.caption.weight(.medium))
                    .foregroundStyle(GlassTokens.textSecondary.opacity(0.8))
                
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text("\(creditsViewModel.creditsBalance)")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundStyle(GlassTokens.textPrimary)
                        .contentTransition(.numericText())
                        .animation(.spring(response: 0.3, dampingFraction: 0.8), value: creditsViewModel.creditsBalance)
                    
                    // Status indicator
                    HStack(spacing: 4) {
                        Circle()
                            .fill(GlassTokens.accent1.opacity(0.8))
                            .frame(width: 6, height: 6)
                        Text(L10n.tr("l10n.credits.active"))
                            .font(.caption2.weight(.medium))
                            .foregroundStyle(GlassTokens.textSecondary.opacity(0.7))
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        .ultraThinMaterial.opacity(0.6),
                        in: Capsule()
                    )
                }
            }
            
            Spacer()
            
            // Action indicator
            VStack(spacing: 4) {
                Image(systemName: "arrow.right.circle.fill")
                    .font(.title3)
                    .foregroundStyle(
                        LinearGradient(
                            colors: [
                                GlassTokens.accent1.opacity(0.8),
                                GlassTokens.accent2.opacity(0.7)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 18)
        .glassCard()
    }
    
    // MARK: - Products Section
    
    private var productsSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Section Header - Harmonized styling
            HStack {
                VStack(alignment: .leading, spacing: 6) {
                    Text(L10n.tr("l10n.credits.choosePackage"))
                        .font(.title2.weight(.bold))
                        .foregroundStyle(GlassTokens.textPrimary)
                    
                    Text(L10n.tr("l10n.credits.plan.subtitle"))
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(GlassTokens.textSecondary.opacity(0.85))
                }
                
                Spacer()
            }
            .padding(.horizontal, 4)
            
            // Products List
            if creditsViewModel.isLoading && creditsViewModel.products.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 60)
            } else if creditsViewModel.products.isEmpty {
                emptyStateView
            } else {
                VStack(spacing: 16) {
                    ForEach(Array(creditsViewModel.products.enumerated()), id: \.element.id) { index, product in
                        ProductCard(
                            product: product,
                            creditsCount: creditsViewModel.getCreditsForProduct(product.id),
                            isPurchasing: creditsViewModel.isPurchasing && selectedProductId == product.id,
                            isSelected: selectedProductId == product.id,
                            index: index,
                            isLast: index == creditsViewModel.products.count - 1,
                            onPurchase: {
                                selectedProductId = product.id
                                Task {
                                    await creditsViewModel.purchaseProduct(product)
                                    await creditsViewModel.refreshCreditsBalance()
                                    selectedProductId = nil
                                }
                            }
                        )
                    }
                }
            }
        }
    }
    
    // MARK: - Empty State
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.circle")
                .font(.system(size: 48))
                .foregroundStyle(GlassTokens.textSecondary.opacity(0.6))
            
            Text(L10n.tr("l10n.credits.noProducts"))
                .font(.headline)
                .foregroundStyle(GlassTokens.textPrimary)
            
            Text(L10n.tr("l10n.credits.checkConnection"))
                .font(.subheadline)
                .foregroundStyle(GlassTokens.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
        .padding(.horizontal, 20)
    }
    
    // MARK: - Info Section
    
    private var infoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    GlassTokens.accent1.opacity(0.3),
                                    GlassTokens.accent2.opacity(0.2)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 28, height: 28)
                    
                    Image(systemName: "info.circle.fill")
                        .font(.caption)
                        .foregroundStyle(
                            LinearGradient(
                                colors: [
                                    GlassTokens.accent1.opacity(0.9),
                                    GlassTokens.accent2.opacity(0.8)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                }
                
                Text(L10n.tr("l10n.common.info"))
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(GlassTokens.textPrimary)
            }
            
            VStack(alignment: .leading, spacing: 10) {
                InfoRow(icon: "checkmark.circle.fill", text: L10n.tr("l10n.credits.info.2"))
                InfoRow(icon: "checkmark.circle.fill", text: L10n.tr("l10n.credits.info.3"))
                InfoRow(icon: "checkmark.circle.fill", text: L10n.tr("l10n.credits.info.1"))
            }
            .padding(.top, 2)
        }
        .padding(20)
        .glassCard()
    }
    
    // MARK: - Helpers
    
    private func refreshData() async {
        await creditsViewModel.refreshCreditsBalance()
        await creditsViewModel.loadProducts()
    }
}

// MARK: - Product Card

struct ProductCard: View {
    let product: Product
    let creditsCount: Int?
    let isPurchasing: Bool
    let isSelected: Bool
    let index: Int
    let isLast: Bool
    let onPurchase: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: onPurchase) {
            HStack(spacing: 16) {
                // Badge/Icon - Harmonized with design system
                ZStack {
                    // Glow effect
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: gradientColors.map { $0.opacity(0.4) },
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 72, height: 72)
                        .blur(radius: 12)
                    
                    // Main icon container
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: gradientColors,
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 64, height: 64)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(
                                    GlassTokens.borderColor.opacity(0.2),
                                    lineWidth: 1
                                )
                        )
                    
                    if isPurchasing {
                        ProgressView()
                            .tint(GlassTokens.textPrimary.opacity(0.9))
                            .scaleEffect(0.85)
                    } else {
                        Image(systemName: iconForProduct)
                            .font(.title3.weight(.semibold))
                            .foregroundStyle(GlassTokens.textPrimary.opacity(0.9))
                    }
                }
                .shadow(
                    color: gradientColors[0].opacity(0.35),
                    radius: 10,
                    x: 0,
                    y: 5
                )
                
                // Product Info
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 8) {
                        Text(product.displayName)
                            .font(.headline.weight(.bold))
                            .foregroundStyle(GlassTokens.textPrimary)
                        
                        if let credits = creditsCount, credits > 0 {
                            // Best Value Badge - show on last product (usually bestvalue)
                            if isLast {
                                Text(L10n.tr("l10n.credits.bestValue"))
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundStyle(GlassTokens.textPrimary.opacity(0.9))
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(
                                        LinearGradient(
                                            colors: [
                                                gradientColors[0].opacity(0.2),
                                                gradientColors[1].opacity(0.15)
                                            ],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        ),
                                        in: Capsule()
                                    )
                                    .overlay(
                                        Capsule()
                                            .stroke(
                                                gradientColors[0].opacity(0.3),
                                                lineWidth: 0.8
                                            )
                                    )
                            }
                        }
                    }
                    
                    if let credits = creditsCount, credits > 0 {
                        Text(L10n.tr("l10n.credits.xCredits", credits))
                            .font(.subheadline)
                            .foregroundStyle(GlassTokens.textSecondary)
                    }
                    
                    if !product.description.isEmpty {
                        Text(product.description)
                            .font(.caption)
                            .foregroundStyle(GlassTokens.textSecondary.opacity(0.8))
                            .lineLimit(2)
                    }
                }
                
                Spacer()
                
                // Price
                VStack(alignment: .trailing, spacing: 4) {
                    Text(product.displayPrice)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(GlassTokens.textPrimary)
                    
                    if let credits = creditsCount, credits > 0 {
                        let pricePerCredit = calculatePricePerCredit(price: product.displayPrice, credits: credits)
                        if let pricePerCredit = pricePerCredit {
                            Text(L10n.tr("l10n.credits.perCredit", pricePerCredit))
                                .font(.caption2)
                                .foregroundStyle(GlassTokens.textSecondary)
                        }
                    }
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: GlassTokens.cardCornerRadius, style: .continuous)
                    .fill(.ultraThinMaterial.opacity(isSelected ? 0.92 : 0.88))
            )
            .overlay(
                RoundedRectangle(cornerRadius: GlassTokens.cardCornerRadius, style: .continuous)
                    .stroke(
                        isSelected
                            ? LinearGradient(
                                colors: [
                                    gradientColors[0].opacity(0.6),
                                    gradientColors[1].opacity(0.4)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                            : LinearGradient(
                                colors: [
                                    GlassTokens.borderColor.opacity(0.25),
                                    GlassTokens.borderColor.opacity(0.2)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                        lineWidth: isSelected ? 2 : 0.8
                    )
            )
            .shadow(
                color: isSelected
                    ? gradientColors[0].opacity(0.25)
                    : GlassTokens.shadowColor.opacity(0.8),
                radius: isSelected ? 14 : GlassTokens.shadowRadius,
                x: 0,
                y: isSelected ? 7 : GlassTokens.shadowY
            )
            .scaleEffect(isPressed ? 0.98 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isPressed)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
        }
        .disabled(isPurchasing)
        .buttonStyle(.plain)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
    
    private var gradientColors: [Color] {
        // Harmonized gradients using only GlassTokens colors
        switch index % 3 {
        case 0:
            // Starter package: Soft champagne to warm linen
            return [
                GlassTokens.accent1,
                GlassTokens.accent1.opacity(0.85),
                GlassTokens.primary1.opacity(0.9)
            ]
        case 1:
            // Popular package: Warm linen to dusty rose
            return [
                GlassTokens.primary1,
                GlassTokens.primary2.opacity(0.9),
                GlassTokens.accent2.opacity(0.85)
            ]
        default:
            // Best value package: Champagne to dusty rose (premium feel)
            return [
                GlassTokens.accent1,
                GlassTokens.accent2,
                GlassTokens.primary1.opacity(0.8)
            ]
        }
    }
    
    private var iconForProduct: String {
        switch index % 3 {
        case 0:
            return "star.fill"
        case 1:
            return "sparkles"
        default:
            return "crown.fill"
        }
    }
    
    private func calculatePricePerCredit(price: String, credits: Int) -> String? {
        // Extract number from price string (e.g., "$0.99" -> 0.99)
        let cleanedPrice = price.replacingOccurrences(of: "$", with: "").replacingOccurrences(of: ",", with: "")
        guard let priceValue = Double(cleanedPrice) else { return nil }
        let pricePerCredit = priceValue / Double(credits)
        
        if pricePerCredit < 0.01 {
            return String(format: "¢%.0f", pricePerCredit * 100)
        } else {
            return String(format: "$%.2f", pricePerCredit)
        }
    }
}

// MARK: - Info Row

struct InfoRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.caption2)
                .foregroundStyle(
                    LinearGradient(
                        colors: [
                            GlassTokens.accent1.opacity(0.9),
                            GlassTokens.primary1.opacity(0.8)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 18, height: 18)
            
            Text(text)
                .font(.caption.weight(.medium))
                .foregroundStyle(GlassTokens.textSecondary.opacity(0.9))
            
            Spacer()
        }
    }
}

// MARK: - Preview

#Preview {
    let authViewModel = AuthViewModel(
        authService: AuthService(),
        userRepository: UserRepository()
    )
    return CreditsPurchaseView()
        .environment(authViewModel)
}
