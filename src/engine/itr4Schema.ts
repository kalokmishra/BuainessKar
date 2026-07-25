/**
 * Day 1 Core Engine - Module 6: Government ITR-4 (Sugam) JSON Mapper
 * Maps financial state, presumptive calculations, and advance tax history into official ITR-4 Sugam JSON structure.
 */

import { getTaxSchema } from './schemaLoader.js';
import {
  AdvanceTaxResult,
  ITR4SchemaOutput,
  PresumptiveTaxResult,
} from './types.js';

export interface ITR4MappingInput {
  pan: string;
  fullName: string;
  workflowRoute: 'SECTION_44ADA' | 'SECTION_44AD' | 'STANDARD_AUDIT_REQUIRED';
  grossReceipts: number;
  cashReceipts: number;
  digitalReceipts?: number;
  presumptiveResult: PresumptiveTaxResult;
  advanceTaxResult: AdvanceTaxResult;
  tdsClaimed?: number;
  chapterVIADeductions?: number;
  optedNewRegime?: boolean;
}

/**
 * Maps calculated tax engine outputs into standard ITR-4 (Sugam) JSON Schema format
 */
export function generateITR4Json(input: ITR4MappingInput): ITR4SchemaOutput {
  const schema = getTaxSchema();

  const isNewRegime = input.optedNewRegime !== false; // Default New Regime
  const regimeDetail = isNewRegime
    ? input.presumptiveResult.newRegime
    : input.presumptiveResult.oldRegime;

  const gross = Math.max(0, input.grossReceipts || 0);
  const cash = Math.max(0, input.cashReceipts || 0);
  const digital = input.digitalReceipts !== undefined ? Math.max(0, input.digitalReceipts) : Math.max(0, gross - cash);

  const tds = Math.max(0, input.tdsClaimed || 0);
  const totalPaid = input.advanceTaxResult.totalPaidToDate;
  const netTaxPayable = regimeDetail.totalTaxLiability;
  const netBalance = netTaxPayable - (tds + totalPaid);

  const is44ADA = input.workflowRoute === 'SECTION_44ADA';

  return {
    ITR: {
      ITR4: {
        CreationInfo: {
          Source: 'Indian Tax Utility MVP Core RaC Engine',
          Version: schema.meta.version,
          Timestamp: new Date().toISOString(),
        },
        PersonalInfo: {
          pan: (input.pan || 'ABCDE1234F').toUpperCase(),
          fullName: input.fullName || 'Valued Taxpayer',
          assessmentYear: schema.meta.assessmentYear, // "2027-28"
          financialYear: schema.meta.financialYear, // "2026-27"
          employerCategory: 'OTHERS_FREELANCE_BUSINESS',
          filingSection: '139(1)_ON_OR_BEFORE_DUE_DATE',
          optedNewTaxRegime: isNewRegime,
        },
        IncomeDeductions: {
          GrossReceipts44ADA: is44ADA ? gross : undefined,
          PresumptiveIncome44ADA: is44ADA ? input.presumptiveResult.deemedProfit : undefined,
          GrossReceipts44AD_Digital: !is44ADA ? digital : undefined,
          GrossReceipts44AD_Cash: !is44ADA ? cash : undefined,
          PresumptiveIncome44AD: !is44ADA ? input.presumptiveResult.deemedProfit : undefined,
          OtherIncome: regimeDetail.otherIncome,
          GrossTotalIncome: regimeDetail.grossTotalIncome,
          DeductionsUnderChapterVIA: regimeDetail.deductionsApplied,
          TotalIncome: regimeDetail.totalTaxableIncome,
        },
        TaxComputation: {
          GrossTaxLiability: regimeDetail.baseTaxBeforeRebate,
          Section87ARebate: regimeDetail.rebate87A,
          NetTaxLiability: regimeDetail.netTaxAfterRebate,
          EducationCess: regimeDetail.cess,
          TotalTaxPayable: regimeDetail.totalTaxLiability,
        },
        AdvanceTaxAndTDS: {
          TotalTDSClaimed: tds,
          TotalAdvanceTaxPaid: totalPaid,
          NetBalancePayableOrRefund: netBalance,
        },
        StatutoryDisclaimer: schema.meta.disclaimer,
      },
    },
  };
}
