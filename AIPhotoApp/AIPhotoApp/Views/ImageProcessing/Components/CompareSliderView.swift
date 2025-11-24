//
//  CompareSliderView.swift
//  AIPhotoApp
//
//  Before/After comparison slider view
//

import SwiftUI
import UIKit

struct CompareSliderView: View {
    let before: UIImage
    let after: UIImage
    @Binding var position: CGFloat

    var body: some View {
        GeometryReader { geo in
            ZStack {
                Image(uiImage: after)
                    .resizable()
                    .scaledToFit()
                    .frame(width: geo.size.width, height: geo.size.height)
                    .clipped()

                Image(uiImage: before)
                    .resizable()
                    .scaledToFit()
                    .frame(width: geo.size.width, height: geo.size.height)
                    .clipped()
                    .mask(
                        HStack(spacing: 0) {
                            Rectangle()
                                .frame(width: geo.size.width * position)
                            Spacer(minLength: 0)
                        }
                    )

                Rectangle()
                    .fill(GlassTokens.accent1.opacity(0.9))
                    .frame(width: 2)
                    .position(x: geo.size.width * position, y: geo.size.height / 2)

                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    GlassTokens.accent1.opacity(0.4),
                                    GlassTokens.accent2.opacity(0.3),
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .background(.ultraThinMaterial.opacity(0.9))
                        .overlay(
                            Circle().stroke(GlassTokens.borderColor.opacity(0.4), lineWidth: 1.5))

                    HStack(spacing: 2) {
                        Image(systemName: "chevron.left")
                            .font(.caption2.weight(.semibold))
                        Image(systemName: "chevron.right")
                            .font(.caption2.weight(.semibold))
                    }
                    .foregroundStyle(GlassTokens.textPrimary)
                }
                .frame(width: 32, height: 32)
                .position(x: geo.size.width * position, y: geo.size.height / 2)
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        let x = min(max(0, value.location.x), geo.size.width)
                        position = x / geo.size.width
                    }
            )
        }
        .aspectRatio(contentMode: .fit)
    }
}
