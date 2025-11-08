//
//  TemplateCardView.swift
//  AIPhotoApp
//
//  Template card component used in horizontal scrolling sections
//

import SwiftUI
import UIKit

struct TemplateCardView: View {
    let item: HomeViewModel.TemplateItem
    let isFavorite: Bool
    let onTap: () -> Void
    let onToggleFavorite: () -> Void
    
    var body: some View {
        CardGlassSmall(
            title: item.title,
            tag: item.tag,
            thumbnailURL: item.thumbnailURL,
            thumbnailSymbol: item.thumbnailSymbol
        )
        .frame(width: 180, height: 240) // 3:4 aspect ratio
        .onTapGesture {
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            onTap()
        }
        .contextMenu {
            Button("Preview", systemImage: "eye") {}
            Button(
                isFavorite ? "Remove Favorite" : "Add Favorite",
                systemImage: isFavorite ? "heart.slash" : "heart"
            ) {
                onToggleFavorite()
            }
        }
    }
}

#Preview {
    let template = HomeViewModel.TemplateItem(
        slug: "preview",
        title: "Anime Style",
        tag: "Trending",
        thumbnailSymbol: "moon.stars.fill"
    )
    
    HStack {
        TemplateCardView(
            item: template,
            isFavorite: false,
            onTap: { print("Tapped") },
            onToggleFavorite: { print("Toggle favorite") }
        )
    }
    .padding()
    .background(Color.black)
}

