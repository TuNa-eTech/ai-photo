//
//  AllTemplatesViewModel.swift
//  AIPhotoApp
//
//  ViewModel for AllTemplatesView with pagination
//

import Foundation
import Observation

@Observable
final class AllTemplatesViewModel {
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
        let thumbnailURL: URL?
        let thumbnailSymbol: String?
        let dto: TemplateDTO?

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
    
    // MARK: - State
    var templates: [TemplateItem] = []
    var isLoading = false
    var isLoadingMore = false
    var errorMessage: String?
    var hasMorePages = true
    
    // MARK: - Pagination
    private var currentOffset = 0
    private let pageSize = 20
    
    // MARK: - Favorites
    private(set) var favorites: Set<UUID> = []
    
    // MARK: - Init
    init(repository: TemplatesRepositoryProtocol = TemplatesRepository()) {
        self.repository = repository
    }
    
    // MARK: - Public Methods
    
    func loadInitial(bearerIDToken: String, tokenProvider: @escaping () async throws -> String) {
        isLoading = true
        errorMessage = nil
        currentOffset = 0
        templates = []
        hasMorePages = true
        
        Task {
            await fetchTemplates(offset: 0, bearerIDToken: bearerIDToken, tokenProvider: tokenProvider)
            await MainActor.run {
                self.isLoading = false
            }
        }
    }
    
    func loadMore(bearerIDToken: String, tokenProvider: @escaping () async throws -> String) {
        guard !isLoadingMore, hasMorePages else { return }
        
        isLoadingMore = true
        currentOffset += pageSize
        
        Task {
            await fetchTemplates(offset: currentOffset, bearerIDToken: bearerIDToken, tokenProvider: tokenProvider)
            await MainActor.run {
                self.isLoadingMore = false
            }
        }
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
    
    // MARK: - Private Methods
    
    private func fetchTemplates(offset: Int, bearerIDToken: String, tokenProvider: @escaping () async throws -> String) async {
        do {
            let resp = try await repository.listTemplates(
                limit: pageSize,
                offset: offset,
                query: nil,
                category: nil,
                sort: nil,
                bearerIDToken: bearerIDToken,
                tokenProvider: tokenProvider
            )
            
            let items: [TemplateItem] = resp.templates.map { dto in
                TemplateItem(
                    slug: dto.id,
                    title: dto.name,
                    subtitle: subtitleText(for: dto),
                    tag: tagText(for: dto),
                    isNew: dto.isNew,
                    isTrending: dto.isTrending,
                    thumbnailURL: dto.thumbnailURL,
                    thumbnailSymbol: "photo",
                    dto: dto
                )
            }
            
            await MainActor.run {
                if offset == 0 {
                    // Initial load
                    self.templates = items
                } else {
                    // Append for load more
                    self.templates.append(contentsOf: items)
                }
                
                // Check if there are more pages
                self.hasMorePages = items.count >= self.pageSize
                self.errorMessage = nil
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                print("❌ Failed to fetch templates: \(error.localizedDescription)")
            }
        }
    }
    
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
}
