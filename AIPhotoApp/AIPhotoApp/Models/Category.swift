//
//  Category.swift
//  AIPhotoApp
//
//  Template category model for filtering and navigation
//  Categories include: All, Portrait, Landscape, Artistic, Vintage, Abstract
//

import SwiftUI

struct TemplateCategory: Identifiable, Hashable {
    let id: String
    let name: String
    let icon: String
    let gradient: [Color]
    
    // MARK: - Predefined Categories
    
    static let all = TemplateCategory(
        id: "all",
        name: "Tất cả",
        icon: "square.grid.2x2",
        gradient: [.white.opacity(0.3), .white.opacity(0.1)]
    )
    
    static let portrait = TemplateCategory(
        id: "portrait",
        name: "Chân dung",
        icon: "person.fill",
        gradient: [GlassTokens.primary1, GlassTokens.primary2]
    )
    
    static let landscape = TemplateCategory(
        id: "landscape",
        name: "Phong cảnh",
        icon: "photo.fill",
        gradient: [GlassTokens.accent1, Color.blue]
    )
    
    static let artistic = TemplateCategory(
        id: "artistic",
        name: "Nghệ thuật",
        icon: "paintpalette.fill",
        gradient: [GlassTokens.accent2, Color.orange]
    )
    
    static let vintage = TemplateCategory(
        id: "vintage",
        name: "Cổ điển",
        icon: "camera.fill",
        gradient: [Color.brown, Color.orange.opacity(0.8)]
    )
    
    static let abstract = TemplateCategory(
        id: "abstract",
        name: "Trừu tượng",
        icon: "wand.and.stars",
        gradient: [Color.purple, Color.pink]
    )
    
    static let allCategories: [TemplateCategory] = [
        .all, .portrait, .landscape, .artistic, .vintage, .abstract
    ]
}

// MARK: - Convenience Extensions

extension TemplateCategory {
    /// Get category by ID, defaults to .all if not found
    static func byId(_ id: String) -> TemplateCategory {
        allCategories.first { $0.id == id } ?? .all
    }
    
    /// Get gradient as LinearGradient
    var linearGradient: LinearGradient {
        LinearGradient(
            colors: gradient,
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}



