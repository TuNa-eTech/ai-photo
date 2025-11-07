//
//  MyProjectsView.swift
//  AIPhotoApp
//
//  Display user's processed image projects
//

import SwiftUI

struct MyProjectsView: View {
    @State private var projects: [Project] = []
    @State private var selectedProject: Project?
    @State private var selectedImage: UIImage?
    @State private var showAllTemplates: Bool = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                if projects.isEmpty {
                    emptyStateView
                } else {
                    projectsGrid
                }
            }
            .navigationTitle("My Projects")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                loadProjects()
            }
            .sheet(item: $selectedProject) { project in
                if let image = getProjectImage(project) {
                    ProjectDetailView(project: project, image: image)
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
                ForEach(projects) { project in
                    ProjectGridView(project: project) {
                        selectedProject = project
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
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
    
    private func loadProjects() {
        projects = ProjectsStorageManager.shared.getAllProjects()
    }
    
    private func getProjectImage(_ project: Project) -> UIImage? {
        return ProjectsStorageManager.shared.getProjectImage(projectId: project.id.uuidString)
    }
}

// MARK: - Project Grid View

struct ProjectGridView: View {
    let project: Project
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 8) {
                // Image
                if let image = ProjectsStorageManager.shared.getProjectImage(projectId: project.id.uuidString) {
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
    
    @Environment(\.dismiss) private var dismiss
    @State private var showShareSheet = false
    
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
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .bottomBar) {
                    ShareLink(item: Image(uiImage: image), preview: SharePreview("My AI Image", image: Image(uiImage: image)))
                }
            }
        }
    }
}
