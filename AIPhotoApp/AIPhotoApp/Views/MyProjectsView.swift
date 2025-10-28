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
    
    var body: some View {
        NavigationStack {
            ZStack {
                if projects.isEmpty {
                    emptyStateView
                } else {
                    projectsGrid
                }
            }
            .navigationTitle("My Projects")
            .onAppear {
                loadProjects()
            }
            .sheet(item: $selectedProject) { project in
                if let image = getProjectImage(project) {
                    ProjectDetailView(project: project, image: image)
                }
            }
        }
    }
    
    // MARK: - Views
    
    private var projectsGrid: some View {
        ScrollView {
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 16) {
                ForEach(projects) { project in
                    ProjectGridView(project: project) {
                        selectedProject = project
                    }
                }
            }
            .padding()
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 24) {
            Image(systemName: "photo.stack")
                .font(.system(size: 80))
                .foregroundStyle(.gray)
            
            Text("No Projects Yet")
                .font(.title2.bold())
            
            Text("Start creating amazing images with AI templates!")
                .font(.subheadline)
                .foregroundStyle(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
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
                        .cornerRadius(12)
                } else {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 180)
                        .overlay(
                            Image(systemName: "photo")
                                .font(.largeTitle)
                                .foregroundStyle(.gray)
                        )
                }
                
                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(project.templateName)
                        .font(.subheadline.bold())
                        .lineLimit(2)
                    
                    Text(project.createdAt, style: .date)
                        .font(.caption)
                        .foregroundStyle(.gray)
                }
                
                // Status badge
                HStack {
                    Spacer()
                    statusBadge
                }
            }
            .padding(8)
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 4)
        }
        .buttonStyle(.plain)
    }
    
    private var statusBadge: some View {
        Text(project.status.rawValue)
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor.opacity(0.2))
            .foregroundStyle(statusColor)
            .cornerRadius(6)
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

