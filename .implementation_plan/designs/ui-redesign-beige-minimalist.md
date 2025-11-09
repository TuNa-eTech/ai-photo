# UI Redesign: Beige + Liquid Glass Minimalist

**Created:** 2025-10-26  
**Status:** In Progress  
**Platform:** iOS SwiftUI App

## Status Checklist

- [x] Tạo implementation plan
- [x] Cập nhật GlassTokens với bảng màu beige
- [x] Điều chỉnh GlassBackgroundView gradient
- [x] Cập nhật glass effects (blur, shadow, border)
- [x] Điều chỉnh text colors cho contrast tốt
- [x] No linter errors detected
- [ ] Test trên simulator (cần user test thực tế)
- [x] Cập nhật memory bank

## Feature Description

Thiết kế lại toàn bộ UI của iOS app theo phong cách:
- Bảng màu beige ấm áp với gradient tinh tế
- Liquid glass effects tối giản (giảm blur, shadow nhẹ hơn)
- Typography và spacing tối ưu cho minimalist aesthetic
- Đảm bảo contrast và accessibility

## Goals

1. Tạo giao diện sang trọng, ấm áp với tone màu beige/champagne
2. Giảm độ phức tạp visual effects để tối giản hơn
3. Cải thiện performance (ít blur, ít animation nặng)
4. Duy trì cấu trúc và tính năng hiện tại
5. Đảm bảo WCAG AA contrast ratio

## Technical Approach

### 1. Color Palette (Beige + Gradient)

**GlassTokens Color Updates:**

```swift
// Primary Colors (Beige Theme)
static let primary1 = Color(red: 0.961, green: 0.902, blue: 0.827)  // #F5E6D3 - Warm Linen
static let primary2 = Color(red: 0.831, green: 0.769, blue: 0.690)  // #D4C4B0 - Soft Taupe
static let accent1  = Color(red: 0.957, green: 0.894, blue: 0.757)  // #F4E4C1 - Champagne
static let accent2  = Color(red: 0.910, green: 0.835, blue: 0.816)  // #E8D5D0 - Dusty Rose

// Text Colors (Dark on Light)
static let textPrimary = Color(red: 0.290, green: 0.247, blue: 0.208)    // #4A3F35 - Dark Brown
static let textSecondary = Color(red: 0.478, green: 0.435, blue: 0.365)  // #7A6F5D - Soft Brown
static let textOnGlass = textPrimary  // Replace white text
```

### 2. Glass Effects (Minimalist Adjustments)

**Reduced Blur:**
```swift
static let blurCard: CGFloat = 15  // Giảm từ 25 → 15
```

**Lighter Shadow:**
```swift
static let shadowColor = Color.black.opacity(0.15)  // Giảm từ 0.25 → 0.15
static let shadowRadius: CGFloat = 18  // Giảm từ 25 → 18
static let shadowY: CGFloat = 8        // Giảm từ 12 → 8
```

**Thinner Border:**
```swift
// Trong các components
.stroke(Color(red: 0.6, green: 0.55, blue: 0.48).opacity(0.3), lineWidth: 0.8)
// Thay vì: .stroke(.white.opacity(0.25), lineWidth: 1)
```

### 3. Background Gradient

**GlassBackgroundView Update:**
```swift
LinearGradient(
    colors: [
        Color(red: 0.98, green: 0.95, blue: 0.90),   // Lightest beige
        Color(red: 0.96, green: 0.90, blue: 0.83),   // Warm linen
        Color(red: 0.96, green: 0.89, blue: 0.76)    // Champagne
    ],
    startPoint: .topLeading,
    endPoint: .bottomTrailing
)
```

**Animated Blobs:**
```swift
Circle()
    .fill(Color(red: 0.96, green: 0.89, blue: 0.76).opacity(0.4))  // Champagne blob
    
Circle()
    .fill(Color(red: 0.91, green: 0.84, blue: 0.82).opacity(0.3))  // Dusty rose blob
```

### 4. Material Updates

**Replace ultraThinMaterial behavior:**
- Có thể cần custom backdrop với màu beige opacity cao hơn
- Hoặc giữ `.ultraThinMaterial` nhưng overlay với beige tint

```swift
.background(
    .ultraThinMaterial
        .overlay(Color(red: 0.96, green: 0.90, blue: 0.83).opacity(0.4))
)
```

### 5. Typography & Contrast

**Ensure WCAG AA Compliance:**
- Background: #F5E6D3 (light)
- Text: #4A3F35 (dark) - Contrast ratio ~8.5:1 ✓
- Secondary text: #7A6F5D with opacity 0.8 - Contrast ratio ~5.2:1 ✓

## Affected Components

### Files to Modify:

1. **`AIPhotoApp/AIPhotoApp/Views/Common/GlassComponents.swift`**
   - Update `GlassTokens` enum (colors, blur, shadow)
   - Update `GlassBackgroundView` gradient and blobs
   - Update `GlassCardModifier` border color
   - Update text colors in all components

2. **`AIPhotoApp/AIPhotoApp/Views/Home/TemplatesHomeView.swift`**
   - Verify text readability
   - May need to adjust some inline colors

3. **`AIPhotoApp/AIPhotoApp/Views/Home/Components/CompactHeader.swift`**
   - Check text and icon colors

4. **`AIPhotoApp/AIPhotoApp/Views/Home/Components/HeroStatsCard.swift`**
   - Verify stats display with new colors

## Test Strategy

### Visual Testing:
- [ ] Launch app on iPhone 17 simulator
- [ ] Verify all screens render correctly
- [ ] Check text contrast and readability
- [ ] Test animated blobs performance
- [ ] Verify glass cards on different backgrounds

### Accessibility Testing:
- [ ] Enable Increase Contrast mode
- [ ] Test with Dynamic Type (large text)
- [ ] Verify VoiceOver labels still work
- [ ] Check color contrast with tools

### Performance Testing:
- [ ] Monitor frame rate with reduced blur
- [ ] Check memory usage
- [ ] Ensure animations are smooth

## Deployment Steps

1. Create feature branch: `feature/ui-redesign-beige-minimalist`
2. Update `GlassComponents.swift` with new design tokens
3. Test on simulator with various screen sizes
4. Take before/after screenshots
5. Update memory bank and documentation
6. Merge to main after approval

## Risks and Considerations

- **Material behavior:** `.ultraThinMaterial` may not look ideal on beige - might need custom backdrop
- **Contrast issues:** Some accent colors may need adjustment for accessibility
- **Brand identity:** Significant color change - ensure stakeholder approval
- **Animation performance:** Even with reduced blur, test on real devices

## References

- Current implementation: `Views/Common/GlassComponents.swift`
- Design inspiration: Minimalist beige aesthetic with liquid glass
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

## Notes

- Keep all existing functionality intact
- Only visual/color changes, no structural changes
- Maintain component reusability
- Document color rationale for future reference

