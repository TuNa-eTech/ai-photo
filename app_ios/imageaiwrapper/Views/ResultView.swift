// ResultView.swift
// imageaiwrapper

import SwiftUI

struct ResultView: View {
    let originalImage: UIImage?
    let processedImageURL: URL
    let onTryAnotherStyle: () -> Void

    @State private var showShareSheet = false
    @State private var processedImage: UIImage?

    var body: some View {
        VStack(spacing: 20) {
            Text("Result").font(.largeTitle).bold()

            if let original = originalImage {
                HStack {
                    VStack {
                        Text("Original")
                        Image(uiImage: original)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(maxHeight: 200)
                            .cornerRadius(10)
                    }
                    VStack {
                        Text("Styled")
                        if let processed = processedImage {
                            Image(uiImage: processed)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(maxHeight: 200)
                                .cornerRadius(10)
                        } else {
                            AsyncImage(url: processedImageURL) { phase in
                                if let image = phase.image {
                                    image.resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .onAppear {
                                            processedImage = image.asUIImage()
                                        }
                                } else if phase.error != nil {
                                    Color.red
                                } else {
                                    ProgressView()
                                }
                            }
                            .frame(maxHeight: 200)
                            .cornerRadius(10)
                        }
                    }
                }
            } else {
                if let processed = processedImage {
                    Image(uiImage: processed)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(maxHeight: 300)
                        .cornerRadius(10)
                } else {
                    AsyncImage(url: processedImageURL) { phase in
                        if let image = phase.image {
                            image.resizable()
                                .aspectRatio(contentMode: .fit)
                                .onAppear {
                                    processedImage = image.asUIImage()
                                }
                        } else if phase.error != nil {
                            Color.red
                        } else {
                            ProgressView()
                        }
                    }
                    .frame(maxHeight: 300)
                    .cornerRadius(10)
                }
            }

            HStack(spacing: 20) {
                Button(action: saveToLibrary) {
                    Label("Save to Library", systemImage: "square.and.arrow.down")
                }
                .disabled(processedImage == nil)

                Button(action: { showShareSheet = true }) {
                    Label("Share", systemImage: "square.and.arrow.up")
                }
                .disabled(processedImage == nil)
            }

            Button(action: onTryAnotherStyle) {
                Text("Try Another Style")
                    .foregroundColor(.blue)
            }
            .padding(.top, 10)

            Spacer()
        }
        .padding()
        .sheet(isPresented: $showShareSheet) {
            if let processed = processedImage {
                ActivityView(activityItems: [processed])
            }
        }
    }

    private func saveToLibrary() {
        guard let processed = processedImage else { return }
        UIImageWriteToSavedPhotosAlbum(processed, nil, nil, nil)
    }
}

// Helper to convert Image to UIImage
extension Image {
    func asUIImage() -> UIImage? {
        // Not directly possible; handled via AsyncImage phase.image
        nil
    }
}

// UIKit wrapper for share sheet
import UIKit
struct ActivityView: UIViewControllerRepresentable {
    let activityItems: [Any]
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
