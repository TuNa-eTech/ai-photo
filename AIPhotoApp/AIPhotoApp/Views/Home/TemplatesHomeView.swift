//
//  TemplatesHomeView.swift
//  AIPhotoApp
//
//  Home screen MVP: Simple layout with trending templates + user projects
//

import SwiftUI
import Observation

struct TemplatesHomeView: View {
    let model: AuthViewModel
    @State private var home = HomeViewModel()

    // UI local state
    @State private var showProfile: Bool = false
    @State private var showAllTemplates: Bool = false

    private let gridCols: [GridItem] = [
        GridItem(.flexible(), spacing: 12, alignment: .top),
        GridItem(.flexible(), spacing: 12, alignment: .top)
    ]

    var body: some View {
        ZStack {
            GlassBackgroundView()

            VStack(spacing: 0) {
                // Simple header
                SimpleHeader(
                    userName: greetingName(),
                    avatarURL: model.avatarURL?.absoluteString,
                    showSettings: $showProfile
                )
                
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 24) {
                        // User projects section (if exists)
                        if home.shouldShowProjects {
                            projectsSection
                        }
                        
                        // Trending templates section
                        trendingSection
                    }
                    .padding(.bottom, 96) // leave space for FAB
                    .padding(.top, 8)
                }
            }
            .overlay(alignment: .top) {
                // Loading / Error banners
                if home.isLoading {
                    HUDGlass(text: "Đang tải…")
                        .transition(.opacity)
                        .padding(.top, 8)
                } else if let err = home.errorMessage, !err.isEmpty {
                    BannerGlass(text: err, tint: .red) {
                        withAnimation { home.fetchInitial() }
                    }
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .padding(.top, 8)
                }
            }

            // Floating Create button
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    GlassFloatingButton(systemImage: "sparkles") {
                        // TODO: Wire into create flow
                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                    }
                    .padding(.trailing, 20)
                    .padding(.bottom, 28)
                }
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            // Load trending templates for home screen
            if home.trendingTemplates.isEmpty {
                if let token = model.loadToken() {
                    let repo = TemplatesRepository()
                    home.fetchTrendingFromAPI(
                        repo: repo,
                        bearerIDToken: token,
                        limit: 20,
                        tokenProvider: { try await model.fetchFreshIDToken() }
                    )
                } else {
                    // Fallback to mock data when not logged in
                    home.fetchInitial()
                }
            }
        }
        .fullScreenCover(isPresented: $showProfile) {
            ProfileView(model: model)
        }
        .sheet(isPresented: $showAllTemplates) {
            AllTemplatesView(home: home)
        }
    }

    // MARK: - Sections
    
    private var projectsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("My Projects")
                .font(.title2.weight(.bold))
                .foregroundStyle(GlassTokens.textPrimary)
                .padding(.horizontal, 16)
            
            VStack(spacing: 10) {
                ForEach(home.userProjects) { project in
                    ProjectCard(project: project)
                        .onTapGesture {
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            // TODO: Navigate to project detail
                        }
                }
            }
            .padding(.horizontal, 16)
        }
    }
    
    private var trendingSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Trending Templates")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(GlassTokens.textPrimary)
                    
                    if !home.displayTrendingTemplates.isEmpty {
                        Text("\(home.displayTrendingTemplates.count) templates")
                            .font(.caption)
                            .foregroundStyle(GlassTokens.textSecondary)
                    }
                }
                
                Spacer()
                
                Button(action: {
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    showAllTemplates = true
                }) {
                    HStack(spacing: 4) {
                        Text("See All")
                            .font(.subheadline.weight(.medium))
                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.semibold))
                    }
                    .foregroundStyle(GlassTokens.textSecondary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(.ultraThinMaterial.opacity(0.5), in: Capsule())
                }
            }
            .padding(.horizontal, 16)
            
            if home.displayTrendingTemplates.isEmpty && !home.isLoading {
                // Empty state
                VStack(spacing: 12) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 48))
                        .foregroundStyle(GlassTokens.textSecondary)
                    Text("No trending templates yet")
                        .font(.subheadline)
                        .foregroundStyle(GlassTokens.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                LazyVGrid(columns: gridCols, spacing: 14) {
                    ForEach(home.displayTrendingTemplates) { item in
                        CardGlassSmall(
                            title: item.title,
                            tag: item.tag,
                            thumbnailURL: item.thumbnailURL,
                            thumbnailSymbol: item.thumbnailSymbol
                        )
                        .onTapGesture {
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            // TODO: Navigate to template detail
                        }
                        .contextMenu {
                            Button("Preview", systemImage: "eye") {}
                            Button(home.isFavorite(item) ? "Remove Favorite" : "Add Favorite",
                                   systemImage: home.isFavorite(item) ? "heart.slash" : "heart") {
                                home.toggleFavorite(item)
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Helpers
    
    private func greetingName() -> String {
        let trimmed = model.name.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? "bạn" : trimmed
    }
}

// MARK: - Reusable Overlays

private struct HUDGlass: View {
    var text: String
    var body: some View {
        HStack(spacing: 8) {
            ProgressView()
                .progressViewStyle(.circular)
                .tint(GlassTokens.textPrimary)
            Text(text)
                .font(.footnote)
                .foregroundStyle(GlassTokens.textPrimary)
        }
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(.ultraThinMaterial.opacity(0.9), in: Capsule())
        .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
    }
}

private struct BannerGlass: View {
    var text: String
    var tint: Color
    var retry: (() -> Void)?
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(tint)
            Text(text)
                .foregroundStyle(GlassTokens.textPrimary)
                .lineLimit(2)
            Spacer()
            if let retry {
                Button("Thử lại", action: retry)
                    .buttonStyle(GlassCTAButtonStyle())
            }
        }
        .font(.footnote)
        .padding(12)
        .background(.ultraThinMaterial.opacity(0.9), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8)
        )
        .padding(.horizontal, 16)
    }
}

// MARK: - Project Card

private struct ProjectCard: View {
    let project: Project
    
    var body: some View {
        HStack(spacing: 12) {
            // Thumbnail
            Group {
                if let url = project.thumbnailURL {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().scaledToFill()
                        case .failure, .empty:
                            placeholderImage
                        @unknown default:
                            placeholderImage
                        }
                    }
                } else {
                    placeholderImage
                }
            }
            .frame(width: 80, height: 80)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            
            // Info
            VStack(alignment: .leading, spacing: 6) {
                Text(project.templateName)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(GlassTokens.textPrimary)
                    .lineLimit(1)
                
                Text(project.createdAt, style: .date)
                    .font(.caption)
                    .foregroundStyle(GlassTokens.textSecondary)
                
                // Status badge
                HStack(spacing: 4) {
                    Circle()
                        .fill(statusColor)
                        .frame(width: 6, height: 6)
                    Text(project.status.rawValue)
                        .font(.caption2)
                        .foregroundStyle(GlassTokens.textSecondary)
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.caption.weight(.medium))
                .foregroundStyle(GlassTokens.textSecondary)
        }
        .padding(12)
        .glassCard()
        .accessibilityElement(children: .combine)
        .accessibilityLabel(Text("Project: \(project.templateName)"))
    }
    
    private var placeholderImage: some View {
        ZStack {
            LinearGradient(
                colors: [GlassTokens.primary1, GlassTokens.accent1],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Image(systemName: "photo")
                .font(.title2)
                .foregroundStyle(GlassTokens.textPrimary)
        }
    }
    
    private var statusColor: Color {
        switch project.status {
        case .completed:
            return .green
        case .processing:
            return .orange
        case .failed:
            return .red
        }
    }
}

// MARK: - Preview

#Preview("Home") {
    let auth = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    TemplatesHomeView(model: auth)
}
