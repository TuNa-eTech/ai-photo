//
//  PhotoLibraryManager.swift
//  AIPhotoApp
//
//  Photo library permissions and save operations
//

import Foundation
import Photos
import UIKit

final class PhotoLibraryManager {
    static let shared = PhotoLibraryManager()
    
    private init() {}
    
    /// Check current authorization status
    var authorizationStatus: PHAuthorizationStatus {
        PHPhotoLibrary.authorizationStatus(for: .addOnly)
    }
    
    /// Request photo library permissions
    func requestAuthorization() async -> PHAuthorizationStatus {
        await PHPhotoLibrary.requestAuthorization(for: .addOnly)
    }
    
    /// Save image to photo library
    /// - Parameter image: The image to save
    /// - Returns: true if successful, false otherwise
    func saveImage(_ image: UIImage) async -> Bool {
        // Check current authorization
        let status = authorizationStatus
        
        // Request permission if not determined
        let finalStatus: PHAuthorizationStatus
        if status == .notDetermined {
            finalStatus = await requestAuthorization()
        } else {
            finalStatus = status
        }
        
        // Handle different authorization states
        switch finalStatus {
        case .authorized, .limited:
            return await performSave(image)
        case .denied, .restricted:
            print("❌ Photo library access denied or restricted")
            return false
        case .notDetermined:
            print("❌ Photo library access not determined")
            return false
        @unknown default:
            print("❌ Unknown photo library authorization status")
            return false
        }
    }
    
    /// Perform the actual save operation
    private func performSave(_ image: UIImage) async -> Bool {
        await withCheckedContinuation { continuation in
            PHPhotoLibrary.shared().performChanges({
                PHAssetChangeRequest.creationRequestForAsset(from: image)
            }) { success, error in
                if let error = error {
                    print("❌ Failed to save image: \(error.localizedDescription)")
                    continuation.resume(returning: false)
                } else if success {
                    print("✅ Image saved successfully")
                    continuation.resume(returning: true)
                } else {
                    print("❌ Failed to save image: Unknown error")
                    continuation.resume(returning: false)
                }
            }
        }
    }
}

