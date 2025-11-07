//
//  TemplateSelectionView.swift
//  AIPhotoApp
//
//  Intermediate screen: Template selected, now pick image to process
//

import SwiftUI
import PhotosUI
import UniformTypeIdentifiers
#if canImport(UIKit)
import UIKit
#endif

struct TemplateSelectionView: View {
    let template: TemplateDTO
    let authViewModel: AuthViewModel
    
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var selectedImage: UIImage?
    @State private var showImageProcessing: Bool = false
    @State private var loadErrorMessage: String?
    @State private var showLoadErrorAlert: Bool = false
    @State private var completedProject: Project?
    @State private var showResult: Bool = false
    
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                VStack(spacing: 24) {
                    // Template info
                    templateInfo
                    
                    // Instructions
                    instructions
                    
                    // Image picker
                    imagePickerSection
                    
                    
                    Spacer()
                }
                .padding(24)
            }
            .navigationTitle("Select Image")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onChange(of: selectedPhotoItem) { oldValue, newValue in
                Task {
                    guard let item = newValue else { return }
                    
                    // 1) Try Transferable wrapper (best for HEIC/iCloud)
                    if let picked = try? await item.loadTransferable(type: PickedPhoto.self) {
                        selectedImage = picked.image
                        showImageProcessing = true
                        return
                    }
                    
                    // 2) Try URL (iCloud download fallback)
                    if let url = try? await item.loadTransferable(type: URL.self),
                       let data = try? Data(contentsOf: url),
                       let image = UIImage(data: data) {
                        selectedImage = image
                        showImageProcessing = true
                        return
                    }
                    
                    // 3) Try raw Data
                    if let data = try? await item.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        selectedImage = image
                        showImageProcessing = true
                        return
                    }
                    
                    // If all attempts fail, show a friendly message
                    loadErrorMessage = "Cannot load this image. If it’s stored in iCloud, please download it first and try again."
                    showLoadErrorAlert = true
                }
            }
            .sheet(isPresented: $showImageProcessing) {
                if let image = selectedImage {
                    ImageProcessingView(template: template, image: image, authViewModel: authViewModel)
                }
            }
            .onReceive(NotificationCenter.default.publisher(for: .imageProcessingCompleted)) { notif in
                if let project = notif.userInfo?["project"] as? Project {
                    completedProject = project
                    showImageProcessing = false
                    showResult = true
                }
            }
            .fullScreenCover(isPresented: $showResult) {
                if let project = completedProject, let image = selectedImage {
                    ResultView(project: project, originalImage: image)
                }
            }
            .alert("Cannot load image", isPresented: $showLoadErrorAlert) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(loadErrorMessage ?? "Unknown error")
            }
        }
    }
    
    // MARK: - Views
    
    private var templateInfo: some View {
        VStack(spacing: 16) {
            // Template thumbnail
            Group {
                if let url = template.thumbnailURL {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                        case .failure, .empty:
                            templateIcon
                        @unknown default:
                            templateIcon
                        }
                    }
                } else {
                    templateIcon
                }
            }
            .frame(height: 120)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            
            Text(template.name)
                .font(.title2.bold())
                .foregroundStyle(GlassTokens.textPrimary)
            
            if template.isNew {
                Label("New Template", systemImage: "sparkles")
                    .font(.subheadline)
                    .foregroundStyle(GlassTokens.accent1)
            }
        }
        .padding()
        .glassCard()
    }
    
    private var templateIcon: some View {
        Image(systemName: "wand.and.stars")
            .font(.system(size: 60))
            .foregroundStyle(
                LinearGradient(
                    colors: [GlassTokens.primary1, GlassTokens.accent1],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
    }
    
    private var instructions: some View {
        VStack(spacing: 12) {
            Text("Select an image to process")
                .font(.headline)
                .foregroundStyle(GlassTokens.textPrimary)
            
            Text("Choose a photo from your library to apply \(template.name) style")
                .font(.subheadline)
                .foregroundStyle(GlassTokens.textSecondary)
                .multilineTextAlignment(.center)
        }
    }
    
    private var imagePickerSection: some View {
        VStack(spacing: 16) {
            if let image = selectedImage {
                // Preview selected image
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(maxHeight: 300)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(alignment: .topTrailing) {
                        Button(action: {
                            selectedImage = nil
                            selectedPhotoItem = nil
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.title2)
                                .foregroundStyle(GlassTokens.textPrimary)
                                .background(.ultraThinMaterial.opacity(0.9), in: Circle())
                                .overlay(Circle().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
                                .padding(8)
                        }
                    }
                
                // Process button
                processButton
            } else {
                // Image picker button
                PhotosPicker(
                    selection: $selectedPhotoItem,
                    matching: .images
                ) {
                    VStack(spacing: 16) {
                        // Icon with background circle for better contrast
                        ZStack {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [
                                            GlassTokens.accent1.opacity(0.3),
                                            GlassTokens.accent2.opacity(0.2)
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 80, height: 80)
                            
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.system(size: 40, weight: .medium))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [
                                            GlassTokens.textPrimary,
                                            GlassTokens.textSecondary
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                        }
                        
                        Text("Pick an Image")
                            .font(.headline)
                            .foregroundStyle(GlassTokens.textPrimary)
                        
                        Text("Tap to select from your library")
                            .font(.subheadline)
                            .foregroundStyle(GlassTokens.textSecondary)
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 200)
                    .padding(.vertical, 20)
                    .background(
                        .ultraThinMaterial.opacity(0.7),
                        in: RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous)
                            .stroke(
                                LinearGradient(
                                    colors: [
                                        GlassTokens.borderColor.opacity(0.4),
                                        GlassTokens.borderColor.opacity(0.2)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1.5
                            )
                    )
                    .shadow(
                        color: GlassTokens.shadowColor,
                        radius: GlassTokens.shadowRadius,
                        x: 0,
                        y: GlassTokens.shadowY
                    )
                }
            }
        }
    }
    
    private var processButton: some View {
        Button(action: {
            guard selectedImage != nil else { return }
            showImageProcessing = true
        }, label: {
            HStack {
                Text("Process Image")
                    .font(.headline)
                Image(systemName: "wand.and.stars")
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(.ultraThinMaterial.opacity(0.85))
                    LinearGradient(
                        colors: [GlassTokens.primary1.opacity(0.2), GlassTokens.accent1.opacity(0.2)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8)
            )
            .foregroundStyle(GlassTokens.textPrimary)
        })
        .disabled(selectedImage == nil)
        .opacity(selectedImage == nil ? 0.5 : 1.0)
    }
}

//// Transferable wrapper to robustly import various image representations (HEIC/iCloud)
private struct PickedPhoto: Transferable {
    let image: UIImage
    
    static var transferRepresentation: some TransferRepresentation {
        DataRepresentation(importedContentType: .image) { data in
            guard let img = UIImage(data: data) else {
                throw NSError(domain: "ImageImport", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unsupported image data"])
            }
            return PickedPhoto(image: img)
        }
    }
}

#Preview {
    // Create mock template JSON
    let jsonData = """
    {
        "id": "test",
        "name": "Anime Style",
        "thumbnail_url": null,
        "published_at": "\(ISO8601DateFormatter().string(from: Date()))",
        "usage_count": 150
    }
    """.data(using: .utf8)!
    
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    
    let mockTemplate = try! decoder.decode(TemplateDTO.self, from: jsonData)
    
    return TemplateSelectionView(
        template: mockTemplate,
        authViewModel: AuthViewModel(
            authService: AuthService(),
            userRepository: UserRepository()
        )
    )
}
