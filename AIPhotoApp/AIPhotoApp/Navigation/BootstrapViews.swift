//  BootstrapViews.swift
//  AIPhotoApp
//
//  SplashView: initial screen that bootstraps session and routes accordingly.
//  RootRouterView: top-level router deciding between Splash, Home, and Login.

import SwiftUI

struct SplashView: View {
    @Environment(AuthViewModel.self) private var model

    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()
            VStack(spacing: 12) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle())
                Text("Đang tải...")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .onAppear {
            // Bootstrap session on app launch (silent token fetch if currentUser exists)
            model.bootstrapOnLaunch()
        }
    }
}

struct RootRouterView: View {
    @Environment(AuthViewModel.self) private var model

    var body: some View {
        Group {
            if !model.isBootstrapped {
                SplashView()
            } else if model.isAuthenticated {
                // Show MainTabView when authenticated
                MainTabView()
            } else {
                // Otherwise show the login landing (V2 with Liquid Glass design)
                AuthLandingView()
            }
        }
    }
}
