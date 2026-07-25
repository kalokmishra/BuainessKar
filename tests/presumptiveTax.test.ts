import { describe, expect, it } from 'vitest';
import { calculatePresumptiveTax } from '../src/engine/presumptiveTax.js';

describe('Module 3: Presumptive Tax & Tax Regime Engine', () => {
  it('should calculate 50% deemed profit for Section 44ADA', () => {
    const result = calculatePresumptiveTax({
      workflowRoute: 'SECTION_44ADA',
      grossReceipts: 6000000, // ₹60 Lakhs
      cashReceipts: 100000,
    });

    expect(result.deemedProfit).toBe(3000000); // 50% = ₹30 Lakhs
  });

  it('should calculate 6% digital and 8% cash deemed profit for Section 44AD', () => {
    const result = calculatePresumptiveTax({
      workflowRoute: 'SECTION_44AD',
      grossReceipts: 10000000, // ₹1 Crore
      cashReceipts: 400000, // ₹4 Lakhs cash (8%) -> ₹32,000
      digitalReceipts: 9600000, // ₹96 Lakhs digital (6%) -> ₹5,76,000
    });

    // 576,000 + 32,000 = 608,000
    expect(result.deemedProfit).toBe(608000);
  });

  it('should apply Section 87A rebate when taxable income <= ₹7,00,000 under New Regime', () => {
    const result = calculatePresumptiveTax({
      workflowRoute: 'SECTION_44ADA',
      grossReceipts: 1200000, // 50% = ₹6,00,000
      cashReceipts: 0,
    });

    expect(result.newRegime.totalTaxableIncome).toBe(600000);
    expect(result.newRegime.rebate87A).toBeGreaterThan(0);
    expect(result.newRegime.totalTaxLiability).toBe(0); // 100% tax rebate
  });

  it('should recommend New Tax Regime when deductions are minimal', () => {
    const result = calculatePresumptiveTax({
      workflowRoute: 'SECTION_44ADA',
      grossReceipts: 4000000, // 50% = ₹20,00,000
      cashReceipts: 0,
      chapterVIADeductions: 150000, // 80C
    });

    expect(result.recommendedRegime).toBe('NEW');
    expect(result.taxSavings).toBeGreaterThan(0);
  });
});
