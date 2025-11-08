//
//  HomeViewModel.swift
//  AIPhotoApp
//
//  ViewModel for Home screen (MVP: trending templates + new templates)
//

import Foundation
import Observation

@Observable
final class HomeViewModel {
    // MARK: - Dependencies
    private let repository: TemplatesRepositoryProtocol
    
    // MARK: - Types
    struct TemplateItem: Identifiable, Hashable {
        let id: UUID
        let slug: String
        let title: String
        let subtitle: String?
        let tag: String?
        let isNew: Bool
        let isTrending: Bool
        let thumbnailURL: URL?           // Real image URL from backend
        let thumbnailSymbol: String?     // Fallback SF Symbol when thumbnailURL is nil
        let dto: TemplateDTO?            // Original DTO for navigation

        init(id: UUID = UUID(),
             slug: String,
             title: String,
             subtitle: String? = nil,
             tag: String? = nil,
             isNew: Bool = false,
             isTrending: Bool = false,
             thumbnailURL: URL? = nil,
             thumbnailSymbol: String? = nil,
             dto: TemplateDTO? = nil) {
            self.id = id
            self.slug = slug
            self.title = title
            self.subtitle = subtitle
            self.tag = tag
            self.isNew = isNew
            self.isTrending = isTrending
            self.thumbnailURL = thumbnailURL
            self.thumbnailSymbol = thumbnailSymbol
            self.dto = dto
        }
    }

    // MARK: - Outputs (data)
    var trendingTemplates: [TemplateItem] = []
    var newTemplates: [TemplateItem] = []
    var allTemplates: [TemplateItem] = [] // For AllTemplatesView
    
    // MARK: - Favorites
    private(set) var favorites: Set<UUID> = []

    // MARK: - Status
    var isLoading: Bool = false
    var errorMessage: String?

    // MARK: - Computed
    
    /// Hero Templates: First 4 templates for carousel
    var heroTemplates: [TemplateItem] {
        Array(trendingTemplates.prefix(4))
    }
    
    /// Trending Now: Templates after hero carousel (starting from index 4)
    var trendingNowTemplates: [TemplateItem] {
        guard trendingTemplates.count > 4 else { return [] }
        // Return templates from index 4 onwards (max 5 templates)
        let endIndex = min(9, trendingTemplates.count)
        return Array(trendingTemplates[4..<endIndex])
    }
    
    // MARK: - Initialization
    
    init(repository: TemplatesRepositoryProtocol = TemplatesRepository()) {
        self.repository = repository
    }

    // MARK: - Actions

    // Load trending templates from API (/v1/templates/trending) using repository and bearer token
    func fetchTrendingFromAPI(bearerIDToken: String, limit: Int? = 20, tokenProvider: (() async throws -> String)? = nil) {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let resp = try await repository.listTrendingTemplates(limit: limit, offset: 0, bearerIDToken: bearerIDToken, tokenProvider: tokenProvider)
                let items: [TemplateItem] = resp.templates.map { dto in
                    // Map DTO to TemplateItem with real data
                    return TemplateItem(
                        slug: dto.id,
                        title: dto.name,
                        subtitle: subtitleText(for: dto),
                        tag: tagText(for: dto),
                        isNew: dto.isNew,
                        isTrending: dto.isTrending,
                        thumbnailURL: dto.thumbnailURL,
                        thumbnailSymbol: "photo",  // Fallback icon
                        dto: dto
                    )
                }
                await MainActor.run {
                    // Trending templates directly from API (no client-side filtering needed)
                    self.trendingTemplates = items
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    // Load all templates from API (/v1/templates) - for AllTemplatesView and SearchView
    func fetchAllTemplatesFromAPI(bearerIDToken: String, limit: Int? = nil, offset: Int? = nil, query: String? = nil, category: String? = nil, sort: String? = nil, tokenProvider: (() async throws -> String)? = nil) {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let resp = try await repository.listTemplates(limit: limit, offset: offset, query: query, category: category, sort: sort, bearerIDToken: bearerIDToken, tokenProvider: tokenProvider)
                let items: [TemplateItem] = resp.templates.map { dto in
                    // Map DTO to TemplateItem with real data
                    TemplateItem(
                        slug: dto.id,
                        title: dto.name,
                        subtitle: subtitleText(for: dto),
                        tag: tagText(for: dto),
                        isNew: dto.isNew,
                        isTrending: dto.isTrending,
                        thumbnailURL: dto.thumbnailURL,
                        thumbnailSymbol: "photo",  // Fallback icon
                        dto: dto
                    )
                }
                await MainActor.run {
                    self.allTemplates = items
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    // Load new templates from API (/v1/templates?sort=newest)
    func fetchNewTemplatesFromAPI(bearerIDToken: String, limit: Int? = 6, tokenProvider: (() async throws -> String)? = nil) {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let resp = try await repository.listTemplates(limit: limit, offset: 0, query: nil, category: nil, sort: "newest", bearerIDToken: bearerIDToken, tokenProvider: tokenProvider)
                let items: [TemplateItem] = resp.templates.map { dto in
                    // Map DTO to TemplateItem with real data
                    return TemplateItem(
                        slug: dto.id,
                        title: dto.name,
                        subtitle: subtitleText(for: dto),
                        tag: tagText(for: dto),
                        isNew: dto.isNew,
                        isTrending: dto.isTrending,
                        thumbnailURL: dto.thumbnailURL,
                        thumbnailSymbol: "photo",  // Fallback icon
                        dto: dto
                    )
                }
                await MainActor.run {
                    self.newTemplates = items
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    // Helper: Generate subtitle from template data
    private func subtitleText(for dto: TemplateDTO) -> String? {
        var parts: [String] = []
        
        if dto.isNew {
            parts.append("New")
        }
        
        if dto.isTrending {
            parts.append("Popular")
        }
        
        if let count = dto.usageCount, count > 0 {
            parts.append("\(count) uses")
        }
        
        return parts.isEmpty ? nil : parts.joined(separator: " • ")
    }
    
    // Helper: Generate tag from template data
    private func tagText(for dto: TemplateDTO) -> String? {
        if dto.isNew {
            return "New"
        } else if dto.isTrending {
            return "Trending"
        } else if let count = dto.usageCount, count > 50 {
            return "Popular"
        }
        return nil
    }

    func toggleFavorite(_ item: TemplateItem) {
        if favorites.contains(item.id) {
            favorites.remove(item.id)
        } else {
            favorites.insert(item.id)
        }
    }

    func isFavorite(_ item: TemplateItem) -> Bool {
        favorites.contains(item.id)
    }
}
