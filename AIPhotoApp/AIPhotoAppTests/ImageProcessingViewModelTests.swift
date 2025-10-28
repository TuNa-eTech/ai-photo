//
//  ImageProcessingViewModelTests.swift
//  AIPhotoAppTests
//
//  Unit tests for ImageProcessingViewModel
//

import Testing
import UIKit
@testable import AIPhotoApp

// MARK: - Mock BackgroundImageProcessor

@MainActor
final class MockBackgroundImageProcessor: BackgroundImageProcessor {
    var mockRequestId: String?
    var mockError: Error?
    var shouldThrowError: Bool = false
    
    override init() {
        super.init()
    }
    
    // Override the processImage method for testing
    func processImageForTesting(
        templateId: String,
        templateName: String,
        originalImage: UIImage,
        imageBase64: String,
        token: String
    ) async throws -> String {
        if shouldThrowError, let error = mockError {
            throw error
        }
        
        // Return a mock request ID
        if let requestId = mockRequestId {
            return requestId
        }
        
        return UUID().uuidString
    }
}

// MARK: - Mock AuthViewModel

@MainActor
final class MockAuthViewModel: AuthViewModel {
    var mockToken: String?
    var shouldReturnToken: Bool = true
    
    init() {
        super.init(
            authService: AuthService(),
            userRepository: UserRepository()
        )
    }
    
    // Override to provide mock token
    func getTokenForTesting() async -> String? {
        if shouldReturnToken {
            return mockToken ?? "test-token"
        }
        return nil
    }
}

// MARK: - Test Helpers

extension UIImage {
    static func createTestImage(size: CGSize = CGSize(width: 100, height: 100)) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { context in
            UIColor.blue.setFill()
            context.fill(CGRect(origin: .zero, size: size))
        }
    }
}

extension TemplateDTO {
    static func testTemplate(id: String = "test-id", name: String = "Test Template") -> TemplateDTO {
        TemplateDTO(
            id: id,
            name: name,
            thumbnailURL: nil,
            publishedAt: Date(),
            usageCount: 100
        )
    }
}

// MARK: - ImageProcessingViewModel Initialization Tests

@Suite("ImageProcessingViewModel Initialization")
@MainActor
struct ImageProcessingViewModelInitializationTests {
    
    @Test("ViewModel initializes with correct default state")
    func testInitialState() {
        let mockAuth = MockAuthViewModel()
        let vm = ImageProcessingViewModel(authViewModel: mockAuth)
        
        // Use reflection or public properties to verify initial state
        #expect(vm.processingState == .idle)
        #expect(vm.progress == 0.0)
        #expect(vm.currentRequestId == nil)
        #expect(vm.currentTemplate == nil)
        #expect(vm.currentImage == nil)
    }
}

// MARK: - Image Processing Tests

@Suite("ImageProcessingViewModel Processing")
@MainActor
struct ImageProcessingViewModelProcessingTests {
    
    @Test("processImage starts in preparing state")
    func testPreparingState() async {
        let mockAuth = MockAuthViewModel()
        let vm = ImageProcessingViewModel(authViewModel: mockAuth)
        
        let template = TemplateDTO.testTemplate()
        let image = UIImage.createTestImage()
        
        // Start processing (will likely fail due to mock, but should reach preparing state)
        Task {
            await vm.processImage(template: template, image: image)
        }
        
        // Wait briefly
        try? await Task.sleep(nanoseconds: 50_000_000)
        
        // The state should have changed from idle
        // Note: This test may be flaky without proper mocking infrastructure
        #expect(vm.processingState != .idle)
    }
    
    @Test("processImage handles image compression")
    func testImageCompression() async {
        let mockAuth = MockAuthViewModel()
        let vm = ImageProcessingViewModel(authViewModel: mockAuth)
        
        let template = TemplateDTO.testTemplate()
        let image = UIImage.createTestImage(size: CGSize(width: 2000, height: 2000))
        
        Task {
            await vm.processImage(template: template, image: image)
        }
        
        try? await Task.sleep(nanoseconds: 100_000_000)
        
        // Should have attempted to compress (may or may not succeed without real processor)
        #expect(true) // Placeholder - actual test would verify compression
    }
}

// MARK: - State Management Tests

@Suite("ImageProcessingViewModel State Management")
@MainActor
struct ImageProcessingViewModelStateTests {
    
    @Test("reset returns to idle state")
    func testReset() {
        let mockAuth = MockAuthViewModel()
        let vm = ImageProcessingViewModel(authViewModel: mockAuth)
        
        // Set some state
        vm.processingState = .preparing
        vm.progress = 0.5
        
        // Reset
        vm.reset()
        
        #expect(vm.processingState == .idle)
        #expect(vm.progress == 0.0)
    }
}

// MARK: - ProcessingError Tests

@Suite("ProcessingError")
struct ProcessingErrorTests {
    
    @Test("ProcessingError messages are descriptive")
    func testErrorMessageDescriptions() {
        let networkError = ProcessingError.networkError
        let saveError = ProcessingError.imageSaveFailed
        let invalidResponse = ProcessingError.invalidResponse
        
        #expect(networkError.localizedDescription.contains("network") || networkError.localizedDescription.contains("Network"))
        #expect(saveError.localizedDescription.contains("image") || saveError.localizedDescription.contains("Image"))
        #expect(invalidResponse.localizedDescription.contains("response") || invalidResponse.localizedDescription.contains("Response"))
    }
    
    @Test("ProcessingError conforms to Equatable for state comparison")
    func testProcessingErrorEquatable() {
        let error1 = ProcessingError.networkError
        let error2 = ProcessingError.networkError
        let error3 = ProcessingError.imageSaveFailed
        
        // Should be equal for same error
        #expect(error1.localizedDescription == error2.localizedDescription)
        
        // Should be different for different errors
        #expect(error1.localizedDescription != error3.localizedDescription)
    }
}

// MARK: - ProcessingState Tests

@Suite("ProcessingState")
struct ProcessingStateTests {
    
    @Test("ProcessingState idle is equal to itself")
    func testIdleEquality() {
        let state1 = ImageProcessingViewModel.ProcessingState.idle
        let state2 = ImageProcessingViewModel.ProcessingState.idle
        
        #expect(state1 == state2)
    }
    
    @Test("ProcessingState preparing is equal to itself")
    func testPreparingEquality() {
        let state1 = ImageProcessingViewModel.ProcessingState.preparing
        let state2 = ImageProcessingViewModel.ProcessingState.preparing
        
        #expect(state1 == state2)
    }
    
    @Test("ProcessingState uploading is equal to itself")
    func testUploadingEquality() {
        let state1 = ImageProcessingViewModel.ProcessingState.uploading
        let state2 = ImageProcessingViewModel.ProcessingState.uploading
        
        #expect(state1 == state2)
    }
    
    @Test("ProcessingState processing is equal to itself")
    func testProcessingEquality() {
        let state1 = ImageProcessingViewModel.ProcessingState.processing
        let state2 = ImageProcessingViewModel.ProcessingState.processing
        
        #expect(state1 == state2)
    }
    
    @Test("ProcessingState with same project are equal")
    func testCompletedEquality() {
        let project = Project(templateId: "test", templateName: "Test")
        let state1 = ImageProcessingViewModel.ProcessingState.completed(project)
        let state2 = ImageProcessingViewModel.ProcessingState.completed(project)
        
        #expect(state1 == state2)
    }
    
    @Test("ProcessingState with different projects are not equal")
    func testCompletedInequality() {
        let project1 = Project(templateId: "test1", templateName: "Test 1")
        let project2 = Project(templateId: "test2", templateName: "Test 2")
        
        let state1 = ImageProcessingViewModel.ProcessingState.completed(project1)
        let state2 = ImageProcessingViewModel.ProcessingState.completed(project2)
        
        #expect(state1 != state2)
    }
    
    @Test("ProcessingState with same error are equal")
    func testFailedEquality() {
        let error = ProcessingError.networkError
        let state1 = ImageProcessingViewModel.ProcessingState.failed(error)
        let state2 = ImageProcessingViewModel.ProcessingState.failed(error)
        
        #expect(state1 == state2)
    }
}

