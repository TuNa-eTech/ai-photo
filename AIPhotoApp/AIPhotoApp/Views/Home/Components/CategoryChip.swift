//
//  CategoryChip.swift
//  AIPhotoApp
//
//  Category chip button with gradient styling
//  Used in horizontal category scroll view
//

import SwiftUI

struct CategoryChip: View {
    let category: TemplateCategory
    let isSelected: Bool
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            action()
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        }) {
            HStack(spacing: 8) {
                Image(systemName: category.icon)
                    .imageScale(.small)
                    .foregroundStyle(iconColor)
                
                Text(category.name)
                    .font(.subheadline.weight(isSelected ? .semibold : .regular))
                    .foregroundStyle(GlassTokens.textPrimary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(backgroundView)
            .overlay(borderOverlay)
            .shadow(
                color: isSelected ? category.gradient[0].opacity(0.4) : .clear,
                radius: isSelected ? 8 : 0,
                x: 0,
                y: isSelected ? 4 : 0
            )
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isPressed)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
        .accessibilityLabel(Text(category.name))
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }
    
    private var iconColor: AnyShapeStyle {
        if isSelected {
            AnyShapeStyle(category.linearGradient)
        } else {
            AnyShapeStyle(GlassTokens.textSecondary)
        }
    }
    
    @ViewBuilder
    private var backgroundView: some View {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
            .fill(isSelected ? .regularMaterial : .ultraThinMaterial)
    }
    
    @ViewBuilder
    private var borderOverlay: some View {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
            .stroke(
                isSelected
                ? category.linearGradient
                : LinearGradient(
                    colors: [GlassTokens.borderColor.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ),
                lineWidth: isSelected ? 2 : 0.8
            )
    }
}

// MARK: - Preview
#Preview {
    ZStack {
        GlassBackgroundView()
        
        VStack(spacing: 16) {
            // Selected
            CategoryChip(
                category: .portrait,
                isSelected: true
            ) {
                print("Portrait tapped")
            }
            
            // Unselected
            CategoryChip(
                category: .landscape,
                isSelected: false
            ) {
                print("Landscape tapped")
            }
        }
        .padding()
    }
}

