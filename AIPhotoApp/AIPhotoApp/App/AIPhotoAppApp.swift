//
//  AIPhotoAppApp.swift
//  AIPhotoApp
//
//  Created by Anh Tu on 18/10/25.
//

import SwiftUI
import FirebaseCore
import GoogleSignIn

@main
struct AIPhotoAppApp: App {
    @State private var authModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())

    init() {
        FirebaseApp.configure()
        
        // Request notification permissions
        Task {
            await NotificationManager.shared.requestPermissions()
        }
    }

    var body: some Scene {
        WindowGroup {
            RootRouterView()
                .environment(authModel)  // Provide AuthViewModel globally via @Environment
                .onOpenURL { url in
                    GIDSignIn.sharedInstance.handle(url)
                }
                .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { userActivity in
                    // Handle background URLSession
                    if let url = userActivity.webpageURL {
                        // Background download completion handled by BackgroundImageProcessor
                        print("Background session completed")
                    }
                }
        }
    }
}
