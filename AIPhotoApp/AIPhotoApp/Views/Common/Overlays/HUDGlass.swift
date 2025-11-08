//
//  HUDGlass.swift
//  AIPhotoApp
//
//  Reusable HUD loading indicator with glass morphism style
//

import SwiftUI

struct HUDGlass: View {
    let text: String
    
    var body: some View {
        HStack(spacing: 8) {
            ProgressView()
                .progressViewStyle(.circular)
                .tint(GlassTokens.textPrimary)
            Text(text)
                .font(.footnote)
                .foregroundStyle(GlassTokens.textPrimary)
        }
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(.ultraThinMaterial.opacity(0.9), in: Capsule())
        .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
    }
}

#Preview {
    HUDGlass(text: "Đang tải…")
        .padding()
        .background(Color.black)
}

