//
//  HeroTemplateCard.swift
//  AIPhotoApp
//
//  Hero section card displaying the #1 trending template
//

import SwiftUI
import UIKit

struct HeroTemplateCard: View {
    let template: HomeViewModel.TemplateItem
    let onTap: () -> Void
    
    var body: some View {
        GeometryReader { geometry in
            let screenHeight = UIScreen.main.bounds.height
            let heroHeight = screenHeight * HeroConstants.heightMultiplier
            let safeAreaTop = geometry.safeAreaInsets.top
            let totalHeight = heroHeight + safeAreaTop
            
            ZStack(alignment: .bottomLeading) {
                // Background image - extends to top edge including status bar area
                Group {
                    if let url = template.thumbnailURL {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .scaledToFill()
                            case .failure, .empty:
                                fallbackImage
                            @unknown default:
                                fallbackImage
                            }
                        }
                    } else {
                        fallbackImage
                    }
                }
                .frame(width: geometry.size.width, height: totalHeight)
                .clipped()
                .offset(y: -safeAreaTop)
                
                // Subtle gradient overlay for better text readability
                LinearGradient(
                    colors: [
                        Color.clear,
                        Color.black.opacity(0.4)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(width: geometry.size.width, height: totalHeight)
                .offset(y: -safeAreaTop)
                
                // Bottom content: Template info - subtle and minimal
                VStack(alignment: .leading, spacing: 6) {
                    Text(template.title)
                        .font(.title2.weight(.medium))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                    
                    if let subtitle = template.subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.85))
                            .shadow(color: .black.opacity(0.2), radius: 1, x: 0, y: 1)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
            }
            .contentShape(Rectangle())
            .onTapGesture {
                onTap()
            }
            .ignoresSafeArea(edges: .top)
        }
        .frame(height: UIScreen.main.bounds.height * HeroConstants.heightMultiplier)
    }
    
    private var fallbackImage: some View {
        ZStack {
            LinearGradient(
                colors: [GlassTokens.primary1, GlassTokens.accent1],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Image(systemName: template.thumbnailSymbol ?? "photo")
                .font(.system(size: 80))
                .foregroundStyle(.white.opacity(0.5))
        }
    }
}

#Preview {
    let template = HomeViewModel.TemplateItem(
        slug: "preview",
        title: "Anime Style",
        subtitle: "New • High Quality",
        thumbnailSymbol: "moon.stars.fill"
    )
    
    HeroTemplateCard(template: template) {
        print("Tapped")
    }
}

