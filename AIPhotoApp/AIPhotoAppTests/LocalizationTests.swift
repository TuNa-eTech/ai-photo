#if canImport(Testing)
import Testing
import Foundation
@testable import AIPhotoApp

@Suite("Localization Runtime Switching")
struct LocalizationRuntimeTests {
    @Test("L10n.tr returns English when selectedLanguage=en")
    func testL10nEnglish() {
        let defaults = UserDefaults.standard
        defaults.set("en", forKey: "app.selectedLanguage")
        let value = L10n.tr("l10n.auth.google")
        #expect(value == "Continue with Google")
    }

    @Test("L10n.tr returns Vietnamese when selectedLanguage=vi")
    func testL10nVietnamese() {
        let defaults = UserDefaults.standard
        defaults.set("vi", forKey: "app.selectedLanguage")
        let value = L10n.tr("l10n.auth.google")
        #expect(value == "Tiếp tục với Google")
    }

    @Test("L10n.tr switches at runtime within same process")
    func testRuntimeSwitch() {
        let defaults = UserDefaults.standard
        defaults.set("en", forKey: "app.selectedLanguage")
        let en = L10n.tr("l10n.auth.google")
        defaults.set("vi", forKey: "app.selectedLanguage")
        let vi = L10n.tr("l10n.auth.google")
        #expect(en == "Continue with Google")
        #expect(vi == "Tiếp tục với Google")
        #expect(en != vi)
    }
}

@Suite("LocalizationModel Behavior")
@MainActor
struct LocalizationModelTests {
    @Test("setLanguage updates language, locale and persists")
    func testSetLanguageUpdatesAndPersists() {
        let defaults = UserDefaults.standard
        defaults.removeObject(forKey: "app.selectedLanguage")
        let model = LocalizationModel(initial: .english)
        #expect(model.language == .english)
        #expect(model.locale.identifier == "en")
        model.setLanguage(.vietnamese)
        #expect(model.language == .vietnamese)
        #expect(model.locale.identifier == "vi")
        let stored = defaults.string(forKey: "app.selectedLanguage")
        #expect(stored == "vi")
    }

    @Test("LanguageManager.apply posts .languageChanged with code payload and does not mutate AppleLanguages")
    func testLanguageManagerNotificationsAndNoAppleLanguagesMutation() async {
        let defaults = UserDefaults.standard
        // Seed AppleLanguages to a known value
        defaults.set(["en"], forKey: "AppleLanguages")

        var notified = false
        var payload: String?
        let token = NotificationCenter.default.addObserver(forName: .languageChanged, object: nil, queue: .main) { note in
            notified = true
            payload = note.userInfo?["language"] as? String
        }

        LanguageManager.apply(.vietnamese)
        // Allow notification to fire
        try? await Task.sleep(nanoseconds: 20_000_000)

        #expect(notified == true)
        #expect(payload == "vi")

        // AppleLanguages must remain unchanged (no restart-dependent mutation)
        let appleLang = defaults.array(forKey: "AppleLanguages") as? [String]
        #expect(appleLang == ["en"])

        NotificationCenter.default.removeObserver(token)
    }
}
#endif
#if canImport(Testing)
import Testing
import Foundation
@testable import AIPhotoApp

@Suite("Localization Required Keys")
struct LocalizationRequiredKeysTests {
    // Keys exercised by i18n hardening
    private let requiredKeys: [String] = [
        // Common
        "l10n.common.error","l10n.common.save","l10n.common.share","l10n.common.retry","l10n.common.loading",
        "l10n.common.seeAll","l10n.common.settings","l10n.common.done","l10n.common.fav","l10n.common.ok","l10n.common.close",
        // CreditsPurchaseView
        "l10n.credits.buyTitle","l10n.credits.balance","l10n.credits.active","l10n.credits.choosePackage","l10n.credits.plan.subtitle",
        "l10n.credits.noProducts","l10n.credits.checkConnection","l10n.credits.bestValue","l10n.credits.perCredit","l10n.credits.xCredits",
        // Search / Templates
        "l10n.search.title","l10n.search.searching","l10n.search.tryDifferent","l10n.search.hint","l10n.search.categoryFilters",
        "l10n.search.templateFilters","l10n.search.filter","l10n.search.start","l10n.search.noResults","l10n.search.prompt",
        "l10n.templates.loading","l10n.templates.all","l10n.templates.none","l10n.templates.loadMore","l10n.templates.preview",
        "l10n.templates.addFavorite","l10n.templates.removeFavorite",
        // Projects
        "l10n.projects.title","l10n.projects.completed","l10n.projects.details","l10n.projects.delete","l10n.projects.deleteTitle",
        "l10n.projects.confirmDelete","l10n.projects.deleteFailed","l10n.projects.noneTitle","l10n.projects.noneSubtitle","l10n.projects.explore",
        // Result / Photo permissions
        "l10n.result.title","l10n.result.doubleTapZoom","l10n.photo.savedTitle","l10n.photo.savedMessage",
        "l10n.photo.permissionTitle","l10n.photo.permissionMessage",
        // Image Processing / Credits
        "l10n.credits.title","l10n.credits.get","l10n.common.retryVerb",
        // Greeting
        "l10n.greeting.user",
        // Debug
        "l10n.debug.noUrl","l10n.debug.failedWithError","l10n.debug.status.ok",
        // Processing titles/messages
        "l10n.processing.title.ready","l10n.processing.title.preparing","l10n.processing.title.uploading",
        "l10n.processing.title.processing","l10n.processing.title.background","l10n.processing.title.completed","l10n.processing.title.failed",
        "l10n.processing.msg.idle","l10n.processing.msg.preparing","l10n.processing.msg.uploading","l10n.processing.msg.processing",
        "l10n.processing.msg.background","l10n.processing.msg.completed"
    ]

    @Test("All required keys resolve in English (non-fallback)")
    func testEnglishKeys() {
        UserDefaults.standard.set("en", forKey: "app.selectedLanguage")
        for key in requiredKeys {
            let value = L10n.tr(key)
            #expect(!value.isEmpty, "\(key) should not be empty (EN)")
            #expect(value != key, "\(key) unresolved (EN)")
        }
    }

    @Test("All required keys resolve in Vietnamese (non-fallback)")
    func testVietnameseKeys() {
        UserDefaults.standard.set("vi", forKey: "app.selectedLanguage")
        for key in requiredKeys {
            let value = L10n.tr(key)
            #expect(!value.isEmpty, "\(key) should not be empty (VI)")
            #expect(value != key, "\(key) unresolved (VI)")
        }
    }
}
#endif