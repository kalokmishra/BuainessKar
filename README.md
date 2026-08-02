# Businessकर - Indian Tax Utility Engine & Mobile-First App (Section 44AD & Section 44ADA)

> **Businessकर: Rules-as-Code (RaC) Tax Utility Engine for Indian Freelancers, Consultants, and Micro-Businesses (FY 2026-27 / AY 2027-28)**

📖 **[Read the End-User & Prospective User Feature Guide (USER_GUIDE.md)](./USER_GUIDE.md)** for a complete overview of features, value drivers, and compliance benefits.

---

## 🌟 Key Features

1. **Guided Onboarding Setup Wizard & Clean Zero-Default Profile (`/src/components/GuidedOnboardingTour.tsx` & `/src/context/TaxDataContext.tsx`):**
   - Welcomes first-time users with a clean 0-value tax profile and an interactive 4-step wizard (Taxpayer Classification, Gross Turnover & Cash Receipts, Multi-Head Income & Capital Gains, and Deductions/Advance Tax).
   - In-wizard "Load Demo Data" and "Reset All to 0" tools inside the setup modal to populate sample figures (₹48 Lakhs receipts) or reset values, keeping top-level screens uncluttered and clean.
   - Synchronizes tax inputs seamlessly in real time across all calculation tabs (Calculator, Multi-Head, Cash Surveillance, Advance Tax, Export Invoice).

2. **Rules-as-Code (RaC) Architecture:**
   - All tax rules, turnover limits (₹50L / ₹75L / ₹2Cr / ₹3Cr), cash threshold percentages (5.0%), slab brackets, Section 87A rebates, SAC codes, and advance tax interest rates are dynamically loaded from version-controlled `taxSchema.json`.

3. **Eligibility & Workflow Routing (`/src/engine/eligibility.ts`):**
   - Automatically routes taxpayers to **Section 44ADA** (Professional 50% deemed profit), **Section 44AD** (Business 6% digital / 8% cash), or **Section 44AB Tax Audit** (for ineligible entities like LLPs/Companies, turnover limit breaches, or lower profit declarations).

4. **Cash Surveillance Engine (`/src/engine/cashSurveillance.ts`):**
   - Real-time monitoring of cash-to-gross receipts percentage.
   - Categorizes status into `NORMAL` (<4.5%), `TIER_1_WARNING` (4.5% - 5.0%), and `TIER_2_VIOLATION` (>5.0%) with localized bilingual alerts (English & Hindi/Hinglish).

5. **Old vs New Tax Regime Comparator (`/src/engine/presumptiveTax.ts`):**
   - Calculates deemed income and compares New Tax Regime vs Old Tax Regime tax liabilities.
   - Applies Section 87A rebate (up to ₹7,00,000 income under New Regime) and marginal relief, highlighting net tax savings.

6. **Scenario History & Local Storage Persistence:**
   - Allows users to save calculation scenarios locally in their browser.
   - Browse saved calculations history, review key metrics (Turnover, Deemed Profit, Recommended Tax, Net Savings), load previous scenarios into the calculator with one click, or clear history.

7. **Formatted PDF Tax Report Export (`/src/utils/pdfExporter.ts`):**
   - Export calculation results into a formatted, high-resolution PDF report.
   - Contains Assessee Profile, Section 44AD/44ADA Eligibility Evaluation, Old vs New Regime Tax Line-Item Breakdown, Net Tax Savings Banner, and Section 211 Advance Tax Payment Schedule.

8. **AI Tax Advisor (`/src/engine/aiAdvisor.ts`):**
   - Integrated with Gemini 3.6 Flash for intelligent tax query advisory and statutory planning.
   - User-triggered AI analysis ("Run AI Analysis") with rule-based offline fallbacks for seamless availability even without internet or API key configuration.

9. **Advance Tax & Section 234C Penalty Planner (`/src/engine/advanceTax.ts`):**
   - Calculates quarterly installment targets (June 15, Sept 15, Dec 15, March 15).
   - Highlights **Section 211(1)(b) Statutory Privilege** for presumptive taxpayers (single March 15 payment deadline with exemption from Q1-Q3 Section 234C interest penalties).

10. **Cross-Border Export & GST Invoice Engine (`/src/engine/invoiceExporter.ts`):**
    - Auto-maps Service Accounting Codes (e.g., `998314` for IT Consultancy).
    - Auto-attaches mandatory statutory LUT disclaimer text for zero-rated exports.

11. **Government ITR-4 (Sugam) JSON Mapper & Pre-Filing Validator (`/src/engine/itr4Schema.ts`):**
    - Exports financial calculation states directly into official Indian Income Tax Department ITR-4 field identifiers.
    - Features automated Schema Compliance Validation (`validateITR4SchemaCompliance`) checking PAN format regex, RBI IFSC bank branch validity, Nature of Business CBDT codes (e.g. 09028), primary refund account configuration, and Section 44ADA 50% profit floor checks.
    - Provides an interactive section explorer, search and filter bar, statutory guidelines, and 1-click JSON download for e-filing.

12. **Multi-Head & Salary Tax Calculator Engine (`/src/engine/comprehensiveTax.ts`):**
    - Aggregates multi-head income across Salary (net of Salaried Standard Deduction ₹75,000 New / ₹50,000 Old), Freelance Presumptive Business/Profession (Sec 44AD/44ADA), Capital Gains (STCG Sec 111A at 20%, LTCG Sec 112A at 12.5% above ₹1.25L exemption, LTCG Sec 112), and Other Income.
    - Provides a comprehensive side-by-side tax liability overview comparing New vs Old Tax Regimes with basic exemption set-off and Section 87A rebate rules for FY 2026-27 (AY 2027-28).

13. **User Authentication & Session Management (`/src/context/AuthContext.tsx`, `/src/components/LoginModal.tsx` & `/src/components/ChangePasswordModal.tsx`):**
    - Gatekeeps app access so only authenticated users can access tax calculation features.
    - Supports user signup and login via Email ID or 10-digit Indian Mobile Number with static password verification and localStorage persistence.
    - Features top-right user profile dropdown menu (with Reset Password modal trigger and Logout), "Forgot password?" admin contact notice (`contactadmin@businesskar.com`) on the login screen, and automatic window scroll-to-top on tab navigation.
    - Includes interactive hover-based **Field Tooltips** (`/src/components/FieldTooltip.tsx`) across all calculator inputs and a slide-out **Tax Glossary Info Drawer** (`/src/components/TaxInfoDrawer.tsx`) offering plain-English definitions and section references for non-financial users.

---

## 🚀 Quick Start & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Application (Express API + Vite React UI)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Unit Test Suites
```bash
npm test
```
Runs 31 automated unit tests across 9 test suites using Vitest covering all core engine edge cases.

### 4. Build & Run Production Server
```bash
npm run build
npm start
```

---

## 📁 Repository Directory Structure

```
├── taxSchema.json                 # Core Rules-as-Code tax schema payload
├── server.ts                      # Express server exposing REST APIs and Vite middleware
├── ARCHITECTURE.md                # System architecture documentation
├── INTERN_OPERATIONS_GUIDE.md     # Intern troubleshooting & operational guide
├── MULTI_HEAD_TAX_GUIDE.md        # Multi-Head Salary & Capital Gains guide
├── USER_GUIDE.md                  # Comprehensive end-user feature guide
├── README.md                      # Application documentation
├── package.json                   # Dependencies & build scripts
├── src/
│   ├── config/
│   │   └── taxSchema.json         # Module schema source
│   ├── engine/
│   │   ├── types.ts               # Core TypeScript interfaces & types
│   │   ├── schemaLoader.ts        # RaC schema parser and dynamic setter
│   │   ├── eligibility.ts         # Module 1: Entity eligibility & routing
│   │   ├── cashSurveillance.ts    # Module 2: Cash % monitor & alert levels
│   │   ├── presumptiveTax.ts      # Module 3: Deemed profit & regime tax calculator
│   │   ├── advanceTax.ts          # Module 4: Advance tax schedule & 234C penalties
│   │   ├── invoiceExporter.ts     # Module 5: GST & LUT Zero-Rated Export invoice metadata
│   │   ├── itr4Schema.ts          # Module 6: Official ITR-4 Sugam JSON exporter & validator
│   │   ├── aiAdvisor.ts           # Module 7: Gemini AI Tax Advisor & offline fallback
│   │   └── comprehensiveTax.ts    # Module 8: Multi-Head Salary & Capital Gains Tax Calculator engine
│   ├── context/
│   │   ├── AuthContext.tsx        # User Authentication & Session state management
│   │   └── TaxDataContext.tsx     # Global shared tax data state & onboarding context
│   ├── utils/
│   │   └── pdfExporter.ts        # PDF Report Exporter (jsPDF engine)
│   ├── components/
│   │   ├── Header.tsx             # Navigation header & User Profile badge with Tax Glossary launcher
│   │   ├── LoginModal.tsx         # User authentication modal (Email / Mobile Number)
│   │   ├── ChangePasswordModal.tsx# Reset password modal
│   │   ├── FieldTooltip.tsx       # Interactive hover-based tax rule tooltips
│   │   ├── TaxInfoDrawer.tsx      # Slide-out Tax Terms & Glossary Info Drawer
│   │   ├── GuidedOnboardingTour.tsx# Interactive 4-step onboarding setup wizard modal
│   │   ├── OnboardingPromptBanner.tsx# Top banner prompt with Zero Data vs Demo Data indicator
│   │   ├── CalculatorTab.tsx      # Interactive presumptive calculator with Local Storage & PDF export
│   │   ├── ComprehensiveTaxTab.tsx# Multi-Head Salary & Capital Gains Tax Calculator
│   │   ├── CashSurveillanceTab.tsx# Cash threshold surveillance dashboard
│   │   ├── AdvanceTaxTab.tsx      # Quarterly advance tax planner
│   │   ├── ExportInvoiceTab.tsx   # Cross-border export invoice generator
│   │   ├── ITR4MapperTab.tsx      # Official ITR-4 Sugam JSON mapper & live editor
│   │   ├── AIAdvisorTab.tsx       # AI Tax Advisor interface
│   │   └── SchemaInspectorTab.tsx # Tax Rates & Rules Config (JSON Schema Inspector & live updater)
│   ├── App.tsx                    # Main React application
│   ├── main.tsx                   # React DOM entrypoint
│   └── index.css                  # Tailwind CSS styling
└── tests/                         # Automated Vitest test suites
    ├── eligibility.test.ts
    ├── cashSurveillance.test.ts
    ├── presumptiveTax.test.ts
    ├── advanceTax.test.ts
    ├── invoiceExporter.test.ts
    ├── itr4Schema.test.ts
    ├── aiAdvisor.test.ts
    ├── comprehensiveTax.test.ts
    └── auth.test.ts
```

---

## ⚖️ Legal & Compliance Disclaimer
Outputs produced by this software are automated estimations based on user inputs and statutory rules specified in `taxSchema.json` for FY 2026-27 / AY 2027-28 under the Indian Income Tax Act (as amended). This application does not constitute formal legal or Chartered Accountancy advice.
