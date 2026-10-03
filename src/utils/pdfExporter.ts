import { jsPDF } from 'jspdf';
import { EligibilityResult, PresumptiveTaxResult, AdvanceTaxResult, EntityType } from '../engine/types';

interface TaxPdfExportData {
  entityType: EntityType;
  activityType: 'PROFESSION' | 'BUSINESS';
  categoryLabel: string;
  grossReceipts: number;
  cashReceipts: number;
  chapterVIADeductions: number;
  eligibility: EligibilityResult | null;
  presumptive: PresumptiveTaxResult | null;
}

export const generateTaxCalculationPdf = (data: TaxPdfExportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = '#059669'; // Emerald 600
  const darkSlate = '#0f172a'; // Slate 900
  const textGray = '#475569'; // Slate 600
  const lightBg = '#f8fafc'; // Slate 50
  const formatINR = (val: number) => `INR ${(val || 0).toLocaleString('en-IN')}`;

  let yPos = 15;

  // Title Header Block
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Businesskar - PRESUMPTIVE TAX EVALUATION REPORT', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text('Financial Year 2026-27 | Assessment Year 2027-28 (Sec 44AD / 44ADA)', 14, 21);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Rules-as-Code Engine v1.0`, 14, 27);

  yPos = 40;

  // Section 1: Assessee & Turnover Profile
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, 182, 38, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Assessee & Turnover Profile', 18, yPos + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.text(`Entity Type:`, 18, yPos + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.entityType}`, 50, yPos + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Activity Category:`, 110, yPos + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.categoryLabel}`, 145, yPos + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Gross Annual Turnover:`, 18, yPos + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`${formatINR(data.grossReceipts)}`, 58, yPos + 23);

  const cashPct = data.grossReceipts > 0 ? ((data.cashReceipts / data.grossReceipts) * 100).toFixed(1) : '0';
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Cash Portion:`, 110, yPos + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(Number(cashPct) > 5 ? 225 : 15, Number(cashPct) > 5 ? 29 : 23, Number(cashPct) > 5 ? 72 : 42);
  doc.text(`${formatINR(data.cashReceipts)} (${cashPct}%)`, 145, yPos + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Chapter VI-A Deductions:`, 18, yPos + 31);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatINR(data.chapterVIADeductions)} (Old Regime Only)`, 62, yPos + 31);

  yPos += 45;

  // Section 2: Statutory Eligibility & Routing
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, 182, 32, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Section 44AD / 44ADA Eligibility Evaluation', 18, yPos + 7);

  if (data.eligibility) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Workflow Route:`, 18, yPos + 15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(data.eligibility.isEligible ? 5 : 225, data.eligibility.isEligible ? 150 : 29, data.eligibility.isEligible ? 105 : 72);
    doc.text(`${data.eligibility.workflowRoute}`, 50, yPos + 15);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Turnover Limit Applied:`, 110, yPos + 15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${formatINR(data.eligibility.applicableTurnoverLimit)}`, 150, yPos + 15);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Recommendation:`, 18, yPos + 23);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${data.eligibility.recommendation}`, 50, yPos + 23, { maxWidth: 140 });
  }

  yPos += 39;

  // Section 3: Presumptive Deemed Profit & Tax Liability Summary
  if (data.presumptive) {
    const p = data.presumptive;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, yPos, 182, 78, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. Presumptive Income & Tax Regime Comparison', 18, yPos + 7);

    // Deemed Income Row
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Presumptive Rate Applied:`, 18, yPos + 15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${p.presumptiveRateAppliedText}`, 62, yPos + 15);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Calculated Deemed Profit:`, 110, yPos + 15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`${formatINR(p.deemedProfit)}`, 152, yPos + 15);

    // Table Header
    const tableY = yPos + 22;
    doc.setFillColor(226, 232, 240);
    doc.rect(18, tableY, 174, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Tax Computation Line Item', 22, tableY + 5);
    doc.text('New Tax Regime (Sec 115BAC)', 92, tableY + 5);
    doc.text('Old Tax Regime (Optional)', 148, tableY + 5);

    // Row 1: Gross Deemed Income
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Presumptive Gross Income', 22, tableY + 12);
    doc.text(formatINR(p.deemedProfit), 92, tableY + 12);
    doc.text(formatINR(p.deemedProfit), 148, tableY + 12);

    // Row 2: Deductions
    doc.text('Chapter VI-A Deductions', 22, tableY + 18);
    doc.text('N/A (Not Allowed)', 92, tableY + 18);
    doc.text(`-${formatINR(p.oldRegime.deductionsApplied)}`, 148, tableY + 18);

    // Row 3: Net Taxable Income
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Net Taxable Income', 22, tableY + 24);
    doc.text(formatINR(p.newRegime.totalTaxableIncome), 92, tableY + 24);
    doc.text(formatINR(p.oldRegime.totalTaxableIncome), 148, tableY + 24);

    // Row 4: Base Tax
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Base Income Tax', 22, tableY + 30);
    doc.text(formatINR(p.newRegime.baseTaxBeforeRebate), 92, tableY + 30);
    doc.text(formatINR(p.oldRegime.baseTaxBeforeRebate), 148, tableY + 30);

    // Row 5: Sec 87A Rebate
    doc.text('Section 87A Tax Rebate', 22, tableY + 36);
    doc.text(`-${formatINR(p.newRegime.rebate87A)}`, 92, tableY + 36);
    doc.text(`-${formatINR(p.oldRegime.rebate87A)}`, 148, tableY + 36);

    // Row 6: Cess
    doc.text('Health & Education Cess (4%)', 22, tableY + 42);
    doc.text(formatINR(p.newRegime.cess), 92, tableY + 42);
    doc.text(formatINR(p.oldRegime.cess), 148, tableY + 42);

    // Row 7: Final Tax Liability
    doc.setFillColor(241, 245, 249);
    doc.rect(18, tableY + 45, 174, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Total Tax Liability', 22, tableY + 50);
    doc.setTextColor(p.recommendedRegime === 'NEW' ? 5 : 15, p.recommendedRegime === 'NEW' ? 150 : 23, p.recommendedRegime === 'NEW' ? 105 : 42);
    doc.text(formatINR(p.newRegime.totalTaxLiability), 92, tableY + 50);
    doc.setTextColor(p.recommendedRegime === 'OLD' ? 5 : 15, p.recommendedRegime === 'OLD' ? 150 : 23, p.recommendedRegime === 'OLD' ? 105 : 42);
    doc.text(formatINR(p.oldRegime.totalTaxLiability), 148, tableY + 50);

    // Net Recommendation Banner inside box
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.roundedRect(18, yPos + 63, 174, 10, 1, 1, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87);
    doc.text(
      `RECOMMENDED REGIME: ${p.recommendedRegime} TAX REGIME  |  ESTIMATED NET TAX SAVINGS: ${formatINR(p.taxSavings)}`,
      22,
      yPos + 69.5
    );

    yPos += 85;
  }

  // Section 4: Advance Tax Schedule (Sec 211)
  const targetTax = data.presumptive
    ? data.presumptive.recommendedRegime === 'NEW'
      ? data.presumptive.newRegime.totalTaxLiability
      : data.presumptive.oldRegime.totalTaxLiability
    : 0;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, 182, 38, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('4. Advance Tax Installment Schedule (Section 211 / 234C)', 18, yPos + 7);

  if (targetTax < 10000) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Total tax liability is ${formatINR(targetTax)} (< INR 10,000 threshold). Advance tax payment is NOT mandatory under Section 208.`,
      18,
      yPos + 16
    );
  } else if (data.activityType === 'BUSINESS') {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Assessees opting for Section 44AD enjoy a single-installment deadline: 100% advance tax (${formatINR(targetTax)}) due on or before 15th March.`,
      18,
      yPos + 16
    );
  } else {
    // 44ADA standard quarterly installments
    doc.setFontSize(8);
    const instY = yPos + 13;
    doc.setFillColor(226, 232, 240);
    doc.rect(18, instY, 174, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Due Date', 22, instY + 3.8);
    doc.text('Cum. %', 65, instY + 3.8);
    doc.text('Cumulative Amount', 100, instY + 3.8);
    doc.text('Quarterly Installment', 148, instY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const q1 = Math.round(targetTax * 0.15);
    const q2 = Math.round(targetTax * 0.45);
    const q3 = Math.round(targetTax * 0.75);
    const q4 = targetTax;

    doc.text('15th June 2026', 22, instY + 9);
    doc.text('15%', 65, instY + 9);
    doc.text(formatINR(q1), 100, instY + 9);
    doc.text(formatINR(q1), 148, instY + 9);

    doc.text('15th September 2026', 22, instY + 14);
    doc.text('45%', 65, instY + 14);
    doc.text(formatINR(q2), 100, instY + 14);
    doc.text(formatINR(q2 - q1), 148, instY + 14);

    doc.text('15th December 2026', 22, instY + 19);
    doc.text('75%', 65, instY + 19);
    doc.text(formatINR(q3), 100, instY + 19);
    doc.text(formatINR(q3 - q2), 148, instY + 19);

    doc.text('15th March 2027', 22, instY + 24);
    doc.text('100%', 65, instY + 24);
    doc.text(formatINR(q4), 100, instY + 24);
    doc.text(formatINR(q4 - q3), 148, instY + 24);
  }

  // Expert CA Review Callout Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 267, 182, 14, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Need Confidence Before Filing? Email this PDF to support@businesskar.in for a free initial review.', 18, 272.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('A tax expert will review your numbers and compliance (no charge for first review). 20% discount on future CA consultations.', 18, 277);

  // Statutory Disclaimer Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Disclaimer: This evaluation report is generated automatically based on Section 44AD/44ADA rules under the Indian Income Tax Act (as amended for FY 2026-27). Please consult a qualified Chartered Accountant for final filing.',
    14,
    286
  );

  // Save the generated PDF
  const filename = `Presumptive_Tax_Report_${data.entityType}_${Date.now()}.pdf`;
  doc.save(filename);
};

export interface ITR4PdfExportData {
  pan: string;
  fullName: string;
  workflowRoute: 'SECTION_44ADA' | 'SECTION_44AD' | 'STANDARD_AUDIT_REQUIRED';
  businessCode: string;
  tradeName: string;
  grossReceipts: number;
  cashReceipts: number;
  tdsClaimed: number;
  optedNewRegime: boolean;
  presumptive: PresumptiveTaxResult;
  advanceTax: AdvanceTaxResult;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifsCode: string;
    isPrimaryForRefund: boolean;
  }[];
}

/**
 * Generates an official, formal ITR-4 (Sugam) Tax Computation & Summary Statement PDF.
 * Conforms to AY 2027-28 (FY 2026-27) CBDT filing standards for presumptive taxpayers.
 */
export const generateITR4SummaryPdf = (data: ITR4PdfExportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const formatINR = (val: number) => `INR ${(val || 0).toLocaleString('en-IN')}`;
  const regimeData = data.optedNewRegime ? data.presumptive.newRegime : data.presumptive.oldRegime;
  const netPayableOrRefund = regimeData.totalTaxLiability - data.tdsClaimed;
  const isRefund = netPayableOrRefund < 0;

  // Title Header Block (Slate 900 banner)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text('FORM ITR-4 (SUGAM) - COMPUTATION OF TOTAL INCOME & TAX', 14, 13);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text('Assessment Year 2027-28 | Financial Year 2026-27 (Section 44AD / 44ADA)', 14, 20);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(
    `Formal Summary Document | Generated: ${new Date().toLocaleString('en-IN')} | Ref: ITR4-SUGAM-${data.pan.toUpperCase()}`,
    14,
    26.5
  );

  let yPos = 36;

  // SECTION 1: Assessee Identification & Profile (Part A)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, 182, 28, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PART A: Taxpayer Profile & General Filing Details', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Legal Name:', 18, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.fullName || 'Rahul Sharma', 45, yPos + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('PAN:', 115, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(data.pan.toUpperCase(), 130, yPos + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Business / Profession:', 18, yPos + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const tradeDesc = `${data.businessCode} - ${data.tradeName || 'Professional Services'}`;
  doc.text(tradeDesc.length > 38 ? `${tradeDesc.substring(0, 36)}...` : tradeDesc, 55, yPos + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Tax Regime:', 115, yPos + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(data.optedNewRegime ? 5 : 180, data.optedNewRegime ? 150 : 83, data.optedNewRegime ? 105 : 9);
  doc.text(data.optedNewRegime ? 'New Regime (Sec 115BAC)' : 'Old Tax Regime', 135, yPos + 20);

  yPos += 32;

  // SECTION 2: Presumptive Business / Profession Statement (Schedule BP)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, 182, 33, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PART B: Schedule BP - Presumptive Receipts & Deemed Profit', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const cashPct = data.grossReceipts > 0 ? ((data.cashReceipts / data.grossReceipts) * 100).toFixed(1) : '0.0';
  const isCompliantCash = Number(cashPct) <= 5.0;

  doc.text('Gross Receipts / Turnover:', 18, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(data.grossReceipts), 62, yPos + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Cash Receipts (%):', 115, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isCompliantCash ? 5 : 225, isCompliantCash ? 150 : 29, isCompliantCash ? 105 : 72);
  doc.text(`${formatINR(data.cashReceipts)} (${cashPct}%)`, 146, yPos + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Applicable Section:', 18, yPos + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    data.workflowRoute === 'SECTION_44ADA'
      ? 'Section 44ADA (Professionals)'
      : 'Section 44AD (Small Business)',
    55,
    yPos + 20
  );

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Deemed Profit Rate:', 115, yPos + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.presumptive.presumptiveRateAppliedText, 146, yPos + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Presumptive Income:', 18, yPos + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(formatINR(data.presumptive.deemedProfit), 62, yPos + 27);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('5% Cash Threshold Status:', 115, yPos + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isCompliantCash ? 5 : 225, isCompliantCash ? 150 : 29, isCompliantCash ? 105 : 72);
  doc.text(isCompliantCash ? 'Compliant (<= 5%)' : 'Exceeds 5% Limit', 156, yPos + 27);

  yPos += 37;

  // SECTION 3: Computation of Total Income & Deductions (Part C)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, 182, 28, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PART C: Computation of Total Income & Deductions', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('1. Presumptive Business/Professional Income:', 18, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(regimeData.grossDeemedProfit), 86, yPos + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('2. Gross Total Income (GTI):', 115, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(regimeData.grossTotalIncome), 158, yPos + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('3. Chapter VI-A Deductions (80C, 80D, 80CCD):', 18, yPos + 21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const dedText = data.optedNewRegime ? 'INR 0 (Not allowed u/s 115BAC)' : `-${formatINR(regimeData.deductionsApplied)}`;
  doc.text(dedText, 86, yPos + 21);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('4. Total Taxable Income:', 115, yPos + 21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(formatINR(regimeData.totalTaxableIncome), 158, yPos + 21);

  yPos += 32;

  // SECTION 4: Formal Tax Computation & Net Balance (Part D)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, 182, 66, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PART D: Tax Computation, Rebates & Net Payable / Refund Due', 18, yPos + 6);

  // Mini Table Header
  const tblY = yPos + 10;
  doc.setFillColor(226, 232, 240);
  doc.rect(18, tblY, 174, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Computation Line Item', 22, tblY + 4.2);
  doc.text('New Regime (Sec 115BAC)', 95, tblY + 4.2);
  doc.text('Old Tax Regime (Optional)', 146, tblY + 4.2);

  const p = data.presumptive;
  const lineItems = [
    { label: 'Base Income Tax on Slab', new: formatINR(p.newRegime.baseTaxBeforeRebate), old: formatINR(p.oldRegime.baseTaxBeforeRebate) },
    { label: 'Less: Rebate under Section 87A', new: `-${formatINR(p.newRegime.rebate87A)}`, old: `-${formatINR(p.oldRegime.rebate87A)}` },
    { label: 'Tax Payable After Rebate', new: formatINR(p.newRegime.netTaxAfterRebate), old: formatINR(p.oldRegime.netTaxAfterRebate) },
    { label: 'Add: Health & Education Cess (4%)', new: formatINR(p.newRegime.cess), old: formatINR(p.oldRegime.cess) },
    { label: 'Total Gross Tax Liability', new: formatINR(p.newRegime.totalTaxLiability), old: formatINR(p.oldRegime.totalTaxLiability), bold: true },
    { label: 'Less: Tax Deducted at Source (TDS Claimed)', new: `-${formatINR(data.tdsClaimed)}`, old: `-${formatINR(data.tdsClaimed)}` },
  ];

  let rowY = tblY + 10;
  doc.setFontSize(7.5);
  lineItems.forEach((item) => {
    doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
    doc.setTextColor(item.bold ? 15 : 71, item.bold ? 23 : 85, item.bold ? 42 : 105);
    doc.text(item.label, 22, rowY);
    doc.text(item.new, 95, rowY);
    doc.text(item.old, 146, rowY);
    rowY += 5;
  });

  // Highlight Box for Chosen Regime & Balance Payable/Refund
  doc.setFillColor(isRefund ? 239 : 236, isRefund ? 246 : 253, isRefund ? 255 : 245);
  doc.setDrawColor(isRefund ? 191 : 167, isRefund ? 219 : 243, isRefund ? 254 : 208);
  doc.roundedRect(18, yPos + 46, 174, 15, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isRefund ? 29 : 4, isRefund ? 78 : 120, isRefund ? 216 : 87);
  doc.text(
    `ELECTED FILING REGIME: ${data.optedNewRegime ? 'NEW TAX REGIME (SEC 115BAC)' : 'OLD TAX REGIME'}`,
    22,
    yPos + 52
  );

  const statusLabel = isRefund ? 'NET REFUND DUE TO TAXPAYER' : 'NET TAX PAYABLE';
  const statusColor = isRefund ? [37, 99, 235] : [180, 83, 9];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(
    `${statusLabel}: ${formatINR(Math.abs(netPayableOrRefund))}  (TDS Claimed: ${formatINR(data.tdsClaimed)})`,
    22,
    yPos + 58
  );

  yPos += 70;

  // SECTION 5: Advance Tax Schedule & Refund Bank Details (Part E)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, 182, 28, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PART E: Advance Tax Compliance (Sec 211) & Bank Refund Details', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const advNote =
    regimeData.totalTaxLiability < 10000
      ? 'Tax liability < INR 10,000: Advance Tax is NOT mandatory under Section 208.'
      : data.workflowRoute === 'SECTION_44AD'
      ? 'Section 44AD Privilege: 100% advance tax payable in a single installment on or before 15th March.'
      : 'Section 44ADA Schedule: Standard quarterly installments (15% Jun 15, 45% Sep 15, 75% Dec 15, 100% Mar 15).';
  doc.text(advNote, 18, yPos + 12);

  const primaryBank = data.bankDetails && data.bankDetails.length > 0 ? data.bankDetails[0] : null;
  const bankString = primaryBank
    ? `Refund Bank: ${primaryBank.bankName} | A/C: ${primaryBank.accountNumber} | IFSC: ${primaryBank.ifsCode} (Electronic Direct Credit)`
    : 'Refund Bank: State Bank of India | Primary Account Verified for ECS/NEFT Refund';
  doc.text(bankString, 18, yPos + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Interest u/s 234C: INR ${data.advanceTax?.totalInterest234C || 0}  |  Interest u/s 234B: INR 0`, 18, yPos + 24);

  yPos += 32;

  // SECTION 6: Statutory Verification & Declaration (Part F)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, 182, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('PART F: Statutory Verification (Rule 12 / Form ITR-4 Sugam)', 18, yPos + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `I, ${data.fullName || 'Rahul Sharma'}, solemnly declare that to the best of my knowledge and belief, the details provided`,
    18,
    yPos + 10.5
  );
  doc.text(
    `in this return computation are correct and complete, in accordance with the Indian Income Tax Act, 1961.`,
    18,
    yPos + 14.5
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 18, yPos + 19);
  doc.text(`Verified by: ${data.fullName || 'Rahul Sharma'} (PAN: ${data.pan.toUpperCase()})`, 95, yPos + 19);

  // Footer Disclaimer & Free CA Review
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(
    'Need Confidence Before Filing? Email this PDF to support@businesskar.in (Free First Review | 20% Future CA Network Discount)',
    14,
    288
  );

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Statutory Notice: This summary document is compiled by Businesskar Rules-as-Code Engine for electronic filing under Section 44AD/44ADA.',
    14,
    292.5
  );

  // Save the generated PDF
  const filename = `ITR4_Sugam_Tax_Summary_${data.pan.toUpperCase()}_AY2027-28.pdf`;
  doc.save(filename);
  return { doc, filename };
};

