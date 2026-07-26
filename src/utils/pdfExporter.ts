import { jsPDF } from 'jspdf';
import { EligibilityResult, PresumptiveTaxResult, EntityType } from '../engine/types';

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
  doc.text('INDIAN PRESUMPTIVE TAX EVALUATION REPORT', 14, 14);

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

  // Statutory Disclaimer Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Disclaimer: This evaluation report is generated automatically based on Section 44AD/44ADA rules under the Indian Income Tax Act (as amended for FY 2026-27). Please consult a qualified Chartered Accountant for final filing.',
    14,
    285
  );

  // Save the generated PDF
  const filename = `Presumptive_Tax_Report_${data.entityType}_${Date.now()}.pdf`;
  doc.save(filename);
};
