//
//  ZoomableImageView.swift
//  AIPhotoApp
//
//  Image view with pinch-to-zoom and pan gestures
//

import SwiftUI
import UIKit

struct ZoomableImageView: View {
    let image: UIImage
    @State private var scale: CGFloat = 1.0
    @State private var offset: CGSize = .zero

    var body: some View {
        GeometryReader { geo in
            Image(uiImage: image)
                .resizable()
                .scaledToFit()
                .scaleEffect(scale)
                .offset(offset)
                .frame(width: geo.size.width, height: geo.size.height)
                .gesture(
                    MagnificationGesture()
                        .onChanged { value in
                            scale = min(max(1.0, value), 3.0)
                        }
                )
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            if scale > 1.0 {
                                offset = value.translation
                            }
                        }
                        .onEnded { _ in
                            if scale == 1.0 {
                                offset = .zero
                            } else {
                                let maxX = (geo.size.width * (scale - 1)) / 2
                                let maxY = (geo.size.height * (scale - 1)) / 2
                                let clampedX = min(max(-maxX, offset.width), maxX)
                                let clampedY = min(max(-maxY, offset.height), maxY)
                                offset = CGSize(width: clampedX, height: clampedY)
                            }
                        }
                )
                .onTapGesture(count: 2) {
                    withAnimation(.spring()) {
                        if scale > 1.0 {
                            scale = 1.0
                            offset = .zero
                        } else {
                            scale = 2.0
                        }
                    }
                }
        }
        .aspectRatio(contentMode: .fit)
    }
}
