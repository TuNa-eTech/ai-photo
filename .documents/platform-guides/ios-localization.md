# iOS Localization: Runtime Language Switching (No Restart)

Status: Adopted
Last updated: 2025-11-13

Overview
- The app supports English (en) and Vietnamese (vi).
- Language switching happens at runtime without app restart.
- We DO NOT mutate AppleLanguages in UserDefaults anymore.

Key Components
- Preference storage: UserDefaults key "app.selectedLanguage" set to "en" or "vi"
- Runtime bundle resolution for NSLocalizedString:
  - L10n.runtimeBundle() picks Bundle for selected language
  - L10n.tr("key") reads localized strings live from the proper .lproj bundle
- SwiftUI live re-render:
  - App root provides LocalizationModel via environment
  - WindowGroup sets environment locale and an .id() keyed by selected language

Implementation References
- Language & storage:
  - [LanguageManager.apply()](AIPhotoApp/AIPhotoApp/Utilities/Localization/LanguageManager.swift:59) persists selection and posts .languageChanged without changing AppleLanguages
  - [LocalizationModel.setLanguage(_:)](AIPhotoApp/AIPhotoApp/Utilities/Localization/LocalizationModel.swift:18) updates model state and calls LanguageManager.apply
- Runtime localization:
  - [L10n.tr(_:)](AIPhotoApp/AIPhotoApp/Utilities/Localization/L10n.swift:35) reads from the selected language bundle
- App root wiring:
  - [AIPhotoAppApp.body](AIPhotoApp/AIPhotoApp/App/AIPhotoAppApp.swift:62) injects LocalizationModel, sets .environment(\.locale, i18n.locale) and .id(i18n.language.rawValue)
  - Removed AppleLanguages mutation in [AIPhotoAppApp.init](AIPhotoApp/AIPhotoApp/App/AIPhotoAppApp.swift:30)
- Login UI language switch:
  - [AuthLandingView](AIPhotoApp/AIPhotoApp/Views/Authentication/AuthLandingView.swift) has a Menu to pick AppLanguage and calls i18n.setLanguage(lang)

Accessibility
- Language menu:
  - accessibilityLabel: l10n.settings.language
  - accessibilityHint: l10n.settings.language.hint
  - accessibilityIdentifier: "language_menu"
- Sign-in buttons:
  - Apple: l10n.auth.signin.apple, l10n.auth.signin.apple.hint, identifier "signin_apple"
  - Google: l10n.auth.google, l10n.auth.google.hint, identifier "signin_google"
- Decorative elements (e.g., BrandLogoView) are marked accessibilityHidden(true)

Localization Keys
- Already present:
  - l10n.settings.language
  - l10n.language.english, l10n.language.vietnamese
  - l10n.auth.google
  - l10n.auth.welcome.to, l10n.auth.subtitle
- Newly added (accessibility):
  - en: l10n.settings.language.hint = "Double-tap to change app language"
  - en: l10n.auth.signin.apple, l10n.auth.signin.apple.hint, l10n.auth.google.hint
  - vi: l10n.settings.language.hint = "Nhấn hai lần để thay đổi ngôn ngữ ứng dụng"
  - vi: l10n.auth.signin.apple, l10n.auth.signin.apple.hint, l10n.auth.google.hint
- Deprecated guidance:
  - UI should not instruct the user to restart the app; l10n.language.restartMessage is legacy and not used

Testing

Unit tests (Swift Testing):
- [LocalizationRuntimeTests](AIPhotoApp/AIPhotoAppTests/LocalizationTests.swift) verifies:
  - L10n.tr returns correct strings for "en" and "vi"
  - Runtime switch from en → vi in same process updates returned string
  - LanguageManager.apply posts .languageChanged and does not change AppleLanguages
Note: Guarded with #if canImport(Testing) for IDE lint compatibility.

UI tests (XCTest):
- [LocalizationUITests](AIPhotoApp/AIPhotoAppUITests/LocalizationUITests.swift) verifies:
  - Language menu and sign-in button identifiers exist
  - Switching to English updates visible UI text (subtitle, Google button title fallback)

Run tests:
- Unit (recommended):
  - cd AIPhotoApp
  - xcodebuild test -scheme AIPhotoApp -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:AIPhotoAppTests -parallel-testing-enabled NO 2>&1 | xcpretty --color --test
- UI:
  - xcodebuild test -scheme AIPhotoApp -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:AIPhotoAppUITests -parallel-testing-enabled NO 2>&1 | xcpretty --color --test

Migration Notes
- Removed AppleLanguages mutation previously used to force language on next launch.
- Delete any UI copy instructing to “restart the app to apply the new language.” Use runtime switch.
- Keep "app.selectedLanguage" preference when migrating from older builds.

FAQ
- Q: Why not set AppleLanguages?
  - A: It requires restart for full effect and may conflict with system locale policies. Our runtime approach is predictable and accessible.
- Q: How to add more languages?
  1) Add new .lproj and Localizable.strings
  2) Extend AppLanguage enum
  3) Provide localized display name keys and menu option
  4) Ensure tests cover new language