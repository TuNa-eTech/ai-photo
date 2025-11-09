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
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        // Current Credits Display
                        currentCreditsCard
                        
                        // Products List
                        productsSection
                        
                        // Transaction History (optional, can be added later)
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
                    .padding(.bottom, 40)
                }
                .refreshable {
                    await refreshData()
                }
            }
            .navigationTitle("Buy Credits")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") {
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
                await creditsViewModel.refreshCreditsBalance()
                await creditsViewModel.loadProducts()
            }
            .alert("Error", isPresented: .constant(creditsViewModel.errorMessage != nil)) {
                Button("OK") {
                    creditsViewModel.errorMessage = nil
                }
            } message: {
                if let error = creditsViewModel.errorMessage {
                    Text(error)
                }
            }
            .alert("Success", isPresented: .constant(creditsViewModel.successMessage != nil)) {
                Button("OK") {
                    creditsViewModel.successMessage = nil
                }
            } message: {
                if let message = creditsViewModel.successMessage {
                    Text(message)
                }
            }
        }
    }
    
    // MARK: - Views
    
    private var currentCreditsCard: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "star.fill")
                    .font(.title2)
                    .foregroundStyle(
                        LinearGradient(
                            colors: [GlassTokens.accent1, GlassTokens.accent2],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Current Credits")
                        .font(.headline)
                        .foregroundStyle(GlassTokens.textSecondary)
                    
                    Text("\(creditsViewModel.creditsBalance)")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundStyle(GlassTokens.textPrimary)
                        .contentTransition(.numericText())
                        .animation(.spring(response: 0.3, dampingFraction: 0.8), value: creditsViewModel.creditsBalance)
                }
                
                Spacer()
            }
        }
        .padding(20)
        .glassCard()
    }
    
    private var productsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Available Packages")
                .font(.headline)
                .foregroundStyle(GlassTokens.textPrimary)
                .padding(.horizontal, 4)
            
            if creditsViewModel.isLoading && creditsViewModel.products.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            } else if creditsViewModel.products.isEmpty {
                Text("No products available")
                    .font(.subheadline)
                    .foregroundStyle(GlassTokens.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
            } else {
                ForEach(creditsViewModel.products, id: \.id) { product in
                    ProductCard(
                        product: product,
                        creditsCount: creditsViewModel.getCreditsForProduct(product.id),
                        isPurchasing: creditsViewModel.isPurchasing,
                        onPurchase: {
                            Task {
                                await creditsViewModel.purchaseProduct(product)
                                // Refresh balance after purchase
                                await creditsViewModel.refreshCreditsBalance()
                            }
                        }
                    )
                }
            }
        }
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
    let onPurchase: () -> Void
    
    var body: some View {
        Button(action: onPurchase) {
            HStack(spacing: 16) {
                // Icon
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    GlassTokens.accent1.opacity(0.6),
                                    GlassTokens.accent2.opacity(0.4)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 60, height: 60)
                    
                    Image(systemName: "star.fill")
                        .font(.title2)
                        .foregroundStyle(GlassTokens.textPrimary)
                }
                
                // Product Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.displayName)
                        .font(.headline)
                        .foregroundStyle(GlassTokens.textPrimary)
                    
                    if !product.description.isEmpty {
                        Text(product.description)
                            .font(.subheadline)
                            .foregroundStyle(GlassTokens.textSecondary)
                    }
                }
                
                Spacer()
                
                // Price
                VStack(alignment: .trailing, spacing: 4) {
                    Text(product.displayPrice)
                        .font(.title3.bold())
                        .foregroundStyle(GlassTokens.textPrimary)
                    
                    if let credits = creditsCount, credits > 0 {
                        Text("\(credits) credits")
                            .font(.caption)
                            .foregroundStyle(GlassTokens.textSecondary)
                    }
                }
                
                // Purchase indicator
                if isPurchasing {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "chevron.right")
                        .font(.subheadline.bold())
                        .foregroundStyle(GlassTokens.textSecondary)
                }
            }
            .padding(16)
            .glassCard()
        }
        .disabled(isPurchasing)
        .buttonStyle(.plain)
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

