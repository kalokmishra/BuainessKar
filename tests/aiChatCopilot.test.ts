import { describe, it, expect } from 'vitest';
import {
  computeBaselineTax,
  generateDeterministicChatResponse,
  processAIChatCopilot,
  TaxProfileContext,
} from '../src/engine/aiChatCopilot';

describe('AI Tax Chat Copilot Engine', () => {
  const mockTaxData: TaxProfileContext['taxData'] = {
    entityType: 'INDIVIDUAL',
    activityType: 'PROFESSION',
    professionCategory: 'IT_SOFTWARE',
    grossReceipts: 4800000,
    cashReceipts: 120000,
    hasSalary: false,
    grossSalary: 0,
    hasHouseProperty: false,
    rentalIncome: 0,
    hasCapitalGains: false,
    stcgEquity: 0,
    stcgOther: 0,
    ltcgEquity: 0,
    ltcgOther: 0,
    hasOtherIncome: false,
    otherIncome: 0,
    sec80C: 150000,
    sec80D: 25000,
    sec80CCD1B: 0,
    sec80TTA: 10000,
    chapterVIADeductions: 185000,
    tdsClaimed: 25000,
  };

  it('correctly calculates baseline tax metrics from user profile', () => {
    const baseline = computeBaselineTax(mockTaxData);
    expect(baseline).toBeDefined();
    expect(baseline.workflowRoute).toBe('SECTION_44ADA');
    expect(baseline.result.newRegime.totalTaxLiability).toBeGreaterThan(0);
    expect(baseline.result.oldRegime.totalTaxLiability).toBeGreaterThan(0);
    expect(baseline.cashSurveillance.cashPercentage).toBeLessThan(5.0);
    expect(baseline.recommendedRegime).toBe('NEW');
  });

  it('handles What-If analysis for Section 80CCD(1B) NPS contribution', () => {
    const baseline = computeBaselineTax(mockTaxData);
    const response = generateDeterministicChatResponse(
      'What if I invest ₹50,000 in NPS Tier-1 under Section 80CCD(1B)?',
      mockTaxData,
      baseline
    );

    expect(response.intent).toBe('WHAT_IF_ANALYSIS');
    expect(response.suggestedUpdates).toBeDefined();
    expect(response.suggestedUpdates?.sec80CCD1B).toBe(50000);
    expect(response.whatIf).toBeDefined();
    expect(response.whatIf?.scenarioTitle).toContain('NPS');
    expect(response.whatIf?.baselineTax).toBe(baseline.minTax);
    expect(response.quickFollowUps?.length).toBeGreaterThan(0);
  });

  it('assists user in adding a new client invoice/receipt entry', () => {
    const baseline = computeBaselineTax(mockTaxData);
    const response = generateDeterministicChatResponse(
      'Add new entry: received payment of ₹4,00,000 via bank transfer',
      mockTaxData,
      baseline
    );

    expect(response.intent).toBe('ASSIST_ENTRY');
    expect(response.suggestedUpdates).toBeDefined();
    expect(response.suggestedUpdates?.grossReceipts).toBe(4800000 + 400000);
    expect(response.whatIf).toBeDefined();
    expect(response.whatIf?.projectedTax).toBeGreaterThan(0);
    expect(response.reply).toContain('Updated Gross Turnover');
  });

  it('provides Old vs New tax regime comparison and identifies savings', () => {
    const baseline = computeBaselineTax(mockTaxData);
    const response = generateDeterministicChatResponse(
      'Compare Old vs New Tax Regime for my income',
      mockTaxData,
      baseline
    );

    expect(response.intent).toBe('TAX_MINIMIZATION');
    expect(response.reply).toContain('Tax Regime Comparison');
    expect(response.reply).toContain('New Tax Regime');
    expect(response.reply).toContain('Old Tax Regime');
  });

  it('runs processAIChatCopilot end-to-end and returns complete copilot response', async () => {
    const result = await processAIChatCopilot({
      message: 'How can I minimize my tax outlay right now?',
      profile: {
        user: { name: 'Rahul Sharma', identifier: 'rahul@taxpro.in' },
        taxData: mockTaxData,
      },
    });

    expect(result).toBeDefined();
    expect(result.reply).toBeDefined();
    expect(result.reply.length).toBeGreaterThan(50);
    expect(result.quickFollowUps).toBeDefined();
  });
});
