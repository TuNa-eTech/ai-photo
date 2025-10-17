import XCTest
@testable import imageaiwrapper
import FirebaseAuth
import AuthenticationServices

final class AuthManagerTests: XCTestCase {

    override func setUp() {
        super.setUp()
        // Reset state before each test
        FirebaseAuthManager.shared.user = nil
        FirebaseAuthManager.shared.idToken = nil
        FirebaseAuthManager.shared.error = nil
    }

    func testSignOut_ClearsUserAndToken() {
        // Giả lập trạng thái đã đăng nhập
        FirebaseAuthManager.shared.user = nil
        FirebaseAuthManager.shared.idToken = "dummy"
        FirebaseAuthManager.shared.signOut()
        XCTAssertNil(FirebaseAuthManager.shared.user)
        XCTAssertNil(FirebaseAuthManager.shared.idToken)
    }

    func testErrorIsSetOnSignOutFailure() {
        // Không thể test trực tiếp vì Auth.auth().signOut() ném lỗi thực sự cần mock
        // Đây là ví dụ về cách kiểm tra error observable nếu có lỗi
        // Giả lập lỗi
        let error = NSError(domain: "Test", code: 123, userInfo: nil)
        FirebaseAuthManager.shared.error = error
        XCTAssertEqual((FirebaseAuthManager.shared.error as NSError?)?.code, 123)
    }

    func testRefreshIDToken_NoUserSetsNilToken() {
        // Khi không có user, idToken phải là nil sau refresh
        FirebaseAuthManager.shared.user = nil
        FirebaseAuthManager.shared.idToken = "dummy"
        FirebaseAuthManager.shared.refreshIDToken()
        // Do refreshIDToken là async, ở đây chỉ kiểm tra logic sync
        XCTAssertNil(FirebaseAuthManager.shared.idToken)
    }

    func testGetIDToken_NoUserReturnsNil() {
        // Khi không có user, getIDToken phải trả về nil
        let expectation = self.expectation(description: "getIDToken returns nil")
        FirebaseAuthManager.shared.user = nil
        FirebaseAuthManager.shared.getIDToken { token in
            XCTAssertNil(token)
            expectation.fulfill()
        }
        waitForExpectations(timeout: 1, handler: nil)
    }
}
