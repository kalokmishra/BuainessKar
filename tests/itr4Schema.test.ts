import { describe, expect, it } from 'vitest';
import { calculateAdvanceTax } from '../src/engine/advanceTax.js';
import {
  generateITR4Json,
  isValidPan,
  isValidIfsc,
  validateITR4SchemaCompliance,
} from '../src/engine/itr4Schema.js';
import { calculatePresumptiveTax } from '../src/engine/presumptiveTax.js';

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
});

