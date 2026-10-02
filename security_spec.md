# Firestore Security Specification & Invariants

This specification defines the Access Control & Data Invariants for Businessकर Firestore Database.

## 1. Data Invariants

1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created, read, or updated by the authenticated user whose `request.auth.uid == userId`.
2. **Tax Profile Ownership Invariant**: A tax profile at `/users/{userId}/taxProfiles/{profileId}` belongs strictly to `{userId}`. It cannot be accessed, read, or modified by any user other than `{userId}`.
3. **Identity Verification & Anti-Spoofing**: On creation and updates of `/users/{userId}/taxProfiles/{profileId}`, `incoming().userId` MUST strictly equal `request.auth.uid`.
4. **Volumetric & Type Boundaries**:
   - `userId`, `name`, `email` must be valid strings conforming to max length limits (`<= 128` chars).
   - Numerical tax values (`grossReceipts`, `cashReceipts`, `sec80C`, etc.) must be numbers.
5. **No Blanket Reads**: Blanket reads across all users or all profiles are blocked by default. No client delegation.
6. **Path Variable Hardening**: All path IDs (`userId`, `profileId`) must conform to `^[a-zA-Z0-9_\\-]+$` with size `<= 128`.

---

## 2. The "Dirty Dozen" Payloads

1. **Unauthenticated Read on User Document**: GET `/users/user_123` with `request.auth == null` -> `PERMISSION_DENIED`.
2. **Unauthenticated Write on User Document**: SET `/users/user_123` with `request.auth == null` -> `PERMISSION_DENIED`.
3. **Cross-User Profile Hijack**: User `user_abc` attempting to write to `/users/user_xyz` -> `PERMISSION_DENIED`.
4. **Cross-User Tax Data Snooping**: User `user_abc` attempting to read `/users/user_xyz/taxProfiles/current` -> `PERMISSION_DENIED`.
5. **Cross-User Tax Data Overwrite**: User `user_abc` attempting to set `/users/user_xyz/taxProfiles/current` -> `PERMISSION_DENIED`.
6. **Spoofed Owner Field in Tax Profile**: User `user_abc` setting `/users/user_abc/taxProfiles/current` with `userId: 'user_victim'` -> `PERMISSION_DENIED`.
7. **Junk/Overflow ID Path Poisoning**: Attempting write to `/users/` with a 2KB junk string ID -> `PERMISSION_DENIED`.
8. **Negative Gross Receipts Type Poisoning**: Setting `grossReceipts` to a string or invalid type -> `PERMISSION_DENIED`.
9. **Blanket Query Scraping**: Attempting a collectionGroup query on `/taxProfiles` without user filter -> `PERMISSION_DENIED`.
10. **Ghost Collection Access**: Attempting write to undeclared collection `/secretAdminKeys/1` -> `PERMISSION_DENIED`.
11. **Shadow Field Injection**: Attempting to inject system-only or arbitrary 1MB ghost fields -> `PERMISSION_DENIED`.
12. **Missing Required Fields**: Attempting to create a user profile missing required `id` or `email` -> `PERMISSION_DENIED`.

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)

The rules enforce that all operations by unauthorized or unauthenticated users, as well as mismatched path/owner operations, return `PERMISSION_DENIED`.
