//
//  NewSection.swift
//  AIPhotoApp
//
//  New templates section displaying horizontal scrolling template cards
//

import SwiftUI

struct NewSection: View {
    let templates: [HomeViewModel.TemplateItem]
    let isLoading: Bool
    let isFavorite: (HomeViewModel.TemplateItem) -> Bool
    let onTemplateTap: (HomeViewModel.TemplateItem) -> Void
    let onToggleFavorite: (HomeViewModel.TemplateItem) -> Void
    let onSeeAllTap: () -> Void

    private let columns = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            TemplateSectionHeader(title: "New", onSeeAllTap: onSeeAllTap)

            if templates.isEmpty && !isLoading {
                TemplateSectionEmptyState(message: "No new templates")
            } else {
                LazyVGrid(columns: columns, spacing: 16) {
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

#Preview {
    let templates = [
        HomeViewModel.TemplateItem(
            slug: "1",
            title: "New Template 1",
            thumbnailSymbol: "sparkles"
        ),
        HomeViewModel.TemplateItem(
            slug: "2",
            title: "New Template 2",
            thumbnailSymbol: "star.fill"
        ),
    ]

    NewSection(
        templates: templates,
        isLoading: false,
        isFavorite: { _ in false },
        onTemplateTap: { _ in },
        onToggleFavorite: { _ in },
        onSeeAllTap: {}
    )
    .padding()
    .background(Color.black)
}
