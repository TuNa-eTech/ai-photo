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
    var mockTrendingResponse: TemplatesListResponse?
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
    
    func listTrendingTemplates(
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
        
        // Use trending-specific response if provided, otherwise fall back to general response
        return mockTrendingResponse ?? mockResponse ?? TemplatesListResponse(templates: [])
    }
}

// MARK: - Test Helpers

extension TemplateDTO {
    @MainActor
    static func mock(
        id: String,
        name: String,
        thumbnailURL: URL? = nil,
        publishedAt: Date? = nil,
        usageCount: Int? = nil
    ) -> TemplateDTO {
        var fields: [String] = []
        fields.append("\"id\":\"\(id)\"")
        fields.append("\"name\":\"\(name)\"")
        if let url = thumbnailURL?.absoluteString {
            fields.append("\"thumbnail_url\":\"\(url)\"")
        }
        if let date = publishedAt {
            let formatter = ISO8601DateFormatter()
            let dateStr = formatter.string(from: date)
            fields.append("\"published_at\":\"\(dateStr)\"")
        }
        if let count = usageCount {
            fields.append("\"usage_count\":\(count)")
        }
        let json = "{" + fields.joined(separator: ",") + "}"
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        // Force try in tests; if it crashes, the test will fail visibly
        return try! decoder.decode(TemplateDTO.self, from: data)
    }
}

// MARK: - HomeViewModel Tests

@Suite("HomeViewModel Initialization")
@MainActor
struct HomeViewModelInitializationTests {
    
    @Test("ViewModel initializes with correct default state")
    func testInitialState() {
        let vm = HomeViewModel()
        
        #expect(vm.isLoading == false)
        #expect(vm.errorMessage == nil)
        #expect(vm.trendingTemplates.isEmpty)
        #expect(vm.userProjects.isEmpty)
        #expect(vm.allTemplates.isEmpty)
        #expect(vm.favorites.isEmpty)
        #expect(vm.shouldShowProjects == false)
        #expect(vm.trendingLimit == 6) // Default limit when no projects
    }
}

@Suite("HomeViewModel fetchTrendingFromAPI")
@MainActor
struct HomeViewModelFetchTrendingFromAPITests {
    
    @Test("fetchTrendingFromAPI sets isLoading during fetch")
    func testLoadingStateDuringFetch() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        // Setup mock response with delay
        mockRepo.mockTrendingResponse = TemplatesListResponse(templates: [
            TemplateDTO.mock(id: "test", name: "Test")
        ])
        
        // Call fetchTrendingFromAPI (starts Task internally)
        vm.fetchTrendingFromAPI(repo: mockRepo, bearerIDToken: "test-token")
        
        // Check loading state immediately (should be true)
        try? await Task.sleep(nanoseconds: 1_000_000) // 0.001 seconds
        #expect(vm.isLoading == true)
        
        // Wait for Task to complete (mock has 10ms delay + processing)
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
        
        // Loading should be false after completion
        #expect(vm.isLoading == false)
    }
    
    @Test("fetchAllTemplatesFromAPI populates templates on success")
    func testSuccessfulFetch() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        let today = Date()
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO.mock(id: "anime", name: "Anime Style", thumbnailURL: URL(string: "https://example.com/anime.jpg"), publishedAt: today, usageCount: 120),
            TemplateDTO.mock(id: "cartoon", name: "Cartoon", thumbnailURL: URL(string: "https://example.com/cartoon.jpg"), publishedAt: today, usageCount: 50)
        ])
        
        vm.fetchAllTemplatesFromAPI(repo: mockRepo, bearerIDToken: "test-token")
        
        // Wait for fetch to complete (increase to 200ms to avoid flakiness on CI)
        try? await Task.sleep(nanoseconds: 200_000_000) // 0.2 seconds
        
        #expect(vm.allTemplates.count == 2)
        #expect(vm.allTemplates[0].title == "Anime Style")
        #expect(vm.allTemplates[1].title == "Cartoon")
        #expect(vm.errorMessage == nil)
        #expect(vm.isLoading == false)
    }
    
    @Test("fetchAllTemplatesFromAPI handles error correctly")
    func testFetchError() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        struct TestError: LocalizedError {
            var errorDescription: String? { "Test error" }
        }
        
        mockRepo.mockError = TestError()
        
        vm.fetchAllTemplatesFromAPI(repo: mockRepo, bearerIDToken: "test-token")
        
        try? await Task.sleep(nanoseconds: 200_000_000)
        
        #expect(vm.errorMessage != nil)
        #expect(vm.isLoading == false)
        #expect(vm.allTemplates.isEmpty)
    }
    
    @Test("fetchAllTemplatesFromAPI passes bearer token correctly")
    func testBearerTokenPassed() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [])
        
        vm.fetchAllTemplatesFromAPI(repo: mockRepo, bearerIDToken: "my-secret-token")
        
        try? await Task.sleep(nanoseconds: 200_000_000)
        
        #expect(mockRepo.lastBearerToken == "my-secret-token")
    }
    
    @Test("fetchAllTemplatesFromAPI respects limit parameter")
    func testLimitParameter() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [])
        
        vm.fetchAllTemplatesFromAPI(repo: mockRepo, bearerIDToken: "token", limit: 50)
        
        try? await Task.sleep(nanoseconds: 200_000_000)
        
        #expect(mockRepo.lastLimit == 50)
    }
    
    @Test("fetchAllTemplatesFromAPI respects offset parameter")
    func testOffsetParameter() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [])
        
        vm.fetchAllTemplatesFromAPI(repo: mockRepo, bearerIDToken: "token", offset: 20)
        
        try? await Task.sleep(nanoseconds: 200_000_000)
        
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
            TemplateDTO.mock(id: "test-id", name: "Test Template", thumbnailURL: URL(string: "https://example.com/thumb.jpg"), publishedAt: today, usageCount: 150)
        ])
        
        vm.fetchAllTemplatesFromAPI(repo: mockRepo, bearerIDToken: "token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        let item = vm.allTemplates.first
        #expect(item != nil)
        #expect(item?.slug == "test-id")
        #expect(item?.title == "Test Template")
        #expect(item?.thumbnailURL?.absoluteString == "https://example.com/thumb.jpg")
        #expect(item?.isNew == true) // Published today
        #expect(item?.isTrending == false) // Trending requires usageCount >= 500
    }
    
    @Test("Generates subtitle from template data")
    func testSubtitleGeneration() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO.mock(id: "test", name: "Test", publishedAt: Date(), usageCount: 150)
        ])
        
        vm.fetchAllTemplatesFromAPI(repo: mockRepo, bearerIDToken: "token")
        
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
            TemplateDTO.mock(id: "new", name: "New Template", publishedAt: Date(), usageCount: 10),
            TemplateDTO.mock(id: "trending", name: "Trending Template", publishedAt: Calendar.current.date(byAdding: .day, value: -30, to: Date()), usageCount: 200)
        ])
        
        vm.fetchAllTemplatesFromAPI(repo: mockRepo, bearerIDToken: "token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        let newItem = vm.allTemplates.first { $0.slug == "new" }
        let trendingItem = vm.allTemplates.first { $0.slug == "trending" }
        
        #expect(newItem?.tag == "New")
        #expect(trendingItem?.tag == "Popular") // usageCount > 50 but < 500 → Popular
    }
    
    @Test("Uses fallback symbol when thumbnailURL is nil")
    func testFallbackSymbol() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockResponse = TemplatesListResponse(templates: [
            TemplateDTO.mock(id: "test", name: "Test")
        ])
        
        vm.fetchAllTemplatesFromAPI(repo: mockRepo, bearerIDToken: "token")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        let item = vm.allTemplates.first
        #expect(item?.thumbnailSymbol == "photo")
    }
}

// Filtering and search removed in MVP Home; tests deleted accordingly.

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

@Suite("HomeViewModel Trending Logic")
@MainActor
struct HomeViewModelTrendingLogicTests {
    
    @Test("displayTrendingTemplates respects trendingLimit and projects state")
    func testDisplayTrendingLimit() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        
        mockRepo.mockTrendingResponse = TemplatesListResponse(templates: [
            TemplateDTO.mock(id: "t1", name: "T1", publishedAt: Date(), usageCount: 200),
            TemplateDTO.mock(id: "t2", name: "T2", publishedAt: Date(), usageCount: 180),
            TemplateDTO.mock(id: "t3", name: "T3", publishedAt: Date(), usageCount: 160),
            TemplateDTO.mock(id: "t4", name: "T4", publishedAt: Date(), usageCount: 140),
            TemplateDTO.mock(id: "t5", name: "T5", publishedAt: Date(), usageCount: 120),
            TemplateDTO.mock(id: "t6", name: "T6", publishedAt: Date(), usageCount: 110)
        ])
        
        vm.fetchTrendingFromAPI(repo: mockRepo, bearerIDToken: "token")
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        // No projects → trendingLimit = 6
        #expect(vm.trendingLimit == 6)
        #expect(vm.displayTrendingTemplates.count == 6)
        
        // With projects → trendingLimit = 4
        #if DEBUG
        vm.userProjects = vm.mockProjects()
        #else
        vm.userProjects = [Project(templateId: "x", templateName: "X", createdAt: Date(), status: .completed)]
        #endif
        #expect(vm.trendingLimit == 4)
        #expect(vm.displayTrendingTemplates.count == 4)
    }
}
