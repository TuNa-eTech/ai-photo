//  AppConfig.swift
//  AIPhotoApp
//
//  Global configuration constants

import Foundation

enum AppConfig {
    // Backend Base URL Configuration
    // IMPORTANT: iOS Simulator cannot access "localhost" of host machine!
    // 
    // OPTIONS:
    // 1. Use your Mac's IP address (find with: ipconfig getifaddr en0)
    //    Example: "http://192.168.1.123:8080"
    // 2. Use ngrok for testing: "https://abc123.ngrok.io"
    // 3. Use "http://localhost:8080" only when running on physical device with USB debugging
    //
    // TODO: Replace "localhost" with your Mac's IP address for Simulator testing
    // Support runtime override via:
    // - Environment variable: API_BASE_URL (set in Xcode Scheme → Run → Arguments → Environment)
    // - UserDefaults key: "API_BASE_URL" (for hot switching without rebuild)
    private static let defaultBaseURLString = "http://localhost:8080"
    // private static let defaultBaseURLString = "https://impavidly-feuilletonistic-dacia.ngrok-free.dev"
    // private static let defaultBaseURLString = "https://bokphoto-api.e-tech.network"
    private static let selectedBaseURLString: String = {
        if let env = ProcessInfo.processInfo.environment["API_BASE_URL"], !env.isEmpty {
            return env
        }
        if let override = UserDefaults.standard.string(forKey: "API_BASE_URL"), !override.isEmpty {
            return override
        }
        return defaultBaseURLString
    }()
    
    static let backendBaseURL: URL = {
        guard let url = URL(string: selectedBaseURLString) else {
            fatalError("Invalid backend base URL: \(selectedBaseURLString)")
        }
        return url
    }()

    // API Paths
    enum APIPath {
        static let registerUser = "/v1/users/register"
        static let getUserProfile = "/v1/users/me"
        static let templates = "/v1/templates"
        static let trendingTemplates = "/v1/templates/trending"
        static let categories = "/v1/templates/categories"
        static let processImage = "/v1/images/process"
        static let creditsBalance = "/v1/credits/balance"
        static let creditsPurchase = "/v1/credits/purchase"
        static let creditsTransactions = "/v1/credits/transactions"
        static let creditsReward = "/v1/credits/reward"
        static let iapProducts = "/v1/iap/products"
    }
    
    static let baseURL: String = selectedBaseURLString
}

// MARK: - Notification Names

extension Notification.Name {
    static let creditsBalanceUpdated = Notification.Name("creditsBalanceUpdated")
}
