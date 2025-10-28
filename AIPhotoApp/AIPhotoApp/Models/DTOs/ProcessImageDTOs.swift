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
    }
    
    struct EnvelopeMeta: Codable {
        let requestId: String
        let timestamp: String
    }
}

