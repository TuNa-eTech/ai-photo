//
//  HomeView.swift
//  AIPhotoApp
//
//  Home screen MVP: Simple layout with trending templates + user projects
//

import SwiftUI
import Observation

struct HomeView: View {
    let model: AuthViewModel
    @State private var home = HomeViewModel()

    // UI local state
    @State private var showProfile: Bool = false
    @State private var showSearch: Bool = false
    @State private var showAllTemplates: Bool = false
    @State private var selectedTemplate: TemplateDTO?

    var body: some View {
        ZStack {
            GlassBackgroundView()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    // Hero Section: #1 Trending Template
                    heroSection
                    
                    // Trending Now Section: Horizontal scroll
                    trendingNowSection
                        .padding(.top, 24)
                    
                    // New Section: Latest templates
                    newSection
                        .padding(.top, 24)
                        .padding(.bottom, 24)
                }
            }
            .ignoresSafeArea(edges: .top)
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
                        limit: 6, // Get 6 templates: 1 for hero + 5 for trending now
                        tokenProvider: { try await model.fetchFreshIDToken() }
                    )
                } else {
                    // Fallback to mock data when not logged in
                    home.fetchInitial()
                }
            }
            
            // Load new templates for home screen
            if home.newTemplates.isEmpty {
                if let token = model.loadToken() {
                    let repo = TemplatesRepository()
                    home.fetchNewTemplatesFromAPI(
                        repo: repo,
                        bearerIDToken: token,
                        limit: 6, // Get 6 new templates
                        tokenProvider: { try await model.fetchFreshIDToken() }
                    )
                }
            }
        }
        .fullScreenCover(isPresented: $showProfile) {
            ProfileView(model: model)
        }
        .fullScreenCover(isPresented: $showSearch) {
            SearchView(model: model)
        }
        .sheet(isPresented: $showAllTemplates) {
            AllTemplatesView(home: home)
        }
        .sheet(item: $selectedTemplate) { template in
            TemplateSelectionView(template: template, authViewModel: model)
        }
    }

    // MARK: - Sections
    
    private var heroSection: some View {
        Group {
            if let hero = home.heroTemplate {
                HeroTemplateCard(
                    template: hero,
                    onTap: {
                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                        if let dto = hero.dto {
                            selectedTemplate = dto
                        }
                    }
                )
                .ignoresSafeArea(edges: .top)
            } else if !home.isLoading {
                // Empty state for hero
                HeroPlaceholder()
                    .ignoresSafeArea(edges: .top)
            }
        }
    }
    
    private var trendingNowSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .center) {
                Text("Trending Now")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(GlassTokens.textPrimary)
                
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
                    .foregroundStyle(GlassTokens.textPrimary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(.ultraThinMaterial.opacity(0.85), in: Capsule())
                    .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 20)
            
            if home.trendingNowTemplates.isEmpty && !home.isLoading {
                // Empty state
                VStack(spacing: 16) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 48, weight: .light))
                        .foregroundStyle(GlassTokens.textSecondary.opacity(0.6))
                    Text("No more trending templates")
                        .font(.subheadline)
                        .foregroundStyle(GlassTokens.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 48)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 16) {
                        ForEach(home.trendingNowTemplates) { item in
                            CardGlassSmall(
                                title: item.title,
                                tag: item.tag,
                                thumbnailURL: item.thumbnailURL,
                                thumbnailSymbol: item.thumbnailSymbol
                            )
                            .frame(width: 180, height: 240) // 3:4 aspect ratio
                            .onTapGesture {
                                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                if let dto = item.dto {
                                    selectedTemplate = dto
                                }
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
                    .padding(.horizontal, 20)
                }
            }
        }
    }
    
    private var newSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .center) {
                Text("New")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(GlassTokens.textPrimary)
                
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
                    .foregroundStyle(GlassTokens.textPrimary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(.ultraThinMaterial.opacity(0.85), in: Capsule())
                    .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 20)
            
            if home.newTemplates.isEmpty && !home.isLoading {
                // Empty state
                VStack(spacing: 16) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 48, weight: .light))
                        .foregroundStyle(GlassTokens.textSecondary.opacity(0.6))
                    Text("No new templates")
                        .font(.subheadline)
                        .foregroundStyle(GlassTokens.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 48)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 16) {
                        ForEach(home.newTemplates) { item in
                            CardGlassSmall(
                                title: item.title,
                                tag: item.tag,
                                thumbnailURL: item.thumbnailURL,
                                thumbnailSymbol: item.thumbnailSymbol
                            )
                            .frame(width: 180, height: 240) // 3:4 aspect ratio
                            .onTapGesture {
                                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                if let dto = item.dto {
                                    selectedTemplate = dto
                                }
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
                    .padding(.horizontal, 20)
                }
            }
        }
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
        HStack(spacing: 16) {
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
            .clipShape(RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous))
            
            // Info
            VStack(alignment: .leading, spacing: 8) {
                Text(project.templateName)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(GlassTokens.textPrimary)
                    .lineLimit(1)
                
                Text(project.createdAt, style: .date)
                    .font(.subheadline)
                    .foregroundStyle(GlassTokens.textSecondary)
                
                // Status badge
                HStack(spacing: 6) {
                    Circle()
                        .fill(statusColor)
                        .frame(width: 8, height: 8)
                    Text(project.status.rawValue)
                        .font(.caption)
                        .foregroundStyle(GlassTokens.textSecondary)
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(GlassTokens.textSecondary.opacity(0.6))
        }
        .padding(16)
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

// MARK: - Hero Template Card

private enum HeroConstants {
    static let heightMultiplier: CGFloat = 0.5
}

private struct HeroTemplateCard: View {
    let template: HomeViewModel.TemplateItem
    let onTap: () -> Void
    
    var body: some View {
        GeometryReader { geometry in
            let screenHeight = UIScreen.main.bounds.height
            let heroHeight = screenHeight * HeroConstants.heightMultiplier
            let safeAreaTop = geometry.safeAreaInsets.top
            let totalHeight = heroHeight + safeAreaTop
            
            ZStack(alignment: .bottomLeading) {
                // Background image - extends to top edge including status bar area
                Group {
                    if let url = template.thumbnailURL {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .scaledToFill()
                            case .failure, .empty:
                                fallbackImage
                            @unknown default:
                                fallbackImage
                            }
                        }
                    } else {
                        fallbackImage
                    }
                }
                .frame(width: geometry.size.width, height: totalHeight)
                .clipped()
                .offset(y: -safeAreaTop)
                
                // Gradient overlay for better text readability - extends to top
                LinearGradient(
                    colors: [
                        Color.black.opacity(0.3),
                        Color.black.opacity(0.6)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(width: geometry.size.width, height: totalHeight)
                .offset(y: -safeAreaTop)
                
                // Bottom content: Template info and CTA - positioned at bottom left
                VStack(alignment: .leading, spacing: 12) {
                    if let tag = template.tag {
                        GlassChip(text: tag, systemImage: "flame.fill")
                    }
                    
                    Text(template.title)
                        .font(.largeTitle.weight(.bold))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                    
                    if let subtitle = template.subtitle {
                        Text(subtitle)
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.9))
                            .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                    }
                    
                    Button(action: onTap) {
                        HStack(spacing: 8) {
                            Text("Sử dụng mẫu này")
                                .font(.headline.weight(.semibold))
                            Image(systemName: "arrow.right")
                                .font(.headline.weight(.semibold))
                        }
                        .foregroundStyle(GlassTokens.textPrimary)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 16)
                        .background(.ultraThinMaterial.opacity(0.95), in: Capsule())
                        .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                    .padding(.top, 8)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
            .contentShape(Rectangle())
            .onTapGesture {
                onTap()
            }
            .ignoresSafeArea(edges: .top)
        }
        .frame(height: UIScreen.main.bounds.height * HeroConstants.heightMultiplier)
    }
    
    private var fallbackImage: some View {
        ZStack {
            LinearGradient(
                colors: [GlassTokens.primary1, GlassTokens.accent1],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Image(systemName: template.thumbnailSymbol ?? "photo")
                .font(.system(size: 80))
                .foregroundStyle(.white.opacity(0.5))
        }
    }
}

// MARK: - Hero Placeholder

private struct HeroPlaceholder: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [GlassTokens.primary1, GlassTokens.accent1],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(spacing: 16) {
                Image(systemName: "sparkles")
                    .font(.system(size: 64, weight: .light))
                    .foregroundStyle(GlassTokens.textSecondary.opacity(0.6))
                Text("Loading trending template...")
                    .font(.headline)
                    .foregroundStyle(GlassTokens.textSecondary)
            }
        }
        .frame(height: UIScreen.main.bounds.height * HeroConstants.heightMultiplier)
    }
}

// MARK: - Preview

#Preview("Home") {
    let auth = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    HomeView(model: auth)
}
