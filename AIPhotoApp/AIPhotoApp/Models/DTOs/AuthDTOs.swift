//  AuthDTOs.swift
//  AIPhotoApp
//
//  Data Transfer Objects for Auth flows and /v1/users/register

import Foundation

struct UserRegisterRequest: Codable, Sendable {
    let name: String
    let email: String
    let avatarURL: String?
}

struct UserRegisterResponse: Codable, Sendable {
    let userId: String
    let message: String
}

struct APIErrorResponse: Codable, Error, Sendable {
    let error: String
    let error_code: String?
}

// Domain model for client-side auth session after Firebase signin
struct AuthSession: Sendable {
    let name: String?
    let email: String?
    let avatarURL: URL?
    let idToken: String
}
