//  AuthViewModel.swift
//  AIPhotoApp
//
//  State + actions for Authentication flow (Google / Apple) and profile registration.

import Foundation
import Observation
import AuthenticationServices
#if canImport(UIKit)
import UIKit
#endif
#if canImport(FirebaseAuth)
import FirebaseAuth
#endif
#if canImport(GoogleSignIn)
import GoogleSignIn
#endif

@Observable
final class AuthViewModel {
    // Dependencies
    private let authService: AuthService
    private let userRepository: UserRepository

    // UI State
    var isLoading: Bool = false
    var errorMessage: String?
    var requiresProfileCompletion: Bool = false
    var isAuthenticated: Bool = false
    var isBootstrapped: Bool = false

    // Profile data (prefilled from provider when available)
    var name: String = ""
    var email: String = ""
    var avatarURL: URL?

    // Internal
    private var session: AuthSession?
    private var appleRawNonce: String?

    // Keychain identifiers
    private let kcService = Bundle.main.bundleIdentifier ?? "AIPhotoApp"
    private let kcAccount = "firebase_id_token"

    init(authService: AuthService, userRepository: UserRepository) {
        self.authService = authService
        self.userRepository = userRepository
    }

    // MARK: - Google Sign-In

    @MainActor
    func signInWithGoogle() {
        guard let presenter = UIApplication.topMostViewController() else {
            self.errorMessage = "Không thể trình bày màn hình đăng nhập Google."
            return
        }
        isLoading = true
        errorMessage = nil
        Task { @MainActor in
            do {
                let sess = try await authService.signInWithGoogle(presenting: presenter)
                handleSignedIn(session: sess)
            } catch {
                setError(error.localizedDescription)
            }
        }
    }

    // MARK: - Apple Sign-In

    // Hook for SignInWithAppleButton(onRequest:)
    func configureAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
        let raw = authService.configure(request)
        appleRawNonce = raw
    }

    // Hook for SignInWithAppleButton(onCompletion:)
    @MainActor
    func handleAppleCompletion(_ result: Result<ASAuthorization, Error>) {
        isLoading = true
        errorMessage = nil
        switch result {
        case .failure(let error):
            self.isLoading = false
            self.errorMessage = error.localizedDescription
        case .success(let auth):
            guard
                let credential = auth.credential as? ASAuthorizationAppleIDCredential,
                let rawNonce = appleRawNonce
            else {
                self.isLoading = false
                self.errorMessage = "Không lấy được Apple credential."
                return
            }
            Task { @MainActor in
                do {
                    let sess = try await authService.signInWithApple(credential: credential, rawNonce: rawNonce)
                    handleSignedIn(session: sess)
                } catch {
                    setError(error.localizedDescription)
                }
            }
        }
    }

    // MARK: - Profile Submit

    @MainActor
    func submitProfile() {
        guard let sess = session else {
            self.errorMessage = "Phiên đăng nhập không hợp lệ. Vui lòng thử lại."
            return
        }
        guard !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              isValidEmail(email)
        else {
            self.errorMessage = "Vui lòng nhập tên và email hợp lệ."
            return
        }
        isLoading = true
        errorMessage = nil
        Task { @MainActor in
            do {
                try await register(
                    name: name,
                    email: email,
                    avatarURL: avatarURL,
                    idToken: sess.idToken,
                    tokenProvider: { try await self.authService.fetchFirebaseIDToken(forceRefresh: true) }
                )
                setAuthenticated()
            } catch {
                setError(error.localizedDescription)
            }
        }
    }

    // MARK: - Logout

    @MainActor
    func logout() {
        isLoading = true
        errorMessage = nil
        Task { @MainActor in
            #if canImport(FirebaseAuth)
            _ = try? Auth.auth().signOut()
            #endif
            #if canImport(GoogleSignIn)
            GIDSignIn.sharedInstance.signOut()
            #endif
            // Stop token listener and clear persisted token
            authService.stopIDTokenListener()
            clearToken()
            clearSession()
        }
    }
    
    // Alias for logout (async version for ProfileView)
    @MainActor
    func signOut() async throws {
        logout()
    }

    @MainActor
    private func clearSession() {
        self.session = nil
        self.appleRawNonce = nil
        self.name = ""
        self.email = ""
        self.avatarURL = nil
        self.isAuthenticated = false
        self.isLoading = false
        self.errorMessage = nil
        self.requiresProfileCompletion = false
    }

    // MARK: - Bootstrap & Token persistence

    func loadToken() -> String? {
        if let data = try? Keychain.load(service: kcService, account: kcAccount) {
            return String(data: data, encoding: .utf8)
        }
        return nil
    }

    private func persistToken(_ token: String) {
        guard let data = token.data(using: .utf8) else { return }
        try? Keychain.save(service: kcService, account: kcAccount, data: data)
    }

    private func clearToken() {
        try? Keychain.delete(service: kcService, account: kcAccount)
    }

    @MainActor
    func bootstrapOnLaunch() {
        isLoading = true
        errorMessage = nil
        Task { @MainActor in
            #if canImport(FirebaseAuth)
            if Auth.auth().currentUser != nil {
                do {
                    let token = try await authService.fetchFirebaseIDToken(forceRefresh: false)
                    persistToken(token)
                    setAuthenticated()
                } catch {
                    self.isAuthenticated = false
                }
            } else {
                self.isAuthenticated = false
            }
            #else
            self.isAuthenticated = false
            #endif
            self.isBootstrapped = true
            self.isLoading = false
        }
    }

    // MARK: - Token refresh (public)
    func fetchFreshIDToken() async throws -> String {
        try await authService.fetchFirebaseIDToken(forceRefresh: true)
    }

    // MARK: - Helpers

    @MainActor
    private func handleSignedIn(session: AuthSession) {
        self.session = session
        // Prefill profile from provider (may be nil/empty depending on provider)
        let emailValue = (session.email ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let providedName = (session.name ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let derivedName: String = providedName.isEmpty ? deriveName(fromEmail: emailValue) : providedName

        self.name = derivedName
        self.email = emailValue
        self.avatarURL = session.avatarURL

        // Always attempt automatic registration without prompting for additional info.
        Task { @MainActor in
            do {
                try await register(
                    name: self.name,
                    email: self.email,
                    avatarURL: self.avatarURL,
                    idToken: session.idToken,
                    tokenProvider: { try await self.authService.fetchFirebaseIDToken(forceRefresh: true) }
                )
                setAuthenticated()
            } catch {
                setError(error.localizedDescription)
            }
        }
    }

    private func register(name: String, email: String, avatarURL: URL?, idToken: String, tokenProvider: (() async throws -> String)? = nil) async throws {
        _ = try await userRepository.registerUser(name: name, email: email, avatarURL: avatarURL, bearerIDToken: idToken, tokenProvider: tokenProvider)
    }

    @MainActor
    private func setAuthenticated() {
        // Persist latest token if available and start token listener
        if let token = self.session?.idToken {
            persistToken(token)
        }
        authService.startIDTokenListener { [weak self] newToken in
            self?.persistToken(newToken)
        }

        self.isLoading = false
        self.requiresProfileCompletion = false
        self.errorMessage = nil
        self.isAuthenticated = true
    }

    @MainActor
    private func setError(_ message: String) {
        self.isLoading = false
        self.errorMessage = message
    }

    private func deriveName(fromEmail email: String) -> String {
        let trimmed = email.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return "" }
        if let atIndex = trimmed.firstIndex(of: "@") {
            return String(trimmed[..<atIndex])
        }
        return trimmed
    }

    private func isValidEmail(_ email: String) -> Bool {
        // Simple regex for email validation
        let pattern = #"^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        return email.range(of: pattern, options: .regularExpression) != nil
    }
}
