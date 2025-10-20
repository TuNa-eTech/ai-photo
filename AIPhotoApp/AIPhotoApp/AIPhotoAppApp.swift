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
    }

    var body: some Scene {
        WindowGroup {
            RootRouterView(model: authModel)
                .onOpenURL { url in
                    GIDSignIn.sharedInstance.handle(url)
                }
        }
    }
}
