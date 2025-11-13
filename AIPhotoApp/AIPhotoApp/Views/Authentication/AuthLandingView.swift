//  AuthLandingView.v2.swift
//  AIPhotoApp
//
//  Redesigned Authentication Landing with Liquid Glass Beige aesthetic
//  Features: Animated background, glass card, smooth transitions, premium feel

import SwiftUI
import AuthenticationServices

struct AuthLandingView: View {
    @Environment(AuthViewModel.self) private var model
    @Environment(LocalizationModel.self) private var i18n
    
    @State private var showCard = false
    @State private var logoScale: CGFloat = 0.8
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Animated beige gradient background
                GlassBackgroundView(animated: true)
                
                // Main content
                ScrollView {
                    VStack(spacing: 0) {
                        Spacer()
                            .frame(height: 60)
                        
                        // Brand Logo with glass effect
                        BrandLogoView()
                            .scaleEffect(logoScale)
                            .opacity(showCard ? 1 : 0)
                        
                        Spacer()
                            .frame(height: 32)
                        
                        // Main glass card
                        AuthGlassCard {
                            VStack(spacing: 24) {
                                // Language switcher
                                HStack {
                                    Spacer()
                                    Menu {
                                        ForEach(AppLanguage.allCases, id: \.self) { lang in
                                            Button(action: { i18n.setLanguage(lang) }) {
                                                Text(lang.localizedDisplayName)
                                            }
                                        }
                                    } label: {
                                        HStack(spacing: 6) {
                                            Image(systemName: "globe")
                                            Text(i18n.language.localizedDisplayName)
                                                .font(.footnote.weight(.semibold))
                                        }
                                        .foregroundStyle(GlassTokens.textPrimary)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 8)
                                        .background(.ultraThinMaterial.opacity(0.9), in: Capsule())
                                        .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
                                        .shadow(color: GlassTokens.shadowColor, radius: GlassTokens.shadowRadius, x: 0, y: GlassTokens.shadowY)
                                        .accessibilityLabel(Text(L10n.tr("l10n.settings.language")))
                                        .accessibilityValue(Text(i18n.language.localizedDisplayName))
                                        .accessibilityHint(Text(L10n.tr("l10n.settings.language.hint")))
                                        .accessibilityIdentifier("language_menu")
                                    }
                                }
                                // Hero text
                                VStack(spacing: 8) {
                                    Text(L10n.tr("l10n.auth.welcome.to"))
                                        .font(.title2)
                                        .foregroundStyle(GlassTokens.textSecondary)
                                    
                                    Text("AIPhotoApp")
                                        .font(.largeTitle.bold())
                                        .foregroundStyle(GlassTokens.textPrimary)
                                    
                                    Text(L10n.tr("l10n.auth.subtitle"))
                                        .font(.body)
                                        .foregroundStyle(GlassTokens.textSecondary)
                                        .multilineTextAlignment(.center)
                                        .padding(.top, 4)
                                }
                                .padding(.bottom, 8)
                                
                                // Sign in buttons
                                VStack(spacing: 16) {
                                    // Apple Sign In
                                    SignInWithAppleButton(
                                        .signIn,
                                        onRequest: { request in
                                            model.configureAppleRequest(request)
                                        },
                                        onCompletion: { result in
                                            model.handleAppleCompletion(result)
                                        }
                                    )
                                    .signInWithAppleButtonStyle(.black)
                                    .frame(height: 56)
                                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                                            .stroke(Color.white.opacity(0.3), lineWidth: 1.5)
                                    )
                                    .shadow(
                                        color: GlassTokens.shadowColor,
                                        radius: 15,
                                        y: 8
                                    )
                                    .accessibilityLabel(Text(L10n.tr("l10n.auth.signin.apple")))
                                    .accessibilityHint(Text(L10n.tr("l10n.auth.signin.apple.hint")))
                                    .accessibilityIdentifier("signin_apple")
                                    
                                    // Google Sign In
                                    GlassSignInButton(
                                        title: L10n.tr("l10n.auth.google"),
                                        icon: "GoogleIcon",
                                        style: .google
                                    ) {
                                        model.signInWithGoogle()
                                    }
                                }
                                
                                // Terms & Privacy
                                VStack(spacing: 4) {
                                    Text(L10n.tr("l10n.auth.terms.prefix"))
                                        .font(.caption)
                                        .foregroundStyle(GlassTokens.textSecondary)
                                    
                                    HStack(spacing: 16) {
                                         Link(L10n.tr("l10n.auth.terms"), destination: URL(string: "https://bokphoto.e-tech.network/terms")!)
                                             .font(.caption.weight(.medium))
                                             .foregroundStyle(GlassTokens.textPrimary)
                                         
                                         Text("•")
                                             .foregroundStyle(GlassTokens.textSecondary)
                                         
                                         Link(L10n.tr("l10n.auth.privacy"), destination: URL(string: "https://bokphoto.e-tech.network/privacy")!)
                                             .font(.caption.weight(.medium))
                                             .foregroundStyle(GlassTokens.textPrimary)
                                     }
                                }
                                .padding(.top, 8)
                            }
                        }
                        .opacity(showCard ? 1 : 0)
                        .offset(y: showCard ? 0 : 30)
                        .padding(.horizontal, 24)
                        
                        Spacer()
                            .frame(height: 40)
                    }
                }
                
                // Loading overlay
                if model.isLoading {
                    LoadingGlassOverlay()
                }
                
                // Error banner
                if let error = model.errorMessage, !error.isEmpty {
                    VStack {
                        ErrorGlassBanner(message: error) {
                            model.errorMessage = nil
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 50)
                        
                        Spacer()
                    }
                    .transition(.move(edge: .top).combined(with: .opacity))
                }
            }
            .navigationBarHidden(true)
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.1)) {
                logoScale = 1.0
            }
            withAnimation(.spring(response: 0.8, dampingFraction: 0.8).delay(0.3)) {
                showCard = true
            }
        }
    }
}

// MARK: - Brand Logo

struct BrandLogoView: View {
    var body: some View {
        ZStack {
            // Glass circle background
            Circle()
                .fill(.ultraThinMaterial)
                .frame(width: 100, height: 100)
                .overlay(
                    Circle()
                        .stroke(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.4),
                                    Color.white.opacity(0.1)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 2
                        )
                )
                .shadow(color: GlassTokens.shadowColor, radius: 20, y: 10)
            
            // Icon with gradient
            Image(systemName: "sparkles")
                .resizable()
                .scaledToFit()
                .frame(width: 50, height: 50)
                .foregroundStyle(
                    LinearGradient(
                        colors: [
                            GlassTokens.primary1,
                            GlassTokens.accent2
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        }
        .accessibilityHidden(true) // Decorative
    }
}

// MARK: - Auth Glass Card

struct AuthGlassCard<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(32)
            .background(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        // Subtle beige tint
                        LinearGradient(
                            colors: [
                                GlassTokens.primary1.opacity(0.15),
                                GlassTokens.accent1.opacity(0.1)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.4),
                                Color.white.opacity(0.1)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1.5
                    )
            )
            .shadow(
                color: GlassTokens.textPrimary.opacity(0.12),
                radius: 30,
                y: 15
            )
    }
}

// MARK: - Glass Sign In Button

struct GlassSignInButton: View {
    let title: String
    let icon: String // Asset name or SF Symbol
    let style: ButtonStyle
    let action: () -> Void
    
    enum ButtonStyle {
        case google
        case custom
    }
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            isPressed = true
            // Haptic feedback
            #if canImport(UIKit)
            let generator = UIImpactFeedbackGenerator(style: .light)
            generator.impactOccurred()
            #endif
            action()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                isPressed = false
            }
        }) {
            HStack(spacing: 12) {
                // Google "G" icon (placeholder - replace with actual asset)
                if style == .google {
                    ZStack {
                        Circle()
                            .fill(Color.white)
                            .frame(width: 24, height: 24)
                        
                        Text("G")
                            .font(.headline.bold())
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [Color.red, Color.blue, Color.green, Color.yellow],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                    }
                }
                
                Text(title)
                    .font(.headline)
                    .foregroundStyle(GlassTokens.textPrimary)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 56)
        }
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(.ultraThinMaterial.opacity(0.4))
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(
                    Color.white.opacity(isPressed ? 0.6 : 0.3),
                    lineWidth: 1.5
                )
        )
        .scaleEffect(isPressed ? 0.98 : 1.0)
        .shadow(
            color: GlassTokens.shadowColor,
            radius: isPressed ? 12 : 15,
            y: isPressed ? 6 : 8
        )
        .animation(.easeInOut(duration: 0.15), value: isPressed)
        .accessibilityLabel(Text(title))
        .accessibilityHint(Text(style == .google ? L10n.tr("l10n.auth.google.hint") : L10n.tr("l10n.common.ok")))
        .accessibilityIdentifier(style == .google ? "signin_google" : "signin_custom")
    }
}

// MARK: - Loading Glass Overlay

struct LoadingGlassOverlay: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.15)
                .ignoresSafeArea()
            
            VStack(spacing: 16) {
                ProgressView()
                    .tint(GlassTokens.textPrimary)
                
                Text(L10n.tr("l10n.common.processing"))
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(GlassTokens.textPrimary)
            }
            .padding(24)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .stroke(Color.white.opacity(0.3), lineWidth: 1.5)
                    )
            )
            .shadow(color: .black.opacity(0.2), radius: 30, y: 15)
        }
        .transition(.opacity)
    }
}

// MARK: - Error Glass Banner

struct ErrorGlassBanner: View {
    let message: String
    let onDismiss: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.white)
            
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            Button(action: onDismiss) {
                Image(systemName: "xmark")
                    .font(.caption.bold())
                    .foregroundStyle(.white.opacity(0.8))
                    .padding(8)
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color.red.opacity(0.9))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(.ultraThinMaterial.opacity(0.2))
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Color.white.opacity(0.3), lineWidth: 1.5)
        )
        .shadow(color: .black.opacity(0.2), radius: 20, y: 10)
    }
}

// MARK: - Preview

#Preview("Auth Landing V2") {
    let model = AuthViewModel(
        authService: AuthService(),
        userRepository: UserRepository()
    )
    return AuthLandingView()
        .environment(model)
}

#Preview("Auth Landing V2 - Loading") {
    let model = AuthViewModel(
        authService: AuthService(),
        userRepository: UserRepository()
    )
    model.isLoading = true
    return AuthLandingView()
        .environment(model)
}

#Preview("Auth Landing V2 - Error") {
    let model = AuthViewModel(
        authService: AuthService(),
        userRepository: UserRepository()
    )
    model.errorMessage = "Đăng nhập thất bại. Vui lòng thử lại."
    return AuthLandingView()
        .environment(model)
}


