//
//  BackgroundImageProcessor.swift
//  AIPhotoApp
//
//  Background URLSession processor for long-running image processing requests
//

import Foundation
import UIKit
import UserNotifications

fileprivate func stripDataURLPrefix(_ s: String) -> String {
    if let range = s.range(of: "base64,") {
        return String(s[range.upperBound...])
    }
    return s
}

// MARK: - Protocol

protocol BackgroundImageProcessorProtocol {
    func processImage(
        templateId: String,
        templateName: String,
        originalImage: UIImage,
        imageBase64: String,
        token: String
    ) async throws -> String
}

// MARK: - Implementation

/// Processes images in the background using URLSession configuration
/// Allows processing to continue even when app is killed or backgrounded
final class BackgroundImageProcessor: NSObject, BackgroundImageProcessorProtocol {
    static let shared = BackgroundImageProcessor()
    
    var session: URLSession!
    private let sessionIdentifier = "com.aiimagestylist.processing"
    
    // Store pending tasks info (in-memory cache)
    private var pendingTasks: [String: PendingTaskInfo] = [:]
    private let tasksQueue = DispatchQueue(label: "com.aiimagestylist.tasks")
    private let pendingTasksKey = "pendingImageProcessingTasks"
    
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
        
        // Restore pending tasks from UserDefaults (persist across app restarts)
        restorePendingTasks()
        
        // Clean up old pending tasks (older than 24 hours)
        cleanupOldPendingTasks()
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
            let taskInfo = PendingTaskInfo(
                requestId: requestId,
                templateId: templateId,
                originalImagePath: originalImagePath,
                templateName: templateName,
                createdAt: Date()
            )
            pendingTasks[requestId] = taskInfo
            
            // Persist to UserDefaults for app restart recovery
            persistPendingTasks()
        }
    }
    
    private func getPendingTask(requestId: String) -> PendingTaskInfo? {
        return tasksQueue.sync {
            // First check in-memory cache
            if let task = pendingTasks[requestId] {
                return task
            }
            
            // If not in cache, try to restore from UserDefaults
            restorePendingTasks()
            return pendingTasks[requestId]
        }
    }
    
    private func clearPendingTask(requestId: String) {
        tasksQueue.sync {
            pendingTasks.removeValue(forKey: requestId)
            // Update UserDefaults after clearing
            persistPendingTasks()
        }
    }
    
    /// Persist pending tasks to UserDefaults
    private func persistPendingTasks() {
        var tasksDict: [String: [String: Any]] = [:]
        
        for (requestId, taskInfo) in pendingTasks {
            tasksDict[requestId] = [
                "requestId": taskInfo.requestId,
                "templateId": taskInfo.templateId,
                "templateName": taskInfo.templateName,
                "originalImagePath": taskInfo.originalImagePath.path,
                "createdAt": taskInfo.createdAt.timeIntervalSince1970
            ]
        }
        
        UserDefaults.standard.set(tasksDict, forKey: pendingTasksKey)
    }
    
    /// Restore pending tasks from UserDefaults
    private func restorePendingTasks() {
        guard let tasksDict = UserDefaults.standard.dictionary(forKey: pendingTasksKey) as? [String: [String: Any]] else {
            return
        }
        
        for (requestId, taskData) in tasksDict {
            guard let templateId = taskData["templateId"] as? String,
                  let templateName = taskData["templateName"] as? String,
                  let imagePathString = taskData["originalImagePath"] as? String,
                  let createdAtTimestamp = taskData["createdAt"] as? TimeInterval else {
                continue
            }
            
            let imagePath = URL(fileURLWithPath: imagePathString)
            let createdAt = Date(timeIntervalSince1970: createdAtTimestamp)
            
            // Only restore if file still exists and task is not too old (24 hours)
            let maxAge: TimeInterval = 24 * 60 * 60
            if FileManager.default.fileExists(atPath: imagePath.path) &&
               Date().timeIntervalSince(createdAt) < maxAge {
                pendingTasks[requestId] = PendingTaskInfo(
                    requestId: requestId,
                    templateId: templateId,
                    originalImagePath: imagePath,
                    templateName: templateName,
                    createdAt: createdAt
                )
            } else {
                // Remove invalid/old task
                var updatedDict = tasksDict
                updatedDict.removeValue(forKey: requestId)
                UserDefaults.standard.set(updatedDict, forKey: pendingTasksKey)
            }
        }
    }
    
    /// Clean up old pending tasks (older than 24 hours)
    private func cleanupOldPendingTasks() {
        let maxAge: TimeInterval = 24 * 60 * 60
        let now = Date()
        
        tasksQueue.sync {
            var hasChanges = false
            
            for (requestId, taskInfo) in pendingTasks {
                if now.timeIntervalSince(taskInfo.createdAt) > maxAge {
                    // Remove old task
                    pendingTasks.removeValue(forKey: requestId)
                    hasChanges = true
                    
                    // Clean up temp file
                    try? FileManager.default.removeItem(at: taskInfo.originalImagePath)
                }
            }
            
            if hasChanges {
                persistPendingTasks()
            }
        }
    }
    
    // MARK: - Notifications
    
    private func notifyCompletion(requestId: String, project: Project) {
        DispatchQueue.main.async {
            NotificationCenter.default.post(
                name: .imageProcessingCompleted,
                object: nil,
                userInfo: ["requestId": requestId, "project": project]
            )
        }
    }
    
    private func notifyError(requestId: String, error: Error) {
        DispatchQueue.main.async {
            NotificationCenter.default.post(
                name: .imageProcessingFailed,
                object: nil,
                userInfo: ["requestId": requestId, "error": error]
            )
        }
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
        
        // Validate HTTP status code and log server payload if non-2xx
        if let http = downloadTask.response as? HTTPURLResponse {
            let code = http.statusCode
            if !(200...299).contains(code) {
                let data = try? Data(contentsOf: location)
                let snippet = data.flatMap { String(data: $0, encoding: .utf8) } ?? "<binary>"
                print("❌ HTTP \\(code) from process endpoint: \\(snippet)")
                notifyError(requestId: requestId, error: ProcessingError.invalidResponse)
                return
            }
        }
        
        do {
            // Read response data (tolerant decode: envelope or direct payload)
            let data = try Data(contentsOf: location)
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            var payload: ProcessImageResponse
            if let env = try? decoder.decode(ProcessImageEnvelopeResponse.self, from: data),
               let d = env.data {
                payload = d
            } else if let direct = try? decoder.decode(ProcessImageResponse.self, from: data) {
                payload = direct
            } else if
                let jsonObj = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
            {
                // Fallback: extract from plain JSON
                func buildMeta(from meta: [String: Any]) -> ProcessImageResponse.ProcessImageMetadata {
                    let dims = (meta["processed_dimensions"] as? [String: Any]) ?? [:]
                    return .init(
                        templateId: meta["template_id"] as? String ?? "",
                        templateName: meta["template_name"] as? String ?? "",
                        modelUsed: meta["model_used"] as? String ?? "",
                        generationTimeMs: meta["generation_time_ms"] as? Int ?? 0,
                        processedDimensions: .init(
                            width: dims["width"] as? Int ?? 0,
                            height: dims["height"] as? Int ?? 0
                        )
                    )
                }
                
                if let b64 = jsonObj["processed_image_base64"] as? String,
                   let meta = jsonObj["metadata"] as? [String: Any]
                {
                    payload = .init(processedImageBase64: b64, metadata: buildMeta(from: meta))
                } else if
                    let dataDict = jsonObj["data"] as? [String: Any],
                    let b64 = dataDict["processed_image_base64"] as? String,
                    let meta = dataDict["metadata"] as? [String: Any]
                {
                    payload = .init(processedImageBase64: b64, metadata: buildMeta(from: meta))
                } else {
                    print("❌ Response decode failed (json keys missing): \(jsonObj)")
                    throw ProcessingError.invalidResponse
                }
            } else {
                print("❌ Response decode failed: \(String(data: data, encoding: .utf8) ?? "<binary>")")
                throw ProcessingError.invalidResponse
            }
            
            // Get original image
            guard let taskInfo = getPendingTask(requestId: requestId),
                  let originalImage = loadOriginalImage(from: taskInfo.originalImagePath) else {
                print("❌ Failed to load original image")
                return
            }
            
            // Decode processed image
            let base64String = stripDataURLPrefix(payload.processedImageBase64)
            
            guard let imageData = Data(base64Encoded: base64String),
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
            
            // Persist processed image and project (with requestId to prevent duplicates)
            // saveProject will automatically skip if duplicate (by requestId or templateId+createdAt)
            do {
                try ProjectsStorageManager.shared.saveProject(project, with: processedImage, requestId: requestId)
                print("✅ ProjectsStorageManager: Saved project with requestId \(requestId)")
            } catch {
                print("❌ Failed to save project: \(error)")
                clearPendingTask(requestId: requestId)
                notifyError(requestId: requestId, error: error)
                return
            }
            
            // Clean up pending task (project is saved or was duplicate - both are OK)
            clearPendingTask(requestId: requestId)
            
            // Reload projects to get the actual saved project
            // If it was duplicate, find the existing project; otherwise use the one we just saved
            ProjectsStorageManager.shared.reloadProjectsFromDisk()
            let allProjects = ProjectsStorageManager.shared.getAllProjects()
            
            // Find the project: look for most recent project with same templateId
            // This handles both cases: newly saved project or existing duplicate
            let savedProject = allProjects
                .filter { $0.templateId == project.templateId }
                .sorted { $0.createdAt > $1.createdAt }
                .first ?? project // Fallback to the project we created if not found
            
            // Notify app (on main thread inside method)
            notifyCompletion(requestId: requestId, project: savedProject)
            
            // Show notification if app in background (must check on main thread)
            DispatchQueue.main.async { [weak self] in
                if UIApplication.shared.applicationState != .active {
                    self?.showLocalNotification(templateName: taskInfo.templateName)
                }
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
