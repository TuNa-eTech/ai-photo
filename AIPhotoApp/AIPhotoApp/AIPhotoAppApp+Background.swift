//
//  AIPhotoAppApp+Background.swift
//  AIPhotoApp
//
//  Background session handling for URLSession
//

import SwiftUI
import UIKit

extension AIPhotoAppApp {
    // MARK: - Background URLSession Handler
    
    /// Called by iOS when background download completes
    /// Must be called from AppDelegate or UISceneDelegate
    static func handleBackgroundSession(identifier: String, completionHandler: @escaping () -> Void) {
        // Verify it's our session
        guard identifier == BackgroundImageProcessor.shared.session.configuration.identifier else {
            completionHandler()
            return
        }
        
        // BackgroundImageProcessor handles the completion via delegate
        BackgroundImageProcessor.shared.session.getAllTasks { tasks in
            // Tasks are being processed by delegate methods
            completionHandler()
        }
    }
}

