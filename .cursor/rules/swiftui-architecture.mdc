---
alwaysApply: true
---

# SwiftUI Architecture Guidelines for AIPhotoApp

## Architecture: MVVM + Repository + Service Layer

```
View → ViewModel → Repository → Service → Network
```

**Layers:**
- **View**: Pure UI, no business logic
- **ViewModel**: Business logic, state management (`@Observable`)
- **Repository**: Data access (protocol-based)
- **Service**: Business services (Auth, Image Processing)
- **Network**: HTTP client (APIClient)

## Quick Reference

### ViewModels
```swift
@Observable
final class HomeViewModel {
    private let repository: TemplatesRepositoryProtocol
    
    init(repository: TemplatesRepositoryProtocol = TemplatesRepository()) {
        self.repository = repository
    }
}
```

### Views
```swift
struct HomeView: View {
    @State private var home = HomeViewModel()
    @Environment(AuthViewModel.self) private var model  // Shared state
    
    var body: some View {
        // Pure UI only
    }
}
```

### Repositories
```swift
protocol TemplatesRepositoryProtocol {
    func listTemplates(...) async throws -> TemplatesListResponse
}

final class TemplatesRepository: TemplatesRepositoryProtocol {
    private let client: APIClientProtocol
    // Implementation
}
```

## Core Rules

### 1. ViewModels
- ✅ Use `@Observable` macro (not `@StateObject`/`@Published`)
- ✅ Inject dependencies via constructor with default parameters
- ✅ Use `@State` in Views to hold ViewModel instances
- ❌ No business logic in Views
- ❌ No hard-coded dependencies

### 2. Dependency Injection
- ✅ Constructor injection for ViewModels
- ✅ `@Environment` for app-wide shared state (AuthViewModel, etc.)
- ✅ Protocol-based dependencies for testability
- ❌ No prop drilling (passing through many layers)
- ❌ No direct singleton access (use protocol injection)

### 3. State Management
- ✅ `@Environment` for: Authentication, User profile, App-wide settings
- ✅ `@State` for: Local ViewModels, UI state (show/hide, selection)
- ✅ Pass ViewModel instances to child views when needed

### 4. Repository Pattern
- ✅ Always protocol-based (`RepositoryProtocol`)
- ✅ Custom JSONDecoder (no `.convertFromSnakeCase` - use explicit CodingKeys)
- ✅ Handle envelope format: `{ data: {...}, meta: {...} }`

### 5. Service Layer
- ✅ Protocol-based when needed for testing
- ✅ Inject via constructor, not direct singleton access
- ✅ Independent of ViewModels

## File Structure

```
AIPhotoApp/
├── App/                    # App entry point
├── Navigation/             # Routing (RootRouterView, MainTabView)
├── Models/                 # DTOs & Domain models
├── Repositories/          # Data access (protocol-based)
├── Services/              # Business services
├── ViewModels/            # Business logic (@Observable)
├── Views/                  # UI only
│   ├── Common/            # Reusable components
│   ├── Authentication/
│   ├── Home/
│   ├── Profile/
│   └── ImageProcessing/
└── Utilities/             # Helpers, Extensions, Networking
```

## Anti-Patterns to Avoid

❌ **Hard-coded dependencies in Views:**
```swift
let repo = TemplatesRepository()
home.fetchTrendingFromAPI(repo: repo, ...)
```

❌ **Prop drilling:**
```swift
HomeView(model: authModel)
ProfileView(model: model)  // Passing through layers
```

❌ **Direct singleton access:**
```swift
private let processor = BackgroundImageProcessor.shared
// ✅ Use: init(processor: BackgroundImageProcessorProtocol = ...)
```

❌ **Business logic in Views:**
```swift
Task {
    let data = try await APIClient().send(...)  // ❌ In View
}
// ✅ Move to ViewModel
```

## Testing

- Mock repositories via protocols
- Test ViewModels in isolation
- Inject mocks via constructor

```swift
let mockRepo = MockTemplatesRepository()
let viewModel = HomeViewModel(repository: mockRepo)
```

## Checklist for New Features

- [ ] ViewModel uses `@Observable`
- [ ] Dependencies injected via constructor
- [ ] Repository is protocol-based
- [ ] Shared state uses `@Environment` (not prop drilling)
- [ ] View contains only UI code
- [ ] No hard-coded dependencies
- [ ] Custom JSONDecoder (no auto snake_case)
