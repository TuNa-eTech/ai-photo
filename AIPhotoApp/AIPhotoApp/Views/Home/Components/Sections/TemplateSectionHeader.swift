//
//  TemplateSectionHeader.swift
//  AIPhotoApp
//
//  Reusable header for template sections with title and "See All" button
//

import SwiftUI
import UIKit

struct TemplateSectionHeader: View {
    let title: String
    let onSeeAllTap: () -> Void
    
    var body: some View {
        HStack(alignment: .center) {
            Text(title)
                .font(.title2.weight(.bold))
                .foregroundStyle(GlassTokens.textPrimary)
            
            Spacer()
            
            Button(action: {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                onSeeAllTap()
            }) {
                HStack(spacing: 4) {
                    Text("See All")
                        .font(.subheadline.weight(.medium))
                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                }
                .foregroundStyle(GlassTokens.textPrimary)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(.ultraThinMaterial.opacity(0.85), in: Capsule())
                .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 20)
    }
}

#Preview {
    TemplateSectionHeader(title: "Trending Now") {
        print("See All tapped")
    }
    .padding()
    .background(Color.black)
}

