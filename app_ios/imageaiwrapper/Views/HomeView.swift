//
//  HomeView.swift
//  imageaiwrapper
//
//  Created by Gemini on 10/12/2025.
//

import SwiftUI
struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    
    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]
    
    var body: some View {
        NavigationView {
            VStack {
                if viewModel.isLoading {
                    ProgressView("Loading Templates...")
                } else if let errorMessage = viewModel.errorMessage {
                    VStack {
                        Text("Error")
                            .font(.headline)
                            .foregroundColor(.red)
                        Text(errorMessage)
                            .padding()
                        Button("Retry") {
                            viewModel.fetchTemplates()
                        }
                    }
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 20) {
                            ForEach(viewModel.templates) { template in
                                NavigationLink(destination: ImageProcessingView(template: template)) {
                                    TemplateCard(template: template)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Choose a Style")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Sign Out") {
                        FirebaseAuthManager.shared.signOut()
                    }
                    .foregroundColor(.red)
                }
            }
            .onAppear {
                viewModel.fetchTemplates()
            }
        }
    }
}

struct TemplateCard: View {
    let template: Template
    
    var body: some View {
        VStack {
            // Use a placeholder if the URL is invalid or fails to load
            AsyncImage(url: URL(string: template.thumbnail_url)) {
                $0.resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .overlay(Image(systemName: "photo"))
            }
            .frame(height: 150)
            .cornerRadius(10)
            
            Text(template.name)
                .font(.headline)
                .lineLimit(1)
        }
    }
}

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}
