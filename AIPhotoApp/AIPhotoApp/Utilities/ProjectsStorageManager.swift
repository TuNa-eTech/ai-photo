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
    private let savedRequestIdsKey = "savedRequestIds"
    
    private var cachedProjects: [Project] = []
    private var savedRequestIds: Set<String> = []
    
    private init() {
        // Application Support directory for user data (hidden from Files app)
        let fileManager = FileManager.default
        let applicationSupportPath = fileManager.urls(
            for: .applicationSupportDirectory,
            in: .userDomainMask
        ).first!
        projectsDirectory = applicationSupportPath.appendingPathComponent("Projects")
        
        // Create directory if needed
        try? fileManager.createDirectory(at: projectsDirectory, withIntermediateDirectories: true)
        
        projectsFileURL = projectsDirectory.appendingPathComponent(projectsFileName)
        
        // Load saved request IDs to prevent duplicates
        loadSavedRequestIds()
        
        // Clean up old request IDs
        cleanupOldRequestIds()
        
        // Migrate data from Documents if needed
        migrateFromDocumentsIfNeeded()
        
        // Load existing projects from disk
        reloadProjectsFromDisk()
    }
    
    // MARK: - Public Interface
    
    /// Get all saved projects (reloads from disk to ensure data is up-to-date)
    func getAllProjects() -> [Project] {
        // Always reload from disk to ensure we have latest data
        // This fixes issue where projects don't appear after app restart
        reloadProjectsFromDisk()
        return cachedProjects.sorted { $0.createdAt > $1.createdAt }
    }
    
    /// Save a new project with requestId to prevent duplicates
    func saveProject(_ project: Project, with processedImage: UIImage, requestId: String? = nil) throws {
        // Reload from disk first to ensure we have latest data before duplicate check
        reloadProjectsFromDisk()
        
        // Check for duplicate if requestId is provided
        if let requestId = requestId {
            if savedRequestIds.contains(requestId) {
                print("⚠️ ProjectsStorageManager: Project with requestId \(requestId) already saved, skipping duplicate save")
                return
            }
        }
        
        // Check for duplicate by templateId and createdAt (within 5 seconds)
        // This handles cases where requestId might not be available
        let recentProjects = cachedProjects.filter { existingProject in
            existingProject.templateId == project.templateId &&
            abs(existingProject.createdAt.timeIntervalSince(project.createdAt)) < 5.0
        }
        
        if !recentProjects.isEmpty {
            print("⚠️ ProjectsStorageManager: Duplicate project detected (templateId: \(project.templateId), createdAt: \(project.createdAt)), skipping save")
            return
        }
        
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
        
        // Mark requestId as saved to prevent duplicates
        if let requestId = requestId {
            savedRequestIds.insert(requestId)
            saveSavedRequestIds()
        }
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
        
        // Apply file protection for privacy and security
        let fileAttributes: [FileAttributeKey: Any] = [
            .protectionKey: FileProtectionType.completeUntilFirstUserAuthentication
        ]
        try FileManager.default.setAttributes(fileAttributes, ofItemAtPath: imageURL.path)
        
        return imageURL
    }
    
    private func saveProjectImage(projectId: String, imageURL: URL) throws {
        let metadataFile = projectsDirectory.appendingPathComponent("\(projectId)-metadata.json")
        let metadata = ["imagePath": imageURL.path]
        let jsonData = try JSONSerialization.data(withJSONObject: metadata)
        try jsonData.write(to: metadataFile)
        
        // Apply file protection for privacy and security
        let fileAttributes: [FileAttributeKey: Any] = [
            .protectionKey: FileProtectionType.completeUntilFirstUserAuthentication
        ]
        try FileManager.default.setAttributes(fileAttributes, ofItemAtPath: metadataFile.path)
    }
    
    private func deleteProjectImage(projectId: String) throws {
        let imageURL = projectsDirectory.appendingPathComponent("\(projectId).jpg")
        let metadataURL = projectsDirectory.appendingPathComponent("\(projectId)-metadata.json")
        
        try? FileManager.default.removeItem(at: imageURL)
        try? FileManager.default.removeItem(at: metadataURL)
    }
    
    /// Load projects from disk (private method)
    private func loadProjects() {
        reloadProjectsFromDisk()
    }
    
    /// Reload projects from disk (public method to force reload)
    func reloadProjectsFromDisk() {
        guard FileManager.default.fileExists(atPath: projectsFileURL.path) else {
            // File doesn't exist yet (first run), set empty array
            cachedProjects = []
            return
        }
        
        guard let data = try? Data(contentsOf: projectsFileURL) else {
            print("⚠️ ProjectsStorageManager: Failed to read projects.json from disk")
            cachedProjects = []
            return
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        guard let projects = try? decoder.decode([Project].self, from: data) else {
            print("⚠️ ProjectsStorageManager: Failed to decode projects.json - file may be corrupted")
            // Don't clear cache if decode fails - keep existing cache as fallback
            // cachedProjects = [] // Commented out to preserve existing data
            return
        }
        
        cachedProjects = projects
        print("✅ ProjectsStorageManager: Reloaded \(projects.count) projects from disk")
    }
    
    /// Load saved request IDs from UserDefaults
    private func loadSavedRequestIds() {
        if let requestIds = UserDefaults.standard.array(forKey: savedRequestIdsKey) as? [String] {
            savedRequestIds = Set(requestIds)
        } else {
            savedRequestIds = []
        }
    }
    
    /// Save request IDs to UserDefaults
    private func saveSavedRequestIds() {
        UserDefaults.standard.set(Array(savedRequestIds), forKey: savedRequestIdsKey)
    }
    
    /// Clean up old request IDs (older than 7 days)
    private func cleanupOldRequestIds() {
        // Request IDs are stored as strings, we'll keep them for 7 days
        // This is a simple implementation - in production, you might want to add timestamps
        // For now, we'll just limit the size to prevent unbounded growth
        if savedRequestIds.count > 1000 {
            // Keep only the most recent 500 request IDs
            let requestIdsArray = Array(savedRequestIds.prefix(500))
            savedRequestIds = Set(requestIdsArray)
            saveSavedRequestIds()
        }
    }
    
    private func saveProjectsToDisk() throws {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        let data = try encoder.encode(cachedProjects)
        try data.write(to: projectsFileURL)
        
        // Apply file protection for privacy and security
        let fileAttributes: [FileAttributeKey: Any] = [
            .protectionKey: FileProtectionType.completeUntilFirstUserAuthentication
        ]
        try FileManager.default.setAttributes(fileAttributes, ofItemAtPath: projectsFileURL.path)
    }
    
    // MARK: - Migration
    
    /// Migrate projects data from Documents directory to Application Support directory
    private func migrateFromDocumentsIfNeeded() {
        let fileManager = FileManager.default
        
        // Get old Documents directory path
        guard let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return
        }
        let oldProjectsDirectory = documentsPath.appendingPathComponent("Projects")
        
        // Check if old directory exists
        guard fileManager.fileExists(atPath: oldProjectsDirectory.path) else {
            // No old data to migrate
            return
        }
        
        // Check if new directory already has data (avoid overwriting)
        let newProjectsFile = projectsFileURL
        if fileManager.fileExists(atPath: newProjectsFile.path) {
            // New location already has data, skip migration
            print("⚠️ ProjectsStorageManager: Application Support already has projects, skipping migration")
            return
        }
        
        do {
            // Copy projects.json
            let oldProjectsFile = oldProjectsDirectory.appendingPathComponent(projectsFileName)
            if fileManager.fileExists(atPath: oldProjectsFile.path) {
                try fileManager.copyItem(at: oldProjectsFile, to: newProjectsFile)
                print("✅ ProjectsStorageManager: Migrated projects.json from Documents to Application Support")
            }
            
            // Copy all image files and metadata files
            let contents = try fileManager.contentsOfDirectory(at: oldProjectsDirectory, includingPropertiesForKeys: nil)
            for item in contents {
                let fileName = item.lastPathComponent
                // Skip projects.json (already copied)
                if fileName == projectsFileName {
                    continue
                }
                
                // Copy image files (.jpg) and metadata files (-metadata.json)
                if fileName.hasSuffix(".jpg") || fileName.hasSuffix("-metadata.json") {
                    let destinationURL = projectsDirectory.appendingPathComponent(fileName)
                    try fileManager.copyItem(at: item, to: destinationURL)
                    print("✅ ProjectsStorageManager: Migrated \(fileName) from Documents to Application Support")
                }
            }
            
            // Apply file protection to migrated files
            let migratedContents = try fileManager.contentsOfDirectory(at: projectsDirectory, includingPropertiesForKeys: nil)
            let fileAttributes: [FileAttributeKey: Any] = [
                .protectionKey: FileProtectionType.completeUntilFirstUserAuthentication
            ]
            for item in migratedContents {
                try fileManager.setAttributes(fileAttributes, ofItemAtPath: item.path)
            }
            
            // Reload projects after migration to update cache
            reloadProjectsFromDisk()
            
            // Remove old directory after successful migration
            // IMPORTANT: Only remove after confirming migration succeeded
            // This prevents data loss if migration partially fails
            if fileManager.fileExists(atPath: newProjectsFile.path) {
                // Verify migration succeeded by checking if projects file exists
                try fileManager.removeItem(at: oldProjectsDirectory)
                print("✅ ProjectsStorageManager: Migration completed successfully, removed old Documents/Projects directory")
            } else {
                print("⚠️ ProjectsStorageManager: Migration verification failed, keeping old directory")
            }
            
        } catch {
            // Log error but don't crash - app can continue with new location
            // IMPORTANT: Don't remove old directory if migration fails
            print("⚠️ ProjectsStorageManager: Migration failed: \(error.localizedDescription)")
            print("⚠️ ProjectsStorageManager: App will continue with Application Support directory")
            print("⚠️ ProjectsStorageManager: Old data still exists in Documents/Projects (safe fallback)")
        }
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

