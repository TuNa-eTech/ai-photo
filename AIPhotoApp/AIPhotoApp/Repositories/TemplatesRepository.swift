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
        query: String?,
        category: String?,
        sort: String?,
        bearerIDToken: String,
        tokenProvider: (() async throws -> String)?
    ) async throws -> TemplatesListResponse
    
    func listTrendingTemplates(
        limit: Int?,
        offset: Int?,
        bearerIDToken: String,
        tokenProvider: (() async throws -> String)?
    ) async throws -> TemplatesListResponse
    
    func listCategories(
        bearerIDToken: String,
        tokenProvider: (() async throws -> String)?
    ) async throws -> CategoriesListResponse
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
    
    // Custom decoder that respects explicit CodingKeys
    // IMPORTANT: Do NOT use .convertFromSnakeCase because it converts
    // "thumbnail_url" → "thumbnailUrl" (lowercase u), but our property is "thumbnailURL"
    private var customDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        // We have explicit CodingKeys, so no need for auto snake_case conversion
        return decoder
    }

    init(client: APIClientProtocol = APIClient()) {
        self.client = client
    }

    // GET /v1/templates (Bearer required per OpenAPI)
    func listTemplates(limit: Int? = nil,
                       offset: Int? = nil,
                       query: String? = nil,
                       category: String? = nil,
                       sort: String? = nil,
                       bearerIDToken: String,
                       tokenProvider: (() async throws -> String)? = nil) async throws -> TemplatesListResponse {
        var req = APIRequest(method: "GET", path: AppConfig.APIPath.templates)
        var items: [URLQueryItem] = []
        if let limit { items.append(URLQueryItem(name: "limit", value: String(limit))) }
        if let offset { items.append(URLQueryItem(name: "offset", value: String(offset))) }
        if let query, !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            items.append(URLQueryItem(name: "q", value: query.trimmingCharacters(in: .whitespacesAndNewlines)))
        }
        if let category, !category.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            items.append(URLQueryItem(name: "category", value: category.trimmingCharacters(in: .whitespacesAndNewlines)))
        }
        if let sort, !sort.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            items.append(URLQueryItem(name: "sort", value: sort.trimmingCharacters(in: .whitespacesAndNewlines)))
        }
        req.queryItems = items

        do {
            // Backend returns standardized envelope (retry once on 401 if tokenProvider provided)
            if let tokenProvider {
                return try await client.sendEnvelopeRetry401(
                    req,
                    as: TemplatesListResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder,
                    tokenProvider: tokenProvider
                )
            } else {
                return try await client.sendEnvelope(
                    req,
                    as: TemplatesListResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder
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
    
    // GET /v1/templates/trending (Bearer required)
    func listTrendingTemplates(limit: Int? = nil,
                                offset: Int? = nil,
                                bearerIDToken: String,
                                tokenProvider: (() async throws -> String)? = nil) async throws -> TemplatesListResponse {
        var req = APIRequest(method: "GET", path: AppConfig.APIPath.trendingTemplates)
        var items: [URLQueryItem] = []
        if let limit { items.append(URLQueryItem(name: "limit", value: String(limit))) }
        if let offset { items.append(URLQueryItem(name: "offset", value: String(offset))) }
        req.queryItems = items

        do {
            // Backend returns standardized envelope (retry once on 401 if tokenProvider provided)
            let result: TemplatesListResponse
            if let tokenProvider {
                result = try await client.sendEnvelopeRetry401(
                    req,
                    as: TemplatesListResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder,
                    tokenProvider: tokenProvider
                )
            } else {
                result = try await client.sendEnvelope(
                    req,
                    as: TemplatesListResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder
                )
            }
            
            #if DEBUG
            print("✅ Decoded \(result.templates.count) templates successfully")
            if let first = result.templates.first {
                print("   Sample: \(first.name)")
                print("   URL: \(first.thumbnailURL?.absoluteString ?? "nil")")
            }
            #endif
            
            return result
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
    
    // GET /v1/templates/categories (Bearer required)
    func listCategories(
        bearerIDToken: String,
        tokenProvider: (() async throws -> String)? = nil
    ) async throws -> CategoriesListResponse {
        let req = APIRequest(method: "GET", path: AppConfig.APIPath.categories)
        
        do {
            if let tokenProvider {
                return try await client.sendEnvelopeRetry401(
                    req,
                    as: CategoriesListResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder,
                    tokenProvider: tokenProvider
                )
            } else {
                return try await client.sendEnvelope(
                    req,
                    as: CategoriesListResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder
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
