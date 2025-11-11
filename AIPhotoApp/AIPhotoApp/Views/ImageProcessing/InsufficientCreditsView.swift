//
//  InsufficientCreditsView.swift
//  AIPhotoApp
//
//  Full-screen view shown when user runs out of credits.
//  Provides options: Watch rewarded ad, or purchase credits via IAP.
//

import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

struct InsufficientCreditsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AuthViewModel.self) private var authViewModel
    
    @State private var creditsViewModel = CreditsViewModel()
    @State private var showCreditsPurchase = false
    @State private var showLoadingOverlay = false
    
    var body: some View {
        ZStack {
            GlassBackgroundView()
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    headerSection
                    optionsSection
                    infoSection
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 40)
            }
            
            if showLoadingOverlay {
                loadingOverlay
            }
        }
        .navigationTitle("Không đủ Credits")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await creditsViewModel.refreshCreditsBalance()
        }
        .sheet(isPresented: $showCreditsPurchase) {
            CreditsPurchaseView()
                .environment(authViewModel)
        }
        .alert("Thông báo", isPresented: .constant(creditsViewModel.errorMessage != nil)) {
            Button("OK") {
                creditsViewModel.errorMessage = nil
            }
        } message: {
            if let error = creditsViewModel.errorMessage {
                Text(error)
            }
        }
        .alert("Thành công", isPresented: .constant(creditsViewModel.successMessage != nil)) {
            Button("OK") {
                creditsViewModel.successMessage = nil
                // Auto-pop on success
                if creditsViewModel.successMessage != nil {
                    dismiss()
                }
            }
        } message: {
            if let message = creditsViewModel.successMessage {
                Text(message)
            }
        }
        .onChange(of: creditsViewModel.successMessage) { oldValue, newValue in
            if newValue != nil {
                Task {
                    try? await Task.sleep(for: .milliseconds(500))
                    dismiss()
                }
            }
        }
    }
    
    // MARK: - Header
    private var headerSection: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 48))
                .foregroundStyle(
                    LinearGradient(
                        colors: [
                            GlassTokens.accent1,
                            GlassTokens.accent2
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            Text("Bạn không đủ credits")
                .font(.title2.bold())
                .foregroundStyle(GlassTokens.textPrimary)
            Text("Chọn một trong các cách sau để tiếp tục")
                .font(.subheadline)
                .foregroundStyle(GlassTokens.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical, 8)
    }
    
    // MARK: - Options
    private var optionsSection: some View {
        VStack(spacing: 16) {
            watchAdCard
            purchaseCreditsCard
        }
    }
    
    private var watchAdCard: some View {
        OptionCard(
            icon: "play.circle.fill",
            title: "Xem quảng cáo",
            description: "Xem quảng cáo để nhận 1 credit miễn phí",
            buttonText: "Xem ngay",
            gradientColors: [
                GlassTokens.accent1,
                GlassTokens.accent2
            ],
            isLoading: creditsViewModel.isWatchingAd,
            action: {
                guard let viewController = UIApplication.topMostViewController() else {
                    creditsViewModel.errorMessage = "Không thể hiển thị quảng cáo."
                    return
                }
                showLoadingOverlay = true
                Task {
                    await creditsViewModel.watchRewardedAd(presenting: viewController)
                    showLoadingOverlay = false
                    await creditsViewModel.refreshCreditsBalance()
                }
            }
        )
    }
    
    private var purchaseCreditsCard: some View {
        OptionCard(
            icon: "creditcard.fill",
            title: "Mua Credits",
            description: "Mua gói credits với giá ưu đãi",
            buttonText: "Mua ngay",
            gradientColors: [
                GlassTokens.primary1,
                GlassTokens.primary2
            ],
            isLoading: false,
            action: {
                showCreditsPurchase = true
            }
        )
    }
    
    // MARK: - Info
    private var infoSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
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
                Text("Thông tin")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(GlassTokens.textPrimary)
            }
            VStack(alignment: .leading, spacing: 8) {
                InsufficientCreditsInfoRow(icon: "checkmark.circle.fill", text: "1 credit = 1 lần xử lý ảnh")
                InsufficientCreditsInfoRow(icon: "checkmark.circle.fill", text: "Credits không bao giờ hết hạn")
                InsufficientCreditsInfoRow(icon: "checkmark.circle.fill", text: "Thanh toán an toàn qua App Store")
            }
        }
        .padding(20)
        .glassCard()
    }
    
    // MARK: - Loading Overlay
    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()
            VStack(spacing: 16) {
                ProgressView()
                    .progressViewStyle(.circular)
                    .scaleEffect(1.5)
                    .tint(.white)
                Text("Đang tải quảng cáo...")
                    .font(.subheadline)
                    .foregroundStyle(.white)
            }
            .padding(32)
            .background(
                .ultraThinMaterial,
                in: RoundedRectangle(cornerRadius: GlassTokens.radiusCard)
            )
        }
    }
}

// MARK: - Option Card
private struct OptionCard: View {
    let icon: String
    let title: String
    let description: String
    let buttonText: String
    let gradientColors: [Color]
    let isLoading: Bool
    let action: () -> Void
    @State private var isPressed = false

    var body: some View {
        Button(action: action) {
            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: gradientColors.map { $0.opacity(0.4) },
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 80, height: 80)
                        .blur(radius: 16)
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: gradientColors,
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 72, height: 72)
                        .overlay(
                            Circle()
                                .stroke(GlassTokens.borderColor.opacity(0.2), lineWidth: 1)
                        )
                    if isLoading {
                        ProgressView()
                            .tint(GlassTokens.textPrimary.opacity(0.9))
                            .scaleEffect(0.9)
                    } else {
                        Image(systemName: icon)
                            .font(.system(size: 32, weight: .semibold))
                            .foregroundStyle(GlassTokens.textPrimary.opacity(0.9))
                    }
                }
                .shadow(color: gradientColors[0].opacity(0.35), radius: 12, x: 0, y: 6)
                VStack(spacing: 8) {
                    Text(title)
                        .font(.headline.bold())
                        .foregroundStyle(GlassTokens.textPrimary)
                    Text(description)
                        .font(.subheadline)
                        .foregroundStyle(GlassTokens.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }
                Text(buttonText)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(
                        LinearGradient(colors: gradientColors, startPoint: .leading, endPoint: .trailing),
                        in: Capsule()
                    )
                    .overlay(
                        Capsule()
                            .stroke(GlassTokens.borderColor.opacity(0.2), lineWidth: 1)
                    )
            }
            .padding(24)
            .frame(maxWidth: .infinity)
            .background(
                .ultraThinMaterial.opacity(0.88),
                in: RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous)
                    .stroke(
                        LinearGradient(
                            colors: [GlassTokens.borderColor.opacity(0.25), GlassTokens.borderColor.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 0.8
                    )
            )
            .shadow(color: GlassTokens.shadowColor.opacity(0.8), radius: GlassTokens.shadowRadius, x: 0, y: GlassTokens.shadowY)
            .scaleEffect(isPressed ? 0.98 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isPressed)
        }
        .disabled(isLoading)
        .buttonStyle(.plain)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

// MARK: - Info Row
private struct InsufficientCreditsInfoRow: View {
    let icon: String
    let text: String
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.caption2)
                .foregroundStyle(
                    LinearGradient(
                        colors: [GlassTokens.accent1.opacity(0.9), GlassTokens.primary1.opacity(0.8)],
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


