//
//  ImageProcessingViewModel.swift
//  imageaiwrapper
//
//  Created by Gemini on 10/12/2025.
//

import Foundation
import SwiftUI
import Combine

import FirebaseAuth

protocol ImageProcessingAPIService {
    func processImage(templateID: String, imagePath: String, idToken: String) async throws -> URL
}

class DefaultImageProcessingAPIService: ImageProcessingAPIService {
    func processImage(templateID: String, imagePath: String, idToken: String) async throws -> URL {
        let requestBody: [String: Any] = ["template_id": templateID, "image_path": imagePath]
        let url = URL(string: "http://localhost:8080/v1/images/process")! // Update as needed
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(idToken)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
        guard let urlString = json?["processed_image_url"] as? String, let processedURL = URL(string: urlString) else {
            throw URLError(.badServerResponse)
        }
        return processedURL
    }
}

@MainActor
class ImageProcessingViewModel: ObservableObject {
    @Published var selectedImage: UIImage?
    @Published var processedImageURL: URL?
    
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var progress: Double = 0.0

    private let apiService: ImageProcessingAPIService

    init(apiService: ImageProcessingAPIService = DefaultImageProcessingAPIService()) {
        self.apiService = apiService
    }

    func processImage(for template: Template) {
        guard let selectedImage else {
            errorMessage = "No image selected."
            return
        }
        
        guard let imageData = selectedImage.jpegData(compressionQuality: 0.8) else {
            errorMessage = "Could not convert image to data."
            return
        }
        
        isLoading = true
        errorMessage = nil
        progress = 0.0
        
        Task {
            do {
                guard let user = FirebaseAuthManager.shared.user else {
                    throw URLError(.userAuthenticationRequired)
                }
                guard let idToken = FirebaseAuthManager.shared.idToken else {
                    throw URLError(.userAuthenticationRequired)
                }

                // 1. Upload image to backend (mocked)
                self.progress = 0.1
                let fileName = "\(UUID().uuidString).jpeg"
                let filePath = "\(user.uid)/\(fileName)"
                // MOCK: Simulate upload delay and return filePath as if uploaded
                try await Task.sleep(nanoseconds: 800_000_000) // 0.8s delay
                self.progress = 0.5 // Mark upload as complete

                // 2. Call backend process-image endpoint via injected service
                let processedURL = try await apiService.processImage(templateID: template.id, imagePath: filePath, idToken: idToken)
                self.processedImageURL = processedURL
                self.progress = 1.0 // Mark process as complete

            } catch {
                print("### Image Processing Error: \(error.localizedDescription)")
                self.errorMessage = error.localizedDescription
            }
            
            isLoading = false
        }
    }
}
