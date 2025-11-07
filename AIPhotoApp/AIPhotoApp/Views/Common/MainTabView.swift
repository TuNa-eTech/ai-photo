//
//  MainTabView.swift
//  AIPhotoApp
//
//  Main tab navigation with Home, Projects, and Profile tabs
//  Styled with Liquid Glass Beige Minimalist design system
//

import SwiftUI

struct MainTabView: View {
    let authViewModel: AuthViewModel
    
    @State private var selectedTab: TabItem = .home
    
    enum TabItem: String, CaseIterable {
        case home = "Home"
        case projects = "Projects"
        case profile = "Profile"
        case search = "Search"
        
        var icon: String {
            switch self {
            case .home: return "house.fill"
            case .projects: return "photo.stack.fill"
            case .profile: return "person.fill"
            case .search: return "magnifyingglass"
            }
        }
    }
    
    var body: some View {
        ZStack {
            GlassBackgroundView()
            
            TabView(selection: $selectedTab) {
                // Home Tab
                Tab(value: TabItem.home) {
                    HomeView(model: self.authViewModel)
                } label: {
                    Label(TabItem.home.rawValue, systemImage: TabItem.home.icon)
                }
                
                // Projects Tab
                Tab(value: TabItem.projects) {
                    MyProjectsView()
                } label: {
                    Label(TabItem.projects.rawValue, systemImage: TabItem.projects.icon)
                }
                
                // Profile Tab
                Tab(value: TabItem.profile) {
                    ProfileView(model: self.authViewModel)
                } label: {
                    Label(TabItem.profile.rawValue, systemImage: TabItem.profile.icon)
                }
                
                // Search Tab (trailing end)
                Tab(value: TabItem.search, role: .search) {
                    SearchView(model: self.authViewModel)
                } label: {
                    Label(TabItem.search.rawValue, systemImage: TabItem.search.icon)
                }
            }
            .tint(GlassTokens.textPrimary)
            .tabBarMinimizeBehavior(.onScrollDown)
            .onAppear {
                setupTabBarAppearance()
            }
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
    MainTabView(
        authViewModel: AuthViewModel(
            authService: AuthService(),
            userRepository: UserRepository()
        )
    )
}

