# Day 1 Core Engine Architecture Documentation (Businesskar Tax Utility)

## 1. Executive Summary & Rules-as-Code (RaC) Paradigm
This application implements the core computational and compliance engine for a mobile-first tax utility tailored for Indian freelancers, consultants, and micro-businesses operating under **Section 44AD** and **Section 44ADA** of the Indian Income Tax Act (as amended and applicable for **Financial Year 2026-27 / Assessment Year 2027-28**).

To avoid brittle hardcoding of statutory thresholds and slab rates, the architecture strictly enforces a **Rules-as-Code (RaC)** design pattern. All tax rules, turnover limits, cash thresholds, slab rates, rebate boundaries, SAC codes, and advance tax interest percentages are parsed dynamically from a version-controlled JSON schema payload (`taxSchema.json`).

---

## 2. Core Architecture & Module Flow

```
                              ┌───────────────────────────┐
                              │  taxSchema.json (RaC)     │
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │    schemaLoader.ts        │
                              └─────────────┬─────────────┘
                                            │
       ┌────────────────────────────────────┼────────────────────────────────────┐
       │                                    │                                    │
       ▼                                    ▼                                    ▼
┌──────────────┐                     ┌──────────────┐                     ┌──────────────┐
│ eligibility  │                     │     cash     │                     │ presumptive  │
│     .ts      │                     │Surveillance  │                     │    Tax.ts    │
└──────┬───────┘                     └──────┬───────┘                     └──────┬───────┘
       │                                    │                                    │
       └────────────────────────────────────┼────────────────────────────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │     advanceTax.ts         │
                              └─────────────┬─────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │   invoiceExporter.ts      │                 │      itr4Schema.ts        │
       └───────────────────────────┘                 └───────────────────────────┘
```

---

## 3. Module Interface Specifications

### Module 1: `eligibility.ts`
- **Function:** `evaluateEligibility(input: EligibilityInput): EligibilityResult`
- **Responsibilities:**
  - Evaluates entity qualification (Allows Individual, HUF, Partnership; Disqualifies LLPs, Pvt Ltds, Public Ltds).
  - Validates Section 44ADA specified professions vs Section 44AD eligible businesses (Excludes Commission, Agency, 44AE).
  - Evaluates cash turnover percentage (≤5.0% grants extended limits ₹75L / ₹3Cr; >5.0% applies standard limits ₹50L / ₹2Cr).
  - Routes taxpayer to `SECTION_44ADA`, `SECTION_44AD`, or `STANDARD_AUDIT_REQUIRED` (Section 44AB mandatory tax audit).

### Module 2: `cashSurveillance.ts`
- **Function:** `evaluateCashSurveillance(input: CashSurveillanceInput): CashSurveillanceResult`
- **Responsibilities:**
  - Calculates exact cash receipts ratio = `(cashReceipts / grossReceipts) * 100`.
  - Categorizes status: `NORMAL` (<4.5%), `TIER_1_WARNING` (4.5% - 5.0%), or `TIER_2_VIOLATION` (>5.0%).
  - Provides bilingual alert messages (English & Hindi) and recommended collection actions.

### Module 3: `presumptiveTax.ts`
- **Function:** `calculatePresumptiveTax(input: PresumptiveTaxInput): PresumptiveTaxResult`
- **Responsibilities:**
  - Computes deemed professional income under 44ADA (minimum 50% of gross receipts).
  - Computes deemed business income under 44AD (6% on digital receipts + 8% on cash receipts).
  - Calculates estimated tax liability under Old Tax Regime vs New Tax Regime (FY 2026-27).
  - Handles Section 87A rebate (up to ₹7,00,000 income under New Regime / ₹5,00,000 under Old Regime) and marginal relief.
  - Generates recommended regime selection and net tax savings amount.

### Module 4: `advanceTax.ts`
- **Function:** `calculateAdvanceTax(input: AdvanceTaxInput): AdvanceTaxResult`
- **Responsibilities:**
  - Computes quarterly installment benchmarks for June 15 (15%), Sept 15 (45%), Dec 15 (75%), and March 15 (100%).
  - Evaluates completed payments and calculates shortfalls.
  - Applies Section 211(1)(b) statutory privilege for presumptive taxpayers (exemption from Q1, Q2, Q3 234C penalties if 100% is paid on/before March 15).
  - Calculates Section 234C quarterly delay interest (1% per month) and Section 234B applicability (<90% paid).

### Module 5: `invoiceExporter.ts`
- **Function:** `generateInvoiceExportMetadata(input: InvoiceInput): InvoiceExportMetadata`
- **Responsibilities:**
  - Calculates domestic GST (Intra-state CGST+SGST vs Inter-state IGST).
  - Generates cross-border zero-rated export invoice metadata under Letter of Undertaking (LUT).
  - Auto-maps SAC Codes (e.g., `998314` for IT Consultancy) and foreign currency exchange conversions.
  - Auto-applies statutory disclaimer text:
    `"SUPPLY MEANT FOR EXPORT UNDER BOND OR LETTER OF UNDERTAKING (LUT) WITHOUT PAYMENT OF INTEGRATED TAX (IGST)"`.

### Module 6: `itr4Schema.ts`
- **Function:** `generateITR4Json(input: ITR4MappingInput): ITR4SchemaOutput`
- **Responsibilities:**
  - Maps calculated financial state to official Indian Income Tax Department ITR-4 (Sugam) JSON structure (`CreationInfo`, `PersonalInfo`, `IncomeDeductions`, `TaxComputation`, `AdvanceTaxAndTDS`).

### Module 7: `aiAdvisor.ts`
- **Function:** `generateTaxAdvisorResponse(query: string, context: TaxContext): Promise<TaxAdvisorResponse>`
- **Responsibilities:**
  - Integrates with Gemini 3.6 Flash for intelligent Section 44AD/44ADA tax planning and statutory advice.
  - Implements offline rule-based fallback responses (`getOfflineFallbackAdvice`) if API keys are missing or network requests fail.

### Module 8: `comprehensiveTax.ts`
- **Function:** `calculateComprehensiveTax(input: ComprehensiveTaxInput): ComprehensiveTaxResult`
- **Responsibilities:**
  - Evaluates multi-head aggregate taxable income across Salary, Presumptive Business/Profession (Section 44AD/44ADA), Capital Gains, and Other Income.
  - Applies Salaried Standard Deduction (₹75,000 under New Regime / ₹50,000 under Old Regime).
  - Computes special rate capital gains tax: STCG Equity Section 111A at 20%, LTCG Equity Section 112A at 12.5% on gains exceeding ₹1,25,000 exemption limit, and LTCG Other Section 112 at 12.5%.
  - Handles basic exemption set-off for resident individuals if normal slab income is below the basic exemption threshold.
  - Compares New vs Old Tax Regime total tax liabilities and generates regime recommendation with net tax savings.

### Module 9: Modular Services, Firebase Auth & Firestore Persistence (`/src/services/`, `AuthContext.tsx` & `LoginModal.tsx`)
- **Responsibilities:**
  - **Modular Provider Architecture (`/src/services/`):** Implements `IAuthService` and `IDatabaseService` interfaces enabling runtime switching between Firebase, Local/Mock, or future custom providers (Supabase, PostgreSQL).
  - **Firebase Auth with Google Sign-In (`firebaseAuthService.ts`):** Implements `signInWithPopup(auth, new GoogleAuthProvider())` for secure authentication with Google identity, avatar support, and real-time auth state synchronization (`onAuthStateChanged`).
  - **Firestore Cloud Data Persistence (`firestoreDatabaseService.ts`):** Syncs user profiles (`/users/{userId}`) and live tax calculation states (`/users/{userId}/taxProfiles/current`) across devices with real-time `onSnapshot` listeners.
  - **Hardened Security Rules (`firestore.rules`):** Zero-trust ABAC security rules with default-deny safety nets, `isValidId()`, `isValidUser()`, `isValidTaxData()`, and strict `request.auth.uid == userId` checks.
  - **Statutory Error Handling (`handleFirestoreError`):** Catches Firestore permission failures and formats error payloads conforming strictly to the `FirestoreErrorInfo` schema.
  - **Local / Demo Account Fallback:** Provides instant testing via demo profiles (`rahul@taxpro.in`, `9876543210`) with zero external network requirement for automated Vitest testing.

### Module 10: `TaxDataContext.tsx`, `GuidedOnboardingTour.tsx` & `OnboardingPromptBanner.tsx`
- **Responsibilities:**
  - Manages application-wide shared financial state (`TaxDataPayload`), initializing first-time users with a clean 0-value tax profile.
  - Features an interactive 4-step Guided Onboarding Setup Wizard (`GuidedOnboardingTour`) allowing structured step-by-step entry of entity type, gross receipts, salary, capital gains, and deductions.
  - Houses in-wizard action tools including "Load Demo Data" (populates sample figures for step-by-step custom editing) and "Reset All to 0" (resets all fields back to zero values across the tour and application), keeping main screen headers clean and uncluttered.
  - Provides a top prompt banner (`OnboardingPromptBanner`) and launcher buttons to trigger the guided wizard anytime.
  - Automatically synchronizes financial state changes in real time across all application tabs (`CalculatorTab`, `ComprehensiveTaxTab`, `CashSurveillanceTab`, `AdvanceTaxTab`, `ExportInvoiceTab`).

### Module 11: Plain-English Assistance (`FieldTooltip.tsx` & `TaxInfoDrawer.tsx`)
- **Responsibilities:**
  - Provides interactive hover tooltips (`FieldTooltip`) on tax input fields explaining statutory limits, section codes, and calculation formulas.
  - Houses a slide-out Tax Glossary & Concepts drawer (`TaxInfoDrawer`) offering plain-English definitions, real-world examples, and category filtering for non-financial users.

### Module 12: AI Tax Chat Copilot (`aiChatCopilot.ts`, `indianNumberIdioms.ts` & `AIChatPanel.tsx`)
- **Responsibilities:**
  - Full-context conversational AI engine powered by **Gemini 3.8 Flash** (`@google/genai`) on the server side (`POST /api/tax/chat`).
  - **Model & Billing Architecture:** Utilizes Google's `gemini-3.8-flash` LLM hosted via server-side proxy (`/api/tax/chat`). The end user is not billed and requires no API key. Developer credits / Google AI Studio environment provisions the API key via `process.env.GEMINI_API_KEY`. In the absence of an API key or in offline/test environments, an intelligent zero-cost deterministic rule engine seamlessly handles all queries.
  - **Indian Numerical Idioms Pre-processing Engine (`indianNumberIdioms.ts`):** Mandatory pre-processing stage (STEP 0) that normalizes colloquial shorthand before any calculations or LLM calls:
    - Normalizes `50k` / `50 k` / `50 hazar` -> `50,000` (₹50,000, never mistaken for ₹50).
    - Normalizes `5 lakhs` / `5L` / `1.5L` -> `5,00,000` / `1,50,000`.
    - Normalizes `2cr` / `2.5 crore` -> `2,00,00,000` / `2,50,00,000`.
    - Injects structured pre-processed entity tables into the LLM system prompt and returns `preprocessedEntities` to render real-time normalization badges in the UI.
  - **Statutory Gift Exemption Engine (Section 56(2)(x)):** Recognizes transfers/gifts from relatives (mother, father, spouse, siblings, lineal ascendants) and explicitly confirms 100% tax exemption with ₹0 added tax and ₹0 business turnover impact.
  - **Live Profile Context Injection:** Automatically inspects user's active turnover, cash ratio, salary, capital gains, Chapter VI-A deductions, and real-time tax liabilities.
  - **Assists in Adding Entries:** Natural language intent parser for incoming payments, receipts, salary additions, and deductions (80C, 80D, 80CCD1B) with an interactive **"1-Click Apply to Profile"** widget that directly mutates `TaxDataState`.
  - **What-If Analysis Engine:** Runs baseline vs projected tax simulations returning `WhatIfAnalysis` objects detailing before & after taxes, exact ₹ tax savings, and recommended tax regime.
  - **Tax Outlay Minimization:** Formulates tailored legal minimization strategies using Section 87A rebate thresholds, Chapter VI-A deductions, digital receipts under Section 44AD (6% deemed profit), 5% cash surveillance discipline, and Section 211(1)(b) single March 15 advance tax payment privileges.
  - **Deterministic Rule Engine Fallback:** Seamless offline and test-environment operation (`generateDeterministicChatResponse`) guaranteeing 100% calculation reliability without external API dependencies.

### Module 13: Modular Authentication & Database Layer (`src/services/` & Firebase / Cloud Firestore)
- **Responsibilities:**
  - Implements abstract interfaces `IAuthService` and `IDatabaseService` (`src/services/types.ts`) guaranteeing complete architectural decoupling from any single cloud backend.
  - Enables future provider swaps (Supabase, PostgreSQL, Appwrite, AWS Cognito) via singleton Service Registry and runtime switchers `setAuthProvider()` and `setDatabaseProvider()` (`src/services/index.ts`).
  - **Firebase Auth Service (`firebaseAuthService.ts`):** Supports 1-click Google Sign-in with OAuth popups, email/mobile number credential signup/login, session restoration, and real-time auth state subscription.
  - **Cloud Firestore Database Service (`firestoreDatabaseService.ts`):** Provides persistent cloud synchronization of user profiles (`/users/{userId}`) and tax states (`/users/{userId}/taxProfiles/current`).
  - **Zero-Trust Demo Session Protection (`localFallback`):** Routes demo users (`usr_demo_*`) and unauthenticated local guest exploration safely to `LocalDatabaseService` (localStorage), ensuring zero permission rejections while strictly enforcing zero-trust Cloud Firestore security rules for Google-authenticated users (`request.auth.uid == userId`).
  - **Local Offline Fallback Provider (`localAuthService.ts` & `localDatabaseService.ts`):** Complete zero-dependency offline fallback ensuring seamless operation in test environments, demo modes, or disconnected network states.
  - **Security Rules (`firestore.rules`) & Invariants (`security_spec.md`):** Deployed production rules enforcing default-deny, strict user-ownership validation (`request.auth.uid == userId`), path-variable sanitization, and defense against the "Dirty Dozen" malformed payload attacks.

### Utility 1: `pdfExporter.ts`
- **Functions:**
  - `generateTaxCalculationPdf(data: TaxPdfExportData): void`: Generates formatted PDF presumptive tax reports containing Assessee Profile, Section 44AD/44ADA Eligibility Evaluation, Old vs New Regime Tax Line-Item Breakdown, Net Savings Banner, and Section 211 Advance Tax Schedule.
  - `generateITR4SummaryPdf(data: ITR4PdfExportData): { doc: jsPDF, filename: string }`: Generates formal, audit-ready ITR-4 (Sugam) Tax Computation & Summary Statement PDF documents for AY 2027-28 conforming to CBDT statutory standards with Assessee Profile, Schedule BP Presumptive Turnover & 5% cash checks, Chapter VI-A deductions, New vs Old Regime tax comparisons, TDS credits, net tax payable/refund calculation, Section 211 advance tax installments, electronic refund bank details, and Part F verification statement.

---

## 4. Test Suite & Verification Instructions

To execute the automated unit test suites covering edge cases across all core engine modules:

```bash
# Run Vitest test suite
npm test
```

Test coverage includes (51 tests across 11 test suites):
1. Individual IT consultant 44ADA qualification and extended limit application.
2. Disqualification of LLPs and Commission businesses.
3. Cash surveillance threshold triggers (`NORMAL`, `TIER_1_WARNING`, `TIER_2_VIOLATION`).
4. Section 87A rebate calculations under New Regime.
5. Section 211 single March 15 advance tax installment privilege.
6. Cross-border LUT export invoice statutory disclaimer generation.
7. Official ITR-4 Sugam JSON formatting, schema validation, and formal PDF summary document generation.
8. Gemini AI Advisor response formatting & rule-based offline fallback handling.
9. Multi-head aggregate tax computation across Salary, Presumptive Business/Profession, STCG Sec 111A, LTCG Sec 112A/112, and basic exemption set-off rules.
10. AI Tax Chat Copilot What-If simulation, entry addition, and tax minimization planning.
11. User authentication, signup/login validation, and session persistence.
12. Taxpayer Persona selector, CA review inquiries, and 3-option overwrite safeguard matrices.

---

## 5. Legal & Statutory Compliance Disclaimer
Outputs generated by this software engine are automated estimations based on user inputs and statutory rules parsed from `taxSchema.json` for FY 2026-27 / AY 2027-28 under the Indian Income Tax Act (as amended). Final tax filings should be reviewed with a qualified Chartered Accountant (CA) or Tax Practitioner.

