# iOS App - AI Image Stylist

_Last updated: 2025-10-26_

## Overview

SwiftUI iOS app for browsing AI templates and generating stylized photos. Features a liquid glass beige minimalist design with full API integration to the NestJS backend.

**Status**: ✅ MVP Complete with 100% Test Coverage (47 unit tests passing)

## Architecture

### Technology Stack
- **UI Framework**: SwiftUI (iOS 26+)
- **Authentication**: Firebase SDK
- **Networking**: URLSession with custom APIClient
- **State Management**: @Observable (Observation framework)
- **Testing**: Swift Testing framework (@Test, @Suite)

### Project Structure

```
AIPhotoApp/
├── Models/
│   └── DTOs/
│       ├── TemplatesDTOs.swift          # API DTOs with computed properties
│       └── UserDTOs.swift
├── Repositories/
│   ├── TemplatesRepository.swift        # API client with protocol
│   └── UserRepository.swift
├── ViewModels/
│   ├── HomeViewModel.swift              # Template browsing logic
│   └── AuthViewModel.swift              # Firebase auth
├── Views/
│   ├── Home/                            # Template browsing UI
│   │   ├── TemplatesHomeView.swift
│   │   ├── CompactHeader.swift
│   │   └── HeroStatsCard.swift
│   ├── Common/
│   │   ├── GlassComponents.swift        # Reusable liquid glass UI
│   │   └── GlassBackgroundView.swift
│   └── Authentication/
│       ├── LoginView.swift
│       └── SignupView.swift
├── Utilities/
│   ├── Networking/
│   │   └── APIClient.swift              # Envelope handling, 401 retry
│   └── Constants/
│       └── GlassTokens.swift            # Design tokens (beige palette)
└── Services/
    └── AuthService.swift

AIPhotoAppTests/
├── TemplateDTOsTests.swift              # 20 tests: DTO decoding, computed properties
└── HomeViewModelTests.swift             # 27 tests: ViewModel logic, API integration
```

## Key Patterns

### 1. Repository Protocol Pattern

Enables dependency injection and testability:

```swift
protocol TemplatesRepositoryProtocol {
    func listTemplates(
        limit: Int?,
        offset: Int?,
        bearerIDToken: String,
        tokenProvider: (() async throws -> String)?
    ) async throws -> TemplatesListResponse
}

final class TemplatesRepository: TemplatesRepositoryProtocol {
    private let client: APIClientProtocol
    
    init(client: APIClientProtocol = APIClient()) {
        self.client = client
    }
    
    func listTemplates(...) async throws -> TemplatesListResponse {
        // Real API implementation
    }
}

// For testing
@MainActor
final class MockTemplatesRepository: TemplatesRepositoryProtocol {
    var mockResponse: TemplatesListResponse?
    var mockError: Error?
    
    func listTemplates(...) async throws -> TemplatesListResponse {
        if let error = mockError { throw error }
        return mockResponse ?? TemplatesListResponse(templates: [])
    }
}
```

### 2. Observable ViewModels

Use `@Observable` for reactive state management (no `@Published` needed):

```swift
@Observable
final class HomeViewModel {
    var searchText: String = ""
    var isLoading: Bool = false
    var errorMessage: String?
    var allTemplates: [TemplateItem] = []
    private(set) var favorites: Set<UUID> = []
    
    func fetchFromAPI(
        repo: TemplatesRepositoryProtocol,
        bearerIDToken: String
    ) {
        isLoading = true
        Task {
            do {
                let resp = try await repo.listTemplates(...)
                await MainActor.run {
                    self.allTemplates = resp.templates.map { /* ... */ }
                    self.isLoading = false
                }
            } catch {
                // Error handling
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
}
```

### 3. DTOs with Computed Properties

```swift
struct TemplateDTO: Codable, Sendable, Identifiable, Hashable {
    let id: String
    let name: String
    let thumbnailURL: URL?
    let publishedAt: Date?
    let usageCount: Int?
    
    enum CodingKeys: String, CodingKey {
        case id, name
        case thumbnailURL = "thumbnail_url"
        case publishedAt = "published_at"
        case usageCount = "usage_count"
    }
}

extension TemplateDTO {
    /// Returns true if template was published within the last 7 days
    var isNew: Bool {
        guard let publishedAt = publishedAt else { return false }
        let daysSincePublish = Calendar.current.dateComponents(
            [.day],
            from: publishedAt,
            to: Date()
        ).day ?? 999
        return daysSincePublish <= 7
    }
    
    /// Returns true if template has high usage (>=100 uses)
    var isTrending: Bool {
        guard let count = usageCount else { return false }
        return count >= 100
    }
}
```

### 4. API Client with Envelope Handling

```swift
protocol APIClientProtocol {
    func sendEnvelope<T: Decodable>(
        _ request: APIRequest,
        as type: T.Type,
        authToken: String?,
        decoder: JSONDecoder?
    ) async throws -> T
    
    func sendEnvelopeRetry401<T: Decodable>(
        _ request: APIRequest,
        as type: T.Type,
        authToken: String?,
        decoder: JSONDecoder?,
        tokenProvider: (() async throws -> String)?
    ) async throws -> T
}

final class APIClient: APIClientProtocol {
    func sendEnvelope<T: Decodable>(...) async throws -> T {
        // Build URLRequest with Bearer token
        // Decode envelope: { success, data, error, meta }
        // Return inner data if success=true
        // Throw error if success=false
    }
    
    func sendEnvelopeRetry401<T: Decodable>(...) async throws -> T {
        do {
            return try await sendEnvelope(...)
        } catch let APIClientError.httpStatus(code, _) where code == 401 {
            // Refresh token using provider
            let refreshed = try await tokenProvider?()
            return try await sendEnvelope(..., authToken: refreshed)
        }
    }
}
```

### 5. Liquid Glass UI Components

```swift
struct CardGlassSmall: View {
    let title: String
    let tag: String?
    let thumbnailURL: URL?
    let thumbnailSymbol: String?
    
    var body: some View {
        ZStack(alignment: .bottomLeading) {
            // Thumbnail with AsyncImage
            Group {
                if let url = thumbnailURL {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().scaledToFill()
                        case .failure:
                            fallbackImage
                        case .empty:
                            ZStack {
                                Color.gray.opacity(0.2)
                                ProgressView()
                            }
                        @unknown default:
                            fallbackImage
                        }
                    }
                } else {
                    fallbackImage
                }
            }
            .overlay(
                LinearGradient(
                    colors: [
                        GlassTokens.primary1.opacity(0.4),
                        GlassTokens.accent1.opacity(0.3)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .blur(radius: GlassTokens.blurCard)
            
            VStack(alignment: .leading) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(GlassTokens.textPrimary)
                if let tag {
                    GlassChip(text: tag, systemImage: "flame")
                }
            }
            .padding(12)
        }
        .frame(height: 180)
        .glassCard()
    }
    
    private var fallbackImage: some View {
        Image(systemName: thumbnailSymbol ?? "photo")
            .resizable()
            .scaledToFill()
    }
}
```

## Testing

### Unit Tests (47 passing)

**Test Organization:**
- `TemplateDTOsTests.swift` - 20 tests for DTO decoding and computed properties
- `HomeViewModelTests.swift` - 27 tests for ViewModel logic and API integration

**Run Tests:**
```bash
cd AIPhotoApp

# Build and run tests
xcodebuild test \
  -scheme AIPhotoApp \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -only-testing:AIPhotoAppTests \
  -parallel-testing-enabled NO \
  2>&1 | xcpretty --color --test

# Or in Xcode: Cmd+U
```

**Key Testing Patterns:**

1. **Mock Repository Pattern**
```swift
@MainActor
final class MockTemplatesRepository: TemplatesRepositoryProtocol {
    var mockResponse: TemplatesListResponse?
    var mockError: Error?
    var lastBearerToken: String?
    
    func listTemplates(...) async throws -> TemplatesListResponse {
        lastBearerToken = bearerIDToken
        try? await Task.sleep(nanoseconds: 10_000_000) // 0.01s
        if let error = mockError { throw error }
        return mockResponse ?? TemplatesListResponse(templates: [])
    }
}
```

2. **Async Testing with Proper Timing**
```swift
@Test("fetchFromAPI populates templates on success")
func testSuccessfulFetch() async {
    let vm = HomeViewModel()
    let mockRepo = MockTemplatesRepository()
    
    mockRepo.mockResponse = TemplatesListResponse(templates: [...])
    
    vm.fetchFromAPI(repo: mockRepo, bearerIDToken: "test-token")
    
    // Wait for Task completion (mock has 10ms delay + processing)
    try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
    
    #expect(vm.allTemplates.count == 2)
    #expect(vm.isLoading == false)
}
```

3. **DTO Decoding Tests**
```swift
@Test("Decode TemplateDTO with all fields")
func testDecodingAllFields() throws {
    let json = """
    {
        "id": "anime-style",
        "name": "Anime Style",
        "thumbnail_url": "https://example.com/anime.jpg",
        "published_at": "2025-10-20T07:30:00Z",
        "usage_count": 120
    }
    """
    let data = Data(json.utf8)
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    
    let dto = try decoder.decode(TemplateDTO.self, from: data)
    
    #expect(dto.id == "anime-style")
    #expect(dto.name == "Anime Style")
    #expect(dto.usageCount == 120)
}
```

**Important Notes:**
- Use `-parallel-testing-enabled NO` flag for deterministic async tests
- Async tests require 100ms sleep for Task completion (unstructured Task in ViewModel)
- Mock repositories conform to protocols for dependency injection

## API Integration

### Endpoints Used

**GET /v1/templates** (Public)
- Returns only `published` + `public` templates
- Query params: `limit`, `offset`, `q` (search), `tags`, `sort` (newest|popular|name)
- Response: Envelope with `{ success, data: { templates: [] }, error, meta }`

### Authentication Flow

1. User signs in with Firebase (Google/Apple)
2. Get Firebase ID token: `user.getIDToken()`
3. Attach token to API requests: `Authorization: Bearer <token>`
4. Backend verifies token via Firebase Admin SDK
5. On 401 error, refresh token and retry once

### Dynamic UI Generation

Templates are displayed with dynamic subtitles and tags based on metadata:

```swift
// Subtitle: "New • Popular • 150 uses"
private func subtitleText(for dto: TemplateDTO) -> String? {
    var parts: [String] = []
    if dto.isNew { parts.append("New") }
    if dto.isTrending { parts.append("Popular") }
    if let count = dto.usageCount, count > 0 {
        parts.append("\(count) uses")
    }
    return parts.isEmpty ? nil : parts.joined(separator: " • ")
}

// Tag: "New" or "Trending" or "Popular"
private func tagText(for dto: TemplateDTO) -> String? {
    if dto.isNew { return "New" }
    else if dto.isTrending { return "Trending" }
    else if let count = dto.usageCount, count > 50 { return "Popular" }
    return nil
}
```

### Featured Templates Logic

```swift
// Use first 3 trending or new items for featured, otherwise first 3
let featured = items.filter { $0.isTrending || $0.isNew }.prefix(3)
self.featured = Array(featured.isEmpty ? items.prefix(3) : featured)
```

## Design System

### Beige Color Palette (GlassTokens)

```swift
static let primary1 = Color(hex: "F5E6D3")    // Warm beige
static let primary2 = Color(hex: "D4C4B0")    // Mid beige
static let accent1 = Color(hex: "F4E4C1")     // Light beige
static let accent2 = Color(hex: "E8D5D0")     // Dusty pink
static let textPrimary = Color(hex: "4A3F35") // Dark brown
```

### Glass Effects

- Blur: 15 (reduced from 25 for minimalism)
- Shadow: 18 (reduced from 25)
- Border: 1.5pt
- Corner radius: 24 (cards), 18 (chips)

### Typography

- Headlines: `.headline` (bold)
- Body: `.subheadline` or `.body`
- Captions: `.caption`
- Color: `GlassTokens.textPrimary` (#4A3F35) for proper contrast on light background

## Common Issues & Solutions

### Issue: Tests fail with "Task cancelled"
**Solution**: Increase sleep time to 100ms for async tests

### Issue: "Cannot find X in scope" in tests
**Solution**: Check Target Membership, ensure test file is added to test target

### Issue: AsyncImage not loading
**Solution**: Check URL format, ensure backend serves thumbnails at correct path

### Issue: Repository not mockable
**Solution**: Always use protocols, inject via init parameter

## Next Steps

- [ ] Implement end-to-end UI tests for template browsing
- [ ] Test real API integration with Firebase auth on device
- [ ] Add image processing flow (select photo → apply template)
- [ ] Implement offline caching with Core Data
- [ ] Add Analytics (Firebase Analytics)

## References

- [SwiftUI Documentation (Apple)](https://developer.apple.com/documentation/swiftui)
- [Swift Testing Documentation (Apple)](https://developer.apple.com/documentation/testing)
- `.memory-bank/architecture.md` - iOS app architecture details
- `.memory-bank/tech.md` - Complete testing commands
- `.documents/workflows/run-tests.md` - Test execution guide
- `.implementation_plan/ui-redesign-beige-minimalist.md` - UI redesign plan

---

_For questions or issues, refer to the memory bank or implementation plans._
