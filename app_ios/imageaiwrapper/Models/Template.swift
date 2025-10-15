//
//  Template.swift
//  imageaiwrapper
//
//  Created by Gemini on 10/12/2025.
//

import Foundation

struct Template: Decodable, Identifiable {
    let id: String
    let name: String
    let thumbnail_url: String

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case thumbnail_url
    }
}
