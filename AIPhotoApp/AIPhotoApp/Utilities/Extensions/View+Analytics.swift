//
//  View+Analytics.swift
//  AIPhotoApp
//
//  Created by AI Assistant on 28/11/25.
//

import SwiftUI

struct AnalyticsScreenViewModifier: ViewModifier {
    let screenName: String

    func body(content: Content) -> some View {
        content
            .onAppear {
                AnalyticsService.shared.log(.viewScreen(name: screenName))
            }
    }
}

extension View {
    func analyticsScreen(name: String) -> some View {
        modifier(AnalyticsScreenViewModifier(screenName: name))
    }
}
