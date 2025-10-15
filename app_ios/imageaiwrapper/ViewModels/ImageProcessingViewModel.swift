//
//  ImageProcessingViewModel.swift
//  imageaiwrapper
//
//  Created by Gemini on 10/12/2025.
//

import Foundation
import SwiftUI
import Supabase
import Combine

@MainActor
class ImageProcessingViewModel: ObservableObject {
    @Published var selectedImage: UIImage?
    @Published var processedImageURL: URL?
    
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var progress: Double = 0.0

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
                guard let user = try? await supabase.auth.user() else {
                    // This error should ideally not happen if the user is in HomeView
                    throw URLError(.userAuthenticationRequired)
                }

                // 1. Upload image to Supabase Storage
                self.progress = 0.1
                let fileName = "\(UUID().uuidString).jpeg"
                let filePath = "\(user.id)/\(fileName)"
                
                try await supabase.storage
                    .from("user-uploads")
                    .upload(filePath, data: imageData, options: .init(contentType: "image/jpeg"))
                
                self.progress = 0.5 // Mark upload as complete
                
                // 2. Call the Edge Function
                let requestBody = ["template_id": template.id, "image_path": filePath]
                let jsonData = try JSONSerialization.data(withJSONObject: requestBody, options: [])
                let options = FunctionInvokeOptions(body: jsonData)
                let response: [String: String] = try await supabase.functions.invoke(
                    "process-image",
                    options: options
                )
                
                guard let urlString = response["processed_image_url"], let url = URL(string: urlString) else {
                    throw URLError(.badServerResponse)
                }
                
                self.processedImageURL = url
                self.progress = 1.0 // Mark process as complete

            } catch {
                print("### Image Processing Error: \(error.localizedDescription)")
                self.errorMessage = error.localizedDescription
            }
            
            isLoading = false
        }
    }
}