/**
 * Day 1 Core Engine - Module 3: Presumptive Tax & Old vs New Regime Engine
 * Computes deemed income under Section 44ADA (50%) and Section 44AD (6% digital + 8% cash),
 * and calculates tax liability under New vs Old Tax Regimes for FY 2026-27.
 */

import { getTaxSchema } from './schemaLoader.js';
import {
  PresumptiveTaxInput,
  PresumptiveTaxResult,
  TaxCalculationDetail,
  TaxSchemaRegime,
} from './types.js';

/**
 * Calculates tax liability for a given taxable income under specified regime rules
 */
export function calculateRegimeTax(
  taxableIncome: number,
  regime: TaxSchemaRegime
): { baseTax: number; rebate87A: number; netTax: number; cess: number; totalTax: number } {
  if (taxableIncome <= 0) {
    return { baseTax: 0, rebate87A: 0, netTax: 0, cess: 0, totalTax: 0 };
  }

  // 1. Calculate Base Tax from Slabs
  let baseTax = 0;
  for (const slab of regime.slabs) {
    if (taxableIncome > slab.min) {
      const slabMax = slab.max !== null ? slab.max : taxableIncome;
      const taxableInSlab = Math.min(taxableIncome, slabMax) - slab.min;
      if (taxableInSlab > 0) {
        baseTax += taxableInSlab * slab.rate;
      }
    }
  }

  // 2. Section 87A Rebate & Marginal Relief
  let rebate87A = 0;
  const threshold = regime.rebate87A.taxableIncomeThreshold;
  const maxRebate = regime.rebate87A.maxRebateAmount;

  if (taxableIncome <= threshold) {
    rebate87A = Math.min(baseTax, maxRebate);
  } else if (regime.rebate87A.hasMarginalRelief) {
    // Marginal Relief under New Regime:
    // If taxable income slightly exceeds threshold, tax payable cannot exceed income in excess of threshold
    const excessIncome = taxableIncome - threshold;
    if (baseTax > excessIncome) {
      // Tax is reduced to equal excess income
      rebate87A = Math.max(0, baseTax - excessIncome);
    }
  }

  const netTax = Math.max(0, baseTax - rebate87A);

  // 3. Health & Education Cess (4%)
  const cess = Math.round(netTax * regime.healthAndEducationCessRate);

  // 4. Total Tax
  const totalTax = Math.round(netTax + cess);

  return {
    baseTax: Math.round(baseTax),
    rebate87A: Math.round(rebate87A),
    netTax: Math.round(netTax),
    cess,
    totalTax,
  };
}

/**
 * Calculates presumptive income and compares Old vs New Tax Regimes
 */
export function calculatePresumptiveTax(input: PresumptiveTaxInput): PresumptiveTaxResult {
  const schema = getTaxSchema();

  const gross = Math.max(0, input.grossReceipts || 0);
  const cash = Math.max(0, input.cashReceipts || 0);
  const digital = input.digitalReceipts !== undefined ? Math.max(0, input.digitalReceipts) : Math.max(0, gross - cash);
  const otherIncome = Math.max(0, input.otherIncome || 0);
  const chapterVIADeductions = Math.max(0, input.chapterVIADeductions || 0);

  // 1. Calculate Statutory Deemed Profit
  let grossDeemedProfit = 0;
  let rateAppliedText = '';

  if (input.workflowRoute === 'SECTION_44ADA') {
    const minProfit = Math.round(gross * schema.section44ADA.presumptiveProfitRate); // 50%
    grossDeemedProfit = minProfit;
    rateAppliedText = '50% of gross professional receipts';
  } else if (input.workflowRoute === 'SECTION_44AD') {
    const digitalProfit = Math.round(digital * schema.section44AD.digitalProfitRate); // 6%
    const cashProfit = Math.round(cash * schema.section44AD.cashProfitRate); // 8%
    grossDeemedProfit = digitalProfit + cashProfit;
    rateAppliedText = '6% on digital receipts + 8% on cash receipts';
  } else {
    // Standard audit default estimate 8%
    grossDeemedProfit = Math.round(gross * 0.08);
    rateAppliedText = 'Estimated 8% default rate (Tax Audit standard route)';
  }

  // Allow higher user-declared profit if provided
  const declaredProfitUsed =
    input.declaredProfit && input.declaredProfit > grossDeemedProfit
      ? Math.round(input.declaredProfit)
      : grossDeemedProfit;

  const grossTotalIncome = declaredProfitUsed + otherIncome;

  // 2. New Regime Calculation
  const newRegimeSchema = schema.taxRegimes.newRegime;
  const newTaxableIncome = grossTotalIncome; // Chapter VIA deductions largely disabled in New Regime
  const newCalc = calculateRegimeTax(newTaxableIncome, newRegimeSchema);

  const newRegimeDetail: TaxCalculationDetail = {
    grossDeemedProfit,
    declaredProfitUsed,
    otherIncome,
    grossTotalIncome,
    deductionsApplied: 0,
    totalTaxableIncome: newTaxableIncome,
    baseTaxBeforeRebate: newCalc.baseTax,
    rebate87A: newCalc.rebate87A,
    netTaxAfterRebate: newCalc.netTax,
    cess: newCalc.cess,
    totalTaxLiability: newCalc.totalTax,
    effectiveTaxRate:
      grossTotalIncome > 0 ? Number(((newCalc.totalTax / grossTotalIncome) * 100).toFixed(2)) : 0,
  };

  // 3. Old Regime Calculation
  const oldRegimeSchema = schema.taxRegimes.oldRegime;
  const oldTaxableIncome = Math.max(0, grossTotalIncome - chapterVIADeductions);
  const oldCalc = calculateRegimeTax(oldTaxableIncome, oldRegimeSchema);

  const oldRegimeDetail: TaxCalculationDetail = {
    grossDeemedProfit,
    declaredProfitUsed,
    otherIncome,
    grossTotalIncome,
    deductionsApplied: chapterVIADeductions,
    totalTaxableIncome: oldTaxableIncome,
    baseTaxBeforeRebate: oldCalc.baseTax,
    rebate87A: oldCalc.rebate87A,
    netTaxAfterRebate: oldCalc.netTax,
    cess: oldCalc.cess,
    totalTaxLiability: oldCalc.totalTax,
    effectiveTaxRate:
      grossTotalIncome > 0 ? Number(((oldCalc.totalTax / grossTotalIncome) * 100).toFixed(2)) : 0,
  };

  // 4. Recommendation Logic
  const recommendedRegime: 'NEW' | 'OLD' =
    newCalc.totalTax <= oldCalc.totalTax ? 'NEW' : 'OLD';
  const taxSavings = Math.abs(newCalc.totalTax - oldCalc.totalTax);

  const complianceNotes: string[] = [
    `Deemed profit calculated under ${input.workflowRoute} rule: ${rateAppliedText}.`,
    `New Tax Regime is the default regime for FY 2026-27 (AY 2027-28).`,
  ];

  if (recommendedRegime === 'NEW') {
    complianceNotes.push(
      `New Regime saves ₹${taxSavings.toLocaleString('en-IN')} in tax due to wider slab brackets and Section 87A rebate up to ₹7,00,000.`
    );
  } else {
    complianceNotes.push(
      `Old Regime saves ₹${taxSavings.toLocaleString('en-IN')} due to Chapter VI-A deductions (e.g. 80C, 80D) amounting to ₹${chapterVIADeductions.toLocaleString('en-IN')}.`
    );
  }

  return {
    workflowRoute: input.workflowRoute,
    presumptiveRateAppliedText: rateAppliedText,
    deemedProfit: declaredProfitUsed,
    oldRegime: oldRegimeDetail,
    newRegime: newRegimeDetail,
    recommendedRegime,
    taxSavings,
    complianceNotes,
  };
}
