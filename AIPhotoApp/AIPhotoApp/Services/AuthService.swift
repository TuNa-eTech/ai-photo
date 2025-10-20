//  AuthService.swift
//  AIPhotoApp
//
//  Handles Google Sign-In and Sign in with Apple, then signs into Firebase
//  and returns an AuthSession containing a fresh Firebase ID token.

import Foundation
#if canImport(UIKit)
import UIKit
#endif
import AuthenticationServices
import FirebaseCore
import FirebaseAuth
import GoogleSignIn

final class AuthService {

    // MARK: - ID Token Listener

    private var idTokenHandle: AuthStateDidChangeListenerHandle?

    /// Start listening for Firebase ID token changes. Calls onUpdate with a fresh (non-forced) token.
    func startIDTokenListener(onUpdate: @escaping (String) -> Void) {
        #if canImport(FirebaseAuth)
        idTokenHandle = Auth.auth().addIDTokenDidChangeListener { _, user in
            user?.getIDTokenForcingRefresh(false) { token, _ in
                if let token = token {
                    onUpdate(token)
                }
            }
        }
        #endif
    }

    /// Stop the Firebase ID token change listener if active.
    func stopIDTokenListener() {
        #if canImport(FirebaseAuth)
        if let handle = idTokenHandle {
            Auth.auth().removeIDTokenDidChangeListener(handle)
        }
        idTokenHandle = nil
        #endif
    }

    // MARK: - Google Sign-In

    func signInWithGoogle(presenting viewController: UIViewController) async throws -> AuthSession {
        // Ensure Firebase is configured and we have a clientID
        guard FirebaseApp.app() != nil else {
            throw AuthError.firebaseNotConfigured
        }

        // Present Google Sign-In
        if GIDSignIn.sharedInstance.configuration == nil,
           let clientID = FirebaseApp.app()?.options.clientID {
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
        }
        let result: GIDSignInResult = try await withCheckedThrowingContinuation { continuation in
            GIDSignIn.sharedInstance.signIn(withPresenting: viewController) { result, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                guard let result = result else {
                    continuation.resume(throwing: AuthError.unknown)
                    return
                }
                continuation.resume(returning: result)
            }
        }

        guard let idToken = result.user.idToken?.tokenString else {
            throw AuthError.missingGoogleIDToken
        }
        // In recent GoogleSignIn, accessToken is non-optional
        let accessToken = result.user.accessToken.tokenString

        let credential = GoogleAuthProvider.credential(withIDToken: idToken, accessToken: accessToken)
        let authData = try await signInToFirebase(with: credential)

        // Prefer Firebase user profile as source of truth
        let name = authData.user.displayName
        let email = authData.user.email
        let avatarURL = authData.user.photoURL

        let firebaseIDToken = try await fetchFirebaseIDToken(forceRefresh: true)

        return AuthSession(
            name: name,
            email: email,
            avatarURL: avatarURL,
            idToken: firebaseIDToken
        )
    }

    // MARK: - Sign in with Apple

    // Configure an Apple ID request: sets scopes and applies hashed nonce.
    // Returns the raw nonce (store it to use when processing completion).
    func configure(_ request: ASAuthorizationAppleIDRequest) -> String {
        let rawNonce = Nonce.randomString()
        request.requestedScopes = [.fullName, .email]
        request.nonce = Nonce.sha256(rawNonce)
        return rawNonce
    }

    // Finish Apple sign-in by signing into Firebase with the provided credential and raw nonce.
    func signInWithApple(credential appleCredential: ASAuthorizationAppleIDCredential, rawNonce: String) async throws -> AuthSession {
        guard let identityToken = appleCredential.identityToken,
              let idTokenString = String(data: identityToken, encoding: .utf8) else {
            throw AuthError.missingAppleIdentityToken
        }

        let credential = OAuthProvider.credential(
            providerID: .apple,
            idToken: idTokenString,
            rawNonce: rawNonce
        )

        let authData = try await signInToFirebase(with: credential)

        let name = authData.user.displayName
        // Apple may not return email after the first sign-in; Firebase may also not contain it.
        let email = authData.user.email
        let avatarURL = authData.user.photoURL

        let firebaseIDToken = try await fetchFirebaseIDToken(forceRefresh: true)

        return AuthSession(
            name: name,
            email: email,
            avatarURL: avatarURL,
            idToken: firebaseIDToken
        )
    }

    // MARK: - Firebase helpers

    private func signInToFirebase(with credential: AuthCredential) async throws -> AuthDataResult {
        try await withCheckedThrowingContinuation { continuation in
            Auth.auth().signIn(with: credential) { authResult, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                guard let authResult = authResult else {
                    continuation.resume(throwing: AuthError.unknown)
                    return
                }
                continuation.resume(returning: authResult)
            }
        }
    }

    func fetchFirebaseIDToken(forceRefresh: Bool = false) async throws -> String {
        guard let user = Auth.auth().currentUser else { throw AuthError.notSignedIn }
        return try await withCheckedThrowingContinuation { continuation in
            user.getIDTokenForcingRefresh(forceRefresh) { token, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                guard let token = token else {
                    continuation.resume(throwing: AuthError.unknown)
                    return
                }
                continuation.resume(returning: token)
            }
        }
    }
}

// MARK: - Errors

enum AuthError: LocalizedError {
    case firebaseNotConfigured
    case missingGoogleIDToken
    case missingAppleIdentityToken
    case notSignedIn
    case unknown

    var errorDescription: String? {
        switch self {
        case .firebaseNotConfigured: return "Firebase is not configured."
        case .missingGoogleIDToken: return "Missing Google ID token."
        case .missingAppleIdentityToken: return "Missing Apple identity token."
        case .notSignedIn: return "No Firebase user is signed in."
        case .unknown: return "Unknown authentication error."
        }
    }
}
