//  AppConfig.swift
//  AIPhotoApp
//
//  Global configuration constants

import Foundation

enum AppConfig {
    // TODO: Set this to your real backend base URL (without trailing slash)
    static let backendBaseURL = URL(string: "http://localhost:8080")!

    // API Paths
    enum APIPath {
        static let registerUser = "/v1/users/register"
        static let templates = "/v1/templates"
    }
}
