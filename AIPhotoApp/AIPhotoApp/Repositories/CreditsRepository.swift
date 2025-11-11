//
//  CreditsRepository.swift
//  AIPhotoApp
//
//  Repository for credits and IAP operations
//

import Foundation

// MARK: - Models

struct CreditsBalanceResponse: Codable {
    let credits: Int
}

struct PurchaseRequest: Codable {
    let transaction_data: String
    let product_id: String
}

struct PurchaseResponse: Codable {
    let transaction_id: String
    let credits_added: Int
    let new_balance: Int
}

struct RewardCreditRequest: Codable {
    let source: String?
    
    init(source: String? = "rewarded_ad") {
        self.source = source
    }
}

struct RewardCreditResponse: Codable {
    let credits_added: Int
    let new_balance: Int
}

struct Transaction: Codable {
    let id: String
    let type: String
    let amount: Int
    let product_id: String?
    let status: String
    let created_at: String
}

struct TransactionHistoryResponse: Codable {
    let transactions: [Transaction]
    let meta: TransactionMeta
}

struct TransactionMeta: Codable {
    let total: Int
    let limit: Int
    let offset: Int
}

// MARK: - Protocol

protocol CreditsRepositoryProtocol {
    func getCreditsBalance(bearerIDToken: String, tokenProvider: (() async throws -> String)?) async throws -> Int
    func getTransactionHistory(limit: Int, offset: Int, bearerIDToken: String, tokenProvider: (() async throws -> String)?) async throws -> TransactionHistoryResponse
    func purchaseCredits(transactionData: String, productId: String, bearerIDToken: String, tokenProvider: (() async throws -> String)?) async throws -> PurchaseResponse
    func addRewardCredit(bearerIDToken: String, tokenProvider: (() async throws -> String)?) async throws -> RewardCreditResponse
}

// MARK: - Implementation

final class CreditsRepository: CreditsRepositoryProtocol {
    private let client: APIClientProtocol
    
    enum NetworkError: LocalizedError {
        case invalidURL
        case invalidResponse
        case serverError(String)
        case unauthorized
        case decodingFailed
        case cancelled // Request was cancelled (e.g., view dismissed)
        
        var errorDescription: String? {
            switch self {
            case .invalidURL: return "Invalid URL"
            case .invalidResponse: return "Invalid server response"
            case .serverError(let msg): return msg
            case .unauthorized: return "Unauthorized"
            case .decodingFailed: return "Failed to decode server response"
            case .cancelled: return "Request was cancelled"
            }
        }
    }
    
    init(client: APIClientProtocol = APIClient()) {
        self.client = client
    }
    
    func getCreditsBalance(bearerIDToken: String, tokenProvider: (() async throws -> String)? = nil) async throws -> Int {
        var req = APIRequest(method: "GET", path: AppConfig.APIPath.creditsBalance)
        
        do {
            let response: CreditsBalanceResponse
            if let tokenProvider = tokenProvider {
                response = try await client.sendEnvelopeRetry401(
                    req,
                    as: CreditsBalanceResponse.self,
                    authToken: bearerIDToken,
                    decoder: nil,
                    tokenProvider: tokenProvider
                )
            } else {
                response = try await client.sendEnvelope(
                    req,
                    as: CreditsBalanceResponse.self,
                    authToken: bearerIDToken,
                    decoder: nil
                )
            }
            
            return response.credits
        } catch let apiErr as APIClientError {
            switch apiErr {
            case .httpStatus(let code, let body):
                if code == 401 { throw NetworkError.unauthorized }
                if let body = body, !body.isEmpty {
                    throw NetworkError.serverError(body)
                }
                throw NetworkError.invalidResponse
            case .decodingFailed(let underlyingError):
                // Log the underlying decoding error for debugging
                if let decodingError = underlyingError as? DecodingError {
                    print("❌ Decoding failed for credits balance:")
                    switch decodingError {
                    case .dataCorrupted(let context):
                        print("   Data corrupted: \(context.debugDescription)")
                    case .keyNotFound(let key, let context):
                        print("   Key not found: \(key.stringValue) in \(context.debugDescription)")
                    case .typeMismatch(let type, let context):
                        print("   Type mismatch: expected \(type) in \(context.debugDescription)")
                    case .valueNotFound(let type, let context):
                        print("   Value not found: expected \(type) in \(context.debugDescription)")
                    @unknown default:
                        print("   Unknown decoding error: \(decodingError)")
                    }
                } else {
                    print("❌ Decoding failed for credits balance: \(underlyingError)")
                }
                throw NetworkError.decodingFailed
            case .transport(let error):
                // Check if error is a cancelled request (URLError.cancelled)
                if let urlError = error as? URLError, urlError.code == .cancelled {
                    // Request was cancelled (e.g., view dismissed) - this is expected behavior
                    // Don't log as error, just throw cancelled error
                    throw NetworkError.cancelled
                }
                // Other transport errors are unexpected
                print("❌ Transport error getting credits balance: \(error)")
                throw NetworkError.invalidResponse
            default:
                print("❌ Unknown API error: \(apiErr)")
                throw NetworkError.invalidResponse
            }
        } catch {
            // Check if error is a cancelled request
            if let urlError = error as? URLError, urlError.code == .cancelled {
                throw NetworkError.cancelled
            }
            
            // Check if it's already a NetworkError (e.g., cancelled from transport error)
            if let networkError = error as? NetworkError {
                throw networkError
            }
            
            print("❌ Unexpected error getting credits balance: \(error)")
            if let decodingError = error as? DecodingError {
                switch decodingError {
                case .keyNotFound(let key, let context):
                    print("   Missing key: \(key.stringValue) at \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
                case .typeMismatch(let type, let context):
                    print("   Type mismatch: expected \(type) at \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
                default:
                    print("   \(decodingError)")
                }
            }
            throw NetworkError.invalidResponse
        }
    }
    
    func getTransactionHistory(limit: Int = 20, offset: Int = 0, bearerIDToken: String, tokenProvider: (() async throws -> String)? = nil) async throws -> TransactionHistoryResponse {
        var req = APIRequest(method: "GET", path: AppConfig.APIPath.creditsTransactions)
        req.queryItems = [
            URLQueryItem(name: "limit", value: "\(limit)"),
            URLQueryItem(name: "offset", value: "\(offset)")
        ]
        
        // Custom decoder for snake_case properties (no auto conversion)
        let customDecoder: JSONDecoder = {
            let decoder = JSONDecoder()
            // Don't set keyDecodingStrategy - defaults to exact key matching (no conversion)
            decoder.dateDecodingStrategy = .iso8601
            return decoder
        }()
        
        do {
            let response: TransactionHistoryResponse
            if let tokenProvider = tokenProvider {
                response = try await client.sendEnvelopeRetry401(
                    req,
                    as: TransactionHistoryResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder,
                    tokenProvider: tokenProvider
                )
            } else {
                response = try await client.sendEnvelope(
                    req,
                    as: TransactionHistoryResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder
                )
            }
            
            return response
        } catch let apiErr as APIClientError {
            switch apiErr {
            case .httpStatus(let code, let body):
                if code == 401 { throw NetworkError.unauthorized }
                if let body = body, !body.isEmpty {
                    throw NetworkError.serverError(body)
                }
                throw NetworkError.invalidResponse
            case .decodingFailed:
                throw NetworkError.decodingFailed
            case .transport(let error):
                // Check if error is a cancelled request
                if let urlError = error as? URLError, urlError.code == .cancelled {
                    throw NetworkError.cancelled
                }
                throw NetworkError.invalidResponse
            default:
                throw NetworkError.invalidResponse
            }
        } catch {
            // Check if error is a cancelled request
            if let urlError = error as? URLError, urlError.code == .cancelled {
                throw NetworkError.cancelled
            }
            if let networkError = error as? NetworkError {
                throw networkError
            }
            throw NetworkError.invalidResponse
        }
    }
    
    func purchaseCredits(transactionData: String, productId: String, bearerIDToken: String, tokenProvider: (() async throws -> String)? = nil) async throws -> PurchaseResponse {
        let payload = PurchaseRequest(
            transaction_data: transactionData,
            product_id: productId
        )
        
        let req = try APIRequest.json(method: "POST", path: AppConfig.APIPath.creditsPurchase, body: payload)
        
        // Custom decoder that respects snake_case properties (no auto conversion)
        let customDecoder: JSONDecoder = {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .useDefaultKeys // Don't convert snake_case to camelCase
            decoder.dateDecodingStrategy = .iso8601
            return decoder
        }()
        
        do {
            let response: PurchaseResponse
            if let tokenProvider = tokenProvider {
                response = try await client.sendEnvelopeRetry401(
                    req,
                    as: PurchaseResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder,
                    tokenProvider: tokenProvider
                )
            } else {
                response = try await client.sendEnvelope(
                    req,
                    as: PurchaseResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder
                )
            }
            
            return response
        } catch let apiErr as APIClientError {
            switch apiErr {
            case .httpStatus(let code, let body):
                if code == 401 { throw NetworkError.unauthorized }
                if let body = body, !body.isEmpty {
                    throw NetworkError.serverError(body)
                }
                throw NetworkError.invalidResponse
            case .decodingFailed:
                throw NetworkError.decodingFailed
            case .transport(let error):
                // Check if error is a cancelled request
                if let urlError = error as? URLError, urlError.code == .cancelled {
                    throw NetworkError.cancelled
                }
                throw NetworkError.invalidResponse
            default:
                throw NetworkError.invalidResponse
            }
        } catch {
            // Check if error is a cancelled request
            if let urlError = error as? URLError, urlError.code == .cancelled {
                throw NetworkError.cancelled
            }
            if let networkError = error as? NetworkError {
                throw networkError
            }
            throw NetworkError.invalidResponse
        }
    }
    
    func addRewardCredit(bearerIDToken: String, tokenProvider: (() async throws -> String)? = nil) async throws -> RewardCreditResponse {
        let payload = RewardCreditRequest(source: "rewarded_ad")
        
        let req = try APIRequest.json(method: "POST", path: AppConfig.APIPath.creditsReward, body: payload)
        
        // Custom decoder that respects snake_case properties (no auto conversion)
        let customDecoder: JSONDecoder = {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .useDefaultKeys // Don't convert snake_case to camelCase
            decoder.dateDecodingStrategy = .iso8601
            return decoder
        }()
        
        do {
            let response: RewardCreditResponse
            if let tokenProvider = tokenProvider {
                response = try await client.sendEnvelopeRetry401(
                    req,
                    as: RewardCreditResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder,
                    tokenProvider: tokenProvider
                )
            } else {
                response = try await client.sendEnvelope(
                    req,
                    as: RewardCreditResponse.self,
                    authToken: bearerIDToken,
                    decoder: customDecoder
                )
            }
            
            return response
        } catch let apiErr as APIClientError {
            switch apiErr {
            case .httpStatus(let code, let body):
                if code == 401 { throw NetworkError.unauthorized }
                if let body = body, !body.isEmpty {
                    throw NetworkError.serverError(body)
                }
                throw NetworkError.invalidResponse
            case .decodingFailed:
                throw NetworkError.decodingFailed
            case .transport(let error):
                // Check if error is a cancelled request
                if let urlError = error as? URLError, urlError.code == .cancelled {
                    throw NetworkError.cancelled
                }
                throw NetworkError.invalidResponse
            default:
                throw NetworkError.invalidResponse
            }
        } catch {
            // Check if error is a cancelled request
            if let urlError = error as? URLError, urlError.code == .cancelled {
                throw NetworkError.cancelled
            }
            if let networkError = error as? NetworkError {
                throw networkError
            }
            throw NetworkError.invalidResponse
        }
    }
}

