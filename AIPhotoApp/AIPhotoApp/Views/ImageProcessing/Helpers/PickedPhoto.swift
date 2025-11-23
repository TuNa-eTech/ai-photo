//
//  PickedPhoto.swift
//  AIPhotoApp
//
//  Transferable wrapper to robustly import various image representations (HEIC/iCloud)
//

import Foundation
import SwiftUI
import UniformTypeIdentifiers

#if canImport(UIKit)
    import UIKit
#endif

struct PickedPhoto: Transferable {
    let image: UIImage

    static var transferRepresentation: some TransferRepresentation {
        DataRepresentation(importedContentType: .image) { data in
            guard let img = UIImage(data: data) else {
                throw NSError(
                    domain: "ImageImport", code: -1,
                    userInfo: [NSLocalizedDescriptionKey: "Unsupported image data"])
            }
            return PickedPhoto(image: img)
        }
    }
}
