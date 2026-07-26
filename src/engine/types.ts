/**
 * Day 1 Core Engine - TypeScript Interfaces & Types
 * Indian Tax Utility for Section 44AD and Section 44ADA (FY 2026-27)
 */

export type EntityType =
  | 'INDIVIDUAL'
  | 'HUF'
  | 'PARTNERSHIP'
  | 'LLP'
  | 'PRIVATE_LIMITED'
  | 'PUBLIC_LIMITED'
  | 'OTHER';

export type ProfessionCategory =
  | 'LEGAL'
  | 'MEDICAL'
  | 'ENGINEERING'
  | 'ARCHITECTURE'
  | 'ACCOUNTANCY'
  | 'TECHNICAL_CONSULTANCY'
  | 'INTERIOR_DECORATION'
  | 'IT_SOFTWARE'
  | 'AUTHORIZED_REPRESENTATIVE'
  | 'FILM_ARTIST'
  | 'COMPANY_SECRETARY'
  | 'NON_ELIGIBLE_PROFESSION';

export type BusinessCategory =
  | 'RETAIL_TRADING'
  | 'WHOLESALE_TRADING'
  | 'MANUFACTURING'
  | 'SERVICES_GENERAL'
  | 'COMMISSION_OR_BROKERAGE'
  | 'AGENCY_BUSINESS'
  | 'PLYING_HIRING_GOODS_CARRIAGES_44AE';

export type WorkflowRoute =
  | 'SECTION_44ADA'
  | 'SECTION_44AD'
  | 'STANDARD_AUDIT_REQUIRED';

export type SurveillanceStatus = 'NORMAL' | 'TIER_1_WARNING' | 'TIER_2_VIOLATION';

export interface TaxSchemaSlab {
  min: number;
  max: number | null;
  rate: number;
}

export interface TaxSchemaRegime {
  standardDeductionSalaried: number;
  standardDeductionPresumptive: number;
  slabs: TaxSchemaSlab[];
  rebate87A: {
    taxableIncomeThreshold: number;
    maxRebateAmount: number;
    hasMarginalRelief: boolean;
  };
  healthAndEducationCessRate: number;
}

export interface TaxSchemaQuarter {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  dueDate: string;
  minCumulativePercent: number;
  description: string;
}

export interface TaxSchema {
  meta: {
    financialYear: string;
    assessmentYear: string;
    version: string;
    lastUpdated: string;
    jurisdiction: string;
    disclaimer: string;
  };
  section44ADA: {
    standardLimit: number;
    extendedDigitalLimit: number;
    maxCashReceiptsPercentage: number;
    presumptiveProfitRate: number;
    eligibleProfessions: ProfessionCategory[];
  };
  section44AD: {
    standardLimit: number;
    extendedDigitalLimit: number;
    maxCashReceiptsPercentage: number;
    digitalProfitRate: number;
    cashProfitRate: number;
    ineligibleBusinesses: BusinessCategory[];
  };
  cashSurveillance: {
    normalUpperThreshold: number;
    warningUpperThreshold: number;
    tier1WarningMessage: string;
    tier2ViolationMessage: string;
  };
  advanceTaxSchedule: {
    quarters: TaxSchemaQuarter[];
    interestRatePerMonth234C: number;
    interestRatePerMonth234B: number;
    presumptiveSpecialNote: string;
  };
  taxRegimes: {
    newRegime: TaxSchemaRegime;
    oldRegime: TaxSchemaRegime;
  };
  gst: {
    sacCodes: Array<{ code: string; description: string }>;
    standardRates: number[];
    defaultServiceRate: number;
    zeroRatedDisclaimer: string;
  };
}

export interface EligibilityInput {
  entityType: EntityType;
  activityType: 'PROFESSION' | 'BUSINESS';
  professionCategory?: ProfessionCategory;
  businessCategory?: BusinessCategory;
  grossReceipts: number;
  cashReceipts: number;
  declaredProfit?: number; // Optional user declared profit if higher/lower than presumptive
}

export interface EligibilityResult {
  isEligible: boolean;
  workflowRoute: WorkflowRoute;
  applicableSection: '44ADA' | '44AD' | '44AB_AUDIT';
  applicableTurnoverLimit: number;
  isExtendedLimitApplied: boolean;
  disqualificationReasons: string[];
  recommendation: string;
}

export interface CashSurveillanceInput {
  grossReceipts: number;
  cashReceipts: number;
}

export interface CashSurveillanceResult {
  grossReceipts: number;
  cashReceipts: number;
  digitalReceipts: number;
  cashPercentage: number;
  status: SurveillanceStatus;
  alertTitle: string;
  alertMessage: string;
  localizedHindiAlert: string;
  actionRequired: string;
}

export interface PresumptiveTaxInput {
  workflowRoute: WorkflowRoute;
  grossReceipts: number;
  cashReceipts: number;
  digitalReceipts?: number;
  declaredProfit?: number;
  otherIncome?: number;
  chapterVIADeductions?: number; // E.g., 80C, 80D under Old Regime
}

export interface TaxCalculationDetail {
  grossDeemedProfit: number;
  declaredProfitUsed: number;
  otherIncome: number;
  grossTotalIncome: number;
  deductionsApplied: number;
  totalTaxableIncome: number;
  baseTaxBeforeRebate: number;
  rebate87A: number;
  netTaxAfterRebate: number;
  cess: number;
  totalTaxLiability: number;
  effectiveTaxRate: number;
}

export interface PresumptiveTaxResult {
  workflowRoute: WorkflowRoute;
  presumptiveRateAppliedText: string;
  deemedProfit: number;
  oldRegime: TaxCalculationDetail;
  newRegime: TaxCalculationDetail;
  recommendedRegime: 'NEW' | 'OLD';
  taxSavings: number;
  complianceNotes: string[];
}

export interface AdvanceTaxPayment {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  paidAmount: number;
  paymentDate?: string;
}

export interface AdvanceTaxInput {
  estimatedAnnualTaxLiability: number;
  tdsTcsCredit?: number;
  paymentsMade: AdvanceTaxPayment[];
  isPresumptiveTaxpayer?: boolean; // Section 211(1)(b) single March 15 deadline privilege
}

export interface QuarterScheduleResult {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  dueDate: string;
  minPercent: number;
  targetAmount: number;
  cumulativePaid: number;
  shortfall: number;
  status: 'COMPLIANT' | 'SHORTFALL' | 'UPCOMING';
  penalty234C: number;
}

export interface AdvanceTaxResult {
  netTaxLiabilityAfterTDS: number;
  totalPaidToDate: number;
  schedule: QuarterScheduleResult[];
  totalShortfall: number;
  totalInterest234C: number;
  isInterest234BApplicable: boolean;
  presumptiveSpecialBenefitNote: string;
}

export interface InvoiceItem {
  description: string;
  sacCode: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceInput {
  invoiceNumber: string;
  invoiceDate: string;
  supplierGSTIN?: string;
  recipientName: string;
  recipientGSTIN?: string;
  placeOfSupplyStateCode?: string; // E.g., '07' for Delhi, '27' for Maharashtra
  supplierStateCode?: string;
  isCrossBorderExport: boolean;
  lutNumber?: string;
  lutDate?: string;
  currency?: string; // Default 'INR', or 'USD', 'EUR', etc.
  exchangeRateINR?: number; // E.g., 86.5 for USD to INR
  items: InvoiceItem[];
}

export interface InvoiceExportMetadata {
  invoiceNumber: string;
  invoiceDate: string;
  isZeroRatedExport: boolean;
  sacCodeMapped: string;
  sacDescription: string;
  statutoryDisclaimer: string;
  totalTaxableAmountINR: number;
  cgstAmountINR: number;
  sgstAmountINR: number;
  igstAmountINR: number;
  totalInvoiceValueINR: number;
  foreignCurrencyDetails?: {
    currency: string;
    exchangeRate: number;
    totalAmountForeignCurrency: number;
  };
  complianceStatus: 'VALID' | 'WARNING';
  validationNotes: string[];
}

export interface ITR4PersonalDetails {
  pan: string;
  fullName: string;
  assessmentYear: string;
  financialYear: string;
  employerCategory: string;
  filingSection: string; // e.g. '139(1)'
  optedNewTaxRegime: boolean;
}

export interface ITR4SchemaOutput {
  ITR: {
    ITR4: {
      CreationInfo: {
        Source: string;
        Version: string;
        Timestamp: string;
      };
      PersonalInfo: ITR4PersonalDetails;
      IncomeDeductions: {
        GrossReceipts44ADA?: number;
        PresumptiveIncome44ADA?: number;
        GrossReceipts44AD_Digital?: number;
        GrossReceipts44AD_Cash?: number;
        PresumptiveIncome44AD?: number;
        OtherIncome?: number;
        GrossTotalIncome: number;
        DeductionsUnderChapterVIA: number;
        TotalIncome: number;
      };
      TaxComputation: {
        GrossTaxLiability: number;
        Section87ARebate: number;
        NetTaxLiability: number;
        EducationCess: number;
        TotalTaxPayable: number;
      };
      AdvanceTaxAndTDS: {
        TotalTDSClaimed: number;
        TotalAdvanceTaxPaid: number;
        NetBalancePayableOrRefund: number;
      };
      StatutoryDisclaimer: string;
    };
  };
}

export interface CapitalGainsInput {
  stcgEquity: number; // Section 111A (Equity shares / Equity MFs) - 20%
  stcgOther: number; // Other STCG (Slab rates)
  ltcgEquity: number; // Section 112A (Listed Equity / MFs) - 12.5% above ₹1.25L
  ltcgOther: number; // Section 112 (Real estate, unlisted shares, gold) - 12.5%
}

export interface ComprehensiveTaxInput {
  grossSalary: number;
  workflowRoute: WorkflowRoute;
  freelanceGrossReceipts: number;
  freelanceCashReceipts: number;
  freelanceDeclaredProfit?: number;
  capitalGains: CapitalGainsInput;
  otherIncome: number;
  chapterVIADeductions: number;
}

export interface ComprehensiveRegimeResult {
  grossSalary: number;
  salariedStandardDeduction: number;
  netSalariedIncome: number;
  freelanceGrossReceipts: number;
  freelanceDeemedProfit: number;
  stcgEquity: number;
  stcgOther: number;
  ltcgEquity: number;
  ltcgEquityExempted: number;
  ltcgEquityTaxable: number;
  ltcgOther: number;
  otherIncome: number;
  grossTotalIncome: number;
  chapterVIADeductionsApplied: number;
  normalSlabTaxableIncome: number;
  normalSlabBaseTax: number;
  stcgEquityTax: number;
  ltcgEquityTax: number;
  ltcgOtherTax: number;
  unexhaustedExemptionOffset: number;
  totalTaxBeforeRebate: number;
  rebate87A: number;
  netTaxAfterRebate: number;
  cess: number;
  totalTaxLiability: number;
  effectiveTaxRateOnTotalIncome: number;
}

export interface ComprehensiveTaxResult {
  newRegime: ComprehensiveRegimeResult;
  oldRegime: ComprehensiveRegimeResult;
  recommendedRegime: 'NEW' | 'OLD';
  taxSavings: number;
  complianceNotes: string[];
}

export interface AITaxTip {
  title: string;
  category: 'REGIME_OPTIMIZATION' | 'CASH_SURVEILLANCE' | 'ADVANCE_TAX' | 'DEDUCTIONS' | 'GST_LUT' | 'BUSINESS_EXPENSE';
  recommendation: string;
  impact: string;
  statutoryRef: string;
}

export interface AITaxAdvisorResponse {
  summary: string;
  overallStrategy: string;
  tips: AITaxTip[];
  actionChecklist: string[];
}
