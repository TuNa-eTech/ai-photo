//
//  HomeView.swift
//  AIPhotoApp
//
//  Home screen MVP: Simple layout with trending templates + user projects
//

import SwiftUI
import Observation

struct HomeView: View {
    @Environment(AuthViewModel.self) private var model
    @State private var home = HomeViewModel()

    // UI local state
    @State private var showProfile: Bool = false
    @State private var showSearch: Bool = false
    @State private var showAllTemplates: Bool = false
    @State private var selectedTemplate: TemplateDTO?

    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()

                ScrollViewReader { proxy in
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 0) {
                            // Hero Section: Fixed at top with pull-to-refresh
                            HeroSection(
                                heroTemplates: home.heroTemplates,
                                isLoading: home.isLoading,
                                onTemplateTap: { template in
                                    selectedTemplate = template
                                }
                            )
                            .ignoresSafeArea(edges: .top)

                            // Trending Now Section: Horizontal scroll
                        TrendingNowSection(
                            templates: home.trendingNowTemplates,
                            isLoading: home.isLoading,
                            isFavorite: { item in home.isFavorite(item) },
                            onTemplateTap: { item in
                                if let dto = item.dto {
                                    selectedTemplate = dto
                                }
                            },
                            onToggleFavorite: { item in
                                home.toggleFavorite(item)
                            },
                            onSeeAllTap: {
                                showAllTemplates = true
                            }
                        )
                        .padding(.top, 24)
                        
                        // New Section: Latest templates
                        NewSection(
                            templates: home.newTemplates,
                            isLoading: home.isLoading,
                            isFavorite: { item in home.isFavorite(item) },
                            onTemplateTap: { item in
                                if let dto = item.dto {
                                    selectedTemplate = dto
                                }
                            },
                            onToggleFavorite: { item in
                                home.toggleFavorite(item)
                            },
                            onSeeAllTap: {
                                showAllTemplates = true
                            }
                        )
                        .padding(.top, 24)
                        .padding(.bottom, 24)
                    }
                    }
                }
                .refreshable {
                    performRefresh()
                }
                .ignoresSafeArea(edges: .top)
                .overlay(alignment: .top) {
                    // Loading / Error banners
                    if home.isLoading {
                        HUDGlass(text: L10n.tr("l10n.home.loading"))
                            .transition(.opacity)
                            .padding(.top, 8)
                    } else if let err = home.errorMessage, !err.isEmpty {
                        BannerGlass(text: err, tint: .red) {
                            // Retry API call if user is logged in
                            if let token = model.loadToken() {
                                withAnimation {
                                    home.fetchTrendingFromAPI(
                                        bearerIDToken: token,
                                        limit: 9,
                                        tokenProvider: { try await model.fetchFreshIDToken() }
                                    )
                                    home.fetchNewTemplatesFromAPI(
                                        bearerIDToken: token,
                                        limit: 6,
                                        tokenProvider: { try await model.fetchFreshIDToken() }
                                    )
                                }
                            }
                        }
                        .transition(.move(edge: .top).combined(with: .opacity))
                        .padding(.top, 8)
                    }
                }
            }
            .navigationDestination(item: $selectedTemplate) { template in
                TemplateSelectionView(template: template)
                    .toolbar(.hidden, for: .tabBar)
            }
            .navigationDestination(isPresented: $showAllTemplates) {
                AllTemplatesView()
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            // Load trending templates for home screen (only if logged in)
            if home.trendingTemplates.isEmpty {
                guard let token = model.loadToken() else {
                    // User not logged in - show empty state
                    home.isLoading = false
                    home.errorMessage = nil
                    return
                }

                home.fetchTrendingFromAPI(
                    bearerIDToken: token,
                    limit: 9, // Get 9 templates: up to 4 for hero carousel + 5 for trending now
                    tokenProvider: { try await model.fetchFreshIDToken() }
                )
            }

            // Load new templates for home screen (only if logged in)
            if home.newTemplates.isEmpty {
                guard let token = model.loadToken() else {
                    // User not logged in - skip loading new templates
                    return
                }

            home.fetchNewTemplatesFromAPI(
                bearerIDToken: token,
                limit: 6, // Get 6 new templates
                tokenProvider: { try await model.fetchFreshIDToken() }
            )
            }
        }
        .fullScreenCover(isPresented: $showProfile) {
            ProfileView()
        }
        .fullScreenCover(isPresented: $showSearch) {
            SearchView()
        }
    }

    // MARK: - Private Methods

    private func performRefresh() {
        guard let token = model.loadToken() else { return }

        Task {
            await MainActor.run {
                home.fetchTrendingFromAPI(
                    bearerIDToken: token,
                    limit: 9,
                    tokenProvider: { try await model.fetchFreshIDToken() }
                )

                home.fetchNewTemplatesFromAPI(
                    bearerIDToken: token,
                    limit: 6,
                    tokenProvider: { try await model.fetchFreshIDToken() }
                )
            }

            // Small delay to show refresh indicator
            try await Task.sleep(nanoseconds: 500_000_000) // 0.5 second
        }
    }
}

// MARK: - Preview

#if DEBUG
#Preview("Home") {
    // Preview: Shows empty state when not logged in (production behavior)
    // For preview with data, login in app or use Xcode Previews with logged-in state
    let auth = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    return HomeView().environment(auth)
}
#endif
