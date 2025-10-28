//
//  Project.swift
//  AIPhotoApp
//
//  User project model - represents a created project using a template
//

import Foundation

struct Project: Identifiable, Hashable, Codable {
    let id: UUID
    let templateId: String
    let templateName: String
    let thumbnailURL: URL?
    let createdAt: Date
    let status: ProjectStatus
    
    enum CodingKeys: String, CodingKey {
        case id
        case templateId
        case templateName
        case thumbnailURL
        case createdAt
        case status
    }
    
    enum ProjectStatus: String, Codable {
        case processing = "Processing"
        case completed = "Completed"
        case failed = "Failed"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        templateId = try container.decode(String.self, forKey: .templateId)
        templateName = try container.decode(String.self, forKey: .templateName)
        thumbnailURL = try? container.decode(URL.self, forKey: .thumbnailURL)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        status = try container.decode(ProjectStatus.self, forKey: .status)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(templateId, forKey: .templateId)
        try container.encode(templateName, forKey: .templateName)
        try? container.encode(thumbnailURL, forKey: .thumbnailURL)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encode(status, forKey: .status)
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


