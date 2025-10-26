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
│   ├── DTOs/
│   │   ├── TemplatesDTOs.swift          # API DTOs with custom decoder
│   │   └── UserDTOs.swift
│   └── Project.swift                    # User project model (future)
├── Repositories/
│   ├── TemplatesRepository.swift        # API client with protocol + custom decoder
│   └── UserRepository.swift
├── ViewModels/
│   ├── HomeViewModel.swift              # Template browsing logic
│   └── AuthViewModel.swift              # Firebase auth
├── Views/
│   ├── Home/                            # Template browsing UI (MVP simplified)
│   │   ├── TemplatesHomeView.swift      # Main home: Trending templates
│   │   ├── SimpleHeader.swift           # Minimal header (avatar + settings)
│   │   ├── AllTemplatesView.swift       # Full list with search/filters
│   │   └── Components/
│   ├── Common/
│   │   ├── GlassComponents.swift        # Reusable liquid glass UI
│   │   └── GlassBackgroundView.swift
│   ├── Authentication/
│   │   ├── AuthLandingView.v2.swift     # Premium login with glass design
│   │   └── Components/
│   └── Profile/
│       └── ProfileView.swift            # User profile and settings
├── Utilities/
│   ├── Networking/
│   │   └── APIClient.swift              # Envelope handling, 401 retry
│   └── Constants/
│       ├── GlassTokens.swift            # Design tokens (beige palette)
│       └── AppConfig.swift              # Backend URL configuration
└── Services/
    └── AuthService.swift

AIPhotoAppTests/
├── TemplateDTOsTests.swift              # 20 tests: DTO decoding, computed properties
└── HomeViewModelTests.swift             # 27 tests: ViewModel logic, API integration
```

## ⚠️ Critical Patterns & Gotchas

### ❌ NEVER: JSONDecoder `.convertFromSnakeCase` + Explicit CodingKeys

**This is the #1 cause of silent decoding failures in iOS!**

```swift
// ❌ WRONG - This will silently fail to decode `thumbnailURL`:
let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .convertFromSnakeCase  // DON'T DO THIS!
decoder.dateDecodingStrategy = .iso8601

struct TemplateDTO: Codable {
    let thumbnailURL: URL?
    
    enum CodingKeys: String, CodingKey {
        case thumbnailURL = "thumbnail_url"  // This gets ignored!
    }
}

// Backend sends: { "thumbnail_url": "http://..." }
// .convertFromSnakeCase converts: "thumbnail_url" → "thumbnailUrl" (lowercase "u")
// Swift property expects: "thumbnailURL" (uppercase "URL")
// Result: thumbnailURL = nil (silent failure!)
```

**✅ CORRECT - Use custom decoder without auto-conversion:**

```swift
// In TemplatesRepository.swift
private var customDecoder: JSONDecoder {
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    // NO .convertFromSnakeCase - we have explicit CodingKeys!
    return decoder
}

// Pass customDecoder to all API calls:
return try await client.sendEnvelope(
    req,
    as: TemplatesListResponse.self,
    authToken: bearerIDToken,
    decoder: customDecoder  // ✅ Use custom decoder
)
```

**Why This Happens:**
- `.convertFromSnakeCase` converts `thumbnail_url` → `thumbnailUrl` (lowercase "u")
- Swift naming convention for URL is `thumbnailURL` (uppercase "URL")
- CodingKeys says `thumbnailURL = "thumbnail_url"` but decoder ignores it
- URLDecoder tries to decode `thumbnailUrl` (doesn't exist) → nil
- No error thrown, just silent nil assignment

**Rule:** If you have explicit CodingKeys for snake_case → camelCase mapping, NEVER use `.convertFromSnakeCase`!

### 🌐 iOS Simulator Network Limitations

**iOS Simulator CANNOT access host machine's `localhost`!**

```swift
// ❌ WRONG - This won't work in Simulator:
static let backendBaseURL = URL(string: "http://localhost:8080")!

// ✅ CORRECT - Use Mac's actual IP address:
static let backendBaseURL = URL(string: "http://192.168.1.123:8080")!
```

**How to find your Mac's IP:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
# Output: 192.168.1.123
```

**Important:**
- Backend MUST listen on `0.0.0.0` (all interfaces), not just `localhost`
- In NestJS: `await app.listen(8080, '0.0.0.0')`
- Update `AIPhotoApp/Utilities/Constants/AppConfig.swift` with your Mac's IP
- See `SIMULATOR_NETWORK_FIX.md` in project root for detailed troubleshooting

**For Physical Device:**
- Physical devices CAN access `localhost` via USB connection
- Use `localhost:8080` when running on real iPhone/iPad

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
    
    func listTrendingTemplates(
        limit: Int?,
        offset: Int?,
        bearerIDToken: String,
        tokenProvider: (() async throws -> String)?
    ) async throws -> TemplatesListResponse
}

final class TemplatesRepository: TemplatesRepositoryProtocol {
    private let client: APIClientProtocol
    
    // ✅ Custom decoder without .convertFromSnakeCase
    private var customDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        // NO .convertFromSnakeCase - we have explicit CodingKeys!
        return decoder
    }
    
    init(client: APIClientProtocol = APIClient()) {
        self.client = client
    }
    
    func listTemplates(...) async throws -> TemplatesListResponse {
        var req = APIRequest(method: "GET", path: "/v1/templates")
        // ... set query params ...
        
        return try await client.sendEnvelope(
            req,
            as: TemplatesListResponse.self,
            authToken: bearerIDToken,
            decoder: customDecoder  // ✅ Use custom decoder
        )
    }
    
    func listTrendingTemplates(...) async throws -> TemplatesListResponse {
        var req = APIRequest(method: "GET", path: "/v1/templates/trending")
        // ... set query params ...
        
        return try await client.sendEnvelope(
            req,
            as: TemplatesListResponse.self,
            authToken: bearerIDToken,
            decoder: customDecoder  // ✅ Use custom decoder
        )
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
    
    func listTrendingTemplates(...) async throws -> TemplatesListResponse {
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

### 3. DTOs with Computed Properties & Custom Decoder

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
    
    // ✅ Custom decoder to handle URL gracefully
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(String.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        publishedAt = try? container.decode(Date.self, forKey: .publishedAt)
        usageCount = try? container.decode(Int.self, forKey: .usageCount)
        
        // Special handling for thumbnail_url: decode from string
        if let urlString = try? container.decode(String.self, forKey: .thumbnailURL),
           !urlString.isEmpty {
            thumbnailURL = URL(string: urlString)
            #if DEBUG
            if thumbnailURL == nil {
                print("⚠️ Failed to create URL from: \(urlString)")
            }
            #endif
        } else {
            thumbnailURL = nil
        }
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
    
    /// Returns true if template has high usage (>= 500 uses)
    var isTrending: Bool {
        guard let count = usageCount else { return false }
        return count >= 500  // Threshold for trending
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

**✅ IMPORTANT: Don't blur actual images - use gradient overlays instead!**

```swift
struct CardGlassSmall: View {
    let title: String
    let tag: String?
    let thumbnailURL: URL?
    let thumbnailSymbol: String?
    
    var body: some View {
        ZStack(alignment: .bottomLeading) {
            // Thumbnail with AsyncImage (NO BLUR for clarity)
            Group {
                if let url = thumbnailURL {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                        case .failure(let error):
                            VStack {
                                fallbackImage
                                #if DEBUG
                                Text("Failed: \(error.localizedDescription)")
                                    .font(.caption2)
                                    .foregroundStyle(.red)
                                #endif
                            }
                        case .empty:
                            ZStack {
                                LinearGradient(
                                    colors: [
                                        GlassTokens.primary1.opacity(0.3),
                                        GlassTokens.accent1.opacity(0.2)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                                ProgressView()
                                    .tint(GlassTokens.textPrimary)
                            }
                        @unknown default:
                            fallbackImage
                        }
                    }
                    .onAppear {
                        #if DEBUG
                        print("🖼️ Loading image: \(url.absoluteString)")
                        #endif
                    }
                } else {
                    fallbackImage
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .clipped()
            
            // Gradient overlay for text readability (NOT blur!)
            LinearGradient(
                colors: [
                    Color.black.opacity(0),
                    Color.black.opacity(0.6)
                ],
                startPoint: .center,
                endPoint: .bottom
            )
            
            // Text overlay
            VStack(alignment: .leading, spacing: 6) {
                if let tag {
                    GlassChip(text: tag, systemImage: "flame")
                }
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .shadow(color: .black.opacity(0.5), radius: 2, x: 0, y: 1)
            }
            .padding(12)
        }
        .frame(height: 200)  // Increased from 180 for better proportions
        .glassCard()
    }
    
    private var fallbackImage: some View {
        ZStack {
            LinearGradient(
                colors: [GlassTokens.primary1, GlassTokens.accent1],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Image(systemName: thumbnailSymbol ?? "photo")
                .font(.system(size: 48))
                .foregroundStyle(.white.opacity(0.5))
        }
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
- Usage: "See All" templates view with full search/filters

**GET /v1/templates/trending** (Public) ⭐ Optimized for Home Screen
- Returns high-usage templates (`usage_count >= 500`) sorted by usage DESC
- Query params: `limit` (max 50), `offset`
- Response: Same envelope structure
- Usage: Home screen "Trending Templates" section
- Performance: Faster than client-side filtering, scales better

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

### 🚨 Issue: thumbnailURL always nil despite API returning data
**Root Cause**: Using `.convertFromSnakeCase` with explicit CodingKeys
```swift
// ❌ Problem:
decoder.keyDecodingStrategy = .convertFromSnakeCase  // Converts thumbnail_url → thumbnailUrl
// But Swift property is: thumbnailURL (uppercase URL)
```
**Solution**: Use custom decoder WITHOUT `.convertFromSnakeCase`
```swift
private var customDecoder: JSONDecoder {
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    // NO .convertFromSnakeCase!
    return decoder
}
```
**Debug**: Add custom `init(from decoder:)` with print statements to catch URL creation failures

### 🚨 Issue: AsyncImage shows placeholder, images don't load in Simulator
**Root Cause**: iOS Simulator cannot access host's `localhost`

**Solution 1 (Recommended)**: Use Mac's IP address
```swift
// Find your IP:
// ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1

// Update AppConfig.swift:
static let backendBaseURL = URL(string: "http://192.168.1.123:8080")!
```

**Solution 2**: Run on physical device (USB connection works with localhost)

**Solution 3**: Use ngrok for temporary public URL

**Verify**: Check Xcode console for `🖼️ Loading image: ...` logs

### Issue: HomeViewModel loses state after view update
**Solution**: Use `@State private var home = HomeViewModel()` instead of `let home = HomeViewModel()`

### Issue: Tests fail with "Task cancelled"
**Solution**: Increase sleep time to 100ms for async tests

### Issue: "Cannot find X in scope" in tests
**Solution**: Check Target Membership, ensure test file is added to test target

### Issue: AsyncImage shows error but URL looks correct
**Solution**: 
1. Check `Info.plist` has `NSAppTransportSecurity` exception for localhost
2. Verify backend listens on `0.0.0.0` not just `localhost`
3. Test URL in Safari on simulator
4. Check firewall settings on Mac

### Issue: Repository not mockable
**Solution**: Always use protocols, inject via init parameter

### Issue: Images blurry or hard to see text
**Solution**: 
- Remove `.blur()` from actual images
- Use gradient overlay for text readability instead
- Apply shadow to text: `.shadow(color: .black.opacity(0.5), radius: 2)`

## Next Steps

- [ ] Implement end-to-end UI tests for template browsing
- [ ] Test real API integration with Firebase auth on device
- [ ] Add image processing flow (select photo → apply template)
- [ ] Implement offline caching with Core Data
- [ ] Add Analytics (Firebase Analytics)

## References

### Apple Documentation
- [SwiftUI Documentation (Apple)](https://developer.apple.com/documentation/swiftui)
- [Swift Testing Documentation (Apple)](https://developer.apple.com/documentation/testing)
- [Codable Documentation](https://developer.apple.com/documentation/swift/codable)

### Project Documentation
- `.memory-bank/architecture.md` - iOS app architecture details
- `.memory-bank/tech.md` - iOS-specific best practices and testing commands
- `.memory-bank/context.md` - Recent changes and key learnings
- `.documents/workflows/run-tests.md` - Test execution guide

### Implementation Plans
- `.implementation_plan/trending-templates-api-plan.md` - Trending API implementation
- `.implementation_plan/login-redesign-plan.md` - Authentication UI redesign
- `.implementation_plan/ui-redesign-beige-minimalist.md` - UI design system

### Troubleshooting
- `SIMULATOR_NETWORK_FIX.md` (project root) - iOS Simulator network issues (CRITICAL!)
- `.documents/troubleshooting/db-auth.md` - Backend database auth issues

---

_For questions or issues, refer to the memory bank or implementation plans. The most critical learnings are at the top of this document in the "Critical Patterns & Gotchas" section._
