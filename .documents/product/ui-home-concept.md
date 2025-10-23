# UI Home Concept — “Liquid Glass” (Glassmorphism)

Trạng thái: Draft  
Phiên bản: 1.0  
Cập nhật: 2025-10-20

Tài liệu này mô tả định hướng thiết kế màn hình Home của AIPhotoApp theo phong cách hiện đại “liquid glass” (glassmorphism). Là nguồn tham chiếu duy nhất cho UI/UX Home, dùng để thống nhất mục tiêu, ngôn ngữ thị giác, bố cục, tương tác, accessibility, hiệu năng, và các chuẩn tái sử dụng trước khi triển khai.

Lưu ý quan trọng:
- Không hiển thị “System Status” (vendor/third-party) cho end-user trong môi trường production.
- Cho phép Debug Overlay chỉ trong build DEBUG, nội bộ, ẩn sau cử chỉ/bật Developer Mode; nội dung trung lập (không nêu tên vendor).

---

## 1) Mục tiêu & phạm vi

Mục tiêu trải nghiệm:
- Vào app thấy ngay hành động chính: chọn template + bắt đầu tạo ảnh AI.
- Giới thiệu template nổi bật, cá nhân hóa lời chào, hiển thị kết quả gần đây (optional).
- Cảm giác hiện đại, nhẹ nhàng, đổ bóng mềm, kính mờ + nền gradient “chất lỏng”.
- Tránh lộ hạ tầng/nhà cung cấp; thông điệp lỗi/offline trung lập, dễ hiểu.

Phạm vi màn hình Home:
- Header (avatar, greeting, actions).
- Search + Filters (pill search, segmented filters).
- Featured Carousel (card lớn dạng glass, parallax nhẹ).
- Template Grid (2 cột card kính nhỏ).
- Primary CTA (“Create”) dạng FAB glass hoặc Bottom Bar glass.
- Recent Results (tuỳ chọn).
- Debug Overlay (chỉ DEBUG, nội bộ).

---

## 2) Bố cục & cấu trúc nội dung

### 2.1 Bố cục tổng quát
- Header:
  - Trái: avatar user (nhỏ).
  - Giữa/Trên: lời chào cá nhân (“Xin chào, {Tên} 👋”), phụ đề (“Sẵn sàng tạo phong cách ảnh hôm nay?”).
  - Phải: action (Settings/Notifications).
- Search + Filters:
  - Thanh search (pill): “Search styles or tags…”.
  - Segmented: All • Trending • New • Favorites.
- Featured Carousel:
  - 3–5 item nằm ngang, card lớn glass, parallax 10–16 pt, badge “New/Popular”.
- Template Grid:
  - 2 cột card kính nhỏ, thumbnail mờ nền + label, tag.
  - Long-press → Quick Actions (Preview, Add to Favorites).
- Primary CTA:
  - Floating “Create” glass button, hoặc Bottom Dock glass (Home • Gallery • Create • Templates • Profile).
- Recent Results (tuỳ chọn):
  - Dải ngang ảnh đã xử lý gần đây (glass frame), tap mở chi tiết/chia sẻ.

### 2.2 Sơ đồ (Mermaid)
```mermaid
flowchart TD
  A[Header] --> B[SearchBar + Filters]
  B --> C[Featured Carousel]
  C --> D[Template Grid]
  D --> E[Recent Results (optional)]
  E --> F[FAB 'Create' / Bottom Glass Bar]

  classDef glass fill:#ffffff22,stroke:#ffffff40,color:#fff
  class A,B,C,D,E,F glass
```

---

## 3) Ngôn ngữ thị giác (Liquid Glass)

### 3.1 Nền
- Gradient đa điểm (blue → purple → cyan) + noise rất nhẹ (~1–2%).
- Chuyển động “blob” chậm, organic (easeInOut 10–14s, repeatForever).

### 3.2 Card kính
- Nền: `.ultraThinMaterial` + blur radius 20–30.
- Overlay: LinearGradient trắng 6–14% opacity để tạo highlight nhẹ.
- Viền: 1 px trắng mờ (`opacity ~0.25`).
- Shadow: đổ mềm (y: 8–14, blur: 20–30, opacity ~0.15).
- Inner highlight (top) rất subtle.

### 3.3 Màu sắc (Tokens)
- Primary: Electric Blue `#4DA3FF` → Neon Purple `#A259FF`
- Accent: Cyan `#32E0C4`, Magenta `#FF4D9A`
- Text trên kính: Trắng 90% (fallback tăng lớp darken khi cần để đảm bảo tương phản).

### 3.4 Typography
- SF Pro Text:
  - Title 1/2 cho greeting/section headline.
  - Subheadline/Footnote cho phụ đề/chips.

### 3.5 Iconography
- SF Symbols mảnh (thin/regular), stroke rõ ràng trên nền kính.

---

## 4) Tương tác & animation

- Parallax carousel: offset 10–16 pt theo scroll.
- Press state card: scale 1.02, tăng viền + blur nhẹ.
- Transition chi tiết: `matchedGeometryEffect` giữa thumbnail ↔ detail.
- Haptic:
  - light impact cho tap card.
  - medium cho Add to Favorites / Create.
- Scroll behavior:
  - Header co lại (collapsible), gradient nền biến thiên nhẹ theo scroll.

---

## 5) Trạng thái hệ thống & thông điệp

- Loading:
  - Skeleton glass cards shimmer.
  - HUD glass (blur + spinner mảnh).
- Empty:
  - Minh hoạ mềm + CTA “Create your first AI style”.
- Error:
  - Banner glass (red tint) + nút “Thử lại”, thông điệp trung lập (không nêu kỹ thuật).
- Offline:
  - Chip “Không có kết nối Internet”, disable các hành động mạng.

Quan trọng: Không hiển thị thông tin third-party. Thông điệp trung lập, dễ hiểu.

---

## 6) Accessibility

- Dynamic Type: đảm bảo scale text tốt.
- Contrast: text ≥ 4.5:1 trên nền kính (tăng layer darken nếu cần).
- VoiceOver:
  - Card: “Anime Style, mới, 120k lượt dùng, double-tap để tạo.”
- Hit target ≥ 44x44 pt.

---

## 7) Hiệu năng & kỹ thuật

- Tối ưu blur/shadow:
  - Giới hạn số layer blur lớn đồng thời.
  - Dùng ảnh thumbnail phù hợp kích thước (avoid oversize).
- Preload carousel & grid theo viewport.
- Tối ưu animation (blob/background) ở 60 fps, giảm khi Low Power Mode nếu cần.

---

## 8) Debug Overlay (chỉ DEBUG)

- Không xuất hiện trong Production.
- Ẩn sau cử chỉ (ví dụ: triple-tap avatar) hoặc toggle Developer Mode.
- Nội dung trung lập (không nêu vendor):
  - “AI Engine: OK • API ~54ms”
- Dùng `#if DEBUG` để bảo vệ; ghi chú trong code & tài liệu.

Snippet minh hoạ:
```swift
struct DebugOverlay: View {
    var body: some View {
        Text("AI Engine: OK • API ~54ms")
            .font(.caption2)
            .padding(8)
            .background(.ultraThinMaterial, in: Capsule())
            .overlay(Capsule().stroke(.white.opacity(0.25), lineWidth: 1))
            .padding()
    }
}
```

---

## 9) Thành phần tái sử dụng (Design System mini)

- GlassBackgroundView
  - Gradient + noise + animated blobs (enable/disable theo performance).
- GlassCardModifier
  - Áp dụng blur, overlay, stroke, shadow tiêu chuẩn.
- GlassChip
  - Capsule + `.ultraThinMaterial`, dùng cho badge/trạng thái.
- GlassButton
  - CTA kính (FAB hoặc button bar).
- CardGlassSmall / CardGlassLarge
  - Small: dùng cho Template Grid.
  - Large: dùng cho Featured Carousel (có parallax).

Ví dụ GlassCard nhỏ:
```swift
struct GlassCard: View {
    let title: String
    let image: Image
    var body: some View {
        ZStack(alignment: .bottomLeading) {
            image
                .resizable()
                .scaledToFill()
                .overlay(.ultraThinMaterial)
                .blur(radius: 10)
                .clipped()
            VStack(alignment: .leading, spacing: 6) {
                Text(title).font(.headline).foregroundStyle(.white)
                HStack(spacing: 4) {
                    Image(systemName: "flame").imageScale(.small)
                    Text("Trending")
                }
                .font(.caption2).foregroundStyle(.white.opacity(0.9))
                .padding(.horizontal, 8).padding(.vertical, 4)
                .background(.ultraThinMaterial, in: Capsule())
            }
            .padding(12)
        }
        .frame(height: 180)
        .background(RoundedRectangle(cornerRadius: 20).fill(.ultraThinMaterial))
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(.white.opacity(0.25), lineWidth: 1))
        .shadow(color: .black.opacity(0.25), radius: 25, x: 0, y: 12)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .contentShape(RoundedRectangle(cornerRadius: 20))
    }
}
```

---

## 10) Tokens (đề xuất)

- Color
  - `--color-primary-1: #4DA3FF`
  - `--color-primary-2: #A259FF`
  - `--color-accent-1: #32E0C4`
  - `--color-accent-2: #FF4D9A`
  - `--color-text-on-glass: rgba(255,255,255,0.9)`
- Spacing
  - Base = 4 pt; scale: 4, 8, 12, 16, 20, 24, 32
- Radius
  - Card: 20 pt; Chip/Button: Capsule
- Blur
  - Card: 25 ±5 (tuỳ performance)
- Shadow
  - Card: black 25% @ radius 25, y: 12

---

## 11) Khả năng mở rộng

- Recent Results có thể thay bằng “Collections” trong tương lai.
- Bottom Bar glass có thể chuyển thành TabView glass tùy roadmap.
- Hỗ trợ theme động (đổi gradient cơ sở).

---

## 12) Hook dữ liệu & logic

- HomeViewModel:
  - fetchTemplates (All/Trending/New/Favorites), loading/error/empty states.
  - recentResults (optional).
- Networking:
  - Tận dụng APIClient & envelope khi backend sẵn sàng.
  - Tạm thời mock JSON cho UI dev nhanh.
- Không hiển thị vendor/third-party trong UI, thông điệp lỗi trung lập.

---

## 13) Chấp nhận/Acceptance Criteria

- UI hiển thị đầy đủ các Section theo bố cục.
- Card kính có blur/overlay/stroke/shadow đúng thông số.
- Tương tác (parallax, press state, transition) hoạt động mượt trên iPhone 13–16.
- Accessibility đạt yêu cầu: Dynamic Type, contrast, VoiceOver labels.
- Không lộ thông tin third-party ở Production.
- Debug Overlay chỉ xuất hiện trong DEBUG, ẩn mặc định.

---

## 14) Hạng mục tiếp theo

- Wireframe chi tiết (kích thước, spacing, states) → file bổ sung.
- Token hoá chính thức (màu/spacing/typography) → đồng bộ vào codebase.
- Kế hoạch triển khai: `.implementation_plan/home-screen-plan.md` (checklist, milestones, test).
- Tạo SwiftUI skeleton (HomeView, GlassBackgroundView, GlassCard modifiers, v.v.) + Preview.
