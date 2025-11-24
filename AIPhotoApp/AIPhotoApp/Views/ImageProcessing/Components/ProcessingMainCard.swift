//
//  ProcessingMainCard.swift
//  AIPhotoApp
//
//  Main card composing all processing components
//

import SwiftUI

struct ProcessingMainCard: View {
    var creditsViewModel: CreditsViewModel
    var viewModel: ImageProcessingViewModel
    let template: TemplateDTO
    let image: UIImage
    let onGetCredits: () -> Void
    let onCancel: () -> Void

    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                VStack(spacing: GlassTokens.sectionSpacing) {
                    // Credits header
                    ProcessingCreditsHeader(creditsViewModel: creditsViewModel)

                    // Visual separator
                    Divider()
                        .foregroundStyle(GlassTokens.borderColor.opacity(0.3))
                        .padding(.horizontal, GlassTokens.spaceMD)

                    // Processing animation - responsive sizing
                    ProcessingAnimation(
                        processingState: viewModel.processingState,
                        size: processingAnimationSize(for: geometry.size.width)
                    )
                    .padding(.vertical, GlassTokens.spaceSM)

                    // Status text - dynamic type support
                    ProcessingStatus(
                        processingState: viewModel.processingState,
                        templateName: template.name
                    )
                    .dynamicTypeSize(...dynamicTypeSize)

                    // Progress bar
                    ProcessingProgress(processingState: viewModel.processingState)

                    // Action buttons - responsive layout
                    if case .failed(_) = viewModel.processingState {
                        Divider()
                            .foregroundStyle(GlassTokens.borderColor.opacity(0.3))
                            .padding(.horizontal, GlassTokens.spaceMD)

                        ProcessingActionButtons(
                            processingState: viewModel.processingState,
                            template: template,
                            image: image,
                            onGetCredits: onGetCredits,
                            onRetry: {
                                Task {
                                    await viewModel.processImage(template: template, image: image)
                                }
                            },
                            onCancel: onCancel
                        )
                    }

                    // Bottom spacing for safe area
                    Color.clear.frame(height: 44)
                }
                .padding(.horizontal, horizontalPadding(for: geometry.size.width))
                .padding(.vertical, GlassTokens.cardPaddingVertical)
                .frame(minHeight: geometry.size.height)
            }
        }
        .glassCard()
        .frame(maxWidth: maxWidthForCard)
    }

    // MARK: - Responsive Sizing

    private func processingAnimationSize(for containerWidth: CGFloat) -> CGFloat {
        let baseSize = GlassTokens.processingAnimationSize
        let minSize: CGFloat = 140
        let maxSize: CGFloat = 200

        switch containerWidth {
        case ..<350:
            return max(minSize, baseSize * 0.8)
        case 350..<400:
            return baseSize
        default:
            return min(maxSize, baseSize * 1.1)
        }
    }

    private func horizontalPadding(for containerWidth: CGFloat) -> CGFloat {
        switch containerWidth {
        case ..<350:
            return GlassTokens.spaceMD
        case 350..<400:
            return GlassTokens.cardPaddingHorizontal
        default:
            return GlassTokens.spaceXL
        }
    }

    private var maxWidthForCard: CGFloat {
        #if os(iOS)
            switch UIScreen.main.bounds.width {
            case ..<375:
                return UIScreen.main.bounds.width - 32  // iPhone SE
            case 375..<414:
                return min(GlassTokens.maxCardWidth, UIScreen.main.bounds.width - 48)  // iPhone standard
            default:
                return min(GlassTokens.maxCardWidth, UIScreen.main.bounds.width - 64)  // iPhone Plus/Pro Max
            }
        #else
            return GlassTokens.maxCardWidth
        #endif
    }
}
