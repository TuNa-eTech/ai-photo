//
//  AIPhotoAppApp.swift
//  AIPhotoApp
//
//  Created by Anh Tu on 18/10/25.
//

import SwiftUI
import FirebaseCore
import GoogleSignIn
import GoogleMobileAds

@main
struct AIPhotoAppApp: App {
    @State private var authModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())

    init() {
        // Initialize FirebaseApp
        FirebaseApp.configure()
        
        #if DEBUG
        // For testing, we can use test App ID if needed
        // Test App ID: ca-app-pub-3940256099942544~1458002511
        // Note: Test ad unit IDs should work with any App ID, but using test App ID is recommended
        #endif
        
        // Initialize the Google Mobile Ads SDK.
        // SDK handles initialization automatically - no need to wait
        MobileAds.shared.start { initializationStatus in
            #if DEBUG
            print("✅ Google Mobile Ads SDK initialized.")
            if let appID = Bundle.main.object(forInfoDictionaryKey: "GADApplicationIdentifier") as? String {
                print("   App ID: \(appID)")
            }
            print("   Test ad unit IDs will show test ads automatically.")
            #endif
        }
        
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
                    if userActivity.webpageURL != nil {
                        // Background download completion handled by BackgroundImageProcessor
                        print("Background session completed")
                    }
                }
        }
    }
}
