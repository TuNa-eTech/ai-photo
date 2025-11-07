//
//  ProjectsStorageManagerTests.swift
//  AIPhotoAppTests
//
//  Unit tests for ProjectsStorageManager
//

import Testing
import UIKit
import Foundation
@testable import AIPhotoApp

// MARK: - ProjectsStorageManager Tests

@Suite("ProjectsStorageManager")
struct ProjectsStorageManagerTests {
    
    @Test("getAllProjects returns empty array initially")
    func testEmptyInitialState() {
        let manager = ProjectsStorageManager.shared
        let projects = manager.getAllProjects()
        
        #expect(projects.isEmpty)
    }
    
    @Test("saveProject adds project successfully")
    func testSaveProject() throws {
        let manager = ProjectsStorageManager.shared
        
        let testProject = Project(
            templateId: "test-template",
            templateName: "Test Template",
            createdAt: Date(),
            status: .completed
        )
        
        let testImage = UIImage.createTestImage()
        
        // Save project
        try manager.saveProject(testProject, with: testImage)
        
        // Retrieve all projects
        let projects = manager.getAllProjects()
        
        #expect(projects.count >= 1)
        
        // Check if our project is in the list
        let foundProject = projects.first { $0.id == testProject.id }
        #expect(foundProject != nil)
        #expect(foundProject?.templateId == "test-template")
        #expect(foundProject?.templateName == "Test Template")
    }
    
    @Test("saveProject saves image to disk")
    func testImageSavedToDisk() throws {
        let manager = ProjectsStorageManager.shared
        
        let testProject = Project(templateId: "test", templateName: "Test")
        let testImage = UIImage.createTestImage(size: CGSize(width: 500, height: 500))
        
        // Save project
        try manager.saveProject(testProject, with: testImage)
        
        // Retrieve the image
        let retrievedImage = manager.getProjectImage(projectId: testProject.id.uuidString)
        
        #expect(retrievedImage != nil)
        // JPEG compression may slightly change dimensions, so we check it's close
        if let image = retrievedImage {
            // Compare by pixel dimensions to avoid scale-related mismatches (UIImage.size is in points)
            let widthPixels = image.size.width * image.scale
            let heightPixels = image.size.height * image.scale
            let expectedPixels = 500.0 * UIScreen.main.scale
            let tolerance = 50.0 * UIScreen.main.scale
            #expect(abs(widthPixels - expectedPixels) <= tolerance)
            #expect(abs(heightPixels - expectedPixels) <= tolerance)
        }
    }
    
    @Test("deleteProject removes project from list")
    func testDeleteProject() throws {
        let manager = ProjectsStorageManager.shared
        
        let testProject = Project(templateId: "delete-test", templateName: "Delete Test")
        let testImage = UIImage.createTestImage()
        
        // Save project
        try manager.saveProject(testProject, with: testImage)
        
        let projectsBefore = manager.getAllProjects()
        #expect(projectsBefore.contains { $0.id == testProject.id })
        
        // Delete project
        try manager.deleteProject(testProject)
        
        let projectsAfter = manager.getAllProjects()
        #expect(!projectsAfter.contains { $0.id == testProject.id })
    }
    
    @Test("deleteProject removes image from disk")
    func testDeleteProjectRemovesImage() throws {
        let manager = ProjectsStorageManager.shared
        
        let testProject = Project(templateId: "delete-image-test", templateName: "Delete Image Test")
        let testImage = UIImage.createTestImage()
        
        // Save project
        try manager.saveProject(testProject, with: testImage)
        
        // Verify image exists
        var retrievedImage = manager.getProjectImage(projectId: testProject.id.uuidString)
        #expect(retrievedImage != nil)
        
        // Delete project
        try manager.deleteProject(testProject)
        
        // Verify image is deleted
        retrievedImage = manager.getProjectImage(projectId: testProject.id.uuidString)
        #expect(retrievedImage == nil)
    }
    
    @Test("getAllProjects returns projects sorted by date descending")
    func testProjectsSortedByDate() throws {
        let manager = ProjectsStorageManager.shared
        
        let today = Date()
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: today)!
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!
        
        let project1 = Project(
            id: UUID(),
            templateId: "test1",
            templateName: "Test 1",
            createdAt: yesterday,
            status: .completed
        )
        
        let project2 = Project(
            id: UUID(),
            templateId: "test2",
            templateName: "Test 2",
            createdAt: today,
            status: .completed
        )
        
        let project3 = Project(
            id: UUID(),
            templateId: "test3",
            templateName: "Test 3",
            createdAt: tomorrow,
            status: .completed
        )
        
        let testImage = UIImage.createTestImage()
        
        // Save in mixed order
        try manager.saveProject(project2, with: testImage)
        try manager.saveProject(project3, with: testImage)
        try manager.saveProject(project1, with: testImage)
        
        let projects = manager.getAllProjects()
        
        // Should be sorted newest first
        #expect(projects.first?.id == project3.id)
        #expect(projects.last?.id == project1.id)
    }
}
