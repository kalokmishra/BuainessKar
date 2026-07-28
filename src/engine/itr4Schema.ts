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

export interface ITR4Address {
  flatDoorBuilding?: string;
  roadStreet?: string;
  areaLocality?: string;
  townCityDistrict?: string;
  stateCode?: string;
  pinCode?: string;
}

export interface ITR4BankAccount {
  ifsCode: string;
  bankName: string;
  accountNumber: string;
  accountType?: 'SAVINGS' | 'CURRENT';
  isPrimaryForRefund?: boolean;
}

export interface ITR4BusinessDetails {
  businessCode?: string;
  tradeName?: string;
  description?: string;
}

export interface ITR4MappingInput {
  pan: string;
  fullName: string;
  workflowRoute: 'SECTION_44ADA' | 'SECTION_44AD' | 'STANDARD_AUDIT_REQUIRED';
  grossReceipts: number;
  cashReceipts: number;
  digitalReceipts?: number;
  presumptiveResult?: PresumptiveTaxResult;
  advanceTaxResult?: AdvanceTaxResult;
  tdsClaimed?: number;
  chapterVIADeductions?: number;
  optedNewRegime?: boolean;
  address?: ITR4Address;
  bankDetails?: ITR4BankAccount[];
  businessDetails?: ITR4BusinessDetails;
}

/**
 * Validates basic PAN format (5 letters, 4 digits, 1 letter)
 */
export function isValidPan(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
}

/**
 * Validates IFSC format (4 letters, 0, 6 alphanumeric)
 */
export function isValidIfsc(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
}

/**
 * Validates ITR-4 JSON compliance prior to e-filing export
 */
export function validateITR4SchemaCompliance(input: ITR4MappingInput): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.pan || !isValidPan(input.pan)) {
    errors.push('PAN is invalid or missing. Must be 10-character alphanumeric format (e.g. ABCDE1234F).');
  }

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.push('Full legal name is required.');
  }

  if (input.grossReceipts <= 0) {
    errors.push('Gross receipts must be greater than zero for presumptive filing.');
  }

  if (input.cashReceipts > input.grossReceipts) {
    errors.push('Cash receipts cannot exceed total gross receipts.');
  }

  if (input.bankDetails && input.bankDetails.length > 0) {
    const invalidIfsc = input.bankDetails.find((b) => !isValidIfsc(b.ifsCode));
    if (invalidIfsc) {
      warnings.push(`Bank IFSC '${invalidIfsc.ifsCode}' may be invalid. Ensure 11-character standard format.`);
    }
  } else {
    warnings.push('No bank account details specified. e-Filing refund requires at least one primary bank account.');
  }

  if (input.workflowRoute === 'STANDARD_AUDIT_REQUIRED') {
    warnings.push('Selected workflow route is STANDARD_AUDIT_REQUIRED. ITR-4 (Sugam) is intended for presumptive taxpayers (44AD/44ADA/44AE). Section 44AB taxpayers should file ITR-3.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
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
          address: input.address || {
            flatDoorBuilding: 'Flat 402, Building A',
            roadStreet: 'MG Road',
            areaLocality: 'Connaught Place',
            townCityDistrict: 'New Delhi',
            stateCode: '07',
            pinCode: '110001',
          },
        },
        BusinessDetails: {
          businessCode: input.businessDetails?.businessCode || (is44ADA ? '09028' : '02010'),
          tradeName: input.businessDetails?.tradeName || input.fullName || 'Consultancy Services',
          description: input.businessDetails?.description || (is44ADA ? 'Professional Services under Sec 44ADA' : 'Business Turnover under Sec 44AD'),
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
        BankDetails: input.bankDetails || [
          {
            ifsCode: 'SBIN0001234',
            bankName: 'State Bank of India',
            accountNumber: 'XXXXXX1234',
            accountType: 'SAVINGS',
            isPrimaryForRefund: true,
          },
        ],
        StatutoryDisclaimer: schema.meta.disclaimer,
      },
    },
  };
}
