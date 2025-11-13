import Foundation
import Observation

@Observable
final class LocalizationModel {
    private(set) var language: AppLanguage
    var locale: Locale {
        didSet {
            // Notify SwiftUI via Observation to re-render any views depending on this model
        }
    }
    
    init(initial: AppLanguage = LanguageManager.current()) {
        self.language = initial
        self.locale = Locale(identifier: initial.rawValue)
    }
    
    func setLanguage(_ lang: AppLanguage) {
        language = lang
        locale = Locale(identifier: lang.rawValue)
        // Persist preference and post .languageChanged (for observers outside SwiftUI)
        LanguageManager.apply(lang)
        #if DEBUG
        let code = lang.rawValue
        let path = Bundle.main.path(forResource: code, ofType: "lproj") ?? "nil"
        print("🌐 [i18n] setLanguage → \(code), bundlePath=\(path)")
        #endif
    }
}