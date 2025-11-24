//
//  ProcessingProgress.swift
//  AIPhotoApp
//
//  Progress indicator for image processing
//

import SwiftUI

struct ProcessingProgress: View {
    let processingState: ImageProcessingViewModel.ProcessingState

    var body: some View {
        VStack(spacing: GlassTokens.spaceMD) {
            ProgressView()
                .progressViewStyle(.circular)
                .tint(GlassTokens.textPrimary)
                .scaleEffect(1.2)
        }
        .frame(height: 40)
        .opacity(processingState.canShowProgress ? 1 : 0)
        .animation(.glassSmooth, value: processingState.canShowProgress)
    }
}
