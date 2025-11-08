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
    
    // Custom decoder to handle URL decoding gracefully
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(String.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        publishedAt = try? container.decode(Date.self, forKey: .publishedAt)
        usageCount = try? container.decode(Int.self, forKey: .usageCount)
        
        // Special handling for thumbnail_url: try to decode from string
        if let urlString = try? container.decode(String.self, forKey: .thumbnailURL),
           !urlString.isEmpty {
            thumbnailURL = URL(string: urlString)
            #if DEBUG
            if thumbnailURL == nil {
                print("⚠️ Failed to create URL from: \(urlString)")
            }
            #endif
        } else {
            thumbnailURL = nil
        }
    }
    
    // Keep Encodable conformance
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(name, forKey: .name)
        try container.encodeIfPresent(thumbnailURL?.absoluteString, forKey: .thumbnailURL)
        try container.encodeIfPresent(publishedAt, forKey: .publishedAt)
        try container.encodeIfPresent(usageCount, forKey: .usageCount)
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
    
    /// Returns true if template has high usage (>= 500 uses)
    var isTrending: Bool {
        guard let count = usageCount else { return false }
        return count >= 500
    }
}

// Matches components.schemas.TemplatesList { templates: [Template] }
struct TemplatesListResponse: Codable, Sendable {
    let templates: [TemplateDTO]
}

// MARK: - Category DTO

struct CategoryDTO: Codable, Sendable, Identifiable, Hashable {
    let id: String
    let name: String
}

struct CategoriesListResponse: Codable, Sendable {
    let categories: [CategoryDTO]
}
