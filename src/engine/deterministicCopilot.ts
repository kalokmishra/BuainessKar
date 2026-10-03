/**
 * Deterministic Tax Copilot Engine
 * 
 * Provides rules-as-code instant calculations, what-if analyses, Section 56(2)(x) exemptions,
 * and 1-click profile update suggestions. Runs identically on server and browser with 0 latency.
 */

import {
  AIChatCopilotResponse,
  PreprocessedNumericalEntity,
  WhatIfAnalysis,
} from './types.js';
import { calculateComprehensiveTax } from './comprehensiveTax.js';
import { evaluateCashSurveillance } from './cashSurveillance.js';
import { evaluateEligibility } from './eligibility.js';
import {
  extractIndianNumericalEntities,
  preprocessIndianNumericalIdioms,
  parseIndianAmount,
  formatINR,
} from './indianNumberIdioms.js';

export interface TaxProfileContext {
  user?: {
    name?: string;
    identifier?: string;
  };
  taxData: {
    entityType?: string;
    activityType?: 'PROFESSION' | 'BUSINESS';
    professionCategory?: string;
    businessCategory?: string;
    grossReceipts: number;
    cashReceipts: number;
    declaredProfit?: string;
    hasSalary?: boolean;
    grossSalary?: number;
    hasHouseProperty?: boolean;
    rentalIncome?: number;
    hasCapitalGains?: boolean;
    stcgEquity?: number;
    stcgOther?: number;
    ltcgEquity?: number;
    ltcgOther?: number;
    hasOtherIncome?: boolean;
    savingsInterest?: number;
    fdInterest?: number;
    otherIncome?: number;
    sec80C?: number;
    sec80D?: number;
    sec80CCD1B?: number;
    sec80TTA?: number;
    chapterVIADeductions?: number;
    tdsClaimed?: number;
    isExport?: boolean;
    lutNumber?: string;
    q1Paid?: number;
    q2Paid?: number;
    q3Paid?: number;
    q4Paid?: number;
  };
}

/**
 * Computes baseline tax metrics using the multi-head comprehensive tax engine
 */
export function computeBaselineTax(taxData: TaxProfileContext['taxData']) {
  const grossReceipts = Number(taxData?.grossReceipts) || 0;
  const cashReceipts = Number(taxData?.cashReceipts) || 0;
  const grossSalary = taxData?.hasSalary ? Number(taxData.grossSalary) || 0 : 0;
  const otherIncome =
    (taxData?.hasOtherIncome ? Number(taxData.otherIncome) || 0 : 0) +
    (Number(taxData?.savingsInterest) || 0) +
    (Number(taxData?.fdInterest) || 0) +
    (taxData?.hasHouseProperty ? Number(taxData.rentalIncome) || 0 : 0);

  const workflowRoute =
    taxData?.activityType === 'BUSINESS' ? 'SECTION_44AD' : 'SECTION_44ADA';

  const sum80C = Math.min(Number(taxData?.sec80C) || 0, 150000);
  const sum80D = Number(taxData?.sec80D) || 0;
  const sum80CCD = Math.min(Number(taxData?.sec80CCD1B) || 0, 50000);
  const sum80TTA = Math.min(Number(taxData?.sec80TTA) || 0, 10000);
  const totalDeductions =
    Number(taxData?.chapterVIADeductions) || sum80C + sum80D + sum80CCD + sum80TTA;

  const result = calculateComprehensiveTax({
    grossSalary,
    workflowRoute,
    freelanceGrossReceipts: grossReceipts,
    freelanceCashReceipts: cashReceipts,
    freelanceDeclaredProfit: taxData?.declaredProfit ? Number(taxData.declaredProfit) : undefined,
    capitalGains: {
      stcgEquity: taxData?.hasCapitalGains ? Number(taxData.stcgEquity) || 0 : 0,
      stcgOther: taxData?.hasCapitalGains ? Number(taxData.stcgOther) || 0 : 0,
      ltcgEquity: taxData?.hasCapitalGains ? Number(taxData.ltcgEquity) || 0 : 0,
      ltcgOther: taxData?.hasCapitalGains ? Number(taxData.ltcgOther) || 0 : 0,
    },
    otherIncome,
    chapterVIADeductions: totalDeductions,
  });

  const cashSurveillance = evaluateCashSurveillance({
    grossReceipts,
    cashReceipts,
  });

  const eligibility = evaluateEligibility({
    entityType: (taxData?.entityType as any) || 'INDIVIDUAL',
    activityType: taxData?.activityType || 'PROFESSION',
    professionCategory: taxData?.professionCategory as any,
    businessCategory: taxData?.businessCategory as any,
    grossReceipts,
    cashReceipts,
  });

  const minTax = Math.min(
    result.newRegime.totalTaxLiability,
    result.oldRegime.totalTaxLiability
  );

  return {
    result,
    workflowRoute,
    minTax,
    recommendedRegime: result.recommendedRegime,
    cashSurveillance,
    eligibility,
    totalDeductions,
  };
}

/**
 * Robust deterministic rule engine that parses user intents and calculates exact tax impacts
 */
export function generateDeterministicChatResponse(
  message: string,
  taxData: TaxProfileContext['taxData'],
  baseline: ReturnType<typeof computeBaselineTax>,
  userName?: string
): AIChatCopilotResponse {
  // Pre-process Indian numerical idioms
  const preprocessed = preprocessIndianNumericalIdioms(message);
  const entities = preprocessed.entities;
  const primaryEntity = entities.length > 0 ? entities[0] : null;

  const lower = message.toLowerCase();

  // Helper to test a what-if scenario with simulated updates
  const testScenario = (updates: Partial<TaxProfileContext['taxData']>, title: string, takeaway: string) => {
    const updatedTaxData = { ...taxData, ...updates };
    const simulated = computeBaselineTax(updatedTaxData);
    const taxSavings = baseline.minTax - simulated.minTax;

    const whatIf: WhatIfAnalysis = {
      scenarioTitle: title,
      baselineTax: baseline.minTax,
      projectedTax: simulated.minTax,
      taxSavings,
      baselineRegime: baseline.recommendedRegime,
      recommendedRegime: simulated.recommendedRegime,
      effectiveRateBefore: baseline.result[baseline.recommendedRegime === 'NEW' ? 'newRegime' : 'oldRegime'].effectiveTaxRateOnTotalIncome,
      effectiveRateAfter: simulated.result[simulated.recommendedRegime === 'NEW' ? 'newRegime' : 'oldRegime'].effectiveTaxRateOnTotalIncome,
      keyTakeaway: takeaway,
    };

    return { simulated, whatIf, updatedTaxData };
  };

  // 0. Gifts from Relatives (Mother, Father, Spouse, Brother, Sister) - Section 56(2)(x)
  const isRelativeMentioned =
    lower.includes('mother') ||
    lower.includes('mom') ||
    lower.includes('father') ||
    lower.includes('dad') ||
    lower.includes('parent') ||
    lower.includes('brother') ||
    lower.includes('sister') ||
    lower.includes('spouse') ||
    lower.includes('wife') ||
    lower.includes('husband') ||
    lower.includes('relative');

  const isGiftContext =
    lower.includes('received') ||
    lower.includes('gift') ||
    lower.includes('got') ||
    lower.includes('sent') ||
    lower.includes('transferred') ||
    lower.includes('gave');

  if (isRelativeMentioned && isGiftContext) {
    const extractedAmount = primaryEntity ? primaryEntity.normalizedInteger : (parseIndianAmount(message) || 50000);
    const formattedAmount = primaryEntity ? primaryEntity.formattedINR : formatINR(extractedAmount);
    const idiomUsed = primaryEntity ? primaryEntity.originalIdiom : '50k';

    const relationName =
      lower.includes('mother') || lower.includes('mom')
        ? 'mother'
        : lower.includes('father') || lower.includes('dad')
        ? 'father'
        : lower.includes('spouse') || lower.includes('wife') || lower.includes('husband')
        ? 'spouse'
        : lower.includes('brother')
        ? 'brother'
        : lower.includes('sister')
        ? 'sister'
        : 'relative';

    return {
      reply: `### 🎁 Tax-Exempt Gift from Relative (Section 56(2)(x))\n\nUnder Section 56(2)(x) of the Indian Income Tax Act, any sum of money received as a gift from a **relative** (which specifically includes your **${relationName}**) is **100% EXEMPT FROM INCOME TAX without any upper monetary limit**.\n\n### ⚖️ Tax Outlay & Compliance Analysis:\n- **Colloquial Input Recognized**: \`${idiomUsed}\` mapped to **${formattedAmount}** (${extractedAmount.toLocaleString('en-IN')} Rupees, NOT ₹50)\n- **Impact on Gross Turnover**: **₹0** (This is a non-taxable personal family gift, NOT freelance/business turnover under Section 44ADA or 44AD).\n- **Tax Liability Added**: **₹0 (Zero Additional Tax)**.\n- **Action Required**: You do **not** need to add this to your business turnover, nor do you pay any tax on it. Ensure the money was transferred via banking channels (UPI, NEFT, IMPS, or bank transfer) so you retain clear source documentation if ever audited.\n\nYour active business turnover remains **${formatINR(taxData?.grossReceipts || 0)}**, and your current minimum tax liability remains **${formatINR(baseline.minTax)}**.`,
      intent: 'TAX_MINIMIZATION',
      preprocessedEntities: entities,
      quickFollowUps: [
        'What if I receive money from a friend?',
        'How can I minimize tax on my actual freelance turnover?',
        'Check cash receipts surveillance limit',
      ],
    };
  }

  // 1. NPS / 80CCD(1B) What-If or Entry
  if (lower.includes('nps') || lower.includes('80ccd') || lower.includes('tier 1')) {
    const extracted = primaryEntity ? primaryEntity.normalizedInteger : parseIndianAmount(message);
    const amount = extracted !== null ? extracted : 50000;
    const cappedNps = Math.min(amount, 50000);

    const { simulated, whatIf } = testScenario(
      { sec80CCD1B: cappedNps },
      `Invest ${formatINR(cappedNps)} in NPS Tier-1 under Section 80CCD(1B)`,
      `Section 80CCD(1B) grants an exclusive deduction of up to ₹50,000 over and above Section 80C. While the New Regime disallows it, this can tilt the balance in favor of the Old Regime if your other deductions are high.`
    );

    const savingsNote =
      whatIf.taxSavings > 0
        ? `Investing ${formatINR(cappedNps)} in NPS saves you **${formatINR(whatIf.taxSavings)}** in tax outlay!`
        : `Under the New Tax Regime, Section 80CCD(1B) deduction is not eligible. However, if you switch to Old Regime with deductions, total Old Regime tax becomes ${formatINR(simulated.result.oldRegime.totalTaxLiability)}.`;

    return {
      reply: `### 📈 Section 80CCD(1B) NPS Optimization Analysis\n\n${savingsNote}\n\n- **Baseline Tax**: ${formatINR(baseline.minTax)} (${baseline.recommendedRegime} Regime)\n- **Projected Tax with NPS**: ${formatINR(simulated.minTax)} (${simulated.recommendedRegime} Regime)\n- **Net Tax Benefit**: ${whatIf.taxSavings >= 0 ? formatINR(whatIf.taxSavings) : '₹0'}\n\nWould you like me to update your Section 80CCD(1B) entry to ${formatINR(cappedNps)}?`,
      intent: 'WHAT_IF_ANALYSIS',
      suggestedUpdates: { sec80CCD1B: cappedNps },
      whatIf,
      preprocessedEntities: entities,
      quickFollowUps: [
        `Apply ${formatINR(cappedNps)} NPS deduction to my profile`,
        'What about Section 80D health insurance?',
        'Compare Old vs New Tax Regime',
      ],
    };
  }

  // 2. Add Invoice / Gross Receipts
  if (
    lower.includes('invoice') ||
    lower.includes('payment') ||
    lower.includes('received') ||
    (lower.includes('add') && (lower.includes('receipt') || lower.includes('turnover') || lower.includes('revenue') || lower.includes('income')))
  ) {
    const extracted = primaryEntity ? primaryEntity.normalizedInteger : parseIndianAmount(message);
    const addedAmount = extracted !== null ? extracted : 350000;
    const isCash = lower.includes('cash');

    const newGross = (taxData?.grossReceipts || 0) + addedAmount;
    const newCash = isCash ? (taxData?.cashReceipts || 0) + addedAmount : (taxData?.cashReceipts || 0);

    const { simulated, whatIf } = testScenario(
      { grossReceipts: newGross, cashReceipts: newCash },
      `Add ${formatINR(addedAmount)} ${isCash ? 'Cash' : 'Digital/Bank'} Receipt`,
      `Under Section 44ADA, 50% is deemed income; under Section 44AD, 6% (digital) or 8% (cash) is deemed profit.`
    );

    const cashPct = ((newCash / (newGross || 1)) * 100).toFixed(1);

    return {
      reply: `### ➕ New Receipt Entry Assistant\n\nI have calculated the tax impact of adding **${formatINR(addedAmount)}** (${isCash ? 'Cash' : 'Digital Banking/UPI'}):\n\n- **Updated Gross Turnover**: ${formatINR(newGross)}\n- **Cash Proportion**: ${cashPct}%\n- **Incremental Tax Impact**: ${formatINR(simulated.minTax - baseline.minTax)}\n- **Total Projected Tax**: ${formatINR(simulated.minTax)} (${simulated.recommendedRegime} Regime)\n\n${Number(cashPct) > 5.0 ? '⚠️ **Surveillance Warning**: Your cash receipts exceed 5.0%, which may breach extended limits under Section 44ADA/44AD!' : '✅ Your cash ratio remains safely under the 5.0% statutory threshold.'}\n\nClick **Apply Updates** below to add this entry to your profile.`,
      intent: 'ASSIST_ENTRY',
      suggestedUpdates: { grossReceipts: newGross, cashReceipts: newCash },
      whatIf,
      preprocessedEntities: entities,
      quickFollowUps: [
        'Apply these updated turnover numbers',
        'How can I minimize tax on this new turnover?',
        'What advance tax is due on March 15?',
      ],
    };
  }

  // 3. Health Insurance / Section 80D
  if (lower.includes('80d') || lower.includes('health insurance') || lower.includes('mediclaim')) {
    const extracted = primaryEntity ? primaryEntity.normalizedInteger : parseIndianAmount(message);
    const amount = extracted !== null ? extracted : 25000;
    const capped80D = Math.min(amount, 100000);

    const { simulated, whatIf } = testScenario(
      { sec80D: capped80D },
      `Claim ${formatINR(capped80D)} Health Insurance under Section 80D`,
      `Section 80D provides ₹25,000 for self/family and up to ₹50,000 for senior citizen parents in the Old Tax Regime.`
    );

    return {
      reply: `### 🛡️ Section 80D Health Insurance Analysis\n\n- **Claim Amount**: ${formatINR(capped80D)}\n- **Old Regime Tax**: Reduced to ${formatINR(simulated.result.oldRegime.totalTaxLiability)}\n- **New Regime Tax**: ${formatINR(simulated.result.newRegime.totalTaxLiability)} (Deductions not allowed)\n- **Recommendation**: ${simulated.recommendedRegime === 'OLD' ? `Old Regime saves you ${formatINR(whatIf.taxSavings)}!` : 'New Regime remains more advantageous due to lower slab rates.'}`,
      intent: 'WHAT_IF_ANALYSIS',
      suggestedUpdates: { sec80D: capped80D },
      whatIf,
      preprocessedEntities: entities,
      quickFollowUps: [
        `Apply ${formatINR(capped80D)} 80D claim to profile`,
        'What about 80CCD(1B) NPS?',
        'How to minimize advance tax interest?',
      ],
    };
  }

  // 4. Old vs New Regime Comparison
  if (lower.includes('regime') || lower.includes('old vs new') || lower.includes('compare')) {
    const oldTax = baseline.result.oldRegime.totalTaxLiability;
    const newTax = baseline.result.newRegime.totalTaxLiability;
    const diff = Math.abs(oldTax - newTax);

    return {
      reply: `### ⚖️ Tax Regime Comparison (FY 2026-27 / AY 2027-28)\n\n| Parameter | New Tax Regime (Sec 115BAC) | Old Tax Regime |\n| :--- | :--- | :--- |\n| **Total Tax Liability** | **${formatINR(newTax)}** | **${formatINR(oldTax)}** |\n| **Effective Tax Rate** | ${baseline.result.newRegime.effectiveTaxRateOnTotalIncome}% | ${baseline.result.oldRegime.effectiveTaxRateOnTotalIncome}% |\n| **Deductions Applied** | Nil (Standardized Slabs) | ${formatINR(baseline.totalDeductions)} |\n| **Section 87A Rebate** | Full rebate up to ₹7L income | Full rebate up to ₹5L income |\n\n🎯 **Optimal Recommendation**: Choose the **${baseline.recommendedRegime} Tax Regime** to save **${formatINR(diff)}**.\n\n*Statutory Note:* Under presumptive taxation (Sec 44AD/44ADA), New Regime is typically superior unless your Chapter VI-A deductions exceed ₹3.75 - ₹4 Lakhs.`,
      intent: 'TAX_MINIMIZATION',
      preprocessedEntities: entities,
      quickFollowUps: [
        'How can I bring my tax to zero?',
        'Run what-if with ₹50,000 in NPS',
        'Check cash receipts surveillance',
      ],
    };
  }

  // 5. General Tax Minimization / Default
  const turnover = taxData?.grossReceipts || 0;

  return {
    reply: `### 🎯 Tax Minimization Masterplan for ${userName || 'Your Profile'}\n\nBased on your active turnover of **${formatINR(turnover)}**, here is how to drive your tax outlay to the absolute legal minimum:\n\n1. **Lock into the ${baseline.recommendedRegime} Regime**: Yields a net tax liability of **${formatINR(baseline.minTax)}** (saving ${formatINR(baseline.result.taxSavings)} vs alternate regime).\n2. **Preserve Section 44AD/44ADA Presumptive Relief**: By deeming 50% profit (or 6% digital for 44AD), the remaining 50% to 94% is deemed business expenses without books of accounts (Sec 44AA) or audit (Sec 44AB).\n3. **Maintain Digital Banking Receipts**: Keep cash below 5.0% (currently **${baseline.cashSurveillance.cashPercentage.toFixed(1)}%**) to avoid triggering mandatory tax audit.\n4. **Pay Single Advance Tax by March 15**: Presumptive taxpayers enjoy Section 211(1)(b) single-installment privilege—pay 100% on or before 15th March 2027 to avoid all Section 234C interest penalties.\n5. **File GST LUT for Foreign Invoices**: If billing clients abroad, file Letter of Undertaking (LUT) to export services at 0% IGST.\n\nWould you like to test a **what-if scenario** (e.g. adding NPS, adjusting turnover, or adding deductions)?`,
    intent: 'TAX_MINIMIZATION',
    preprocessedEntities: entities,
    quickFollowUps: [
      'What if I invest ₹50,000 in NPS?',
      'Add new invoice of ₹4,00,000',
      'Compare Old vs New Regime',
      'Check cash audit risk',
    ],
  };
}
