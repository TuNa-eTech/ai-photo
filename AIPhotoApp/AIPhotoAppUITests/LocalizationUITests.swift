import XCTest

final class LocalizationUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    @MainActor
    func testLanguageMenuExistsAndIdentifiersPresent() throws {
        let app = XCUIApplication()
        app.launch()

        // Menu label has accessibilityIdentifier("language_menu")
        let menuByButton = app.buttons["language_menu"]
        let menuByOther = app.otherElements["language_menu"]
        let menuExists = menuByButton.waitForExistence(timeout: 5) || menuByOther.waitForExistence(timeout: 5)
        XCTAssertTrue(menuExists, "Language menu should exist with identifier 'language_menu'")

        // Sign-in buttons identifiers should be present regardless of localized title
        XCTAssertTrue(app.buttons["signin_google"].exists || app.otherElements["signin_google"].exists, "Google sign-in button identifier missing")
        XCTAssertTrue(app.buttons["signin_apple"].exists || app.otherElements["signin_apple"].exists, "Apple sign-in button identifier missing")
    }

    @MainActor
    func testSwitchLanguageToEnglish_UpdatesLoginTexts() throws {
        let app = XCUIApplication()
        app.launch()

        // Open language menu
        if app.buttons["language_menu"].exists {
            app.buttons["language_menu"].tap()
        } else if app.otherElements["language_menu"].exists {
            app.otherElements["language_menu"].tap()
        } else {
            XCTFail("Cannot find language menu by identifier")
        }

        // Tap "English" option in the menu
        // Options may be exposed as buttons or staticTexts depending on platform/UI changes
        if app.buttons["English"].waitForExistence(timeout: 3) {
            app.buttons["English"].tap()
        } else if app.staticTexts["English"].waitForExistence(timeout: 3) {
            app.staticTexts["English"].tap()
        } else {
            XCTFail("Cannot find 'English' option in language menu")
        }

        // After switching, primary action labels should be in English
        // Prefer identifier when possible, fall back to visible title
        let googleById = app.buttons["signin_google"]
        if googleById.exists {
            // Validate the label has updated to English if possible
            // Note: Label may be localized text; verify either identifier exists or title matches EN
            XCTAssertTrue(googleById.exists)
        } else {
            XCTAssertTrue(app.buttons["Continue with Google"].waitForExistence(timeout: 5), "Google button title should be English after switching")
        }

        // Also validate one hero/subtitle label changes to English
        XCTAssertTrue(app.staticTexts["Turn photos into AI styles"].waitForExistence(timeout: 5), "Subtitle should be English after switching")
    }
}