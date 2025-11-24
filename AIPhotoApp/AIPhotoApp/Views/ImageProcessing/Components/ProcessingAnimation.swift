//
//  ProcessingAnimation.swift
//  AIPhotoApp
//
//  Animated status indicator for image processing states
//

import SwiftUI

struct ProcessingAnimation: View {
    let processingState: ImageProcessingViewModel.ProcessingState
    let size: CGFloat

    init(
        processingState: ImageProcessingViewModel.ProcessingState,
        size: CGFloat = GlassTokens.processingAnimationSize
    ) {
        self.processingState = processingState
        self.size = size
    }

    var body: some View {
        ZStack {
            // Background circle with gradient
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            GlassTokens.accent1.opacity(0.4),
                            GlassTokens.accent2.opacity(0.25),
                            GlassTokens.primary1.opacity(0.15),
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: size / 2
                    )
                )
                .frame(
                    width: size,
                    height: size
                )
                .shadow(
                    color: GlassTokens.shadowColor.opacity(0.5),
                    radius: GlassTokens.shadowRadius * 0.8,
                    x: 0,
                    y: GlassTokens.shadowY * 0.8
                )

            // Processing icon
            Image(systemName: processingIcon)
                .font(.system(size: iconSize, weight: .medium))
                .foregroundStyle(
                    LinearGradient(
                        colors: [
                            GlassTokens.textPrimary,
                            GlassTokens.textSecondary,
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .symbolEffect(.pulse, options: .repeating.speed(1.5))
        }
    }

    private var iconSize: CGFloat {
        size * 0.355  // 64/180 ratio maintained
    }

    private var processingIcon: String {
        switch processingState {
        case .preparing:
            return "photo.stack"
        case .uploading:
            return "arrow.up.circle"
        case .processing, .processingInBackground:
            return "wand.and.stars"
        case .completed:
            return "checkmark.circle.fill"
        case .failed:
            return "exclamationmark.triangle.fill"
        default:
            return "photo"
        }
    }
}
