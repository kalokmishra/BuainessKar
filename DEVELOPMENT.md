# Businesskar Developer & Security Guide

## 🔐 Mandatory Environment Variables & Secrets Policy

> **CRITICAL SECURITY REQUIREMENT:** All sensitive keys, API credentials, Firebase identifiers, database paths, and secrets **MUST** be managed exclusively through environment variables. Hardcoding credentials or configuration objects in source code is strictly prohibited.

---

### 📋 Developer Setup: Creating `.env.local`

Every developer joining the project must set up their local environment configuration before launching the dev server or running tests:

#### Step 1: Copy the Template
Create your local `.env.local` file by copying the version-controlled `.env.example`:
```bash
cp .env.example .env.local
```

#### Step 2: Configure Environment Variables
Open `.env.local` and populate the required parameters. For Vite frontend development, all variables must be prefixed with `VITE_`:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
VITE_FIREBASE_FIRESTORE_DATABASE_ID=your-database-id

# User & Demo Configuration
VITE_DEFAULT_USER_EMAIL=user@example.com
VITE_ADMIN_SUPPORT_EMAIL=admin@example.com
VITE_DEFAULT_DEMO_EMAIL=rahul@taxpro.in
VITE_DEFAULT_DEMO_NAME="Rahul (IT Consultant)"
VITE_SECONDARY_DEMO_PHONE="9876543210"
VITE_SECONDARY_DEMO_NAME="Priya (Retail Trader)"
```

#### Step 3: Verify `.gitignore` Enforcement
Confirm that `.env.local` and all `.env*.local` variants are ignored by git. They must **never** be committed to version control:
```bash
git check-ignore .env.local
# Expected output: .env.local
```

---

### 🛡️ Why Hardcoded Firebase Configurations Are Strictly Forbidden

Hardcoding Firebase configurations (such as `apiKey`, `authDomain`, `projectId`, or database credentials) directly in JavaScript/TypeScript files violates core security principles and compliance frameworks. In Businesskar, hardcoded configurations are strictly forbidden due to the following critical reasons:

1. **Prevention of Credential Leaks in Version Control**:
   - Committing keys to Git embeds them permanently in commit logs, pull requests, CI/CD artifacts, and repository forks. Even if purged in a later commit, git history retains exposed keys indefinitely unless rewritten.
   - Public or multi-developer repositories with hardcoded keys are instantly scraped by automated scanning bots and crawlers.

2. **Compliance with Security Standards (OWASP, SOC 2, ISO 27001)**:
   - Modern enterprise security compliance (OWASP Top 10 A07:2021 Identification and Authentication Failures, CIS Benchmarks, SOC 2 Trust Services Criteria, and ISO/IEC 27001) mandates that no secrets or environment-specific credentials exist in version-controlled source code.
   - Automated linters, pre-commit hooks, and static analysis security testing (SAST) tools will immediately fail builds containing hardcoded secret strings.

3. **Strict Environment Segregation & Blast Radius Containment**:
   - Different environments (Local Development, Automated CI/Testing, Staging on Cloud Run, and Production) must point to segregated Firebase projects or isolated database instances.
   - Hardcoding configurations binds the codebase to a specific project, risking catastrophic data corruption or accidental mutation of production Firestore databases during local tests.

4. **Zero-Downtime Key Rotation & Incident Response**:
   - If an API key or credential is leaked or deprecated, environment-based configuration allows immediate rotation directly in deployment platform dashboards (Vercel, Cloud Run, Netlify) without touching code or redeploying software binaries.
   - Hardcoded keys require emergency code modifications, reviews, CI builds, and full deployment rollouts, dramatically prolonging vulnerability windows.

5. **Centralized Instance Management via `src/config/firebase.ts`**:
   - Businesskar utilizes a single, centralized initialization module (`src/config/firebase.ts`) that reads directly from `import.meta.env.VITE_FIREBASE_*`.
   - All components, contexts (`AuthContext.tsx`), and services import the centralized singleton instances (`app`, `auth`, `db`), ensuring uniform security policy application across the entire application lifecycle.

---

### Security Invariants Checklist

❌ **STRICTLY PROHIBITED:**
- Never commit `.env.local`, `.env`, or any `.env.*` files containing actual values (only `.env.example` is committed).
- Never hardcode Firebase configuration objects, API keys, or project IDs into `.ts` or `.tsx` files.
- Never write fallback strings with actual production keys in code (e.g., `process.env.KEY || 'AIzaSy...'`).
- Never paste credentials into commit messages, pull request descriptions, or tickets.

✅ **MANDATORY PRACTICES:**
- Always maintain secrets in `.env.local` for local execution.
- Always configure production environment variables in the platform dashboard (Vercel, Google Cloud Run).
- Always read configurations via `import.meta.env.VITE_*` in client code or `process.env` in server code.
- Always import initialized Firebase instances from `src/config/firebase.ts` and `src/context/AuthContext.tsx`.

---

### Pre-Commit Hooks & Automated Secret Scanning

To enforce this policy automatically before code reaches the repository, developers should install the pre-commit hook suite:
```bash
pip install pre-commit
pre-commit install
```

Automated GitHub Actions secret scanning is active on `main` and `develop` branches via `.github/workflows/secret-scan.yml`.

---

## 📄 Document Management & Persistence (Create, Update, List, Delete)

Businesskar implements a schema-enforced, zero-trust document persistence layer backed by Google Cloud Firestore with automatic offline fallback:

### 1. Document Collections Architecture
All generated user artifacts (Export Invoices, ITR-4 Computation Statements, and Tax Assessment Reports) are stored under the subcollection path:
```
users/{userId}/documents/{docId}
```

### 2. Available API Methods on `services.db` / `databaseService`:
- **`createDocument<T>(collectionPath: string, docId: string, data: T): Promise<void>`**:
  Creates a new document, auto-injects `createdAt` and `updatedAt` ISO timestamps, and commits to Firestore or local sandbox.
- **`updateDocument<T>(collectionPath: string, docId: string, data: Partial<T>): Promise<void>`**:
  Applies partial updates to existing documents with an updated `updatedAt` ISO timestamp.
- **`setDocument<T>(collectionPath: string, docId: string, data: T, merge?: boolean): Promise<void>`**:
  Creates or updates a document with configurable field merging.
- **`getDocument<T>(collectionPath: string, docId: string): Promise<T | null>`**:
  Fetches an individual document by path and identifier.
- **`listDocuments<T>(collectionPath: string): Promise<T[]>`**:
  Retrieves all documents residing under the specified collection path.
- **`deleteDocument(collectionPath: string, docId: string): Promise<void>`**:
  Removes the document from Firestore and local storage.

### 3. Security Rules & Blueprint Schema
Document writes are validated against `firebase-blueprint.json` and secured by `firestore.rules`:
- Only authenticated owners matching `request.auth.uid == userId` can read or write documents.
- IDs are validated against strict regex (`^[a-zA-Z0-9_\-]+$`) with a maximum length of 128 characters.
- Incoming documents require mandatory `userId` and `title` (max 150 characters).
- Bulk/blanket public reads are strictly forbidden (`allow read, write: if false;` global safety net).

---

## 🧑‍💼 Personas & Guided Setup Architecture

- **Persona Quick Selector (Step 0)**: Displays 6 taxpayer archetypes (Salaried Consultant, Full-Time Freelancer, Stock Investor, International Freelancer, Small Business Owner, First-Time Filer).
- **Auto-Launch Behavior**: The persona selector is **optional** and only shown when the user explicitly clicks "Guided Setup Wizard" or "Get Started". It never auto-pops on initial page load.
- **Overwrite Safeguard (`ProfileOverwriteModal`)**: When an existing user with customized tax data selects a persona or clicks "Choose Your Persona Again", a 3-option modal is presented:
  1. `Replace with Demo`: Injects sample figures into the active draft while preserving cloud backups.
  2. `Compare Side-by-Side`: Renders a live comparative matrix of active vs demo figures without mutating data.
  3. `Never Mind, Keep My Data`: Cancels the switch without changes.
- **Smart Tab Routing**: Completing the setup routes to the persona's `preferredTab` (e.g. `multi-head-salary-tax` for Salaried Consultants), or restores `lastVisitedTab` if the persona selector was skipped.

---

## 🤖 AI Tax Copilot & Rules-as-Code

- **Hybrid Intelligence**: Powered by Gemini with a 3.5-second timeout and instant fallback to `deterministicCopilot.ts`.
- **Statutory Rules**: Full automatic handling of Indian numeric idioms (`50k` ➔ ₹50,000, `5 lakhs` ➔ ₹5,00,000), Section 56(2)(x) relative gift tax exemptions, Section 80CCD(1B) NPS what-if scenarios, and 1-click profile update triggers.
- **Zero-Canned Fallback Invariant**: The copilot never displays static canned sentences; it executes full Rules-as-Code recalculations locally if offline or under network constraints.
