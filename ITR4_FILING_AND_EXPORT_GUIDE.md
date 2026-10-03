# 📄 Form ITR-4 (Sugam) Filing & Formal PDF Export Guide
## Assessment Year 2027-28 (Financial Year 2026-27)

This guide documents the statutory requirements, architecture, pre-filing validation rules, formal PDF document export, and e-filing upload procedures for **Form ITR-4 (Sugam)** in **Businesskar**.

---

## 1. Statutory Context & Scope

**ITR-4 (Sugam)** is the official simplified income tax return form provided by the Central Board of Direct Taxes (CBDT), Government of India, for resident individuals, Hindu Undivided Families (HUFs), and partnership firms (other than LLPs) deriving business or professional income under the **Presumptive Taxation Scheme**:

- **Section 44AD (Eligible Small Businesses)**:
  - Turnover threshold: Up to **₹2 Crores** (extended to **₹3 Crores** where aggregate cash receipts do not exceed 5% of gross turnover).
  - Minimum statutory deemed profit rate: **6%** on receipts received through digital/banking modes, and **8%** on cash receipts.
  - Advance Tax privilege: Single 100% installment on or before **March 15** under Section 211(1)(b), exempt from quarterly Section 234C interest penalties.
- **Section 44ADA (Specified Professionals)**:
  - Gross professional receipts: Up to **₹50 Lakhs** (extended to **₹75 Lakhs** where cash receipts do not exceed 5%).
  - Minimum statutory deemed profit rate: **50%** of gross professional receipts.
  - Advance Tax schedule: Standard 4 quarterly installments (June 15, Sept 15, Dec 15, March 15).
- **Default Tax Regime**:
  - For AY 2027-28 (FY 2026-27), the **New Tax Regime under Section 115BAC** is the default statutory regime.
  - Rebate under Section 87A provides **zero tax liability** for taxable income up to **₹7,00,000** in the New Regime.
  - Assessees may optionally opt for the Old Tax Regime to claim Chapter VI-A deductions (80C, 80D, 80CCD(1B)).

---

## 2. Formal ITR-4 Tax Summary Document (PDF Export)

The **ITR-4 Section Explorer & JSON Generator** (`ITR4MapperTab.tsx`) includes an export engine (`generateITR4SummaryPdf` in `src/utils/pdfExporter.ts`) that generates a formal, high-resolution computation statement formatted per CBDT Form ITR-4 standards.

### Summary Document Sections

| Section Block | Content & Statutory Reference | Visual Treatment |
|---|---|---|
| **Document Header** | FORM ITR-4 (SUGAM) - COMPUTATION OF TOTAL INCOME & TAX<br>AY 2027-28 / FY 2026-27 | Dark slate banner (`#0f172a`), emerald subtitle |
| **PART A: Taxpayer Profile** | Assessee Name, PAN, Business/Profession Activity Code (`09028`), Trade Name, Elected Tax Regime (New vs Old), and Filing Section (`139(1)` on or before due date). | Slate border card, bold PAN identifier |
| **PART B: Schedule BP (Presumptive Turnover)** | Gross Turnover, Digital vs Cash receipts breakup, Cash % with **5% Threshold Compliance Status**, Applicable Section (44AD or 44ADA), Presumptive Rate, and Calculated Deemed Profit. | Color-coded status badge (Emerald compliant / Amber exceeding) |
| **PART C: Statement of Total Income** | Presumptive Business/Professional Income, Gross Total Income (GTI), allowed Chapter VI-A Deductions, and Net Taxable Income. | Two-column financial summary |
| **PART D: Tax Computation & Comparison** | Table comparing **New Regime (Sec 115BAC)** vs **Old Tax Regime**: Base Tax, Section 87A Rebate, Cess (4%), Gross Tax Liability, Less: TDS Claimed, and Net Balance Payable or Refund Due. | Side-by-side comparison table with highlighted outcome banner (Blue for Refund / Amber for Tax Payable) |
| **PART E: Advance Tax Compliance & Bank Details** | Section 211 installment compliance notes, Section 234C interest penalty breakdown, and designated Primary Bank Account for electronic ECS/NEFT refund credit (Bank Name, Masked Account, RBI IFSC Code). | Formal audit card |
| **PART F: Statutory Verification** | Formal Rule 12 verification statement: *"I solemnly declare that to the best of my knowledge and belief, the details provided in this return computation are correct and complete..."* with verification date and assessee signature block. | Certified legal signature block |

### How to Download the PDF
1. Navigate to the **ITR-4 JSON Mapper** tab.
2. Ensure your PAN, Name, Business Code, Trade Name, and Bank Details are filled in or loaded from your profile.
3. Click any of the **"Tax Summary PDF"** buttons:
   - In the **Top Banner** action bar.
   - In the **Left Column** under the Formal Tax Summary card.
   - In the **Section Guide** quick action bar.
   - In the **Raw JSON** header next to the Copy and Download buttons.
4. The document is generated instantly and saved as:
   ```
   ITR4_Sugam_Tax_Summary_<PAN>_AY2027-28.pdf
   ```

---

## 3. Pre-Filing Validation Engine (`validateITR4SchemaCompliance`)

Before generating the official JSON payload or filing on the portal, the application runs automated pre-filing compliance checks:

1. **PAN Format Verification**:
   - Must strictly match the 10-character alphanumeric regex `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`.
2. **RBI IFSC Bank Branch Validation**:
   - Must strictly match the 11-character RBI branch code regex `^[A-Z]{4}0[A-Z0-9]{6}$`.
3. **Primary Refund Account Configuration**:
   - At least one validated bank account must be flagged as `isPrimaryForRefund: true` to prevent rejection by the IT Department's Centralized Processing Center (CPC).
4. **Section 44ADA 50% Profit Floor Compliance**:
   - Verifies that declared presumptive income is at least 50% of gross professional receipts.
5. **Turnover & Cash Limit Verification**:
   - Evaluates whether turnover qualifies for the standard limits (₹2 Cr for 44AD / ₹50L for 44ADA) or requires cash receipts to remain `<= 5%` for extended limits (₹3 Cr / ₹75L).

---

## 4. Official CBDT e-Filing Upload Walkthrough

Once the JSON file and formal PDF summary are downloaded:

```
Step 1: Download Files
        ├── Download ITR-4 JSON (ITR4_AY2027-28_<PAN>.json)
        └── Download Formal Tax Summary PDF for your audit dossier

Step 2: Log In to Portal
        └── Open https://www.incometax.gov.in and log in with PAN & Password

Step 3: Access Offline Filing Mode
        └── Navigate to: e-File > Income Tax Returns > File Income Tax Return

Step 4: Select Filing Parameters
        ├── Assessment Year: 2027-28
        ├── Filing Status: Original u/s 139(1)
        ├── Filing Mode: Offline (Upload JSON)
        └── ITR Form: Form ITR-4 (Sugam)

Step 5: Upload & e-Verify
        ├── Drag & drop the downloaded JSON file
        ├── Review pre-filled computation against your Tax Summary PDF
        └── Complete e-Verification via Aadhaar OTP or Net Banking
```

---

## 5. Architectural Implementation Reference

| Component / Utility | File Path | Responsibilities |
|---|---|---|
| `generateITR4SummaryPdf` | `src/utils/pdfExporter.ts` | Generates the formal A4 statutory tax summary document in jsPDF. |
| `generateITR4Json` | `src/engine/itr4Schema.ts` | Serializes calculated financial state into official CBDT schema JSON structure. |
| `validateITR4SchemaCompliance` | `src/engine/itr4Schema.ts` | Validates PAN, IFSC, profit floors, and bank account requirements. |
| `ITR4MapperTab.tsx` | `src/components/ITR4MapperTab.tsx` | Full UI with Section Guide explorer, search/filter engine, input editor, validation banner, and PDF/JSON download buttons. |
| `tests/itr4Schema.test.ts` | `tests/itr4Schema.test.ts` | Automated unit test suite verifying schema compliance, JSON output, and PDF document generation. |
