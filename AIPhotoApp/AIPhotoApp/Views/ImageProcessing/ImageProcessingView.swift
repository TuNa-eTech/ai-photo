//
//  ImageProcessingView.swift
//  AIPhotoApp
//
//  UI for processing images with templates
//

import SwiftUI
import UIKit

struct ImageProcessingView: View {
    // MARK: - Properties
    let template: TemplateDTO
    let image: UIImage

    // MARK: - Environment & State
    @Environment(AuthViewModel.self) private var authViewModel
    @Environment(\.dismiss) private var dismiss
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    @State private var viewModel: ImageProcessingViewModel?
    @State private var creditsViewModel = CreditsViewModel()
    @State private var navigateToInsufficientCredits = false
    @State private var hasReturnedWithInsufficientCredits = false
    @State private var shouldSkipInitialProcess = false
    @State private var creditsBeforeInsufficientError = 0

    // Navigation
    @State private var showResultView = false
    @State private var resultProject: Project?

    // MARK: - Body

    var body: some View {
        Group {
            if let viewModel = viewModel {
                NavigationStack {
                    mainContent(viewModel: viewModel)
                        .navigationDestination(isPresented: $showResultView) {
                            if let project = resultProject {
                                ResultView(project: project, originalImage: image)
                                    .toolbar(.hidden, for: .tabBar)
                            }
                        }
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
                    handleProcessingStateChange(newValue)
                }
                .onChange(of: navigateToInsufficientCredits) { oldValue, newValue in
                    handleCreditsNavigationChange(newValue)
                }
                .onReceive(NotificationCenter.default.publisher(for: .creditsBalanceUpdated)) { _ in
                    handleCreditsBalanceUpdate()
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
            initializeViewModel()
        }
    }

    // MARK: - Main Content

    @ViewBuilder
    private func mainContent(viewModel: ImageProcessingViewModel) -> some View {
        GeometryReader { geometry in
            ScrollView {
                VStack(spacing: 0) {
                    // Main processing card
                    VStack(spacing: 0) {
                        Spacer()

                        ProcessingMainCard(
                            creditsViewModel: creditsViewModel,
                            viewModel: viewModel,
                            template: template,
                            image: image,
                            onGetCredits: {
                                navigateToInsufficientCredits = true
                            },
                            onCancel: {
                                dismiss()
                            }
                        )
                        .readableContainer()
                        .adaptsToDynamicType()

                        Spacer()
                    }
                }
                .frame(minHeight: geometry.size.height)
            }
        }
        .background(GlassBackgroundView())
        .navigationBarHidden(true)
    }

    // MARK: - Private Methods

    private func initializeViewModel() {
        if viewModel == nil {
            viewModel = ImageProcessingViewModel(authViewModel: authViewModel)
        }
    }

    private func handleProcessingStateChange(_ newValue: ImageProcessingViewModel.ProcessingState) {
        // Only navigate to ResultView on successful completion
        if case .completed(let project) = newValue {
            Task { @MainActor in
                #if canImport(UIKit)
                HapticFeedback.light()
                #endif
                // Refresh credits after completion
                await creditsViewModel.refreshCreditsBalance()
                // Prepare ResultView and navigate
                try? await Task.sleep(for: .milliseconds(50))
                resultProject = project
                showResultView = true
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

    private func handleCreditsNavigationChange(_ newValue: Bool) {
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

    private func handleCreditsBalanceUpdate() {
        // Auto-refresh balance when updated from rewarded ad or purchase,
        // and automatically retry if the previous failure was insufficient credits.
        Task { @MainActor in
            await creditsViewModel.refreshCreditsBalance()
            if case .failed(let error) = viewModel?.processingState,
               case .insufficientCredits = error,
               creditsViewModel.creditsBalance > 0 {
                await viewModel?.processImage(template: template, image: image)
            }
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

// MARK: - Preview

#Preview("Image Processing - Processing") {
    NavigationStack {
        // Preview context chỉ để dựng UI, không cần decode JSON phức tạp.
        // Dùng memberwise init của TemplateDTO cho rõ ràng.
        let thumbnail = URL(string: "https://picsum.photos/400/600")
        let publishedAt = Calendar.current.date(
            byAdding: DateComponents(day: -3),
            to: Date()
        )
        let usageCount = 128

        let template = TemplateDTO(
            id: "template-id",
            name: "Magic Portrait",
            thumbnailURL: thumbnail,
            publishedAt: publishedAt,
            usageCount: usageCount
        )

        let uiImage = UIImage(systemName: "person.crop.square")?
            .withTintColor(.black, renderingMode: .alwaysOriginal) ?? UIImage()

        // Mock dependencies for preview
        let mockAuthService = AuthService()
        let mockUserRepository = UserRepository(client: APIClient())
        let authViewModel = AuthViewModel(authService: mockAuthService, userRepository: mockUserRepository)

        ImageProcessingView(template: template, image: uiImage)
            .environment(authViewModel)
    }
}
