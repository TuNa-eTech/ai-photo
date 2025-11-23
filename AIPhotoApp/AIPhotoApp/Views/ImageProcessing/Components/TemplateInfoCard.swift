//
//  TemplateInfoCard.swift
//  AIPhotoApp
//
//  Template information card component
//

import Foundation
import SwiftUI

struct TemplateInfoCard: View {
    let template: TemplateDTO

    var body: some View {
        VStack(spacing: 16) {
            // Template thumbnail
            templateThumbnail

            Text(template.name)
                .font(.title2.bold())
                .foregroundStyle(GlassTokens.textPrimary)

            if template.isNew {
                Label(L10n.tr("l10n.template.new"), systemImage: "sparkles")
                    .font(.subheadline)
                    .foregroundStyle(GlassTokens.accent1)
            }
        }
        .padding()
        .glassCard()
    }

    // MARK: - Subviews

    private var templateThumbnail: some View {
        Group {
            if let url = template.thumbnailURL {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                    case .failure, .empty:
                        templateIcon
                    @unknown default:
                        templateIcon
                    }
                }
            } else {
                templateIcon
            }
        }
        .frame(height: 150)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private var templateIcon: some View {
        Image(systemName: "wand.and.stars")
            .font(.system(size: 60))
            .foregroundStyle(
                LinearGradient(
                    colors: [GlassTokens.primary1, GlassTokens.accent1],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
    }
}

// MARK: - Preview

#Preview {
    TemplateInfoCard(
        template: TemplateDTO(
            id: "anime-style",
            name: "Anime Style",
            thumbnailURL: URL(string: "https://picsum.photos/400/300"),
            publishedAt: Calendar.current.date(byAdding: .day, value: -3, to: Date()),
            usageCount: 150
        )
    )
    .padding()
}
