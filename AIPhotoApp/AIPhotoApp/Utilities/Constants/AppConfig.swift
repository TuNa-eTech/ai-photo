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
    private static let baseURLString = "http://localhost:8080"  // ← Change this to your Mac IP!
    
    static let backendBaseURL: URL = {
        guard let url = URL(string: baseURLString) else {
            fatalError("Invalid backend base URL: \(baseURLString)")
        }
        return url
    }()

    // API Paths
    enum APIPath {
        static let registerUser = "/v1/users/register"
        static let templates = "/v1/templates"
        static let trendingTemplates = "/v1/templates/trending"
    }
}
