//
//  ResultModeControl.swift
//  AIPhotoApp
//
//  Segmented control for switching between Before/After/Compare modes
//

import SwiftUI

struct ResultModeControl: View {
    @Binding var mode: ResultMode

    var body: some View {
        HStack(spacing: 8) {
            segment("Before", .before, "photo")
            segment("After", .after, "sparkles")
            segment("Compare", .compare, "square.split.2x1")
        }
        .padding(6)
        .background(.ultraThinMaterial.opacity(0.9), in: Capsule())
        .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
    }

    @ViewBuilder
    private func segment(_ title: String, _ value: ResultMode, _ system: String) -> some View {
        let isSelected = mode == value
        Button {
            #if canImport(UIKit)
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            #endif
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                mode = value
            }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: system)
                Text(title)
            }
            .font(.subheadline.weight(isSelected ? .semibold : .regular))
            .padding(.horizontal, 12).padding(.vertical, 8)
            .background(
                isSelected
                    ? AnyShapeStyle(GlassTokens.accent2.opacity(0.35))
                    : AnyShapeStyle(Color.clear)
            )
            .foregroundStyle(GlassTokens.textPrimary)
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text(title))
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }
}

// MARK: - ResultMode Enum

enum ResultMode: String, CaseIterable, Identifiable {
    case before = "Before"
    case after = "After"
    case compare = "Compare"
    var id: String { rawValue }
}
