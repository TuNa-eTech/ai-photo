//
//  TemplatesDTOs.swift
//  AIPhotoApp
//
//  DTOs for /v1/templates (EnvelopeTemplatesList -> TemplatesList -> [Template])
//

import Foundation

// Matches components.schemas.Template
struct TemplateDTO: Codable, Sendable, Identifiable, Hashable {
    let id: String           // e.g., "anime-style"
    let name: String         // e.g., "Phong cách Anime"
    let thumbnailURL: URL?   // optional (backend may add later)
    let publishedAt: Date?   // ISO8601 date when template was published
    let usageCount: Int?     // Number of times template has been used

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case thumbnailURL = "thumbnail_url"
        case publishedAt = "published_at"
        case usageCount = "usage_count"
    }
}

// MARK: - Computed Properties

extension TemplateDTO {
    /// Returns true if template was published within the last 7 days
    var isNew: Bool {
        guard let publishedAt = publishedAt else { return false }
        let daysSincePublish = Calendar.current.dateComponents(
            [.day],
            from: publishedAt,
            to: Date()
        ).day ?? 999
        return daysSincePublish <= 7
    }
    
    /// Returns true if template has high usage (>=100 uses)
    var isTrending: Bool {
        guard let count = usageCount else { return false }
        return count >= 100
    }
}

// Matches components.schemas.TemplatesList { templates: [Template] }
struct TemplatesListResponse: Codable, Sendable {
    let templates: [TemplateDTO]
}
