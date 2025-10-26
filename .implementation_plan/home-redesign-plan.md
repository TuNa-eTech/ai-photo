# Home Screen Redesign - Implementation Plan

**Status Checklist:**
- [ ] Phase 1: Enhanced Header & Hero Section
- [ ] Phase 2: Category Navigation
- [ ] Phase 3: Improved Template Cards
- [ ] Phase 4: Enhanced Search & Filters
- [ ] Phase 5: Animations & Micro-interactions
- [ ] Phase 6: Empty States & Loading
- [ ] Phase 7: Testing & Polish

**Design Approach:** Modern Minimal Enhanced
**Timeline:** 2-3 weeks (phased implementation)
**Priority:** High - Core UX improvement

---

## Goals

### User Experience Goals
1. **Discoverability** - Users can easily find templates they want
2. **Visual Appeal** - Maintain "Liquid Glass" aesthetic while improving clarity
3. **Performance** - Smooth 60fps scrolling and animations
4. **Engagement** - Encourage exploration and usage

### Technical Goals
1. **Maintainability** - Clean, modular code structure
2. **Scalability** - Support growing template catalog
3. **Accessibility** - Full VoiceOver support and Dynamic Type
4. **Performance** - Optimize image loading and rendering

---

## Design Specifications

### Visual Hierarchy

```
┌─────────────────────────────────────┐
│ Header (Compact)                    │  <- User info + Quick actions
├─────────────────────────────────────┤
│ Hero Stats Card                     │  <- Templates count, Activity
├─────────────────────────────────────┤
│ Category Chips (Horizontal Scroll)  │  <- Quick category filter
├─────────────────────────────────────┤
│ Search + Sort                       │  <- Search bar + Sort dropdown
├─────────────────────────────────────┤
│ Featured Carousel (Enhanced)        │  <- Bigger cards, auto-scroll
├─────────────────────────────────────┤
│ Section Header (Trending/New)       │  <- With "See All" link
├─────────────────────────────────────┤
│ Template Grid (Enhanced Cards)      │  <- 2-col, rich info
├─────────────────────────────────────┤
│ Load More / Pagination              │
├─────────────────────────────────────┤
│ FAB (Create Button)                 │  <- Enhanced with menu
└─────────────────────────────────────┘
```

### Color Palette (Consistent with Liquid Glass)

```swift
// Primary gradient
primary1: #4DA3FF (Blue)
primary2: #A259FF (Purple)

// Accents
accent1: #32E0C4 (Cyan)
accent2: #FF4D9A (Pink)

// Text
textPrimary: White 90%
textSecondary: White 70%
textTertiary: White 50%

// Glass effects
glassThin: .ultraThinMaterial
glassThick: .regularMaterial
```

### Typography Scale

```swift
// Headers
hero: .largeTitle.bold()           // 34pt
sectionHeader: .title2.semibold()  // 22pt
cardTitle: .headline.semibold()    // 17pt

// Body
body: .body                        // 17pt
caption: .subheadline              // 15pt
badge: .caption2.bold()            // 11pt
```

### Spacing System

```swift
// Consistent 8pt grid
xs: 4pt   // Tight spacing
sm: 8pt   // Small gaps
md: 16pt  // Standard padding
lg: 24pt  // Section spacing
xl: 32pt  // Large gaps
```

---

## Phase 1: Enhanced Header & Hero Section

### 1.1 Compact Header
**Current:**
- Large header with avatar, greeting, and action buttons
- Takes too much space

**New Design:**
- Compact header (60pt height)
- Avatar on left (40pt)
- Name + greeting in single line
- Action buttons on right (bell + settings)
- Sticky on scroll

**Implementation:**
```swift
// File: Views/Home/Components/CompactHeader.swift
struct CompactHeader: View {
    let userName: String
    @Binding var showNotifications: Bool
    @Binding var showSettings: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            // Avatar (40pt)
            Circle()
                .fill(.ultraThinMaterial)
                .frame(width: 40, height: 40)
                .overlay(...)
            
            // Name + Time-based greeting
            VStack(alignment: .leading, spacing: 0) {
                Text(timeBasedGreeting())
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.7))
                Text(userName)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(.white)
            }
            
            Spacer()
            
            // Action buttons
            HeaderActionButton(icon: "bell", badge: notificationCount) {
                showNotifications = true
            }
            HeaderActionButton(icon: "gearshape") {
                showSettings = true
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(.ultraThinMaterial)
        .overlay(alignment: .bottom) {
            Divider().opacity(0.3)
        }
    }
    
    func timeBasedGreeting() -> String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Chào buổi sáng"
        case 12..<17: return "Chào buổi chiều"
        case 17..<22: return "Chào buổi tối"
        default: return "Chào bạn"
        }
    }
}
```

### 1.2 Hero Stats Card
**New Component** - Show engagement metrics

```swift
// File: Views/Home/Components/HeroStatsCard.swift
struct HeroStatsCard: View {
    let templateCount: Int
    let recentActivity: Int
    
    var body: some View {
        HStack(spacing: 0) {
            StatColumn(
                value: "\(templateCount)",
                label: "Templates",
                icon: "square.grid.2x2"
            )
            
            Divider()
                .frame(height: 40)
                .overlay(.white.opacity(0.2))
            
            StatColumn(
                value: "\(recentActivity)",
                label: "Created Today",
                icon: "sparkles"
            )
            
            Divider()
                .frame(height: 40)
                .overlay(.white.opacity(0.2))
            
            StatColumn(
                value: "New",
                label: "Latest Style",
                icon: "star.fill"
            )
        }
        .padding(16)
        .glassCard()
        .padding(.horizontal, 16)
    }
}

struct StatColumn: View {
    let value: String
    let label: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(
                    LinearGradient(
                        colors: [GlassTokens.accent1, GlassTokens.accent2],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            Text(value)
                .font(.title2.weight(.bold))
                .foregroundStyle(.white)
            
            Text(label)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.7))
        }
        .frame(maxWidth: .infinity)
    }
}
```

---

## Phase 2: Category Navigation

### 2.1 Category Chips (Horizontal Scroll)
**Purpose:** Quick filter by category/style

```swift
// File: Models/Category.swift
struct TemplateCategory: Identifiable, Hashable {
    let id: String
    let name: String
    let icon: String
    let gradient: [Color]
    
    static let all = TemplateCategory(
        id: "all",
        name: "All",
        icon: "square.grid.2x2",
        gradient: [.white.opacity(0.3), .white.opacity(0.1)]
    )
    
    static let portrait = TemplateCategory(
        id: "portrait",
        name: "Portrait",
        icon: "person.fill",
        gradient: [GlassTokens.primary1, GlassTokens.primary2]
    )
    
    static let landscape = TemplateCategory(
        id: "landscape",
        name: "Landscape",
        icon: "photo",
        gradient: [GlassTokens.accent1, Color.blue]
    )
    
    static let artistic = TemplateCategory(
        id: "artistic",
        name: "Artistic",
        icon: "paintpalette.fill",
        gradient: [GlassTokens.accent2, Color.orange]
    )
    
    static let vintage = TemplateCategory(
        id: "vintage",
        name: "Vintage",
        icon: "camera.fill",
        gradient: [Color.brown, Color.orange]
    )
    
    static let allCategories: [TemplateCategory] = [
        .all, .portrait, .landscape, .artistic, .vintage
    ]
}

// File: Views/Home/Components/CategoryScrollView.swift
struct CategoryScrollView: View {
    @Binding var selectedCategory: TemplateCategory
    let categories: [TemplateCategory]
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(categories) { category in
                    CategoryChip(
                        category: category,
                        isSelected: selectedCategory.id == category.id
                    ) {
                        withAnimation(.spring(response: 0.3)) {
                            selectedCategory = category
                        }
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
    }
}

struct CategoryChip: View {
    let category: TemplateCategory
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: category.icon)
                    .imageScale(.small)
                    .foregroundStyle(
                        isSelected
                        ? LinearGradient(
                            colors: category.gradient,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                        : LinearGradient(
                            colors: [.white],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                
                Text(category.name)
                    .font(.subheadline.weight(isSelected ? .semibold : .regular))
                    .foregroundStyle(.white)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                isSelected
                ? AnyView(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(.regularMaterial)
                )
                : AnyView(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(.ultraThinMaterial)
                )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(
                        isSelected
                        ? LinearGradient(
                            colors: category.gradient,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                        : LinearGradient(
                            colors: [.white.opacity(0.25)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: isSelected ? 2 : 1
                    )
            )
            .shadow(
                color: isSelected ? category.gradient[0].opacity(0.3) : .clear,
                radius: 8,
                x: 0,
                y: 4
            )
        }
        .buttonStyle(.plain)
    }
}
```

---

## Phase 3: Improved Template Cards

### 3.1 Enhanced Template Card Design

**Features:**
- Thumbnail image with gradient overlay
- Title + subtitle (category)
- Stats (usage count, trending badge)
- Quick action buttons (favorite, preview)
- Subtle hover/press animation

```swift
// File: Views/Home/Components/EnhancedTemplateCard.swift
struct EnhancedTemplateCard: View {
    let template: TemplateItem
    let isFavorite: Bool
    let onTap: () -> Void
    let onFavorite: () -> Void
    let onPreview: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            onTap()
        }) {
            VStack(alignment: .leading, spacing: 0) {
                // Thumbnail with gradient overlay
                ZStack(alignment: .topTrailing) {
                    templateThumbnail
                    
                    // Badges overlay
                    VStack(alignment: .trailing, spacing: 6) {
                        if template.isNew {
                            BadgePill(text: "New", color: GlassTokens.accent1)
                        }
                        if template.isTrending {
                            BadgePill(text: "🔥 Trending", color: GlassTokens.accent2)
                        }
                    }
                    .padding(8)
                }
                .aspectRatio(4/3, contentMode: .fill)
                
                // Info section
                VStack(alignment: .leading, spacing: 8) {
                    // Title
                    Text(template.title)
                        .font(.headline.weight(.semibold))
                        .foregroundStyle(.white)
                        .lineLimit(1)
                    
                    // Subtitle + Stats
                    HStack(spacing: 4) {
                        if let subtitle = template.subtitle {
                            Text(subtitle)
                                .font(.caption)
                                .foregroundStyle(.white.opacity(0.7))
                        }
                        
                        Spacer()
                        
                        // Usage count
                        HStack(spacing: 3) {
                            Image(systemName: "heart.fill")
                                .imageScale(.small)
                            Text("2.4K")
                                .font(.caption2)
                        }
                        .foregroundStyle(.white.opacity(0.6))
                    }
                    
                    // Action buttons
                    HStack(spacing: 8) {
                        // Quick preview
                        CardActionButton(icon: "eye", size: 28) {
                            onPreview()
                        }
                        
                        Spacer()
                        
                        // Favorite
                        CardActionButton(
                            icon: isFavorite ? "heart.fill" : "heart",
                            size: 28,
                            tint: isFavorite ? GlassTokens.accent2 : nil
                        ) {
                            onFavorite()
                        }
                    }
                }
                .padding(12)
            }
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(.white.opacity(0.25), lineWidth: 1)
            )
            .shadow(
                color: .black.opacity(0.2),
                radius: isPressed ? 8 : 16,
                x: 0,
                y: isPressed ? 4 : 8
            )
            .scaleEffect(isPressed ? 0.97 : 1.0)
        }
        .buttonStyle(.plain)
        .pressEvents(
            onPress: { isPressed = true },
            onRelease: { isPressed = false }
        )
    }
    
    @ViewBuilder
    private var templateThumbnail: some View {
        if let thumbnailSymbol = template.thumbnailSymbol {
            // Placeholder with SF Symbol
            ZStack {
                LinearGradient(
                    colors: [
                        GlassTokens.primary1.opacity(0.6),
                        GlassTokens.primary2.opacity(0.6)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                
                Image(systemName: thumbnailSymbol)
                    .font(.system(size: 48))
                    .foregroundStyle(.white.opacity(0.5))
            }
        } else {
            // TODO: AsyncImage for remote thumbnails
            Color.gray.opacity(0.3)
        }
    }
}

struct BadgePill: View {
    let text: String
    let color: Color
    
    var body: some View {
        Text(text)
            .font(.caption2.weight(.bold))
            .foregroundStyle(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.9), in: Capsule())
            .shadow(color: color.opacity(0.5), radius: 4, x: 0, y: 2)
    }
}

struct CardActionButton: View {
    let icon: String
    let size: CGFloat
    var tint: Color?
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: size * 0.5))
                .foregroundStyle(tint ?? .white.opacity(0.8))
                .frame(width: size, height: size)
                .background(.ultraThinMaterial, in: Circle())
                .overlay(Circle().stroke(.white.opacity(0.2), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}
```

### 3.2 Press Events Extension

```swift
// File: Utilities/Extensions/PressEventsModifier.swift
extension View {
    func pressEvents(
        onPress: @escaping () -> Void,
        onRelease: @escaping () -> Void
    ) -> some View {
        modifier(PressEventsModifier(onPress: onPress, onRelease: onRelease))
    }
}

struct PressEventsModifier: ViewModifier {
    let onPress: () -> Void
    let onRelease: () -> Void
    
    func body(content: Content) -> some View {
        content
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in onPress() }
                    .onEnded { _ in onRelease() }
            )
    }
}
```

---

## Phase 4: Enhanced Search & Filters

### 4.1 Search Bar with Voice Input

```swift
// File: Views/Home/Components/EnhancedSearchBar.swift
struct EnhancedSearchBar: View {
    @Binding var searchText: String
    @Binding var sortOption: SortOption
    @FocusState private var isFocused: Bool
    
    enum SortOption: String, CaseIterable, Identifiable {
        case newest = "Newest"
        case popular = "Popular"
        case name = "Name"
        
        var id: String { rawValue }
        var icon: String {
            switch self {
            case .newest: return "clock"
            case .popular: return "flame.fill"
            case .name: return "textformat"
            }
        }
    }
    
    var body: some View {
        HStack(spacing: 12) {
            // Search field
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.white.opacity(0.6))
                
                TextField("Search templates...", text: $searchText)
                    .textInputAutocapitalization(.never)
                    .disableAutocorrection(true)
                    .foregroundStyle(.white)
                    .focused($isFocused)
                
                if !searchText.isEmpty {
                    Button {
                        searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.white.opacity(0.6))
                    }
                }
                
                // Voice search (future)
                Button {
                    // TODO: Voice search
                } label: {
                    Image(systemName: "mic.fill")
                        .foregroundStyle(.white.opacity(0.6))
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(
                        isFocused
                        ? LinearGradient(
                            colors: [GlassTokens.primary1, GlassTokens.primary2],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                        : LinearGradient(
                            colors: [.white.opacity(0.25)],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        lineWidth: isFocused ? 2 : 1
                    )
            )
            
            // Sort menu
            Menu {
                ForEach(SortOption.allCases) { option in
                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            sortOption = option
                        }
                    } label: {
                        Label(
                            option.rawValue,
                            systemImage: sortOption == option ? "checkmark" : option.icon
                        )
                    }
                }
            } label: {
                Image(systemName: "arrow.up.arrow.down")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(.white.opacity(0.25), lineWidth: 1)
                    )
            }
        }
        .padding(.horizontal, 16)
    }
}
```

---

## Phase 5: Animations & Micro-interactions

### 5.1 Scroll-based animations

```swift
// File: Utilities/Extensions/ScrollOffsetPreferenceKey.swift
struct ScrollOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

extension View {
    func onScrollOffset(_ action: @escaping (CGFloat) -> Void) -> some View {
        background(
            GeometryReader { geo in
                Color.clear
                    .preference(
                        key: ScrollOffsetPreferenceKey.self,
                        value: geo.frame(in: .named("scroll")).minY
                    )
            }
        )
        .onPreferenceChange(ScrollOffsetPreferenceKey.self, perform: action)
    }
}
```

### 5.2 Staggered Grid Animation

```swift
// File: Views/Home/Components/StaggeredGridView.swift
struct StaggeredGridView<Item: Identifiable, Content: View>: View {
    let items: [Item]
    let columns: Int
    let spacing: CGFloat
    let content: (Item) -> Content
    
    @State private var appearedItems: Set<Item.ID> = []
    
    var body: some View {
        LazyVGrid(
            columns: Array(repeating: GridItem(.flexible(), spacing: spacing), count: columns),
            spacing: spacing
        ) {
            ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                content(item)
                    .opacity(appearedItems.contains(item.id) ? 1 : 0)
                    .offset(y: appearedItems.contains(item.id) ? 0 : 20)
                    .onAppear {
                        withAnimation(
                            .spring(response: 0.5, dampingFraction: 0.7)
                            .delay(Double(index) * 0.05)
                        ) {
                            appearedItems.insert(item.id)
                        }
                    }
            }
        }
    }
}
```

---

## Phase 6: Empty States & Loading

### 6.1 Empty State View

```swift
// File: Views/Home/Components/EmptyStateView.swift
struct EmptyStateView: View {
    let title: String
    let message: String
    let icon: String
    let actionTitle: String?
    let action: (() -> Void)?
    
    var body: some View {
        VStack(spacing: 20) {
            // Icon with gradient
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [
                                GlassTokens.primary1.opacity(0.3),
                                GlassTokens.primary2.opacity(0.3)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 120, height: 120)
                    .blur(radius: 20)
                
                Image(systemName: icon)
                    .font(.system(size: 60))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [GlassTokens.primary1, GlassTokens.primary2],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
            
            VStack(spacing: 8) {
                Text(title)
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(.white)
                
                Text(message)
                    .font(.body)
                    .foregroundStyle(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
            }
            
            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.headline)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(
                            LinearGradient(
                                colors: [GlassTokens.primary1, GlassTokens.primary2],
                                startPoint: .leading,
                                endPoint: .trailing
                            ),
                            in: Capsule()
                        )
                        .shadow(
                            color: GlassTokens.primary1.opacity(0.5),
                            radius: 12,
                            x: 0,
                            y: 6
                        )
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(40)
    }
}
```

### 6.2 Skeleton Loading

```swift
// File: Views/Home/Components/TemplateCardSkeleton.swift
struct TemplateCardSkeleton: View {
    @State private var isAnimating = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Thumbnail skeleton
            Rectangle()
                .fill(shimmerGradient)
                .aspectRatio(4/3, contentMode: .fill)
            
            // Info skeleton
            VStack(alignment: .leading, spacing: 8) {
                // Title
                RoundedRectangle(cornerRadius: 4)
                    .fill(shimmerGradient)
                    .frame(height: 16)
                
                // Subtitle
                RoundedRectangle(cornerRadius: 4)
                    .fill(shimmerGradient)
                    .frame(width: 100, height: 12)
            }
            .padding(12)
        }
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .onAppear {
            withAnimation(
                .linear(duration: 1.5)
                .repeatForever(autoreverses: false)
            ) {
                isAnimating = true
            }
        }
    }
    
    private var shimmerGradient: LinearGradient {
        LinearGradient(
            colors: [
                .white.opacity(0.1),
                .white.opacity(0.2),
                .white.opacity(0.1)
            ],
            startPoint: isAnimating ? .leading : .trailing,
            endPoint: isAnimating ? .trailing : .leading
        )
    }
}
```

---

## Phase 7: Testing & Polish

### Test Checklist

**Visual Testing:**
- [ ] Test on iPhone SE (small screen)
- [ ] Test on iPhone 17 Pro Max (large screen)
- [ ] Test on iPad (if supported)
- [ ] Test with Dynamic Type (Accessibility sizes)
- [ ] Test with VoiceOver
- [ ] Test in Light/Dark mode (if applicable)

**Interaction Testing:**
- [ ] Search functionality works correctly
- [ ] Category filtering works
- [ ] Sort options work
- [ ] Favorite toggle persists
- [ ] Card tap navigation works
- [ ] FAB create button works
- [ ] Pull to refresh works

**Performance Testing:**
- [ ] 60fps scrolling with 50+ templates
- [ ] Smooth animations without jank
- [ ] Image loading doesn't block UI
- [ ] Memory usage is acceptable

**Accessibility Testing:**
- [ ] All interactive elements have labels
- [ ] VoiceOver navigation is logical
- [ ] Dynamic Type scales properly
- [ ] Color contrast meets WCAG standards

---

## File Structure

```
AIPhotoApp/
└── AIPhotoApp/
    └── Views/
        └── Home/
            ├── TemplatesHomeView.swift (Updated)
            └── Components/
                ├── CompactHeader.swift (New)
                ├── HeroStatsCard.swift (New)
                ├── CategoryScrollView.swift (New)
                ├── EnhancedTemplateCard.swift (New)
                ├── EnhancedSearchBar.swift (New)
                ├── EmptyStateView.swift (New)
                ├── TemplateCardSkeleton.swift (New)
                └── StaggeredGridView.swift (New)
    └── Models/
        └── Category.swift (New)
    └── Utilities/
        └── Extensions/
            ├── PressEventsModifier.swift (New)
            └── ScrollOffsetPreferenceKey.swift (New)
```

---

## Updated ViewModel

```swift
// File: ViewModels/HomeViewModel.swift (Enhanced)
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
    
    // MARK: - Inputs (UI state)
    var searchText: String = ""
    var selectedFilter: Filter = .all
    var selectedCategory: TemplateCategory = .all
    var sortOption: EnhancedSearchBar.SortOption = .newest
    
    // MARK: - Outputs (data)
    var featured: [TemplateItem] = []
    var allTemplates: [TemplateItem] = []
    var recentResults: [String] = []
    
    // MARK: - Stats
    var totalTemplateCount: Int { allTemplates.count }
    var todayCreatedCount: Int = 0
    
    // MARK: - Favorites
    private(set) var favorites: Set<UUID> = []
    
    // MARK: - Status
    var isLoading: Bool = false
    var errorMessage: String?
    
    // MARK: - Computed
    var filteredTemplates: [TemplateItem] {
        var list = allTemplates
        
        // Filter by category
        if selectedCategory != .all {
            list = list.filter { $0.tag == selectedCategory.id }
        }
        
        // Filter by filter type
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
        
        // Search filter
        if !searchText.isEmpty {
            list = list.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                $0.subtitle?.localizedCaseInsensitiveContains(searchText) == true
            }
        }
        
        // Sort
        switch sortOption {
        case .newest:
            list.sort { $0.isNew && !$1.isNew }
        case .popular:
            list.sort { $0.isTrending && !$1.isTrending }
        case .name:
            list.sort { $0.title < $1.title }
        }
        
        return list
    }
    
    // ... rest of the implementation
}
```

---

## Timeline & Effort Estimation

| Phase | Tasks | Estimated Time | Priority |
|-------|-------|---------------|----------|
| **Phase 1** | Header + Hero Stats | 4-6 hours | High |
| **Phase 2** | Category Navigation | 3-4 hours | High |
| **Phase 3** | Template Cards | 6-8 hours | High |
| **Phase 4** | Search & Filters | 4-5 hours | Medium |
| **Phase 5** | Animations | 5-6 hours | Medium |
| **Phase 6** | Empty States | 3-4 hours | Low |
| **Phase 7** | Testing & Polish | 4-6 hours | High |
| **Total** | | **29-39 hours** | |

**Recommended Sprint:** 2 weeks (phased approach)
- Week 1: Phases 1-3 (Core UI improvements)
- Week 2: Phases 4-7 (Enhanced features + polish)

---

## Success Metrics

**User Engagement:**
- [ ] Average session time increases by 20%
- [ ] Template views increase by 30%
- [ ] Favorite actions increase by 40%

**Performance:**
- [ ] Maintain 60fps scrolling
- [ ] < 200ms template card render time
- [ ] < 1s initial load time

**User Feedback:**
- [ ] 4.5+ rating on App Store
- [ ] Positive feedback on visual improvements
- [ ] No major usability complaints

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance degradation | High | Lazy loading, image caching, profiling |
| Breaking existing flows | Medium | Comprehensive testing, feature flags |
| Design complexity | Low | Iterative implementation, code reviews |
| API changes needed | Medium | Use mock data first, plan API updates |

---

## Future Enhancements (Post-MVP)

- [ ] Infinite scroll pagination
- [ ] Template collections/playlists
- [ ] Personalized recommendations
- [ ] Advanced filters (color, style, mood)
- [ ] Template preview mode
- [ ] Sharing templates
- [ ] User-generated templates

---

## Notes

- Maintain "Liquid Glass" aesthetic throughout
- Prioritize performance over fancy animations
- Test on real devices, not just simulator
- Gather user feedback early and often
- Document all design decisions



