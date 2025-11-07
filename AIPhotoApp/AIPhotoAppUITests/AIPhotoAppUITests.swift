//
//  AIPhotoAppUITests.swift
//  AIPhotoAppUITests
//
//  Created by Anh Tu on 18/10/25.
//

import XCTest

final class AIPhotoAppUITests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.

        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    @MainActor
    func testAuthLanding_ShowsHeroAndGoogleButton() throws {
        let app = XCUIApplication()
        app.launch()
        // Verify hero title appears
        XCTAssertTrue(app.staticTexts["Biến ảnh thành phong cách AI"].waitForExistence(timeout: 5))
        // Verify Google sign-in button exists
        XCTAssertTrue(app.buttons["Tiếp tục với Google"].exists)
    }

    @MainActor
    func testAuthLanding_ShowsTermsLinks() throws {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.staticTexts["Điều khoản"].exists)
        XCTAssertTrue(app.staticTexts["Chính sách bảo mật"].exists)
    }

    @MainActor
    func testAuthLanding_LoadingOverlayNotVisibleOnLaunch() throws {
        let app = XCUIApplication()
        app.launch()
        XCTAssertFalse(app.staticTexts["Đang xử lý"].exists)
    }

    @MainActor
    func testAuthLanding_ErrorBannerNotVisibleOnLaunch() throws {
        let app = XCUIApplication()
        app.launch()
        XCTAssertFalse(app.staticTexts["Thông báo lỗi"].exists)
    }

    @MainActor
    func testLaunchPerformance() throws {
        // This measures how long it takes to launch your application.
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }
}
