//
//  TemplateInstructions.swift
//  AIPhotoApp
//
//  Instructions component for template selection
//

import Foundation
import SwiftUI

struct TemplateInstructions: View {
    let templateName: String

    var body: some View {
        VStack(spacing: 12) {
            Text(L10n.tr("l10n.image.instructions.title"))
                .font(.headline)
                .foregroundStyle(GlassTokens.textPrimary)

            Text(L10n.tr("l10n.image.instructions.subtitle", templateName))
                .font(.subheadline)
                .foregroundStyle(GlassTokens.textSecondary)
                .multilineTextAlignment(.center)
        }
    }
}

// MARK: - Preview

#Preview {
    TemplateInstructions(templateName: "Anime Style")
        .padding()
}
