//
//  HomeViewModel.swift
//  AIPhotoApp
//
//  ViewModel for Home screen (templates listing, featured, filters, search, recent results)
//

import Foundation
import Observation

@Observable
final class HomeViewModel {
    // MARK: - Types
    enum Filter: String, CaseIterable, Identifiable {
        case all = "All"
        case trending = "Trending"
        case new = "New"
        case favorites = "Favorites"
        var id: String { rawValue }
    }

    struct TemplateItem: Identifiable, Hashable {
        let id: UUID
        let slug: String
        let title: String
        let subtitle: String?
        let tag: String?
        let isNew: Bool
        let isTrending: Bool
        // Placeholder local image name (optional) for UI mock; replace with remote URL later
        let thumbnailSymbol: String?

        init(id: UUID = UUID(),
             slug: String,
             title: String,
             subtitle: String? = nil,
             tag: String? = nil,
             isNew: Bool = false,
             isTrending: Bool = false,
             thumbnailSymbol: String? = nil) {
            self.id = id
            self.slug = slug
            self.title = title
            self.subtitle = subtitle
            self.tag = tag
            self.isNew = isNew
            self.isTrending = isTrending
            self.thumbnailSymbol = thumbnailSymbol
        }
    }

    // MARK: - Inputs (UI state)
    var searchText: String = ""
    var selectedFilter: Filter = .all
    var selectedCategory: TemplateCategory = .all

    // MARK: - Outputs (data)
    var featured: [TemplateItem] = []
    var allTemplates: [TemplateItem] = []
    var recentResults: [String] = [] // placeholder identifiers or local asset names
    
    // MARK: - Stats
    var todayCreatedCount: Int = 0 // Number of templates/images created today

    // MARK: - Favorites
    private(set) var favorites: Set<UUID> = []

    // MARK: - Status
    var isLoading: Bool = false
    var errorMessage: String?

    // MARK: - Computed
    var filteredTemplates: [TemplateItem] {
        var list = allTemplates

        // Category filter
        if selectedCategory != .all {
            list = list.filter { $0.tag == selectedCategory.id }
        }

        // Filter segment
        switch selectedFilter {
        case .all:
            break
        case .trending:
            list = list.filter { $0.isTrending }
        case .new:
            list = list.filter { $0.isNew }
        case .favorites:
            list = list.filter { favorites.contains($0.id) }
        }

        // Search
        let q = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        if !q.isEmpty {
            list = list.filter {
                $0.title.localizedCaseInsensitiveContains(q) ||
                ($0.tag?.localizedCaseInsensitiveContains(q) ?? false) ||
                ($0.subtitle?.localizedCaseInsensitiveContains(q) ?? false)
            }
        }
        return list
    }

    // MARK: - Actions
    func fetchInitial() {
        // Mock data for UI development; replace with APIClient integration later
        isLoading = true
        errorMessage = nil

        // Simulate async load (quick)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
            guard let self else { return }

            let f: [TemplateItem] = [
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
                      thumbnailSymbol: "bolt.fill")
            ]
            self.featured = f

            let grid: [TemplateItem] = [
                .init(slug: "cartoon",
                      title: "Cartoon",
                      subtitle: "Playful lines",
                      tag: "Trending",
                      isNew: false,
                      isTrending: true,
                      thumbnailSymbol: "paintbrush.fill"),
                .init(slug: "cyberpunk",
                      title: "Cyberpunk",
                      subtitle: "Neon vibe",
                      tag: "New",
                      isNew: true,
                      isTrending: true,
                      thumbnailSymbol: "bolt.fill"),
                .init(slug: "portrait-hq",
                      title: "Portrait HQ",
                      subtitle: "Natural tone",
                      tag: "Studio",
                      isNew: false,
                      isTrending: false,
                      thumbnailSymbol: "person.crop.square"),
                .init(slug: "watercolor",
                      title: "Watercolor",
                      subtitle: "Soft & airy",
                      tag: "Art",
                      isNew: true,
                      isTrending: false,
                      thumbnailSymbol: "drop.fill"),
                .init(slug: "pixelart",
                      title: "Pixel Art",
                      subtitle: "Retro 8-bit",
                      tag: "Retro",
                      isNew: false,
                      isTrending: true,
                      thumbnailSymbol: "gamecontroller.fill"),
                .init(slug: "noir-film",
                      title: "Noir Film",
                      subtitle: "B&W dramatic",
                      tag: "Classic",
                      isNew: false,
                      isTrending: false,
                      thumbnailSymbol: "camera.aperture")
            ]
            self.allTemplates = grid

            self.recentResults = ["recent-1", "recent-2", "recent-3"]
            self.isLoading = false
        }
    }

    // Load templates from API (/v1/templates) using repository and bearer token
    func fetchFromAPI(repo: TemplatesRepository, bearerIDToken: String, limit: Int? = nil, offset: Int? = nil, tokenProvider: (() async throws -> String)? = nil) {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let resp = try await repo.listTemplates(limit: limit, offset: offset, bearerIDToken: bearerIDToken, tokenProvider: tokenProvider)
                let items: [TemplateItem] = resp.templates.map { dto in
                    TemplateItem(
                        slug: dto.id,
                        title: dto.name,
                        subtitle: nil,
                        tag: nil,
                        isNew: false,
                        isTrending: false,
                        thumbnailSymbol: nil
                    )
                }
                await MainActor.run {
                    self.featured = Array(items.prefix(3))
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
