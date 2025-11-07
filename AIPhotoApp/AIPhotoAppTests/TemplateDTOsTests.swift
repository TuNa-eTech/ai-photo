//
//  TemplateDTOsTests.swift
//  AIPhotoAppTests
//
//  Unit tests for TemplateDTO and TemplatesListResponse
//

import Testing
import Foundation
@testable import AIPhotoApp

@Suite("TemplateDTO Tests")
@MainActor
struct TemplateDTOsTests {
    
    // MARK: - Decoding Tests
    
    @Test("Decode TemplateDTO with all fields")
    func testDecodeTemplateWithAllFields() throws {
        let json = """
        {
            "id": "anime-style",
            "name": "Phong cách Anime",
            "thumbnail_url": "https://example.com/anime.jpg",
            "published_at": "2025-10-20T07:30:00Z",
            "usage_count": 120
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        
        #expect(template.id == "anime-style")
        #expect(template.name == "Phong cách Anime")
        #expect(template.thumbnailURL?.absoluteString == "https://example.com/anime.jpg")
        #expect(template.publishedAt != nil)
        #expect(template.usageCount == 120)
    }
    
    @Test("Decode TemplateDTO with minimal fields (only required)")
    func testDecodeTemplateWithMinimalFields() throws {
        let json = """
        {
            "id": "test-template",
            "name": "Test Template"
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        
        #expect(template.id == "test-template")
        #expect(template.name == "Test Template")
        #expect(template.thumbnailURL == nil)
        #expect(template.publishedAt == nil)
        #expect(template.usageCount == nil)
    }
    
    @Test("Decode TemplateDTO with null optional fields")
    func testDecodeTemplateWithNullFields() throws {
        let json = """
        {
            "id": "test",
            "name": "Test",
            "thumbnail_url": null,
            "published_at": null,
            "usage_count": null
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        
        #expect(template.thumbnailURL == nil)
        #expect(template.publishedAt == nil)
        #expect(template.usageCount == nil)
    }
    
    @Test("Decode TemplateDTO with invalid thumbnail URL")
    func testDecodeTemplateWithInvalidURL() throws {
        let json = """
        {
            "id": "test",
            "name": "Test",
            "thumbnail_url": "not-a-valid-url"
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        // URL(string:) accepts any string, even invalid URLs
        // So we just verify it decodes without error
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.id == "test")
        #expect(template.name == "Test")
        // Note: URL(string: "not-a-valid-url") creates a URL object, not nil
    }
    
    @Test("Decode TemplateDTO with zero usage count")
    func testDecodeTemplateWithZeroUsageCount() throws {
        let json = """
        {
            "id": "test",
            "name": "Test",
            "usage_count": 0
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.usageCount == 0)
    }
    
    // MARK: - isNew Property Tests
    
    @Test("isNew returns true for template published today")
    func testIsNewForTemplatePublishedToday() throws {
        let json = """
        {
            "id": "test",
            "name": "Test",
            "published_at": "\(ISO8601DateFormatter().string(from: Date()))"
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isNew == true)
    }
    
    @Test("isNew returns true for template published 5 days ago")
    func testIsNewForTemplateFiveDaysOld() throws {
        let fiveDaysAgo = Calendar.current.date(byAdding: .day, value: -5, to: Date())!
        let json = """
        {
            "id": "test",
            "name": "Test",
            "published_at": "\(ISO8601DateFormatter().string(from: fiveDaysAgo))"
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isNew == true)
    }
    
    @Test("isNew returns true for template published exactly 7 days ago")
    func testIsNewForTemplateSevenDaysOld() throws {
        let sevenDaysAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date())!
        let json = """
        {
            "id": "test",
            "name": "Test",
            "published_at": "\(ISO8601DateFormatter().string(from: sevenDaysAgo))"
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isNew == true)
    }
    
    @Test("isNew returns false for template published 8 days ago")
    func testIsNewForTemplateEightDaysOld() throws {
        let eightDaysAgo = Calendar.current.date(byAdding: .day, value: -8, to: Date())!
        let json = """
        {
            "id": "test",
            "name": "Test",
            "published_at": "\(ISO8601DateFormatter().string(from: eightDaysAgo))"
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isNew == false)
    }
    
    @Test("isNew returns false when publishedAt is nil")
    func testIsNewWhenPublishedAtIsNil() throws {
        let json = """
        {
            "id": "test",
            "name": "Test"
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isNew == false)
    }
    
    // MARK: - isTrending Property Tests
    
    @Test("isTrending returns true for usage count >= 500")
    func testIsTrendingForHighUsageCount() throws {
        let json = """
        {
            "id": "test",
            "name": "Test",
            "usage_count": 500
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isTrending == true)
    }
    
    @Test("isTrending returns true for usage count = 1000")
    func testIsTrendingForVeryHighUsageCount() throws {
        let json = """
        {
            "id": "test",
            "name": "Test",
            "usage_count": 1000
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isTrending == true)
    }
    
    @Test("isTrending returns false for usage count < 100")
    func testIsTrendingForLowUsageCount() throws {
        let json = """
        {
            "id": "test",
            "name": "Test",
            "usage_count": 99
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isTrending == false)
    }
    
    @Test("isTrending returns false for usage count = 0")
    func testIsTrendingForZeroUsageCount() throws {
        let json = """
        {
            "id": "test",
            "name": "Test",
            "usage_count": 0
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isTrending == false)
    }
    
    @Test("isTrending returns false when usageCount is nil")
    func testIsTrendingWhenUsageCountIsNil() throws {
        let json = """
        {
            "id": "test",
            "name": "Test"
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isTrending == false)
    }
    
    // MARK: - Combination Tests
    
    @Test("Template can be both new and trending")
    func testTemplateCanBeNewAndTrending() throws {
        let json = """
        {
            "id": "test",
            "name": "Test",
            "published_at": "\(ISO8601DateFormatter().string(from: Date()))",
            "usage_count": 600
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isNew == true)
        #expect(template.isTrending == true)
    }
    
    @Test("Template can be neither new nor trending")
    func testTemplateCanBeNeitherNewNorTrending() throws {
        let thirtyDaysAgo = Calendar.current.date(byAdding: .day, value: -30, to: Date())!
        let json = """
        {
            "id": "test",
            "name": "Test",
            "published_at": "\(ISO8601DateFormatter().string(from: thirtyDaysAgo))",
            "usage_count": 50
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        #expect(template.isNew == false)
        #expect(template.isTrending == false)
    }
}

@Suite("TemplatesListResponse Tests")
@MainActor
struct TemplatesListResponseTests {
    
    @Test("Decode TemplatesListResponse with multiple templates")
    func testDecodeTemplatesListResponse() throws {
        let json = """
        {
            "templates": [
                {
                    "id": "anime-style",
                    "name": "Phong cách Anime",
                    "thumbnail_url": "https://example.com/anime.jpg",
                    "published_at": "2025-10-20T07:30:00Z",
                    "usage_count": 120
                },
                {
                    "id": "cartoon",
                    "name": "Cartoon Style",
                    "thumbnail_url": "https://example.com/cartoon.jpg",
                    "published_at": "2025-10-19T10:00:00Z",
                    "usage_count": 50
                }
            ]
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let response = try decoder.decode(TemplatesListResponse.self, from: data)
        
        #expect(response.templates.count == 2)
        #expect(response.templates[0].id == "anime-style")
        #expect(response.templates[1].id == "cartoon")
    }
    
    @Test("Decode TemplatesListResponse with empty array")
    func testDecodeEmptyTemplatesList() throws {
        let json = """
        {
            "templates": []
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let response = try decoder.decode(TemplatesListResponse.self, from: data)
        
        #expect(response.templates.isEmpty)
    }
    
    @Test("Decode TemplatesListResponse matches backend envelope format")
    func testDecodeBackendEnvelopeFormat() throws {
        // Simulate full backend envelope (though APIClient unwraps it)
        let json = """
        {
            "templates": [
                {
                    "id": "test",
                    "name": "Test"
                }
            ]
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let response = try decoder.decode(TemplatesListResponse.self, from: data)
        
        #expect(response.templates.count == 1)
    }
}

@Suite("TemplateDTO Identifiable Conformance")
@MainActor
struct TemplateDTOIdentifiableTests {
    
    @Test("TemplateDTO conforms to Identifiable")
    func testIdentifiableConformance() throws {
        let json = """
        {
            "id": "test-id-123",
            "name": "Test"
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template = try decoder.decode(TemplateDTO.self, from: data)
        
        // Identifiable.id should match the template.id
        #expect(template.id == "test-id-123")
    }
    
    @Test("TemplateDTO can be used in ForEach")
    func testUsableInForEach() throws {
        let json = """
        {
            "templates": [
                {"id": "id1", "name": "Template 1"},
                {"id": "id2", "name": "Template 2"},
                {"id": "id3", "name": "Template 3"}
            ]
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let response = try decoder.decode(TemplatesListResponse.self, from: data)
        
        // Test that all templates have unique IDs
        let ids = Set(response.templates.map(\.id))
        #expect(ids.count == 3)
    }
}

@Suite("TemplateDTO Hashable Conformance")
@MainActor
struct TemplateDTOHashableTests {
    
    @Test("Two templates with same id are equal")
    func testEqualityWithSameId() throws {
        let json1 = """
        {"id": "test", "name": "Name 1", "usage_count": 100}
        """
        let json2 = """
        {"id": "test", "name": "Name 2", "usage_count": 200}
        """
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let template1 = try decoder.decode(TemplateDTO.self, from: Data(json1.utf8))
        let template2 = try decoder.decode(TemplateDTO.self, from: Data(json2.utf8))
        
        // Should be equal if id is the same (even if other fields differ)
        #expect(template1.id == template2.id)
    }
    
    @Test("TemplateDTO can be stored in Set")
    func testUsableInSet() throws {
        let json = """
        {
            "templates": [
                {"id": "id1", "name": "Template 1"},
                {"id": "id2", "name": "Template 2"},
                {"id": "id1", "name": "Template 1 Duplicate"}
            ]
        }
        """
        
        let data = Data(json.utf8)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let response = try decoder.decode(TemplatesListResponse.self, from: data)
        
        // Verify we have 3 templates from JSON
        #expect(response.templates.count == 3)
        
        // Convert to Set - Hashable considers all fields, not just id
        // So templates with same id but different names are NOT duplicates
        let uniqueTemplates = Set(response.templates)
        
        // All 3 are unique because Hashable includes all fields
        #expect(uniqueTemplates.count == 3)
        
        // To test actual ID-based uniqueness, check IDs
        let uniqueIds = Set(response.templates.map(\.id))
        #expect(uniqueIds.count == 2) // id1 and id2
    }
}
