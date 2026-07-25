# Day 1 Core Engine Architecture Documentation (Indian Tax Utility MVP)

## 1. Executive Summary & Rules-as-Code (RaC) Paradigm
This application implements the core computational and compliance engine for a mobile-first tax utility tailored for Indian freelancers, consultants, and micro-businesses operating under **Section 44AD** and **Section 44ADA** of the Income Tax Act, 1961 for **Financial Year 2026-27 (Assessment Year 2027-28)**.

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

---

## 4. Test Suite & Verification Instructions

To execute the automated unit test suites covering edge cases across all 6 core engine modules:

```bash
# Run Vitest test suite
npm test
```

Test coverage includes:
1. Individual IT consultant 44ADA qualification and extended limit application.
2. Disqualification of LLPs and Commission businesses.
3. Cash surveillance threshold triggers (`NORMAL`, `TIER_1_WARNING`, `TIER_2_VIOLATION`).
4. Section 87A rebate calculations under New Regime.
5. Section 211 single March 15 advance tax installment privilege.
6. Cross-border LUT export invoice statutory disclaimer generation.
7. Official ITR-4 Sugam JSON formatting.

---

## 5. Legal & Statutory Compliance Disclaimer
Outputs generated by this software engine are automated estimations based on user inputs and statutory rules parsed from `taxSchema.json` for FY 2026-27. Final tax filings should be reviewed with a qualified Chartered Accountant (CA) or Tax Practitioner.
