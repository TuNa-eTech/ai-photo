import Foundation

/// Runtime localization helper that reads strings from the currently selected language bundle,
/// without requiring an app restart. Use L10n.tr("key") everywhere.
enum L10n {
    // Keep an internal copy of the preference key to avoid coupling to LanguageManager.
    private static let selectedLanguageKey = "app.selectedLanguage"
    
    /// Determine the currently selected language code (e.g., "en", "vi")
    private static func selectedLanguageCode() -> String {
        if let stored = UserDefaults.standard.string(forKey: selectedLanguageKey), !stored.isEmpty {
            return stored
        }
        if let preferred = Locale.preferredLanguages.first, preferred.hasPrefix("vi") {
            return "vi"
        }
        return "en"
    }
    
    /// Resolve the bundle for the current language at runtime (falls back to main bundle)
    private static func runtimeBundle() -> Bundle {
        let code = selectedLanguageCode()
        if let path = Bundle.main.path(forResource: code, ofType: "lproj"),
           let bundle = Bundle(path: path) {
            return bundle
        }
        return Bundle.main
    }
    
    /// Locale that matches the selected in-app language (used for String(format:))
    private static func selectedLocale() -> Locale {
        Locale(identifier: selectedLanguageCode())
    }
    
    /// Return localized string for key using current language bundle
    static func tr(_ key: String, comment: String = "") -> String {
        let format = NSLocalizedString(key, tableName: nil, bundle: runtimeBundle(), value: key, comment: comment)
        return format
    }
    
    /// Return formatted localized string with arguments
    static func tr(_ key: String, _ args: CVarArg..., comment: String = "") -> String {
        let format = NSLocalizedString(key, tableName: nil, bundle: runtimeBundle(), value: key, comment: comment)
        return String(format: format, locale: selectedLocale(), arguments: args)
    }
}