//
//  ProcessImageDTOs.swift
//  AIPhotoApp
//
//  Image Processing DTOs
//

import Foundation

// MARK: - Request DTO
struct ProcessImageRequest: Codable {
    let templateId: String
    let imageBase64: String
    let options: ProcessingOptions?
    
    enum CodingKeys: String, CodingKey {
        case templateId = "template_id"
        case imageBase64 = "image_base64"
        case options
    }
    
    struct ProcessingOptions: Codable {
        let width: Int?
        let height: Int?
        let quality: String?
    }
}

// MARK: - Response DTO
struct ProcessImageResponse: Codable {
    let processedImageBase64: String
    let metadata: ProcessImageMetadata
    
    enum CodingKeys: String, CodingKey {
        case processedImageBase64 = "processed_image_base64"
        case metadata
    }
    
    struct ProcessImageMetadata: Codable {
        let templateId: String
        let templateName: String
        let modelUsed: String
        let generationTimeMs: Int
        let processedDimensions: ProcessedDimensions
        
        enum CodingKeys: String, CodingKey {
            case templateId = "template_id"
            case templateName = "template_name"
            case modelUsed = "model_used"
            case generationTimeMs = "generation_time_ms"
            case processedDimensions = "processed_dimensions"
        }
        
        struct ProcessedDimensions: Codable {
            let width: Int
            let height: Int
        }
    }
}

// MARK: - Envelope Response
struct ProcessImageEnvelopeResponse: Codable {
    let success: Bool
    let data: ProcessImageResponse?
    let error: EnvelopeError?
    let meta: EnvelopeMeta
    
    struct EnvelopeError: Codable {
        let code: String
        let message: String
        let details: [String: String]?
        
        enum CodingKeys: String, CodingKey {
            case code
            case message
            case details
        }
        
        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            code = try container.decode(String.self, forKey: .code)
            
            // Handle message as string or nested object
            if let stringMessage = try? container.decode(String.self, forKey: .message) {
                message = stringMessage
            } else if let dictMessage = try? container.decode([String: String].self, forKey: .message) {
                // If it's a dict, try to extract error message
                message = dictMessage["error"] ?? dictMessage["message"] ?? "Unknown error"
            } else {
                message = "Unknown error"
            }
            
            details = try? container.decodeIfPresent([String: String].self, forKey: .details)
        }
    }
    
    // MARK: - Helper for Any Value
    struct AnyCodable: Codable {
        let value: String
        
        init(_ value: String) {
            self.value = value
        }
        
        init(from decoder: Decoder) throws {
            if let string = try? decoder.singleValueContainer().decode(String.self) {
                value = string
            } else if let number = try? decoder.singleValueContainer().decode(Double.self) {
                value = "\(number)"
            } else {
                value = "Unknown"
            }
        }
        
        func encode(to encoder: Encoder) throws {
            var container = encoder.singleValueContainer()
            try container.encode(value)
        }
    }
    
    struct EnvelopeMeta: Codable {
        let requestId: String
        let timestamp: String
    }
}

