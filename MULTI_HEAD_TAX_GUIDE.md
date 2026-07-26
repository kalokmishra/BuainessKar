# Multi-Head Tax Provision & Statutory Calculation Guide (FY 2026-27 / AY 2027-28)

## 📌 Executive Summary

Many Indian freelancers and independent consultants operate with multi-source income. For example, a taxpayer might be employed full-time or part-time receiving a **Salary**, perform freelance consulting declared under **Section 44ADA or 44AD**, trade stocks or mutual funds generating **Short-Term/Long-Term Capital Gains**, and earn interest on savings deposits or dividends.

This application provides complete provisions and computational engines to handle multi-head aggregate income under both the **New Tax Regime (Section 115BAC)** and the **Old Tax Regime**.

---

## 🏛️ Statutory Provisions Across Income Heads

### 1. Head 1: Income from Salaries
* **Standard Deduction**:
  * **New Tax Regime (Sec 115BAC)**: **₹75,000** standard deduction allowed automatically against gross salary.
  * **Old Tax Regime**: **₹50,000** standard deduction allowed.
* **Net Salary**: Calculated as `Math.max(0, Gross Salary - Salaried Standard Deduction)`.

### 2. Head 2: Profits & Gains from Business or Profession (Presumptive Tax)
* **Section 44ADA (Specified Professions)**:
  * Deemed profit = Minimum **50%** of gross professional receipts (or higher declared profit).
  * Applicable for IT software, engineering, legal, medical, accounting, consultancy, architectural, interior decoration, film artists, etc.
* **Section 44AD (Eligible Small Businesses)**:
  * Deemed profit = Minimum **6%** on digital/banking turnover + **8%** on cash turnover.
* **Compatibility with Salary**: Taxpayers receiving both Salary and Presumptive Business/Professional income can legally claim Section 44AD / 44ADA for their freelance work while receiving standard salary income.

### 3. Head 3: Capital Gains (Special Rates vs Slab Rates)
* **Short-Term Capital Gains (STCG)**:
  * **Section 111A (Listed Equity Shares & Equity Mutual Funds)**: Taxed at a special flat rate of **20%**.
  * **STCG Other (Real estate, unlisted shares, debt funds)**: Added to normal slab income and taxed at applicable slab rates.
* **Long-Term Capital Gains (LTCG)**:
  * **Section 112A (Listed Equity Shares & Equity Mutual Funds)**: First **₹1,25,000** of gains in a financial year are **exempt**. Gains exceeding ₹1.25 Lakhs are taxed at **12.5%**.
  * **Section 112 (Other Long-Term Capital Assets - Real estate, unlisted securities, gold)**: Taxed at a flat rate of **12.5%**.
* **Basic Exemption Set-off Rule for Resident Individuals**:
  * If normal slab income (Salary + Freelance + STCG Other + Other Income - Deductions) is less than the basic exemption limit (₹4,00,000 under New Regime or ₹2,50,000 under Old Regime), the unexhausted basic exemption amount can be set off against STCG (Sec 111A) and LTCG (Sec 112A/112), reducing special rate tax payable.

### 4. Head 4: Income from Other Sources
* Interest from savings bank accounts, fixed deposits (FDs), corporate bonds, and dividends.
* Taxed at normal slab rates.

### 5. Chapter VI-A Deductions (Old Regime Only)
* Deductions under **80C** (PPF, ELSS, EPF up to ₹1,50,000), **80D** (Health Insurance), **80TTA/TTB** (Interest), etc.
* Deductions apply under the **Old Tax Regime** against normal slab income. (Not allowed under New Regime except specific employer NPS contributions under 80CCD(2)).

---

## 🧮 Comprehensive Tax Computation Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Gross Aggregate Income                           │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│     Salary      │  Presumptive    │ Capital Gains   │   Other Income    │
│  (Net of Std    │  Business       │ (STCG 111A 20%  │ (Interest/Rent)   │
│   Deduction)    │  (44AD / 44ADA) │  LTCG 112A 12.5%)│                   │
└────────┬────────┴────────┬────────┴────────┬────────┴─────────┬─────────┘
         │                 │                 │                  │
         └─────────────────┼─────────────────┴──────────────────┘
                           ▼
               ┌───────────────────────┐
               │ Normal Slab Taxable   │
               │        Income         │
               └───────────┬───────────┘
                           │
      ┌────────────────────┴────────────────────┐
      ▼                                         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│  New Tax Regime Slabs   │               │   Old Tax Regime Slabs  │
│  (Default for FY 26-27) │               │   (Less Chapter VI-A)   │
└────────────┬────────────┘               └────────────┬────────────┘
             │                                         │
             ▼                                         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│   + Special Rate Tax    │               │   + Special Rate Tax    │
│   (STCG 20% + LTCG 12.5%)│              │   (STCG 20% + LTCG 12.5%)│
└────────────┬────────────┘               └────────────┬────────────┘
             │                                         │
             ▼                                         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│  - Sec 87A Tax Rebate   │               │  - Sec 87A Tax Rebate   │
│  + 4% Health/Edu Cess   │               │  + 4% Health/Edu Cess   │
└────────────┬────────────┘               └────────────┬────────────┘
             │                                         │
             └────────────────────┬────────────────────┘
                                  ▼
                     ┌──────────────────────────┐
                     │ Optimal Regime Selection │
                     │   & Net Tax Savings      │
                     └──────────────────────────┘
```

---

## 🖥️ Application Implementation Details

* **Engine Module**: `/src/engine/comprehensiveTax.ts`
* **TypeScript Types**: `CapitalGainsInput`, `ComprehensiveTaxInput`, `ComprehensiveRegimeResult`, `ComprehensiveTaxResult` in `/src/engine/types.ts`
* **REST API Endpoint**: `POST /api/tax/comprehensive` in `/server.ts`
* **Interactive UI Tab**: `Multi-Head & Salary Tax` (`/src/components/ComprehensiveTaxTab.tsx`)
* **Unit Tests**: `/tests/comprehensiveTax.test.ts` (100% test coverage)
