//
//  HomeViewModelTests.swift
//  AIPhotoAppTests
//
//  Unit tests for HomeViewModel
//

import Testing
import Foundation
@testable import AIPhotoApp

// MARK: - Mock TemplatesRepository

@MainActor
final class MockTemplatesRepository: TemplatesRepositoryProtocol {
    var mockResponse: TemplatesListResponse?
    var mockError: Error?
    var lastBearerToken: String?
    var lastLimit: Int?
    var lastOffset: Int?
    
    func listTemplates(
        limit: Int?,
        offset: Int?,
        bearerIDToken: String,
        tokenProvider: (() async throws -> String)?
    ) async throws -> TemplatesListResponse {
        // Capture parameters for verification
        lastBearerToken = bearerIDToken
        lastLimit = limit
        lastOffset = offset
        
        // Simulate network delay
        try? await Task.sleep(nanoseconds: 10_000_000) // 0.01 seconds
        
        // Return mock response or throw error
        if let error = mockError {
            throw error
        }
        
        return mockResponse ?? TemplatesListResponse(templates: [])
    }
}

// MARK: - HomeViewModel Tests

@Suite("HomeViewModel Initialization")
@MainActor
struct HomeViewModelInitializationTests {
    
    @Test("ViewModel initializes with correct default state")
    func testInitialState() {
        let vm = HomeViewModel()
        
        #expect(vm.searchText == "")
        #expect(vm.selectedFilter == .all)
        #expect(vm.selectedCategory == .all)
        #expect(vm.isLoading == false)
        #expect(vm.errorMessage == nil)
        #expect(vm.featured.isEmpty)
        #expect(vm.allTemplates.isEmpty)
        #expect(vm.favorites.isEmpty)
    }
}

@Suite("HomeViewModel fetchFromAPI")
@MainActor
struct HomeViewModelFetchFromAPITests {
    
    @Test("fetchFromAPI sets isLoading during fetch")
    func testLoadingStateDuringFetch() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        // Setup mock response with delay
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO(id: "test", name: "Test", thumbnailURL: nil, publishedAt: nil, usageCount: nil)
        ])
        
        // Call fetchFromAPI (starts Task internally)
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "test-token")
        
        // Check loading state immediately (should be true)
        try? await Task.sleep(nanoseconds: 1_000_000) // 0.001 seconds
        #expect(vm.isLoading == true)
        
        // Wait for Task to complete (mock has 10ms delay + processing)
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
        
        // Loading should be false after completion
        #expect(vm.isLoading == false)
    }
    
    @Test("fetchFromAPI populates templates on success")
    func testSuccessfulFetch() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        let today = Date()
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO(
                id: "anime",
                name: "Anime Style",
                thumbnailURL: URL(string: "https://example.com/anime.jpg"),
                publishedAt: today,
                usageCount: 120
            ),
            TemplateDTO(
                id: "cartoon",
                name: "Cartoon",
                thumbnailURL: URL(string: "https://example.com/cartoon.jpg"),
                publishedAt: today,
                usageCount: 50
            )
        ])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "test-token")
        
        // Wait for fetch to complete (mock has 10ms delay + processing)
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
        
        #expect(vm.allTemplates.count == 2)
        #expect(vm.allTemplates[0].title == "Anime Style")
        #expect(vm.allTemplates[1].title == "Cartoon")
        #expect(vm.errorMessage == nil)
        #expect(vm.isLoading == false)
    }
    
    @Test("fetchFromAPI populates featured templates")
    func testFeaturedTemplatesPopulated() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        let today = Date()
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO(id: "trending", name: "Trending", thumbnailURL: nil, publishedAt: today, usageCount: 200),
            TemplateDTO(id: "new", name: "New", thumbnailURL: nil, publishedAt: today, usageCount: 10),
            TemplateDTO(id: "old", name: "Old", thumbnailURL: nil, publishedAt: Calendar.current.date(byAdding: .day, value: -30, to: today), usageCount: 5)
        ])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "test-token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        // Featured should be populated (trending/new items prioritized)
        #expect(vm.featured.count <= 3)
        #expect(!vm.featured.isEmpty)
    }
    
    @Test("fetchFromAPI handles error correctly")
    func testFetchError() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        struct TestError: LocalizedError {
            var errorDescription: String? { "Test error" }
        }
        
        mockRepo.mockError = TestError()
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "test-token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        #expect(vm.errorMessage != nil)
        #expect(vm.isLoading == false)
        #expect(vm.allTemplates.isEmpty)
    }
    
    @Test("fetchFromAPI passes bearer token correctly")
    func testBearerTokenPassed() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "my-secret-token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        #expect(mockRepo.lastBearerToken == "my-secret-token")
    }
    
    @Test("fetchFromAPI respects limit parameter")
    func testLimitParameter() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "token", limit: 50)
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        #expect(mockRepo.lastLimit == 50)
    }
    
    @Test("fetchFromAPI respects offset parameter")
    func testOffsetParameter() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "token", offset: 20)
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        #expect(mockRepo.lastOffset == 20)
    }
}

@Suite("HomeViewModel Template Mapping")
@MainActor
struct HomeViewModelTemplateMappingTests {
    
    @Test("Maps DTO fields to TemplateItem correctly")
    func testDTOMapping() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        let today = Date()
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO(
                id: "test-id",
                name: "Test Template",
                thumbnailURL: URL(string: "https://example.com/thumb.jpg"),
                publishedAt: today,
                usageCount: 150
            )
        ])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        let item = vm.allTemplates.first
        #expect(item != nil)
        #expect(item?.slug == "test-id")
        #expect(item?.title == "Test Template")
        #expect(item?.thumbnailURL?.absoluteString == "https://example.com/thumb.jpg")
        #expect(item?.isNew == true) // Published today
        #expect(item?.isTrending == true) // Usage count >= 100
    }
    
    @Test("Generates subtitle from template data")
    func testSubtitleGeneration() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO(id: "test", name: "Test", thumbnailURL: nil, publishedAt: Date(), usageCount: 150)
        ])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        let item = vm.allTemplates.first
        #expect(item?.subtitle != nil)
        #expect(item?.subtitle?.contains("New") == true || item?.subtitle?.contains("Popular") == true)
    }
    
    @Test("Generates tag from template data")
    func testTagGeneration() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO(id: "new", name: "New Template", thumbnailURL: nil, publishedAt: Date(), usageCount: 10),
            TemplateDTO(id: "trending", name: "Trending Template", thumbnailURL: nil, publishedAt: Calendar.current.date(byAdding: .day, value: -30, to: Date()), usageCount: 200)
        ])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        let newItem = vm.allTemplates.first { $0.slug == "new" }
        let trendingItem = vm.allTemplates.first { $0.slug == "trending" }
        
        #expect(newItem?.tag == "New")
        #expect(trendingItem?.tag == "Trending")
    }
    
    @Test("Uses fallback symbol when thumbnailURL is nil")
    func testFallbackSymbol() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO(id: "test", name: "Test", thumbnailURL: nil, publishedAt: nil, usageCount: nil)
        ])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        let item = vm.allTemplates.first
        #expect(item?.thumbnailSymbol == "photo")
    }
}

@Suite("HomeViewModel Filtering")
@MainActor
struct HomeViewModelFilteringTests {
    
    @Test("filteredTemplates returns all when no filters applied")
    func testNoFiltering() {
        let vm = HomeViewModel()
        vm.allTemplates = [
            HomeViewModel.TemplateItem(slug: "test1", title: "Test 1", thumbnailURL: nil),
            HomeViewModel.TemplateItem(slug: "test2", title: "Test 2", thumbnailURL: nil)
        ]
        
        let filtered = vm.filteredTemplates
        #expect(filtered.count == 2)
    }
    
    @Test("filteredTemplates respects selectedFilter=new")
    func testFilterByNew() {
        let vm = HomeViewModel()
        vm.allTemplates = [
            HomeViewModel.TemplateItem(slug: "new", title: "New", isNew: true, isTrending: false, thumbnailURL: nil),
            HomeViewModel.TemplateItem(slug: "old", title: "Old", isNew: false, isTrending: false, thumbnailURL: nil)
        ]
        vm.selectedFilter = .new
        
        let filtered = vm.filteredTemplates
        #expect(filtered.count == 1)
        #expect(filtered.first?.slug == "new")
    }
    
    @Test("filteredTemplates respects selectedFilter=favorites")
    func testFilterByFavorites() {
        let vm = HomeViewModel()
        let item1 = HomeViewModel.TemplateItem(slug: "fav", title: "Favorite", thumbnailURL: nil)
        let item2 = HomeViewModel.TemplateItem(slug: "not-fav", title: "Not Favorite", thumbnailURL: nil)
        
        vm.allTemplates = [item1, item2]
        // Use public method to add favorite instead of direct mutation
        vm.toggleFavorite(item1)
        vm.selectedFilter = .favorites
        
        let filtered = vm.filteredTemplates
        #expect(filtered.count == 1)
        #expect(filtered.first?.slug == "fav")
    }
    
    @Test("filteredTemplates respects search text")
    func testSearchFiltering() {
        let vm = HomeViewModel()
        vm.allTemplates = [
            HomeViewModel.TemplateItem(slug: "anime", title: "Anime Style", thumbnailURL: nil),
            HomeViewModel.TemplateItem(slug: "cartoon", title: "Cartoon", thumbnailURL: nil)
        ]
        vm.searchText = "anime"
        
        let filtered = vm.filteredTemplates
        #expect(filtered.count == 1)
        #expect(filtered.first?.slug == "anime")
    }
    
    @Test("Search is case insensitive")
    func testCaseInsensitiveSearch() {
        let vm = HomeViewModel()
        vm.allTemplates = [
            HomeViewModel.TemplateItem(slug: "test", title: "Anime Style", thumbnailURL: nil)
        ]
        vm.searchText = "ANIME"
        
        let filtered = vm.filteredTemplates
        #expect(filtered.count == 1)
    }
}

@Suite("HomeViewModel Favorites")
@MainActor
struct HomeViewModelFavoritesTests {
    
    @Test("toggleFavorite adds to favorites")
    func testAddFavorite() {
        let vm = HomeViewModel()
        let item = HomeViewModel.TemplateItem(slug: "test", title: "Test", thumbnailURL: nil)
        
        vm.toggleFavorite(item)
        
        #expect(vm.isFavorite(item) == true)
    }
    
    @Test("toggleFavorite removes from favorites")
    func testRemoveFavorite() {
        let vm = HomeViewModel()
        let item = HomeViewModel.TemplateItem(slug: "test", title: "Test", thumbnailURL: nil)
        
        vm.toggleFavorite(item) // Add
        vm.toggleFavorite(item) // Remove
        
        #expect(vm.isFavorite(item) == false)
    }
    
    @Test("isFavorite returns correct status")
    func testIsFavorite() {
        let vm = HomeViewModel()
        let item1 = HomeViewModel.TemplateItem(slug: "fav", title: "Favorite", thumbnailURL: nil)
        let item2 = HomeViewModel.TemplateItem(slug: "not-fav", title: "Not Favorite", thumbnailURL: nil)
        
        // Use public method instead of direct mutation
        vm.toggleFavorite(item1)
        
        #expect(vm.isFavorite(item1) == true)
        #expect(vm.isFavorite(item2) == false)
    }
}

@Suite("HomeViewModel Featured Templates Logic")
@MainActor
struct HomeViewModelFeaturedLogicTests {
    
    @Test("Featured prioritizes trending and new templates")
    func testFeaturedPriority() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        let oldDate = Calendar.current.date(byAdding: .day, value: -30, to: Date())!
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO(id: "normal", name: "Normal", thumbnailURL: nil, publishedAt: oldDate, usageCount: 10),
            TemplateDTO(id: "trending", name: "Trending", thumbnailURL: nil, publishedAt: oldDate, usageCount: 200),
            TemplateDTO(id: "new", name: "New", thumbnailURL: nil, publishedAt: Date(), usageCount: 5)
        ])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        // Featured should contain trending and new, not normal
        let featuredSlugs = Set(vm.featured.map(\.slug))
        #expect(featuredSlugs.contains("trending"))
        #expect(featuredSlugs.contains("new"))
    }
    
    @Test("Featured limited to maximum 3 items")
    func testFeaturedLimitedToThree() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO(id: "t1", name: "T1", thumbnailURL: nil, publishedAt: Date(), usageCount: 200),
            TemplateDTO(id: "t2", name: "T2", thumbnailURL: nil, publishedAt: Date(), usageCount: 180),
            TemplateDTO(id: "t3", name: "T3", thumbnailURL: nil, publishedAt: Date(), usageCount: 160),
            TemplateDTO(id: "t4", name: "T4", thumbnailURL: nil, publishedAt: Date(), usageCount: 140),
            TemplateDTO(id: "t5", name: "T5", thumbnailURL: nil, publishedAt: Date(), usageCount: 120)
        ])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        #expect(vm.featured.count <= 3)
    }
}

