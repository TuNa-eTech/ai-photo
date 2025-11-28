//
//  ResultView.swift
//  AIPhotoApp
//
//  Post-processing result screen: show Before/After with quick actions
//

import Photos
import SwiftUI
import UIKit

struct ResultView: View {
    let project: Project
    let originalImage: UIImage?

    @Environment(\.dismiss) private var dismiss
    @State private var processedImage: UIImage?
    @State private var mode: ResultMode = .after
    @State private var showSavedAlert: Bool = false
    @State private var showPermissionDeniedAlert: Bool = false
    @State private var comparePosition: CGFloat = 0.5
    @State private var showZoomHint: Bool = true

    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView(animated: true)

                VStack(spacing: 0) {
                    // Mode control
                    ResultModeControl(mode: $mode)
                        .padding(.horizontal, 20)
                        .padding(.top, 16)
                        .padding(.bottom, 20)

                    // Image area - centered
                    Spacer()

                    Group {
                        if mode == .compare, let before = originalImage, let after = processedImage
                        {
                            CompareSliderView(
                                before: before, after: after, position: $comparePosition
                            )
                            .shadow(
                                color: GlassTokens.shadowColor,
                                radius: GlassTokens.shadowRadius,
                                x: 0,
                                y: GlassTokens.shadowY
                            )
                        } else if mode == .before, let before = originalImage {
                            ZoomableImageView(image: before)
                                .shadow(
                                    color: GlassTokens.shadowColor,
                                    radius: GlassTokens.shadowRadius,
                                    x: 0,
                                    y: GlassTokens.shadowY
                                )
                        } else if let after = processedImage {
                            ZoomableImageView(image: after)
                                .shadow(
                                    color: GlassTokens.shadowColor,
                                    radius: GlassTokens.shadowRadius,
                                    x: 0,
                                    y: GlassTokens.shadowY
                                )
                        } else {
                            ZStack {
                                RoundedRectangle(
                                    cornerRadius: GlassTokens.cardCornerRadius, style: .continuous
                                )
                                .fill(.ultraThinMaterial.opacity(0.85))
                                .overlay(
                                    RoundedRectangle(
                                        cornerRadius: GlassTokens.cardCornerRadius,
                                        style: .continuous
                                    )
                                    .stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8)
                                )
                                ProgressView("Loading image…")
                                    .tint(GlassTokens.accent1)
                                    .foregroundStyle(GlassTokens.textPrimary)
                            }
                            .frame(maxHeight: 360)
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.horizontal, 20)

                    if showZoomHint, processedImage != nil {
                        Text(L10n.tr("l10n.result.doubleTapZoom"))
                            .font(.caption2)
                            .foregroundStyle(GlassTokens.textSecondary)
                            .padding(.top, 8)
                            .transition(.opacity)
                            .onAppear {
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                                    withAnimation(.easeOut(duration: 0.3)) { showZoomHint = false }
                                }
                            }
                    }

                    Spacer()
                }
                .navigationTitle(L10n.tr("l10n.result.title"))
                .toolbarBackground(.visible, for: .navigationBar)
                .toolbarBackground(.ultraThinMaterial.opacity(0.9), for: .navigationBar)
                .toolbarColorScheme(.light, for: .navigationBar)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button(L10n.tr("l10n.common.done")) { dismiss() }
                            .foregroundStyle(GlassTokens.textPrimary)
                    }
                }
                // Sticky action bar
                .safeAreaInset(edge: .bottom) {
                    if let after = processedImage {
                        ResultActionBar(processedImage: after, onSave: saveToPhotos)
                    }
                }
            }
        }
        .onAppear {
            processedImage = ProjectsStorageManager.shared.getProjectImage(
                projectId: project.id.uuidString)
        }
        .alert(L10n.tr("l10n.photo.savedTitle"), isPresented: $showSavedAlert) {
            Button(L10n.tr("l10n.common.ok"), role: .cancel) {}
        } message: {
            Text(L10n.tr("l10n.photo.savedMessage"))
        }
        .alert(L10n.tr("l10n.photo.permissionTitle"), isPresented: $showPermissionDeniedAlert) {
            Button(L10n.tr("l10n.common.settings")) {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            Button(L10n.tr("l10n.common.cancel"), role: .cancel) {}
        } message: {
            Text(L10n.tr("l10n.photo.permissionMessage"))
        }
        .analyticsScreen(name: "Result")
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

// MARK: - Preview

#Preview("ResultView") {
    let project = Project(
        templateId: "demo",
        templateName: "Anime Style",
        createdAt: Date(),
        status: .completed
    )
    return ResultView(project: project, originalImage: UIImage(systemName: "photo"))
}
