//  Keychain.swift
//  AIPhotoApp
//
//  Lightweight Keychain wrapper to save/load/delete small secrets like ID tokens.
//  NOTE: ID Token is short-lived; we store it only to improve UX at app launch.
//  All API calls should still refresh on-demand when receiving 401.

import Foundation
import Security

enum Keychain {
    enum KCError: Error {
        case unhandled(OSStatus)
        case dataEncoding
        case notFound
    }

        static func save(service: String, account: String, data: Data) throws -> Void {
        // Delete existing item first to be idempotent
        _ = try? delete(service: service, account: account)

        let query: [String: Any] = [
            kSecClass as String:              kSecClassGenericPassword,
            kSecAttrService as String:        service,
            kSecAttrAccount as String:        account,
            kSecValueData as String:          data,
            kSecAttrAccessible as String:     kSecAttrAccessibleAfterFirstUnlock
        ]

        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KCError.unhandled(status)
        }
    }

    static func load(service: String, account: String) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String:              kSecClassGenericPassword,
            kSecAttrService as String:        service,
            kSecAttrAccount as String:        account,
            kSecReturnData as String:         kCFBooleanTrue as Any,
            kSecMatchLimit as String:         kSecMatchLimitOne
        ]

        var item: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status != errSecItemNotFound else { throw KCError.notFound }
        guard status == errSecSuccess else { throw KCError.unhandled(status) }

        guard let data = item as? Data else { throw KCError.dataEncoding }
        return data
    }

        static func delete(service: String, account: String) throws -> Void {
        let query: [String: Any] = [
            kSecClass as String:          kSecClassGenericPassword,
            kSecAttrService as String:    service,
            kSecAttrAccount as String:    account
        ]
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KCError.unhandled(status)
        }
    }
}
