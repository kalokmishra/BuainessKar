# 🔐 Modular Database & Authentication Guide (Firebase, Firestore & Provider Switching)

This guide documents the modular database and authentication architecture implemented in **Businessकर**, how Firebase Authentication and Cloud Firestore operate, security and data integrity invariants, and step-by-step instructions for switching to another provider (such as Supabase, PostgreSQL, Appwrite, or custom REST APIs) in the future.

---

## 1. Modular Architecture Overview

To fulfill the requirement:
> *"add database and auth using firestore and firebase. make it modular so that i can switch to another provider in future as required"*

The application implements the **Dependency Inversion Principle (DIP)**. The user interface (`LoginModal.tsx`, `Header.tsx`, `AuthContext.tsx`, `TaxDataContext.tsx`) does **not** import Firebase SDK directly. Instead, it interacts exclusively with high-level TypeScript interfaces:

- **`IAuthService`** (`src/services/types.ts`): Contract for authentication operations (sign in with Google, sign in with credentials, sign up, sign out, password reset, and auth state observer).
- **`IDatabaseService`** (`src/services/types.ts`): Contract for data persistence (fetch user profile, save user profile, fetch tax data, save tax data, and real-time tax data subscription).

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend & UI Layer                    │
│   (AuthContext, TaxDataContext, LoginModal, Header, etc.)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                Calls Abstract Interfaces Only
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Service Registry (`src/services/index.ts`)      │
│   • authService: IAuthService                               │
│   • databaseService: IDatabaseService                       │
│   • Switchers: setAuthProvider(...), setDatabaseProvider(..) │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        Active Provider:                Active Provider:
          "firebase"                       "local" / "supabase"
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│   Firebase Implementation    │ │    Alternative Provider     │
│   • FirebaseAuthService      │ │   • LocalAuthService        │
│     (Google Popup + Auth)    │ │   • LocalDatabaseService    │
│   • FirestoreDatabaseService │ │   • (Future: Supabase, SQL) │
│     (Cloud Firestore Docs)   │ │                             │
└──────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Directory Layout & Key Files

| File Path | Description |
|---|---|
| `src/services/types.ts` | Abstract TypeScript interfaces: `IAuthService`, `IDatabaseService`, `UserProfile`, `AuthCredentials`, `SignUpData`. |
| `src/services/index.ts` | Central Service Registry holding singleton instances of `authService` and `databaseService`, plus runtime switcher functions `setAuthProvider()` and `setDatabaseProvider()`. |
| `src/services/firebase/firebaseConfig.ts` | Firebase app initialization (`initializeApp`), auth instance (`getAuth`), Firestore instance (`getFirestore`), connection validator (`testConnection`), and standardized error handling (`handleFirestoreError`). |
| `src/services/firebase/firebaseAuthService.ts` | Concrete `IAuthService` implementation using Firebase Auth (Google Sign-In via `signInWithPopup`, email/mobile credential handling, state listener). |
| `src/services/firebase/firestoreDatabaseService.ts` | Concrete `IDatabaseService` implementation using Cloud Firestore (`/users/{userId}` and `/users/{userId}/taxProfiles/current`). |
| `src/services/local/localAuthService.ts` | Standalone local storage authentication provider (supports offline demo accounts and credential accounts without cloud dependencies). |
| `src/services/local/localDatabaseService.ts` | Standalone local storage database provider (instant offline persistence using namespaced `localStorage` keys). |
| `firebase-blueprint.json` | Declarative entity catalog and schema blueprint defining `UserProfile` and `TaxProfile` document structures, types, and constraints. |
| `security_spec.md` | Security specification detailing data invariants, access rules, and the "Dirty Dozen" penetration/malformed payload test scenarios. |
| `firestore.rules` | Production-grade security rules enforcing default-deny, strict path-variable validation, owner authentication checks, and schema integrity. |
| `firebase-applet-config.json` | Project-specific Firebase configuration provisions (projectId, appId, apiKey, authDomain). |

---

## 3. How Firebase & Firestore Work in Businessकर

### A. Authentication Flow (Google Sign-In & Credentials)
1. **Google 1-Click Sign-In**:
   - The user clicks **"Sign In with Google"** in `LoginModal.tsx`.
   - `authService.signInWithGoogle()` executes `signInWithPopup(auth, googleProvider)`.
   - Upon successful OAuth authentication, the Firebase user object is transformed into a clean `UserProfile`:
     ```typescript
     {
       id: firebaseUser.uid,
       name: firebaseUser.displayName || 'Google User',
       email: firebaseUser.email,
       identifier: firebaseUser.email,
       photoURL: firebaseUser.photoURL,
       provider: 'firebase',
       createdAt: new Date().toISOString()
     }
     ```
   - The profile is automatically persisted to Firestore at `/users/{userId}`.
2. **Email & Mobile Sign-In**:
   - Users can sign up or log in using an Email address or a 10-digit Indian Mobile number.
   - Credentials are authenticated through the active `authService`.
3. **Session Persistence & Real-Time Observer**:
   - `onAuthStateChanged` listens for auth state changes and restores the active session automatically across page reloads.

### B. Cloud Firestore Data Synchronization Flow
1. **User Profile Document** (`/users/{userId}`):
   - Stores user metadata: `id`, `name`, `email`, `identifier`, `provider`, `updatedAt`.
2. **Tax Profile Document** (`/users/{userId}/taxProfiles/current`):
   - Stores the complete financial state (`TaxDataPayload`):
     - Entity type (`INDIVIDUAL`, `PROFESSIONAL_44ADA`, etc.)
     - Gross receipts, digital receipts, cash receipts
     - Salary, Standard Deduction, HRA, LTA
     - Capital Gains (STCG 111A, LTCG 112A, LTCG 112)
     - Deductions under Chapter VI-A (80C, 80D, 80CCD(1B) NPS)
     - Selected tax regime (`new` vs `old`)
     - Onboarding status
3. **Automatic Real-Time Sync**:
   - When a user logs in, `TaxDataContext` loads their saved cloud data from Firestore.
   - When any numbers are edited (or when the AI Tax Copilot applies an entry), changes are immediately saved to Firestore.
   - If network connectivity is lost, the local cache seamlessly protects the user's workflow without interrupting calculations.

---

## 4. Firestore Security Rules (`firestore.rules`)

The deployed rules implement strict access control:

1. **Global Safety Net**: Default-deny all document paths (`match /{document=**} { allow read, write: if false; }`).
2. **Owner-Only Read & Write**: A user can only access `/users/{userId}` if `request.auth != null && request.auth.uid == userId`.
3. **Sub-Collection Isolation**: `/users/{userId}/taxProfiles/{profileId}` can only be accessed by the authenticated user `{userId}`.
4. **Anti-Spoofing & Invariant Enforcement**:
   - Writes must include `request.resource.data.userId == request.auth.uid`.
   - Immutable fields (`id`, `userId`, `createdAt`) cannot be changed after creation.
   - Path variables must match regex `^[a-zA-Z0-9_\-]+$` and length `<= 128`.
5. **No Client Query Delegation**: Collection-group scraping or blanket queries without user constraints are forbidden.

---

## 5. How to Switch to Another Provider in the Future

Because the app is built on abstract interfaces (`IAuthService` and `IDatabaseService`), switching to another provider (such as **Supabase**, **PostgreSQL / Prisma**, **Appwrite**, or a **Custom REST / GraphQL API**) requires **zero changes** to your UI components.

### Step-by-Step Provider Switch Example (e.g. Supabase)

#### Step 1: Create the Supabase Service Classes
Create `src/services/supabase/supabaseAuthService.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import { IAuthService, UserProfile, AuthCredentials, SignUpData } from '../types';

const supabase = createClient('https://xyz.supabase.co', 'public-anon-key');

export class SupabaseAuthService implements IAuthService {
  async signInWithGoogle(): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
    // Map Supabase user to UserProfile interface
    return {
      id: data.user.id,
      name: data.user.user_metadata.full_name || 'User',
      email: data.user.email,
      provider: 'supabase',
      createdAt: new Date().toISOString()
    };
  }

  async signInWithCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.identifier,
      password: credentials.password
    });
    if (error) throw error;
    return {
      id: data.user.id,
      name: data.user.user_metadata.full_name || 'User',
      email: data.user.email,
      provider: 'supabase',
      createdAt: new Date().toISOString()
    };
  }

  // Implement signUpWithCredentials, signOut, onAuthStateChanged, resetPassword...
}
```

Create `src/services/supabase/supabaseDatabaseService.ts`:
```typescript
import { IDatabaseService, UserProfile } from '../types';
import { TaxDataState } from '../../context/TaxDataContext';

export class SupabaseDatabaseService implements IDatabaseService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single();
    return data;
  }

  async saveTaxData(userId: string, data: Partial<TaxDataState>): Promise<void> {
    await supabase.from('tax_profiles').upsert({ user_id: userId, data });
  }

  // Implement saveUserProfile, getTaxData, subscribeToTaxData...
}
```

#### Step 2: Register the New Provider in `src/services/index.ts`
Simply import the new service and add it to the provider switch statement:
```typescript
import { SupabaseAuthService } from './supabase/supabaseAuthService';
import { SupabaseDatabaseService } from './supabase/supabaseDatabaseService';

export function setAuthProvider(type: 'firebase' | 'local' | 'supabase') {
  if (type === 'supabase') {
    activeAuthService = new SupabaseAuthService();
  } else if (type === 'firebase') {
    activeAuthService = new FirebaseAuthService();
  } else {
    activeAuthService = new LocalAuthService();
  }
}
```

#### Step 3: Switch the Default Provider
In `src/services/index.ts`, change the default initialized instance:
```typescript
// That's it! All components (LoginModal, AuthContext, TaxDataContext, Header)
// immediately use the new provider with zero code modifications.
```

---

## 6. Testing & Offline Fallback

The test suite includes dedicated tests in `tests/auth.test.ts` verifying:
1. Provider registration and dynamic switching.
2. Abstract contract compliance for `IAuthService` and `IDatabaseService`.
3. Standardized Firestore error reporting conforming to `FirestoreErrorInfo` and `OperationType`.
4. Graceful offline fallback to `LocalAuthService` and `LocalDatabaseService` when cloud services are unreachable.
