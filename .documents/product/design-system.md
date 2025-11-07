# Design System - AIPhotoApp iOS

**Last updated:** 2025-10-28  
**Status:** ✅ Implemented  
**Platform:** iOS SwiftUI App

---

## 🎨 Tổng quan phong cách

**Tên phong cách:** **Liquid Glass Beige Minimalist**

**Tính chất:**
- 🎨 **Beige ấm áp** với gradient tinh tế
- ✨ **Glassmorphism** tối giản (liquid glass effect)
- 🌸 **Minimalist** - giảm visual clutter, tập trung vào nội dung
- 🎯 **Premium** - cảm giác sang trọng, hiện đại
- ♿ **Accessible** - đảm bảo contrast và readability

---

## 🎨 Bảng màu (Color Palette)

### Primary Colors (Beige Theme)

```swift
enum GlassTokens {
    // Primary Colors
    static let primary1 = Color(hex: "#F5E6D3")  // Warm Linen - Màu chính
    static let primary2 = Color(hex: "#D4C4B0")  // Soft Taupe - Màu phụ
    
    // Accent Colors
    static let accent1  = Color(hex: "#F4E4C1")  // Champagne - Nhấn nhá
    static let accent2  = Color(hex: "#E8D5D0")  // Dusty Rose - Accent phụ
    
    // Text Colors (Dark on Light)
    static let textPrimary = Color(hex: "#4A3F35")      // Dark Brown - Text chính
    static let textSecondary = Color(hex: "#7A6F5D")      // Soft Brown - Text phụ
    static let textOnGlass = textPrimary
    
    // Border Color
    static let borderColor = Color(hex: "#998C7A")       // Muted brown - Viền
}
```

### Màu sắc chi tiết

| Màu | Hex | RGB | Mô tả | Usage |
|-----|-----|-----|-------|-------|
| **Warm Linen** | `#F5E6D3` | `rgb(245, 230, 211)` | Màu chính ấm áp | Background cards, primary surfaces |
| **Soft Taupe** | `#D4C4B0` | `rgb(212, 196, 176)` | Màu phụ nhẹ nhàng | Secondary surfaces, overlays |
| **Champagne** | `#F4E4C1` | `rgb(244, 228, 193)` | Accent vàng nhạt | Highlights, accents, animated blobs |
| **Dusty Rose** | `#E8D5D0` | `rgb(232, 213, 208)` | Hồng phấn nhẹ | Accent phụ, decorative elements |
| **Dark Brown** | `#4A3F35` | `rgb(74, 63, 53)` | Text chính | Headings, primary text |
| **Soft Brown** | `#7A6F5D` | `rgb(122, 111, 93)` | Text phụ | Body text, secondary info |

### Gradient Background

```swift
LinearGradient(
    colors: [
        Color(hex: "#FAF2E6"),  // Lightest beige (top)
        GlassTokens.primary1,    // Warm Linen #F5E6D3 (middle)
        GlassTokens.accent1      // Champagne #F4E4C1 (bottom)
    ],
    startPoint: .topLeading,
    endPoint: .bottomTrailing
)
```

**Hiệu ứng:** Gradient mềm mại từ trên xuống dưới, tạo chiều sâu và ấm áp.

---

## ✨ Glass Effects (Glassmorphism)

### Card Glass Properties

```swift
enum GlassTokens {
    // Blur
    static let blurCard: CGFloat = 15      // Giảm từ 25 → 15 (minimalist)
    
    // Shadow (Nhẹ nhàng)
    static let shadowColor = Color.black.opacity(0.15)  // Giảm từ 0.25
    static let shadowRadius: CGFloat = 18                // Giảm từ 25
    static let shadowY: CGFloat = 8                     // Giảm từ 12
    
    // Border
    static let radiusCard: CGFloat = 22   // Bo góc mềm mại
    static let borderWidth: CGFloat = 0.8 // Viền mỏng
    static let borderOpacity: CGFloat = 0.3 // Viền mờ
}
```

### Glass Card Modifier

```swift
.modifier(GlassCardModifier(cornerRadius: 22))
```

**Hiệu ứng:**
- Background: `.ultraThinMaterial` với opacity 0.85
- Border: Beige-brown mờ (opacity 0.3, width 0.8pt)
- Shadow: Đen nhẹ (opacity 0.15, radius 18, y-offset 8)
- Corner radius: 22pt (mềm mại)

---

## 📐 Spacing & Typography

### Spacing System

```swift
enum GlassTokens {
    static let spaceBase: CGFloat = 4  // Base unit
    
    // Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48...
    // Padding cards: 12-16pt
    // Margin sections: 20-24pt
    // Gap items: 8-12pt
}
```

### Typography

**Font:** SF Pro (System font)

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| **Title** | `.title` (28pt) | `.bold` | Screen titles, section headers |
| **Headline** | `.headline` (17pt) | `.semibold` | Card titles, primary text |
| **Subheadline** | `.subheadline` (15pt) | `.regular` | Secondary text, descriptions |
| **Body** | `.body` (17pt) | `.regular` | Body content |
| **Caption** | `.caption` (12pt) | `.regular` | Meta info, tags |
| **Caption2** | `.caption2` (11pt) | `.bold` | Chips, badges |

**Text Colors:**
- Primary text: `GlassTokens.textPrimary` (#4A3F35)
- Secondary text: `GlassTokens.textSecondary` (#7A6F5D)
- On dark overlay: White với shadow

---

## 🎭 Components

### 1. GlassBackgroundView

**Chức năng:** Background chính của app với gradient và animated blobs

```swift
GlassBackgroundView(animated: true)
```

**Đặc điểm:**
- Gradient beige 3 điểm
- 2 animated blobs (Champagne & Dusty Rose)
- Texture overlay nhẹ
- Performance-friendly (có thể tắt animation)

### 2. GlassCardModifier

**Chức năng:** Modifier tạo hiệu ứng glass cho bất kỳ view nào

```swift
.background(.ultraThinMaterial.opacity(0.85))
.overlay(RoundedRectangle(...).stroke(...))
.shadow(...)
```

### 3. CardGlassSmall

**Chức năng:** Card nhỏ cho template grid (2 cột)

**Kích thước:** Height 200pt

**Đặc điểm:**
- Thumbnail image với gradient overlay
- Text overlay màu trắng (khi có image)
- Tag badge (New/Trending)
- NO blur trên image (clarity)

### 4. CardGlassLarge

**Chức năng:** Card lớn cho featured carousel

**Kích thước:** 320x240pt

**Đặc điểm:**
- Parallax effect khi scroll
- Beige tint overlay
- Blur background (15pt)
- Press animation (scale 1.02)

### 5. GlassChip

**Chức năng:** Badge/Tag component

```swift
GlassChip(text: "New", systemImage: "star.fill")
```

**Đặc điểm:**
- Capsule shape
- `.ultraThinMaterial` background
- Beige border
- Icon + text

### 6. GlassCTAButtonStyle

**Chức năng:** Button style cho primary actions

**Đặc điểm:**
- Capsule shape
- Glass material background
- Press animation (scale 0.98)
- Spring animation

### 7. GlassFloatingButton

**Chức năng:** FAB (Floating Action Button)

**Kích thước:** 56x56pt (Circle)

**Đặc điểm:**
- Circular glass button
- Shadow elevation
- Icon centered

---

## 🎬 Animations & Interactions

### Background Blobs

```swift
// Champagne blob
Circle()
    .fill(GlassTokens.accent1.opacity(0.4))
    .blur(radius: 50)
    .animation(.easeInOut(duration: 13).repeatForever(autoreverses: true))

// Dusty Rose blob
Circle()
    .fill(GlassTokens.accent2.opacity(0.3))
    .blur(radius: 60)
    .animation(.easeInOut(duration: 15).repeatForever(autoreverses: true))
```

**Hiệu ứng:** Chuyển động chậm, organic, tạo cảm giác "liquid"

### Card Interactions

**Press State:**
- Scale: 1.02
- Spring animation: `response: 0.25, dampingFraction: 0.85`
- Haptic: Light impact

**Parallax (Large Cards):**
- Offset theo scroll: `x: -minX / 20`
- Tạo chiều sâu khi scroll

### Transitions

**Matched Geometry:**
- Dùng `matchedGeometryEffect` cho transitions giữa list ↔ detail

**Haptic Feedback:**
- Light: Tap cards
- Medium: Primary actions (Create, Favorite)

---

## ♿ Accessibility

### Contrast Ratios

| Combination | Ratio | Status |
|-------------|-------|--------|
| Text Primary (#4A3F35) on Background (#F5E6D3) | ~8.5:1 | ✅ AAA |
| Text Secondary (#7A6F5D) on Background | ~5.2:1 | ✅ AA |
| White text on dark overlay | ~10:1 | ✅ AAA |

**WCAG Compliance:** ✅ AA Minimum, ✅ AAA for primary text

### Dynamic Type Support

- Tất cả text dùng `.font()` system sizes
- Không hardcode font sizes
- Test với large text sizes

### VoiceOver Labels

```swift
.accessibilityLabel(Text("\(title)\(tag.map { ", \($0)" } ?? "")"))
.accessibilityAddTraits(.isButton)
```

**Format:** "Template Name, Tag"

### Hit Targets

- Minimum: 44x44pt (Apple HIG)
- Cards và buttons đảm bảo đủ lớn

---

## 🎯 Design Principles

### 1. Minimalist First
- Giảm visual clutter
- Tập trung vào nội dung
- Space rộng rãi, không chen chúc

### 2. Warm & Inviting
- Beige palette ấm áp
- Gradient mềm mại
- Animated blobs tạo movement

### 3. Glass Premium
- Glassmorphism hiện đại
- Depth qua blur và shadow
- Transparent layers

### 4. Performance Conscious
- Reduced blur (15pt thay vì 25pt)
- Lighter shadows
- Optional animations (có thể tắt)

### 5. Content First
- **NO blur trên images** (clarity)
- Gradient overlay cho text readability
- High contrast text

---

## 📱 Responsive Behavior

### Screen Sizes

| Device | Grid Columns | Card Height |
|--------|--------------|-------------|
| iPhone SE | 2 | 180pt |
| iPhone 13/14/15 | 2 | 200pt |
| iPhone Pro Max | 2 | 220pt |
| iPad | 3-4 | 240pt |

### Adaptive Layouts

- Stack-based trên iPhone SE
- Grid 2 cột trên iPhone thường
- Grid 3-4 cột trên iPad

---

## 🚫 Design Anti-Patterns

### ❌ Không làm:

1. **Không blur images thực**
   ```swift
   // ❌ WRONG
   image.blur(radius: 10)
   
   // ✅ CORRECT
   image.scaledToFill()  // NO blur
   LinearGradient(...)   // Use overlay instead
   ```

2. **Không dùng white text trên light background**
   ```swift
   // ❌ WRONG (low contrast)
   Text("Title").foregroundStyle(.white)  // On beige background
   
   // ✅ CORRECT
   Text("Title").foregroundStyle(GlassTokens.textPrimary)  // Dark brown
   ```

3. **Không overuse blur**
   ```swift
   // ❌ WRONG (heavy performance cost)
   .blur(radius: 30)
   
   // ✅ CORRECT
   .blur(radius: 15)  // Minimalist amount
   ```

4. **Không hardcode colors**
   ```swift
   // ❌ WRONG
   Color(red: 0.96, green: 0.90, blue: 0.83)
   
   // ✅ CORRECT
   GlassTokens.primary1
   ```

---

## 📋 Component Checklist

Khi tạo component mới, đảm bảo:

- [ ] Sử dụng `GlassTokens` cho colors
- [ ] Áp dụng `.glassCard()` modifier
- [ ] Text contrast đạt AA minimum
- [ ] VoiceOver labels đầy đủ
- [ ] Hit target ≥ 44x44pt
- [ ] Dynamic Type support
- [ ] Haptic feedback (nếu là button)
- [ ] Press animation (nếu là interactive)
- [ ] Performance-friendly (minimal blur/shadow)

---

## 📁 File Locations

### Core Design System

```
AIPhotoApp/AIPhotoApp/
├── Views/
│   └── Common/
│       └── GlassComponents.swift     # ✅ Design tokens & components
└── Utilities/
    └── Constants/
        └── AppConfig.swift           # App-wide config
```

### Usage Examples

```swift
// Background
ZStack {
    GlassBackgroundView(animated: true)
    // Content...
}

// Cards
CardGlassSmall(
    title: "Anime Style",
    tag: "Trending",
    thumbnailURL: url,
    thumbnailSymbol: "sparkles"
)

// Buttons
Button("Create") { }
    .buttonStyle(GlassCTAButtonStyle())

// Chips
GlassChip(text: "New", systemImage: "star.fill")
```

---

## 🔄 Design Evolution

### Version History

**v1.0 (2025-10-20):** Initial "Liquid Glass" concept
- Blue/purple gradient
- Heavy blur (25pt)
- White text on glass

**v2.0 (2025-10-26):** Beige Minimalist Redesign ⭐ **Current**
- Beige warm palette
- Reduced blur (15pt)
- Dark text on light
- Minimalist aesthetic

### Future Considerations

- Dark mode support (Phase 2)
- Dynamic themes (user-selectable)
- Reduced motion mode
- High contrast mode

---

## 📚 References

### Documentation
- `.documents/product/ui-ux.md` - UI/UX guidelines
- `.documents/product/ui-home-concept.md` - Home screen concept
- `.implementation_plan/ui-redesign-beige-minimalist.md` - Redesign plan

### Code
- `AIPhotoApp/Views/Common/GlassComponents.swift` - Implementation
- `AIPhotoApp/Views/Home/TemplatesHomeView.swift` - Usage examples

### Standards
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Glassmorphism Design Trend](https://www.figma.com/community/tag/glassmorphism)

---

**Designer Notes:**
- Design system này được implement vào tháng 10/2025
- Phong cách beige minimalist được chọn để tạo cảm giác premium, ấm áp
- Tất cả components đều reusable và maintainable
- Performance được ưu tiên với reduced blur và optimized animations

