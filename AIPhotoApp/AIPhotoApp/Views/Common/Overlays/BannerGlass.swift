//
//  BannerGlass.swift
//  AIPhotoApp
//
//  Reusable error banner with glass morphism style and optional retry action
//

import SwiftUI

struct BannerGlass: View {
    let text: String
    let tint: Color
    var retry: (() -> Void)?
    
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(tint)
            Text(text)
                .foregroundStyle(GlassTokens.textPrimary)
                .lineLimit(2)
            Spacer()
            if let retry {
                Button(L10n.tr("l10n.common.retry"), action: retry)
                    .buttonStyle(GlassCTAButtonStyle())
            }
        }
        .font(.footnote)
        .padding(12)
        .background(.ultraThinMaterial.opacity(0.9), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8)
        )
        .padding(.horizontal, 16)
    }
}

 // swiftlint:disable i18n_no_hardcoded_string_literals
#Preview {
    VStack(spacing: 16) {
        BannerGlass(text: "Error loading data", tint: .red)
        BannerGlass(text: "Error with retry", tint: .red) {
            print("Retry tapped")
        }
    }
    .padding()
    .background(Color.black)
}
// swiftlint:enable i18n_no_hardcoded_string_literals

