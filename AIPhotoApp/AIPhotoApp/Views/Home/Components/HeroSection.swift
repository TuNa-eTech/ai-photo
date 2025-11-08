//
//  HeroSection.swift
//  AIPhotoApp
//
//  Hero section displaying carousel of trending templates
//

import SwiftUI

struct HeroSection: View {
    let heroTemplates: [HomeViewModel.TemplateItem]
    let isLoading: Bool
    let onTemplateTap: (TemplateDTO) -> Void
    
    var body: some View {
        Group {
            if !heroTemplates.isEmpty {
                HeroCarousel(
                    templates: heroTemplates,
                    onTemplateTap: onTemplateTap
                )
                .ignoresSafeArea(edges: .top)
            } else if !isLoading {
                HeroPlaceholder()
                    .ignoresSafeArea(edges: .top)
            }
        }
    }
}

#Preview {
    let templates = [
        HomeViewModel.TemplateItem(
            slug: "preview-1",
            title: "Anime Style",
            subtitle: "New • High Quality",
            tag: "Trending",
            thumbnailSymbol: "moon.stars.fill"
        ),
        HomeViewModel.TemplateItem(
            slug: "preview-2",
            title: "Cyberpunk",
            subtitle: "Neon • Futuristic",
            tag: "New",
            thumbnailSymbol: "bolt.fill"
        )
    ]
    
    HeroSection(
        heroTemplates: templates,
        isLoading: false,
        onTemplateTap: { _ in }
    )
}

