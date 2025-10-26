//
//  HomeViewModel.swift
//  AIPhotoApp
//
//  ViewModel for Home screen (MVP: trending templates + user projects)
//

import Foundation
import Observation

@Observable
final class HomeViewModel {
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
        let thumbnailSymbol: String?     // Fallback SF Symbol for UI mock

        init(id: UUID = UUID(),
             slug: String,
             title: String,
             subtitle: String? = nil,
             tag: String? = nil,
             isNew: Bool = false,
             isTrending: Bool = false,
             thumbnailURL: URL? = nil,
             thumbnailSymbol: String? = nil) {
            self.id = id
            self.slug = slug
            self.title = title
            self.subtitle = subtitle
            self.tag = tag
            self.isNew = isNew
            self.isTrending = isTrending
            self.thumbnailURL = thumbnailURL
            self.thumbnailSymbol = thumbnailSymbol
        }
    }

    // MARK: - Outputs (data)
    var trendingTemplates: [TemplateItem] = []
    var userProjects: [Project] = []
    var allTemplates: [TemplateItem] = [] // For AllTemplatesView
    
    // MARK: - Favorites
    private(set) var favorites: Set<UUID> = []

    // MARK: - Status
    var isLoading: Bool = false
    var errorMessage: String?

    // MARK: - Computed
    var shouldShowProjects: Bool {
        !userProjects.isEmpty
    }
    
    var trendingLimit: Int {
        // Show fewer trending templates when user has projects
        shouldShowProjects ? 4 : 6
    }
    
    var displayTrendingTemplates: [TemplateItem] {
        Array(trendingTemplates.prefix(trendingLimit))
    }

    // MARK: - Actions
    func fetchInitial() {
        // Mock data for UI development; replace with APIClient integration later
        isLoading = true
        errorMessage = nil

        // Simulate async load (quick)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
            guard let self else { return }

            // Trending templates
            let trending: [TemplateItem] = [
                .init(slug: "anime-style",
                      title: "Anime Style",
                      subtitle: "New • High Quality",
                      tag: "New",
                      isNew: true,
                      isTrending: true,
                      thumbnailSymbol: "moon.stars.fill"),
                .init(slug: "cartoon-pop",
                      title: "Cartoon Pop",
                      subtitle: "Popular Pick",
                      tag: "Popular",
                      isNew: false,
                      isTrending: true,
                      thumbnailSymbol: "paintbrush.pointed.fill"),
                .init(slug: "cyberpunk",
                      title: "Cyberpunk",
                      subtitle: "Neon • Futuristic",
                      tag: "Trending",
                      isNew: true,
                      isTrending: true,
                      thumbnailSymbol: "bolt.fill"),
                .init(slug: "portrait-hq",
                      title: "Portrait HQ",
                      subtitle: "Natural tone",
                      tag: "Studio",
                      isNew: false,
                      isTrending: true,
                      thumbnailSymbol: "person.crop.square"),
                .init(slug: "watercolor",
                      title: "Watercolor",
                      subtitle: "Soft & airy",
                      tag: "Art",
                      isNew: true,
                      isTrending: true,
                      thumbnailSymbol: "drop.fill"),
                .init(slug: "pixelart",
                      title: "Pixel Art",
                      subtitle: "Retro 8-bit",
                      tag: "Retro",
                      isNew: false,
                      isTrending: true,
                      thumbnailSymbol: "gamecontroller.fill")
            ]
            self.trendingTemplates = trending
            self.allTemplates = trending // For now, all templates = trending
            
            // Mock user projects (uncomment to test projects UI)
            // self.userProjects = self.mockProjects()
            
            self.isLoading = false
        }
    }

    // Load trending templates from API (/v1/templates/trending) using repository and bearer token
    func fetchTrendingFromAPI(repo: TemplatesRepositoryProtocol, bearerIDToken: String, limit: Int? = 20, tokenProvider: (() async throws -> String)? = nil) {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let resp = try await repo.listTrendingTemplates(limit: limit, offset: 0, bearerIDToken: bearerIDToken, tokenProvider: tokenProvider)
                let items: [TemplateItem] = resp.templates.map { dto in
                    #if DEBUG
                    print("📦 DTO: \(dto.name)")
                    print("   - thumbnailURL: \(dto.thumbnailURL?.absoluteString ?? "nil")")
                    print("   - isNew: \(dto.isNew), isTrending: \(dto.isTrending)")
                    #endif
                    
                    // Map DTO to TemplateItem with real data
                    return TemplateItem(
                        slug: dto.id,
                        title: dto.name,
                        subtitle: subtitleText(for: dto),
                        tag: tagText(for: dto),
                        isNew: dto.isNew,
                        isTrending: dto.isTrending,
                        thumbnailURL: dto.thumbnailURL,
                        thumbnailSymbol: "photo"  // Fallback icon
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
    
    // Load all templates from API (/v1/templates) - for AllTemplatesView
    func fetchAllTemplatesFromAPI(repo: TemplatesRepositoryProtocol, bearerIDToken: String, limit: Int? = nil, offset: Int? = nil, tokenProvider: (() async throws -> String)? = nil) {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let resp = try await repo.listTemplates(limit: limit, offset: offset, bearerIDToken: bearerIDToken, tokenProvider: tokenProvider)
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
                        thumbnailSymbol: "photo"  // Fallback icon
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
    
    // MARK: - Mock Data (for testing)
    
    #if DEBUG
    func mockProjects() -> [Project] {
        [
            Project(
                templateId: "anime-style",
                templateName: "Anime Style",
                createdAt: Date().addingTimeInterval(-86400 * 2), // 2 days ago
                status: .completed
            ),
            Project(
                templateId: "cyberpunk",
                templateName: "Cyberpunk",
                createdAt: Date().addingTimeInterval(-3600 * 5), // 5 hours ago
                status: .processing
            )
        ]
    }
    #endif
}
