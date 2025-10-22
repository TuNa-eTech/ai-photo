//
//  GlassComponents.swift
//  AIPhotoApp
//
//  Reusable "Liquid Glass" components: background, card modifier, chips, buttons, cards, and debug overlay.
//

import SwiftUI

// MARK: - Design Tokens

enum GlassTokens {
    // Colors
    static let primary1 = Color(red: 0.302, green: 0.639, blue: 1.0)      // #4DA3FF
    static let primary2 = Color(red: 0.635, green: 0.349, blue: 1.0)      // #A259FF
    static let accent1  = Color(red: 0.196, green: 0.878, blue: 0.769)    // #32E0C4
    static let accent2  = Color(red: 1.0,   green: 0.302, blue: 0.604)    // #FF4D9A
    static let textOnGlass = Color.white.opacity(0.9)

    // Spacing
    static let spaceBase: CGFloat = 4
    static let radiusCard: CGFloat = 20
    static let blurCard: CGFloat = 25   // 25 ±5 (tùy performance)

    // Shadow
    static let shadowColor = Color.black.opacity(0.25)
    static let shadowRadius: CGFloat = 25
    static let shadowY: CGFloat = 12
}

// MARK: - Background

struct GlassBackgroundView: View {
    var animated: Bool = true

    @State private var blobMove = false

    var body: some View {
        ZStack {
            // Gradient multi-point (blue → purple → cyan)
            LinearGradient(
                colors: [
                    GlassTokens.primary1.opacity(0.9),
                    GlassTokens.primary2.opacity(0.9),
                    Color.cyan.opacity(0.9)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            // Subtle animated blobs (performance friendly)
            if animated {
                Circle()
                    .fill(GlassTokens.accent1.opacity(0.25))
                    .frame(width: 260, height: 260)
                    .blur(radius: 60)
                    .offset(x: blobMove ? -120 : 80, y: blobMove ? -150 : -40)
                    .animation(.easeInOut(duration: 12).repeatForever(autoreverses: true), value: blobMove)

                Circle()
                    .fill(GlassTokens.accent2.opacity(0.20))
                    .frame(width: 300, height: 300)
                    .blur(radius: 70)
                    .offset(x: blobMove ? 120 : -80, y: blobMove ? 140 : 60)
                    .animation(.easeInOut(duration: 14).repeatForever(autoreverses: true), value: blobMove)
            }

            // Noise overlay (very subtle)
            LinearGradient(
                colors: [Color.white.opacity(0.03), Color.clear, Color.black.opacity(0.03)],
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
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(Color.white.opacity(0.25), lineWidth: 1)
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
        .background(.ultraThinMaterial, in: Capsule())
        .overlay(Capsule().stroke(Color.white.opacity(0.25), lineWidth: 1))
        .accessibilityLabel(Text(text))
    }
}

struct GlassCTAButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(.ultraThinMaterial, in: Capsule())
            .overlay(Capsule().stroke(Color.white.opacity(0.25), lineWidth: 1))
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
                .background(.ultraThinMaterial, in: Circle())
                .overlay(Circle().stroke(Color.white.opacity(0.25), lineWidth: 1))
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
            // Thumbnail (placeholder implementation)
            (image ?? Image(systemName: "photo"))
                .resizable()
                .scaledToFill()
                .frame(maxWidth: .infinity)
                .overlay(.ultraThinMaterial)
                .blur(radius: GlassTokens.blurCard)
                .clipped()

            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(GlassTokens.textOnGlass)
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
                // Background with subtle parallax
                (image ?? Image(systemName: "photo"))
                    .resizable()
                    .scaledToFill()
                    .offset(x: -minX / 20) // parallax divisor for subtle effect
                    .overlay(.ultraThinMaterial)
                    .blur(radius: GlassTokens.blurCard)
                    .clipped()

                VStack(alignment: .leading, spacing: 8) {
                    if let badge {
                        GlassChip(text: badge, systemImage: "star.fill")
                    }
                    Text(title)
                        .font(.title3.bold())
                        .foregroundStyle(GlassTokens.textOnGlass)
                        .lineLimit(2)
                    if let subtitle {
                        Text(subtitle)
                            .font(.footnote)
                            .foregroundStyle(Color.white.opacity(0.85))
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
            .padding(8)
            .background(.ultraThinMaterial, in: Capsule())
            .overlay(Capsule().stroke(.white.opacity(0.25), lineWidth: 1))
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
