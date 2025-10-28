//
//  ImageProcessingView.swift
//  AIPhotoApp
//
//  UI for processing images with templates
//

import SwiftUI

struct ImageProcessingView: View {
    let template: TemplateDTO
    let image: UIImage
    
    @State private var viewModel: ImageProcessingViewModel
    @Environment(\.dismiss) private var dismiss
    
    init(template: TemplateDTO, image: UIImage, authViewModel: AuthViewModel) {
        self.template = template
        self.image = image
        self._viewModel = State(initialValue: ImageProcessingViewModel(authViewModel: authViewModel))
    }
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 32) {
                // Processing animation
                processingAnimation
                
                // Status text
                statusText
                
                // Progress bar
                progressBar
                
                // Action buttons
                actionButtons
            }
            .padding(24)
        }
        .task {
            await viewModel.processImage(template: template, image: image)
        }
        .onChange(of: viewModel.processingState) { oldValue, newValue in
            if case .completed = newValue {
                // Small delay before dismissing
                Task {
                    try? await Task.sleep(for: .seconds(1))
                    dismiss()
                }
            }
        }
    }
    
    // MARK: - Views
    
    private var processingAnimation: some View {
        ZStack {
            // Background circle
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color.blue.opacity(0.3),
                            Color.purple.opacity(0.1)
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: 120
                    )
                )
                .frame(width: 240, height: 240)
            
            // Processing icon
            Image(systemName: imageProcessingIcon)
                .font(.system(size: 80))
                .foregroundStyle(
                    LinearGradient(
                        colors: [.blue, .purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .symbolEffect(.pulse, options: .repeating.speed(1.5))
        }
    }
    
    private var imageProcessingIcon: String {
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
    
    private var statusText: some View {
        VStack(spacing: 8) {
            Text(processingTitle)
                .font(.title2.bold())
                .foregroundStyle(.white)
            
            Text(processingMessage)
                .font(.subheadline)
                .foregroundStyle(.gray)
                .multilineTextAlignment(.center)
        }
    }
    
    private var processingTitle: String {
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
    
    private var processingMessage: String {
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
    
    private var progressBar: some View {
        VStack(spacing: 12) {
            ProgressView(value: viewModel.progress)
                .progressViewStyle(.linear)
                .tint(.blue)
            
            Text("\(Int(viewModel.progress * 100))%")
                .font(.caption)
                .foregroundStyle(.gray)
        }
        .opacity(viewModel.processingState.canShowProgress ? 1 : 0)
    }
    
    private var actionButtons: some View {
        VStack(spacing: 12) {
            if case .failed = viewModel.processingState {
                Button("Retry") {
                    Task {
                        await viewModel.processImage(template: template, image: image)
                    }
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
            
            Button("Cancel") {
                dismiss()
            }
            .buttonStyle(.bordered)
            .foregroundStyle(.white)
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

