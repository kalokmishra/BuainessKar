/**
 * Day 1 Core Engine - Module 8: Multi-Head Comprehensive Tax Calculator
 * Calculates combined tax liability across Salary, Presumptive Business/Freelance (Sec 44AD/44ADA),
 * Capital Gains (STCG Sec 111A / LTCG Sec 112A & 112), and Other Income for FY 2026-27 (AY 2027-28).
 */

import { getTaxSchema } from './schemaLoader.js';
import {
  ComprehensiveTaxInput,
  ComprehensiveTaxResult,
  ComprehensiveRegimeResult,
  TaxSchemaRegime,
} from './types.js';

/**
 * Calculates base slab tax on normal income for a given regime
 */
function calculateSlabTax(
  taxableIncome: number,
  regime: TaxSchemaRegime
): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  for (const slab of regime.slabs) {
    if (taxableIncome > slab.min) {
      const slabMax = slab.max !== null ? slab.max : taxableIncome;
      const amountInSlab = Math.min(taxableIncome, slabMax) - slab.min;
      if (amountInSlab > 0) {
        tax += amountInSlab * slab.rate;
      }
    }
  }
  return tax;
}

/**
 * Gets basic exemption threshold for a regime (e.g. 400,000 for New, 250,000 for Old)
 */
function getBasicExemptionLimit(regime: TaxSchemaRegime): number {
  const firstTaxableSlab = regime.slabs.find((s) => s.rate > 0);
  return firstTaxableSlab ? firstTaxableSlab.min : 300000;
}

/**
 * Helper to compute tax for a specific regime
 */
function computeRegimeTax(
  input: ComprehensiveTaxInput,
  regimeKey: 'newRegime' | 'oldRegime'
): ComprehensiveRegimeResult {
  const schema = getTaxSchema();
  const regimeSchema = schema.taxRegimes[regimeKey];
  const isNew = regimeKey === 'newRegime';

  // 1. Salary Head
  const grossSalary = Math.max(0, input.grossSalary || 0);
  const salariedStandardDeduction = Math.min(
    grossSalary,
    regimeSchema.standardDeductionSalaried
  );
  const netSalariedIncome = Math.max(0, grossSalary - salariedStandardDeduction);

  // 2. Freelance / Presumptive Business Head
  const grossReceipts = Math.max(0, input.freelanceGrossReceipts || 0);
  const cashReceipts = Math.max(0, input.freelanceCashReceipts || 0);
  const digitalReceipts = Math.max(0, grossReceipts - cashReceipts);

  let freelanceDeemedProfit = 0;
  if (input.workflowRoute === 'SECTION_44ADA') {
    freelanceDeemedProfit = Math.round(grossReceipts * schema.section44ADA.presumptiveProfitRate);
  } else if (input.workflowRoute === 'SECTION_44AD') {
    const digitalProfit = Math.round(digitalReceipts * schema.section44AD.digitalProfitRate);
    const cashProfit = Math.round(cashReceipts * schema.section44AD.cashProfitRate);
    freelanceDeemedProfit = digitalProfit + cashProfit;
  } else {
    freelanceDeemedProfit = Math.round(grossReceipts * 0.08);
  }

  if (
    input.freelanceDeclaredProfit &&
    input.freelanceDeclaredProfit > freelanceDeemedProfit
  ) {
    freelanceDeemedProfit = Math.round(input.freelanceDeclaredProfit);
  }

  // 3. Capital Gains Head
  const cg = input.capitalGains || {
    stcgEquity: 0,
    stcgOther: 0,
    ltcgEquity: 0,
    ltcgOther: 0,
  };

  const stcgEquity = Math.max(0, cg.stcgEquity || 0);
  const stcgOther = Math.max(0, cg.stcgOther || 0);
  const ltcgEquity = Math.max(0, cg.ltcgEquity || 0);
  const ltcgOther = Math.max(0, cg.ltcgOther || 0);

  const ltcgEquityExempted = Math.min(ltcgEquity, 125000); // Sec 112A ₹1.25L exemption
  const ltcgEquityTaxable = Math.max(0, ltcgEquity - ltcgEquityExempted);

  // 4. Other Income Head
  const otherIncome = Math.max(0, input.otherIncome || 0);

  // 5. Chapter VI-A Deductions
  const chapterVIADeductions = isNew ? 0 : Math.max(0, input.chapterVIADeductions || 0);

  // Normal Slab Gross Income = Net Salary + Freelance Profit + STCG Other + Other Income
  const normalSlabGross = netSalariedIncome + freelanceDeemedProfit + stcgOther + otherIncome;
  const normalSlabTaxableIncome = Math.max(0, normalSlabGross - chapterVIADeductions);
  const chapterVIADeductionsApplied = Math.min(normalSlabGross, chapterVIADeductions);

  // 6. Calculate Normal Slab Base Tax
  let normalSlabBaseTax = calculateSlabTax(normalSlabTaxableIncome, regimeSchema);

  // 7. Unexhausted Basic Exemption Set-Off against Special Rate Gains
  const basicExemption = getBasicExemptionLimit(regimeSchema);
  let unexhaustedExemption = Math.max(0, basicExemption - normalSlabTaxableIncome);

  let stcgEquityTaxableAfterExemption = stcgEquity;
  let ltcgOtherTaxableAfterExemption = ltcgOther;
  let ltcgEquityTaxableAfterExemption = ltcgEquityTaxable;

  let totalOffsetUsed = 0;

  if (unexhaustedExemption > 0) {
    // Priority 1: STCG Equity (20%)
    const offsetSTCG = Math.min(stcgEquityTaxableAfterExemption, unexhaustedExemption);
    stcgEquityTaxableAfterExemption -= offsetSTCG;
    unexhaustedExemption -= offsetSTCG;
    totalOffsetUsed += offsetSTCG;
  }

  if (unexhaustedExemption > 0) {
    // Priority 2: LTCG Other (12.5%)
    const offsetLTCGOther = Math.min(ltcgOtherTaxableAfterExemption, unexhaustedExemption);
    ltcgOtherTaxableAfterExemption -= offsetLTCGOther;
    unexhaustedExemption -= offsetLTCGOther;
    totalOffsetUsed += offsetLTCGOther;
  }

  if (unexhaustedExemption > 0) {
    // Priority 3: LTCG Equity (12.5%)
    const offsetLTCGEquity = Math.min(ltcgEquityTaxableAfterExemption, unexhaustedExemption);
    ltcgEquityTaxableAfterExemption -= offsetLTCGEquity;
    unexhaustedExemption -= offsetLTCGEquity;
    totalOffsetUsed += offsetLTCGEquity;
  }

  // Special Rate Tax Calculations
  const stcgEquityTax = Math.round(stcgEquityTaxableAfterExemption * 0.20); // 20% under Sec 111A
  const ltcgOtherTax = Math.round(ltcgOtherTaxableAfterExemption * 0.125); // 12.5% under Sec 112
  const ltcgEquityTax = Math.round(ltcgEquityTaxableAfterExemption * 0.125); // 12.5% under Sec 112A

  const totalTaxBeforeRebate = Math.round(
    normalSlabBaseTax + stcgEquityTax + ltcgOtherTax + ltcgEquityTax
  );

  // Total Gross Income & Taxable Income for 87A Threshold Evaluation
  const grossTotalIncome =
    grossSalary +
    freelanceDeemedProfit +
    stcgEquity +
    stcgOther +
    ltcgEquity +
    ltcgOther +
    otherIncome;

  const totalNetTaxableIncome =
    normalSlabTaxableIncome +
    stcgEquityTaxableAfterExemption +
    ltcgOtherTaxableAfterExemption +
    ltcgEquityTaxableAfterExemption;

  // 8. Section 87A Rebate Computation
  let rebate87A = 0;
  const threshold = regimeSchema.rebate87A.taxableIncomeThreshold;
  const maxRebate = regimeSchema.rebate87A.maxRebateAmount;

  // Note: Tax on LTCG 112A cannot be adjusted against Section 87A rebate as per Sec 87A proviso
  const taxEligibleForRebate = totalTaxBeforeRebate - ltcgEquityTax;

  if (totalNetTaxableIncome <= threshold) {
    rebate87A = Math.min(taxEligibleForRebate, maxRebate);
  } else if (regimeSchema.rebate87A.hasMarginalRelief) {
    const excessIncome = totalNetTaxableIncome - threshold;
    if (taxEligibleForRebate > excessIncome) {
      rebate87A = Math.max(0, taxEligibleForRebate - excessIncome);
    }
  }

  const netTaxAfterRebate = Math.max(0, totalTaxBeforeRebate - rebate87A);

  // 9. Cess & Total Liability
  const cess = Math.round(netTaxAfterRebate * regimeSchema.healthAndEducationCessRate);
  const totalTaxLiability = netTaxAfterRebate + cess;

  const effectiveTaxRateOnTotalIncome =
    grossTotalIncome > 0
      ? Number(((totalTaxLiability / grossTotalIncome) * 100).toFixed(2))
      : 0;

  return {
    grossSalary,
    salariedStandardDeduction,
    netSalariedIncome,
    freelanceGrossReceipts: grossReceipts,
    freelanceDeemedProfit,
    stcgEquity,
    stcgOther,
    ltcgEquity,
    ltcgEquityExempted,
    ltcgEquityTaxable,
    ltcgOther,
    otherIncome,
    grossTotalIncome,
    chapterVIADeductionsApplied,
    normalSlabTaxableIncome,
    normalSlabBaseTax,
    stcgEquityTax,
    ltcgEquityTax,
    ltcgOtherTax,
    unexhaustedExemptionOffset: totalOffsetUsed,
    totalTaxBeforeRebate,
    rebate87A,
    netTaxAfterRebate,
    cess,
    totalTaxLiability,
    effectiveTaxRateOnTotalIncome,
  };
}

/**
 * Calculates multi-head comprehensive tax liability across New vs Old Tax Regimes
 */
export function calculateComprehensiveTax(
  input: ComprehensiveTaxInput
): ComprehensiveTaxResult {
  const newRegime = computeRegimeTax(input, 'newRegime');
  const oldRegime = computeRegimeTax(input, 'oldRegime');

  const recommendedRegime: 'NEW' | 'OLD' =
    newRegime.totalTaxLiability <= oldRegime.totalTaxLiability ? 'NEW' : 'OLD';
  const taxSavings = Math.abs(newRegime.totalTaxLiability - oldRegime.totalTaxLiability);

  const complianceNotes: string[] = [
    `Salaried Standard Deduction applied: ₹${newRegime.salariedStandardDeduction.toLocaleString('en-IN')} (New Regime) vs ₹${oldRegime.salariedStandardDeduction.toLocaleString('en-IN')} (Old Regime).`,
    `Presumptive business/freelance income included under ${input.workflowRoute}.`,
    `STCG (Equity Sec 111A) computed at 20% special flat rate.`,
    `LTCG (Listed Equity Sec 112A) computed at 12.5% rate with initial ₹1.25 Lakhs exemption limit.`,
    `New Tax Regime is the default statutory regime for FY 2026-27 (AY 2027-28).`,
  ];

  return {
    newRegime,
    oldRegime,
    recommendedRegime,
    taxSavings,
    complianceNotes,
  };
}
