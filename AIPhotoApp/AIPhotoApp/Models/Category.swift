//
//  Category.swift
//  AIPhotoApp
//
//  Template category model for filtering and navigation
//  Categories are loaded from API via CategoryManager
//

import SwiftUI

struct TemplateCategory: Identifiable, Hashable {
    let id: String
    let name: String
    let icon: String
    
    // MARK: - Special Category (Always Available)
    
    static let all = TemplateCategory(
        id: "all",
        name: "Tất cả",
        icon: "square.grid.2x2"
    )
}



