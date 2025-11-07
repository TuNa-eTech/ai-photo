# iOS Error Handling & Empty States

Last updated: 2025-11-07

## Overview

This document describes the error handling and empty state patterns used in the iOS app, following the Liquid Glass Beige Minimalist design system.

## Principles

1. **No Mock Data in Production**: All mock data has been removed. The app only uses real API data.
2. **Clear Error Messages**: Errors are categorized and displayed with actionable messages.
3. **Helpful Empty States**: Empty states provide context and actions (e.g., retry button).
4. **Consistent UI**: All error and empty states follow the design system (GlassTokens, glass effects).

## Error Handling

### Error Categories

Errors are categorized in `HomeViewModel.fetchTrendingFromAPI()`:

- **Unauthorized (401)**: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
- **Server Error**: "Lỗi server: {message}"
- **Network Error**: "Không thể kết nối đến server. Kiểm tra kết nối mạng."
- **Generic Error**: "Không thể tải templates. Vui lòng thử lại."

### Error Display

Errors are shown using `BannerGlass` component:

```swift
BannerGlass(
    text: errorMessage,
    tint: .red
) {
    // Retry action
}
```

**Features:**
- Red tint for error indication
- Retry button with `GlassCTAButtonStyle()`
- Slide-in animation from top
- Auto-dismiss capability

## Empty States

### Empty State Components

Empty states include:
- **Icon**: Large SF Symbol with glass effect (gradient colors)
- **Title**: Clear, descriptive message
- **Subtitle**: Helpful context or instructions
- **Action Button**: Optional retry/refresh button

### Example: Trending Templates Empty State

```swift
private var emptyStateView: some View {
    VStack(spacing: 20) {
        // Icon with glass effect
        ZStack {
            Circle()
                .fill(GlassTokens.accent1.opacity(0.2))
                .frame(width: 80, height: 80)
            
            Image(systemName: "sparkles")
                .font(.system(size: 36, weight: .light))
                .foregroundStyle(
                    LinearGradient(
                        colors: [GlassTokens.textPrimary, GlassTokens.textSecondary],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        }
        
        VStack(spacing: 8) {
            Text("Chưa có templates trending")
                .font(.title3.weight(.semibold))
                .foregroundStyle(GlassTokens.textPrimary)
            
            Text("Hãy quay lại sau để xem các templates phổ biến")
                .font(.subheadline)
                .foregroundStyle(GlassTokens.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
        
        // Refresh button
        Button {
            // Retry fetch
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "arrow.clockwise")
                Text("Tải lại")
            }
            .foregroundStyle(GlassTokens.textPrimary)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(.ultraThinMaterial.opacity(0.85), in: Capsule())
            .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
        }
    }
    .frame(maxWidth: .infinity)
    .padding(.vertical, 60)
}
```

## Loading States

Loading states use `HUDGlass` component:

```swift
HUDGlass(text: "Đang tải…")
```

**Features:**
- Circular progress indicator
- Glass background (Capsule shape)
- Subtle animation
- Positioned at top of screen

## State Management

### ViewModel States

`HomeViewModel` manages:
- `isLoading: Bool` - Loading indicator
- `errorMessage: String?` - Error message (nil when no error)
- `trendingTemplates: [TemplateItem]` - Data array (empty when no data)

### State Logic

```swift
if isLoading {
    // Show loading state
} else if let error = errorMessage, !error.isEmpty {
    // Show error banner
} else if templates.isEmpty {
    // Show empty state
} else {
    // Show content
}
```

## API Integration

### No Mock Data Fallback

Previously, `fetchInitial()` provided mock data when API failed. This has been removed:

**Before:**
```swift
func fetchInitial() {
    // Mock data creation...
    self.trendingTemplates = trending
}
```

**After:**
```swift
func fetchInitial() {
    // No mock data - only set error if needed
    isLoading = false
    errorMessage = "Vui lòng đăng nhập để xem templates"
}
```

### API Error Handling

All API calls handle errors properly:

```swift
do {
    let resp = try await repo.listTrendingTemplates(...)
    // Process response
    if items.isEmpty {
        // Clear error, show empty state
        self.errorMessage = nil
    }
} catch {
    // Categorize and set error message
    if let apiError = error as? TemplatesRepository.NetworkError {
        switch apiError {
        case .unauthorized:
            self.errorMessage = "Phiên đăng nhập đã hết hạn..."
        // ... other cases
        }
    }
}
```

## Design System Compliance

All error and empty states use:
- **Colors**: `GlassTokens.textPrimary`, `GlassTokens.textSecondary`
- **Backgrounds**: `.ultraThinMaterial.opacity(0.85)`
- **Borders**: `GlassTokens.borderColor.opacity(0.3)`
- **Spacing**: Consistent padding (20pt horizontal, 60pt vertical for empty states)
- **Typography**: `.title3.weight(.semibold)` for titles, `.subheadline` for subtitles

## Accessibility

- All error messages are readable by VoiceOver
- Empty states include accessibility labels
- Retry buttons have proper accessibility traits
- Loading indicators are accessible

## References

- `AIPhotoApp/AIPhotoApp/ViewModels/HomeViewModel.swift` - Error handling logic
- `AIPhotoApp/AIPhotoApp/Views/Home/HomeView.swift` - Error/empty state UI
- `AIPhotoApp/AIPhotoApp/Views/Common/GlassComponents.swift` - BannerGlass, HUDGlass components

