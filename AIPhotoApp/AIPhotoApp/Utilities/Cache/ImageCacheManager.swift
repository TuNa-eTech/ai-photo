import Foundation
import UIKit
import Combine

// MARK: - Cache Configuration
struct ImageCacheConfiguration {
    static let defaultMemoryLimit = 100 * 1024 * 1024 // 100MB
    static let defaultDiskLimit = 500 * 1024 * 1024 // 500MB
    static let templateCacheExpiration: TimeInterval = 30 * 24 * 60 * 60 // 30 days
    static let processedImageExpiration: TimeInterval = .infinity
}

// MARK: - Cache Item
class CachedImage: NSObject {
    let image: UIImage
    let timestamp: Date
    let expirationTime: TimeInterval
    let etag: String?
    let lastModified: String?

    init(image: UIImage, timestamp: Date, expirationTime: TimeInterval, etag: String?, lastModified: String?) {
        self.image = image
        self.timestamp = timestamp
        self.expirationTime = expirationTime
        self.etag = etag
        self.lastModified = lastModified
        super.init()
    }

    var isExpired: Bool {
        if expirationTime == .infinity { return false }
        return Date().timeIntervalSince(timestamp) > expirationTime
    }
}

// MARK: - Image Cache Manager
@MainActor
class ImageCacheManager: NSObject, ObservableObject {
    static let shared = ImageCacheManager()

    // MARK: - Properties
    private let memoryCache: NSCache<NSString, CachedImage>
    private let diskCacheURL: URL
    private let fileManager = FileManager.default
    private let imageProcessingQueue = DispatchQueue(label: "image.cache.processing", qos: .utility)

    // Request deduplication
    private var activeRequests: [URL: AnyPublisher<UIImage?, Error>] = [:]
    private let requestsLock = NSLock()

    // MARK: - Cache Statistics
    @Published private(set) var memoryCacheSize: Int = 0
    @Published private(set) var diskCacheSize: Int = 0
    @Published private(set) var cacheHits: Int = 0
    @Published private(set) var cacheMisses: Int = 0

    // MARK: - Initialization
    private override init() {
        // Initialize properties first
        memoryCache = NSCache<NSString, CachedImage>()

        let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
        diskCacheURL = documentsPath.appendingPathComponent("ImageCache")

        // Call super.init
        super.init()

        // Configure memory cache after super.init
        memoryCache.countLimit = 100
        memoryCache.totalCostLimit = ImageCacheConfiguration.defaultMemoryLimit
        memoryCache.delegate = self

        // Setup disk cache after super.init
        createCacheDirectoryIfNeeded()

        // Setup disk cache configuration
        URLCache.shared = URLCache(
            memoryCapacity: 50 * 1024 * 1024, // 50MB for URL cache
            diskCapacity: ImageCacheConfiguration.defaultDiskLimit,
            diskPath: "ImageCacheURLCache"
        )
    }

    // MARK: - Public Interface

    /// Fetch image with caching
    func image(for url: URL?, cachePolicy: CachePolicy = .default) -> AnyPublisher<UIImage?, Error> {
        guard let url = url else {
            return Just<UIImage?>(nil).setFailureType(to: Error.self).eraseToAnyPublisher()
        }

        let cacheKey = url.absoluteString as NSString

        // Check memory cache first
        if let cachedImage = memoryCache.object(forKey: cacheKey), !cachedImage.isExpired {
            DispatchQueue.main.async { [weak self] in
                self?.cacheHits += 1
            }
            return Just<UIImage?>(cachedImage.image).setFailureType(to: Error.self).eraseToAnyPublisher()
        }

        // Check disk cache
        if let diskImage = loadImageFromDisk(for: url, cachePolicy: cachePolicy) {
            // Store in memory cache for faster future access
            let cachedItem = CachedImage(
                image: diskImage,
                timestamp: Date(),
                expirationTime: cacheExpirationTime(for: url, policy: cachePolicy),
                etag: nil,
                lastModified: nil
            )
            let imageCost = Int(diskImage.size.width * diskImage.size.height * 4)
            memoryCache.setObject(cachedItem, forKey: cacheKey, cost: imageCost)

            DispatchQueue.main.async { [weak self] in
                self?.cacheHits += 1
            }
            return Just<UIImage?>(diskImage).setFailureType(to: Error.self).eraseToAnyPublisher()
        }

        // Request deduplication
        requestsLock.lock()
        if let existingRequest = activeRequests[url] {
            requestsLock.unlock()
            return existingRequest
        }
        requestsLock.unlock()

        // Fetch from network
        let publisher = fetchImageFromNetwork(url: url, cachePolicy: cachePolicy)
            .handleEvents(receiveCompletion: { [weak self] _ in
                self?.requestsLock.lock()
                self?.activeRequests.removeValue(forKey: url)
                self?.requestsLock.unlock()
            })
            .eraseToAnyPublisher()

        requestsLock.lock()
        activeRequests[url] = publisher
        requestsLock.unlock()

        return publisher
    }

    /// Prefetch images for better UX
    func prefetchImages(for urls: [URL], cachePolicy: CachePolicy = .default) async {
        await withTaskGroup(of: Void.self) { group in
            for url in urls {
                group.addTask { [weak self] in
                    _ = try? await self?.image(for: url, cachePolicy: cachePolicy).async()
                }
            }
        }
    }

    /// Clear specific cache types
    func clearCache(type: CacheType = .all) {
        switch type {
        case .memory:
            memoryCache.removeAllObjects()
            memoryCacheSize = 0
        case .disk:
            clearDiskCache()
        case .all:
            memoryCache.removeAllObjects()
            clearDiskCache()
        }
    }

    /// Get cache statistics
    func getCacheStatistics() -> CacheStatistics {
        return CacheStatistics(
            memoryCacheSize: memoryCacheSize,
            diskCacheSize: calculateDiskCacheSize(),
            cacheHits: cacheHits,
            cacheMisses: cacheMisses
        )
    }
}

// MARK: - Private Methods
private extension ImageCacheManager {

    func createCacheDirectoryIfNeeded() {
        if !fileManager.fileExists(atPath: diskCacheURL.path) {
            try? fileManager.createDirectory(at: diskCacheURL, withIntermediateDirectories: true)
        }
    }

    func fetchImageFromNetwork(url: URL, cachePolicy: CachePolicy) -> AnyPublisher<UIImage?, Error> {
        var request = URLRequest(url: url)
        request.cachePolicy = urlRequestCachePolicy(for: cachePolicy)

        // Add conditional headers if we have cached metadata
        if let metadata = getCacheMetadata(for: url) {
            if let etag = metadata.etag {
                request.setValue(etag, forHTTPHeaderField: "If-None-Match")
            }
            if let lastModified = metadata.lastModified {
                request.setValue(lastModified, forHTTPHeaderField: "If-Modified-Since")
            }
        }

        return URLSession.shared.dataTaskPublisher(for: request)
            .tryMap { [weak self] data, response -> UIImage? in
                guard let httpResponse = response as? HTTPURLResponse else {
                    throw ImageCacheError.invalidResponse
                }

                switch httpResponse.statusCode {
                case 200...299:
                    // New image data
                    guard let image = UIImage(data: data) else {
                        throw ImageCacheError.invalidImageData
                    }

                    // Cache the image and metadata
                    self?.cacheImage(image, for: url, response: httpResponse, cachePolicy: cachePolicy)

                    DispatchQueue.main.async { [weak self] in
                        self?.cacheMisses += 1
                    }

                    return image

                case 304:
                    // Not modified, use cached version
                    if let cachedImage = self?.loadImageFromDisk(for: url, cachePolicy: cachePolicy) {
                        return cachedImage
                    }

                    // Fallback: try to decode from stored response
                    guard let cachedResponse = URLCache.shared.cachedResponse(for: request),
                          let image = UIImage(data: cachedResponse.data) else {
                        throw ImageCacheError.noCachedData
                    }

                    self?.cacheImage(image, for: url, response: httpResponse, cachePolicy: cachePolicy)
                    return image

                default:
                    throw ImageCacheError.httpError(httpResponse.statusCode)
                }
            }
            .catch { [weak self] error -> AnyPublisher<UIImage?, Error> in
                // Try fallback to disk cache on network error
                if let fallbackImage = self?.loadImageFromDisk(for: url, cachePolicy: cachePolicy) {
                    return Just<UIImage?>(fallbackImage).setFailureType(to: Error.self).eraseToAnyPublisher()
                }
                return Fail(error: error).eraseToAnyPublisher()
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }

    func cacheImage(_ image: UIImage, for url: URL, response: HTTPURLResponse, cachePolicy: CachePolicy) {
        let cacheKey = url.absoluteString as NSString
        let expirationTime = cacheExpirationTime(for: url, policy: cachePolicy)

        // Create metadata
        let metadata = CacheMetadata(
            etag: response.value(forHTTPHeaderField: "ETag"),
            lastModified: response.value(forHTTPHeaderField: "Last-Modified")
        )

        // Cache in memory
        let cachedImage = CachedImage(
            image: image,
            timestamp: Date(),
            expirationTime: expirationTime,
            etag: metadata.etag,
            lastModified: metadata.lastModified
        )

        let imageCost = Int(image.size.width * image.size.height * 4) // Approximate memory cost
        memoryCache.setObject(cachedImage, forKey: cacheKey, cost: imageCost)

        // Cache to disk asynchronously
        Task.detached { [weak self] in
            guard let self = self else { return }
            await self.saveImageToDisk(image, for: url, metadata: metadata)
        }
    }

    @MainActor
    func saveImageToDisk(_ image: UIImage, for url: URL, metadata: CacheMetadata) {
        guard let data = image.jpegData(compressionQuality: 0.8) else { return }

        let filename = String(url.hashValue)
        let fileURL = diskCacheURL.appendingPathComponent("\(filename).jpg")
        let metadataURL = diskCacheURL.appendingPathComponent("\(filename).meta")

        do {
            try data.write(to: fileURL)
            try JSONEncoder().encode(metadata).write(to: metadataURL)
        } catch {
            print("Failed to save image to disk: \(error)")
        }
    }

    func loadImageFromDisk(for url: URL, cachePolicy: CachePolicy) -> UIImage? {
        let filename = String(url.hashValue)
        let fileURL = diskCacheURL.appendingPathComponent("\(filename).jpg")
        let metadataURL = diskCacheURL.appendingPathComponent("\(filename).meta")

        guard fileManager.fileExists(atPath: fileURL.path) else { return nil }

        // Check expiration
        if let attributes = try? fileManager.attributesOfItem(atPath: fileURL.path),
           let creationDate = attributes[.creationDate] as? Date {

            let expirationTime = cacheExpirationTime(for: url, policy: cachePolicy)
            if expirationTime != .infinity && Date().timeIntervalSince(creationDate) > expirationTime {
                // File expired, remove it
                try? fileManager.removeItem(at: fileURL)
                try? fileManager.removeItem(at: metadataURL)
                return nil
            }
        }

        return UIImage(contentsOfFile: fileURL.path)
    }

    func getCacheMetadata(for url: URL) -> CacheMetadata? {
        let filename = String(url.hashValue)
        let metadataURL = diskCacheURL.appendingPathComponent("\(filename).meta")

        guard fileManager.fileExists(atPath: metadataURL.path),
              let data = try? Data(contentsOf: metadataURL) else { return nil }

        return try? JSONDecoder().decode(CacheMetadata.self, from: data)
    }

    func clearDiskCache() {
        guard let contents = try? fileManager.contentsOfDirectory(at: diskCacheURL,
                                                                includingPropertiesForKeys: nil) else { return }

        for url in contents {
            try? fileManager.removeItem(at: url)
        }
    }

    func calculateDiskCacheSize() -> Int {
        guard let contents = try? fileManager.contentsOfDirectory(at: diskCacheURL,
                                                                includingPropertiesForKeys: [.fileSizeKey]) else { return 0 }

        return contents.reduce(0) { total, url in
            if let size = try? url.resourceValues(forKeys: [.fileSizeKey]).fileSize {
                return total + size
            }
            return total
        }
    }

    func cacheExpirationTime(for url: URL, policy: CachePolicy) -> TimeInterval {
        switch policy {
        case .template:
            return ImageCacheConfiguration.templateCacheExpiration
        case .processedImage:
            return ImageCacheConfiguration.processedImageExpiration
        case .default:
            // Auto-detect based on URL pattern
            if url.absoluteString.contains("/templates/") {
                return ImageCacheConfiguration.templateCacheExpiration
            } else {
                return ImageCacheConfiguration.templateCacheExpiration
            }
        }
    }

    func urlRequestCachePolicy(for cachePolicy: CachePolicy) -> URLRequest.CachePolicy {
        switch cachePolicy {
        case .template:
            return .returnCacheDataElseLoad
        case .processedImage:
            return .returnCacheDataElseLoad
        case .default:
            return .useProtocolCachePolicy
        }
    }
}

// MARK: - NSCacheDelegate
extension ImageCacheManager: NSCacheDelegate {
    func cache(_ cache: NSCache<AnyObject, AnyObject>, willEvictObject obj: AnyObject) {
        // Object is being evicted from cache
        // Can perform cleanup here if needed
        _ = obj as? CachedImage
        // Optional: Track evictions for analytics
    }
}

// MARK: - Supporting Types
enum CachePolicy {
    case `default`
    case template
    case processedImage
}

enum CacheType {
    case memory
    case disk
    case all
}

struct CacheMetadata: Codable {
    let etag: String?
    let lastModified: String?
}

struct CacheStatistics {
    let memoryCacheSize: Int
    let diskCacheSize: Int
    let cacheHits: Int
    let cacheMisses: Int

    var hitRate: Double {
        guard cacheHits + cacheMisses > 0 else { return 0 }
        return Double(cacheHits) / Double(cacheHits + cacheMisses)
    }
}

enum ImageCacheError: LocalizedError {
    case invalidResponse
    case invalidImageData
    case noCachedData
    case httpError(Int)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid HTTP response"
        case .invalidImageData:
            return "Invalid image data"
        case .noCachedData:
            return "No cached data available"
        case .httpError(let code):
            return "HTTP error: \(code)"
        }
    }
}

// MARK: - Publisher Extension
extension Publisher {
    func async() async throws -> Output {
        try await withCheckedThrowingContinuation { continuation in
            var cancellable: AnyCancellable?
            cancellable = self
                .sink(
                    receiveCompletion: { completion in
                        switch completion {
                        case .finished:
                            break
                        case .failure(let error):
                            continuation.resume(throwing: error)
                        }
                        cancellable?.cancel()
                    },
                    receiveValue: { value in
                        continuation.resume(returning: value)
                        cancellable?.cancel()
                    }
                )
        }
    }
}