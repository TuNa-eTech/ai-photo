//
//  NavigationViewModel.swift
//  AIPhotoApp
//
//  Manages app-wide navigation state, specifically tab switching
//

import Observation
import SwiftUI

@Observable
class NavigationViewModel {
    var selectedTab: MainTabView.TabItem = .home
    var pendingSearchCategory: TemplateCategory?

    /// Switches to the Search tab and optionally pre-selects a category
    func navigateToSearch(category: TemplateCategory? = nil) {
        if let category = category {
            pendingSearchCategory = category
        }
        selectedTab = .search
    }
}
