//
//  TemplatesRepository.swift
//  AIPhotoApp
//
//  Networking for templates listing (/v1/templates)
//

import Foundation

// MARK: - Protocol for testability

protocol TemplatesRepositoryProtocol {
    func listTemplates(
        limit: Int?,
        offset: Int?,
        bearerIDToken: String,
        tokenProvider: (() async throws -> String)?
    ) async throws -> TemplatesListResponse
}

// MARK: - Implementation

final class TemplatesRepository: TemplatesRepositoryProtocol {

    enum NetworkError: LocalizedError {
        case unauthorized
        case serverError(String)
        case invalidResponse
        case decodingFailed

        var errorDescription: String? {
            switch self {
            case .unauthorized: return "Unauthorized"
            case .serverError(let msg): return msg
            case .invalidResponse: return "Invalid server response"
            case .decodingFailed: return "Failed to decode server response"
            }
        }
    }

    private let client: APIClientProtocol

    init(client: APIClientProtocol = APIClient()) {
        self.client = client
    }

    // GET /v1/templates (Bearer required per OpenAPI)
    func listTemplates(limit: Int? = nil,
                       offset: Int? = nil,
                       bearerIDToken: String,
                       tokenProvider: (() async throws -> String)? = nil) async throws -> TemplatesListResponse {
        var req = APIRequest(method: "GET", path: AppConfig.APIPath.templates)
        var items: [URLQueryItem] = []
        if let limit { items.append(URLQueryItem(name: "limit", value: String(limit))) }
        if let offset { items.append(URLQueryItem(name: "offset", value: String(offset))) }
        req.queryItems = items

        do {
            // Backend returns standardized envelope (retry once on 401 if tokenProvider provided)
            if let tokenProvider {
                return try await client.sendEnvelopeRetry401(
                    req,
                    as: TemplatesListResponse.self,
                    authToken: bearerIDToken,
                    decoder: nil,
                    tokenProvider: tokenProvider
                )
            } else {
                return try await client.sendEnvelope(
                    req,
                    as: TemplatesListResponse.self,
                    authToken: bearerIDToken,
                    decoder: nil
                )
            }
        } catch let apiErr as APIClientError {
            switch apiErr {
            case .httpStatus(let code, let body):
                if code == 401 { throw NetworkError.unauthorized }
                if let body, !body.isEmpty {
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
