import { describe, it, expect } from 'vitest';
import { calculateComprehensiveTax } from '../src/engine/comprehensiveTax';

describe('Comprehensive Multi-Head Tax Engine Module', () => {
  it('correctly calculates multi-head income with Salary, 44ADA Freelance, STCG Equity, and LTCG Equity', () => {
    const result = calculateComprehensiveTax({
      grossSalary: 600000, // ₹6,00,000 gross salary
      workflowRoute: 'SECTION_44ADA',
      freelanceGrossReceipts: 2000000, // ₹20,00,000 freelance receipts -> ₹10,00,000 deemed profit
      freelanceCashReceipts: 50000,
      capitalGains: {
        stcgEquity: 100000, // ₹1,00,000 STCG Equity (Sec 111A) -> 20% tax
        stcgOther: 0,
        ltcgEquity: 225000, // ₹2,25,000 LTCG Equity (Sec 112A) -> ₹1,00,000 taxable at 12.5%
        ltcgOther: 0,
      },
      otherIncome: 50000, // ₹50,000 bank interest
      chapterVIADeductions: 150000, // ₹1,50,000 80C under Old Regime
    });

    // Check New Regime
    expect(result.newRegime.grossSalary).toBe(600000);
    expect(result.newRegime.salariedStandardDeduction).toBe(75000);
    expect(result.newRegime.netSalariedIncome).toBe(525000);
    expect(result.newRegime.freelanceDeemedProfit).toBe(1000000);
    expect(result.newRegime.ltcgEquityExempted).toBe(125000);
    expect(result.newRegime.ltcgEquityTaxable).toBe(100000);
    expect(result.newRegime.ltcgEquityTax).toBe(12500); // 12.5% of 100,000
    expect(result.newRegime.stcgEquityTax).toBe(20000); // 20% of 100,000

    // Recommended regime should be determined
    expect(['NEW', 'OLD']).toContain(result.recommendedRegime);
    expect(result.complianceNotes.length).toBeGreaterThan(0);
  });

  it('handles standard deduction and Chapter VI-A deductions under Old vs New Regime', () => {
    const result = calculateComprehensiveTax({
      grossSalary: 1200000,
      workflowRoute: 'SECTION_44ADA',
      freelanceGrossReceipts: 1000000,
      freelanceCashReceipts: 0,
      capitalGains: {
        stcgEquity: 0,
        stcgOther: 0,
        ltcgEquity: 0,
        ltcgOther: 0,
      },
      otherIncome: 0,
      chapterVIADeductions: 200000,
    });

    // New Regime standard deduction is 75,000; Old Regime is 50,000
    expect(result.newRegime.salariedStandardDeduction).toBe(75000);
    expect(result.oldRegime.salariedStandardDeduction).toBe(50000);

    // Chapter VIA deductions applied in Old Regime only
    expect(result.newRegime.chapterVIADeductionsApplied).toBe(0);
    expect(result.oldRegime.chapterVIADeductionsApplied).toBe(200000);
  });

  it('correctly applies basic exemption set-off for resident individuals if normal slab income is low', () => {
    const result = calculateComprehensiveTax({
      grossSalary: 0,
      workflowRoute: 'SECTION_44ADA',
      freelanceGrossReceipts: 200000, // ₹1,00,000 deemed profit
      freelanceCashReceipts: 0,
      capitalGains: {
        stcgEquity: 200000, // ₹2,00,000 STCG Equity
        stcgOther: 0,
        ltcgEquity: 0,
        ltcgOther: 0,
      },
      otherIncome: 0,
      chapterVIADeductions: 0,
    });

    // Normal slab income is ₹1,00,000 which is less than basic exemption limit (₹4,00,000 in New Regime).
    // Shortfall = ₹3,00,000, set off against ₹2,00,000 STCG Equity. Tax on STCG becomes 0!
    expect(result.newRegime.unexhaustedExemptionOffset).toBeGreaterThan(0);
    expect(result.newRegime.stcgEquityTax).toBe(0);
  });
});
