//
//  CategoryManager.swift
//  AIPhotoApp
//
//  Manages template categories loaded from API with UI metadata mapping
//

import Foundation
import SwiftUI

@Observable
final class CategoryManager {
    // MARK: - UI Metadata Mapping (icons for categories)
    // This mapping is local UI design constants and doesn't change
    private static let uiMetadata: [String: String] = [
        "portrait": "person.fill",
        "landscape": "photo.fill",
        "artistic": "paintpalette.fill",
        "vintage": "camera.fill",
        "abstract": "wand.and.stars",
    ]
    
    // MARK: - State
    var categories: [TemplateCategory] = []
    var isLoading: Bool = false
    var errorMessage: String?
    
    // MARK: - All Category (special case, always available)
    static let allCategory = TemplateCategory(
        id: "all",
        name: "Tất cả",
        icon: "square.grid.2x2"
    )
    
    // MARK: - Computed
    var allCategories: [TemplateCategory] {
        [Self.allCategory] + categories
    }
    
    // MARK: - Dependencies
    private let repository: TemplatesRepositoryProtocol
    
    init(repository: TemplatesRepositoryProtocol = TemplatesRepository()) {
        self.repository = repository
        // Initialize with fallback categories if API hasn't loaded yet
        self.categories = Self.fallbackCategories
    }
    
    // MARK: - Actions
    
    func loadCategories(bearerIDToken: String, tokenProvider: (() async throws -> String)? = nil) {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let response = try await repository.listCategories(
                    bearerIDToken: bearerIDToken,
                    tokenProvider: tokenProvider
                )
                await MainActor.run {
                    // Map API categories to TemplateCategory with UI metadata
                    self.categories = response.categories.map { dto in
                        Self.categoryFromDTO(dto)
                    }
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    // On error, use fallback categories
                    self.categories = Self.fallbackCategories
                    self.isLoading = false
                    self.errorMessage = error.localizedDescription
                    #if DEBUG
                    print("⚠️ Failed to load categories from API, using fallback: \(error.localizedDescription)")
                    #endif
                }
            }
        }
    }
    
    // MARK: - Helpers
    
    /// Convert CategoryDTO to TemplateCategory with UI metadata
    private static func categoryFromDTO(_ dto: CategoryDTO) -> TemplateCategory {
        let icon = uiMetadata[dto.id] ?? "tag.fill"
        
        return TemplateCategory(
            id: dto.id,
            name: dto.name,
            icon: icon
        )
    }
    
    /// Fallback categories if API fails (matches server categories)
    private static let fallbackCategories: [TemplateCategory] = [
        TemplateCategory(
            id: "portrait",
            name: "Chân dung",
            icon: uiMetadata["portrait"]!
        ),
        TemplateCategory(
            id: "landscape",
            name: "Phong cảnh",
            icon: uiMetadata["landscape"]!
        ),
        TemplateCategory(
            id: "artistic",
            name: "Nghệ thuật",
            icon: uiMetadata["artistic"]!
        ),
        TemplateCategory(
            id: "vintage",
            name: "Cổ điển",
            icon: uiMetadata["vintage"]!
        ),
        TemplateCategory(
            id: "abstract",
            name: "Trừu tượng",
            icon: uiMetadata["abstract"]!
        ),
    ]
}

