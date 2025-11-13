//
//  AIPhotoAppApp.swift
//  AIPhotoApp
//
//  Created by Anh Tu on 18/10/25.
//

import SwiftUI
#if canImport(FirebaseCore)
import FirebaseCore
#endif
#if canImport(GoogleSignIn)
import GoogleSignIn
#endif
#if canImport(GoogleMobileAds)
import GoogleMobileAds
#endif

@main
struct AIPhotoAppApp: App {
    @State private var authModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    @State private var i18n = LocalizationModel()

    init() {
        // Initialize FirebaseApp
        #if canImport(FirebaseCore)
        FirebaseApp.configure()
        #endif
        
        // Runtime language is applied via LocalizationModel + L10n at render time.
        // No AppleLanguages mutation is needed (and would require app restart).
        
        #if DEBUG
        // For testing, we can use test App ID if needed
        // Test App ID: ca-app-pub-3940256099942544~1458002511
        // Note: Test ad unit IDs should work with any App ID, but using test App ID is recommended
        #endif
        
        // Initialize the Google Mobile Ads SDK.
        // SDK handles initialization automatically - no need to wait
        #if canImport(GoogleMobileAds)
        MobileAds.shared.start { initializationStatus in
            #if DEBUG
            print("✅ Google Mobile Ads SDK initialized.")
            if let appID = Bundle.main.object(forInfoDictionaryKey: "GADApplicationIdentifier") as? String {
                print("   App ID: \(appID)")
            }
            print("   Test ad unit IDs will show test ads automatically.")
            #endif
        }
        #endif
        
        // Request notification permissions
        Task {
            await NotificationManager.shared.requestPermissions()
        }
    }

    var body: some Scene {
        WindowGroup {
            RootRouterView()
                .environment(authModel)  // Provide AuthViewModel globally via @Environment
                .environment(i18n)       // Provide LocalizationModel for runtime language switching
                // Set SwiftUI locale so LocalizedStringKey resolves to selected language at runtime (and update live)
                .environment(\.locale, i18n.locale)
                // Force view tree refresh when language changes
                .id(i18n.language.rawValue)
                #if DEBUG
                .onChange(of: i18n.language) { _ in
                    print("🌐 [i18n] language changed → \(i18n.language.rawValue), locale=\(i18n.locale.identifier)")
                }
                #endif
                .onOpenURL { url in
                    #if canImport(GoogleSignIn)
                    GIDSignIn.sharedInstance.handle(url)
                    #endif
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
