# UI/UX Improvements for IAP Credits Feature

## Status Checklist

- [x] 1. Fix ProductCard: Load credits from backend API instead of extracting from product name
- [x] 2. Improve success message: Let user dismiss instead of auto-clearing after 3s
- [x] 3. Add refresh button and pull-to-refresh to CreditsPurchaseView
- [x] 4. Enhance credits header in ImageProcessingView with glass card style
- [x] 5. Add animation when credits balance changes
- [x] 6. Add haptic feedback on successful purchase
- [x] 7. Auto-refresh balance in ImageProcessingView after purchase from CreditsPurchaseView

## Overview

Improve UI/UX for the IAP credits feature by fixing reliability issues, enhancing visual feedback, and improving user experience.

## Issues to Fix

### 1. ProductCard Credits Extraction (Reliability Issue)
**Problem**: `ProductCard` extracts credits count from product name using regex, which is unreliable.
**Solution**: Load IAP products from backend API and create a mapping between StoreKit `Product.id` and credits count.

**Files to modify**:
- `AIPhotoApp/AIPhotoApp/ViewModels/CreditsViewModel.swift`
  - Add `serverProducts: [IAPProduct]` property
  - Add `loadIAPProductsFromServer()` call in `loadProducts()`
  - Add `getCreditsForProduct(_ productId: String) -> Int?` helper method

- `AIPhotoApp/AIPhotoApp/Views/Credits/CreditsPurchaseView.swift`
  - Update `ProductCard` to accept `creditsCount: Int?` parameter
  - Pass credits from ViewModel mapping instead of extracting from name

### 2. Success Message Auto-Clear (UX Issue)
**Problem**: Success message auto-clears after 3 seconds, user might miss it.
**Solution**: Remove auto-clear, let user dismiss manually via alert button.

**Files to modify**:
- `AIPhotoApp/AIPhotoApp/ViewModels/CreditsViewModel.swift`
  - Remove auto-clear Task in `purchaseProduct()` method (lines 94-100)

- `AIPhotoApp/AIPhotoApp/Views/Credits/CreditsPurchaseView.swift`
  - Update alert to use proper binding for success message

### 3. Refresh Functionality (Missing Feature)
**Problem**: No way to manually refresh products/balance.
**Solution**: Add refresh button in toolbar and pull-to-refresh.

**Files to modify**:
- `AIPhotoApp/AIPhotoApp/Views/Credits/CreditsPurchaseView.swift`
  - Add refresh button in toolbar
  - Add `.refreshable` modifier to ScrollView
  - Create `refreshData()` async function

### 4. Credits Header Enhancement (Visual Improvement)
**Problem**: Credits header is plain text, could be more visually appealing.
**Solution**: Style as glass card with better visual hierarchy.

**Files to modify**:
- `AIPhotoApp/AIPhotoApp/Views/ImageProcessing/ImageProcessingView.swift`
  - Update `creditsHeader` view to use glass card style
  - Add padding and better spacing

### 5. Credits Balance Animation (Visual Feedback)
**Problem**: No visual feedback when credits balance changes.
**Solution**: Add number animation when balance updates.

**Files to modify**:
- `AIPhotoApp/AIPhotoApp/Views/ImageProcessing/ImageProcessingView.swift`
  - Use `Text` with animation when credits balance changes
  - Add scale/pulse animation

- `AIPhotoApp/AIPhotoApp/Views/Profile/ProfileView.swift`
  - Add animation to credits display in stats section

- `AIPhotoApp/AIPhotoApp/Views/Credits/CreditsPurchaseView.swift`
  - Add animation to current credits card

### 6. Haptic Feedback (UX Enhancement)
**Problem**: No haptic feedback on successful purchase.
**Solution**: Add success haptic feedback.

**Files to modify**:
- `AIPhotoApp/AIPhotoApp/ViewModels/CreditsViewModel.swift`
  - Add `UINotificationFeedbackGenerator` in `purchaseProduct()` after successful purchase

### 7. Auto-Refresh Balance After Purchase (UX Flow)
**Problem**: After purchasing from CreditsPurchaseView, ImageProcessingView doesn't know balance updated.
**Solution**: Use NotificationCenter or environment to notify balance updates.

**Files to modify**:
- `AIPhotoApp/AIPhotoApp/ViewModels/CreditsViewModel.swift`
  - Post notification when balance updates: `NotificationCenter.default.post(name: .creditsBalanceUpdated, object: nil)`

- `AIPhotoApp/AIPhotoApp/Views/ImageProcessing/ImageProcessingView.swift`
  - Listen for `.creditsBalanceUpdated` notification and refresh balance

- `AIPhotoApp/AIPhotoApp/Utilities/Constants/AppConfig.swift` (or create new file)
  - Add notification name extension: `extension Notification.Name { static let creditsBalanceUpdated = Notification.Name("creditsBalanceUpdated") }`

## Implementation Order

1. Fix ProductCard credits extraction (most critical - reliability)
2. Remove success message auto-clear (quick fix)
3. Add refresh functionality (user-requested feature)
4. Enhance credits header (visual polish)
5. Add animations (visual feedback)
6. Add haptic feedback (UX enhancement)
7. Auto-refresh balance (flow improvement)

## Testing Checklist

- [ ] ProductCard displays correct credits from backend
- [ ] Success message stays until user dismisses
- [ ] Refresh button works
- [ ] Pull-to-refresh works
- [ ] Credits header looks better with glass card
- [ ] Credits balance animates when changed
- [ ] Haptic feedback triggers on successful purchase
- [ ] ImageProcessingView refreshes balance after purchase from CreditsPurchaseView

