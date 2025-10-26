# Login Screen Mockup - Liquid Glass Beige

**Design**: AuthLandingView.v2.swift  
**Style**: Liquid Glass Beige Minimalist

---

## 📱 Visual Mockup (iPhone 17)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                         ┃
┃   ╔═══════════════════════════════╗   ┃ ← Animated Background
┃   ║ 🎨 Beige Gradient + Blobs     ║   ┃   Warm Linen → Champagne
┃   ║   (Soft, Organic Motion)       ║   ┃   + Floating Circles
┃   ╚═══════════════════════════════╝   ┃
┃                                         ┃
┃              ┌─────────┐               ┃ ← Brand Logo
┃              │  ✨ AI  │               ┃   Glass circle + icon
┃              │         │               ┃   Scale animation
┃              └─────────┘               ┃
┃                                         ┃
┃   ╔═══════════════════════════════╗   ┃
┃   ║                               ║   ┃
┃   ║      Chào mừng đến            ║   ┃ ← Glass Card
┃   ║      AIPhotoApp               ║   ┃   (.ultraThinMaterial)
┃   ║                               ║   ┃   + Beige tint overlay
┃   ║ Biến ảnh thành phong cách AI ║   ┃   + White border glow
┃   ║                               ║   ┃
┃   ║ ┌─────────────────────────┐ ║   ┃
┃   ║ │  Sign in with Apple    │ ║   ┃ ← Apple Button
┃   ║ └─────────────────────────┘ ║   ┃   Black + glass overlay
┃   ║                               ║   ┃   Press animation
┃   ║ ┌─────────────────────────┐ ║   ┃
┃   ║ │ 🔷 Tiếp tục với Google  │ ║   ┃ ← Google Button
┃   ║ └─────────────────────────┘ ║   ┃   White glass + border
┃   ║                               ║   ┃
┃   ║   Điều khoản • Chính sách   ║   ┃ ← Legal Links
┃   ║                               ║   ┃
┃   ╚═══════════════════════════════╝   ┃
┃                                         ┃
┃                                         ┃
┃                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🎨 Color Breakdown

### Background (Animated)
```
┌─────────────────────────────────────┐
│  Gradient:                          │
│  ┌─────┐ Top-Left                   │
│  │ #FDF │ Lightest Beige (98%)      │
│  │  ↓  │                             │
│  │ #F5E │ Warm Linen                 │
│  │  ↓  │ GlassTokens.primary1        │
│  │ #F4E │ Champagne                  │
│  └─────┘ Bottom-Right               │
│                                      │
│  Animated Blobs:                    │
│  • Blob 1: Champagne (40% opacity)  │
│    280x280, blur 50, 13s animation  │
│  • Blob 2: Dusty Rose (30% opacity) │
│    320x320, blur 60, 15s animation  │
└─────────────────────────────────────┘
```

### Glass Card
```
┌─────────────────────────────────────┐
│ Material: .ultraThinMaterial        │
│ Overlay: Beige tint gradient        │
│  • Primary1 (#F5E6D3) @ 15%         │
│  • Accent1 (#F4E4C1) @ 10%          │
│                                      │
│ Border: White gradient              │
│  • Top-Left: white 40%              │
│  • Bottom-Right: white 10%          │
│  • Width: 1.5pt                     │
│                                      │
│ Shadow:                              │
│  • Color: Dark Brown (#4A3F35) 12%  │
│  • Radius: 30pt                     │
│  • Y Offset: 15pt                   │
│                                      │
│ Corner Radius: 28pt (continuous)    │
│ Padding: 32pt                       │
└─────────────────────────────────────┘
```

### Brand Logo
```
    ┌─────────────┐
    │ ╭─────────╮ │
    │ │    ✨   │ │ ← Circle 100x100
    │ │ sparkles │ │   .ultraThinMaterial
    │ ╰─────────╯ │   White border (opacity 0.4)
    └─────────────┘   Shadow: radius 20, y:10
    
    Icon: 50x50 SF Symbol "sparkles"
    Gradient: Primary1 → Accent2
```

### Apple Button
```
┌─────────────────────────────────────┐
│   Sign in with Apple              │
│                                      │
│ Background: Black                   │
│ Overlay: None (native)              │
│ Height: 56pt                        │
│ Border: White 30% opacity, 1.5pt    │
│ Shadow: Dark 15%, radius 15, y:8    │
│ Corner Radius: 16pt                 │
└─────────────────────────────────────┘
```

### Google Button
```
┌─────────────────────────────────────┐
│  🔷 Tiếp tục với Google            │
│                                      │
│ Background: White                   │
│ Overlay: .ultraThinMaterial 40%    │
│ Text: Dark Brown (#4A3F35)          │
│ Icon: Google "G" (24x24)            │
│ Height: 56pt                        │
│ Border: White 30% (→ 60% pressed)   │
│ Shadow: Dark 15%, radius 15, y:8    │
│ Press Scale: 0.98                   │
│ Corner Radius: 16pt                 │
└─────────────────────────────────────┘
```

---

## 🎬 Animations

### 1. **On Appear**
```
Timeline:
0.0s  Screen loads
      └─ Background gradient visible
0.1s  Logo animation starts
      └─ Scale: 0.8 → 1.0
      └─ Opacity: 0 → 1
      └─ Duration: 0.8s spring
0.3s  Card animation starts
      └─ Offset Y: +30 → 0
      └─ Opacity: 0 → 1
      └─ Duration: 0.8s spring
1.1s  All animations complete
```

### 2. **Background Blobs** (Continuous)
```
Blob 1 (Champagne):
• Move: (-100, -140) ↔ (70, -30)
• Duration: 13s
• Easing: easeInOut
• Repeat: Forever (autoReverse)

Blob 2 (Dusty Rose):
• Move: (110, 130) ↔ (-70, 50)
• Duration: 15s
• Easing: easeInOut
• Repeat: Forever (autoReverse)
```

### 3. **Button Press**
```
Tap → Pressed State:
• Scale: 1.0 → 0.98
• Shadow radius: 15 → 12
• Shadow Y: 8 → 6
• Border opacity: 0.3 → 0.6
• Duration: 0.15s
• Haptic: Light impact

Release → Normal State:
• All values reverse
• Duration: 0.15s
```

### 4. **Loading State**
```
Overlay appears:
• Fade in: 0.3s
• Background: Black 15% opacity
• Glass HUD: .ultraThinMaterial
  - ProgressView (spinning)
  - "Đang xử lý..." text
  - Padding: 24pt
  - Shadow: radius 30
```

### 5. **Error Banner**
```
Slide in from top:
• Initial: Y offset -100
• Final: Y offset 0
• Duration: 0.4s spring
• Background: Red 90% opacity
• Overlay: .ultraThinMaterial 20%
• Auto-dismiss: 5 seconds
• Slide out: Reverse animation
```

---

## 📐 Layout Specifications

### Spacing
```
Top Safe Area
    ↓ 60pt
Brand Logo (100x100)
    ↓ 32pt
Glass Card
│ ├─ Padding: 32pt
│ │
│ ├─ Hero Text
│ │    ├─ "Chào mừng đến" (.title2)
│ │    ├─ 8pt spacing
│ │    ├─ "AIPhotoApp" (.largeTitle.bold)
│ │    ├─ 4pt spacing
│ │    └─ Subtitle (.body)
│ │
│ ├─ 32pt spacing
│ │
│ ├─ Apple Button (56pt height)
│ ├─ 16pt spacing
│ ├─ Google Button (56pt height)
│ │
│ ├─ 32pt spacing
│ │
│ └─ Legal Links (.caption)
│
└─ Card ends
    ↓ 40pt
Bottom
```

### Horizontal Padding
```
Screen Edge
├─ 24pt padding
│   ├─ Glass Card (full width minus padding)
│   └─ 24pt padding
Screen Edge
```

---

## 🎯 Interactive States

### Apple Button
```
State         Scale   Shadow   Border
─────────────────────────────────────
Idle          1.0     r:15     0.3
Pressed       0.98    r:12     0.3
```

### Google Button
```
State         Scale   Shadow   Border    BG Opacity
─────────────────────────────────────────────────
Idle          1.0     r:15     0.3       0.4
Hover         1.0     r:18     0.4       0.3
Pressed       0.98    r:12     0.6       0.5
```

### Error Banner
```
Event         Position    Opacity   Duration
─────────────────────────────────────────────
Appear        Y:-100→0    0→1       0.4s
Visible       Y:0         1         5.0s
Dismiss       Y:0→-100    1→0       0.4s
```

---

## ♿ Accessibility

### VoiceOver Labels
```
Brand Logo:
  "AIPhotoApp logo"

Apple Button:
  "Sign in with Apple"
  Hint: "Double tap to sign in with your Apple ID"

Google Button:
  "Tiếp tục với Google"
  Hint: "Double tap to sign in with your Google account"

Legal Links:
  "Điều khoản"
  Hint: "Opens terms of service"
  
  "Chính sách"
  Hint: "Opens privacy policy"

Error Banner:
  Label: "Thông báo lỗi"
  Hint: [Error message content]
  Action: "Dismiss error message"
```

### Dynamic Type
```
Font Scaling:
- Hero Title: .title2 → scales automatically
- Brand Name: .largeTitle → scales automatically
- Subtitle: .body → scales automatically
- Buttons: .headline → scales automatically
- Legal: .caption → scales automatically

Min size: 12pt (caption)
Max size: 34pt (largeTitle)
```

### Contrast Ratios
```
Text on Glass Card:
- Primary text (#4A3F35) on white: 9.2:1 ✅ AAA
- Secondary text (#7A6F5D) on white: 5.1:1 ✅ AA

Buttons:
- Apple: White on black: 21:1 ✅ AAA
- Google: Dark Brown (#4A3F35) on white: 9.2:1 ✅ AAA
```

---

## 💡 Design Decisions

### Why Beige Palette?
- **Premium**: Warm, sophisticated, luxury feel
- **Calming**: Not aggressive, welcoming
- **On-brand**: Matches Home screen aesthetic
- **Unique**: Stands out from typical blue/white auth screens

### Why Animated Blobs?
- **Engaging**: Subtle motion keeps user interested
- **Modern**: Current design trend (2025)
- **Performance**: 2 blobs @ 13-15s is battery-friendly
- **Organic**: Soft movement feels natural, not mechanical

### Why Glass Effects?
- **Depth**: Creates visual hierarchy
- **Modern**: iOS glassmorphism is familiar to users
- **Lightweight**: Feels airy, not heavy
- **Elegant**: Sophisticated without being overdone

### Why Large Buttons (56pt)?
- **Touch Target**: Exceeds 44x44pt accessibility minimum
- **Prominence**: Clear call-to-action
- **Error Prevention**: Harder to mis-tap
- **Premium**: Generous spacing feels luxurious

---

## 🚀 Implementation Notes

### Performance
- Blob animations: 60fps on iPhone 13+
- Glass blur: Hardware-accelerated
- Spring animations: Native SwiftUI (performant)
- No custom shaders (good battery life)

### Compatibility
- iOS 17.0+ (uses .ultraThinMaterial)
- iPhone SE → iPhone 17 Pro Max
- Portrait orientation only (auth screen)
- Dark mode: Not implemented (use light mode)

### Testing Checklist
- [ ] Test on iPhone SE (small screen)
- [ ] Test on iPhone 17 Pro Max (large screen)
- [ ] Test with VoiceOver enabled
- [ ] Test with Dynamic Type at max size
- [ ] Test with Reduce Motion enabled
- [ ] Test Google sign-in flow
- [ ] Test Apple sign-in flow
- [ ] Test error banner appearance
- [ ] Test loading overlay appearance
- [ ] Verify 60fps animations

---

## 📊 Comparison: Old vs New

| Feature | Old Design | New Design (V2) |
|---------|------------|-----------------|
| Background | White/plain | Animated beige gradient + blobs |
| Brand | No logo | Glass logo with animation |
| Card | None | Glass card with beige tint |
| Buttons | Basic bordered | Glass buttons with press states |
| Typography | Standard | Hierarchical with bold titles |
| Animation | None | Logo scale, card slide, blob motion |
| Loading | Basic HUD | Glass overlay with blur |
| Error | Red box | Glass banner with dismiss |
| Feel | Functional | Premium, engaging, modern |

---

**Ready for implementation!** 🎨✨

Next steps:
1. Test in Xcode Preview
2. Test on real device
3. Gather user feedback
4. Iterate if needed

