//
//  HomeViewModel.swift
//  imageaiwrapper
//
//  Created by Gemini on 10/12/2025.
//

import Foundation
import Combine
import Supabase

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
                let templates: [Template] = try await supabase
                    .from("templates")
                    .select("id, name, thumbnail_url")
                    .execute()
                    .value
                
                self.templates = templates
            } catch {
                print("### Error fetching templates: \(error.localizedDescription)")
                self.errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
}
