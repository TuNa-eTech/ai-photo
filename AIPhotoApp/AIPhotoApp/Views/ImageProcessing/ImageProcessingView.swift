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
    @State private var creditsViewModel = CreditsViewModel()
    @State private var showCreditsPurchase = false
    @State private var showInsufficientCreditsAlert = false
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        Group {
            if let viewModel = viewModel {
                ZStack {
                    GlassBackgroundView()
                    
                    VStack(spacing: 24) {
                        // Credits header
                        creditsHeader
                        
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
                    await creditsViewModel.refreshCreditsBalance()
                    await viewModel.processImage(template: template, image: image)
                }
                .onChange(of: viewModel.processingState) { oldValue, newValue in
                    if case .completed = newValue {
                        Task { @MainActor in
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            // Refresh credits after completion
                            await creditsViewModel.refreshCreditsBalance()
                            // Present on next runloop tick to avoid race with current layout transaction
                            try? await Task.sleep(for: .milliseconds(50))
                            dismiss()
                        }
                    }
                    // Check for insufficient credits error
                    if case .failed(let error) = newValue,
                       case .insufficientCredits = error {
                        showInsufficientCreditsAlert = true
                    }
                }
                .onReceive(NotificationCenter.default.publisher(for: .creditsBalanceUpdated)) { _ in
                    // Auto-refresh balance when updated from CreditsPurchaseView
                    Task {
                        await creditsViewModel.refreshCreditsBalance()
                    }
                }
                .alert("Không đủ Credits", isPresented: $showInsufficientCreditsAlert) {
                    Button("Hủy", role: .cancel) {
                        dismiss()
                    }
                    Button("Mua Credits") {
                        showCreditsPurchase = true
                    }
                } message: {
                    Text("Bạn không đủ credits. Vui lòng mua thêm để tiếp tục.")
                }
                .sheet(isPresented: $showCreditsPurchase) {
                    CreditsPurchaseView()
                        .environment(authViewModel)
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
    
    private var creditsHeader: some View {
        HStack(spacing: 12) {
            Image(systemName: "star.fill")
                .font(.subheadline)
                .foregroundStyle(
                    LinearGradient(
                        colors: [GlassTokens.accent1, GlassTokens.accent2],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Credits")
                    .font(.caption)
                    .foregroundStyle(GlassTokens.textSecondary)
                
                Text("\(creditsViewModel.creditsBalance)")
                    .font(.headline.bold())
                    .foregroundStyle(GlassTokens.textPrimary)
                    .contentTransition(.numericText())
                    .animation(.spring(response: 0.3, dampingFraction: 0.8), value: creditsViewModel.creditsBalance)
            }
            
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .glassCard()
    }
    
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
            if case .failed(let error) = viewModel.processingState {
                // Show "Buy Credits" button for insufficient credits error
                if case .insufficientCredits = error {
                    Button("Mua Credits") {
                        showCreditsPurchase = true
                    }
                    .buttonStyle(GlassCTAButtonStyle())
                    .controlSize(.large)
                } else {
                    // Show "Retry" button for other errors
                    Button("Retry") {
                        Task {
                            await viewModel.processImage(template: template, image: image)
                        }
                    }
                    .buttonStyle(GlassCTAButtonStyle())
                    .controlSize(.large)
                }
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
