//
//  ProfileComponents.swift
//  AIPhotoApp
//
//  Reusable components for Profile screen with beige + liquid glass minimalist design
//

import SwiftUI

// MARK: - Profile Hero Card

struct ProfileHeroCard: View {
    let name: String
    let email: String
    let avatarURL: String?
    let memberSince: String?
    
    var body: some View {
        VStack(spacing: 16) {
            // Avatar with gradient border
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [
                                GlassTokens.accent1,
                                GlassTokens.accent2
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 88, height: 88)
                
                Circle()
                    .fill(GlassTokens.primary1)
                    .frame(width: 84, height: 84)
                
                if let avatarURLString = avatarURL, !avatarURLString.isEmpty, let avatarURL = URL(string: avatarURLString) {
                    AsyncImage(url: avatarURL) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                                .frame(width: 84, height: 84)
                                .clipShape(Circle())
                        case .failure, .empty:
                            // Fallback to initial letter
                            Text(name.prefix(1).uppercased())
                                .font(.system(size: 36, weight: .bold))
                                .foregroundStyle(GlassTokens.textPrimary)
                        @unknown default:
                            Text(name.prefix(1).uppercased())
                                .font(.system(size: 36, weight: .bold))
                                .foregroundStyle(GlassTokens.textPrimary)
                        }
                    }
                } else {
                    Text(name.prefix(1).uppercased())
                        .font(.system(size: 36, weight: .bold))
                        .foregroundStyle(GlassTokens.textPrimary)
                }
            }
            .shadow(color: GlassTokens.shadowColor, radius: 12, x: 0, y: 6)
            
            // Name and Email
            VStack(spacing: 4) {
                Text(name)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(GlassTokens.textPrimary)
                    .lineLimit(1)
                
                Text(email)
                    .font(.subheadline)
                    .foregroundStyle(GlassTokens.textSecondary)
                    .lineLimit(1)
            }
            
            // Member badge
            if let memberSince = memberSince {
                HStack(spacing: 6) {
                    Image(systemName: "sparkles")
                        .font(.caption)
                    Text("Member since \(memberSince)")
                        .font(.caption)
                }
                .foregroundStyle(GlassTokens.textSecondary)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(.ultraThinMaterial.opacity(0.6), in: Capsule())
                .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.2), lineWidth: 0.8))
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .padding(.horizontal, 16)
        .glassCard()
    }
}

// MARK: - Profile Stat Card

struct ProfileStatCard: View {
    let value: String
    let label: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(
                    LinearGradient(
                        colors: [GlassTokens.accent1, GlassTokens.accent2],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            Text(value)
                .font(.title2.weight(.bold))
                .foregroundStyle(GlassTokens.textPrimary)
                .contentTransition(.numericText())
            
            Text(label)
                .font(.caption)
                .foregroundStyle(GlassTokens.textSecondary)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .glassCard()
    }
}

// MARK: - Settings Row

struct SettingsRow: View {
    let icon: String
    let title: String
    let subtitle: String?
    let iconColor: Color
    let action: () -> Void
    
    init(
        icon: String,
        title: String,
        subtitle: String? = nil,
        iconColor: Color = GlassTokens.textPrimary,
        action: @escaping () -> Void
    ) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.iconColor = iconColor
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                // Icon
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(iconColor)
                    .frame(width: 28, height: 28)
                
                // Text
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.body.weight(.medium))
                        .foregroundStyle(GlassTokens.textPrimary)
                    
                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundStyle(GlassTokens.textSecondary)
                    }
                }
                
                Spacer()
                
                // Chevron
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(GlassTokens.textSecondary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Settings Toggle Row

struct SettingsToggleRow: View {
    let icon: String
    let title: String
    let subtitle: String?
    @Binding var isOn: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            // Icon
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(GlassTokens.textPrimary)
                .frame(width: 28, height: 28)
            
            // Text
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.body.weight(.medium))
                    .foregroundStyle(GlassTokens.textPrimary)
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(GlassTokens.textSecondary)
                }
            }
            
            Spacer()
            
            // Toggle
            Toggle("", isOn: $isOn)
                .labelsHidden()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}

// MARK: - Settings Section

struct SettingsSection<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(GlassTokens.textSecondary)
                .padding(.horizontal, 20)
                .padding(.top, 8)
            
            VStack(spacing: 0) {
                content
            }
            .glassCard()
        }
    }
}

// MARK: - Danger Button

struct DangerButton: View {
    let icon: String
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(.red)
                
                Text(title)
                    .font(.body.weight(.medium))
                    .foregroundStyle(.red)
                
                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                .ultraThinMaterial.opacity(0.7),
                in: RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous)
                    .stroke(Color.red.opacity(0.3), lineWidth: 0.8)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Previews

#Preview("Profile Hero Card") {
    ZStack {
        GlassBackgroundView()
        
        ProfileHeroCard(
            name: "Anh Tu",
            email: "anhtu@example.com",
            avatarURL: nil,
            memberSince: "Oct 2025"
        )
        .padding()
    }
}

#Preview("Profile Stats") {
    ZStack {
        GlassBackgroundView()
        
        HStack(spacing: 12) {
            ProfileStatCard(value: "24", label: "Used", icon: "square.grid.2x2")
            ProfileStatCard(value: "12", label: "Favorites", icon: "heart.fill")
            ProfileStatCard(value: "5", label: "Today", icon: "sparkles")
        }
        .padding()
    }
}

#Preview("Settings Rows") {
    ZStack {
        GlassBackgroundView()
        
        VStack(spacing: 12) {
            SettingsSection(title: "Account") {
                SettingsRow(icon: "person.circle", title: "Edit Profile", subtitle: "Update your information") {}
                Divider().padding(.leading, 56)
                SettingsRow(icon: "envelope", title: "Change Email", subtitle: "anhtu@example.com") {}
            }
            
            SettingsSection(title: "Preferences") {
                SettingsToggleRow(icon: "bell.fill", title: "Notifications", subtitle: "Get updates", isOn: .constant(true))
            }
            
            DangerButton(icon: "rectangle.portrait.and.arrow.right", title: "Logout") {}
        }
        .padding()
    }
}

