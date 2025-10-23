# SwiftUI & iOS 26: New Features and API Updates

_Last updated: 2025-10-18_

## Overview

This document summarizes the latest SwiftUI features and APIs introduced in iOS 26, macOS 26, and visionOS 26, based on official Apple documentation and authoritative sources.

## Key New APIs and Enhancements

### 1. `navigationSplitViewStyle(_:)`
- **Description:** Sets the style for navigation split views within a view.
- **Availability:** iOS 16.0+, iPadOS 16.0+, macOS 16.0+, tvOS 16.0+, visionOS 16.0+, watchOS 9.0+
- **Example:**
  ```swift
  NavigationSplitView {
      // sidebar
  } content: {
      // content
  }
  .navigationSplitViewStyle(.balanced)
  ```
- **Reference:** [Apple Docs](https://developer.apple.com/documentation/SwiftUI/documentation/swiftui/view/navigationsplitviewstyle%28_%3A%29)

### 2. `buildLimitedAvailability(_:)`
- **Description:** Processes scene content for a conditional compiler-control statement that performs an availability check.
- **Availability:** macOS 26.0+, visionOS 26.0+, iOS 26.0+ (expected)
- **Example:**
  ```swift
  static func buildLimitedAvailability<D>(_ definition: D) -> AttributedTextFormatting.AnyDefinition<Scope> where Scope == D.Scope, D : AttributedTextFormattingDefinition
  ```
- **Reference:** [Apple Docs](https://developer.apple.com/documentation/SwiftUI/documentation/swiftui/attributedtextformatting/definitionbuilder/buildlimitedavailability%28_%3A%29)

### 3. `VerticalDirection` Enumeration
- **Description:** Represents vertical directions in SwiftUI layouts.
- **Availability:** iOS 26.0+, macOS 26.0+, visionOS 26.0+
- **Example:**
  ```swift
  @frozen
  enum VerticalDirection
  ```
- **Reference:** [Apple Docs](https://developer.apple.com/documentation/SwiftUI/documentation/swiftui/verticaldirection)

## Migration and Compatibility

- Many new APIs are only available in iOS 26/macOS 26/visionOS 26 and later. Use availability checks to ensure backward compatibility.
- For migration guides and best practices, refer to the official Apple documentation and release notes.

## Additional Resources

- [SwiftUI Documentation (Apple)](https://developer.apple.com/documentation/swiftui)
- [What's New in SwiftUI (WWDC)](https://developer.apple.com/videos/wwdc/)

---
_This document will be updated as new features and APIs are announced for iOS 26 and SwiftUI._
