import Foundation
import UserNotifications
#if canImport(UIKit)
import UIKit
#endif

final class NotificationManager {
    static let shared = NotificationManager()
    
    private init() {}
    
    /// Request notification permissions
    func requestPermissions() async -> Bool {
        let center = UNUserNotificationCenter.current()
        
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
            return granted
        } catch {
            print("❌ Failed to request notification permissions: \(error)")
            return false
        }
    }
    
    /// Schedule a notification for when processing completes
    func notifyProcessingComplete(templateName: String) {
        let content = UNMutableNotificationContent()
        content.title = "Image Ready! 🎨"
        content.body = "Your \(templateName) image has been processed"
        content.sound = .default
        #if canImport(UIKit)
        content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)
        #endif
        
        // Schedule immediately
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ Failed to schedule notification: \(error)")
            }
        }
    }
    
    /// Clear badge
    func clearBadge() {
        UNUserNotificationCenter.current().setBadgeCount(0)
    }
}

/// Credits balance update notification used across the app
extension Notification.Name {
    static let creditsBalanceUpdated = Notification.Name("creditsBalanceUpdated")
}

