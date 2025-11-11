# Triển khai Rewarded Ads AdMob cho iOS App

## Mục tiêu
- Khi user hết credit, hiển thị sheet/modal với 2 options:
  - Xem quảng cáo để được tặng 1 credit (rewarded ads)
  - Mua thêm credits bằng IAP
- App verify việc xem ads hoàn thành và gọi backend API để cộng credit

## Status: ✅ COMPLETED

## Implementation Checklist

### Backend
- [x] Tạo endpoint `POST /v1/credits/reward` trong `CreditsController`
- [x] Tạo method `addRewardCredit()` trong `CreditsService` với `TransactionType.bonus`
- [x] Tạo DTOs: `RewardRequestDto`, `RewardResponseDto`
- [x] Cập nhật Swagger documentation với endpoint và schemas

### iOS
- [x] Tạo `RewardedAdsService` với protocol `RewardedAdsServiceProtocol`
- [x] Sử dụng `RewardedAd` (Google Mobile Ads SDK mới) với `AdsConfig.rewardedAdsID`
- [x] Verify ads qua callback `rewardedAdDidEarnReward`
- [x] Preload ad khi service được khởi tạo
- [x] Cập nhật `CreditsRepository` với method `addRewardCredit()`
- [x] Thêm models: `RewardCreditRequest`, `RewardCreditResponse`
- [x] Cập nhật `CreditsViewModel` với method `watchRewardedAd()`
- [x] Inject `RewardedAdsServiceProtocol` vào `CreditsViewModel`
- [x] Tạo `InsufficientCreditsSheet` với 2 options rõ ràng (Xem quảng cáo, Mua Credits)
- [x] Design theo Liquid Glass Beige theme
- [x] Loading overlay khi đang load/show ad
- [x] Cập nhật `ImageProcessingView` để sử dụng sheet thay vì alert
- [x] Cập nhật `AppConfig` với API path `creditsReward`

### Testing (Optional - can be done later)
- [ ] Unit tests cho RewardedAdsService
- [ ] Unit tests cho CreditsViewModel.watchRewardedAd()
- [ ] Backend unit tests cho reward endpoint
- [ ] Manual testing: Test flow hết credit → xem ad → cộng credit
- [ ] Manual testing: Test flow hết credit → mua IAP (existing flow)

## Files Created/Modified

### Backend
**Created:**
- `server/src/credits/dto/reward-request.dto.ts`
- `server/src/credits/dto/reward-response.dto.ts`

**Modified:**
- `server/src/credits/credits.controller.ts` - Added `POST /v1/credits/reward` endpoint
- `server/src/credits/credits.service.ts` - Added `addRewardCredit()` method
- `server/src/credits/dto/index.ts` - Exported new DTOs
- `swagger/openapi.yaml` - Added endpoint documentation and schemas

### iOS
**Created:**
- `AIPhotoApp/AIPhotoApp/Services/RewardedAdsService.swift` - Rewarded ads service with protocol
- `AIPhotoApp/AIPhotoApp/Views/ImageProcessing/InsufficientCreditsSheet.swift` - Sheet with 2 options

**Modified:**
- `AIPhotoApp/AIPhotoApp/Repositories/CreditsRepository.swift` - Added `addRewardCredit()` method and models
- `AIPhotoApp/AIPhotoApp/ViewModels/CreditsViewModel.swift` - Added `watchRewardedAd()` method and injected `RewardedAdsServiceProtocol`
- `AIPhotoApp/AIPhotoApp/Views/ImageProcessing/ImageProcessingView.swift` - Replaced alert with sheet
- `AIPhotoApp/AIPhotoApp/Utilities/Constants/AppConfig.swift` - Added `creditsReward` API path

## Implementation Details

### Backend API
- **Endpoint:** `POST /v1/credits/reward`
- **Request Body:** `{ source?: string }` (optional, defaults to "rewarded_ad")
- **Response:** `{ credits_added: 1, new_balance: number }`
- **Transaction Type:** `TransactionType.bonus`
- **Authentication:** Required (Bearer token)

### iOS RewardedAdsService
- **Protocol:** `RewardedAdsServiceProtocol` for testability
- **Ad Unit ID:** `AdsConfig.rewardedAdsID`
- **Ad Type:** `RewardedAd` (Google Mobile Ads SDK mới, thay thế `GADRewardedAd`)
- **Verification:** Uses `rewardedAdDidEarnReward` callback from `FullScreenContentDelegate`
- **API Changes:** 
  - Load: `RewardedAd.load(with:request:)`
  - Present: `ad.present(from:_:)`
- **Preloading:** Ad is preloaded when service is initialized
- **Error Handling:** Handles ad not loaded, presentation failed, user cancelled

### UI Flow
1. User runs out of credits → `InsufficientCreditsSheet` is presented
2. User selects "Xem quảng cáo":
   - Loading overlay appears
   - Ad is loaded if not already loaded
   - Ad is presented
   - On completion, API is called to add 1 credit
   - Balance is refreshed and sheet auto-dismisses
3. User selects "Mua Credits":
   - Sheet dismisses
   - `CreditsPurchaseView` is presented

## Notes
- AdMob SDK đã được khởi tạo trong `AIPhotoAppApp.swift`
- Ad Unit ID đã có trong `AdsConfig.swift` (`rewardedAdsID`)
- Backend không verify ads, chỉ nhận request từ app và cộng credit
- App verify ads completion qua AdMob SDK callback `rewardedAdDidEarnReward`
- Transaction được tạo với `TransactionType.bonus` để tracking
- Auto-refresh balance across screens using `NotificationCenter` (`.creditsBalanceUpdated`)
- **Updated:** Migration sang Google Mobile Ads SDK mới:
  - `GADRewardedAd` → `RewardedAd`
  - `GADRequest` → `Request`
  - `GADFullScreenContentDelegate` → `FullScreenContentDelegate`
  - `GADAdReward` → `AdReward`
  - `GADFullScreenPresentingAd` → `FullScreenPresentingAd`
  - `RewardedAd.load(withAdUnitID:request:)` → `RewardedAd.load(with:request:)`
  - `ad.present(fromRootViewController:_:)` → `ad.present(from:_:)`

## Next Steps (Optional)
- Add unit tests for RewardedAdsService
- Add unit tests for CreditsViewModel.watchRewardedAd()
- Add backend unit tests for reward endpoint
- Manual testing on device with real ads
- Consider rate limiting for reward requests (e.g., max 1 per hour)

