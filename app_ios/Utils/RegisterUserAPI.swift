//
//  RegisterUserAPI.swift
//  imageaiwrapper
//
//  Created by Cline on 10/17/2025.
//

import Foundation

struct RegisterUserRequest: Codable {
    let name: String
    let email: String
    let avatar_url: String?
}

struct RegisterUserResponse: Codable {
    let user_id: String
    let message: String
}

enum RegisterUserAPIError: Error {
    case invalidURL
    case invalidResponse
    case serverError(String)
    case networkError(Error)
}

class RegisterUserAPI {
    static let shared = RegisterUserAPI()
    private init() {}

    /// Calls the backend /v1/users/register endpoint with idToken and user profile info.
    func registerUser(
        idToken: String,
        name: String,
        email: String,
        avatarURL: String?,
        completion: @escaping (Result<RegisterUserResponse, RegisterUserAPIError>) -> Void
    ) {
        guard let url = URL(string: "https://<your-backend-api-url>/v1/users/register") else {
            completion(.failure(.invalidURL))
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(idToken)", forHTTPHeaderField: "Authorization")

        let body = RegisterUserRequest(name: name, email: email, avatar_url: avatarURL)
        do {
            request.httpBody = try JSONEncoder().encode(body)
        } catch {
            completion(.failure(.invalidResponse))
            return
        }

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            guard let httpResponse = response as? HTTPURLResponse,
                  let data = data else {
                completion(.failure(.invalidResponse))
                return
            }
            if httpResponse.statusCode == 200 {
                do {
                    let resp = try JSONDecoder().decode(RegisterUserResponse.self, from: data)
                    completion(.success(resp))
                } catch {
                    completion(.failure(.invalidResponse))
                }
            } else {
                let errorMsg = (try? JSONDecoder().decode([String: String].self, from: data)?["error"]) ?? "Unknown error"
                completion(.failure(.serverError(errorMsg)))
            }
        }
        task.resume()
    }
}
