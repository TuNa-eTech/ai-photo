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

    // MARK: - Infinite Scroll Support
    private var infiniteTemplates: [HomeViewModel.TemplateItem] {
        guard !templates.isEmpty else { return [] }

        // Create infinite array: [last, original, first]
        // This allows seamless infinite scrolling
        let infiniteArray: [HomeViewModel.TemplateItem] = [
            templates.last!, // Last template for seamless loop back
        ] + templates + [
            templates.first! // First template for seamless loop forward
        ]

        return infiniteArray
    }

    private var infiniteIndex: Int {
        // Map infinite index to real template index
        let realIndex = currentIndex == 0 ? templates.count - 1 :
                         currentIndex == infiniteTemplates.count - 1 ? 0 :
                         currentIndex - 1
        return realIndex
    }

  
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
                        ForEach(Array(infiniteTemplates.enumerated()), id: \.element.id) { index, template in
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
                                if value.translation.width > threshold {
                                    withAnimation {
                                        currentIndex = max(0, currentIndex - 1)
                                    }
                                } else if value.translation.width < -threshold {
                                    withAnimation {
                                        currentIndex = min(infiniteTemplates.count - 1, currentIndex + 1)
                                    }
                                }
                                dragOffset = 0
                                restartTimer()

                                // Handle infinite loop jump
                                handleInfiniteLoop()
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
                if newValue > 0 {
                    currentIndex = 1 // Start at first real template (index 1 in infinite array)
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
                            .fill(index == infiniteIndex ? Color.white : Color.white.opacity(0.4))
                            .frame(width: index == infiniteIndex ? 10 : 8, height: index == infiniteIndex ? 10 : 8)
                            .animation(.easeInOut(duration: 0.3), value: infiniteIndex)
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
                currentIndex = (currentIndex + 1) % infiniteTemplates.count
                if currentIndex == 0 {
                    currentIndex = templates.count
                }
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

    private func handleInfiniteLoop() {
        // When reaching boundary, jump to opposite side without animation
        if currentIndex == 0 {
            // Jump to last real template (seamless)
            currentIndex = templates.count
        } else if currentIndex == infiniteTemplates.count - 1 {
            // Jump to first real template (seamless)
            currentIndex = 1
        }
    }
}

#Preview {
    let templates = [
        HomeViewModel.TemplateItem(
            slug: "preview-1",
            title: "Anime Style",
            subtitle: "New • High Quality",
            thumbnailSymbol: "moon.stars.fill"
        ),
        HomeViewModel.TemplateItem(
            slug: "preview-2",
            title: "Cyberpunk",
            subtitle: "Neon • Futuristic",
            thumbnailSymbol: "bolt.fill"
        )
    ]
    
    HeroCarousel(
        templates: templates,
        onTemplateTap: { _ in }
    )
}

