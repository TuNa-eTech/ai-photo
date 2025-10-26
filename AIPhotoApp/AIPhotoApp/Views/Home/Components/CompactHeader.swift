//
//  CompactHeader.swift
//  AIPhotoApp
//
//  Compact header for home screen with avatar, greeting, and action buttons
//  Sticky header that stays at top when scrolling
//

import SwiftUI

struct CompactHeader: View {
    let userName: String
    let avatarURL: String?
    @Binding var showNotifications: Bool
    @Binding var showSettings: Bool
    
    var notificationCount: Int = 0
    
    var body: some View {
        HStack(spacing: 12) {
            // Avatar (40pt)
            avatarView
            
            // Name + Time-based greeting
            VStack(alignment: .leading, spacing: 0) {
                Text(timeBasedGreeting())
                    .font(.caption)
                    .foregroundStyle(GlassTokens.textSecondary)
                
                Text(userName)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(GlassTokens.textPrimary)
                    .lineLimit(1)
            }
            
            Spacer()
            
            // Action buttons
            HStack(spacing: 12) {
                HeaderActionButton(icon: "bell", badge: notificationCount) {
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    showNotifications = true
                }
                
                HeaderActionButton(icon: "gearshape") {
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    showSettings = true
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(.ultraThinMaterial.opacity(0.9))
        .overlay(alignment: .bottom) {
            Divider()
                .background(GlassTokens.borderColor.opacity(0.3))
        }
    }
    
    @ViewBuilder
    private var avatarView: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [
                            GlassTokens.primary1.opacity(0.8),
                            GlassTokens.primary2.opacity(0.8)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 40, height: 40)
            
            if let avatarURL = avatarURL, !avatarURL.isEmpty {
                // TODO: Use AsyncImage when backend provides URLs
                Image(systemName: "person.fill")
                    .font(.system(size: 20))
                    .foregroundStyle(GlassTokens.textPrimary)
            } else {
                // Placeholder
                Text(userName.prefix(1).uppercased())
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(GlassTokens.textPrimary)
            }
        }
        .overlay(
            Circle()
                .stroke(GlassTokens.borderColor.opacity(0.4), lineWidth: 1.5)
        )
    }
    
    private func timeBasedGreeting() -> String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12:
            return "Chào buổi sáng"
        case 12..<17:
            return "Chào buổi chiều"
        case 17..<22:
            return "Chào buổi tối"
        default:
            return "Chào bạn"
        }
    }
}

struct HeaderActionButton: View {
    let icon: String
    var badge: Int = 0
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            ZStack(alignment: .topTrailing) {
                Image(systemName: icon)
                    .font(.headline)
                    .foregroundStyle(GlassTokens.textPrimary)
                    .frame(width: 36, height: 36)
                    .background(.ultraThinMaterial.opacity(0.85), in: Circle())
                    .overlay(Circle().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
                
                if badge > 0 {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [GlassTokens.accent2, Color.red],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 16, height: 16)
                        .overlay(
                            Text("\(min(badge, 9))")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(Color.white)
                        )
                        .offset(x: 4, y: -4)
                }
            }
        }
        .accessibilityLabel(Text(icon == "bell" ? "Notifications" : "Settings"))
        .accessibilityValue(badge > 0 ? Text("\(badge) new notifications") : Text(""))
    }
}

// MARK: - Preview
#Preview {
    ZStack {
        GlassBackgroundView()
        
        VStack {
            CompactHeader(
                userName: "Anh Tu",
                avatarURL: nil,
                showNotifications: .constant(false),
                showSettings: .constant(false),
                notificationCount: 3
            )
            
            Spacer()
        }
    }
}



