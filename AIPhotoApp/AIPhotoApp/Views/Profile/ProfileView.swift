//
//  ProfileView.swift
//  AIPhotoApp
//
//  User profile screen with stats, settings, and account management
//  Designed with beige + liquid glass minimalist aesthetic
//

import SwiftUI

struct ProfileView: View {
    @Environment(AuthViewModel.self) private var model
    @Environment(LocalizationModel.self) private var i18n
    
    @Environment(\.dismiss) private var dismiss
    @State private var showEditProfile = false
    @State private var showLogoutConfirm = false
    @State private var showDeleteConfirm = false
    @State private var showCreditsPurchase = false
    @State private var creditsViewModel = CreditsViewModel()
    
    // Settings toggles
    @State private var notificationsEnabled = true
    @State private var emailUpdatesEnabled = false
    
    // Webview states
    @State private var showPrivacyWebView = false
    @State private var showTermsWebView = false
    @State private var showHelpWebView = false
    
    // Language selection
    @State private var showLanguageDialog = false
    @State private var showRestartAlert = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        // Hero Card
                        heroSection
                        
                        // Account Settings
                        accountSection
                        
                        // Preferences
                        preferencesSection
                        
                        // About
                        aboutSection
                        
                        // Danger Zone
                        dangerSection
                        
                        // App Version
                        versionSection
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
                    .padding(.bottom, 40)
                }
            }
            .sheet(isPresented: $showEditProfile) {
                ProfileEditView()
            }
            .sheet(isPresented: $showCreditsPurchase) {
                CreditsPurchaseView()
                    .environment(model)
            }
            .sheet(isPresented: $showPrivacyWebView) {
                WebViewSheet(
                    title: L10n.tr("l10n.profile.aboutPrivacy.title"),
                    url: URL(string: "https://bokphoto.e-tech.network/privacy") ?? URL(fileURLWithPath: "")
                )
            }
            .sheet(isPresented: $showTermsWebView) {
                WebViewSheet(
                    title: L10n.tr("l10n.profile.terms.title"),
                    url: URL(string: "https://bokphoto.e-tech.network/terms") ?? URL(fileURLWithPath: "")
                )
            }
            .sheet(isPresented: $showHelpWebView) {
                WebViewSheet(
                    title: L10n.tr("l10n.profile.help.title"),
                    url: URL(string: "https://bokphoto.e-tech.network/#faq") ?? URL(fileURLWithPath: "")
                )
            }
            .task {
                await creditsViewModel.refreshCreditsBalance()
            }
            .onAppear {
                Task {
                    await creditsViewModel.refreshCreditsBalance()
                }
            }
            .onReceive(NotificationCenter.default.publisher(for: .creditsBalanceUpdated)) { _ in
                // Auto-refresh balance when updated from CreditsPurchaseView
                Task {
                    await creditsViewModel.refreshCreditsBalance()
                }
            }
            .alert(L10n.tr("l10n.profile.logout.confirmTitle"), isPresented: $showLogoutConfirm) {
                Button(L10n.tr("l10n.common.cancel"), role: .cancel) {}
                Button(L10n.tr("l10n.profile.logout"), role: .destructive) {
                    handleLogout()
                }
            } message: {
                Text(L10n.tr("l10n.profile.logout.confirmMessage"))
            }
            .alert(L10n.tr("l10n.profile.delete.confirmTitle"), isPresented: $showDeleteConfirm) {
                Button(L10n.tr("l10n.common.cancel"), role: .cancel) {}
                Button(L10n.tr("l10n.profile.deleteAccount"), role: .destructive) {
                    handleDeleteAccount()
                }
            } message: {
                Text(L10n.tr("l10n.profile.delete.confirmMessage"))
            }
        }
    }
    
    // MARK: - Sections
    
    private var heroSection: some View {
        ProfileHeroCard(
            name: model.name.isEmpty ? L10n.tr("l10n.profile.placeholder.user") : model.name,
            email: model.email.isEmpty ? L10n.tr("l10n.profile.placeholder.email") : model.email,
            avatarURL: model.avatarURL?.absoluteString,
            credits: animatedCreditsValue
        )
    }
    
    private var accountSection: some View {
        SettingsSection(title: L10n.tr("l10n.profile.section.account")) {
            SettingsRow(
                icon: "star.fill",
                title: L10n.tr("l10n.profile.buyCredits.title"),
                subtitle: L10n.tr("l10n.profile.buyCredits.subtitle")
            ) {
                showCreditsPurchase = true
            }
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "person.circle",
                title: L10n.tr("l10n.profile.edit.title"),
                subtitle: L10n.tr("l10n.profile.edit.subtitle")
            ) {
                showEditProfile = true
            }
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "envelope",
                title: L10n.tr("l10n.profile.email.title"),
                subtitle: model.email
            ) {
                // TODO: Change email flow
                print("Change email tapped")
            }
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "lock.shield",
                title: L10n.tr("l10n.profile.privacy.title"),
                subtitle: L10n.tr("l10n.profile.privacy.subtitle")
            ) {
                showPrivacyWebView = true
            }
        }
    }
    
    private var preferencesSection: some View {
        SettingsSection(title: L10n.tr("l10n.profile.section.preferences")) {
            SettingsToggleRow(
                icon: "bell.fill",
                title: L10n.tr("l10n.profile.notifications.title"),
                subtitle: L10n.tr("l10n.profile.notifications.subtitle"),
                isOn: $notificationsEnabled
            )
            
            Divider()
                .padding(.leading, 56)
            
            SettingsToggleRow(
                icon: "envelope.badge",
                title: L10n.tr("l10n.profile.emailUpdates.title"),
                subtitle: L10n.tr("l10n.profile.emailUpdates.subtitle"),
                isOn: $emailUpdatesEnabled
            )
            
            Divider()
                .padding(.leading, 56)
            
            // Language row as a Button so confirmationDialog anchors correctly to this control (iPad popover)
            Button {
                showLanguageDialog = true
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "globe")
                        .font(.title3)
                        .foregroundStyle(GlassTokens.textPrimary)
                        .frame(width: 28, height: 28)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(L10n.tr("l10n.settings.language"))
                            .font(.body.weight(.medium))
                            .foregroundStyle(GlassTokens.textPrimary)
                        Text(i18n.language == .english ? L10n.tr("l10n.language.english") : L10n.tr("l10n.language.vietnamese"))
                            .font(.caption)
                            .foregroundStyle(GlassTokens.textSecondary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(GlassTokens.textSecondary)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .confirmationDialog(
                L10n.tr("l10n.language.selectTitle"),
                isPresented: $showLanguageDialog,
                titleVisibility: .visible
            ) {
                Button(L10n.tr("l10n.language.english")) {
                    i18n.setLanguage(.english) // runtime switch
                }
                Button(L10n.tr("l10n.language.vietnamese")) {
                    i18n.setLanguage(.vietnamese) // runtime switch
                }
                Button(L10n.tr("l10n.common.cancel"), role: .cancel) { }
            }
        }
    }
    
    private var aboutSection: some View {
        SettingsSection(title: L10n.tr("l10n.profile.section.about")) {
            SettingsRow(
                icon: "info.circle",
                title: L10n.tr("l10n.profile.help.title"),
                subtitle: L10n.tr("l10n.profile.help.subtitle")
            ) {
                showHelpWebView = true
            }
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "doc.text",
                title: L10n.tr("l10n.profile.terms.title"),
                subtitle: nil
            ) {
                showTermsWebView = true
            }
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "hand.raised",
                title: L10n.tr("l10n.profile.aboutPrivacy.title"),
                subtitle: nil
            ) {
                showPrivacyWebView = true
            }
        }
    }
    
    private var dangerSection: some View {
        VStack(spacing: 12) {
            DangerButton(
                icon: "rectangle.portrait.and.arrow.right",
                title: L10n.tr("l10n.profile.logout")
            ) {
                showLogoutConfirm = true
            }
            
            DangerButton(
                icon: "trash",
                title: L10n.tr("l10n.profile.deleteAccount")
            ) {
                showDeleteConfirm = true
            }
        }
    }
    
    private var versionSection: some View {
        HStack(spacing: 8) {
            Image(systemName: "sparkles")
                .font(.caption)
                .foregroundStyle(GlassTokens.textSecondary)
            
            Text(L10n.tr("l10n.app.versionLabel", appDisplayName(), appVersion()))
                .font(.caption)
                .foregroundStyle(GlassTokens.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
    }
    
    // MARK: - Helpers
    
    private var animatedCreditsValue: String {
        "\(creditsViewModel.creditsBalance)"
    }
    
    
    private func appDisplayName() -> String {
        if let displayName = Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String, !displayName.isEmpty {
            return displayName
        }
        if let name = Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String, !name.isEmpty {
            return name
        }
        // Fallback to localized app name if Info.plist keys are missing
        return L10n.tr("l10n.app.name")
    }
    
    private func appVersion() -> String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }
    
    private func handleLogout() {
        Task { @MainActor in
            do {
                try await model.signOut()
                dismiss()
            } catch {
                print("Logout error: \(error)")
            }
        }
    }
    
    private func handleDeleteAccount() {
        Task { @MainActor in
            do {
                try await model.signOut()
                dismiss()
            } catch {
                print("Delete account error: \(error)")
            }
        }
    }
}

// MARK: - Preview

#Preview("Profile") {
    let authViewModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    let i18n = LocalizationModel()
    ProfileView()
        .environment(authViewModel)
        .environment(i18n)
}

