//
//  HeroCarousel.swift
//  AIPhotoApp
//
//  Hero carousel with auto-sliding templates
//

import SwiftUI
import UIKit

struct HeroCarousel: View {
    let templates: [HomeViewModel.TemplateItem]
    let onTemplateTap: (TemplateDTO) -> Void
    let slideInterval: TimeInterval = 4.0
    
    @State private var currentIndex: Int = 0
    @State private var timer: Timer?
    @State private var dragOffset: CGFloat = 0
    
    var body: some View {
        GeometryReader { geometry in
            let screenHeight = UIScreen.main.bounds.height
            let heroHeight = screenHeight * HeroConstants.heightMultiplier
            let safeAreaTop = geometry.safeAreaInsets.top
            let totalHeight = heroHeight + safeAreaTop
            let width = geometry.size.width
            
            // Carousel slides container
            Group {
                if templates.count > 1 {
                    HStack(spacing: 0) {
                        ForEach(Array(templates.enumerated()), id: \.element.id) { index, template in
                            HeroTemplateCard(
                                template: template,
                                onTap: {
                                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                    if let dto = template.dto {
                                        onTemplateTap(dto)
                                    }
                                }
                            )
                            .frame(width: width)
                            .ignoresSafeArea(edges: .top)
                        }
                    }
                    .offset(x: -CGFloat(currentIndex) * width + dragOffset)
                    .animation(.easeInOut(duration: 0.5), value: currentIndex)
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                dragOffset = value.translation.width
                                stopTimer()
                            }
                            .onEnded { value in
                                let threshold: CGFloat = 50
                                if value.translation.width > threshold && currentIndex > 0 {
                                    withAnimation {
                                        currentIndex -= 1
                                    }
                                } else if value.translation.width < -threshold && currentIndex < templates.count - 1 {
                                    withAnimation {
                                        currentIndex += 1
                                    }
                                }
                                dragOffset = 0
                                restartTimer()
                            }
                    )
                    .frame(height: totalHeight)
                    .offset(y: -safeAreaTop)
                    .clipped()
                } else if let template = templates.first {
                    // Single template (no carousel needed)
                    HeroTemplateCard(
                        template: template,
                        onTap: {
                            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                            if let dto = template.dto {
                                onTemplateTap(dto)
                            }
                        }
                    )
                    .ignoresSafeArea(edges: .top)
                }
            }
            .frame(height: totalHeight)
            .onAppear {
                startTimer()
            }
            .onDisappear {
                stopTimer()
            }
            .onChange(of: templates.count) { oldValue, newValue in
                if newValue > 0 && currentIndex >= newValue {
                    currentIndex = 0
                }
                restartTimer()
            }
        }
        .frame(height: UIScreen.main.bounds.height * HeroConstants.heightMultiplier)
        .overlay(alignment: .bottom) {
            // Page indicators - fixed at bottom center of the component, completely independent of carousel slides
            if templates.count > 1 {
                HStack(spacing: 8) {
                    ForEach(0..<templates.count, id: \.self) { index in
                        Circle()
                            .fill(index == currentIndex ? Color.white : Color.white.opacity(0.4))
                            .frame(width: index == currentIndex ? 10 : 8, height: index == currentIndex ? 10 : 8)
                            .animation(.easeInOut(duration: 0.3), value: currentIndex)
                    }
                }
                .padding(.vertical, 12)
                .padding(.horizontal, 16)
                .background(.ultraThinMaterial.opacity(0.3), in: Capsule())
                .padding(.bottom, 20)
            }
        }
    }
    
    private func startTimer() {
        guard templates.count > 1 else { return }
        stopTimer()
        timer = Timer.scheduledTimer(withTimeInterval: slideInterval, repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.5)) {
                currentIndex = (currentIndex + 1) % templates.count
            }
        }
    }
    
    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
    
    private func restartTimer() {
        stopTimer()
        startTimer()
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
    
    HeroCarousel(
        templates: templates,
        onTemplateTap: { _ in }
    )
}

