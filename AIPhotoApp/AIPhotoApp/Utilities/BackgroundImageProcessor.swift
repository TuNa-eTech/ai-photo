//
//  BackgroundImageProcessor.swift
//  AIPhotoApp
//
//  Background URLSession processor for long-running image processing requests
//

import Foundation
import UIKit
import UserNotifications

/// Processes images in the background using URLSession configuration
/// Allows processing to continue even when app is killed or backgrounded
final class BackgroundImageProcessor: NSObject {
    static let shared = BackgroundImageProcessor()
    
    var session: URLSession!
    private let sessionIdentifier = "com.aiimagestylist.processing"
    
    // Store pending tasks info
    private var pendingTasks: [String: PendingTaskInfo] = [:]
    private let tasksQueue = DispatchQueue(label: "com.aiimagestylist.tasks")
    
    struct PendingTaskInfo {
        let requestId: String
        let templateId: String
        let originalImagePath: URL
        let templateName: String
        let createdAt: Date
    }
    
    override init() {
        super.init()
        
        // Configure background session
        let config = URLSessionConfiguration.background(withIdentifier: sessionIdentifier)
        config.isDiscretionary = false
        config.sessionSendsLaunchEvents = true
        config.timeoutIntervalForRequest = 60
        config.timeoutIntervalForResource = 300
        config.httpMaximumConnectionsPerHost = 1
        
        // Create session with delegate
        session = URLSession(
            configuration: config,
            delegate: self,
            delegateQueue: nil
        )
    }
    
    // MARK: - Public Interface
    
    /// Start processing an image with background support
    func processImage(
        templateId: String,
        templateName: String,
        originalImage: UIImage,
        imageBase64: String,
        token: String
    ) async throws -> String {
        // Generate unique request ID
        let requestId = UUID().uuidString
        
        // Save original image to temporary file
        guard let imagePath = try saveOriginalImage(originalImage, requestId: requestId) else {
            throw ProcessingError.imageSaveFailed
        }
        
        // Build request
        var request = URLRequest(url: URL(string: "\(AppConfig.baseURL)\(AppConfig.APIPath.processImage)")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(requestId, forHTTPHeaderField: "X-Request-ID")
        
        let body: [String: Any] = [
            "template_id": templateId,
            "image_base64": imageBase64
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        // Store pending task info
        savePendingTask(
            requestId: requestId,
            templateId: templateId,
            templateName: templateName,
            originalImagePath: imagePath
        )
        
        // Create background download task
        let task = session.downloadTask(with: request)
        task.taskDescription = requestId
        task.resume()
        
        return requestId
    }
    
    // MARK: - Private Helpers
    
    private func saveOriginalImage(_ image: UIImage, requestId: String) throws -> URL? {
        let tempDir = FileManager.default.temporaryDirectory
        let imageFile = tempDir.appendingPathComponent("\(requestId)-original.jpg")
        
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            return nil
        }
        
        try? imageData.write(to: imageFile)
        return imageFile
    }
    
    private func savePendingTask(
        requestId: String,
        templateId: String,
        templateName: String,
        originalImagePath: URL
    ) {
        tasksQueue.sync {
            pendingTasks[requestId] = PendingTaskInfo(
                requestId: requestId,
                templateId: templateId,
                originalImagePath: originalImagePath,
                templateName: templateName,
                createdAt: Date()
            )
        }
    }
    
    private func getPendingTask(requestId: String) -> PendingTaskInfo? {
        return tasksQueue.sync {
            return pendingTasks[requestId]
        }
    }
    
    private func clearPendingTask(requestId: String) {
        tasksQueue.sync {
            pendingTasks.removeValue(forKey: requestId)
        }
    }
    
    // MARK: - Notifications
    
    private func notifyCompletion(requestId: String, project: Project) {
        NotificationCenter.default.post(
            name: .imageProcessingCompleted,
            object: nil,
            userInfo: ["requestId": requestId, "project": project]
        )
    }
    
    private func notifyError(requestId: String, error: Error) {
        NotificationCenter.default.post(
            name: .imageProcessingFailed,
            object: nil,
            userInfo: ["requestId": requestId, "error": error]
        )
    }
    
    private func showLocalNotification(templateName: String) {
        NotificationManager.shared.notifyProcessingComplete(templateName: templateName)
    }
}

// MARK: - URLSession Delegate

extension BackgroundImageProcessor: URLSessionDelegate, URLSessionDownloadDelegate {
    func urlSession(
        _ session: URLSession,
        downloadTask: URLSessionDownloadTask,
        didFinishDownloadingTo location: URL
    ) {
        guard let requestId = downloadTask.taskDescription else { return }
        
        do {
            // Read response data
            let data = try Data(contentsOf: location)
            let decoder = JSONDecoder()
            let envelopeResponse = try decoder.decode(ProcessImageEnvelopeResponse.self, from: data)
            
            guard let imageData = envelopeResponse.data else {
                throw ProcessingError.invalidResponse
            }
            
            // Get original image
            guard let taskInfo = getPendingTask(requestId: requestId),
                  let originalImage = loadOriginalImage(from: taskInfo.originalImagePath) else {
                print("❌ Failed to load original image")
                return
            }
            
            // Decode processed image
            let base64 = imageData.processedImageBase64
                .replacingOccurrences(of: "data:image/jpeg;base64,", with: "")
            
            guard let imageData = Data(base64Encoded: base64),
                  let processedImage = UIImage(data: imageData) else {
                print("❌ Failed to decode processed image")
                return
            }
            
            // Save project
            let project = Project(
                templateId: taskInfo.templateId,
                templateName: taskInfo.templateName,
                thumbnailURL: nil,
                status: .completed
            )
            
            // Clean up pending task
            clearPendingTask(requestId: requestId)
            
            // Notify app
            notifyCompletion(requestId: requestId, project: project)
            
            // Show notification if app in background
            if UIApplication.shared.applicationState != .active {
                showLocalNotification(templateName: taskInfo.templateName)
            }
            
        } catch {
            print("❌ Failed to process response: \(error)")
            notifyError(requestId: requestId, error: error)
        }
    }
    
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        guard let requestId = task.taskDescription, let error = error else { return }
        
        clearPendingTask(requestId: requestId)
        notifyError(requestId: requestId, error: error)
    }
    
    private func loadOriginalImage(from url: URL) -> UIImage? {
        guard let data = try? Data(contentsOf: url),
              let image = UIImage(data: data) else {
            return nil
        }
        return image
    }
}

// MARK: - Error Types

enum ProcessingError: LocalizedError {
    case imageSaveFailed
    case invalidResponse
    case networkError
    case timeout
    
    var errorDescription: String? {
        switch self {
        case .imageSaveFailed:
            return "Failed to save image"
        case .invalidResponse:
            return "Invalid response from server"
        case .networkError:
            return "Network error occurred"
        case .timeout:
            return "Request timed out"
        }
    }
}

// MARK: - Notification Names

extension Notification.Name {
    static let imageProcessingCompleted = Notification.Name("imageProcessingCompleted")
    static let imageProcessingFailed = Notification.Name("imageProcessingFailed")
}

