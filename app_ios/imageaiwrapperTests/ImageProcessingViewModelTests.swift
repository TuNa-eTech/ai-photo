// ImageProcessingViewModelTests.swift

import XCTest
@testable import imageaiwrapper

final class ImageProcessingViewModelTests: XCTestCase {

    @MainActor
    func testProcessImage_SuccessfulResponse() {
        class MockSuccessAPIService: ImageProcessingAPIService {
            func processImage(templateID: String, imagePath: String, idToken: String) async throws -> URL {
                return URL(string: "https://example.com/processed.jpg")!
            }
        }
        let viewModel = ImageProcessingViewModel(apiService: MockSuccessAPIService())
        let template = Template(id: "1", name: "Test", thumbnail_url: "https://example.com/thumb.jpg")
        viewModel.selectedImage = UIImage(systemName: "photo")
        viewModel.processImage(for: template)
        // Wait for async Task to complete
        let expectation = XCTestExpectation(description: "Wait for processImage")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            XCTAssertEqual(viewModel.processedImageURL?.absoluteString, "https://example.com/processed.jpg")
            XCTAssertNil(viewModel.errorMessage)
            XCTAssertFalse(viewModel.isLoading)
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 2.0)
    }

    @MainActor
    func testProcessImage_ErrorResponse() {
        class MockErrorAPIService: ImageProcessingAPIService {
            func processImage(templateID: String, imagePath: String, idToken: String) async throws -> URL {
                throw URLError(.badServerResponse)
            }
        }
        let viewModel = ImageProcessingViewModel(apiService: MockErrorAPIService())
        let template = Template(id: "1", name: "Test", thumbnail_url: "https://example.com/thumb.jpg")
        viewModel.selectedImage = UIImage(systemName: "photo")
        viewModel.processImage(for: template)
        let expectation = XCTestExpectation(description: "Wait for processImage error")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            XCTAssertNotNil(viewModel.errorMessage)
            XCTAssertNil(viewModel.processedImageURL)
            XCTAssertFalse(viewModel.isLoading)
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 2.0)
    }

    @MainActor
    func testProcessImage_NoSelectedImage() {
        let viewModel = ImageProcessingViewModel(apiService: DefaultImageProcessingAPIService())
        let template = Template(id: "1", name: "Test", thumbnail_url: "https://example.com/thumb.jpg")
        viewModel.selectedImage = nil
        viewModel.processImage(for: template)
        // errorMessage should be set immediately
        XCTAssertNotNil(viewModel.errorMessage, "errorMessage should be set when no image is selected")
    }
}
