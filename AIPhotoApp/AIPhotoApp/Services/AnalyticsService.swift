//
//  AnalyticsService.swift
//  AIPhotoApp
//
//  Created by AI Assistant on 28/11/25.
//

import FirebaseAnalytics
import Foundation

enum AnalyticsEvent {
    // User Events
    case login(method: String)
    case signUp(method: String)
    case logout
    case viewScreen(name: String)

    // Feature Events
    case viewTemplate(id: String, name: String)
    case processImageStart(templateId: String, templateName: String)
    case processImageSuccess(templateId: String, duration: Double)
    case processImageFail(templateId: String, error: String)

    // Purchase Events
    case purchaseAttempt(productId: String)
    case purchaseSuccess(productId: String, price: Double, currency: String)
    case purchaseFail(productId: String, error: String)

    var name: String {
        switch self {
        case .login: return AnalyticsEventLogin
        case .signUp: return AnalyticsEventSignUp
        case .logout: return "logout"
        case .viewScreen: return AnalyticsEventScreenView
        case .viewTemplate: return AnalyticsEventViewItem
        case .processImageStart: return "process_image_start"
        case .processImageSuccess: return "process_image_success"
        case .processImageFail: return "process_image_fail"
        case .purchaseAttempt: return AnalyticsEventBeginCheckout
        case .purchaseSuccess: return AnalyticsEventPurchase
        case .purchaseFail: return "purchase_fail"
        }
    }

    var parameters: [String: Any]? {
        switch self {
        case .login(let method):
            return [AnalyticsParameterMethod: method]
        case .signUp(let method):
            return [AnalyticsParameterMethod: method]
        case .logout:
            return nil
        case .viewScreen(let name):
            return [
                AnalyticsParameterScreenName: name,
                AnalyticsParameterScreenClass: name,
            ]
        case .viewTemplate(let id, let name):
            return [
                AnalyticsParameterItemID: id,
                AnalyticsParameterItemName: name,
                AnalyticsParameterContentType: "template",
            ]
        case .processImageStart(let templateId, let templateName):
            return [
                "template_id": templateId,
                "template_name": templateName,
            ]
        case .processImageSuccess(let templateId, let duration):
            return [
                "template_id": templateId,
                "duration": duration,
            ]
        case .processImageFail(let templateId, let error):
            return [
                "template_id": templateId,
                "error_message": error,
            ]
        case .purchaseAttempt(let productId):
            return [
                AnalyticsParameterItems: [[AnalyticsParameterItemID: productId]]
            ]
        case .purchaseSuccess(let productId, let price, let currency):
            return [
                AnalyticsParameterCurrency: currency,
                AnalyticsParameterValue: price,
                AnalyticsParameterItems: [[AnalyticsParameterItemID: productId]],
            ]
        case .purchaseFail(let productId, let error):
            return [
                "product_id": productId,
                "error_message": error,
            ]
        }
    }
}

final class AnalyticsService {
    static let shared = AnalyticsService()

    private init() {}

    func log(_ event: AnalyticsEvent) {
        Analytics.logEvent(event.name, parameters: event.parameters)

        #if DEBUG
            print("📊 [Analytics] \(event.name) params: \(event.parameters ?? [:])")
        #endif
    }

    func setUserId(_ userId: String?) {
        Analytics.setUserID(userId)
    }

    func setUserProperty(_ value: String?, forName name: String) {
        Analytics.setUserProperty(value, forName: name)
    }
}
