import { describe, expect, it } from 'vitest';
import { calculateAdvanceTax } from '../src/engine/advanceTax.js';

describe('Module 4: Advance Tax & Penalty Engine', () => {
  it('should generate quarterly benchmarks (15%, 45%, 75%, 100%) for net tax liability', () => {
    const result = calculateAdvanceTax({
      estimatedAnnualTaxLiability: 200000,
      tdsTcsCredit: 50000, // Net liability = 150,000
      paymentsMade: [],
      isPresumptiveTaxpayer: true,
    });

    expect(result.netTaxLiabilityAfterTDS).toBe(150000);
    expect(result.schedule[0].targetAmount).toBe(22500); // 15% of 150,000
    expect(result.schedule[1].targetAmount).toBe(67500); // 45% of 150,000
    expect(result.schedule[2].targetAmount).toBe(112500); // 75% of 150,000
    expect(result.schedule[3].targetAmount).toBe(150000); // 100% of 150,000
  });

  it('should exempt presumptive taxpayers from Section 234C penalties for Q1, Q2, Q3 under Section 211(1)(b)', () => {
    const result = calculateAdvanceTax({
      estimatedAnnualTaxLiability: 100000,
      tdsTcsCredit: 0,
      paymentsMade: [], // 0 paid
      isPresumptiveTaxpayer: true,
    });

    // Q1, Q2, Q3 penalty should be 0 for presumptive taxpayers
    expect(result.schedule[0].penalty234C).toBe(0);
    expect(result.schedule[1].penalty234C).toBe(0);
    expect(result.schedule[2].penalty234C).toBe(0);
    // Q4 shortfall (100,000) incurs 1% = 1000
    expect(result.schedule[3].penalty234C).toBe(1000);
  });

  it('should compute Section 234B applicability if less than 90% paid', () => {
    const result = calculateAdvanceTax({
      estimatedAnnualTaxLiability: 100000,
      tdsTcsCredit: 0,
      paymentsMade: [{ quarter: 'Q4', paidAmount: 80000 }], // 80% paid (< 90%)
      isPresumptiveTaxpayer: true,
    });

    expect(result.isInterest234BApplicable).toBe(true);
  });
});
