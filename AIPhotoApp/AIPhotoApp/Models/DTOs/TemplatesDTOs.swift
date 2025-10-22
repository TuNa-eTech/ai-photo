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

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case thumbnailURL = "thumbnail_url"
    }
}

// Matches components.schemas.TemplatesList { templates: [Template] }
struct TemplatesListResponse: Codable, Sendable {
    let templates: [TemplateDTO]
}
