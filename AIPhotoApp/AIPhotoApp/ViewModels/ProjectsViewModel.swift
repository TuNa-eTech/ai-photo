//
//  ProjectsViewModel.swift
//  AIPhotoApp
//
//  ViewModel for My Projects screen
//

import Foundation
import Observation
import UIKit

@Observable
final class ProjectsViewModel {
    // MARK: - Dependencies
    private let storageManager: ProjectsStorageManagerProtocol
    
    // MARK: - Outputs (data)
    var projects: [Project] = []
    
    // MARK: - Image Cache
    private var imageCache: [String: UIImage] = [:]
    
    // MARK: - Status
    var isLoading: Bool = false
    var errorMessage: String?
    
    // MARK: - Initialization
    
    init(storageManager: ProjectsStorageManagerProtocol = ProjectsStorageManager.shared) {
        self.storageManager = storageManager
    }
    
    // MARK: - Actions
    
    /// Load all projects from storage
    func loadProjects() {
        isLoading = true
        errorMessage = nil
        
        // Load projects synchronously (local storage is fast)
        projects = storageManager.getAllProjects()
        
        // Preload images for all projects (sync for immediate UI display)
        // Local storage is fast enough for sync loading
        preloadImages()
        
        isLoading = false
    }
    
    /// Get processed image for a project (with caching)
    func getProjectImage(projectId: String) -> UIImage? {
        // Check cache first
        if let cachedImage = imageCache[projectId] {
            return cachedImage
        }
        
        // Load from storage and cache (lazy loading)
        // This handles cases where preload hasn't finished yet
        if let image = storageManager.getProjectImage(projectId: projectId) {
            imageCache[projectId] = image
            return image
        }
        
        return nil
    }
    
    /// Preload images for all projects (synchronous for immediate cache)
    private func preloadImages() {
        // Clear cache when reloading projects
        imageCache.removeAll()
        
        // Preload images synchronously (local storage is fast)
        // This ensures images are cached before UI renders
        for project in projects {
            let projectId = project.id.uuidString
            if let image = storageManager.getProjectImage(projectId: projectId) {
                imageCache[projectId] = image
            }
        }
    }
    
    /// Delete a project
    func deleteProject(_ project: Project) throws {
        do {
            try storageManager.deleteProject(project)
            // Remove from cache
            imageCache.removeValue(forKey: project.id.uuidString)
            // Reload projects after deletion
            loadProjects()
            print("✅ ProjectsViewModel: Deleted project \(project.id.uuidString)")
        } catch {
            print("❌ ProjectsViewModel: Failed to delete project: \(error)")
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    /// Refresh projects list (e.g., after new project is saved)
    func refreshProjects() {
        loadProjects()
    }
}

// MARK: - Protocol for Dependency Injection

protocol ProjectsStorageManagerProtocol {
    func getAllProjects() -> [Project]
    func getProjectImage(projectId: String) -> UIImage?
    func deleteProject(_ project: Project) throws
    func saveProject(_ project: Project, with processedImage: UIImage, requestId: String?) throws
    func reloadProjectsFromDisk()
}

// MARK: - Extension: ProjectsStorageManager conforms to protocol

extension ProjectsStorageManager: ProjectsStorageManagerProtocol {
    // All methods already implemented in ProjectsStorageManager
    // This extension makes it conform to the protocol for testability
}

