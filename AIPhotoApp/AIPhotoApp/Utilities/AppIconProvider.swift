//
//  AppIconProvider.swift
//  AIPhotoApp
//
//  Helper to access the app icon image
//

import SwiftUI
import UIKit

struct AppIconProvider {
    /// Returns the app icon as a UIImage
    static func getAppIcon() -> UIImage? {
        // Try to get app icon from bundle
        if let icons = Bundle.main.object(forInfoDictionaryKey: "CFBundleIcons") as? [String: Any],
            let primaryIcon = icons["CFBundlePrimaryIcon"] as? [String: Any],
            let iconFiles = primaryIcon["CFBundleIconFiles"] as? [String],
            let iconFileName = iconFiles.last
        {
            return UIImage(named: iconFileName)
        }

        // Fallback: Try alternate app icons
        if let alternateIcons = Bundle.main.object(forInfoDictionaryKey: "CFBundleAlternateIcons")
            as? [String: Any]
        {
            for (_, iconInfo) in alternateIcons {
                if let iconDict = iconInfo as? [String: Any],
                    let iconFiles = iconDict["CFBundleIconFiles"] as? [String],
                    let iconFileName = iconFiles.last
                {
                    return UIImage(named: iconFileName)
                }
            }
        }

        return nil
    }
}

/// SwiftUI wrapper for app icon
struct AppIconImage: View {
    let size: CGFloat

    var body: some View {
        Group {
            if let icon = AppIconProvider.getAppIcon() {
                Image(uiImage: icon)
                    .resizable()
                    .scaledToFit()
            } else {
                // Fallback to a placeholder
                Image(systemName: "photo.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .foregroundStyle(
                        LinearGradient(
                            colors: [GlassTokens.primary1, GlassTokens.accent1],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
    }
}
