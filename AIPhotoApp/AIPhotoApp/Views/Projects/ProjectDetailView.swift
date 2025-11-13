//
//  ProjectDetailView.swift
//  AIPhotoApp
//
//  Project detail view showing image and information
//

import SwiftUI
#if canImport(UIKit)
import UIKit
import Photos
#endif

struct ProjectDetailView: View {
    let project: Project
    let image: UIImage
    let onDelete: () -> Void
    
    @Environment(\.dismiss) private var dismiss
    @State private var showShareSheet = false
    @State private var showDeleteConfirmation = false
    @State private var showSavedAlert: Bool = false
    @State private var showPermissionDeniedAlert: Bool = false
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Image
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .cornerRadius(16)
                        .shadow(radius: 8)
                    
                    // Details
                    VStack(alignment: .leading, spacing: 12) {
                        Label(project.templateName, systemImage: "wand.and.stars")
                            .font(.title3.bold())
                        
                        HStack {
                            Image(systemName: "calendar")
                            Text(project.createdAt, style: .date)
                        }
                        .font(.subheadline)
                        .foregroundStyle(.gray)
                        
                        if project.status == .completed {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                Text(L10n.tr("l10n.projects.completed"))
                            }
                            .foregroundStyle(.green)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(12)
                }
                .padding()
            }
            .navigationTitle(L10n.tr("l10n.projects.details"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        Label(L10n.tr("l10n.projects.delete"), systemImage: "trash")
                            .foregroundStyle(.red)
                    }
                }
                
                ToolbarItem(placement: .topBarTrailing) {
                    Button(L10n.tr("l10n.common.close")) {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .bottomBar) {
                    HStack(spacing: 12) {
                        Button {
                            saveToPhotos(image)
                        } label: {
                            Label(L10n.tr("l10n.common.save"), systemImage: "square.and.arrow.down")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(GlassCTAButtonStyle())
                        // swiftlint:disable:next i18n_no_hardcoded_string_literals
                        .accessibilityLabel(Text("Save image to Photos"))
                        
                        ShareLink(
                            item: Image(uiImage: image),
                            preview: SharePreview(L10n.tr("l10n.share.previewTitle"), image: Image(uiImage: image))
                        ) {
                            Label(L10n.tr("l10n.common.share"), systemImage: "square.and.arrow.up")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(GlassCTAButtonStyle())
                    }
                    .font(.headline)
                }
            }
            .confirmationDialog(
                L10n.tr("l10n.projects.deleteTitle"),
                isPresented: $showDeleteConfirmation,
                titleVisibility: .visible
            ) {
                Button(L10n.tr("l10n.projects.delete"), role: .destructive) {
                    dismiss()
                    onDelete()
                }
                Button(L10n.tr("l10n.common.cancel"), role: .cancel) { }
            } message: {
                Text(L10n.tr("l10n.projects.confirmDelete", project.templateName))
            }
            .alert(L10n.tr("l10n.photo.savedTitle"), isPresented: $showSavedAlert) {
                Button(L10n.tr("l10n.common.ok"), role: .cancel) { }
            } message: {
                Text(L10n.tr("l10n.photo.savedMessage"))
            }
            .alert(L10n.tr("l10n.photo.permissionTitle"), isPresented: $showPermissionDeniedAlert) {
                Button(L10n.tr("l10n.common.settings")) {
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                }
                Button(L10n.tr("l10n.common.cancel"), role: .cancel) { }
            } message: {
                Text(L10n.tr("l10n.photo.permissionMessage"))
            }
        }
    }
    
    // MARK: - Save
    private func saveToPhotos(_ image: UIImage) {
        Task {
            let success = await PhotoLibraryManager.shared.saveImage(image)
            await MainActor.run {
                if success {
                    showSavedAlert = true
                    #if canImport(UIKit)
                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                    #endif
                } else {
                    showPermissionDeniedAlert = true
                }
            }
        }
    }
}

