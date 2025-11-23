//
//  TemplateSelectionView.swift
//  AIPhotoApp
//
//  Intermediate screen: Template selected, now pick image to process
//

import PhotosUI
import SwiftUI
import UIKit

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
                TemplateInfoCard(template: template)

                // Instructions
                TemplateInstructions(templateName: template.name)

                // Image picker
                ImagePickerSection(
                    selectedImage: $selectedImage,
                    showSourceDialog: $showSourceDialog,
                    showCameraUnavailableAlert: $showCameraUnavailableAlert,
                    showLibraryPicker: $showLibraryPicker,
                    showCamera: $showCamera,
                    onProcess: {
                        showImageProcessing = true
                    }
                )

                Spacer()
            }
            .padding(24)
        }
        .navigationTitle(L10n.tr("l10n.image.navTitle"))
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: selectedPhotoItem) { oldValue, newValue in
            Task {
                await loadImage(from: newValue)
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
            Button(L10n.tr("l10n.common.ok"), role: .cancel) {}
        } message: {
            Text(loadErrorMessage ?? L10n.tr("l10n.image.unknownError"))
        }
        .photosPicker(
            isPresented: $showLibraryPicker,
            selection: $selectedPhotoItem,
            matching: .images
        )
        #if canImport(UIKit)
            .fullScreenCover(isPresented: $showCamera) {
                CameraPicker(
                    onImage: { image in
                        selectedImage = image
                        showCamera = false
                        // Delay to allow camera to dismiss smoothly before navigation
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                            showImageProcessing = true
                        }
                    },
                    onCancel: {
                        showCamera = false
                    }
                )
                .ignoresSafeArea()
            }
        #endif
        .alert(L10n.tr("l10n.camera.unavailable"), isPresented: $showCameraUnavailableAlert) {
            Button(L10n.tr("l10n.common.ok"), role: .cancel) {}
        } message: {
            Text(L10n.tr("l10n.camera.unavailable.message"))
        }
    }

    // MARK: - Image Loading

    private func loadImage(from item: PhotosPickerItem?) async {
        guard let item = item else { return }

        // 1) Try Transferable wrapper (best for HEIC/iCloud)
        if let picked = try? await item.loadTransferable(type: PickedPhoto.self) {
            selectedImage = picked.image
            showImageProcessing = true
            return
        }

        // 2) Try URL (iCloud download fallback)
        if let url = try? await item.loadTransferable(type: URL.self),
            let data = try? Data(contentsOf: url),
            let image = UIImage(data: data)
        {
            selectedImage = image
            showImageProcessing = true
            return
        }

        // 3) Try raw Data
        if let data = try? await item.loadTransferable(type: Data.self),
            let image = UIImage(data: data)
        {
            selectedImage = image
            showImageProcessing = true
            return
        }

        // If all attempts fail, show a friendly message
        loadErrorMessage = L10n.tr("l10n.image.cannotLoadTip")
        showLoadErrorAlert = true
    }
}

// MARK: - Preview

#Preview("New Template") {
    let authViewModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    NavigationStack {
        TemplateSelectionView(
            template: TemplateDTO(
                id: "anime-style",
                name: "Anime Style",
                thumbnailURL: URL(string: "https://picsum.photos/400/300"),
                publishedAt: Calendar.current.date(byAdding: .day, value: -3, to: Date()),
                usageCount: 150
            )
        )
        .environment(authViewModel)
    }
}

#Preview("Simple Template") {
    let authViewModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    NavigationStack {
        TemplateSelectionView(
            template: TemplateDTO(
                id: "watercolor",
                name: "Watercolor Painting",
                thumbnailURL: URL(string: "https://picsum.photos/400/300?random=2"),
                publishedAt: nil,
                usageCount: nil
            )
        )
        .environment(authViewModel)
    }
}

// MARK: - Preview

#Preview("New Template") {
    let authViewModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    NavigationStack {
        TemplateSelectionView(
            template: TemplateDTO(
                id: "anime-style",
                name: "Anime Style",
                thumbnailURL: URL(string: "https://picsum.photos/400/300"),
                publishedAt: Calendar.current.date(byAdding: .day, value: -3, to: Date()),
                usageCount: 150
            )
        )
        .environment(authViewModel)
    }
}

#Preview("Simple Template") {
    let authViewModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    NavigationStack {
        TemplateSelectionView(
            template: TemplateDTO(
                id: "watercolor",
                name: "Watercolor Painting",
                thumbnailURL: URL(string: "https://picsum.photos/400/300?random=2"),
                publishedAt: nil,
                usageCount: nil
            )
        )
        .environment(authViewModel)
    }
}
