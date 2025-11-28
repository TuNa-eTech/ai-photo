# Image Processing Flow After Earning Credits

## Overview
This document explains the improved user flow after earning credits from rewarded ads or IAP purchases.

## Previous Flow (Bad UX ❌)
1. Select Template → Upload Photo → Out of Credits
2. Navigate to `InsufficientCreditsView`
3. User watches ad → Earns credits
4. **Auto-dismiss to Home screen**
5. User has to start over from step 1

## New Flow (Better UX ✅)
1. Select Template → Upload Photo → Out of Credits
2. Navigate to `InsufficientCreditsView`
3. User watches ad → Earns credits
4. **Show "Credits Added! Returning to processing..." overlay** (1 second)
5. **Auto-dismiss to `ImageProcessingView`**
6. **Automatically retry image processing**
7. Navigate to `ResultView` when complete

## Technical Implementation

### 1. InsufficientCreditsView Changes
**File**: `/AIPhotoApp/Views/ImageProcessing/InsufficientCreditsView.swift`

**Changes**:
- Added `showReturningOverlay` state variable
- Created `returningToProcessingOverlay` view with success checkmark and message
- Modified `creditsBalanceUpdated` handler to:
  - Set `showReturningOverlay = true`
  - Wait 1000ms (allowing user to see the overlay)
  - Dismiss view to return to `ImageProcessingView`
- Overlay shows "Credits Added! Returning to processing..." with animated checkmark and progress indicator

### 2. ImageProcessingView Logic
**File**: `/AIPhotoApp/Views/ImageProcessing/ImageProcessingView.swift`

**Existing logic** (no changes needed):
- Line 63-65: Listens to `creditsBalanceUpdated` notification
- Line 163-175: `handleCreditsBalanceUpdate()` function:
  - Refreshes credits balance
  - Checks if processing state is `.failed(.insufficientCredits)`
  - If credits > 0, automatically retries `processImage()`

### 3. CreditsPurchaseView Changes
**File**: `/AIPhotoApp/Views/Credits/CreditsPurchaseView.swift`

**Changes**:
- Modified success alert handler to auto-dismiss the view after user taps "OK"
- This ensures the IAP purchase flow is consistent with the rewarded ad flow
- When dismissed, the parent `InsufficientCreditsView` can show the overlay and trigger retry

### 4. Flow Sequence

#### A. Rewarded Ad Flow

```
┌─────────────────────────┐
│ User clicks "Watch Ad"  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Rewarded ad shown       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ CreditsViewModel        │
│ .watchRewardedAd()      │
│ - Posts notification    │
│ - Sets successMessage   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ InsufficientCreditsView receives    │
│ creditsBalanceUpdated notification  │
│ - Shows overlay (1s)                │
│ - Dismisses view                    │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ ImageProcessingView receives        │
│ creditsBalanceUpdated notification  │
│ - Refreshes balance                 │
│ - Checks if previous error was      │
│   insufficientCredits               │
│ - Automatically retries processing  │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│ Processing succeeds     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Navigate to ResultView  │
└─────────────────────────┘
```

#### B. IAP Purchase Flow

```
┌─────────────────────────┐
│ User clicks "Buy"       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ CreditsPurchaseView     │
│ opens as sheet          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ User selects package    │
│ and completes purchase  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ CreditsViewModel        │
│ .purchaseProduct()      │
│ - Posts notification    │
│ - Sets successMessage   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Success alert shown     │
│ User taps "OK"          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ CreditsPurchaseView     │
│ dismisses               │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ InsufficientCreditsView receives    │
│ creditsBalanceUpdated notification  │
│ - Shows overlay (1s)                │
│ - Dismisses view                    │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ ImageProcessingView receives        │
│ creditsBalanceUpdated notification  │
│ - Refreshes balance                 │
│ - Checks if previous error was      │
│   insufficientCredits               │
│ - Automatically retries processing  │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│ Processing succeeds     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Navigate to ResultView  │
└─────────────────────────┘
```

## Key Points

1. **Notification-based coordination**: Both flows use `creditsBalanceUpdated` notification
2. **Visual feedback**: 1-second overlay shows "Credits Added! Returning to processing..."
3. **Consistent behavior**: Both rewarded ad and IAP purchase follow the same retry flow
4. **Smart retry**: Only retries if previous error was `insufficientCredits`
5. **No manual intervention**: Entire flow is automatic after earning credits
6. **Sheet handling**: IAP purchase sheet auto-dismisses after success

## Testing Checklist

### Rewarded Ad Flow
- [ ] Select template and upload photo with 0 credits
- [ ] Verify `InsufficientCreditsView` appears with correct message
- [ ] Tap "Watch Ad" button
- [ ] Complete rewarded ad (watch to the end)
- [ ] Verify loading overlay appears during ad
- [ ] Verify success message appears after ad completion
- [ ] Verify "Credits Added! Returning to processing..." overlay shows (1s)
- [ ] Verify `InsufficientCreditsView` dismisses automatically
- [ ] Verify image processing starts automatically in background
- [ ] Verify navigation to `ResultView` when processing completes
- [ ] Verify processed image is displayed correctly

### IAP Purchase Flow
- [ ] Select template and upload photo with 0 credits
- [ ] Verify `InsufficientCreditsView` appears with correct message
- [ ] Tap "Buy Credits" button
- [ ] Verify `CreditsPurchaseView` opens as sheet
- [ ] Select a credits package
- [ ] Complete purchase (or use sandbox testing)
- [ ] Verify success alert appears
- [ ] Tap "OK" on success alert
- [ ] Verify `CreditsPurchaseView` sheet dismisses
- [ ] Verify "Credits Added! Returning to processing..." overlay shows (1s)
- [ ] Verify `InsufficientCreditsView` dismisses automatically
- [ ] Verify image processing starts automatically in background
- [ ] Verify navigation to `ResultView` when processing completes
- [ ] Verify processed image is displayed correctly

### Edge Cases
- [ ] Test canceling rewarded ad (should NOT retry, should NOT show overlay)
- [ ] Test canceling IAP purchase (should NOT retry, should NOT show overlay)
- [ ] Test tapping back button from `InsufficientCreditsView` without earning credits
- [ ] Test with slow network (ensure notification handling is robust)
- [ ] Test rapid successive purchases (ensure no race conditions)
- [ ] Test app backgrounding during overlay display
- [ ] Verify credits balance updates correctly in all scenarios

