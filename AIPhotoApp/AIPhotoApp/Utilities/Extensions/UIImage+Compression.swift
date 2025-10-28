//
//  UIImage+Compression.swift
//  AIPhotoApp
//
//  Image compression utilities for upload
//

import UIKit

extension UIImage {
    /// Compress image for upload (JPEG 70%, max 1920px)
    /// Target: 500KB-1MB
    func compressForUpload() -> Data? {
        let maxDimension: CGFloat = 1920
        let quality: CGFloat = 0.70
        
        // Resize if needed
        let resized = self.resized(maxDimension: maxDimension)
        
        // Compress as JPEG
        return resized?.jpegData(compressionQuality: quality)
    }
    
    /// Resize image to fit within max dimension while maintaining aspect ratio
    func resized(maxDimension: CGFloat) -> UIImage? {
        let currentSize = size
        
        // No resize needed if already smaller
        let maxCurrent = max(currentSize.width, currentSize.height)
        if maxCurrent <= maxDimension {
            return self
        }
        
        // Calculate new size
        let ratio = maxDimension / maxCurrent
        let newSize = CGSize(
            width: currentSize.width * ratio,
            height: currentSize.height * ratio
        )
        
        return resized(to: newSize)
    }
    
    /// Resize image to exact size
    func resized(to targetSize: CGSize) -> UIImage? {
        UIGraphicsBeginImageContextWithOptions(targetSize, false, scale)
        defer { UIGraphicsEndImageContext() }
        
        draw(in: CGRect(origin: .zero, size: targetSize))
        return UIGraphicsGetImageFromCurrentImageContext()
    }
    
    /// Create thumbnail (200x200, quality 70%)
    func createThumbnail(size: CGSize = CGSize(width: 200, height: 200)) -> UIImage? {
        return resized(to: size)
    }
}

