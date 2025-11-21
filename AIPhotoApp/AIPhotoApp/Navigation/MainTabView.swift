//
//  MainTabView.swift
//  AIPhotoApp
//
//  Main tab navigation with Home, Projects, and Profile tabs
//  Styled with Liquid Glass Beige Minimalist design system
//

import SwiftUI

struct MainTabView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var navigationViewModel = NavigationViewModel()

    enum TabItem: String, CaseIterable {
        case home = "l10n.tab.home"
        case projects = "l10n.tab.projects"
        case profile = "l10n.tab.profile"
        case search = "l10n.tab.search"

        var icon: String {
            switch self {
            case .home: return "house.fill"
            case .projects: return "photo.stack.fill"
            case .profile: return "person.fill"
            case .search: return "magnifyingglass"
            }
        }

        var localizedLabel: String {
            L10n.tr(self.rawValue)
        }
    }

    var body: some View {
        ZStack {
            GlassBackgroundView()

            TabView(selection: $navigationViewModel.selectedTab) {
                // Home Tab
                Tab(value: TabItem.home) {
                    HomeView()
                } label: {
                    Label(TabItem.home.localizedLabel, systemImage: TabItem.home.icon)
                }

                // Projects Tab
                Tab(value: TabItem.projects) {
                    MyProjectsView()
                } label: {
                    Label(TabItem.projects.localizedLabel, systemImage: TabItem.projects.icon)
                }

                // Profile Tab
                Tab(value: TabItem.profile) {
                    ProfileView()
                } label: {
                    Label(TabItem.profile.localizedLabel, systemImage: TabItem.profile.icon)
                }

                // Search Tab (trailing end)
                Tab(value: TabItem.search, role: .search) {
                    SearchView()
                } label: {
                    Label(TabItem.search.localizedLabel, systemImage: TabItem.search.icon)
                }
            }
            .tint(GlassTokens.textPrimary)
            .tabBarMinimizeBehavior(.onScrollDown)
            .onAppear {
                setupTabBarAppearance()
            }
            .environment(navigationViewModel)
        }
    }

    private func setupTabBarAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithTransparentBackground()

        // Background with glass effect
        appearance.backgroundColor = UIColor.clear

        // Selected tab color - use dark brown for better contrast
        appearance.stackedLayoutAppearance.selected.iconColor = UIColor(GlassTokens.textPrimary)
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
            .foregroundColor: UIColor(GlassTokens.textPrimary)
        ]

        // Unselected tab color
        appearance.stackedLayoutAppearance.normal.iconColor = UIColor(GlassTokens.textSecondary)
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            .foregroundColor: UIColor(GlassTokens.textSecondary)
        ]

        // Apply appearance
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance

        // Add glass effect
        UITabBar.appearance().isTranslucent = true
        UITabBar.appearance().barTintColor = .clear
    }
}

// MARK: - Preview

#Preview {
    let authViewModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    return MainTabView()
        .environment(authViewModel)
}
