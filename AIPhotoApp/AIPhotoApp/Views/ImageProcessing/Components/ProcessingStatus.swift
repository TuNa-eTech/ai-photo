//
//  ProcessingStatus.swift
//  AIPhotoApp
//
//  Status text display for image processing states
//

import SwiftUI

struct ProcessingStatus: View {
    let processingState: ImageProcessingViewModel.ProcessingState
    let templateName: String

    var body: some View {
        VStack(spacing: GlassTokens.spaceMD) {
            Text(processingTitle)
                .font(.title2.bold())
                .foregroundStyle(GlassTokens.textPrimary)

            Text(processingMessage)
                .font(.subheadline)
                .foregroundStyle(GlassTokens.textSecondary)
                .multilineTextAlignment(.center)
                .lineLimit(3)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, GlassTokens.spaceSM)
    }

    private var processingTitle: String {
        switch processingState {
        case .idle:
            return L10n.tr("l10n.processing.title.ready")
        case .preparing:
            return L10n.tr("l10n.processing.title.preparing")
        case .uploading:
            return L10n.tr("l10n.processing.title.uploading")
        case .processing:
            return L10n.tr("l10n.processing.title.processing")
        case .processingInBackground:
            return L10n.tr("l10n.processing.title.background")
        case .completed:
            return L10n.tr("l10n.processing.title.completed")
        case .failed:
            return L10n.tr("l10n.processing.title.failed")
        }
    }

    private var processingMessage: String {
        switch processingState {
        case .idle:
            return L10n.tr("l10n.processing.msg.idle")
        case .preparing:
            return L10n.tr("l10n.processing.msg.preparing")
        case .uploading:
            return L10n.tr("l10n.processing.msg.uploading")
        case .processing:
            return L10n.tr("l10n.processing.msg.processing", templateName)
        case .processingInBackground:
            return L10n.tr("l10n.processing.msg.background")
        case .completed:
            return L10n.tr("l10n.processing.msg.completed")
        case .failed(let error):
            return error.localizedDescription
        }
    }
}
