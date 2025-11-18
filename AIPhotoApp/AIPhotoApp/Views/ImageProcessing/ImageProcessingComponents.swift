//
//  ImageProcessingComponents.swift
//  AIPhotoApp
//
//  Reusable components for Image Processing UI
//

import SwiftUI

// MARK: - Credits Header

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

// MARK: - Processing Animation

struct ProcessingAnimation: View {
    let processingState: ImageProcessingViewModel.ProcessingState
    let size: CGFloat

    init(processingState: ImageProcessingViewModel.ProcessingState, size: CGFloat = GlassTokens.processingAnimationSize) {
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
                            GlassTokens.primary1.opacity(0.15)
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
                            GlassTokens.textSecondary
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .symbolEffect(.pulse, options: .repeating.speed(1.5))
        }
    }

    private var iconSize: CGFloat {
        size * 0.355 // 64/180 ratio maintained
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

// MARK: - Processing Status

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

// MARK: - Processing Progress

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

// MARK: - Processing Action Buttons

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

// MARK: - Main Processing Card

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
            return UIScreen.main.bounds.width - 32 // iPhone SE
        case 375..<414:
            return min(GlassTokens.maxCardWidth, UIScreen.main.bounds.width - 48) // iPhone standard
        default:
            return min(GlassTokens.maxCardWidth, UIScreen.main.bounds.width - 64) // iPhone Plus/Pro Max
        }
        #else
        return GlassTokens.maxCardWidth
        #endif
    }
}