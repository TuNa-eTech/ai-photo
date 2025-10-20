//  UIApplication+TopViewController.swift
//  AIPhotoApp
//
//  Helper to find the top-most view controller for presenting sign-in flows.

#if canImport(UIKit)
import UIKit

extension UIApplication {

    /// Returns the top-most view controller from the first key window's rootViewController.
    static func topMostViewController(base: UIViewController? = UIApplication.shared.ai_firstKeyWindow?.rootViewController) -> UIViewController? {
        if let nav = base as? UINavigationController {
            return topMostViewController(base: nav.visibleViewController)
        }
        if let tab = base as? UITabBarController, let selected = tab.selectedViewController {
            return topMostViewController(base: selected)
        }
        if let presented = base?.presentedViewController {
            return topMostViewController(base: presented)
        }
        return base
    }

    /// The first key window considering iOS 13+ scenes.
    fileprivate var ai_firstKeyWindow: UIWindow? {
        if #available(iOS 13.0, *) {
            return connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first(where: { $0.isKeyWindow })
        } else {
            // Fallback on earlier iOS versions
            return keyWindow
        }
    }
}
#endif
