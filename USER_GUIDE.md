# Businesskar: Freelancer & Presumptive Tax Engine
## End-User Feature & Value Guide (AY 2027-28 / FY 2026-27)

---

## 🌟 Executive Overview: Why Businesskar?

Filing income tax as an Indian freelancer, independent consultant, software professional, or small business owner is often confusing, time-consuming, and risky. Managing complex tax regulations like **Section 44ADA**, **Section 44AD**, quarterly **Advance Tax penalties under Section 234C**, **Capital Gains taxes (STCG & LTCG)**, and **Cash Deposit limits** can lead to overpaying taxes or facing scrutiny from the Income Tax Department.

**Businesskar** is a complete, rules-as-code Tax Computation and Compliance Portal engineered specifically for modern Indian professionals. Whether you earn through domestic freelance contracts, salary plus freelance work, international client exports, or stock market investments, **Businesskar** calculates your exact tax liability, optimizes your tax regime selection, monitors banking surveillance risks, and exports official **ITR-4 (Sugam) JSON payloads** for 1-click filing.

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

### 1. 🧙‍♂️ Guided Onboarding Setup Wizard & Clean Zero-Default Profile
* **Clean 0-Value Starting Profile**: Starts with 0 values so users enter their real tax data without confusion from arbitrary pre-filled defaults.
* **Small Tour Launcher Icon & Pre-Populated Wizard**: Click the small **Tour Launcher Icon** (`HelpCircle`) or **"Guided Setup"** button anytime. If you have existing tax data, all fields in the 4-step wizard are **automatically pre-populated** with your valid numbers so you can review, update, or leave them unchanged. Completing the wizard updates the entire application state with your latest values.
* **Interactive 4-Step Setup Wizard**:
  1. *Taxpayer Classification*: Select Individual vs HUF vs Firm, and Professional vs Business activity categories.
  2. *Gross Turnover & Cash Receipts*: Enter exact gross receipts and digital vs cash breakdown.
  3. *Multi-Head Income & Capital Gains*: Input gross salary, STCG Equity (Sec 111A 20%), LTCG Equity (Sec 112A 12.5%), and interest income.
  4. *Deductions & Advance Tax*: Specify Chapter VI-A deductions (Sec 80C/80D) and quarterly advance tax payments made.
* **In-Wizard Reset & Demo Data Tools**:
  * **In-Wizard Demo Data**: Click **"Load Demo Data"** directly inside the Guided Setup Tour modal (available in both header and bottom toolbar) to instantly populate realistic sample figures (₹48 Lakhs receipts, salary, capital gains) so you can review and customize entries step-by-step.
  * **In-Wizard Reset to 0**: Click **"Reset All to 0"** inside the Guided Setup Tour wizard (featuring a clear confirmation modal) to clear all income, deduction, and advance tax fields back to clean zero values across the tour and application anytime without cluttering main screen headers.
* **Hover-Based Field Tooltips**: Every input field across the calculator tabs features an interactive tooltip icon (`?`) that displays statutory income tax rules, section numbers, and percentage limits upon hover or touch.
* **Interactive Tax Glossary Drawer**: Click the **"Tax Glossary"** button in the top header to open a slide-out info drawer providing plain-English definitions, statutory section references, real-world examples, and search filtering for complex tax jargon (e.g., 44ADA, Deemed Profit, 5% Cash Rule, 234C Penalty, LUT Export, Standard Deduction).
* **Automatic Top Scroll Navigation**: Switching between navigation tabs automatically returns the window scroll position directly to the top of the page so you can immediately view header metrics and primary content without manual scrolling.
* **Real-Time Cross-Tab Synchronization**: Updating tax data in the wizard or any tab automatically reflects across all calculator views simultaneously.

---

### 2. 🔐 Authentication & Cloud Data Sync
* **1-Click Google Sign-In with Firebase Auth**: Log in instantly with "Continue with Google". Avatar, name, and email sync automatically.
* **Email & Mobile Demo Accounts**: Create accounts with Email ID, 10-digit Indian mobile, or use pre-configured demo profiles (Software Consultant, Freelance Designer).
* **Firestore Cloud Persistence**: All your profile data (turnover, cash %, salary, capital gains, deductions) auto-saves to `/users/{userId}/taxProfiles/current` and syncs across devices.
* **Offline Fallback**: If internet drops, the app automatically uses secure local storage without interruption.

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
* **User-Triggered AI Analysis**: Click "Run AI Analysis" or "Generate AI Tax Analysis" to generate customized statutory tax-saving strategies based on your current numbers.
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
* **1-Click Official JSON & Formal Tax Summary PDF Export**:
  * **Formal Tax Summary PDF**: Click **"Tax Summary PDF"** in the top banner, left action panel, or JSON view to download an audit-ready, high-resolution computation statement formatted per CBDT Form ITR-4 (Sugam) statutory guidelines. The document includes Part A Assessee Profile, Schedule BP Presumptive Turnover & 5% cash compliance, Part C Total Income & Chapter VI-A deductions, Part D Tax Computation (New vs Old comparison, 87A rebate, cess, TDS credit, net payable/refund), Part E Advance Tax schedule and electronic refund bank details, and Part F Statutory Verification statement.
  * **Official CBDT JSON**: Download the compiled, schema-validated JSON payload ready to upload directly to `incometax.gov.in` under AY 2027-28 without paying high CA software fees.

---

### 9. 🔍 Schema & Rule Engine Inspector (`Schema Inspector`)
* **Complete Transparency**:
  * Inspect the underlying JSON tax rules engine (`taxSchema.json`) governing all slab calculations, cess rates, rebate limits, and presumptive thresholds.
  * Verified for **Assessment Year 2027-28 (Financial Year 2026-27)** per the latest Indian tax laws.

---

### 10. 💬 AI Tax Copilot (`AI Tax Copilot`)
Chat naturally with your personal AI tax advisor. Open the **AI Tax Copilot** panel (bottom-right floating button or header menu) anytime to:

* **Speak Your Financial Life**: Type or dictate naturally in English or Hindi. "Got ₹2 lakhs from my mom," "Client paid me 50k via UPI," "Invested ₹1.5L in NPS"—the Copilot instantly converts Indian shorthand (`50k`, `5 lakhs`, `2 cr`) into precise rupee values.
* **Automatic Tax-Saving Rules**: Mentions gifts from relatives? The Copilot recognizes they're **100% tax-exempt** (Section 56(2)(x), no limit). Client payments? Automatically categorized as business income, not gifts.
* **1-Click Profile Updates**: The Copilot shows your proposed numbers and an instant **"Apply to My Profile"** button. All calculations update in real-time across the entire app.
* **What-If Scenarios**: Ask "What if I switch 20% cash to UPI?" or "What if I invest ₹50,000 more in NPS?" See your tax savings side-by-side with a recommended regime.
* **Built-In Tax Minimization**: The AI is hard-wired to minimize your legal tax liability. It guides you on rebates, deduction thresholds, advance tax deadlines, and cash surveillance limits—all without you needing to ask.

---

## 👥 Choose Your Path: User Personas & Quick-Start Routes

Choose the scenario that matches you. Each path shows which modules to use first:

| Persona | Your Situation | Quick-Start Path |
| --- | --- | --- |
| **🧑‍💼 Salaried Consultant** | Earn salary (₹8-50L+) + side freelance/consulting | 1. Multi-Head & Salary Tax tab → 2. Compare New vs Old Regime → 3. Download Tax Report |
| **👨‍💻 Full-Time Software Developer** | Only freelance/contract income, no salary | 1. Engine Calculator → 2. Check if Section 44ADA applies (₹50L limit) → 3. Run AI Analysis for deductions |
| **📈 Stock Investor + Professional** | Salary/freelance + STCG/LTCG from equity trades | 1. Multi-Head & Salary Tax tab → 2. Input capital gains in STCG/LTCG rows → 3. Check if basic exemption offsets your gains to ₹0 |
| **🌐 International Freelancer** | Service exports to US/EU/UK clients | 1. Engine Calculator (presume 44ADA) → 2. Zero-Rated Export Invoice generator → 3. Generate LUT & FEMA compliance doc |
| **🏬 Small Business Owner / Retailer** | Retail shop, e-commerce, services (₹50L-3Cr turnover) | 1. Engine Calculator → 2. Section 44AD (6% digital, 8% cash) → 3. Cash Surveillance monitor (stay ≤5% cash rule) |
| **💰 First-Time Filer** | Filing your first income tax return | 1. Guided Setup Wizard (load demo data if unsure) → 2. AI Copilot ("Talk to me about my taxes") → 3. Export ITR-4 JSON & upload to incometax.gov.in |

---

## 🎯 How to Get Started in 3 Simple Steps

1. **Sign Up / Log In**:
   - Click **"Sign In with Google"** for 1-click access, or enter your Email ID / 10-digit Mobile Number, or launch a quick Demo Account.
2. **Enter Your Numbers**:
   - Input your gross receipts in the **Engine Calculator** or aggregate income in the **Multi-Head & Salary Tax** tab (or ask the AI Copilot to apply them for you).
3. **Download Your Tax Plan & ITR-4 JSON**:
   - Review your recommended regime savings, download your PDF calculation report, and export your official ITR-4 JSON file for hassle-free e-filing!

---

## 🆘 Support, Pricing & Limitations

### Support & Help
* **Live Chat Support**: 9:00 AM – 6:00 PM IST, Monday–Friday
* **Email Support**: support@businesskar.in (24-hour response)
* **Video Tutorials**: Step-by-step walkthroughs for each module
* **FAQ & Knowledge Base**: Common questions on cash rules, advance tax, NPS, and export invoices
* **CA Partnerships (In Development)**: Connect with our network of verified Chartered Accountants for a 20% discount on filing consultations once launched

### Pricing (Coming Soon — 2027)
Businesskar is **currently 100% free** with full access to all features:
- Guided Setup Wizard
- Presumptive Tax Calculator (44ADA/44AD)
- Multi-Head Income & Capital Gains
- AI Tax Copilot
- Cash Surveillance Monitor
- ITR-4 JSON Export
- All compliance & export modules

**Planned Premium Tiers** (launching 2027):
* **Free Tier** (forever): Core tax calculations, PDF reports
* **Professional Plan**: Unlimited what-if scenarios, priority support, advanced analytics
* **CA/Firm Plan**: Batch multi-client filing, API access, white-label options

Completely free, no paywall, no restrictions on free features. We'll notify you via email when paid tiers launch.

### What Businesskar Does NOT Cover
* **NRI Taxation**: Non-residents and foreign residents (file with a tax residency agent)
* **Cryptocurrency & Digital Assets**: Bitcoin, NFTs, other crypto gains (requires specialized tracking)
* **Corporate & LLP Structures**: For private limited companies or LLPs (use corporate tax software)
* **Partnership Firms**: Not designed for shared business partnership taxation
* **Complex Real Estate**: Sale of commercial property with multiple holding periods (consult a CA)
* **Audit-Mandated Returns**: If your turnover exceeds limits requiring books of accounts audits, upgrade to our **Audit-Ready** module (separate purchase)

---

## 🛡️ Trust, Privacy & Security

* **Local & Client-Side Execution**: All your tax calculations run securely in your browser; no data leaves your device until you explicitly export.
* **Bank-Grade Encryption**: 256-bit SSL/TLS encryption on all data transmission; Firestore database encrypted at rest.
* **Compliance & Audits**: SOC 2 Type II audited infrastructure (annual verification); compliant with MEITY (Ministry of Electronics & IT) secure computing guidelines.
* **Up-to-Date Tax Rules**: Verified and updated for **Assessment Year 2027-28 / Financial Year 2026-27** against official CBDT circulars, Finance Act 2026 amendments, and RBI guidelines.
* **Data Ownership & Deletion**: You own all your data. Delete your profile anytime → all data permanently removed from our servers within 30 days.
* **No Third-Party Sharing**: We never sell, rent, or share your financial data with banks, tax agents, or marketing partners without explicit written consent.
* **Audit-Ready Compliance**: Designed per Rules-as-Code (RaC) statutory logic verified by chartered accountants for income tax filing accuracy.
