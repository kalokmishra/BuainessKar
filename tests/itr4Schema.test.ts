import { describe, expect, it } from 'vitest';
import { calculateAdvanceTax } from '../src/engine/advanceTax.js';
import { generateITR4Json } from '../src/engine/itr4Schema.js';
import { calculatePresumptiveTax } from '../src/engine/presumptiveTax.js';

describe('Module 6: Government ITR-4 Schema Mapper', () => {
  it('should format JSON payload conforming to ITR-4 Sugam fields', () => {
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
    });

    const itrData = itr4Output.ITR.ITR4;
    expect(itrData.PersonalInfo.pan).toBe('ABCDE1234F');
    expect(itrData.PersonalInfo.assessmentYear).toBe('2027-28');
    expect(itrData.PersonalInfo.financialYear).toBe('2026-27');
    expect(itrData.IncomeDeductions.GrossReceipts44ADA).toBe(5000000);
    expect(itrData.IncomeDeductions.PresumptiveIncome44ADA).toBe(2500000);
    expect(itrData.TaxComputation.TotalTaxPayable).toBe(presumptiveResult.newRegime.totalTaxLiability);
    expect(itrData.AdvanceTaxAndTDS.TotalAdvanceTaxPaid).toBe(300000);
  });
});
