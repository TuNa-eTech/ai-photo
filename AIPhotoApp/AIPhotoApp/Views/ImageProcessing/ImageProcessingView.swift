//
//  ImageProcessingView.swift
//  AIPhotoApp
//
//  UI for processing images with templates
//

import SwiftUI
#if canImport(UIKit)
import UIKit

struct ImageProcessingView: View {
    let template: TemplateDTO
    let image: UIImage
    
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var viewModel: ImageProcessingViewModel?
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        Group {
            if let viewModel = viewModel {
                ZStack {
                    GlassBackgroundView()
                    
                    VStack(spacing: 24) {
                        // Processing animation
                        processingAnimation(viewModel: viewModel)
                        
                        // Status text
                        statusText(viewModel: viewModel)
                        
                        // Progress bar
                        progressBar(viewModel: viewModel)
                        
                        // Action buttons
                        actionButtons(viewModel: viewModel)
                    }
                    .padding(24)
                    .glassCard()
                }
                .task {
                    await viewModel.processImage(template: template, image: image)
                }
                .onChange(of: viewModel.processingState) { oldValue, newValue in
                    if case .completed = newValue {
                        Task { @MainActor in
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            // Present on next runloop tick to avoid race with current layout transaction
                            try? await Task.sleep(for: .milliseconds(50))
                            dismiss()
                        }
                    }
                }
            } else {
                // Loading state while initializing ViewModel
                ZStack {
                    GlassBackgroundView()
                    ProgressView()
                }
            }
        }
        .onAppear {
            // Initialize ViewModel with @Environment authViewModel
            if viewModel == nil {
                viewModel = ImageProcessingViewModel(authViewModel: authViewModel)
            }
        }
    }
    
    // MARK: - Views
    
    private func processingAnimation(viewModel: ImageProcessingViewModel) -> some View {
        ZStack {
            // Background circle with better contrast
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
                        endRadius: 120
                    )
                )
                .frame(width: 240, height: 240)
                .shadow(
                    color: GlassTokens.shadowColor.opacity(0.5),
                    radius: 20,
                    x: 0,
                    y: 10
                )
            
            // Processing icon with better contrast
            Image(systemName: imageProcessingIcon(viewModel: viewModel))
                .font(.system(size: 80, weight: .medium))
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
    
    private func imageProcessingIcon(viewModel: ImageProcessingViewModel) -> String {
        switch viewModel.processingState {
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
    
    private func statusText(viewModel: ImageProcessingViewModel) -> some View {
        VStack(spacing: 12) {
            Text(processingTitle(viewModel: viewModel))
                .font(.title2.bold())
                .foregroundStyle(GlassTokens.textPrimary)
            
            Text(processingMessage(viewModel: viewModel))
                .font(.subheadline)
                .foregroundStyle(GlassTokens.textSecondary)
                .multilineTextAlignment(.center)
                .lineLimit(3)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 8)
    }
    
    private func processingTitle(viewModel: ImageProcessingViewModel) -> String {
        switch viewModel.processingState {
        case .idle:
            return "Ready to Process"
        case .preparing:
            return "Preparing Image..."
        case .uploading:
            return "Uploading Image..."
        case .processing:
            return "Processing with AI..."
        case .processingInBackground:
            return "Processing in Background"
        case .completed:
            return "Complete! ✓"
        case .failed:
            return "Processing Failed"
        }
    }
    
    private func processingMessage(viewModel: ImageProcessingViewModel) -> String {
        switch viewModel.processingState {
        case .idle:
            return "Starting image processing"
        case .preparing:
            return "Optimizing your image for AI processing"
        case .uploading:
            return "Sending to AI server"
        case .processing:
            return "Applying \(template.name) style... This may take 30-60 seconds"
        case .processingInBackground:
            return "You can close the app - we'll notify when done"
        case .completed:
            return "Your image is ready!"
        case .failed(let error):
            return error.localizedDescription
        }
    }
    
    private func progressBar(viewModel: ImageProcessingViewModel) -> some View {
        VStack(spacing: 12) {
            // Indeterminate spinner while uploading/processing
            ProgressView()
                .progressViewStyle(.circular)
                .tint(GlassTokens.textPrimary)
                .scaleEffect(1.2)
        }
        .frame(height: 40)
        .opacity(viewModel.processingState.canShowProgress ? 1 : 0)
        .animation(.easeInOut(duration: 0.3), value: viewModel.processingState.canShowProgress)
    }
    
    private func actionButtons(viewModel: ImageProcessingViewModel) -> some View {
        VStack(spacing: 12) {
            if case .failed = viewModel.processingState {
                Button("Retry") {
                    Task {
                        await viewModel.processImage(template: template, image: image)
                    }
                }
                .buttonStyle(GlassCTAButtonStyle())
                .controlSize(.large)
            }
            
            Button("Cancel") {
                dismiss()
            }
            .buttonStyle(.bordered)
            .foregroundStyle(GlassTokens.textPrimary)
            .controlSize(.large)
        }
    }
}

extension ImageProcessingViewModel.ProcessingState {
    var canShowProgress: Bool {
        switch self {
        case .uploading, .processing, .processingInBackground:
            return true
        default:
            return false
        }
    }
}
#endif
