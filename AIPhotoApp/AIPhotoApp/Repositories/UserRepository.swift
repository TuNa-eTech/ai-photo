//  UserRepository.swift
//  AIPhotoApp
//
//  Networking for authenticated user APIs (e.g., /v1/users/register)

import Foundation

final class UserRepository {

    enum NetworkError: LocalizedError {
        case invalidURL
        case invalidResponse
        case serverError(String)
        case unauthorized
        case decodingFailed

        var errorDescription: String? {
            switch self {
            case .invalidURL: return "Invalid URL"
            case .invalidResponse: return "Invalid server response"
            case .serverError(let msg): return msg
            case .unauthorized: return "Unauthorized"
            case .decodingFailed: return "Failed to decode server response"
            }
        }
    }

    private let client: APIClientProtocol

    init(client: APIClientProtocol = APIClient()) {
        self.client = client
    }

    // POST /v1/users/register with Bearer Firebase ID token
    func registerUser(name: String, email: String, avatarURL: URL?, bearerIDToken: String, tokenProvider: (() async throws -> String)? = nil) async throws -> UserRegisterResponse {
        do {
            let payload = UserRegisterRequest(name: name, email: email, avatarURL: avatarURL?.absoluteString)
            let req = try APIRequest.json(method: "POST", path: AppConfig.APIPath.registerUser, body: payload)
            // Backend returns standardized envelope; use protocol methods with optional 401 retry
            if let tokenProvider = tokenProvider {
                return try await client.sendEnvelopeRetry401(
                    req,
                    as: UserRegisterResponse.self,
                    authToken: bearerIDToken,
                    decoder: nil,
                    tokenProvider: tokenProvider
                )
            } else {
                return try await client.sendEnvelope(
                    req,
                    as: UserRegisterResponse.self,
                    authToken: bearerIDToken,
                    decoder: nil
                )
            }
        } catch let apiErr as APIClientError {
            switch apiErr {
            case .httpStatus(let code, let body):
                if code == 401 {
                    throw NetworkError.unauthorized
                }
                if let body = body, !body.isEmpty {
                    throw NetworkError.serverError(body)
                }
                throw NetworkError.invalidResponse
            case .decodingFailed:
                throw NetworkError.decodingFailed
            default:
                throw NetworkError.invalidResponse
            }
        } catch {
            throw NetworkError.invalidResponse
        }
    }
}
