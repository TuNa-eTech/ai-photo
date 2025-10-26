//
//  ProfileView.swift
//  AIPhotoApp
//
//  User profile screen with stats, settings, and account management
//  Designed with beige + liquid glass minimalist aesthetic
//

import SwiftUI

struct ProfileView: View {
    let model: AuthViewModel
    
    @Environment(\.dismiss) private var dismiss
    @State private var showEditProfile = false
    @State private var showLogoutConfirm = false
    @State private var showDeleteConfirm = false
    
    // Settings toggles
    @State private var notificationsEnabled = true
    @State private var emailUpdatesEnabled = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        // Hero Card
                        heroSection
                        
                        // Stats Row
                        statsSection
                        
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
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.body.weight(.semibold))
                            .foregroundStyle(GlassTokens.textPrimary)
                    }
                }
                
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showEditProfile = true
                    } label: {
                        Text("Edit")
                            .font(.body.weight(.semibold))
                            .foregroundStyle(GlassTokens.textPrimary)
                    }
                }
            }
            .sheet(isPresented: $showEditProfile) {
                ProfileEditView(model: model)
            }
            .alert("Logout", isPresented: $showLogoutConfirm) {
                Button("Cancel", role: .cancel) {}
                Button("Logout", role: .destructive) {
                    handleLogout()
                }
            } message: {
                Text("Are you sure you want to logout?")
            }
            .alert("Delete Account", isPresented: $showDeleteConfirm) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    handleDeleteAccount()
                }
            } message: {
                Text("This action cannot be undone. All your data will be permanently deleted.")
            }
        }
    }
    
    // MARK: - Sections
    
    private var heroSection: some View {
        ProfileHeroCard(
            name: model.name.isEmpty ? "User" : model.name,
            email: model.email.isEmpty ? "user@example.com" : model.email,
            avatarURL: model.avatarURL?.absoluteString,
            memberSince: memberSinceText()
        )
    }
    
    private var statsSection: some View {
        HStack(spacing: 12) {
            ProfileStatCard(
                value: "24",
                label: "Used",
                icon: "square.grid.2x2"
            )
            
            ProfileStatCard(
                value: "12",
                label: "Favorites",
                icon: "heart.fill"
            )
            
            ProfileStatCard(
                value: "5",
                label: "Today",
                icon: "sparkles"
            )
        }
    }
    
    private var accountSection: some View {
        SettingsSection(title: "ACCOUNT") {
            SettingsRow(
                icon: "person.circle",
                title: "Edit Profile",
                subtitle: "Update your information"
            ) {
                showEditProfile = true
            }
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "envelope",
                title: "Email",
                subtitle: model.email
            ) {
                // TODO: Change email flow
                print("Change email tapped")
            }
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "lock.shield",
                title: "Privacy & Security",
                subtitle: "Manage your data"
            ) {
                // TODO: Privacy settings
                print("Privacy tapped")
            }
        }
    }
    
    private var preferencesSection: some View {
        SettingsSection(title: "PREFERENCES") {
            SettingsToggleRow(
                icon: "bell.fill",
                title: "Push Notifications",
                subtitle: "Get updates about new templates",
                isOn: $notificationsEnabled
            )
            
            Divider()
                .padding(.leading, 56)
            
            SettingsToggleRow(
                icon: "envelope.badge",
                title: "Email Updates",
                subtitle: "Receive newsletters and tips",
                isOn: $emailUpdatesEnabled
            )
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "paintbrush",
                title: "Appearance",
                subtitle: "Beige Theme"
            ) {
                // TODO: Theme picker
                print("Appearance tapped")
            }
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "globe",
                title: "Language",
                subtitle: "Tiếng Việt"
            ) {
                // TODO: Language picker
                print("Language tapped")
            }
        }
    }
    
    private var aboutSection: some View {
        SettingsSection(title: "ABOUT") {
            SettingsRow(
                icon: "info.circle",
                title: "Help & Support",
                subtitle: "FAQs and contact"
            ) {
                // TODO: Help screen
                print("Help tapped")
            }
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "doc.text",
                title: "Terms of Service",
                subtitle: nil
            ) {
                // TODO: Open terms URL
                print("Terms tapped")
            }
            
            Divider()
                .padding(.leading, 56)
            
            SettingsRow(
                icon: "hand.raised",
                title: "Privacy Policy",
                subtitle: nil
            ) {
                // TODO: Open privacy URL
                print("Privacy tapped")
            }
        }
    }
    
    private var dangerSection: some View {
        VStack(spacing: 12) {
            DangerButton(
                icon: "rectangle.portrait.and.arrow.right",
                title: "Logout"
            ) {
                showLogoutConfirm = true
            }
            
            DangerButton(
                icon: "trash",
                title: "Delete Account"
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
            
            Text("AI Photo App • Version \(appVersion())")
                .font(.caption)
                .foregroundStyle(GlassTokens.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
    }
    
    // MARK: - Helpers
    
    private func memberSinceText() -> String {
        // TODO: Get real join date from backend
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM yyyy"
        return formatter.string(from: Date())
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
        // TODO: Implement delete account flow
        print("Delete account requested")
    }
}

// MARK: - Preview

#Preview("Profile") {
    ProfileView(
        model: AuthViewModel(
            authService: AuthService(),
            userRepository: UserRepository()
        )
    )
}

