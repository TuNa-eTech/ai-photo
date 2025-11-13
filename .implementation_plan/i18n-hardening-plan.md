# Implementation Plan: Global i18n Hardening

Status checklist
- [ ] Audit hardcoded UI strings across SwiftUI views
- [ ] Add SwiftLint rule to forbid non-localized literals (exceptions documented for Previews/explicit disables)
- [ ] Backfill missing localization keys (EN + VI)
- [ ] Replace literals in source files with L10n.tr or LocalizedStringKey
- [ ] Add unit tests verifying required keys exist and runtime switching
- [ ] Wire SwiftLint in Xcode Run Script (manual step)

Scope
- iOS app: [AIPhotoApp/AIPhotoApp](AIPhotoApp/AIPhotoApp)
- Localization bundles: [en.lproj/Localizable.strings](AIPhotoApp/AIPhotoApp/Resources/en.lproj/Localizable.strings), [vi.lproj/Localizable.strings](AIPhotoApp/AIPhotoApp/Resources/vi.lproj/Localizable.strings)
- Runtime helper: [L10n.swift](AIPhotoApp/AIPhotoApp/Utilities/Localization/L10n.swift), [LanguageManager.swift](AIPhotoApp/AIPhotoApp/Utilities/Localization/LanguageManager.swift:1)
- Existing tests: [LocalizationTests.swift](AIPhotoApp/AIPhotoAppTests/LocalizationTests.swift), [LocalizationUITests.swift](AIPhotoApp/AIPhotoAppUITests/LocalizationUITests.swift)

References
- Guide: [.documents/platform-guides/ios-localization.md](.documents/platform-guides/ios-localization.md)
- Architecture: [.memory-bank/architecture.md](.memory-bank/architecture.md)

1) Audit results
- Regex used: (Text|Button|Label|NavigationLink|Section|Toggle|Picker|TextField|SecureField|Alert|navigationTitle|title|message)("...")
- Matches found: 81 occurrences
- Top offenders (examples):
  - [CreditsPurchaseView.swift](AIPhotoApp/AIPhotoApp/Views/Credits/CreditsPurchaseView.swift:39) → navigationTitle("Buy Credits"), alerts, section labels
  - [SearchView.swift](AIPhotoApp/AIPhotoApp/Views/Search/SearchView.swift:62) → Text("Search"), accessibility labels, empty states
  - [AllTemplatesView.swift](AIPhotoApp/AIPhotoApp/Views/Home/AllTemplatesView.swift:30) → "Loading templates...", "All Templates", "No Templates Found"
  - [MyProjectsView.swift](AIPhotoApp/AIPhotoApp/Views/Projects/MyProjectsView.swift:31) → "My Projects", delete dialogs, empty state
  - [ProjectDetailView.swift](AIPhotoApp/AIPhotoApp/Views/Projects/ProjectDetailView.swift:52) → "Completed", toolbar, alerts
  - [ResultView.swift](AIPhotoApp/AIPhotoApp/Views/ImageProcessing/ResultView.swift:106) → "Result", "Done", "Saved", permission alerts
  - [ImageProcessingView.swift](AIPhotoApp/AIPhotoApp/Views/ImageProcessing/ImageProcessingView.swift:137) → "Credits", "Retry", "Cancel"
  - [BootstrapViews.swift](AIPhotoApp/AIPhotoApp/Navigation/BootstrapViews.swift:18) → "Đang tải..."
  - [SimpleHeader.swift](AIPhotoApp/AIPhotoApp/Views/Home/Components/SimpleHeader.swift:23) → "Chào %@"
  - [BannerGlass.swift](AIPhotoApp/AIPhotoApp/Views/Common/Overlays/BannerGlass.swift:24) → "Thử lại"
  - [GlassComponents.swift](AIPhotoApp/AIPhotoApp/Views/Common/GlassComponents.swift:378) → debug/status strings

2) Lint rule (SwiftLint) to forbid non-localized literals
- Create [.swiftlint.yml](AIPhotoApp/.swiftlint.yml) with custom rule:
  - Name: i18n_no_hardcoded_string_literals
  - Severity: error
  - Included kinds: string literals in initializers of UI text APIs
  - Allowed:
    - Files or lines annotated with swiftlint:disable i18n_no_hardcoded_string_literals (use for Previews/debug-only)
    - Explicit localized usages: Text(L10n.tr("...")), Text(LocalizedStringKey("...")), String(localized:)
- Note: SwiftLint cannot fully parse context to exclude Previews reliably; use inline disables around PreviewProvider blocks.
- Manual step: Add Xcode Run Script Phase:
  - if which swiftlint >/dev/null; then swiftlint --quiet; else echo "warning: SwiftLint not installed"; fi

3) Backfill keys (EN + VI)
- Add the following keys to both bundles:
  - Common
    - l10n.common.error = "Error" / "Lỗi"
    - l10n.common.save = "Save" / "Lưu"
    - l10n.common.share = "Share" / "Chia sẻ"
    - l10n.common.retry = "Retry" / "Thử lại"
    - l10n.common.loading = "Loading..." / "Đang tải..."
    - l10n.common.seeAll = "See All" / "Xem tất cả"
  - CreditsPurchase
    - l10n.credits.balance = "Credits Balance" / "Số dư Credits"
    - l10n.credits.active = "Active" / "Đang hoạt động"
    - l10n.credits.choosePackage = "Choose a Package" / "Chọn gói"
    - l10n.credits.plan.subtitle = "Select the perfect plan for you" / "Chọn gói phù hợp với bạn"
    - l10n.credits.noProducts = "No products available" / "Không có sản phẩm"
    - l10n.credits.checkConnection = "Please check your connection and try again" / "Vui lòng kiểm tra kết nối và thử lại"
    - l10n.credits.bestValue = "BEST VALUE" / "GIÁ TỐT NHẤT"
    - l10n.credits.perCredit = "%@/credit" / "%@/credit"
    - l10n.credits.xCredits = "%d credits" / "%d credits"
  - Search/AllTemplates
    - l10n.search.title = "Search" / "Tìm kiếm"
    - l10n.search.searching = "Searching…" / "Đang tìm…"
    - l10n.search.tryDifferent = "Try different keywords or filters" / "Hãy thử từ khóa hoặc bộ lọc khác"
    - l10n.search.hint = "Search for templates by name, category, or tag" / "Tìm mẫu theo tên, danh mục hoặc thẻ"
    - l10n.search.categoryFilters = "Category filters" / "Bộ lọc danh mục"
    - l10n.search.templateFilters = "Template filters" / "Bộ lọc mẫu"
    - l10n.search.filter = "Filter" / "Bộ lọc"
    - l10n.templates.loading = "Loading templates..." / "Đang tải danh sách mẫu..."
    - l10n.templates.all = "All Templates" / "Tất cả mẫu"
    - l10n.templates.none = "No Templates Found" / "Không tìm thấy mẫu nào"
    - l10n.templates.loadMore = "Load More" / "Tải thêm"
    - l10n.templates.preview = "Preview" / "Xem trước"
    - l10n.templates.addFavorite = "Add Favorite" / "Thêm yêu thích"
    - l10n.templates.removeFavorite = "Remove Favorite" / "Bỏ yêu thích"
  - Projects
    - l10n.projects.title = "My Projects" / "Dự án của tôi"
    - l10n.projects.completed = "Completed" / "Hoàn thành"
    - l10n.projects.details = "Project Details" / "Chi tiết dự án"
    - l10n.projects.delete = "Delete" / "Xóa"
    - l10n.projects.confirmDelete = "Are you sure you want to delete \"%@\"? This action cannot be undone." / "Bạn có chắc muốn xóa \"%@\"? Hành động này không thể hoàn tác."
    - l10n.projects.deleteFailed = "Delete Failed" / "Xóa thất bại"
    - l10n.projects.noneTitle = "No Projects Yet" / "Chưa có dự án"
    - l10n.projects.noneSubtitle = "Start creating amazing images with AI templates!" / "Bắt đầu tạo ảnh tuyệt vời với các mẫu AI!"
    - l10n.projects.explore = "Explore Templates" / "Khám phá Mẫu"
  - Result/Photo Access
    - l10n.result.title = "Result" / "Kết quả"
    - l10n.result.doubleTapZoom = "Double‑tap to zoom" / "Nhấn đúp để phóng to"
    - l10n.photo.savedTitle = "Saved" / "Đã lưu"
    - l10n.photo.savedMessage = "Image has been saved to your Photos." / "Ảnh đã được lưu vào Ảnh."
    - l10n.photo.permissionTitle = "Permission Required" / "Cần cấp quyền"
    - l10n.photo.permissionMessage = "Please enable photo library access in Settings to save images." / "Vui lòng bật quyền truy cập thư viện ảnh trong Cài đặt để lưu ảnh."
    - l10n.common.settings = "Settings" / "Cài đặt"
    - l10n.common.done = "Done" / "Xong"
  - ImageProcessing
    - l10n.credits.title = "Credits" / "Credits"
    - l10n.credits.get = "Get Credits" / "Mua Credits"
    - l10n.common.retryVerb = "Retry" / "Thử lại"
  - Greetings/Headers
    - l10n.greeting.user = "Hello %@" / "Chào %@"
  - Debug (visible in DEBUG only)
    - l10n.debug.noUrl = "No URL" / "Không có URL"
    - l10n.debug.failedWithError = "Failed: %@" / "Thất bại: %@"
    - l10n.debug.status.ok = "AI Engine: OK • API ~%@ms" / "AI Engine: OK • API ~%@ms"

4) Code changes (targeted first pass)
- Replace literals with L10n.tr in:
  - [Views/Credits/CreditsPurchaseView.swift](AIPhotoApp/AIPhotoApp/Views/Credits/CreditsPurchaseView.swift)
  - [Views/Search/SearchView.swift](AIPhotoApp/AIPhotoApp/Views/Search/SearchView.swift)
  - [Views/Home/AllTemplatesView.swift](AIPhotoApp/AIPhotoApp/Views/Home/AllTemplatesView.swift)
  - [Views/Projects/MyProjectsView.swift](AIPhotoApp/AIPhotoApp/Views/Projects/MyProjectsView.swift)
  - [Views/Projects/ProjectDetailView.swift](AIPhotoApp/AIPhotoApp/Views/Projects/ProjectDetailView.swift)
  - [Views/ImageProcessing/ResultView.swift](AIPhotoApp/AIPhotoApp/Views/ImageProcessing/ResultView.swift)
  - [Views/ImageProcessing/ImageProcessingView.swift](AIPhotoApp/AIPhotoApp/Views/ImageProcessing/ImageProcessingView.swift)
  - [Navigation/BootstrapViews.swift](AIPhotoApp/AIPhotoApp/Navigation/BootstrapViews.swift)
  - [Views/Home/Components/SimpleHeader.swift](AIPhotoApp/AIPhotoApp/Views/Home/Components/SimpleHeader.swift)
  - [Views/Common/Overlays/BannerGlass.swift](AIPhotoApp/AIPhotoApp/Views/Common/Overlays/BannerGlass.swift)
  - [Views/Common/GlassComponents.swift](AIPhotoApp/AIPhotoApp/Views/Common/GlassComponents.swift)
- Add inline `// swiftlint:disable:next i18n_no_hardcoded_string_literals` for any unavoidable literals in Previews or DEBUG-only snippets.

5) Tests
- Extend [AIPhotoAppTests/LocalizationTests.swift](AIPhotoApp/AIPhotoAppTests/LocalizationTests.swift) with:
  - A suite that iterates requiredKeys (list above) and asserts both EN/VI return non-empty values: L10n.tr(key)
- UI: keep [AIPhotoAppUITests/LocalizationUITests.swift](AIPhotoApp/AIPhotoAppUITests/LocalizationUITests.swift) for login; optional follow-up to add a smoke for "My Projects" title in both languages.

6) Rollout
- Commit order:
  1. Add .swiftlint.yml
  2. Backfill Localizable.strings (EN/VI)
  3. Replace literals in source files
  4. Extend tests
- Run:
  - iOS Unit: `xcodebuild test -scheme AIPhotoApp -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:AIPhotoAppTests -parallel-testing-enabled NO | xcpretty`

7) Notes and acceptance
- No user-visible copy changes except replacing identical English/Vietnamese text with localized values.
- All new keys follow l10n.<area>.<name> convention.
- SwiftLint rule enforced at error level; previews must annotate disables if using literals.

Appendix: preview-disable example
```swift
// swiftlint:disable:next i18n_no_hardcoded_string_literals
#Preview {
  Text("Static preview string")
}
```

Owner: iOS
Reviewers: iOS + PM
Links:
- Source audit: [search snapshot](AIPhotoApp/AIPhotoApp/Views/Credits/CreditsPurchaseView.swift:39)