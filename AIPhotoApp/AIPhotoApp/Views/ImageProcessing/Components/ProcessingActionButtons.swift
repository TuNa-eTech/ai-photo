//
//  ProcessingActionButtons.swift
//  AIPhotoApp
//
//  Action buttons for image processing (Retry, Get Credits, Cancel)
//

import SwiftUI

struct ProcessingActionButtons: View {
    let processingState: ImageProcessingViewModel.ProcessingState
    let template: TemplateDTO
    let image: UIImage
    let onGetCredits: () -> Void
    let onRetry: () -> Void
    let onCancel: () -> Void

    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        VStack(spacing: GlassTokens.spaceMD) {
            if case .failed(let error) = processingState {
                if case .insufficientCredits = error {
                    // "Get Credits" button for insufficient credits
                    Button(L10n.tr("l10n.credits.get")) {
                        onGetCredits()
                    }
                    .buttonStyle(GlassCTAButtonStyle())
                    .controlSize(buttonControlSize)
                } else {
                    // "Retry" button for other errors
                    Button(L10n.tr("l10n.common.retryVerb")) {
                        onRetry()
                    }
                    .buttonStyle(GlassCTAButtonStyle())
                    .controlSize(buttonControlSize)
                }
            }

            Button(L10n.tr("l10n.common.cancel")) {
                onCancel()
            }
            .buttonStyle(.bordered)
            .foregroundStyle(GlassTokens.textPrimary)
            .controlSize(buttonControlSize)
        }
        .dynamicTypeSize(...dynamicTypeSize)
    }

    private var buttonControlSize: ControlSize {
        switch dynamicTypeSize {
        case .xSmall, .small:
            return .small
        case .medium, .large:
            return .large
        case .xLarge, .xxLarge, .xxxLarge:
            return .extraLarge
        @unknown default:
            return .large
        }
    }
}
