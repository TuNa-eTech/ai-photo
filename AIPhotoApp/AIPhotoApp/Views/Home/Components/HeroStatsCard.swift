//
//  HeroStatsCard.swift
//  AIPhotoApp
//
//  Hero stats card showing template count, activity, and latest info
//  Displayed prominently at top of home screen
//

import SwiftUI

struct HeroStatsCard: View {
    let templateCount: Int
    let todayCreatedCount: Int
    let latestTemplateName: String?
    
    var body: some View {
        HStack(spacing: 0) {
            StatColumn(
                value: "\(templateCount)",
                label: "Templates",
                icon: "square.grid.2x2"
            )
            
            Divider()
                .frame(height: 40)
                .overlay(GlassTokens.borderColor.opacity(0.3))
            
            StatColumn(
                value: "\(todayCreatedCount)",
                label: "Hôm nay",
                icon: "sparkles"
            )
            
            Divider()
                .frame(height: 40)
                .overlay(GlassTokens.borderColor.opacity(0.3))
            
            StatColumn(
                value: latestTemplateName ?? "New",
                label: "Mới nhất",
                icon: "star.fill",
                isText: true
            )
        }
        .padding(16)
        .glassCard()
        .padding(.horizontal, 16)
    }
}

struct StatColumn: View {
    let value: String
    let label: String
    let icon: String
    var isText: Bool = false
    
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
            
            if isText {
                Text(value)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(GlassTokens.textPrimary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            } else {
                Text(value)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(GlassTokens.textPrimary)
            }
            
            Text(label)
                .font(.caption)
                .foregroundStyle(GlassTokens.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Preview
#Preview {
    ZStack {
        GlassBackgroundView()
        
        VStack {
            HeroStatsCard(
                templateCount: 24,
                todayCreatedCount: 3,
                latestTemplateName: "Vintage"
            )
            
            Spacer()
        }
        .padding(.top, 100)
    }
}



