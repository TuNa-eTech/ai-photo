---
globs: *Tests.swift,*Test.swift
description: Best practices for unit testing SwiftUI apps using Swift Testing framework
---

# SwiftUI Unit Testing Best Practices

When writing unit tests for SwiftUI components, follow these established patterns from our project.

## Testing Framework

Use **Swift Testing framework** with `@Test` and `@Suite` annotations (not XCTest).

```swift
import Testing
import Foundation
@testable import AIPhotoApp

@Suite("Feature Name")
struct FeatureTests {
    @Test("Should do something specific")
    func testSpecificBehavior() {
        // Test implementation
        #expect(actual == expected)
    }
}
```

## Key Patterns

### 1. Protocol-Based Dependency Injection

**Always use protocols for repositories/services to enable mocking:**

```swift
// In main app code
protocol TemplatesRepositoryProtocol {
    func listTemplates(...) async throws -> TemplatesListResponse
}

final class TemplatesRepository: TemplatesRepositoryProtocol {
    // Real implementation
}

// In test code
@MainActor
final class MockTemplatesRepository: TemplatesRepositoryProtocol {
    var mockResponse: TemplatesListResponse?
    var mockError: Error?
    var lastBearerToken: String?
    
    func listTemplates(...) async throws -> TemplatesListResponse {
        lastBearerToken = bearerIDToken
        try? await Task.sleep(nanoseconds: 10_000_000) // Simulate network
        if let error = mockError { throw error }
        return mockResponse ?? TemplatesListResponse(templates: [])
    }
}
```

### 2. Async Testing with Proper Timing

**ViewModels use unstructured Tasks - tests must wait for completion:**

```swift
@Test("fetchFromAPI populates templates on success")
func testSuccessfulFetch() async {
    let vm = HomeViewModel()
    let mockRepo = MockTemplatesRepository()
    
    mockRepo.mockResponse = TemplatesListResponse(templates: [...])
    
    // Call ViewModel method (starts unstructured Task)
    vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "test-token")
    
    // Wait for Task completion (100ms is reliable for our async operations)
    try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
    
    #expect(vm.allTemplates.count == 2)
    #expect(vm.isLoading == false)
}
```

**Important:** Use 100ms sleep (not 50ms) for async tests to ensure Task completion.

### 3. DTO Decoding Tests

**Test all JSON decoding scenarios:**

```swift
@Suite("TemplateDTO Decoding")
struct TemplateDTODecodingTests {
    @Test("Decode with all fields present")
    func testDecodingAllFields() throws {
        let json = """
        {
            "id": "test",
            "name": "Test Template",
            "thumbnail_url": "https://example.com/image.jpg",
            "published_at": "2025-10-26T10:00:00Z",
            "usage_count": 150
        }
        """
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let dto = try decoder.decode(TemplateDTO.self, from: data)
        
        #expect(dto.id == "test")
        #expect(dto.name == "Test Template")
        #expect(dto.usageCount == 150)
    }
    
    @Test("Decode with missing optional fields")
    func testDecodingMissingOptionalFields() throws {
        let json = """
        {
            "id": "minimal",
            "name": "Minimal Template"
        }
        """
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        
        let dto = try decoder.decode(TemplateDTO.self, from: data)
        
        #expect(dto.id == "minimal")
        #expect(dto.name == "Minimal Template")
        #expect(dto.thumbnailURL == nil)
        #expect(dto.usageCount == nil)
    }
}
```

### 4. Computed Properties Tests

**Test all computed property logic paths:**

```swift
@Suite("TemplateDTO Computed Properties")
struct TemplateDTOComputedPropertiesTests {
    @Test("isNew returns true for recently published template")
    func testIsNewTrue() {
        let recentDate = Calendar.current.date(byAdding: .day, value: -3, to: Date())
        let dto = TemplateDTO(id: "new", name: "New", publishedAt: recentDate, usageCount: 10)
        #expect(dto.isNew == true)
    }
    
    @Test("isNew returns false for old template")
    func testIsNewFalse() {
        let oldDate = Calendar.current.date(byAdding: .day, value: -8, to: Date())
        let dto = TemplateDTO(id: "old", name: "Old", publishedAt: oldDate, usageCount: 10)
        #expect(dto.isNew == false)
    }
    
    @Test("isTrending returns true for high usage")
    func testIsTrendingTrue() {
        let dto = TemplateDTO(id: "trending", name: "Trending", publishedAt: Date(), usageCount: 150)
        #expect(dto.isTrending == true)
    }
    
    @Test("isTrending returns false for low usage")
    func testIsTrendingFalse() {
        let dto = TemplateDTO(id: "not-trending", name: "Not Trending", publishedAt: Date(), usageCount: 50)
        #expect(dto.isTrending == false)
    }
}
```

### 5. ViewModel State Management Tests

**Test all ViewModel state transitions:**

```swift
@Suite("HomeViewModel State Management")
@MainActor
struct HomeViewModelStateTests {
    @Test("Initial state is correct")
    func testInitialState() {
        let vm = HomeViewModel()
        
        #expect(vm.searchText == "")
        #expect(vm.isLoading == false)
        #expect(vm.errorMessage == nil)
        #expect(vm.allTemplates.isEmpty)
        #expect(vm.favorites.isEmpty)
    }
    
    @Test("Loading state toggles during fetch")
    func testLoadingState() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        mockRepo.mockResponse = TemplatesListResponse(templates: [...])
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "test")
        
        // Check loading state immediately
        try? await Task.sleep(nanoseconds: 1_000_000) // 0.001s
        #expect(vm.isLoading == true)
        
        // Wait for completion
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1s
        #expect(vm.isLoading == false)
    }
    
    @Test("Error message is set on failure")
    func testErrorHandling() async {
        let vm = HomeViewModel()
        let mockRepo = MockTemplatesRepository()
        mockRepo.mockError = TemplatesRepository.NetworkError.serverError("Test error")
        
        vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "test")
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        #expect(vm.errorMessage == "Test error")
        #expect(vm.allTemplates.isEmpty)
    }
}
```

### 6. Mock Data Helpers

**Create reusable test data:**

```swift
extension TemplateDTO {
    static func mock(
        id: String = "test",
        name: String = "Test Template",
        thumbnailURL: URL? = nil,
        publishedAt: Date? = nil,
        usageCount: Int? = nil
    ) -> TemplateDTO {
        TemplateDTO(
            id: id,
            name: name,
            thumbnailURL: thumbnailURL,
            publishedAt: publishedAt,
            usageCount: usageCount
        )
    }
}

// Usage in tests
let template = TemplateDTO.mock(
    id: "anime",
    name: "Anime Style",
    usageCount: 150
)
```

## Test Organization

### Suite Structure

```swift
@Suite("Feature Name") 
struct FeatureTests {
    // Group related tests
}

@Suite("Feature Name - Subfeature")
struct SubfeatureTests {
    // More specific tests
}
```

### Test Naming Convention

```swift
@Test("Should [expected behavior] when [condition]")
func testSpecificScenario() {
    // Test implementation
}
```

Good examples:
- `"Should return true when template published within 7 days"`
- `"Should populate allTemplates on successful API fetch"`
- `"Should throw error when token is invalid"`

## Running Tests

**Command line (recommended):**
```bash
cd AIPhotoApp

xcodebuild test \
  -scheme AIPhotoApp \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -only-testing:AIPhotoAppTests \
  -parallel-testing-enabled NO \
  2>&1 | xcpretty --color --test
```

**Important flags:**
- `-parallel-testing-enabled NO` - **Required** for deterministic async tests
- `-only-testing:AIPhotoAppTests` - Run only unit tests (not UI tests)
- `xcpretty --color --test` - Clean formatted output

**Xcode:**
- Press `Cmd+U` to run all tests
- Right-click test → "Run Tests" for specific tests

## Common Issues

### Issue: Test fails with "Task cancelled" or timing issues
**Solution:** Increase sleep duration to 100ms for async tests

### Issue: "Cannot find X in scope" in test file
**Solution:** Check Target Membership - ensure test file is added to test target

### Issue: Mock not working, ViewModel still calls real repository
**Solution:** Ensure ViewModel accepts repository via init parameter, not hardcoded

### Issue: Tests pass locally but fail in CI
**Solution:** Always use `-parallel-testing-enabled NO` flag

## Test Coverage Goals

- **DTOs**: 100% - Test all decoding paths and computed properties
- **ViewModels**: >90% - Test all state transitions and business logic
- **Repositories**: Mock only, test real API in integration tests
- **UI Components**: Test via ViewModels, not direct UI tests

## References

- [AIPhotoAppTests/TemplateDTOsTests.swift](mdc:AIPhotoApp/AIPhotoAppTests/TemplateDTOsTests.swift) - 20 DTO tests
- [AIPhotoAppTests/HomeViewModelTests.swift](mdc:AIPhotoApp/AIPhotoAppTests/HomeViewModelTests.swift) - 27 ViewModel tests
- [.documents/workflows/run-tests.md](mdc:.documents/workflows/run-tests.md) - Complete testing guide
- [.memory-bank/tech.md](mdc:.memory-bank/tech.md) - Testing commands and patterns

---

**Current Test Status:** 47 tests, 100% passing ✅
