import SwiftUI
import Combine

// MARK: - Cached Async Image
struct CachedAsyncImage<Content: View, Placeholder: View>: View {
    // MARK: - Properties
    let url: URL?
    let cachePolicy: CachePolicy
    let content: (Image) -> Content
    let placeholder: () -> Placeholder
    let errorView: ((Error) -> AnyView)?
    let retryAction: (() -> Void)?

    @StateObject private var cacheManager = ImageCacheManager.shared
    @State private var imageState: ImageState = .empty
    @State private var imageLoadAttempt = 0
    private var maxRetryAttempts = 3

    // MARK: - Initialization
    init(
        url: URL?,
        cachePolicy: CachePolicy = .default,
        @ViewBuilder content: @escaping (Image) -> Content,
        @ViewBuilder placeholder: @escaping () -> Placeholder,
        errorView: ((Error) -> AnyView)? = nil,
        retryAction: (() -> Void)? = nil
    ) {
        self.url = url
        self.cachePolicy = cachePolicy
        self.content = content
        self.placeholder = placeholder
        self.errorView = errorView
        self.retryAction = retryAction
    }

    // MARK: - Body
    var body: some View {
        ZStack {
            switch imageState {
            case .empty:
                placeholder()
                    .transition(.opacity.animation(.easeInOut(duration: 0.3)))

            case .loading:
                LoadingView()
                    .transition(.opacity.animation(.easeInOut(duration: 0.3)))

            case .success(let image):
                content(image)
                    .transition(.opacity.combined(with: .scale).animation(.easeInOut(duration: 0.4)))

            case .failure(let error):
                if let errorView = errorView {
                    errorView(error)
                        .transition(.opacity.animation(.easeInOut(duration: 0.3)))
                } else {
                    ErrorView(error: error, retryAction: {
                        retryImageLoad()
                    })
                    .transition(.opacity.animation(.easeInOut(duration: 0.3)))
                }
            }
        }
        .onAppear {
            loadImage()
        }
        .onChange(of: url) {
            imageState = .empty
            imageLoadAttempt = 0
            loadImage()
        }
    }
}

// MARK: - Private Methods
private extension CachedAsyncImage {
    func loadImage() {
        guard let url = url else {
            imageState = .empty
            return
        }

        imageState = .loading

        Task {
            do {
                let image = try await cacheManager.image(for: url, cachePolicy: cachePolicy).async()

                await MainActor.run {
                    if let uiImage = image {
                        let swiftUIImage = Image(uiImage: uiImage)
                        imageState = .success(swiftUIImage)
                    } else {
                        imageState = .failure(ImageLoadError.noImageData)
                    }
                }
            } catch {
                await MainActor.run {
                    imageState = .failure(error)
                }
            }
        }
    }

    func retryImageLoad() {
        guard imageLoadAttempt < maxRetryAttempts else { return }

        imageLoadAttempt += 1
        imageState = .empty

        // Add a small delay before retry
        DispatchQueue.main.asyncAfter(deadline: .now() + Double(imageLoadAttempt) * 0.5) {
            loadImage()
        }
    }
}

// MARK: - Loading View
private struct LoadingView: View {
    @State private var rotation: Double = 0
    @State private var scale: Double = 0.8

    var body: some View {
        ZStack {
            // Background gradient
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        colors: [Color.gray.opacity(0.1), Color.gray.opacity(0.2)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            // Loading spinner
            VStack(spacing: 8) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .blue))
                    .scaleEffect(scale)

                Text("Loading...")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
                rotation = 360
                scale = 1.2
            }
        }
    }
}

// MARK: - Error View
private struct ErrorView: View {
    let error: Error
    let retryAction: () -> Void

    var body: some View {
        ZStack {
            // Error background
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        colors: [Color.red.opacity(0.1), Color.orange.opacity(0.1)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            VStack(spacing: 12) {
                // Error icon
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 24))
                    .foregroundColor(.orange)

                // Error message
                VStack(spacing: 4) {
                    Text("Oops!")
                        .font(.headline)
                        .foregroundColor(.primary)

                    Text(error.localizedDescription)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }

                // Retry button
                Button(action: retryAction) {
                    HStack {
                        Image(systemName: "arrow.clockwise")
                        Text("Retry")
                    }
                    .font(.caption)
                    .foregroundColor(.blue)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        RoundedRectangle(cornerRadius: 15)
                            .fill(Color.blue.opacity(0.1))
                    )
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding(16)
        }
    }
}

// MARK: - Image State
private enum ImageState {
    case empty
    case loading
    case success(Image)
    case failure(Error)
}

// MARK: - Image Load Error
enum ImageLoadError: LocalizedError {
    case noImageData
    case invalidURL

    var errorDescription: String? {
        switch self {
        case .noImageData:
            return "No image data available"
        case .invalidURL:
            return "Invalid image URL"
        }
    }
}

// MARK: - Convenience Initializers
extension CachedAsyncImage where Placeholder == EmptyView, Content == Image {
    init(url: URL?, cachePolicy: CachePolicy = .default) {
        self.init(
            url: url,
            cachePolicy: cachePolicy,
            content: { $0 },
            placeholder: { EmptyView() },
            errorView: nil,
            retryAction: nil
        )
    }
}

extension CachedAsyncImage where Placeholder == AnyView, Content == AnyView {
    init(
        url: URL?,
        cachePolicy: CachePolicy = .default,
        errorView: ((Error) -> AnyView)? = nil,
        retryAction: (() -> Void)? = nil
    ) {
        self.init(
            url: url,
            cachePolicy: cachePolicy,
            content: { AnyView($0) },
            placeholder: {
                AnyView(
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                )
            },
            errorView: errorView,
            retryAction: retryAction
        )
    }
}

// MARK: - Glass Card Variants
extension CachedAsyncImage<AnyView, AnyView> {
    static func glassCard(
        url: URL?,
        cachePolicy: CachePolicy = .template,
        placeholder: String = "photo",
        aspectRatio: CGFloat = 1.0
    ) -> some View {
        CachedAsyncImage<AnyView, AnyView>(
            url: url,
            cachePolicy: cachePolicy
        ) { image in
            AnyView(
                image
                    .resizable()
                    .scaledToFill()
                    .aspectRatio(aspectRatio, contentMode: .fill)
                    .clipped()
            )
        } placeholder: {
            AnyView(
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.1),
                                    Color.white.opacity(0.05)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .aspectRatio(aspectRatio, contentMode: .fill)

                    Image(systemName: placeholder)
                        .font(.system(size: 24))
                        .foregroundColor(.white.opacity(0.6))
                }
            )
        } errorView: { error in
            AnyView(
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.red.opacity(0.1),
                                    Color.orange.opacity(0.1)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .aspectRatio(aspectRatio, contentMode: .fill)

                    VStack(spacing: 8) {
                        Image(systemName: "photo.badge.exclamationmark")
                            .font(.system(size: 20))
                            .foregroundColor(.white.opacity(0.7))

                        Text("Failed to load")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
            )
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 20) {
        // Basic usage
        CachedAsyncImage(
            url: URL(string: "https://picsum.photos/200/200")
        ) { image in
            image
                .resizable()
                .scaledToFill()
        } placeholder: {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.gray.opacity(0.3))
                .frame(width: 200, height: 200)
        }
        .frame(width: 200, height: 200)
        .cornerRadius(8)

        // Glass card style
        CachedAsyncImage<AnyView, AnyView>.glassCard(
            url: URL(string: "https://picsum.photos/300/200"),
            aspectRatio: 3/2
        )
        .frame(width: 300, height: 200)
        .cornerRadius(16)

        // With loading indicator
        CachedAsyncImage(
            url: URL(string: "https://invalid-url.com")
        ) { image in
            image
                .resizable()
                .scaledToFill()
        } placeholder: {
            ProgressView()
        }
        .frame(width: 150, height: 150)
        .cornerRadius(8)
    }
    .padding()
}