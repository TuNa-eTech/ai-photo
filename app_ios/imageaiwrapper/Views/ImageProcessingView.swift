//
//  ImageProcessingView.swift
//  imageaiwrapper
//
//  Created by Gemini on 10/12/2025.
//

import SwiftUI

struct ImageProcessingView: View {
    let template: Template
    
    @StateObject private var viewModel = ImageProcessingViewModel()
    @State private var showImagePicker = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Template Info
                VStack {
                    AsyncImage(url: URL(string: template.thumbnail_url)) {
                        $0.resizable().aspectRatio(contentMode: .fit)
                    } placeholder: {
                        Rectangle().fill(Color.gray.opacity(0.3))
                    }
                    .frame(height: 200)
                    .cornerRadius(15)
                    
                    Text(template.name)
                        .font(.title)
                        .fontWeight(.bold)
                }
                
                Divider()
                
                // Image Selection
                if let selectedImage = viewModel.selectedImage {
                    Image(uiImage: selectedImage)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .cornerRadius(10)
                        .frame(maxHeight: 300)
                        .onTapGesture { showImagePicker = true }
                } else {
                    Button(action: { showImagePicker = true }) {
                        VStack {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.largeTitle)
                            Text("Select an Image")
                                .font(.headline)
                        }
                        .frame(maxWidth: .infinity, minHeight: 200)
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(10)
                    }
                }
                
                // Processing and Result
                if viewModel.isLoading {
                    VStack {
                        ProgressView(value: viewModel.progress, total: 1.0) {
                            Text(viewModel.progress < 0.5 ? "Uploading..." : "Generating...")
                        }
                        .progressViewStyle(.linear)
                        Text("\(Int(viewModel.progress * 100))%")
                    }
                } else if let processedURL = viewModel.processedImageURL {
                    NavigationLink(
                        destination: ResultView(
                            originalImage: viewModel.selectedImage,
                            processedImageURL: processedURL,
                            onTryAnotherStyle: {
                                // Reset state and pop to previous view
                                viewModel.processedImageURL = nil
                                viewModel.selectedImage = nil
                            }
                        ),
                        isActive: .constant(true),
                        label: {
                            Text("View Result")
                                .font(.headline)
                                .foregroundColor(.green)
                                .padding()
                        }
                    )
                } else {
                    Button(action: { viewModel.processImage(for: template) }) {
                        Text("Generate")
                            .frame(maxWidth: .infinity)
                    }
                    .padding()
                    .foregroundColor(.white)
                    .background(Color.blue)
                    .cornerRadius(10)
                    .disabled(viewModel.selectedImage == nil)
                }
                
                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .padding()
                }
                
                Spacer()
            }
            .padding()
        }
        .navigationTitle("Create")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(image: $viewModel.selectedImage)
        }
    }
}
