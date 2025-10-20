//  BootstrapViews.swift
//  AIPhotoApp
//
//  SplashView: initial screen that bootstraps session and routes accordingly.
//  RootRouterView: top-level router deciding between Splash, Home, and Login.

import SwiftUI

struct SplashView: View {
    let model: AuthViewModel

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
    let model: AuthViewModel

    var body: some View {
        Group {
            if !model.isBootstrapped {
                SplashView(model: model)
            } else if model.isAuthenticated {
                // Go straight to Home when authenticated
                TemplatesHomeView(model: model)
            } else {
                // Otherwise show the login landing
                AuthLandingView(model: model)
            }
        }
    }
}
