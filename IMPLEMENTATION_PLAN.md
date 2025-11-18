# IAP Product CRUD Implementation Plan

## Current State Analysis
Based on comprehensive analysis of the ImageAIWraper codebase (November 2025)

### ✅ Already Implemented:
- **Database Schema**: Complete `IAPProduct` model in Prisma schema with all required fields
- **Service Layer**: `IAPService` with transaction verification, purchase processing, and product retrieval
- **Public API**: `GET /v1/iap/products` endpoint for active products
- **Basic Frontend**: Read-only IAP products page in web-cms
- **API Client**: Public API functions in `web-cms/src/api/credits.ts`
- **Data Seeding**: Sample IAP products seed script

### ❌ Missing Components:
- **Admin API Endpoints**: No CRUD operations for admin users
- **Admin Controller**: Missing controller for authenticated admin operations
- **Frontend CRUD**: No create/edit/delete functionality in web-cms
- **Admin API Client**: Missing admin API functions in frontend

## Implementation Plan - 4 Phases

### Phase 1: Backend API Implementation
**Files to create/modify:**

1. **Create Admin Controller**: `server/src/iap/iap-products-admin.controller.ts`
   - `GET /v1/admin/iap-products` - List all products (including inactive)
   - `POST /v1/admin/iap-products` - Create new product
   - `GET /v1/admin/iap-products/:productId` - Get product by ID
   - `PUT /v1/admin/iap-products/:productId` - Update product
   - `DELETE /v1/admin/iap-products/:productId` - Delete product
   - `POST /v1/admin/iap-products/:productId/activate` - Activate product
   - `DELETE /v1/admin/iap-products/:productId/activate` - Deactivate product

2. **Create DTOs**: `server/src/iap/dto/`
   - `create-iap-product.dto.ts` - Validation for creating products
   - `update-iap-product.dto.ts` - Validation for updating products
   - `iap-product-admin-response.dto.ts` - Admin response format

3. **Extend Service**: Add admin methods to `server/src/iap/iap.service.ts`
   - `listAdminProducts()` - Get all products with admin details
   - `createProduct()` - Create new product
   - `updateProduct()` - Update existing product
   - `deleteProduct()` - Soft delete product
   - `activateProduct()` / `deactivateProduct()` - Toggle status

4. **Update Module**: Register new controller in `server/src/iap/iap.module.ts`

### Phase 2: Frontend API Integration
**Files to create/modify:**

1. **Extend API Client**: `web-cms/src/api/credits.ts`
   - `getAdminIAPProducts()` - Get all products (admin view)
   - `createIAPProduct()` - Create new product
   - `updateIAPProduct()` - Update product
   - `deleteIAPProduct()` - Delete product
   - `activateIAPProduct()` / `deactivateIAPProduct()` - Toggle status

2. **Add Type Definitions**: Extend existing interfaces in `web-cms/src/api/credits.ts`
   - `IAPProductAdmin` - Extended interface with admin fields
   - `CreateIAPProductRequest` - Create product request type
   - `UpdateIAPProductRequest` - Update product request type
   - `IAPProductsAdminList` - Admin list response type

3. **Set up React Query**: Add query keys and mutations for admin operations

### Phase 3: Frontend UI Components
**Files to create/modify:**

1. **Update Main Page**: `web-cms/src/pages/IAP/IAPProductsPage.tsx`
   - Replace read-only view with full CRUD interface
   - Add filters, search, and bulk operations
   - Implement create/edit/delete functionality

2. **Create Table Component**: `web-cms/src/components/iap/IAPProductsTable.tsx`
   - Follow pattern from `TemplateTable.tsx`
   - Actions: Edit, Delete, Activate/Deactivate
   - Display drag-drop for display order
   - Status indicators and validation states

3. **Create Form Dialog**: `web-cms/src/components/iap/IAPProductFormDialog.tsx`
   - Create/Edit form with validation
   - Fields: Product ID, Name, Description, Credits, Price, Currency, Display Order
   - Real-time validation and error handling

4. **Create Filters Component**: `web-cms/src/components/iap/IAPProductsFilters.tsx`
   - Filter by active/inactive status
   - Search by name or product ID
   - Filter by credits range
   - Sort options

5. **Supporting Components**:
   - `StatusToggle.tsx` - Activate/deactivate toggle
   - `DisplayOrderDragDrop.tsx` - Drag-drop interface
   - `ProductPriceDisplay.tsx` - Price formatting component

### Phase 4: Advanced Features & Testing
**Tasks:**

1. **Bulk Operations**:
   - Select multiple products for bulk activate/deactivate
   - Bulk delete with confirmation
   - Bulk display order updates

2. **Enhanced Validation**:
   - Product ID uniqueness validation
   - Price and credits validation
   - Required field validation with helpful error messages

3. **Error Handling**:
   - Comprehensive error states and user feedback
   - Retry mechanisms for failed operations
   - Optimistic updates for better UX

4. **Testing**:
   - Backend unit tests for new endpoints
   - Frontend component tests
   - Integration tests for CRUD operations

## Technical Specifications

### Authentication & Authorization
- Use existing `BearerAuthGuard` pattern from template management
- Firebase token verification with UID attachment
- Admin endpoints require authentication

### Database Schema (Already Exists)
```prisma
model IAPProduct {
  id           String    @id @default(cuid())
  productId    String    @unique @map("product_id")
  name         String
  description  String?
  credits      Int
  price        Float?
  currency     String?
  isActive     Boolean   @default(true) @map("is_active")
  displayOrder Int       @default(0) @map("display_order")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
}
```

### API Response Format
Follow existing camelCase pattern:
- `productId`, `displayOrder`, `isActive`, `createdAt`, `updatedAt`
- Consistent with template management responses

### UI/UX Patterns
- Follow Material-UI design system
- Consistent with template management interface
- Responsive design for mobile and desktop
- Accessibility support with ARIA labels

## Implementation Timeline
- **Phase 1 (Backend)**: 2-3 days
- **Phase 2 (API Integration)**: 1-2 days
- **Phase 3 (Frontend UI)**: 3-4 days
- **Phase 4 (Testing & Polish)**: 1-2 days

**Total Estimated Time**: 7-11 days

## Dependencies & Prerequisites
- Existing Prisma schema and migrations
- Firebase Auth configuration
- Material-UI component library
- React Query for data fetching
- Existing admin authentication patterns

## Success Criteria
1. Admin users can perform full CRUD operations on IAP products
2. Interface matches existing template management UX
3. All operations include proper validation and error handling
4. Responsive design works on all device sizes
5. Comprehensive test coverage for new features