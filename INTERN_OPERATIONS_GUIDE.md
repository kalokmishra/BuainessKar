# Intern Operations & Troubleshooting Guide
## Businesskar - Indian Presumptive Tax Engine & Utility

Welcome to the team! This operations guide is created specifically for interns, junior developers, and support engineers managing, testing, and maintaining **Businesskar (FY 2026-27 / AY 2027-28)**.

This document lives in the source code repository as a reference manual and is **not exposed in the end-user application interface**.

---

## 1. System Architecture Overview

The application is built as a full-stack, Rules-as-Code (RaC) web app:

```
├── taxSchema.json                 <-- Single source of truth for statutory tax rules & slabs
├── src/engine/                    <-- Pure TypeScript Tax Computation Engine
│   ├── schemaLoader.ts            <-- Dynamic JSON schema loader & validator
│   ├── eligibility.ts             <-- Section 44AD / 44ADA eligibility & cash threshold evaluator
│   ├── presumptiveTax.ts          <-- Old vs New Regime calculation & 87A rebate engine
│   ├── cashSurveillance.ts        <-- Cash receipt percentage monitoring (Normal / Warning / Violation)
│   ├── advanceTax.ts              <-- Section 211 quarterly schedules & 234C delay interest
│   ├── invoiceExporter.ts         <-- GST & zero-rated LUT export invoice generator
│   ├── itr4Schema.ts              <-- Income Tax Dept ITR-4 (Sugam) JSON builder & validateITR4SchemaCompliance
│   ├── aiAdvisor.ts               <-- Gemini AI tax advisory prompt engine & fallback handler
│   ├── comprehensiveTax.ts        <-- Multi-Head Salary & Capital Gains Tax Calculator engine
│   ├── indianNumberIdioms.ts      <-- Colloquial Indian numerical idioms pre-processor (50k, 5L, 2cr)
│   └── aiChatCopilot.ts           <-- Full-Context AI Tax Copilot (What-If Analysis & Entry Assistant)
├── src/services/                  <-- Modular Auth & Database Provider Layer (Firebase / Local)
│   ├── types.ts                   <-- IAuthService & IDatabaseService abstract interfaces
│   ├── index.ts                   <-- Service Registry & runtime provider switcher
│   ├── firebase/                  <-- Firebase Auth (Google Sign-In) & Cloud Firestore persistence
│   └── local/                     <-- Standalone local storage provider & offline fallback
├── src/utils/                     <-- PDF generators (Calculator report & formal ITR-4 summary)
├── src/context/                   <-- AuthContext & TaxDataContext state management
├── src/components/                <-- React UI components (Calculator, AIChatPanel, ITR4MapperTab, etc.)
├── server.ts                      <-- Express backend & Vite middleware server (Port 3000)
└── tests/                         <-- Vitest unit test suite (48 unit tests across 10 test suites)
```

---

## 2. Developer Quickstart & Commands

### Prerequisites
- Node.js (v18 or higher)
- npm or bun package manager

### Environment Configuration
Create or inspect `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Essential CLI Commands

| Operational Task | Command Line | Description |
| :--- | :--- | :--- |
| **Start Local Dev Server** | `npm run dev` | Boots Express server on `http://localhost:3000` with Vite HMR |
| **Run Unit Tests** | `npm test` | Runs the full Vitest suite across all 10 test suites |
| **Run Linter / Type Check**| `npm run lint` | Runs `tsc --noEmit` to verify type safety |
| **Production Build** | `npm run build` | Bundles Vite client to `dist/` and server to `dist/server.cjs` |
| **Start Production Mode** | `npm start` | Launches compiled server (`node dist/server.cjs`) on port 3000 |

---

## 3. Core Engine Operations & Rules-as-Code (RaC)

### Updating Tax Rules for Future Financial Years
**NEVER hardcode tax slabs or turnover limits inside component or engine files.**
All statutory limits are controlled via `taxSchema.json`.

To update rules (e.g. for FY 2027-28):
1. Open `taxSchema.json`.
2. Update the target fields (e.g. `slabs.newRegime`, `section44ADA.thresholds`, `section87A.maxRebateNew`).
3. Run `npm test` to verify that all calculations adapt dynamically without breaking tests.

---

## 4. Troubleshooting & Debugging Matrix

Below are common issues interns may encounter, along with step-by-step diagnostic actions.

### Scenario A: Unit Test Failure or Calculation Mismatch
- **Symptom:** `npm test` fails on a test suite (e.g. `presumptiveTax.test.ts` or `eligibility.test.ts`).
- **Diagnosis & Fix:**
  1. Run the failing test in isolated mode: `npx vitest tests/presumptiveTax.test.ts`.
  2. Verify if `taxSchema.json` values were recently edited.
  3. Check rebate boundaries (Section 87A: ₹7,00,000 threshold under New Regime, ₹5,00,000 under Old Regime).
  4. Ensure marginal relief calculations inside `presumptiveTax.ts` have not been overridden manually.

### Scenario B: AI Tax Advisor Is Failing or Returning Generic Strategy Answers
- **Symptom:** In the "Tax Advisor" tab, queries fail or return fallback messages.
- **Diagnosis & Fix:**
  1. **API Key Check:** Ensure `GEMINI_API_KEY` is present in environment variables.
  2. **Server Logs:** Check terminal output for server error logs on `/api/advisor` calls.
  3. **Graceful Fallback:** `src/engine/aiAdvisor.ts` has a built-in rule-based fallback strategy (`getOfflineFallbackAdvice`) that automatically responds even if Gemini API is unreachable or unconfigured.

### Scenario C: Saved Calculation History Is Not Appearing or Persisting
- **Symptom:** User clicks "Save Result" in the Calculator tab, but calculations disappear on refresh.
- **Diagnosis & Fix:**
  1. Open browser Developer Tools (`F12`) -> **Application** -> **Local Storage**.
  2. Search for the key: `tax_engine_saved_calculations`.
  3. If missing or corrupted, click "Clear All" in the History panel or execute `localStorage.removeItem('tax_engine_saved_calculations')` in console to reset corrupted JSON schemas.

### Scenario D: Build or Server Port Ingress Errors
- **Symptom:** App shows "Port 3000 busy" or fails to serve pages in container deployments.
- **Diagnosis & Fix:**
  1. Verify `server.ts` listens explicitly to host `0.0.0.0` and port `3000`:
     ```ts
     app.listen(PORT, "0.0.0.0", () => { ... });
     ```
  2. If type errors occur during build, run `npm run lint` to find unhandled TypeScript interface mismatches.

### Scenario E: PDF Export Issues
- **Symptom:** User clicks "Export PDF" or "Download PDF Report", but no file downloads or formatting is misaligned.
- **Diagnosis & Fix:**
  1. **jspdf Library:** Ensure `jspdf` package is installed in `package.json`.
  2. **Data Structure:** Verify that `src/utils/pdfExporter.ts` receives valid `eligibility` and `presumptive` evaluation objects.
  3. **Browser Popup/Download Blockers:** Ensure browser settings allow automatic file downloads for the application origin.

### Scenario F: AI Tax Chat Copilot (`/api/tax/chat`) & What-If Analysis
- **Symptom:** AI Copilot fails to open, returns error messages, or 1-click update does not modify values.
- **Diagnosis & Fix:**
  1. **API Endpoint Check:** Ensure the backend `POST /api/tax/chat` endpoint is responding properly with `{ status: 'success', data: { reply, intent, suggestedUpdates, whatIf } }`.
  2. **Gemini SDK Version:** The backend uses `@google/genai` with model `gemini-3.8-flash`. Ensure `User-Agent: 'aistudio-build'` is present in `httpOptions`.
  3. **Deterministic Fallback:** If `GEMINI_API_KEY` is absent or the call fails, `aiChatCopilot.ts` falls back to `generateDeterministicChatResponse`. It parses keywords like "nps", "invoice", "receipt", "80d", "regime", and runs `computeBaselineTax` to return exact math.
  4. **1-Click Apply Flow:** When the user clicks "Apply Changes to My Profile", `handleApplyUpdates` in `AIChatPanel.tsx` calls `updateTaxData(msg.suggestedUpdates)`, automatically enabling any multi-head income flags (e.g. `hasSalary`, `hasCapitalGains`) and recomputing taxes application-wide.

### Scenario G: ITR-4 Formal Tax Summary PDF & JSON Export
- **Symptom:** Clicking "Tax Summary PDF" or "Download JSON" does not trigger download or schema errors appear.
- **Diagnosis & Fix:**
  1. **Schema Compliance:** Check `validateITR4SchemaCompliance` output. If the taxpayer entered an invalid PAN (must be 10 uppercase chars, e.g. `ABCDE1234F`) or invalid IFSC (must be 11 chars, 5th char '0'), validation warnings appear in the left column banner.
  2. **PDF Generation Method:** In `src/utils/pdfExporter.ts`, `generateITR4SummaryPdf` compiles an A4 single-page formal computation statement and calls `doc.save(filename)`. Ensure `pan`, `presumptive`, and `advanceTax` objects are not null.
  3. **Browser Restrictions:** If testing inside strict iframes, ensure popup or download blockers do not suppress `.pdf` / `.json` downloads.

### Scenario H: Modular Auth & Database Provider (Firebase vs Local)
- **Symptom:** User cannot log in with Google, or wants to run in fully offline/isolated environments without cloud dependencies.
- **Diagnosis & Fix:**
  1. **Abstract Layer:** Inspect `src/services/index.ts`. All auth operations use `authService` (`IAuthService`) and all data ops use `databaseService` (`IDatabaseService`).
  2. **Offline Fallback:** If Firebase network calls are blocked or offline, use `setAuthProvider('local')` and `setDatabaseProvider('local')` to switch to `LocalAuthService` and `LocalDatabaseService`.
  3. **Testing Without Cloud:** All unit tests in `tests/auth.test.ts` run against mock and local providers with zero external network calls.

---

## 5. File Structure Reference Guide for Interns

| Path | Primary Function | Intern Maintenance Responsibility |
| :--- | :--- | :--- |
| `taxSchema.json` | Statutory tax rules & thresholds | Modify when budget/tax slab rules change |
| `src/engine/eligibility.ts` | Entity & 44AD/44ADA rules | Maintain turnover cash limit rules (5% cash receipt threshold) |
| `src/engine/presumptiveTax.ts` | Tax computation logic | Maintain rebate, slab math, and regime comparison |
| `src/engine/cashSurveillance.ts` | Cash risk alerts | Update alert thresholds or bilingual message strings |
| `src/engine/advanceTax.ts` | Section 211 & 234C | Verify quarterly dates (June, Sept, Dec, March 15) |
| `src/engine/invoiceExporter.ts` | Export/GST invoice math | Verify SAC codes and LUT disclaimer text |
| `src/engine/itr4Schema.ts` | ITR-4 JSON builder & validator | Verify field mappings & `validateITR4SchemaCompliance` |
| `src/engine/aiAdvisor.ts` | Overview AI Advisor | Overview tax tips prompt & rule fallback |
| `src/engine/comprehensiveTax.ts` | Multi-head salary & capital gains engine | Maintain standard deduction and capital gains special rates |
| `src/engine/indianNumberIdioms.ts` | Indian numerical idioms pre-processor | Normalizes colloquial shorthand (50k, 5L, 2cr) before LLM or tax processing |
| `src/engine/aiChatCopilot.ts` | AI Tax Copilot conversation engine | Prompts Gemini 3.8 Flash, computes baseline & what-if scenarios, provides rule engine fallback |
| `src/services/` | Modular Auth & Database layer | Abstract interfaces, Firebase Auth, Cloud Firestore sync, and Local fallback |
| `src/context/AuthContext.tsx` | User authentication & sessions | Manages Google OAuth, Email/Mobile sessions, and cloud profile syncing |
| `src/context/TaxDataContext.tsx` | Shared tax financial state & onboarding context | Maintain zero-default profile state, ZERO_TAX_DATA, DEMO_TAX_DATA, and cloud persistence |
| `src/components/Header.tsx` | Top Navigation Header | Top profile dropdown, AI Copilot trigger, Tax Glossary launcher, and auto-scroll behavior |
| `src/components/LoginModal.tsx` | Sign In / Sign Up modal | Google 1-click OAuth, credential signup, and demo accounts |
| `src/components/ChangePasswordModal.tsx` | Reset password modal | Maintain current password verification and new password fields |
| `src/components/FieldTooltip.tsx` | Hover-based input tooltips | Interactive tooltips rendering statutory tax rules on input labels |
| `src/components/TaxInfoDrawer.tsx` | Slide-out Tax Terms & Glossary Drawer | Plain-English definitions, search filter, and real-world tax examples |
| `src/components/AIChatPanel.tsx` | Conversational AI Tax Copilot | Floating launcher, message thread, What-If scenario cards, and 1-click update buttons |
| `src/components/GuidedOnboardingTour.tsx` | 4-step onboarding wizard modal | Maintain step navigation, input form validation, in-wizard Load Demo Data & Reset All tools |
| `src/components/OnboardingPromptBanner.tsx` | Onboarding banner prompt | Displays welcome prompt with Zero Data vs Demo Data indicator |
| `src/utils/pdfExporter.ts` | PDF Report & Summary Generator | Formats Presumptive Tax report and official ITR-4 Sugam Tax Summary statement |
| `src/components/CalculatorTab.tsx` | Main calculation screen | UI layout, input state, local storage & PDF/JSON export |
| `src/components/ITR4MapperTab.tsx` | ITR-4 Sugam mapper & validator UI | Form section explorer, validation banner, formal PDF summary & JSON exporter |
| `tests/*.test.ts` | 10 Vitest test suites | Add new test cases whenever engine rules are updated (48 tests) |

---

## 6. Escalation Protocol
If an issue cannot be resolved using this guide:
1. Run `npm test` and save the command line error log.
2. Verify syntax and type checks with `npm run lint`.
3. Escalate the issue with the exact error log and the user payload that triggered the error.
