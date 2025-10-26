//
//  Project.swift
//  AIPhotoApp
//
//  User project model - represents a created project using a template
//

import Foundation

struct Project: Identifiable, Hashable {
    let id: UUID
    let templateId: String
    let templateName: String
    let thumbnailURL: URL?
    let createdAt: Date
    let status: ProjectStatus
    
    enum ProjectStatus: String {
        case processing = "Processing"
        case completed = "Completed"
        case failed = "Failed"
    }
    
    init(
        id: UUID = UUID(),
        templateId: String,
        templateName: String,
        thumbnailURL: URL? = nil,
        createdAt: Date = Date(),
        status: ProjectStatus = .completed
    ) {
        self.id = id
        self.templateId = templateId
        self.templateName = templateName
        self.thumbnailURL = thumbnailURL
        self.createdAt = createdAt
        self.status = status
    }
}

