//
//  TrendingNowSection.swift
//  AIPhotoApp
//
//  Trending Now section displaying horizontal scrolling template cards
//

import SwiftUI

struct TrendingNowSection: View {
    let templates: [HomeViewModel.TemplateItem]
    let isLoading: Bool
    let isFavorite: (HomeViewModel.TemplateItem) -> Bool
    let onTemplateTap: (HomeViewModel.TemplateItem) -> Void
    let onToggleFavorite: (HomeViewModel.TemplateItem) -> Void
    let onSeeAllTap: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            TemplateSectionHeader(title: "Trending Now", onSeeAllTap: onSeeAllTap)
            
            if templates.isEmpty && !isLoading {
                TemplateSectionEmptyState(message: "No more trending templates")
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 16) {
                        ForEach(templates) { item in
                            TemplateCardView(
                                item: item,
                                isFavorite: isFavorite(item),
                                onTap: { onTemplateTap(item) },
                                onToggleFavorite: { onToggleFavorite(item) }
                            )
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
    }
}

#Preview {
    let templates = [
        HomeViewModel.TemplateItem(
            slug: "1",
            title: "Anime Style",
            tag: "Trending",
            thumbnailSymbol: "moon.stars.fill"
        ),
        HomeViewModel.TemplateItem(
            slug: "2",
            title: "Cyberpunk",
            tag: "New",
            thumbnailSymbol: "bolt.fill"
        )
    ]
    
    TrendingNowSection(
        templates: templates,
        isLoading: false,
        isFavorite: { _ in false },
        onTemplateTap: { _ in },
        onToggleFavorite: { _ in },
        onSeeAllTap: { }
    )
    .padding()
    .background(Color.black)
}

