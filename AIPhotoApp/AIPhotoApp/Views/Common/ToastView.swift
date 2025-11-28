//
//  ToastView.swift
//  AIPhotoApp
//
//  Simple, elegant toast notification
//

import SwiftUI

/// Toast message model
struct ToastMessage: Equatable {
    let text: String
    let icon: String
    let type: ToastType

    enum ToastType {
        case success
        case error
        case info

        var iconColor: Color {
            switch self {
            case .success:
                return GlassTokens.accent1
            case .error:
                return .red
            case .info:
                return GlassTokens.primary1
            }
        }
    }
}

/// Toast view modifier
struct ToastModifier: ViewModifier {
    @Binding var toast: ToastMessage?

    func body(content: Content) -> some View {
        content
            .overlay(alignment: .top) {
                if let toast = toast {
                    ToastView(message: toast)
                        .padding(.top, 50)
                        .padding(.horizontal, 20)
                        .transition(.move(edge: .top).combined(with: .opacity))
                        .onAppear {
                            // Auto-dismiss after 2 seconds
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                                    self.toast = nil
                                }
                            }
                        }
                }
            }
            .animation(.spring(response: 0.4, dampingFraction: 0.75), value: toast)
    }
}

/// Toast view
private struct ToastView: View {
    let message: ToastMessage

    var body: some View {
        HStack(spacing: 12) {
            // Icon
            Image(systemName: message.icon)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(message.type.iconColor)

            // Message
            Text(message.text)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(GlassTokens.textPrimary)
                .multilineTextAlignment(.leading)

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(
            .ultraThinMaterial.opacity(0.95),
            in: RoundedRectangle(cornerRadius: 16, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(
                    LinearGradient(
                        colors: [
                            GlassTokens.borderColor.opacity(0.3),
                            GlassTokens.borderColor.opacity(0.2),
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .shadow(
            color: .black.opacity(0.15),
            radius: 12,
            x: 0,
            y: 6
        )
    }
}

// MARK: - View Extension

extension View {
    func toast(_ toast: Binding<ToastMessage?>) -> some View {
        modifier(ToastModifier(toast: toast))
    }
}
