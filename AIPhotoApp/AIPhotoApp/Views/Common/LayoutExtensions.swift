//
//  LayoutExtensions.swift
//  AIPhotoApp
//
//  Reusable layout modifiers and extensions
//

import SwiftUI

// MARK: - Container Modifiers

extension View {
    /// Creates a readable container with responsive horizontal padding
    func readableContainer() -> some View {
        self.frame(maxWidth: .infinity)
            .readableHorizontalPadding()
    }

    private func readableHorizontalPadding() -> some View {
        self.modifier(ReadableHorizontalPaddingModifier())
    }

    /// Adapts content to Dynamic Type settings
    func adaptsToDynamicType() -> some View {
        self
            .minimumScaleFactor(0.8)
            .lineLimit(nil)
    }

    /// Applies safe area aware spacing
    func safeAreaSpacing(_ edges: Edge.Set = .all) -> some View {
        self.padding(edges, UIApplication.shared.windows.first?.safeAreaInsets.top ?? 0)
    }

    /// Creates a full screen background
    func fullScreenBackground<Background: View>(@ViewBuilder background: () -> Background) -> some View {
        self.background(
            background()
                .ignoresSafeArea()
        )
    }
}

// MARK: - Device Detection

extension UIScreen {
    /// Device width category for responsive layouts
    enum WidthCategory {
        case compact      // < 375pt (iPhone SE)
        case regular      // 375-414pt (iPhone standard)
        case large        // > 414pt (iPhone Plus/Pro Max)
    }

    var widthCategory: WidthCategory {
        switch UIScreen.main.bounds.width {
        case ..<375:
            return .compact
        case 375..<414:
            return .regular
        default:
            return .large
        }
    }

    /// Responsive padding based on device width
    var responsivePadding: CGFloat {
        switch widthCategory {
        case .compact:
            return 16
        case .regular:
            return 20
        case .large:
            return 24
        }
    }
}

// MARK: - Animation Helpers

extension Animation {
    /// Standard spring animation for UI transitions
    static var glassSpring: Animation {
        .spring(response: GlassTokens.animationStandard, dampingFraction: 0.8)
    }

    /// Quick spring animation for micro-interactions
    static var glassQuickSpring: Animation {
        .spring(response: GlassTokens.animationQuick, dampingFraction: 0.85)
    }

    /// Smooth ease-in-out animation for content transitions
    static var glassSmooth: Animation {
        .easeInOut(duration: GlassTokens.animationStandard)
    }
}

// MARK: - Accessibility Helpers

extension View {
    /// Adds accessibility label and hint for processing states
    func accessibilityProcessingState(_ state: String, hint: String) -> some View {
        self
            .accessibilityLabel(Text(state))
            .accessibilityHint(Text(hint))
            .accessibilityAddTraits(.updatesFrequently)
    }

    /// Makes content accessible as a button with proper feedback
    func accessibleButton(label: String, hint: String = "") -> some View {
        self
            .accessibilityLabel(Text(label))
            .accessibilityHint(Text(hint))
            .accessibilityAddTraits(.isButton)
    }
}

// MARK: - Haptic Feedback Helpers

#if canImport(UIKit)
import UIKit

/// Centralized haptic feedback utilities
struct HapticFeedback {
    static func light() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    static func medium() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    static func heavy() {
        UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
    }

    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    static func error() {
        UINotificationFeedbackGenerator().notificationOccurred(.error)
    }

    static func warning() {
        UINotificationFeedbackGenerator().notificationOccurred(.warning)
    }
}

// MARK: - Custom Modifiers

private struct ReadableHorizontalPaddingModifier: ViewModifier {
    func body(content: Content) -> some View {
        GeometryReader { geometry in
            content
                .padding(.horizontal, max(16, geometry.size.width * 0.05))
        }
    }
}
#endif