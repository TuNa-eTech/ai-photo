//
//  ImageProcessingViewModel.swift
//  AIPhotoApp
//
//  ViewModel for image processing flow
//

import SwiftUI
import Observation
import FirebaseAuth

@Observable
final class ImageProcessingViewModel {
    // MARK: - State
    var processingState: ProcessingState = .idle
    var currentRequestId: String?
    var progress: Double = 0.0
    var error: Error?
    
    // Processing details
    var currentTemplate: TemplateDTO?
    var currentImage: UIImage?
    
    enum ProcessingState: Equatable {
        case idle
        case preparing
        case uploading
        case processing
        case processingInBackground
        case completed(Project)
        case failed(ProcessingError)
        
        static func == (lhs: ProcessingState, rhs: ProcessingState) -> Bool {
            switch (lhs, rhs) {
            case (.idle, .idle),
                 (.preparing, .preparing),
                 (.uploading, .uploading),
                 (.processing, .processing),
                 (.processingInBackground, .processingInBackground):
                return true
            case (.completed(let lhsProject), .completed(let rhsProject)):
                return lhsProject.id == rhsProject.id
            case (.failed(let lhsError), .failed(let rhsError)):
                return lhsError.localizedDescription == rhsError.localizedDescription
            default:
                return false
            }
        }
    }
    
    private let processor = BackgroundImageProcessor.shared
    private let authViewModel: AuthViewModel
    
    init(authViewModel: AuthViewModel) {
        self.authViewModel = authViewModel
        
        // Listen for background completion
        NotificationCenter.default.addObserver(
            forName: .imageProcessingCompleted,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            self?.handleProcessingCompleted(notification)
        }
        
        NotificationCenter.default.addObserver(
            forName: .imageProcessingFailed,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            self?.handleProcessingFailed(notification)
        }
        
        // Check for pending tasks
        checkPendingTasks()
    }
    
    // MARK: - Public Interface
    
    func processImage(template: TemplateDTO, image: UIImage) async {
        let templateId = template.id
        processingState = .preparing
        
        // Compress image
        guard let compressed = image.compressForUpload() else {
            processingState = .failed(ProcessingError.imageSaveFailed)
            return
        }
        let imageBase64 = compressed.base64EncodedString()
        
        processingState = .uploading
        progress = 0.1
        
        // Get auth token from Firebase Auth
        guard let userId = Auth.auth().currentUser,
              let token = try? await userId.getIDToken() else {
            processingState = .failed(ProcessingError.networkError)
            return
        }
        
        do {
            // Start background processing
            let requestId = try await processor.processImage(
                templateId: templateId,
                templateName: template.name,
                originalImage: image,
                imageBase64: "data:image/jpeg;base64,\(imageBase64)",
                token: token
            )
            
            currentRequestId = requestId
            currentTemplate = template
            currentImage = image
            processingState = .processing
            progress = 0.3
            
            // Start progress animation
            animateProgress()
            
        } catch {
            // Convert to ProcessingError
            if let processingError = error as? ProcessingError {
                processingState = .failed(processingError)
            } else {
                processingState = .failed(ProcessingError.networkError)
            }
        }
    }
    
    // MARK: - Private Helpers
    
    private func animateProgress() {
        Task { @MainActor in
            // Simulate progress for better UX
            while progress < 0.9 {
                try? await Task.sleep(for: .milliseconds(500))
                progress = min(0.9, progress + 0.05)
                
                // Stop if not processing anymore
                if !isProcessing {
                    return
                }
            }
        }
    }
    
    private var isProcessing: Bool {
        if case .processing = processingState { return true }
        if case .processingInBackground = processingState { return true }
        return false
    }
    
    private func checkPendingTasks() {
        // Check UserDefaults for pending tasks from previous session
        // If exists, show processingInBackground state
        let pendingTasks = UserDefaults.standard.array(forKey: "pendingTasks") as? [String] ?? []
        
        if !pendingTasks.isEmpty {
            processingState = .processingInBackground
        }
    }
    
    private func handleProcessingCompleted(_ notification: Notification) {
        guard let requestId = notification.userInfo?["requestId"] as? String,
              requestId == currentRequestId,
              let project = notification.userInfo?["project"] as? Project else {
            return
        }
        
        progress = 1.0
        processingState = .completed(project)
    }
    
    private func handleProcessingFailed(_ notification: Notification) {
        guard let requestId = notification.userInfo?["requestId"] as? String,
              requestId == currentRequestId,
              let error = notification.userInfo?["error"] as? ProcessingError else {
            return
        }
        
        processingState = .failed(error)
    }
    
    // MARK: - Reset
    
    func reset() {
        processingState = .idle
        currentRequestId = nil
        progress = 0.0
        error = nil
        currentTemplate = nil
        currentImage = nil
    }
}

