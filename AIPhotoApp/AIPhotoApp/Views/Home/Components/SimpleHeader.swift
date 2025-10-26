//
//  SimpleHeader.swift
//  AIPhotoApp
//
//  Simple header for home screen MVP
//  Shows avatar, greeting, and settings button only
//

import SwiftUI

struct SimpleHeader: View {
    let userName: String
    let avatarURL: String?
    @Binding var showSettings: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            // Avatar (40pt)
            avatarView
            
            // Greeting text
            Text("Chào \(userName)")
                .font(.title3.weight(.semibold))
                .foregroundStyle(GlassTokens.textPrimary)
                .lineLimit(1)
            
            Spacer()
            
            // Settings button only
            Button(action: {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                showSettings = true
            }) {
                Image(systemName: "gearshape")
                    .font(.title3)
                    .foregroundStyle(GlassTokens.textPrimary)
                    .frame(width: 36, height: 36)
                    .background(.ultraThinMaterial.opacity(0.85), in: Circle())
                    .overlay(Circle().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
            }
            .accessibilityLabel(Text("Settings"))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
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
}

// MARK: - Preview
#Preview {
    ZStack {
        GlassBackgroundView()
        
        VStack {
            SimpleHeader(
                userName: "Anh Tu",
                avatarURL: nil,
                showSettings: .constant(false)
            )
            
            Spacer()
        }
    }
}

