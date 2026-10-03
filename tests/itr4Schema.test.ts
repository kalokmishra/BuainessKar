import { describe, expect, it, afterAll } from 'vitest';
import fs from 'fs';
import { calculateAdvanceTax } from '../src/engine/advanceTax.js';
import {
  generateITR4Json,
  isValidPan,
  isValidIfsc,
  validateITR4SchemaCompliance,
} from '../src/engine/itr4Schema.js';
import { calculatePresumptiveTax } from '../src/engine/presumptiveTax.js';
import { generateITR4SummaryPdf } from '../src/utils/pdfExporter.js';

describe('Module 6: Government ITR-4 Schema Mapper', () => {
  it('should validate PAN and IFSC regex formats correctly', () => {
    expect(isValidPan('ABCDE1234F')).toBe(true);
    expect(isValidPan('abcde1234f')).toBe(true);
    expect(isValidPan('INVALIDPAN')).toBe(false);
    expect(isValidPan('ABC1234567')).toBe(false);

    expect(isValidIfsc('SBIN0001234')).toBe(true);
    expect(isValidIfsc('HDFC0000001')).toBe(true);
    expect(isValidIfsc('INVALIDIFSC')).toBe(false);
  });

  it('should validate ITR-4 schema compliance and return clear errors/warnings', () => {
    const validResult = validateITR4SchemaCompliance({
      pan: 'ABCDE1234F',
      fullName: 'Rahul Sharma',
      workflowRoute: 'SECTION_44ADA',
      grossReceipts: 5000000,
      cashReceipts: 100000,
      bankDetails: [{ ifsCode: 'SBIN0001234', bankName: 'SBI', accountNumber: '12345678' }],
    });
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors.length).toBe(0);

    const invalidResult = validateITR4SchemaCompliance({
      pan: 'BADPAN',
      fullName: '',
      workflowRoute: 'STANDARD_AUDIT_REQUIRED',
      grossReceipts: -500,
      cashReceipts: 1000,
    });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
    expect(invalidResult.warnings.length).toBeGreaterThan(0);
  });

  it('should format JSON payload conforming to ITR-4 Sugam fields including Bank and Business details', () => {
    const presumptiveResult = calculatePresumptiveTax({
      workflowRoute: 'SECTION_44ADA',
      grossReceipts: 5000000,
      cashReceipts: 100000,
    });

    const advanceTaxResult = calculateAdvanceTax({
      estimatedAnnualTaxLiability: presumptiveResult.newRegime.totalTaxLiability,
      paymentsMade: [{ quarter: 'Q4', paidAmount: 300000 }],
      isPresumptiveTaxpayer: true,
    });

    const itr4Output = generateITR4Json({
      pan: 'ABCDE1234F',
      fullName: 'Rahul Sharma',
      workflowRoute: 'SECTION_44ADA',
      grossReceipts: 5000000,
      cashReceipts: 100000,
      presumptiveResult,
      advanceTaxResult,
      tdsClaimed: 25000,
      optedNewRegime: true,
      businessDetails: {
        businessCode: '09028',
        tradeName: 'Sharma Tech Solutions',
        description: 'Software Development Services',
      },
      bankDetails: [
        {
          ifsCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          accountNumber: '9876543210',
          accountType: 'SAVINGS',
          isPrimaryForRefund: true,
        },
      ],
    });

    const itrData = itr4Output.ITR.ITR4;
    expect(itrData.PersonalInfo.pan).toBe('ABCDE1234F');
    expect(itrData.PersonalInfo.assessmentYear).toBe('2027-28');
    expect(itrData.PersonalInfo.financialYear).toBe('2026-27');
    expect(itrData.BusinessDetails?.businessCode).toBe('09028');
    expect(itrData.BusinessDetails?.tradeName).toBe('Sharma Tech Solutions');
    expect(itrData.BankDetails?.[0].ifsCode).toBe('SBIN0001234');
    expect(itrData.IncomeDeductions.GrossReceipts44ADA).toBe(5000000);
    expect(itrData.IncomeDeductions.PresumptiveIncome44ADA).toBe(2500000);
    expect(itrData.TaxComputation.TotalTaxPayable).toBe(presumptiveResult.newRegime.totalTaxLiability);
    expect(itrData.AdvanceTaxAndTDS.TotalAdvanceTaxPaid).toBe(300000);
  });

  it('should generate formal ITR-4 Tax Summary PDF document without errors', () => {
    const presumptive = calculatePresumptiveTax({
      workflowRoute: 'SECTION_44ADA',
      grossReceipts: 4800000,
      cashReceipts: 100000,
    });

    const advanceTax = calculateAdvanceTax({
      estimatedAnnualTaxLiability: presumptive.newRegime.totalTaxLiability,
      paymentsMade: [],
      isPresumptiveTaxpayer: true,
    });

    const result = generateITR4SummaryPdf({
      pan: 'ABCDE1234F',
      fullName: 'Rahul Sharma',
      workflowRoute: 'SECTION_44ADA',
      businessCode: '09028',
      tradeName: 'Software Consultancy Services',
      grossReceipts: 4800000,
      cashReceipts: 100000,
      tdsClaimed: 25000,
      optedNewRegime: true,
      presumptive,
      advanceTax,
      bankDetails: [
        {
          bankName: 'State Bank of India',
          accountNumber: '998877665544',
          ifsCode: 'SBIN0001234',
          isPrimaryForRefund: true,
        },
      ],
    });

    expect(result.filename).toBe('ITR4_Sugam_Tax_Summary_ABCDE1234F_AY2027-28.pdf');
    expect(result.doc).toBeDefined();
    expect(result.doc.getNumberOfPages()).toBe(1);
  });

  it('should generate formal ITR-4 Tax Summary PDF for Section 44AD with tax refund scenario', () => {
    const presumptive = calculatePresumptiveTax({
      workflowRoute: 'SECTION_44AD',
      grossReceipts: 2000000,
      cashReceipts: 50000,
    });

    const advanceTax = calculateAdvanceTax({
      estimatedAnnualTaxLiability: presumptive.newRegime.totalTaxLiability,
      paymentsMade: [],
      isPresumptiveTaxpayer: true,
    });

    // High TDS leads to refund
    const result = generateITR4SummaryPdf({
      pan: 'XYZAB9876C',
      fullName: 'Priya Verma',
      workflowRoute: 'SECTION_44AD',
      businessCode: '09025',
      tradeName: 'Verma Design Studio',
      grossReceipts: 2000000,
      cashReceipts: 50000,
      tdsClaimed: 100000,
      optedNewRegime: false,
      presumptive,
      advanceTax,
    });

    expect(result.filename).toBe('ITR4_Sugam_Tax_Summary_XYZAB9876C_AY2027-28.pdf');
    expect(result.doc).toBeDefined();
    expect(result.doc.getNumberOfPages()).toBe(1);
  });

  afterAll(() => {
    const files = [
      'ITR4_Sugam_Tax_Summary_ABCDE1234F_AY2027-28.pdf',
      'ITR4_Sugam_Tax_Summary_XYZAB9876C_AY2027-28.pdf',
    ];
    files.forEach((f) => {
      if (fs.existsSync(f)) {
        try {
          fs.unlinkSync(f);
        } catch {}
      }
    });
  });
});

