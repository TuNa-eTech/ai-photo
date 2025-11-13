import Foundation

/// App-supported languages
enum AppLanguage: String, CaseIterable {
    case english = "en"
    case vietnamese = "vi"
    
    /// Localized display name for language using runtime-selected bundle (no dependency on L10n to avoid cycles)
    var localizedDisplayName: String {
        // Determine selected language code
        let code: String = {
            if let stored = UserDefaults.standard.string(forKey: "app.selectedLanguage"), !stored.isEmpty {
                return stored
            }
            let preferred = Locale.preferredLanguages.first ?? "en"
            return preferred.hasPrefix("vi") ? "vi" : "en"
        }()
        // Resolve bundle for that language
        let bundle: Bundle = {
            if let path = Bundle.main.path(forResource: code, ofType: "lproj"),
               let b = Bundle(path: path) {
                return b
            }
            return .main
        }()
        switch self {
        case .english:
            return NSLocalizedString("l10n.language.english", tableName: nil, bundle: bundle, value: "English", comment: "English language name")
        case .vietnamese:
            return NSLocalizedString("l10n.language.vietnamese", tableName: nil, bundle: bundle, value: "Tiếng Việt", comment: "Vietnamese language name")
        }
    }
}

/// Notification posted when language preference has been changed
extension Notification.Name {
    static let languageChanged = Notification.Name("app.language.changed")
}

/**
 Lightweight manager to persist and broadcast language preference.

 Runtime localization is handled by L10n.runtimeBundle() + SwiftUI Locale.
 No AppleLanguages mutation; changes take effect immediately without restart.
 */
enum LanguageManager {
    private static let selectedLanguageKey = "app.selectedLanguage"
    
    /// Get current app language preference (falls back to system preferred)
    static func current() -> AppLanguage {
        if let stored = UserDefaults.standard.string(forKey: selectedLanguageKey),
           let lang = AppLanguage(rawValue: stored) {
            return lang
        }
        // Fallback: infer from preferred languages
        let preferred = Locale.preferredLanguages.first ?? "en"
        if preferred.hasPrefix("vi") { return .vietnamese }
        return .english
    }
    
    /// Apply new language selection:
    /// - Persists custom key "app.selectedLanguage"
    /// - Posts .languageChanged notification (for UI and services to react immediately)
    static func apply(_ language: AppLanguage) {
        // Persist our own flag
        UserDefaults.standard.set(language.rawValue, forKey: selectedLanguageKey)
        
        // No AppleLanguages mutation. Runtime localization via L10n + SwiftUI Locale.
        
        // Notify observers (views can show "Restart required" alert)
        NotificationCenter.default.post(name: .languageChanged, object: nil, userInfo: [
            "language": language.rawValue
        ])
    }
}