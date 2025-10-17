//
//  AuthView.swift
//  imageaiwrapper
//
//  Created by Gemini on 10/12/2025.
//

import SwiftUI
import AuthenticationServices
import GoogleSignIn
import FirebaseAuth
import UIKit

struct AuthView: View {
    @State private var isLoading = false
    @State private var authError: Error? = nil

    var body: some View {
        VStack(spacing: 20) {
            Text("AI Image Stylist")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding(.top, 40)
            
            Spacer()

            // Google Sign-In Button
            Button(action: {
                isLoading = true
                authError = nil
                if let rootVC = Self.rootViewController() {
                    FirebaseAuthManager.shared.signInWithGoogle(presentingViewController: rootVC) { result in
                        DispatchQueue.main.async {
                            isLoading = false
                            switch result {
                            case .success(_):
                                break // Success handled by ContentView session state
                            case .failure(let error):
                                self.authError = error
                            }
                        }
                    }
                } else {
                    isLoading = false
                    self.authError = NSError(domain: "AuthView", code: 1, userInfo: [
                        NSLocalizedDescriptionKey: "Unable to find the root view controller."
                    ])
                }
            }) {
                HStack {
                    Image(systemName: "globe")
                    Text("Sign in with Google")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(.systemBlue))
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .frame(height: 55)

            // Apple Sign-In Button
            SignInWithAppleButton(
                onRequest: { request in
                    request.requestedScopes = [.fullName, .email]
                },
                onCompletion: handleAppleSignIn
            )
            .signInWithAppleButtonStyle(.black)
            .frame(height: 55)
            .cornerRadius(10)
            
            Spacer()

            if let authError {
                Text(authError.localizedDescription)
                    .foregroundColor(.red)
                    .padding()
            }

            if isLoading {
                ProgressView()
                    .padding()
            }
        }
        .padding()
    }

    /// Returns the current key window's rootViewController in a modern iOS 15+ compatible way.
    static func rootViewController() -> UIViewController? {
        // Get connected scenes
        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first(where: { $0.isKeyWindow })?.rootViewController
    }

    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        isLoading = true
        authError = nil
        
        guard case .success(let authorization) = result,
              let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential
        else {
            if case .failure(let error) = result {
                print("### Apple Sign-In Error: \(error.localizedDescription)")
                self.authError = error
            } else {
                let errorMessage = "Failed to get valid credentials from Apple Sign-In."
                print("### Apple Sign-In Error: \(errorMessage)")
                self.authError = URLError(.badServerResponse, userInfo: [NSLocalizedDescriptionKey: errorMessage])
            }
            isLoading = false
            return
        }

        FirebaseAuthManager.shared.signInWithApple(credential: appleIDCredential) { result in
            DispatchQueue.main.async {
                isLoading = false
                switch result {
                case .success(_):
                    break // Success handled by ContentView session state
                case .failure(let error):
                    self.authError = error
                }
            }
        }
    }
}

struct AuthView_Previews: PreviewProvider {
    static var previews: some View {
        AuthView()
    }
}
