# Intern Operations & Troubleshooting Guide
## Indian Presumptive Tax Engine & Utility

Welcome to the team! This operations guide is created specifically for interns, junior developers, and support engineers managing, testing, and maintaining the **Indian Presumptive Tax Engine (FY 2026-27 / AY 2027-28)**.

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
│   ├── aiAdvisor.ts               <-- Gemini 3.6 Flash tax advisory prompt engine & fallback handler
│   └── comprehensiveTax.ts        <-- Multi-Head Salary & Capital Gains Tax Calculator engine
├── src/context/                   <-- AuthContext user session management
├── src/components/                <-- React UI components (Calculator, Comprehensive Tax, ITR-4 Mapper, etc.)
├── server.ts                      <-- Express backend & Vite middleware server (Port 3000)
└── tests/                         <-- Vitest unit test suite (29 unit tests across 9 test suites)
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
| **Run Unit Tests** | `npm test` | Runs the full Vitest suite across all 7 test suites |
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

---

## 5. File Structure Reference Guide for Interns

| Path | Primary Function | Intern Maintenance Responsibility |
| :--- | :--- | :--- |
| `taxSchema.json` | Statutory tax rules & thresholds | Modify when budget/tax slab rules change |
| `src/engine/eligibility.ts` | Entity & 44AD/44ADA rules | Maintain turn-over cash limit rules (5% cash receipt threshold) |
| `src/engine/presumptiveTax.ts` | Tax computation logic | Maintain rebate, slab math, and regime comparison |
| `src/engine/cashSurveillance.ts` | Cash risk alerts | Update alert thresholds or bilingual message strings |
| `src/engine/advanceTax.ts` | Section 211 & 234C | Verify quarterly dates (June, Sept, Dec, March 15) |
| `src/engine/invoiceExporter.ts` | Export/GST invoice math | Verify SAC codes and LUT disclaimer text |
| `src/engine/itr4Schema.ts` | ITR-4 JSON builder & validator | Verify field mappings & `validateITR4SchemaCompliance` |
| `src/engine/comprehensiveTax.ts` | Multi-head salary & capital gains engine | Maintain standard deduction and capital gains special rates |
| `src/context/AuthContext.tsx` | User authentication & sessions | Manage Email / Indian Mobile Number session persistence |
| `src/utils/pdfExporter.ts` | PDF Report Generator | Formats Section 44AD/44ADA calculation reports in jsPDF |
| `src/components/CalculatorTab.tsx` | Main calculation screen | UI layout, input state, local storage & PDF/JSON export |
| `src/components/ITR4MapperTab.tsx` | ITR-4 Sugam mapper & validator UI | Form section explorer, validation banner & JSON exporter |
| `tests/*.test.ts` | 9 Vitest test suites | Add new test cases whenever engine rules are updated |

---

## 6. Escalation Protocol
If an issue cannot be resolved using this guide:
1. Run `npm test` and save the command line error log.
2. Verify syntax and type checks with `npm run lint`.
3. Escalate the issue with the exact error log and the user payload that triggered the error.
