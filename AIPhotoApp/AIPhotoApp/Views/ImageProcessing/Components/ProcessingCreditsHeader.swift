//
//  ProcessingCreditsHeader.swift
//  AIPhotoApp
//
//  Credits balance header for image processing view
//

import SwiftUI

struct ProcessingCreditsHeader: View {
    var creditsViewModel: CreditsViewModel

    var body: some View {
        HStack(spacing: GlassTokens.spaceMD) {
            Image(systemName: "star.fill")
                .font(.subheadline)
                .foregroundStyle(
                    LinearGradient(
                        colors: [GlassTokens.accent1, GlassTokens.accent2],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            VStack(alignment: .leading, spacing: GlassTokens.spaceXS) {
                Text(L10n.tr("l10n.credits.title"))
                    .font(.caption)
                    .foregroundStyle(GlassTokens.textSecondary)

                Text("\(creditsViewModel.creditsBalance)")
                    .font(.headline.bold())
                    .foregroundStyle(GlassTokens.textPrimary)
                    .contentTransition(.numericText())
                    .animation(.glassSpring, value: creditsViewModel.creditsBalance)
            }

            Spacer()
        }
        .padding(.horizontal, GlassTokens.spaceLG)
        .padding(.vertical, GlassTokens.spaceMD)
        .glassCard()
    }
}
