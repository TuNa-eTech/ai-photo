//  APIClient.swift
//  AIPhotoApp
//
//  A reusable API client with detailed request/response logging.
//  Prints API URL, HTTP method, headers, body, status code, and response body for easy debugging.
//
//  Usage example:
//  let client = APIClient()
//  let payload = UserRegisterRequest(name: "John", email: "john@example.com", avatar_url: nil)
//  let request = try APIRequest.json(method: "POST", path: AppConfig.APIPath.registerUser, body: payload)
//  // If you have an ID token from Firebase, pass it as authToken to add Bearer header
//  let response: UserRegisterResponse = try await client.send(request, as: UserRegisterResponse.self, authToken: authSession.idToken)
//
//  Notes:
//  - Logging is enabled in DEBUG builds by default. You can toggle via APIClient.logger.enabled.
//  - Sensitive headers (Authorization, cookies, API keys) are redacted in logs.
//  - JSON keys are encoded/decoded using snake_case conversion by default.

import Foundation

// MARK: - Network Logger

struct NetworkLogger {
    var enabled: Bool = {
        #if DEBUG
        true
        #else
        false
        #endif
    }()
    var redactHeaders: Set<String> = ["authorization", "api-key", "x-api-key", "cookie", "set-cookie"]
    var maxBodyLength: Int = 100_000 // truncate very large bodies to avoid Xcode lag
    
    func logRequest(_ request: URLRequest) {
        guard enabled else { return }
        let method = request.httpMethod ?? "UNKNOWN"
        let urlStr = request.url?.absoluteString ?? "nil"
        
        print("➡️ API Request: \(method) \(urlStr)")
        if let headers = request.allHTTPHeaderFields, !headers.isEmpty {
            print("   Headers:")
            for (k, v) in headers {
                let keyLower = k.lowercased()
                let value = redactHeaders.contains(keyLower) ? "REDACTED" : v
                print("   • \(k): \(value)")
            }
        }
        if let body = request.httpBody, !body.isEmpty {
            if let pretty = body.prettyJSONString(maxLength: maxBodyLength) {
                print("   Body (JSON):\n\(pretty)")
            } else if let text = String(data: body, encoding: .utf8) {
                let truncated = text.truncated(max: maxBodyLength)
                print("   Body (text):\n\(truncated)")
            } else {
                print("   Body: <\(body.count) bytes>")
            }
        }
    }
    
    func logResponse(for request: URLRequest, response: HTTPURLResponse, data: Data?, durationMS: Double) {
        guard enabled else { return }
        let method = request.httpMethod ?? "UNKNOWN"
        let urlStr = request.url?.absoluteString ?? "nil"
        print("⬅️ API Response: \(response.statusCode) \(method) \(urlStr) (\(String(format: "%.1f", durationMS)) ms)")
        
        // Headers (response)
        let headers = response.allHeaderFields
        if !headers.isEmpty {
            print("   Response Headers:")
            for (kAny, vAny) in headers {
                let key = String(describing: kAny)
                let value = String(describing: vAny)
                let keyLower = key.lowercased()
                let val = redactHeaders.contains(keyLower) ? "REDACTED" : value
                print("   • \(key): \(val)")
            }
        }
        
        // Body
        if let data, !data.isEmpty {
            if let pretty = data.prettyJSONString(maxLength: maxBodyLength) {
                print("   Response (JSON):\n\(pretty)")
            } else if let text = String(data: data, encoding: .utf8) {
                let truncated = text.truncated(max: maxBodyLength)
                print("   Response (text):\n\(truncated)")
            } else {
                print("   Response: <\(data.count) bytes>")
            }
        }
    }
}

// MARK: - API Request

struct APIRequest {
    let method: String
    let path: String
    var queryItems: [URLQueryItem] = []
    var headers: [String: String] = [:]
    var body: Data? = nil
    
    static func json<T: Encodable>(method: String = "POST",
                                   path: String,
                                   body: T,
                                   headers: [String: String] = [:],
                                   encoder: JSONEncoder? = nil) throws -> APIRequest {
        let enc = encoder ?? {
            let e = JSONEncoder()
            e.keyEncodingStrategy = .convertToSnakeCase
            return e
        }()
        let data = try enc.encode(body)
        var mergedHeaders = headers
        if mergedHeaders["Content-Type"] == nil {
            mergedHeaders["Content-Type"] = "application/json"
        }
        return APIRequest(method: method, path: path, headers: mergedHeaders, body: data)
    }
}

 // Envelope types for standardized responses
struct Envelope<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let error: APIErrorEnvelope?
    let meta: MetaEnvelope?
}

struct APIErrorEnvelope: Decodable {
    let code: String
    let message: String
    // details optional and ignored for flexibility
}

struct MetaEnvelope: Decodable {
    let requestId: String?
    let timestamp: String?
    // pagination omitted for brevity
}

 // MARK: - API Client

@preconcurrency
protocol APIClientProtocol {
    func send<T: Decodable>(_ request: APIRequest,
                            as type: T.Type,
                            authToken: String?,
                            decoder: JSONDecoder?) async throws -> T

    // Standardized envelope decode
    func sendEnvelope<T: Decodable>(_ request: APIRequest,
                                    as type: T.Type,
                                    authToken: String?,
                                    decoder: JSONDecoder?) async throws -> T

    // Standardized envelope decode with single 401 retry using a token provider
    func sendEnvelopeRetry401<T: Decodable>(_ request: APIRequest,
                                            as type: T.Type,
                                            authToken: String?,
                                            decoder: JSONDecoder?,
                                            tokenProvider: (() async throws -> String)?) async throws -> T
    
    func sendVoid(_ request: APIRequest,
                  authToken: String?) async throws
}

final class APIClient: APIClientProtocol {
    let baseURL: URL
    let session: URLSession
    var defaultHeaders: [String: String]
    var logger: NetworkLogger
    
    init(baseURL: URL = AppConfig.backendBaseURL,
         session: URLSession = .shared,
         defaultHeaders: [String: String] = ["Accept": "application/json"],
         logger: NetworkLogger = NetworkLogger()) {
        self.baseURL = baseURL
        self.session = session
        self.defaultHeaders = defaultHeaders
        self.logger = logger
    }
    
    // Generic send that decodes JSON to T
    func send<T: Decodable>(_ request: APIRequest,
                            as type: T.Type = T.self,
                            authToken: String? = nil,
                            decoder: JSONDecoder? = nil) async throws -> T {
        let urlRequest = try buildURLRequest(from: request, authToken: authToken)
        logger.logRequest(urlRequest)
        
        let start = CFAbsoluteTimeGetCurrent()
        do {
            let (data, response) = try await session.data(for: urlRequest)
            let duration = (CFAbsoluteTimeGetCurrent() - start) * 1000.0
            guard let http = response as? HTTPURLResponse else {
                throw APIClientError.invalidResponse
            }
            logger.logResponse(for: urlRequest, response: http, data: data, durationMS: duration)
            
            guard 200..<300 ~= http.statusCode else {
                let bodyStr = data.asUTF8String(maxLength: 10_000)
                throw APIClientError.httpStatus(http.statusCode, body: bodyStr)
            }
            
            let dec = decoder ?? {
                let d = JSONDecoder()
                d.keyDecodingStrategy = .convertFromSnakeCase
                return d
            }()
            do {
                return try dec.decode(T.self, from: data)
            } catch {
                throw APIClientError.decodingFailed(error)
            }
        } catch let err as APIClientError {
            throw err
        } catch {
            // Transport-level error
            throw APIClientError.transport(error)
        }
    }
    
        // Decode standardized envelope and return inner data when success=true.
    func sendEnvelope<T: Decodable>(_ request: APIRequest,
                                    as type: T.Type = T.self,
                                    authToken: String? = nil,
                                    decoder: JSONDecoder? = nil) async throws -> T {
        let urlRequest = try buildURLRequest(from: request, authToken: authToken)
        logger.logRequest(urlRequest)

        let start = CFAbsoluteTimeGetCurrent()
        do {
            let (data, response) = try await session.data(for: urlRequest)
            let duration = (CFAbsoluteTimeGetCurrent() - start) * 1000.0
            guard let http = response as? HTTPURLResponse else {
                throw APIClientError.invalidResponse
            }
            logger.logResponse(for: urlRequest, response: http, data: data, durationMS: duration)

            let dec = decoder ?? {
                let d = JSONDecoder()
                d.keyDecodingStrategy = .convertFromSnakeCase
                return d
            }()

            if (200..<300).contains(http.statusCode) {
                let env = try dec.decode(Envelope<T>.self, from: data)
                if env.success, let payload = env.data {
                    return payload
                }
                throw APIClientError.decodingFailed(APIClientError.invalidResponse)
            } else {
                if let envErr = try? dec.decode(Envelope<[String: String]>.self, from: data),
                   let e = envErr.error {
                    throw APIClientError.httpStatus(http.statusCode, body: "\(e.code): \(e.message)")
                }
                let bodyStr = data.asUTF8String(maxLength: 10_000)
                throw APIClientError.httpStatus(http.statusCode, body: bodyStr)
            }
        } catch let err as APIClientError {
            throw err
        } catch {
            throw APIClientError.transport(error)
        }
    }

    // Retry helper: decode envelope and retry once on 401 using tokenProvider
    func sendEnvelopeRetry401<T: Decodable>(_ request: APIRequest,
                                            as type: T.Type = T.self,
                                            authToken: String? = nil,
                                            decoder: JSONDecoder? = nil,
                                            tokenProvider: (() async throws -> String)? = nil) async throws -> T {
        do {
            return try await sendEnvelope(request, as: type, authToken: authToken, decoder: decoder)
        } catch let APIClientError.httpStatus(code, _) where code == 401 {
            guard let provider = tokenProvider else { throw APIClientError.httpStatus(code, body: nil) }
            let refreshed = try await provider()
            return try await sendEnvelope(request, as: type, authToken: refreshed, decoder: decoder)
        }
    }

    // Send when caller only needs status (no body)
    func sendVoid(_ request: APIRequest, authToken: String? = nil) async throws {
        let urlRequest = try buildURLRequest(from: request, authToken: authToken)
        logger.logRequest(urlRequest)
        
        let start = CFAbsoluteTimeGetCurrent()
        do {
            let (data, response) = try await session.data(for: urlRequest)
            let duration = (CFAbsoluteTimeGetCurrent() - start) * 1000.0
            guard let http = response as? HTTPURLResponse else {
                throw APIClientError.invalidResponse
            }
            logger.logResponse(for: urlRequest, response: http, data: data, durationMS: duration)
            
            guard 200..<300 ~= http.statusCode else {
                let bodyStr = data.asUTF8String(maxLength: 10_000)
                throw APIClientError.httpStatus(http.statusCode, body: bodyStr)
            }
        } catch let err as APIClientError {
            throw err
        } catch {
            throw APIClientError.transport(error)
        }
    }
    
    // MARK: - Helpers
    
    private func buildURLRequest(from req: APIRequest, authToken: String?) throws -> URLRequest {
        guard var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false) else {
            throw APIClientError.invalidURL
        }
        // Join paths safely (base may have path prefix)
        let incoming = req.path.hasPrefix("/") ? req.path : "/" + req.path
        components.path = (components.path.hasSuffix("/") ? String(components.path.dropLast()) : components.path) + incoming
        if !req.queryItems.isEmpty {
            components.queryItems = req.queryItems
        }
        guard let url = components.url else {
            throw APIClientError.invalidURL
        }
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = req.method
        urlRequest.httpBody = req.body
        
        // Merge headers (default -> request)
        var finalHeaders = defaultHeaders
        req.headers.forEach { finalHeaders[$0.key] = $0.value }
        if let token = authToken, finalHeaders["Authorization"] == nil {
            finalHeaders["Authorization"] = "Bearer \(token)"
        }
        for (k, v) in finalHeaders {
            urlRequest.setValue(v, forHTTPHeaderField: k)
        }
        return urlRequest
    }
}

// MARK: - Errors

enum APIClientError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpStatus(Int, body: String?)
    case decodingFailed(Error)
    case transport(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response"
        case .httpStatus(let code, let body):
            if let body, !body.isEmpty {
                return "HTTP \(code): \(body)"
            }
            return "HTTP \(code)"
        case .decodingFailed(let error):
            return "Decoding failed: \(error.localizedDescription)"
        case .transport(let error):
            return "Transport error: \(error.localizedDescription)"
        }
    }
}

// MARK: - Utilities

private extension Data {
    func prettyJSONString(maxLength: Int) -> String? {
        guard !self.isEmpty else { return nil }
        do {
            let obj = try JSONSerialization.jsonObject(with: self, options: [])
            let prettyData = try JSONSerialization.data(withJSONObject: obj, options: [.prettyPrinted, .sortedKeys])
            let str = String(decoding: prettyData, as: UTF8.self)
            return str.truncated(max: maxLength)
        } catch {
            return nil
        }
    }
    
    func asUTF8String(maxLength: Int) -> String {
        let str = String(decoding: self, as: UTF8.self)
        return str.truncated(max: maxLength)
    }
}

private extension String {
    func truncated(max: Int) -> String {
        if self.count <= max { return self }
        let idx = self.index(self.startIndex, offsetBy: max)
        return String(self[..<idx]) + "… [truncated]"
    }
}
