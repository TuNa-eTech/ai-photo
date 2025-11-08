//
//  ResultView.swift
//  AIPhotoApp
//
//  Post-processing result screen: show Before/After with quick actions
//

import SwiftUI
#if canImport(UIKit)
import UIKit
import Photos
#endif

struct ResultView: View {
    let project: Project
    let originalImage: UIImage?
    
    @Environment(\.dismiss) private var dismiss
    @State private var processedImage: UIImage?
    @State private var mode: Mode = .after
    @State private var showSavedAlert: Bool = false
    @State private var showPermissionDeniedAlert: Bool = false
    @State private var comparePosition: CGFloat = 0.5
    @State private var showZoomHint: Bool = true
    
    enum Mode: String, CaseIterable, Identifiable {
        case before = "Before"
        case after = "After"
        case compare = "Compare"
        var id: String { rawValue }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView(animated: true)
                
                VStack(spacing: 0) {
                    // Mode control
                    GlassSegmentedControl(mode: $mode)
                        .padding(.horizontal, 20)
                        .padding(.top, 16)
                        .padding(.bottom, 20)
                    
                    // Image area - centered
                    Spacer()
                    
                    Group {
                        if mode == .compare, let before = originalImage, let after = processedImage {
                            CompareView(before: before, after: after, position: $comparePosition)
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
                                RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous)
                                    .fill(.ultraThinMaterial.opacity(0.85))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous)
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
                        Text("Double‑tap to zoom")
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
                .navigationTitle("Result")
                .toolbarBackground(.visible, for: .navigationBar)
                .toolbarBackground(.ultraThinMaterial.opacity(0.9), for: .navigationBar)
                .toolbarColorScheme(.light, for: .navigationBar)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Done") { dismiss() }
                            .foregroundStyle(GlassTokens.textPrimary)
                    }
                }
                // Sticky action bar
                .safeAreaInset(edge: .bottom) {
                    VStack(spacing: 12) {
                        if let after = processedImage {
                            // Primary actions row (Save & Share)
                            HStack(spacing: 12) {
                                Button {
                                    saveToPhotos(after)
                                } label: {
                                    Label("Save", systemImage: "square.and.arrow.down")
                                        .frame(maxWidth: .infinity)
                                }
                                .buttonStyle(GlassCTAButtonStyle())
                                .accessibilityLabel(Text("Save image to Photos"))
                                
                                ShareLink(
                                    item: Image(uiImage: after),
                                    preview: SharePreview("My AI Image", image: Image(uiImage: after))
                                ) {
                                    Label("Share", systemImage: "square.and.arrow.up")
                                        .frame(maxWidth: .infinity)
                                }
                                .buttonStyle(GlassCTAButtonStyle())
                            }
                            .font(.headline)
                            
                            // Secondary action row (Projects)
                            NavigationLink {
                                MyProjectsView()
                            } label: {
                                Label("View All Projects", systemImage: "folder")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(GlassCTAButtonStyle())
                            .font(.headline)
                        }
                    }
                    .padding(16)
                    .background(.ultraThinMaterial.opacity(0.92), in: RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous)
                            .stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8)
                    )
                    .shadow(
                        color: GlassTokens.shadowColor,
                        radius: GlassTokens.shadowRadius,
                        x: 0,
                        y: -GlassTokens.shadowY
                    )
                    .padding(.horizontal, 20)
                    .padding(.bottom, 8)
                }
            }
        }
        .onAppear {
            processedImage = ProjectsStorageManager.shared.getProjectImage(projectId: project.id.uuidString)
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

private struct GlassSegmentedControl: View {
    @Binding var mode: ResultView.Mode
    
    var body: some View {
        HStack(spacing: 8) {
            segment("Before", .before, "photo")
            segment("After", .after, "sparkles")
            segment("Compare", .compare, "square.split.2x1")
        }
        .padding(6)
        .background(.ultraThinMaterial.opacity(0.9), in: Capsule())
        .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
    }
    
    @ViewBuilder
    private func segment(_ title: String, _ value: ResultView.Mode, _ system: String) -> some View {
        let isSelected = mode == value
        Button {
            #if canImport(UIKit)
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            #endif
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                mode = value
            }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: system)
                Text(title)
            }
            .font(.subheadline.weight(isSelected ? .semibold : .regular))
            .padding(.horizontal, 12).padding(.vertical, 8)
            .background(
                isSelected
                ? AnyShapeStyle(GlassTokens.accent2.opacity(0.35))
                : AnyShapeStyle(Color.clear)
            )
            .foregroundStyle(GlassTokens.textPrimary)
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text(title))
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }
}

// MARK: - Zoom & Compare

private struct ZoomableImageView: View {
    let image: UIImage
    @State private var scale: CGFloat = 1.0
    @State private var offset: CGSize = .zero

    var body: some View {
        GeometryReader { geo in
            Image(uiImage: image)
                .resizable()
                .scaledToFit()
                .scaleEffect(scale)
                .offset(offset)
                .frame(width: geo.size.width, height: geo.size.height)
                .gesture(
                    MagnificationGesture()
                        .onChanged { value in
                            scale = min(max(1.0, value), 3.0)
                        }
                )
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            if scale > 1.0 {
                                offset = value.translation
                            }
                        }
                        .onEnded { _ in
                            if scale == 1.0 {
                                offset = .zero
                            } else {
                                let maxX = (geo.size.width * (scale - 1)) / 2
                                let maxY = (geo.size.height * (scale - 1)) / 2
                                let clampedX = min(max(-maxX, offset.width), maxX)
                                let clampedY = min(max(-maxY, offset.height), maxY)
                                offset = CGSize(width: clampedX, height: clampedY)
                            }
                        }
                )
                .onTapGesture(count: 2) {
                    withAnimation(.spring()) {
                        if scale > 1.0 {
                            scale = 1.0
                            offset = .zero
                        } else {
                            scale = 2.0
                        }
                    }
                }
        }
        .aspectRatio(contentMode: .fit)
    }
}

private struct CompareView: View {
    let before: UIImage
    let after: UIImage
    @Binding var position: CGFloat

    var body: some View {
        GeometryReader { geo in
            ZStack {
                Image(uiImage: after)
                    .resizable()
                    .scaledToFit()
                    .frame(width: geo.size.width, height: geo.size.height)
                    .clipped()

                Image(uiImage: before)
                    .resizable()
                    .scaledToFit()
                    .frame(width: geo.size.width, height: geo.size.height)
                    .clipped()
                    .mask(
                        HStack(spacing: 0) {
                            Rectangle()
                                .frame(width: geo.size.width * position)
                            Spacer(minLength: 0)
                        }
                    )

                Rectangle()
                    .fill(GlassTokens.accent1.opacity(0.9))
                    .frame(width: 2)
                    .position(x: geo.size.width * position, y: geo.size.height / 2)

                Circle()
                    .fill(
                        LinearGradient(
                            colors: [
                                GlassTokens.accent1.opacity(0.4),
                                GlassTokens.accent2.opacity(0.3)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .background(.ultraThinMaterial.opacity(0.9))
                    .overlay(Circle().stroke(GlassTokens.borderColor.opacity(0.4), lineWidth: 1.5))
                    .frame(width: 32, height: 32)
                    .position(x: geo.size.width * position, y: geo.size.height / 2)
                    .shadow(
                        color: GlassTokens.shadowColor,
                        radius: 8,
                        x: 0,
                        y: 4
                    )
                    .accessibilityLabel(Text("Compare slider"))
                    .accessibilityAddTraits(.isButton)
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        let x = min(max(0, value.location.x), geo.size.width)
                        position = x / geo.size.width
                    }
            )
        }
        .aspectRatio(contentMode: .fit)
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
