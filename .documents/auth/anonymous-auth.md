# Anonymous Authentication

## Overview

Anonymous Authentication allows users to explore the app's core features (processing images) without immediately creating an account. This improves conversion rates and complies with Apple's App Store Guideline 5.1.1.

## Architecture

The implementation uses a hybrid approach combining Firebase Anonymous Auth with custom backend logic for device tracking and user migration.

### Key Components

1.  **Firebase Auth**: Handles the initial anonymous session creation on the client.
2.  **Backend (NestJS)**:
    *   Detects anonymous tokens via `BearerAuthGuard`.
    *   Enforces "One Anonymous Account Per Device" policy using `X-Device-ID`.
    *   Handles "Lazy Creation" of user records in Postgres.
    *   Supports "UID Migration" to restore accounts after app reinstall.
3.  **Database (Postgres)**:
    *   `users` table extended with `is_anonymous`, `device_id`, `first_seen_at`.
    *   `device_id` is unique for anonymous users to prevent abuse.

## User Flow

### 1. Initial Sign-In (Skip)
1.  User taps "Skip & Try as Guest" on Landing Screen.
2.  **Client**:
    *   Calls `Auth.auth().signInAnonymously()`.
    *   Calls `POST /users/register` with:
        *   `Authorization: Bearer <anonymous_token>`
        *   `X-Device-ID: <device_uuid>`
        *   Body: `{ name: "Guest User", email: "" }`
3.  **Backend**:
    *   Detects `isAnonymous = true` from token.
    *   Checks if `device_id` already has an anonymous account.
    *   **If New**: Creates user `Guest XXXX` (last 4 chars of deviceID) with **1 Free Credit**.
    *   **If Exists**: Returns existing user (prevents credit farming).
4.  **Result**: User is logged in and can process 1 image.

### 2. App Reinstall (Migration)
1.  User deletes app and reinstalls.
2.  User taps "Skip & Try as Guest".
3.  **Client**:
    *   Firebase generates a **NEW** UID (e.g., `DEF456`).
    *   Calls `POST /users/register` with new token + same `X-Device-ID`.
4.  **Backend**:
    *   Finds existing anonymous user by `device_id` (e.g., UID `ABC123`).
    *   **Migration**: Updates `firebase_uid` from `ABC123` -> `DEF456`.
    *   Returns the **OLD** user record.
5.  **Result**: User restores their previous credits and history.

### 3. Conversion to Real Account
1.  User goes to Profile or tries to buy credits.
2.  User taps "Sign In".
3.  **Client**:
    *   Logs out anonymous session.
    *   Presents Login/Register screen.
4.  **Future Work**: We plan to support "Link Account" to merge anonymous data into the new real account.

## API Endpoints

### `POST /v1/users/register`

Handles both real and anonymous registration.

**Headers:**
*   `Authorization`: Bearer Token
*   `X-Device-ID`: UUID String (Required for anonymous)

**Body:**
```json
{
  "name": "Guest User",
  "email": "" // Empty for anonymous
}
```

**Logic:**
*   If `token.sign_in_provider == 'anonymous'`:
    *   Delegate to `getOrCreateAnonymousUser`.
    *   Enforce device limit / Perform migration.
*   Else:
    *   Standard upsert logic.

## Database Schema

```prisma
model User {
  id            String    @id @default(uuid())
  firebaseUid   String    @unique @map("firebase_uid")
  // ... standard fields
  
  // Anonymous Auth Fields
  isAnonymous   Boolean   @default(false) @map("is_anonymous")
  deviceId      String?   @map("device_id") // Indexed
  firstSeenAt   DateTime  @default(now()) @map("first_seen_at")
  
  @@index([deviceId])
}
```
