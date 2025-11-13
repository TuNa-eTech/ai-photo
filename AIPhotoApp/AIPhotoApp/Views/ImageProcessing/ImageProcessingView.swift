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
     @State private var navigateToInsufficientCredits = false
     @State private var hasReturnedWithInsufficientCredits = false
     @State private var shouldSkipInitialProcess = false
     @State private var creditsBeforeInsufficientError = 0
     @Environment(\.dismiss) private var dismiss
     
     // ResultView navigation
     @State private var showResultView = false
     @State private var resultProject: Project?
    
    var body: some View {
         Group {
             if let viewModel = viewModel {
                 NavigationStack {
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
                     
                     // Navigate to ResultView on successful completion
                     .navigationDestination(isPresented: $showResultView) {
                         if let project = resultProject {
                             ResultView(project: project, originalImage: image)
                                 .toolbar(.hidden, for: .tabBar)
                         }
                     }
                     
                     // Navigate to InsufficientCreditsView on insufficient credits error
                     .navigationDestination(isPresented: $navigateToInsufficientCredits) {
                         InsufficientCreditsView()
                             .environment(authViewModel)
                     }
                 }
                 .task {
                      await creditsViewModel.refreshCreditsBalance()
                      // Skip initial process if returning from InsufficientCreditsView with 0 credits
                      if !shouldSkipInitialProcess {
                          await viewModel.processImage(template: template, image: image)
                      }
                  }
                 .onChange(of: viewModel.processingState) { oldValue, newValue in
                      // Only navigate to ResultView on successful completion
                      if case .completed(let project) = newValue {
                          Task { @MainActor in
                              UIImpactFeedbackGenerator(style: .light).impactOccurred()
                              // Refresh credits after completion
                              await creditsViewModel.refreshCreditsBalance()
                              // Prepare ResultView and navigate
                              try? await Task.sleep(for: .milliseconds(50))
                              resultProject = project
                              showResultView = true
                              // Navigation will happen automatically via NavigationLink
                          }
                      }
                      // Check for insufficient credits error
                      if case .failed(let error) = newValue,
                         case .insufficientCredits = error {
                          creditsBeforeInsufficientError = creditsViewModel.creditsBalance
                          hasReturnedWithInsufficientCredits = true
                          navigateToInsufficientCredits = true
                      }
                  }
                 .onChange(of: navigateToInsufficientCredits) { oldValue, newValue in
                     // When dismissing InsufficientCreditsView (back button)
                     if !newValue && hasReturnedWithInsufficientCredits {
                         // Only skip if credits are still the same (no purchase/ad)
                         if creditsViewModel.creditsBalance == creditsBeforeInsufficientError {
                             shouldSkipInitialProcess = true
                         } else {
                             // Credits increased (purchased or watched ad), will auto-retry via notification
                             shouldSkipInitialProcess = false
                         }
                         hasReturnedWithInsufficientCredits = false
                     }
                 }
                 .onReceive(NotificationCenter.default.publisher(for: .creditsBalanceUpdated)) { _ in
                     // Auto-refresh balance when updated from rewarded ad or purchase,
                     // and automatically retry if the previous failure was insufficient credits.
                     Task { @MainActor in
                         await creditsViewModel.refreshCreditsBalance()
                         if case .failed(let error) = viewModel.processingState,
                            case .insufficientCredits = error,
                            creditsViewModel.creditsBalance > 0 {
                             await viewModel.processImage(template: template, image: image)
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
                Text(L10n.tr("l10n.credits.title"))
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
    
    private func processingMessage(viewModel: ImageProcessingViewModel) -> String {
        switch viewModel.processingState {
        case .idle:
            return L10n.tr("l10n.processing.msg.idle")
        case .preparing:
            return L10n.tr("l10n.processing.msg.preparing")
        case .uploading:
            return L10n.tr("l10n.processing.msg.uploading")
        case .processing:
            return L10n.tr("l10n.processing.msg.processing", template.name)
        case .processingInBackground:
            return L10n.tr("l10n.processing.msg.background")
        case .completed:
            return L10n.tr("l10n.processing.msg.completed")
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
                // Show "Get Credits" button for insufficient credits error
                if case .insufficientCredits = error {
                    Button(L10n.tr("l10n.credits.get")) {
                        navigateToInsufficientCredits = true
                    }
                    .buttonStyle(GlassCTAButtonStyle())
                    .controlSize(.large)
                } else {
                    // Show "Retry" button for other errors
                    Button(L10n.tr("l10n.common.retryVerb")) {
                        Task {
                            await viewModel.processImage(template: template, image: image)
                        }
                    }
                    .buttonStyle(GlassCTAButtonStyle())
                    .controlSize(.large)
                }
            }
            
            Button(L10n.tr("l10n.common.cancel")) {
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
