//
//  AuthView.swift
//  imageaiwrapper
//
//  Created by Gemini on 10/12/2025.
//

import SwiftUI
import Supabase
import AuthenticationServices

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

    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        isLoading = true
        authError = nil
        
        guard case .success(let authorization) = result,
              let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let idTokenData = appleIDCredential.identityToken,
              let idToken = String(data: idTokenData, encoding: .utf8)
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

        Task {
            do {
                try await supabase.auth.signInWithIdToken(
                    credentials: .init(provider: .apple, idToken: idToken)
                )
                // The session is automatically handled by the `.onAuthStateChange` listener in the main App file.
            } catch {
                print("### Supabase Auth Error: \(error.localizedDescription)")
                self.authError = error
            }
            isLoading = false
        }
    }
}

struct AuthView_Previews: PreviewProvider {
    static var previews: some View {
        AuthView()
    }
}
