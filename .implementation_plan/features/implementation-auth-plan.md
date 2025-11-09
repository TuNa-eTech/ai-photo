# implementation-auth-plan.md

# Implementation Plan

[Overview]
Implement Google and Apple login in the iOS app using Firebase Auth, replacing the current Supabase Auth logic. Ensure the app obtains a valid Firebase ID token for all authenticated requests to the Go backend, which already verifies Firebase tokens. This will unify authentication across the system and enable seamless login with both providers.

The current iOS app uses Supabase Auth for Apple login and session management, but the backend expects Firebase ID tokens for authentication. To ensure compatibility and security, the app must migrate to Firebase Auth for both Google and Apple login. This will involve updating the authentication UI, integrating Firebase Auth SDK, and refactoring all authentication/session logic. The backend does not require changes, as it already verifies Firebase tokens.

[Types]
The type system will be updated to use Firebase Auth user/session objects.

- Replace Supabase `Session` and user types with Firebase Auth equivalents (`User`, `AuthDataResult`, etc.).
- Update all ViewModels and Views to use Firebase Auth state and user info.
- Ensure all network requests include the Firebase ID token in the Authorization header.

[Files]
The following files will be created, modified, or removed:

- **New files:**
  - `app_ios/imageaiwrapper/Utils/FirebaseAuthManager.swift`: Encapsulates Firebase Auth logic for Google/Apple login, token retrieval, and sign-out.
- **Modified files:**
  - `app_ios/imageaiwrapper/Views/AuthView.swift`: Replace Supabase Auth logic with Firebase Auth for Google and Apple login.
  - `app_ios/imageaiwrapper/ContentView.swift`: Update session management to use Firebase Auth state.
  - `app_ios/imageaiwrapper/imageaiwrapperApp.swift`: Ensure Firebase is initialized and AppDelegate is configured for Google/Apple login.
  - `app_ios/imageaiwrapper/Views/HomeView.swift`: Update sign-out logic and any user info display.
  - `app_ios/imageaiwrapper/ViewModels/HomeViewModel.swift`: Update to use Firebase Auth user/session if needed.
  - `app_ios/imageaiwrapper/ViewModels/ImageProcessingViewModel.swift`: Update to use Firebase Auth user/session and ID token for backend requests.
- **Removed files:**
  - Any Supabase-specific auth/session management code and configuration.
- **Configuration:**
  - Update Info.plist and project settings for Google Sign-In and Apple Sign-In as required by Firebase Auth.

[Functions]
Functions will be added or modified to support Firebase Auth login and session management.

- **New functions:**
  - `signInWithGoogle()` in `FirebaseAuthManager.swift`: Handles Google login flow and returns Firebase user/session.
  - `signInWithApple()` in `FirebaseAuthManager.swift`: Handles Apple login flow and returns Firebase user/session.
  - `getIDToken()` in `FirebaseAuthManager.swift`: Retrieves the current user's Firebase ID token.
  - `signOut()` in `FirebaseAuthManager.swift`: Signs out the current user.
- **Modified functions:**
  - All login, session, and sign-out logic in `AuthView`, `ContentView`, and `HomeView` to use Firebase Auth.
  - All backend requests to include the Firebase ID token in the Authorization header.
- **Removed functions:**
  - Supabase Auth login/session management functions.

[Classes]
Classes will be added or modified to support the new authentication flow.

- **New classes:**
  - `FirebaseAuthManager` (singleton or static utility) in `Utils/FirebaseAuthManager.swift`.
- **Modified classes:**
  - `AuthView`: Use FirebaseAuthManager for login.
  - `HomeViewModel`, `ImageProcessingViewModel`: Use FirebaseAuthManager for user/session and token.
- **Removed classes:**
  - Any Supabase-specific auth/session classes.

[Dependencies]
The dependency list will be updated to include Firebase Auth and Google Sign-In SDKs.

- **New dependencies:**
  - `Firebase/Auth`
  - `GoogleSignIn`
- **Removed dependencies:**
  - Supabase Auth SDK (if not used elsewhere).

[Testing]
Testing will focus on login flows, session management, and backend integration.

- Add or update unit/UI tests for AuthView and ContentView to verify Google/Apple login and sign-out.
- Test that the Firebase ID token is correctly sent to the backend and accepted.
- Test error handling for failed logins and token expiration.

[Implementation Order]
The implementation will proceed in the following order:

1. Add Firebase Auth and Google Sign-In dependencies to the iOS project.
2. Create `FirebaseAuthManager.swift` to encapsulate all Firebase Auth logic.
3. Update `imageaiwrapperApp.swift` and Info.plist for Firebase/Google/Apple login configuration.
4. Refactor `AuthView.swift` to use FirebaseAuthManager for Google and Apple login.
5. Refactor `ContentView.swift` and session management to use Firebase Auth state.
6. Update `HomeView.swift`, `HomeViewModel.swift`, and `ImageProcessingViewModel.swift` to use Firebase Auth user/session and ID token.
7. Remove Supabase Auth logic and dependencies.
8. Update or add tests for all login/session flows.
9. Validate end-to-end: login, backend requests, sign-out, and error handling.
