# In-App Purchase Credits System Integration Plan

## Status Checklist

### Phase 1: Database & Backend Core
- [ ] 1. Database: Tạo migrations cho credits, transactions, IAP products
- [ ] 2. Backend: Install JWT library (jsonwebtoken)
- [ ] 3. Backend: Implement CreditsService (balance, deduct, add, history)
- [ ] 4. Backend: Implement IAPService (verify JWT transaction, process purchase)
- [ ] 5. Backend: Implement CreditsController và IAPController
- [ ] 6. Backend: Update ImagesService để kiểm tra và trừ credits
- [ ] 7. Backend: Update UsersService để set credits = 2 cho user mới
- [ ] 8. Backend: Seed data cho 3 IAP products mặc định
- [ ] 9. Backend: Tests cho backend (unit + E2E)

### Phase 2: iOS Integration
- [ ] 10. iOS: Implement InAppPurchaseService với StoreKit 2 (consumable products)
- [ ] 11. iOS: Implement CreditsRepository và CreditsViewModel
- [ ] 12. iOS: Tạo CreditsPurchaseView UI (list products, purchase flow)
- [ ] 13. iOS: Update ImageProcessingViewModel để kiểm tra credits
- [ ] 14. iOS: Update ImageProcessingView header để hiển thị credits balance
- [ ] 15. iOS: Update ProfileView để hiển thị credits balance
- [ ] 16. iOS: Handle insufficient credits error và điều hướng đến purchase screen
- [ ] 17. iOS: Configure StoreKit Configuration file trong Xcode scheme
- [ ] 18. iOS: Tests cho iOS (unit + UI tests)

### Phase 3: Documentation & Web CMS
- [x] 19. Swagger: Cập nhật OpenAPI spec với tất cả endpoints mới
- [x] 20. Web CMS: (Optional) IAP products management page
- [x] 21. Web CMS: (Optional) Transaction history page với filters

### Phase 4: UI/UX Improvements
- [x] 22. Fix ProductCard: Load credits from backend API instead of extracting from product name
- [x] 23. Improve success message: Let user dismiss instead of auto-clearing after 3s
- [x] 24. Add refresh button and pull-to-refresh to CreditsPurchaseView
- [x] 25. Enhance credits header in ImageProcessingView with glass card style
- [x] 26. Add animation when credits balance changes
- [x] 27. Add haptic feedback on successful purchase
- [x] 28. Auto-refresh balance in ImageProcessingView after purchase from CreditsPurchaseView

## Tổng quan

Tích hợp hệ thống In-App Purchase (IAP) với cơ chế credits để monetize ứng dụng. Mỗi user mới nhận 2 credits miễn phí, mỗi lần generate image trừ 1 credit. Khi hết credits, user được thông báo và điều hướng đến màn hình mua credits. Hỗ trợ 3 gói IAP mặc định (consumable products) với khả năng mua nhiều lần.

## Gói IAP mặc định (Đã tạo trên App Store Connect)

1. **Gói Nhỏ (Starter)**:
   - Product ID: `com.aiimagestylist.credits.starter`
   - Số credits: 10 credits
   - Giá: $0.99
   - Type: Consumable

2. **Gói Trung (Popular)**:
   - Product ID: `com.aiimagestylist.credits.popular`
   - Số credits: 50 credits
   - Giá: $4.99
   - Type: Consumable

3. **Gói Lớn (Best Value)**:
   - Product ID: `com.aiimagestylist.credits.bestvalue`
   - Số credits: 100 credits
   - Giá: $8.99
   - Type: Consumable

**StoreKit Configuration File**: `AIPhotoApp/AIPhotoApp/BokPhoto.storekit` - Đã có đầy đủ 3 products

## Receipt Verification Mechanism (StoreKit 2 + JWT)

**Cơ chế verify transaction từ StoreKit 2:**

1. **StoreKit 2 Transaction Format**:
   - StoreKit 2 sử dụng JWT (JSON Web Token) format
   - Lấy transaction data từ `Transaction.jwsRepresentation` (JWT string)
   - JWT chứa đầy đủ transaction info: transaction_id, original_transaction_id, product_id, purchase_date, etc.

2. **JWT Verification Flow**:
   - Client (iOS) gửi JWT transaction data (từ `Transaction.jwsRepresentation`) lên server
   - Server parse JWT để extract transaction_id, original_transaction_id, product_id
   - Server verify JWT signature với Apple public key (optional, có thể skip nếu cần)
   - Server kiểm tra `original_transaction_id` đã tồn tại chưa (idempotency)
   - Server thêm credits vào user account
   - Server lưu transaction vào database

3. **Idempotency**:
   - Check `original_transaction_id` trong database để tránh duplicate credits
   - Nếu transaction đã tồn tại, return success nhưng không thêm credits lại

4. **Error handling**:
   - Transaction invalid: Return error, không thêm credits
   - Transaction already processed: Return success, không thêm credits lại
   - Network error: Retry mechanism hoặc queue để xử lý sau

## Migration cho Users hiện tại

- **Tất cả users hiện tại** sẽ nhận 2 credits khi migration chạy
- Migration sẽ update tất cả existing users: `UPDATE users SET credits = 2 WHERE credits IS NULL`

## Transaction History

- Mỗi user có transaction history riêng
- Lưu tất cả transactions: purchases, usage, bonus
- API endpoint: `GET /v1/credits/transactions` với pagination

## IAP Product Type

- **Consumable Products**: User có thể mua nhiều lần, credits được cộng vào balance
- **Không cần Restore Purchases**: Vì credits đã được lưu trong database, user chỉ cần đăng nhập lại là thấy credits

## UI Credits Display

- **ImageProcessingView header**: Hiển thị số credits hiện tại (ví dụ: "Credits: 5")
- **ProfileView**: Hiển thị credits balance trong stats section
- **Error Alert**: Khi hết credits, hiển thị alert với:
  - Title: "Không đủ Credits"
  - Message: "Bạn không đủ credits. Vui lòng mua thêm để tiếp tục."
  - Button: "Mua Credits" → Điều hướng đến CreditsPurchaseView
  - Button: "Hủy"

## Cấu trúc Database

### 1. User Model - Thêm credits field
**File**: `server/prisma/schema.prisma`
- Thêm field `credits` (Int, default: 2) vào User model
- Migration: `add_credits_to_users`
- Migration script: Update tất cả existing users để set credits = 2

### 2. Transaction Model - Lưu lịch sử giao dịch
**File**: `server/prisma/schema.prisma`
- Tạo model `Transaction` với các fields:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to User)
  - `type` (enum: purchase, usage, bonus)
  - `amount` (Int, positive for purchase/bonus, negative for usage)
  - `product_id` (String?, nullable, IAP product identifier)
  - `apple_transaction_id` (String?, nullable, Apple transaction ID)
  - `apple_original_transaction_id` (String?, nullable, dùng để check idempotency)
  - `transaction_data` (String?, nullable, JWT transaction data từ StoreKit 2)
  - `status` (enum: pending, completed, failed, refunded)
  - `created_at` (DateTime)
  - `updated_at` (DateTime)
- Indexes: `user_id`, `apple_transaction_id`, `apple_original_transaction_id`, `created_at`
- Migration: `create_transactions_table`

### 3. IAP Product Model - Quản lý gói mua
**File**: `server/prisma/schema.prisma`
- Tạo model `IAPProduct` với các fields:
  - `id` (UUID, primary key)
  - `product_id` (String, unique, Apple product identifier)
  - `name` (String, tên hiển thị)
  - `description` (String?, mô tả)
  - `credits` (Int, số credits trong gói)
  - `price` (Decimal?, giá tiền - optional, có thể lấy từ Apple)
  - `currency` (String?, mã tiền tệ)
  - `is_active` (Boolean, default: true)
  - `display_order` (Int, thứ tự hiển thị)
  - `created_at` (DateTime)
  - `updated_at` (DateTime)
- Indexes: `product_id`, `is_active`
- Migration: `create_iap_products_table`

## Backend API

### 1. Credits Service
**File**: `server/src/credits/credits.service.ts`
- `getCreditsBalance(firebaseUid: string)`: Lấy số credits hiện tại
- `deductCredits(firebaseUid: string, amount: number)`: Trừ credits (với transaction log)
- `addCredits(firebaseUid: string, amount: number, productId?: string, transactionId?: string)`: Thêm credits (với transaction log)
- `checkCreditsAvailability(firebaseUid: string, amount: number)`: Kiểm tra đủ credits không
- `getTransactionHistory(firebaseUid: string, limit?: number, offset?: number)`: Lấy lịch sử giao dịch

### 2. IAP Service
**File**: `server/src/iap/iap.service.ts`
- `verifyTransaction(transactionData: string)`: Verify JWT transaction từ StoreKit 2
  - Parse JWT token từ `Transaction.jwsRepresentation`
  - Extract transaction info: transaction_id, original_transaction_id, product_id, purchase_date
  - Verify JWT signature với Apple public key (optional)
  - Return transaction details
- `processPurchase(firebaseUid: string, transactionData: string, productId: string)`: 
  - Verify transaction JWT
  - Kiểm tra transaction đã tồn tại chưa (idempotency check bằng `original_transaction_id`)
  - Lấy product info từ database
  - Thêm credits vào user account
  - Lưu transaction vào database (lưu cả JWT transaction data)
  - Return transaction info
- `getProducts()`: Lấy danh sách IAP products (active only)
- `getProductByProductId(productId: string)`: Lấy thông tin product từ database
- **Idempotency**: Check `original_transaction_id` để tránh duplicate credits
- **JWT Verification**: Sử dụng `jsonwebtoken` library để parse JWT
- **Apple Public Key**: Có thể cache Apple public keys để verify JWT signature (optional)

### 3. Credits Controller
**File**: `server/src/credits/credits.controller.ts`
- `GET /v1/credits/balance`: Lấy số credits hiện tại
- `GET /v1/credits/transactions`: Lấy lịch sử giao dịch (với pagination)
- `POST /v1/credits/purchase`: Xử lý purchase (verify JWT + add credits)

### 4. IAP Controller
**File**: `server/src/iap/iap.controller.ts`
- `GET /v1/iap/products`: Lấy danh sách products (public, active only)

### 5. Update Images Service
**File**: `server/src/images/images.service.ts`
- Thêm dependency: `CreditsService`
- **Kiểm tra credits trước khi process**:
  - Check credits balance >= 1
  - Throw `ForbiddenException` nếu không đủ credits (code: 'insufficient_credits')
- **Trừ 1 credit sau khi process thành công**:
  - Gọi `creditsService.deductCredits(firebaseUid, 1)`
  - Lưu transaction với type 'usage'
- **Error handling**:
  - `insufficient_credits`: Return 403 với message rõ ràng
  - Nếu process image fail, không trừ credits (rollback)

### 6. Update Users Service
**File**: `server/src/users/users.service.ts`
- Khi tạo user mới, set `credits = 2`
- Thêm `credits` vào `UserResponseDto`

### 7. DTOs
**Files**: `server/src/credits/dto/`, `server/src/iap/dto/`
- `CreditsBalanceResponseDto`: `{ credits: number }`
- `TransactionHistoryResponseDto`: `{ transactions: Transaction[], meta: { total, limit, offset } }`
- `PurchaseRequestDto`: `{ transaction_data: string, product_id: string }` (transaction_data là JWT string từ StoreKit 2)
- `PurchaseResponseDto`: `{ transaction_id: string, credits_added: number, new_balance: number }`
- `IAPProductResponseDto`: `{ id, product_id, name, description, credits, price, currency, display_order }`
- `IAPProductsListResponseDto`: `{ products: IAPProductResponseDto[] }`
- `TransactionDto`: `{ id, type, amount, product_id, status, created_at }`

## iOS App (SwiftUI)

### 1. StoreKit 2 Integration
**File**: `AIPhotoApp/AIPhotoApp/Services/InAppPurchaseService.swift`
- Sử dụng StoreKit 2 (`import StoreKit`)
- `loadProducts(productIds: [String])`: Load products từ Apple (consumable products)
- `purchase(product: Product)`: Mua product và gửi transaction data lên server
  - Sau khi purchase thành công, lấy `Transaction.jwsRepresentation` (JWT string)
  - Gửi JWT string lên server để verify và add credits
- `checkTransactionStatus()`: Kiểm tra transaction status (optional, vì credits đã lưu trong DB)
- `@Published var products: [Product]`
- **Không cần restorePurchases**: Vì credits đã lưu trong database
- **Receipt Data Format**: Sử dụng `Transaction.jwsRepresentation` (JWT string)

### 2. Credits Repository
**File**: `AIPhotoApp/AIPhotoApp/Repositories/CreditsRepository.swift`
- Protocol: `CreditsRepositoryProtocol`
- `getCreditsBalance()`: Lấy số credits
- `getTransactionHistory(limit: Int, offset: Int)`: Lấy lịch sử
- `purchaseCredits(transactionData: String, productId: String)`: Gửi JWT transaction data lên server
  - `transactionData`: JWT string từ `Transaction.jwsRepresentation`

### 3. Credits ViewModel
**File**: `AIPhotoApp/AIPhotoApp/ViewModels/CreditsViewModel.swift`
- `@Observable final class CreditsViewModel`
- `var creditsBalance: Int = 0`
- `var products: [Product] = []`
- `var isLoading: Bool = false`
- `var isPurchasing: Bool = false`
- `func loadProducts()`: Load products từ Apple StoreKit
- `func purchaseProduct(_ product: Product)`: Mua product, gửi JWT lên server, refresh balance
- `func refreshCreditsBalance()`: Lấy credits balance từ server
- **Không cần restorePurchases**: Vì credits đã lưu trong database

### 4. Update ImageProcessingViewModel
**File**: `AIPhotoApp/AIPhotoApp/ViewModels/ImageProcessingViewModel.swift`
- Kiểm tra credits trước khi process (gọi API để check balance)
- Nếu không đủ credits: Hiển thị alert với nút "Mua Credits" → mở CreditsPurchaseView
- Error message: "Bạn không đủ credits. Vui lòng mua thêm để tiếp tục."

### 5. Credits Purchase View
**File**: `AIPhotoApp/AIPhotoApp/Views/Credits/CreditsPurchaseView.swift`
- Hiển thị danh sách products
- Hiển thị số credits hiện tại
- Nút mua cho mỗi product
- Loading state khi đang purchase
- Success/error handling
- Glass design matching app theme

### 6. Update Profile View
**File**: `AIPhotoApp/AIPhotoApp/Views/Home/ProfileView.swift`
- Hiển thị số credits hiện tại trong stats section (StatCard)
- Button để mở CreditsPurchaseView
- Refresh credits balance khi view appear

### 7. Update ImageProcessingView
**File**: `AIPhotoApp/AIPhotoApp/Views/ImageProcessing/ImageProcessingView.swift`
- **Header**: Hiển thị số credits hiện tại (ví dụ: "Credits: 5")
- Kiểm tra credits trước khi process (trong ImageProcessingViewModel)
- Nếu không đủ credits: Hiển thị alert với:
  - Title: "Không đủ Credits"
  - Message: "Bạn không đủ credits. Vui lòng mua thêm để tiếp tục."
  - Button: "Mua Credits" → Điều hướng đến CreditsPurchaseView
  - Button: "Hủy"
- Refresh credits balance khi view appear

### 8. Update AppConfig
**File**: `AIPhotoApp/AIPhotoApp/Utilities/Constants/AppConfig.swift`
- Thêm API paths: `/v1/credits/balance`, `/v1/credits/purchase`, `/v1/credits/transactions`, `/v1/iap/products`

### 9. StoreKit Configuration
**File**: `AIPhotoApp/AIPhotoApp/BokPhoto.storekit`
- Đã có đầy đủ 3 products
- Cần configure trong Xcode scheme để sử dụng cho testing:
  - Edit Scheme → Run → Options → StoreKit Configuration → Chọn "BokPhoto.storekit"

## Web CMS (Optional)

### 1. IAP Products Management
**File**: `web-cms/src/pages/IAPProducts/IAPProductsPage.tsx`
- Danh sách IAP products
- CRUD operations (create, update, delete)
- Enable/disable products
- Xem transaction statistics

### 2. Transaction History
**File**: `web-cms/src/pages/Transactions/TransactionsPage.tsx`
- Danh sách transactions
- Filters: user, product, status, date range
- Export to CSV

## Swagger Documentation

### 1. Update OpenAPI Spec
**File**: `swagger/openapi.yaml`
- Thêm endpoints:
  - `GET /v1/credits/balance`
  - `GET /v1/credits/transactions`
  - `POST /v1/credits/purchase`
  - `GET /v1/iap/products`
- Thêm schemas:
  - `CreditsBalanceResponse`
  - `TransactionHistoryResponse`
  - `PurchaseRequest`
  - `PurchaseResponse`
  - `IAPProductResponse`

## Testing

### 1. Backend Tests
- Unit tests: CreditsService, IAPService
- E2E tests: Credits endpoints, IAP endpoints
- Mock JWT transaction verification (mock JWT tokens cho testing)
- Mock Apple public keys để verify JWT signature

### 2. iOS Tests
- Unit tests: InAppPurchaseService, CreditsViewModel
- UI tests: CreditsPurchaseView, purchase flow
- Mock StoreKit products cho testing (sử dụng StoreKit Configuration File)
- Mock JWT transaction data cho testing

## Dependencies

### Backend
- `jsonwebtoken`: Parse và verify JWT tokens từ StoreKit 2
- `@types/jsonwebtoken`: Type definitions (dev dependency)

### iOS
- StoreKit 2: Đã có trong iOS SDK (không cần cài thêm)
- StoreKit Configuration File: Đã có (`BokPhoto.storekit`)

## Environment Variables (Backend)
- `APPLE_SHARED_SECRET`: (Optional) Apple Shared Secret - không cần cho JWT verification, nhưng giữ lại cho tương lai

## IAP Product IDs (iOS)
- `com.aiimagestylist.credits.starter` (10 credits)
- `com.aiimagestylist.credits.popular` (50 credits)
- `com.aiimagestylist.credits.bestvalue` (100 credits)

**Lưu ý**: Product IDs đã được tạo trên App Store Connect và match với StoreKit Configuration file.

## Lưu ý quan trọng
- Apple IAP yêu cầu test trên device thật hoặc sandbox environment
- StoreKit Configuration file (`BokPhoto.storekit`) cần được configure trong Xcode scheme để test local
- JWT verification có thể skip signature verification nếu cần (chỉ parse JWT để lấy transaction details)
- Cần handle các edge cases: network errors, payment failures, refunds
- Cần implement idempotency cho purchase requests để tránh duplicate credits
- Consumable products không cần restore purchases (credits đã lưu trong DB)
- Credits balance được lưu trong database, không phụ thuộc vào device
- Migration sẽ update tất cả existing users để set credits = 2

## Implementation Notes

### JWT Verification Strategy
- **Option 1**: Parse JWT và verify signature với Apple public keys (secure, recommended)
- **Option 2**: Parse JWT chỉ để lấy transaction details, không verify signature (faster, less secure)
- **Recommendation**: Bắt đầu với Option 2 (parse only), sau đó có thể thêm signature verification nếu cần

### StoreKit Configuration File
- File đã có: `AIPhotoApp/AIPhotoApp/BokPhoto.storekit`
- Cần configure trong Xcode scheme:
  1. Edit Scheme (Product → Scheme → Edit Scheme)
  2. Run → Options
  3. StoreKit Configuration → Chọn "BokPhoto.storekit"
  4. Apply

### Migration Strategy
- Migration sẽ:
  1. Thêm `credits` field vào User model (default: 2)
  2. Update tất cả existing users: `UPDATE users SET credits = 2 WHERE credits IS NULL`
  3. Tạo Transaction model
  4. Tạo IAPProduct model
  5. Seed 3 IAP products mặc định

## Files to Create/Modify

### Backend
- `server/prisma/schema.prisma` - Add credits, Transaction, IAPProduct models
- `server/prisma/migrations/` - Migration files
- `server/src/credits/` - New module
- `server/src/iap/` - New module
- `server/src/images/images.service.ts` - Update to check credits
- `server/src/users/users.service.ts` - Update to set credits = 2
- `server/package.json` - Add jsonwebtoken dependency

### iOS
- `AIPhotoApp/AIPhotoApp/Services/InAppPurchaseService.swift` - New file
- `AIPhotoApp/AIPhotoApp/Repositories/CreditsRepository.swift` - New file
- `AIPhotoApp/AIPhotoApp/ViewModels/CreditsViewModel.swift` - New file
- `AIPhotoApp/AIPhotoApp/Views/Credits/CreditsPurchaseView.swift` - New file
- `AIPhotoApp/AIPhotoApp/ViewModels/ImageProcessingViewModel.swift` - Update
- `AIPhotoApp/AIPhotoApp/Views/ImageProcessing/ImageProcessingView.swift` - Update
- `AIPhotoApp/AIPhotoApp/Views/Home/ProfileView.swift` - Update
- `AIPhotoApp/AIPhotoApp/Utilities/Constants/AppConfig.swift` - Update
- `AIPhotoApp/AIPhotoApp.xcodeproj/` - Configure StoreKit Configuration file

### Documentation
- `swagger/openapi.yaml` - Update with new endpoints

