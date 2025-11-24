//
//  ProcessingStateExtensions.swift
//  AIPhotoApp
//
//  Extensions for ImageProcessingViewModel.ProcessingState
//

import Foundation

extension ImageProcessingViewModel.ProcessingState {
    var canShowProgress: Bool {
        switch self {
        case .uploading, .processing, .processingInBackground:
            return true
        default:
            return false
        }
    }
}
