//
//  ProjectsStorageManager.swift
//  AIPhotoApp
//
//  Local storage manager for user projects
//

import Foundation
import UIKit

final class ProjectsStorageManager {
    static let shared = ProjectsStorageManager()
    
    private let projectsDirectory: URL
    private let projectsFileName = "projects.json"
    private let projectsFileURL: URL
    
    private var cachedProjects: [Project] = []
    
    private init() {
        // Documents directory for user data
        let fileManager = FileManager.default
        let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
        projectsDirectory = documentsPath.appendingPathComponent("Projects")
        
        // Create directory if needed
        try? fileManager.createDirectory(at: projectsDirectory, withIntermediateDirectories: true)
        
        projectsFileURL = projectsDirectory.appendingPathComponent(projectsFileName)
        
        // Load existing projects
        loadProjects()
    }
    
    // MARK: - Public Interface
    
    /// Get all saved projects
    func getAllProjects() -> [Project] {
        return cachedProjects.sorted { $0.createdAt > $1.createdAt }
    }
    
    /// Save a new project
    func saveProject(_ project: Project, with processedImage: UIImage) throws {
        // Save image
        let imageURL = try saveProcessedImage(processedImage, projectId: project.id.uuidString)
        
        // Update project with image URL
        var updatedProject = project
        // Note: Project doesn't have imagePath property, we'll store it separately
        
        // Add to cache
        cachedProjects.append(updatedProject)
        
        // Save to disk
        try saveProjectsToDisk()
        
        // Save image metadata separately
        try saveProjectImage(projectId: project.id.uuidString, imageURL: imageURL)
    }
    
    /// Delete a project
    func deleteProject(_ project: Project) throws {
        // Remove from cache
        cachedProjects.removeAll { $0.id == project.id }
        
        // Delete image file
        try? deleteProjectImage(projectId: project.id.uuidString)
        
        // Save to disk
        try saveProjectsToDisk()
    }
    
    /// Get processed image for project
    func getProjectImage(projectId: String) -> UIImage? {
        let imageURL = projectsDirectory.appendingPathComponent("\(projectId).jpg")
        
        guard let data = try? Data(contentsOf: imageURL),
              let image = UIImage(data: data) else {
            return nil
        }
        
        return image
    }
    
    // MARK: - Private Helpers
    
    private func saveProcessedImage(_ image: UIImage, projectId: String) throws -> URL {
        guard let imageData = image.jpegData(compressionQuality: 0.9) else {
            throw StorageError.imageEncodingFailed
        }
        
        let imageURL = projectsDirectory.appendingPathComponent("\(projectId).jpg")
        try imageData.write(to: imageURL)
        
        return imageURL
    }
    
    private func saveProjectImage(projectId: String, imageURL: URL) throws {
        let metadataFile = projectsDirectory.appendingPathComponent("\(projectId)-metadata.json")
        let metadata = ["imagePath": imageURL.path]
        let jsonData = try JSONSerialization.data(withJSONObject: metadata)
        try jsonData.write(to: metadataFile)
    }
    
    private func deleteProjectImage(projectId: String) throws {
        let imageURL = projectsDirectory.appendingPathComponent("\(projectId).jpg")
        let metadataURL = projectsDirectory.appendingPathComponent("\(projectId)-metadata.json")
        
        try? FileManager.default.removeItem(at: imageURL)
        try? FileManager.default.removeItem(at: metadataURL)
    }
    
    private func loadProjects() {
        guard let data = try? Data(contentsOf: projectsFileURL),
              let projects = try? JSONDecoder().decode([Project].self, from: data) else {
            cachedProjects = []
            return
        }
        
        cachedProjects = projects
    }
    
    private func saveProjectsToDisk() throws {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        let data = try encoder.encode(cachedProjects)
        try data.write(to: projectsFileURL)
    }
}

// MARK: - Error Types

enum StorageError: LocalizedError {
    case imageEncodingFailed
    case saveFailed
    case loadFailed
    
    var errorDescription: String? {
        switch self {
        case .imageEncodingFailed:
            return "Failed to encode image"
        case .saveFailed:
            return "Failed to save project"
        case .loadFailed:
            return "Failed to load projects"
        }
    }
}

