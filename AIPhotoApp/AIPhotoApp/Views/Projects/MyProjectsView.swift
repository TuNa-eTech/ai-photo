//
//  MyProjectsView.swift
//  AIPhotoApp
//
//  Display user's processed image projects
//

import SwiftUI
import UIKit

struct MyProjectsView: View {
    @State private var viewModel = ProjectsViewModel()
    @State private var selectedProject: Project?
    @State private var showAllTemplates: Bool = false
    @State private var projectToDelete: Project?
    @State private var showDeleteConfirmation: Bool = false
    @State private var deleteError: String?
    @State private var showDeleteError: Bool = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                if viewModel.projects.isEmpty && !viewModel.isLoading {
                    emptyStateView
                } else {
                    projectsGrid
                }
            }
            .navigationTitle("My Projects")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                viewModel.loadProjects()
            }
            .onReceive(NotificationCenter.default.publisher(for: .imageProcessingCompleted)) { _ in
                // Refresh projects list when a new project is completed
                viewModel.refreshProjects()
            }
            .sheet(item: $selectedProject) { project in
                if let image = viewModel.getProjectImage(projectId: project.id.uuidString) {
                    ProjectDetailView(
                        project: project,
                        image: image,
                        onDelete: {
                            selectedProject = nil
                            deleteProject(project)
                        }
                    )
                }
            }
            .sheet(isPresented: $showAllTemplates) {
                AllTemplatesView(home: HomeViewModel())
            }
        }
    }
    
    // MARK: - Views
    
    private var projectsGrid: some View {
        ScrollView(showsIndicators: false) {
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 16),
                GridItem(.flexible(), spacing: 16)
            ], spacing: 16) {
                ForEach(viewModel.projects) { project in
                    ProjectGridView(
                        project: project,
                        image: viewModel.getProjectImage(projectId: project.id.uuidString),
                        onDelete: {
                            projectToDelete = project
                            showDeleteConfirmation = true
                        }
                    ) {
                        selectedProject = project
                    }
                    .contextMenu {
                        Button(role: .destructive) {
                            projectToDelete = project
                            showDeleteConfirmation = true
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .confirmationDialog(
            "Delete Project",
            isPresented: $showDeleteConfirmation,
            presenting: projectToDelete
        ) { project in
            Button("Delete", role: .destructive) {
                deleteProject(project)
            }
            Button("Cancel", role: .cancel) {
                projectToDelete = nil
            }
        } message: { project in
            Text("Are you sure you want to delete \"\(project.templateName)\"? This action cannot be undone.")
        }
        .alert("Delete Failed", isPresented: $showDeleteError) {
            Button("OK", role: .cancel) {
                deleteError = nil
            }
        } message: {
            if let error = deleteError {
                Text(error)
            }
        }
    }
    
    private func deleteProject(_ project: Project) {
        do {
            try viewModel.deleteProject(project)
            projectToDelete = nil
            // Haptic feedback
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        } catch {
            deleteError = error.localizedDescription
            showDeleteError = true
            print("❌ Failed to delete project: \(error)")
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 24) {
            Image(systemName: "photo.stack")
                .font(.system(size: 64, weight: .light))
                .foregroundStyle(GlassTokens.textSecondary.opacity(0.6))
            
            Text("No Projects Yet")
                .font(.title2.weight(.bold))
                .foregroundStyle(GlassTokens.textPrimary)
            
            Text("Start creating amazing images with AI templates!")
                .font(.subheadline)
                .foregroundStyle(GlassTokens.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button {
                showAllTemplates = true
            } label: {
                Label("Explore Templates", systemImage: "sparkles")
                    .font(.headline)
            }
            .buttonStyle(GlassCTAButtonStyle())
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
}

// MARK: - Project Grid View

struct ProjectGridView: View {
    let project: Project
    let image: UIImage?
    let onDelete: () -> Void
    let onTap: () -> Void
    
    var body: some View {
        ZStack(alignment: .topTrailing) {
            // Card content (tap to view details)
            Button(action: onTap) {
                VStack(alignment: .leading, spacing: 8) {
                    // Image
                    if let image = image {
                        Image(uiImage: image)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(height: 180)
                            .clipped()
                            .clipShape(RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous))
                    } else {
                        RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous)
                            .fill(GlassTokens.primary1.opacity(0.3))
                            .frame(height: 180)
                            .overlay(
                                Image(systemName: "photo")
                                    .font(.title)
                                    .foregroundStyle(GlassTokens.textSecondary)
                            )
                    }
                    
                    // Info
                    VStack(alignment: .leading, spacing: 6) {
                        Text(project.templateName)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(GlassTokens.textPrimary)
                            .lineLimit(2)
                        
                        Text(project.createdAt, style: .date)
                            .font(.caption)
                            .foregroundStyle(GlassTokens.textSecondary)
                    }
                    
                    // Status badge
                    HStack {
                        Spacer()
                        statusBadge
                    }
                }
                .padding(12)
                .glassCard()
            }
            .buttonStyle(.plain)
            
            // Delete button (top-right corner, above card content)
            Button(action: {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                onDelete()
            }) {
                Image(systemName: "xmark.circle.fill")
                    .font(.title3)
                    .foregroundStyle(.white)
                    .background(Color.red.opacity(0.9), in: Circle())
                    .shadow(color: .black.opacity(0.3), radius: 3, x: 0, y: 2)
            }
            .padding(8)
            .zIndex(1) // Ensure delete button is on top
        }
    }
    
    private var statusBadge: some View {
        GlassChip(text: project.status.rawValue)
    }
    
    private var statusColor: Color {
        switch project.status {
        case .completed:
            return .green
        case .processing:
            return .blue
        case .failed:
            return .red
        }
    }
}

// MARK: - Project Detail View

struct ProjectDetailView: View {
    let project: Project
    let image: UIImage
    let onDelete: () -> Void
    
    @Environment(\.dismiss) private var dismiss
    @State private var showShareSheet = false
    @State private var showDeleteConfirmation = false
    
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
                    ShareLink(item: Image(uiImage: image), preview: SharePreview("My AI Image", image: Image(uiImage: image)))
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
        }
    }
}
