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
            // Log token info before sending
            let tokenLength = bearerIDToken.count
            let tokenPrefix = bearerIDToken.prefix(15)
            let tokenSuffix = bearerIDToken.suffix(10)
            print("🔐 [UserRepository] Sending request with token:")
            print("   • Length: \(tokenLength) chars")
            print("   • Prefix: \(tokenPrefix)...")
            print("   • Suffix: ...\(tokenSuffix)")
            
            let payload = UserRegisterRequest(name: name, email: email, avatarURL: avatarURL?.absoluteString)
            let req = try APIRequest.json(method: "POST", path: AppConfig.APIPath.registerUser, body: payload)
            // Backend returns standardized envelope; use protocol methods with optional 401 retry
            let response: UserRegisterResponse
            if let tokenProvider = tokenProvider {
                response = try await client.sendEnvelopeRetry401(
                    req,
                    as: UserRegisterResponse.self,
                    authToken: bearerIDToken,
                    decoder: nil,
                    tokenProvider: tokenProvider
                )
            } else {
                response = try await client.sendEnvelope(
                    req,
                    as: UserRegisterResponse.self,
                    authToken: bearerIDToken,
                    decoder: nil
                )
            }
            
            print("✅ [UserRepository] Registration successful:")
            print("   • User ID: \(response.id)")
            print("   • Name: \(response.name)")
            print("   • Email: \(response.email)")
            
            return response
        } catch let apiErr as APIClientError {
            print("❌ [UserRepository] API Error: \(apiErr)")
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
                print("❌ [UserRepository] JSON Decoding failed - Response doesn't match UserRegisterResponse structure")
                throw NetworkError.decodingFailed
            default:
                throw NetworkError.invalidResponse
            }
        } catch {
            print("❌ [UserRepository] Unknown error: \(error)")
            throw NetworkError.invalidResponse
        }
    }

    // GET /v1/users/me with Bearer Firebase ID token
    func getUserProfile(bearerIDToken: String, tokenProvider: (() async throws -> String)? = nil) async throws -> UserRegisterResponse {
        do {
            print("🔐 [UserRepository] Fetching user profile with token")
            
            let req = APIRequest(method: "GET", path: AppConfig.APIPath.getUserProfile)
            // Backend returns standardized envelope; use protocol methods with optional 401 retry
            let response: UserRegisterResponse
            if let tokenProvider = tokenProvider {
                response = try await client.sendEnvelopeRetry401(
                    req,
                    as: UserRegisterResponse.self,
                    authToken: bearerIDToken,
                    decoder: nil,
                    tokenProvider: tokenProvider
                )
            } else {
                response = try await client.sendEnvelope(
                    req,
                    as: UserRegisterResponse.self,
                    authToken: bearerIDToken,
                    decoder: nil
                )
            }
            
            print("✅ [UserRepository] Profile fetch successful:")
            print("   • User ID: \(response.id)")
            print("   • Name: \(response.name)")
            print("   • Email: \(response.email)")
            print("   • Created At: \(response.createdAt)")
            
            return response
        } catch let apiErr as APIClientError {
            print("❌ [UserRepository] API Error: \(apiErr)")
            switch apiErr {
            case .httpStatus(let code, let body):
                if code == 401 {
                    throw NetworkError.unauthorized
                }
                if code == 404 {
                    throw NetworkError.serverError("User not found")
                }
                if let body = body, !body.isEmpty {
                    throw NetworkError.serverError(body)
                }
                throw NetworkError.invalidResponse
            case .decodingFailed:
                print("❌ [UserRepository] JSON Decoding failed - Response doesn't match UserRegisterResponse structure")
                throw NetworkError.decodingFailed
            default:
                throw NetworkError.invalidResponse
            }
        } catch {
            print("❌ [UserRepository] Unknown error: \(error)")
            throw NetworkError.invalidResponse
        }
    }
}
