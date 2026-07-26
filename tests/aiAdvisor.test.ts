import { describe, it, expect } from 'vitest';
import { generateAITaxTips } from '../src/engine/aiAdvisor';

describe('AI Tax Advisor Engine Module', () => {
  it('should generate structured tax advice response for a Section 44ADA consultant', async () => {
    const input = {
      entityType: 'INDIVIDUAL',
      activityType: 'PROFESSION',
      professionCategory: 'IT_SOFTWARE',
      grossReceipts: 4800000,
      cashReceipts: 120000,
      cashPercentage: 2.5,
      deemedProfit: 2400000,
      recommendedRegime: 'NEW' as const,
      oldRegimeTax: 507000,
      newRegimeTax: 395200,
      taxSavings: 111800,
      chapterVIADeductions: 150000,
      tdsClaimed: 25000,
      workflowRoute: 'SECTION_44ADA',
    };

    const res = await generateAITaxTips(input);

    expect(res).toBeDefined();
    expect(res.summary).toContain('24,00,000');
    expect(res.tips.length).toBeGreaterThanOrEqual(3);
    expect(res.actionChecklist.length).toBeGreaterThanOrEqual(2);

    const regimeTip = res.tips.find((t) => t.category === 'REGIME_OPTIMIZATION');
    expect(regimeTip).toBeDefined();
    expect(regimeTip?.statutoryRef).toBe('Section 115BAC(1A)');
  });

  it('should generate warning and tips for Old Regime and high cash percentage', async () => {
    const input = {
      entityType: 'INDIVIDUAL',
      activityType: 'BUSINESS',
      businessCategory: 'RETAIL_TRADING',
      grossReceipts: 15000000,
      cashReceipts: 720000,
      cashPercentage: 4.8,
      deemedProfit: 980000,
      recommendedRegime: 'OLD' as const,
      oldRegimeTax: 120000,
      newRegimeTax: 150000,
      taxSavings: 30000,
      chapterVIADeductions: 250000,
      tdsClaimed: 10000,
      workflowRoute: 'SECTION_44AD',
    };

    const res = await generateAITaxTips(input);

    expect(res).toBeDefined();
    const cashTip = res.tips.find((t) => t.category === 'CASH_SURVEILLANCE');
    expect(cashTip).toBeDefined();
    expect(cashTip?.recommendation).toContain('4.80%');
  });
});
