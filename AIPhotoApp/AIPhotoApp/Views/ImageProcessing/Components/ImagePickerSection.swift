//
//  ImagePickerSection.swift
//  AIPhotoApp
//
//  Image selection and preview component
//

import Foundation
import SwiftUI

#if canImport(UIKit)
    import UIKit
#endif

struct ImagePickerSection: View {
    @Binding var selectedImage: UIImage?
    @Binding var showSourceDialog: Bool
    @Binding var showCameraUnavailableAlert: Bool
    @Binding var showLibraryPicker: Bool
    @Binding var showCamera: Bool

    let onProcess: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            if let image = selectedImage {
                selectedImagePreview(image)
                processButton
            } else {
                imagePickerButton
            }
        }
    }

    // MARK: - Subviews

    private func selectedImagePreview(_ image: UIImage) -> some View {
        Image(uiImage: image)
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(maxHeight: 300)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(alignment: .topTrailing) {
                Button(action: {
                    selectedImage = nil
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.title2)
                        .foregroundStyle(GlassTokens.textPrimary)
                        .background(.ultraThinMaterial.opacity(0.9), in: Circle())
                        .overlay(
                            Circle().stroke(
                                GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8)
                        )
                        .padding(8)
                }
            }
    }

    private var processButton: some View {
        Button(
            action: {
                guard selectedImage != nil else { return }
                onProcess()
            },
            label: {
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
                            colors: [
                                GlassTokens.primary1.opacity(0.2), GlassTokens.accent1.opacity(0.2),
                            ],
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
            }
        )
        .disabled(selectedImage == nil)
        .opacity(selectedImage == nil ? 0.5 : 1.0)
    }

    private var imagePickerButton: some View {
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
                                    GlassTokens.accent2.opacity(0.2),
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
                                    GlassTokens.textSecondary,
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
                in: RoundedRectangle(
                    cornerRadius: GlassTokens.cardCornerRadius, style: .continuous)
            )
            .overlay(
                RoundedRectangle(
                    cornerRadius: GlassTokens.cardCornerRadius, style: .continuous
                )
                .stroke(
                    LinearGradient(
                        colors: [
                            GlassTokens.borderColor.opacity(0.4),
                            GlassTokens.borderColor.opacity(0.2),
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
        .confirmationDialog(
            L10n.tr("l10n.image.source"), isPresented: $showSourceDialog,
            titleVisibility: .visible
        ) {
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
            Button(L10n.tr("l10n.common.cancel"), role: .cancel) {}
        }
    }
}

// MARK: - Preview

#Preview {
    @Previewable @State var selectedImage: UIImage? = nil
    @Previewable @State var showSourceDialog = false
    @Previewable @State var showCameraUnavailableAlert = false
    @Previewable @State var showLibraryPicker = false
    @Previewable @State var showCamera = false

    ImagePickerSection(
        selectedImage: $selectedImage,
        showSourceDialog: $showSourceDialog,
        showCameraUnavailableAlert: $showCameraUnavailableAlert,
        showLibraryPicker: $showLibraryPicker,
        showCamera: $showCamera,
        onProcess: { print("Process tapped") }
    )
    .padding()
}
