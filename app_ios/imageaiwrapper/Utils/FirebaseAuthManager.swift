// FirebaseAuthManager.swift
// imageaiwrapper

import Foundation
import FirebaseAuth
import GoogleSignIn
import AuthenticationServices
import UIKit
import Combine
import FirebaseCore

class FirebaseAuthManager: NSObject, ObservableObject {
    static let shared = FirebaseAuthManager()

    // MARK: - ObservableObject conformance
    let objectWillChange = PassthroughSubject<Void, Never>()

    @Published var user: User? {
        willSet { objectWillChange.send() }
    }
    @Published var idToken: String? {
        willSet { objectWillChange.send() }
    }
    @Published var error: Error? {
        willSet { objectWillChange.send() }
    }

    private override init() {
        super.init()
        self.user = Auth.auth().currentUser
        self.refreshIDToken()
    }
    
    // MARK: - Google Sign-In
    func signInWithGoogle(presentingViewController: UIViewController, completion: @escaping (Result<User, Error>) -> Void) {
        guard let clientID = FirebaseApp.app()?.options.clientID else {
            completion(.failure(NSError(domain: "FirebaseAuthManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "Missing Google client ID"])))
            return
        }
        let config = GIDConfiguration(clientID: clientID)
        GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController) { result, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            guard
                let user = result?.user,
                let idToken = user.idToken?.tokenString
            else {
                completion(.failure(NSError(domain: "FirebaseAuthManager", code: -2, userInfo: [NSLocalizedDescriptionKey: "Google authentication failed"])))
                return
            }
            let credential = GoogleAuthProvider.credential(withIDToken: idToken, accessToken: "")
            Auth.auth().signIn(with: credential) { authResult, error in
                if let error = error {
                    completion(.failure(error))
                } else if let user = authResult?.user {
                    self.user = user
                    self.refreshIDToken()
                    completion(.success(user))
                } else {
                    completion(.failure(NSError(domain: "FirebaseAuthManager", code: -3, userInfo: [NSLocalizedDescriptionKey: "Unknown error during Google sign-in"])))
                }
            }
        }
    }
    
    // MARK: - Apple Sign-In
    func signInWithApple(credential: ASAuthorizationAppleIDCredential, completion: @escaping (Result<User, Error>) -> Void) {
        guard let idTokenData = credential.identityToken,
              let idTokenString = String(data: idTokenData, encoding: .utf8) else {
            completion(.failure(NSError(domain: "FirebaseAuthManager", code: -4, userInfo: [NSLocalizedDescriptionKey: "Unable to fetch Apple ID token"])))
            return
        }
        let credential = OAuthProvider.credential(providerID: AuthProviderID.apple, idToken: idTokenString)
        Auth.auth().signIn(with: credential) { authResult, error in
            if let error = error {
                completion(.failure(error))
            } else if let user = authResult?.user {
                self.user = user
                self.refreshIDToken(printToken: true)
                completion(.success(user))
            } else {
                completion(.failure(NSError(domain: "FirebaseAuthManager", code: -5, userInfo: [NSLocalizedDescriptionKey: "Unknown error during Apple sign-in"])))
            }
        }
    }
    
    // MARK: - Get ID Token
    func refreshIDToken(printToken: Bool = false) {
        guard let user = Auth.auth().currentUser else {
            self.idToken = nil
            return
        }
        user.getIDToken { token, error in
            if let token = token {
                self.idToken = token
                if printToken {
                    print("Firebase ID Token after Apple login: \(token)")
                }
            }
        }
    }
    
    func getIDToken(completion: @escaping (String?) -> Void) {
        guard let user = Auth.auth().currentUser else {
            completion(nil)
            return
        }
        user.getIDToken { token, error in
            completion(token)
        }
    }
    
    // MARK: - Sign Out
    func signOut() {
        do {
            try Auth.auth().signOut()
            self.user = nil
            self.idToken = nil
        } catch {
            self.error = error
        }
    }
}
