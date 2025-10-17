//
//  HomeViewModel.swift
//  imageaiwrapper
//
//  Created by Gemini on 10/12/2025.
//

import Foundation
import Combine

@MainActor
class HomeViewModel: ObservableObject {
    @Published var templates: [Template] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func fetchTemplates() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                // Example: Replace with your backend API call using Firebase ID token
                guard FirebaseAuthManager.shared.idToken != nil else {
                    throw URLError(.userAuthenticationRequired)
                }
                // TODO: Replace with real API call to your Go backend, passing idToken in Authorization header
                // let templates = try await MyAPI.fetchTemplates(idToken: idToken)
                // self.templates = templates
                self.templates = [] // Placeholder
            } catch {
                print("### Error fetching templates: \(error.localizedDescription)")
                self.errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
}
