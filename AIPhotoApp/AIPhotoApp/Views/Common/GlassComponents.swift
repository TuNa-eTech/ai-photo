//
//  GlassComponents.swift
//  AIPhotoApp
//
//  Reusable "Liquid Glass" components: background, card modifier, chips, buttons, cards, and debug overlay.
//

import SwiftUI

// MARK: - Design Tokens

enum GlassTokens {
    // Colors - Beige Theme
    static let primary1 = Color(red: 0.961, green: 0.902, blue: 0.827)    // #F5E6D3 - Warm Linen
    static let primary2 = Color(red: 0.831, green: 0.769, blue: 0.690)    // #D4C4B0 - Soft Taupe
    static let accent1  = Color(red: 0.957, green: 0.894, blue: 0.757)    // #F4E4C1 - Champagne
    static let accent2  = Color(red: 0.910, green: 0.835, blue: 0.816)    // #E8D5D0 - Dusty Rose
    
    // Text Colors (Dark on Light for contrast)
    static let textPrimary = Color(red: 0.290, green: 0.247, blue: 0.208)      // #4A3F35 - Dark Brown
    static let textSecondary = Color(red: 0.478, green: 0.435, blue: 0.365)    // #7A6F5D - Soft Brown
    static let textOnGlass = textPrimary
    
    // Border Color (Subtle beige-brown)
    static let borderColor = Color(red: 0.6, green: 0.55, blue: 0.48)          // Muted brown for borders

    // Spacing
    static let spaceBase: CGFloat = 4
    static let radiusCard: CGFloat = 22    // Slightly rounder for softer look
    static let blurCard: CGFloat = 15      // Reduced for minimalist clarity

    // Shadow (Lighter for minimalist aesthetic)
    static let shadowColor = Color.black.opacity(0.15)
    static let shadowRadius: CGFloat = 18
    static let shadowY: CGFloat = 8
}

// MARK: - Background

struct GlassBackgroundView: View {
    var animated: Bool = true

    @State private var blobMove = false

    var body: some View {
        ZStack {
            // Beige gradient (lightest beige → warm linen → champagne)
            LinearGradient(
                colors: [
                    Color(red: 0.98, green: 0.95, blue: 0.90),    // Lightest beige
                    GlassTokens.primary1,                          // Warm linen #F5E6D3
                    GlassTokens.accent1                            // Champagne #F4E4C1
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            // Subtle animated blobs (beige theme, performance friendly)
            if animated {
                Circle()
                    .fill(GlassTokens.accent1.opacity(0.4))        // Champagne blob
                    .frame(width: 280, height: 280)
                    .blur(radius: 50)
                    .offset(x: blobMove ? -100 : 70, y: blobMove ? -140 : -30)
                    .animation(.easeInOut(duration: 13).repeatForever(autoreverses: true), value: blobMove)

                Circle()
                    .fill(GlassTokens.accent2.opacity(0.3))        // Dusty rose blob
                    .frame(width: 320, height: 320)
                    .blur(radius: 60)
                    .offset(x: blobMove ? 110 : -70, y: blobMove ? 130 : 50)
                    .animation(.easeInOut(duration: 15).repeatForever(autoreverses: true), value: blobMove)
            }

            // Subtle texture overlay (minimalist)
            LinearGradient(
                colors: [Color.white.opacity(0.02), Color.clear, GlassTokens.textPrimary.opacity(0.02)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            .blendMode(.overlay)
        }
        .onAppear { blobMove = true }
    }
}

// MARK: - Card Modifier

struct GlassCardModifier: ViewModifier {
    var cornerRadius: CGFloat = GlassTokens.radiusCard

    func body(content: Content) -> some View {
        content
            .background(
                .ultraThinMaterial
                    .opacity(0.85),  // Slightly more opaque for better content visibility
                in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8)  // Thinner beige border
            )
            .shadow(color: GlassTokens.shadowColor, radius: GlassTokens.shadowRadius, x: 0, y: GlassTokens.shadowY)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
    }
}

extension View {
    func glassCard(cornerRadius: CGFloat = GlassTokens.radiusCard) -> some View {
        modifier(GlassCardModifier(cornerRadius: cornerRadius))
    }
}

// MARK: - Chips & Buttons

struct GlassChip: View {
    var text: String
    var systemImage: String?

    var body: some View {
        HStack(spacing: 4) {
            if let systemImage {
                Image(systemName: systemImage).imageScale(.small)
            }
            Text(text)
                .font(.caption2)
                .bold()
        }
        .foregroundStyle(GlassTokens.textOnGlass)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(.ultraThinMaterial.opacity(0.8), in: Capsule())
        .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
        .accessibilityLabel(Text(text))
    }
}

struct GlassCTAButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundStyle(GlassTokens.textPrimary)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(.ultraThinMaterial.opacity(0.85), in: Capsule())
            .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
            .shadow(color: GlassTokens.shadowColor, radius: GlassTokens.shadowRadius, x: 0, y: GlassTokens.shadowY)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.8), value: configuration.isPressed)
            .accessibilityAddTraits(.isButton)
    }
}

struct GlassFloatingButton: View {
    var systemImage: String = "sparkles"
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.title2.weight(.semibold))
                .foregroundStyle(GlassTokens.textOnGlass)
                .frame(width: 56, height: 56)
                .background(.ultraThinMaterial.opacity(0.9), in: Circle())
                .overlay(Circle().stroke(GlassTokens.borderColor.opacity(0.35), lineWidth: 0.8))
        }
        .shadow(color: GlassTokens.shadowColor, radius: GlassTokens.shadowRadius, x: 0, y: GlassTokens.shadowY)
        .accessibilityLabel(Text("Create"))
        .accessibilityAddTraits(.isButton)
    }
}

// MARK: - Cards

struct CardGlassSmall: View {
    let title: String
    let tag: String?
    let image: Image? // Placeholder/local image if available

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            // Thumbnail with subtle tint overlay
            (image ?? Image(systemName: "photo"))
                .resizable()
                .scaledToFill()
                .frame(maxWidth: .infinity)
                .overlay(
                    LinearGradient(
                        colors: [
                            GlassTokens.primary1.opacity(0.4),
                            GlassTokens.accent1.opacity(0.3)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .blur(radius: GlassTokens.blurCard)
                .clipped()

            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(GlassTokens.textPrimary)
                    .lineLimit(1)
                if let tag {
                    GlassChip(text: tag, systemImage: "flame")
                }
            }
            .padding(12)
        }
        .frame(height: 180)
        .glassCard()
        .contentShape(RoundedRectangle(cornerRadius: GlassTokens.radiusCard, style: .continuous))
        .accessibilityElement(children: .combine)
        .accessibilityLabel(Text("\(title)\(tag.map { ", \($0)" } ?? "")"))
    }
}

struct CardGlassLarge: View {
    let title: String
    let subtitle: String?
    let badge: String?
    let image: Image?
    // Parallax factor in points (10–16 recommended)
    var parallax: CGFloat = 12

    @State private var isPressed = false

    var body: some View {
        GeometryReader { geo in
            let minX = geo.frame(in: .global).minX
            ZStack(alignment: .bottomLeading) {
                // Background with subtle parallax and beige tint
                (image ?? Image(systemName: "photo"))
                    .resizable()
                    .scaledToFill()
                    .offset(x: -minX / 20) // parallax divisor for subtle effect
                    .overlay(
                        LinearGradient(
                            colors: [
                                GlassTokens.primary2.opacity(0.5),
                                GlassTokens.accent1.opacity(0.4)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .blur(radius: GlassTokens.blurCard)
                    .clipped()

                VStack(alignment: .leading, spacing: 8) {
                    if let badge {
                        GlassChip(text: badge, systemImage: "star.fill")
                    }
                    Text(title)
                        .font(.title3.bold())
                        .foregroundStyle(GlassTokens.textPrimary)
                        .lineLimit(2)
                    if let subtitle {
                        Text(subtitle)
                            .font(.footnote)
                            .foregroundStyle(GlassTokens.textSecondary)
                            .lineLimit(2)
                    }
                }
                .padding(16)
            }
            .frame(height: 240)
            .glassCard(cornerRadius: 24)
            .scaleEffect(isPressed ? 1.02 : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.85), value: isPressed)
            .onLongPressGesture(minimumDuration: 0.08, maximumDistance: 10, perform: {}, onPressingChanged: { pressing in
                isPressed = pressing
            })
            .accessibilityElement(children: .combine)
            .accessibilityLabel(Text("\(title)\(badge.map { ", \($0)" } ?? "")"))
        }
        .frame(width: 320, height: 240)
    }
}

// MARK: - Debug Overlay (DEBUG only)

struct DebugOverlay: View {
    var body: some View {
        Text("AI Engine: OK • API ~54ms")
            .font(.caption2)
            .foregroundStyle(GlassTokens.textPrimary)
            .padding(8)
            .background(.ultraThinMaterial.opacity(0.9), in: Capsule())
            .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
            .padding()
    }
}

// MARK: - Previews

#Preview("Glass Components") {
    ZStack {
        GlassBackgroundView(animated: false)
        VStack(spacing: 16) {
            CardGlassLarge(title: "Anime Style", subtitle: "New • High Quality", badge: "New", image: Image(systemName: "moon.stars.fill"))
                .frame(width: 320)
            HStack {
                CardGlassSmall(title: "Cartoon", tag: "Trending", image: Image(systemName: "paintbrush.pointed.fill"))
                CardGlassSmall(title: "Cyberpunk", tag: "New", image: Image(systemName: "bolt.fill"))
            }
            .frame(height: 180)
            .padding(.horizontal)
            GlassFloatingButton(systemImage: "sparkles") { }
        }
    }
}
