//
//  HeroPlaceholder.swift
//  AIPhotoApp
//
//  Placeholder view for hero section when no template is available
//

import SwiftUI
import UIKit

struct HeroPlaceholder: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [GlassTokens.primary1, GlassTokens.accent1],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(spacing: 16) {
                Image(systemName: "sparkles")
                    .font(.system(size: 64, weight: .light))
                    .foregroundStyle(GlassTokens.textSecondary.opacity(0.6))
                Text("Loading trending template...")
                    .font(.headline)
                    .foregroundStyle(GlassTokens.textSecondary)
            }
        }
        .frame(height: UIScreen.main.bounds.height * HeroConstants.heightMultiplier)
    }
}

#Preview {
    HeroPlaceholder()
}

