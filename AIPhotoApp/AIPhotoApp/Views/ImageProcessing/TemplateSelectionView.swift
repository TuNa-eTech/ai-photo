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
    @Environment(AuthViewModel.self) private var authViewModel
    
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var selectedImage: UIImage?
    @State private var showImageProcessing: Bool = false
    @State private var loadErrorMessage: String?
    @State private var showLoadErrorAlert: Bool = false
    // Action Sheet + Picker/Camera states
    @State private var showSourceDialog: Bool = false
    @State private var showLibraryPicker: Bool = false
    @State private var showCamera: Bool = false
    @State private var showCameraUnavailableAlert: Bool = false
    
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
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
         .navigationTitle(L10n.tr("l10n.image.navTitle"))
         .navigationBarTitleDisplayMode(.inline)
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
                 loadErrorMessage = L10n.tr("l10n.image.cannotLoadTip")
                 showLoadErrorAlert = true
            }
        }
        .navigationDestination(isPresented: $showImageProcessing) {
            if let image = selectedImage {
                ImageProcessingView(template: template, image: image)
                    .toolbar(.hidden, for: .tabBar)
            } else {
                EmptyView()
            }
        }
        .alert(L10n.tr("l10n.image.cannotLoadTitle"), isPresented: $showLoadErrorAlert) {
            Button(L10n.tr("l10n.common.ok"), role: .cancel) { }
        } message: {
            Text(loadErrorMessage ?? L10n.tr("l10n.image.unknownError"))
        }
        .photosPicker(isPresented: $showLibraryPicker, selection: $selectedPhotoItem, matching: .images)
        #if canImport(UIKit)
        .sheet(isPresented: $showCamera) {
            CameraPicker(onImage: { image in
                selectedImage = image
                showImageProcessing = true
            }, onCancel: {
                // no-op
            })
        }
        #endif
        .alert(L10n.tr("l10n.camera.unavailable"), isPresented: $showCameraUnavailableAlert) {
            Button(L10n.tr("l10n.common.ok"), role: .cancel) { }
        } message: {
            Text(L10n.tr("l10n.camera.unavailable.message"))
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
                Label(L10n.tr("l10n.template.new"), systemImage: "sparkles")
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
            Text(L10n.tr("l10n.image.instructions.title"))
                .font(.headline)
                .foregroundStyle(GlassTokens.textPrimary)
            
            Text(L10n.tr("l10n.image.instructions.subtitle", template.name))
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
                // Image picker entry via Action Sheet
                Button {
                    showSourceDialog = true
                } label: {
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
                        
                        Text(L10n.tr("l10n.image.select"))
                             .font(.headline)
                             .foregroundStyle(GlassTokens.textPrimary)
                         
                         Text(L10n.tr("l10n.image.source.hint"))
                             .font(.subheadline)
                             .foregroundStyle(GlassTokens.textSecondary)
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 200)
                    .padding(.vertical, 20)
                    .background(
                        .ultraThinMaterial.opacity(0.7),
                        in: RoundedRectangle(cornerRadius: GlassTokens.cardCornerRadius, style: .continuous)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: GlassTokens.cardCornerRadius, style: .continuous)
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
                .confirmationDialog(L10n.tr("l10n.image.source"), isPresented: $showSourceDialog, titleVisibility: .visible) {
                     Button(L10n.tr("l10n.image.source.library")) { showLibraryPicker = true }
                     Button(L10n.tr("l10n.image.source.camera")) {
                         #if canImport(UIKit)
                         if UIImagePickerController.isSourceTypeAvailable(.camera) {
                             showCamera = true
                         } else {
                             showCameraUnavailableAlert = true
                         }
                         #endif
                     }
                     Button(L10n.tr("l10n.common.cancel"), role: .cancel) { }
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
                Text(L10n.tr("l10n.image.process"))
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

// MARK: - Preview
// Note: Preview requires a real TemplateDTO instance
// To preview this view, use Xcode Previews with a real template from API
// or create a TemplateDTO instance with actual data
