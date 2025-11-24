//
//  ResultActionBar.swift
//  AIPhotoApp
//
//  Action bar for saving, sharing, and viewing projects
//

import SwiftUI
import UIKit

struct ResultActionBar: View {
    let processedImage: UIImage
    let onSave: (UIImage) -> Void

    var body: some View {
        VStack(spacing: 12) {
            // Primary actions row (Save & Share)
            HStack(spacing: 12) {
                Button {
                    onSave(processedImage)
                } label: {
                    Label(
                        L10n.tr("l10n.common.save"),
                        systemImage: "square.and.arrow.down"
                    )
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(GlassCTAButtonStyle())
                .accessibilityLabel(
                    Text(L10n.tr("l10n.photo.accessibility.saveToPhotos")))

                ShareLink(
                    item: Image(uiImage: processedImage),
                    preview: SharePreview(
                        "My AI Image", image: Image(uiImage: processedImage))
                ) {
                    Label(
                        L10n.tr("l10n.common.share"),
                        systemImage: "square.and.arrow.up"
                    )
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(GlassCTAButtonStyle())
            }
            .font(.headline)

            // Secondary action row (Projects)
            NavigationLink {
                MyProjectsView()
            } label: {
                Label(L10n.tr("l10n.projects.viewAll"), systemImage: "folder")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(GlassCTAButtonStyle())
            .font(.headline)
        }
        .padding(16)
        .background(
            .ultraThinMaterial.opacity(0.92),
            in: RoundedRectangle(
                cornerRadius: GlassTokens.cardCornerRadius, style: .continuous)
        )
        .overlay(
            RoundedRectangle(
                cornerRadius: GlassTokens.cardCornerRadius, style: .continuous
            )
            .stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8)
        )
        .shadow(
            color: GlassTokens.shadowColor,
            radius: GlassTokens.shadowRadius,
            x: 0,
            y: -GlassTokens.shadowY
        )
        .padding(.horizontal, 20)
        .padding(.bottom, 8)
    }
}
