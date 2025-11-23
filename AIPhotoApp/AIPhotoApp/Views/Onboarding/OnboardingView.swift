//
//  OnboardingView.swift
//  AIPhotoApp
//
//  Created by Anh Tu on 23/11/25.
//

import SwiftUI
import UIKit

struct OnboardingPage: Identifiable {
    let id = UUID()
    let image: String
    let title: String
    let description: String
}

struct OnboardingView: View {
    @AppStorage("hasShownOnboarding") private var hasShownOnboarding: Bool = false
    @State private var currentPage = 0

    private let pages: [OnboardingPage] = [
        OnboardingPage(
            image: "onboarding_welcome",
            title: "Transform Photos with AI",
            description:
                "Turn your ordinary photos into extraordinary masterpieces with just one tap."
        ),
        OnboardingPage(
            image: "onboarding_templates",
            title: "Unlimited Styles",
            description:
                "Explore a vast library of artistic styles, from Anime to Van Gogh, Cyberpunk to Sketch."
        ),
        OnboardingPage(
            image: "onboarding_magic",
            title: "One Tap Magic",
            description: "Experience the power of AI. Simple, fast, and magical results every time."
        ),
    ]

    var body: some View {
        ZStack {
            // Background
            GlassBackgroundView(animated: true)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Page Content
                TabView(selection: $currentPage) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        OnboardingPageView(page: pages[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))

                // Bottom Controls
                VStack(spacing: 24) {
                    // Page Indicators
                    HStack(spacing: 8) {
                        ForEach(0..<pages.count, id: \.self) { index in
                            Capsule()
                                .fill(
                                    currentPage == index
                                        ? GlassTokens.textPrimary
                                        : GlassTokens.textSecondary.opacity(0.3)
                                )
                                .frame(width: currentPage == index ? 24 : 8, height: 8)
                                .animation(.spring(), value: currentPage)
                        }
                    }

                    // Action Button
                    Button(action: {
                        if currentPage < pages.count - 1 {
                            withAnimation {
                                currentPage += 1
                            }
                        } else {
                            completeOnboarding()
                        }
                    }) {
                        Text(currentPage < pages.count - 1 ? "Next" : "Get Started")
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(
                                Capsule()
                                    .fill(GlassTokens.textPrimary)
                            )
                            .shadow(color: Color.black.opacity(0.15), radius: 8, x: 0, y: 4)
                    }
                    .padding(.horizontal, 24)
                }
                .padding(.bottom, 40)
            }
        }
        .transition(.opacity)
    }

    private func completeOnboarding() {
        withAnimation {
            hasShownOnboarding = true
        }
    }
}

struct OnboardingPageView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Image Card
            GeometryReader { geo in
                Image(page.image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: geo.size.width, height: geo.size.height)
                    .clipShape(RoundedRectangle(cornerRadius: 32, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 32, style: .continuous)
                            .stroke(
                                LinearGradient(
                                    colors: [.white.opacity(0.5), .white.opacity(0.1)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ), lineWidth: 1)
                    )
                    .shadow(
                        color: GlassTokens.shadowColor, radius: GlassTokens.shadowRadius, x: 0,
                        y: GlassTokens.shadowY)
            }
            .frame(height: UIScreen.main.bounds.height * 0.6)
            .padding(.horizontal, 24)
            .padding(.bottom, 40)

            // Text Content
            VStack(spacing: 12) {
                Text(page.title)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(GlassTokens.textPrimary)
                    .multilineTextAlignment(.center)

                Text(page.description)
                    .font(.body)
                    .foregroundColor(GlassTokens.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()
        }
    }
}

#Preview {
    OnboardingView()
}
