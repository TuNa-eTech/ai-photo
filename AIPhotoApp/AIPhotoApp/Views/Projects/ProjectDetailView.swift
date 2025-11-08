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
                                Text("Completed")
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
            .navigationTitle("Project Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        Label("Delete", systemImage: "trash")
                            .foregroundStyle(.red)
                    }
                }
                
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .bottomBar) {
                    HStack(spacing: 12) {
                        Button {
                            saveToPhotos(image)
                        } label: {
                            Label("Save", systemImage: "square.and.arrow.down")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(GlassCTAButtonStyle())
                        .accessibilityLabel(Text("Save image to Photos"))
                        
                        ShareLink(
                            item: Image(uiImage: image),
                            preview: SharePreview("My AI Image", image: Image(uiImage: image))
                        ) {
                            Label("Share", systemImage: "square.and.arrow.up")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(GlassCTAButtonStyle())
                    }
                    .font(.headline)
                }
            }
            .confirmationDialog(
                "Delete Project",
                isPresented: $showDeleteConfirmation,
                titleVisibility: .visible
            ) {
                Button("Delete", role: .destructive) {
                    dismiss()
                    onDelete()
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Are you sure you want to delete \"\(project.templateName)\"? This action cannot be undone.")
            }
            .alert("Saved", isPresented: $showSavedAlert) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("Image has been saved to your Photos.")
            }
            .alert("Permission Required", isPresented: $showPermissionDeniedAlert) {
                Button("Settings") {
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Please enable photo library access in Settings to save images.")
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

