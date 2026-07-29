# 📘 Businessकर: Freelancer & Presumptive Tax Engine
## End-User Feature & Value Guide (AY 2027-28 / FY 2026-27)

---

## 🌟 Executive Overview: Why Businessकर?

Filing income tax as an Indian freelancer, independent consultant, software professional, or small business owner is often confusing, time-consuming, and risky. Managing complex tax regulations like **Section 44ADA**, **Section 44AD**, quarterly **Advance Tax penalties under Section 234C**, **Capital Gains taxes (STCG & LTCG)**, and **Cash Deposit limits** can lead to overpaying taxes or facing scrutiny from the Income Tax Department.

**Businessकर** is a complete, rules-as-code Tax Computation and Compliance Portal engineered specifically for modern Indian professionals. Whether you earn through domestic freelance contracts, salary plus freelance work, international client exports, or stock market investments, **Businessकर** calculates your exact tax liability, optimizes your tax regime selection, monitors banking surveillance risks, and exports official **ITR-4 (Sugam) JSON payloads** for 1-click filing.

---

## 🚀 Key Value Propositions for End Users & Prospective Users

| Value Driver | What You Get | How It Helps You Save Time & Money |
| :--- | :--- | :--- |
| **💰 Maximize Tax Savings** | Real-time comparative engine evaluating New Tax Regime (Sec 115BAC) vs Old Tax Regime. | Instantly reveals which regime saves you thousands of rupees (e.g., up to ₹1,11,800+ in tax savings). |
| **⚡ Presumptive Tax Privileges** | Automated eligibility and tax computation under Section 44ADA (50% deemed profit) & 44AD (6%/8% deemed profit). | Legally declare 50% or less of gross receipts as income without needing painful itemized expense receipts or books of accounts audit. |
| **🏢 Multi-Head Income Support** | Consolidates Salary + Freelance + Stock Market Capital Gains + Bank Interest into one unified calculation. | Perfect for salaried employees doing freelancing or stock investing on the side. No manual spreadsheet math required. |
| **🛡️ Tax Scrutiny Protection** | SFT cash surveillance monitor analyzing high-value bank deposits against Income Tax Department (AIS/26AS) triggers. | Prevents high-value deposit notices, Section 269ST violations, and loss of digital turnover privileges. |
| **🌐 Foreign Income & LUT Export** | GST Zero-Rated invoice exporter with automated Letter of Undertaking (LUT) statutory declarations. | Export services to US/EU/UK clients legally with 0% IGST, compliant with FEMA and FIRC regulations. |
| **📄 1-Click Official ITR-4 Upload** | Instant generation and download of CBDT-compliant official ITR-4 (Sugam) JSON e-filing payload. | Upload directly to the Income Tax Department e-filing portal (`incometax.gov.in`) without paying high CA software fees. |

---

## 🔍 Module-by-Module Feature Breakdown

### 1. 🔐 Secure User Authentication & Session Management
* **Flexible Signup**: Create an account in seconds using either your **Email Address** (e.g. `name@domain.com`) or **10-digit Indian Mobile Number** (`9876543210`) with a static password.
* **Instant Session Gatekeeper**: Ensures your sensitive financial inputs are private and only accessible during your authenticated session.
* **Header Profile Badge**: Displays your registered name, identifier type, and a quick 1-click **Logout** button on every page.
* **Pre-Populated Demo Accounts**: Test-drive the app instantly with built-in demo credentials (`rahul@businesskar.in` / `password123` or `9876543210` / `password123`).

---

### 2. 🧮 Presumptive Tax Engine Calculator (`Engine Calculator`)
* **Section 44ADA (Specified Professionals)**:
  * Designed for software developers, designers, doctors, lawyers, consultants, accountants, and creative artists.
  * Presumptive rate: **50% of gross receipts** declared as deemed taxable profit.
  * Turnover limit: Up to **₹50 Lakhs** (or **₹75 Lakhs** if cash receipts are ≤ 5%).
* **Section 44AD (Small Businesses & Retailers)**:
  * Presumptive rates: **6% on digital/banking receipts** and **8% on cash receipts**.
  * Turnover limit: Up to **₹2 Crores** (or **₹3 Crores** if cash receipts are ≤ 5%).
* **Dynamic Regime Optimization**:
  * Calculates tax liability under both **New Tax Regime** (Finance Act 2026 slab rates with default Section 87A rebate) and **Old Tax Regime** (including Section 80C, 80D, and Chapter VI-A deductions).
  * Recommends the optimal regime with an exact breakdown of **Net Tax Savings**.
* **1-Click PDF Tax Report**: Download an official, beautifully styled PDF summary report complete with breakdown tables and compliance stamps for your CA or bank records.

---

### 3. 💼 Multi-Head & Salary Tax Calculator (`Multi-Head & Salary Tax`)
* **Salary Income Integration**:
  * Incorporates salaried income with automatic application of the **Salaried Standard Deduction** (₹75,000 under New Regime / ₹50,000 under Old Regime).
* **Capital Gains Special Rates Engine**:
  * **STCG Equity (Sec 111A)**: Computed at the statutory 20% special flat rate.
  * **LTCG Equity (Sec 112A)**: Applies the initial **₹1,25,000 exemption limit**, taxing remaining gains at 12.5%.
  * **LTCG Other (Sec 112)**: Handles real estate, gold, and unlisted securities at 12.5%.
* **Unexhausted Basic Exemption Set-Off**:
  * Automatically applies the basic exemption set-off rule for resident individuals if normal slab income is below the basic exemption threshold (₹4,00,000 in New Regime), offsetting special rate capital gains tax to ₹0.
* **Quick Scenario Presets**: 1-click loading for *Salaried Freelancers*, *Stock Trader Consultants*, and *Full-Spectrum Real Estate Investors*.

---

### 4. 🤖 AI Tax Advisor (`Tax Advisor`)
* **Gemini AI Integration**: Powered by Google DeepMind's Gemini model (with an offline rule-based fallback).
* **Personalized Compliance Tips**: Analyzes your specific financial numbers to generate actionable advice on:
  * Section 115BAC election strategy.
  * Cash transaction risk warnings under Section 269ST.
  * Advance Tax deadline countdowns.
  * Business expense deduction eligibility for office laptops, software subscriptions, broadband, and travel.
  * GST LUT filing guidelines for international freelancers.

---

### 5. ⚠️ Cash Surveillance & Banking Audit Monitor (`CashSurveillance`)
* **SFT-005 & SFT-004 High-Value Deposit Warnings**:
  * Tracks bank cash deposits against Income Tax Department Statement of Financial Transactions (SFT) reporting thresholds (₹10 Lakhs in savings accounts, ₹50 Lakhs in current accounts).
* **Cash Receipt Ratio Check**:
  * Verifies if cash receipts exceed 5% of gross turnover, which determines whether higher presumptive limits (₹75L / ₹3Cr) apply.
* **Section 269ST Violation Alert**:
  * Warns if cash transactions exceed ₹2 Lakhs per day per event, which incurs 100% penalty under Indian tax law.

---

### 6. 📅 Advance Tax & Section 234C Penalty Simulator (`Advance Tax & 234C`)
* **Section 211(1)(b) Presumptive Advantage**:
  * Highlights the statutory privilege that taxpayers under Section 44AD and 44ADA are **exempt from June, September, and December quarterly installments** and can pay 100% advance tax in a single installment on or before **March 15**.
* **Interest Penalty Calculator**:
  * Computes interest penalties under **Section 234C** (1% per month for deferment) and **Section 234B** (for tax shortfall at year-end).
  * Displays an interactive payment schedule table showing exact due dates and amounts.

---

### 7. 🌐 Export Invoice & GST LUT Generator (`Zero-Rated Export Invoice`)
* **For Global Freelancers & Service Exporters**:
  * Generate GST-compliant Zero-Rated invoices for clients in the US, Europe, UK, Australia, Singapore, etc.
* **LUT Declaration & 0% IGST**:
  * Automatically embeds mandatory statutory declarations under **Rule 96A of CGST Rules** (Export under Letter of Undertaking without payment of IGST).
* **FEMA & FIRC Guidelines**:
  * Includes compliance guidelines for receiving foreign inward remittances through banking channels / PayPal / Wise and securing Foreign Inward Remittance Certificates (FIRC/BRC).

---

### 8. 📄 Government ITR-4 (Sugam) Section Explorer, Validator & JSON Exporter (`ITR-4 JSON Mapper`)
* **Interactive Section Explorer**:
  * Browse every section of the official ITR-4 form (Creation Metadata, Personal Info, Business & Nature Classification, Income & Presumptive Profit, Tax Computation, Advance Tax/TDS Credits, and Bank Details).
* **Automated Pre-Filing Schema Validation**:
  * Real-time compliance engine (`validateITR4SchemaCompliance`) validating 10-character PAN regex, 11-character RBI IFSC bank codes, CBDT Nature of Business classification (e.g. `09028` for Software Consulting), primary bank account configuration for electronic refund credit, and Section 44ADA 50% profit floor compliance.
* **Smart Search & Filter Bar**:
  * Filter form sections by keyword (e.g. `"44ADA"`, `"Rebate"`, `"139(1)"`, `"PAN"`, `"IFSC"`, `"Business"`) or category.
* **Official CBDT Filing Instructions & Step-by-Step Upload Guide**:
  * Read official Income Tax Department field explanations and follow a 5-step checklist for uploading the generated JSON directly to `incometax.gov.in` under AY 2027-28 Offline Filing mode.
* **1-Click Official JSON Export**:
  * Download the compiled, schema-validated JSON payload ready to upload directly to the e-filing portal without paying high CA software fees.

---

### 9. 🔍 Schema & Rule Engine Inspector (`Schema Inspector`)
* **Complete Transparency**:
  * Inspect the underlying JSON tax rules engine (`taxSchema.json`) governing all slab calculations, cess rates, rebate limits, and presumptive thresholds.
  * Verified for **Assessment Year 2027-28 (Financial Year 2026-27)** per the latest Indian tax laws.

---

## 🎯 How to Get Started in 3 Simple Steps

1. **Sign Up / Log In**:
   - Open the portal and enter your Email ID or 10-digit Indian Mobile Number with a password (or click a quick demo account).
2. **Enter Your Numbers**:
   - Input your gross receipts in the **Engine Calculator** or aggregate income in the **Multi-Head & Salary Tax** tab.
3. **Download Your Tax Plan & ITR-4 JSON**:
   - Review your recommended regime savings, download your PDF calculation report, and export your official ITR-4 JSON file for hassle-free e-filing!

---

## 🛡️ Trust, Privacy & Accuracy Statement

* **Local & Client-Side Execution**: Your tax calculations run in your secure environment.
* **Up-to-Date Rules**: Updated for **AY 2027-28 / FY 2026-27** matching official CBDT circulars and Finance Act specifications.
* **Audit-Ready Compliance**: Designed according to verified Rules-as-Code (RaC) statutory logic.
