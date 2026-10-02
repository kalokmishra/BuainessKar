import { describe, it, expect } from 'vitest';
import {
  computeBaselineTax,
  generateDeterministicChatResponse,
  processAIChatCopilot,
  parseIndianAmount,
  extractIndianNumericalEntities,
  preprocessIndianNumericalIdioms,
  TaxProfileContext,
} from '../src/engine/aiChatCopilot';

describe('AI Tax Chat Copilot Engine & Indian Numerical Idioms Pre-processor', () => {
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

  describe('Indian Numerical Idioms Pre-processing Module', () => {
    it('normalizes "50k", "50 k", and "50 hazar" to exact integer 50,000 (NOT 50)', () => {
      const res1 = preprocessIndianNumericalIdioms('i received 50k from my mother');
      expect(res1.entities.length).toBe(1);
      expect(res1.entities[0].originalIdiom).toBe('50k');
      expect(res1.entities[0].normalizedInteger).toBe(50000);
      expect(res1.entities[0].formattedINR).toBe('₹50,000');
      expect(res1.annotatedText).toContain('50k [₹50,000]');

      const res2 = preprocessIndianNumericalIdioms('transferred 50 k');
      expect(res2.entities[0].normalizedInteger).toBe(50000);

      const res3 = preprocessIndianNumericalIdioms('received 50 hazar');
      expect(res3.entities[0].normalizedInteger).toBe(50000);
    });

    it('normalizes "5 lakhs", "5L", and "1.5L" to precise integer values', () => {
      const resLakh = preprocessIndianNumericalIdioms('got client invoice of 5 lakhs');
      expect(resLakh.entities.length).toBe(1);
      expect(resLakh.entities[0].normalizedInteger).toBe(500000);
      expect(resLakh.entities[0].formattedINR).toBe('₹5,00,000');

      const res1_5L = preprocessIndianNumericalIdioms('billed 1.5L for software consulting');
      expect(res1_5L.entities[0].normalizedInteger).toBe(150000);
      expect(res1_5L.entities[0].formattedINR).toBe('₹1,50,000');
    });

    it('normalizes "2cr" and "2.5 crore" to precise integer values', () => {
      const resCr = preprocessIndianNumericalIdioms('annual gross turnover is 2cr');
      expect(resCr.entities.length).toBe(1);
      expect(resCr.entities[0].normalizedInteger).toBe(20000000);
      expect(resCr.entities[0].formattedINR).toBe('₹2,00,00,000');

      const resCrDec = preprocessIndianNumericalIdioms('turnover crossed 2.5 crore');
      expect(resCrDec.entities[0].normalizedInteger).toBe(25000000);
    });

    it('normalizes phrasal number idioms like "fifty thousand" and "five lakhs"', () => {
      const phrasal = preprocessIndianNumericalIdioms('received fifty thousand rupees gift');
      expect(phrasal.entities.length).toBe(1);
      expect(phrasal.entities[0].normalizedInteger).toBe(50000);

      const phrasalLakh = preprocessIndianNumericalIdioms('total fee is five lakhs');
      expect(phrasalLakh.entities.length).toBe(1);
      expect(phrasalLakh.entities[0].normalizedInteger).toBe(500000);
    });

    it('generates structured Markdown mapping table for system prompt injection', () => {
      const pre = preprocessIndianNumericalIdioms('i received 50k from my mother and 5 lakhs from client');
      expect(pre.entities.length).toBe(2);
      expect(pre.markdownMappingTable).toContain('`50k`');
      expect(pre.markdownMappingTable).toContain('50,000');
      expect(pre.markdownMappingTable).toContain('`5 lakhs`');
      expect(pre.markdownMappingTable).toContain('5,00,000');
    });
  });

  describe('Chat Copilot Intent Handling & Statutory Rules', () => {
    it('handles "i received 50k from my mother" with pre-processed precision and Section 56(2)(x) exemption', () => {
      const baseline = computeBaselineTax(mockTaxData);
      const response = generateDeterministicChatResponse(
        'i received 50k from my mother',
        mockTaxData,
        baseline
      );

      expect(response.intent).toBe('TAX_MINIMIZATION');
      expect(response.reply).toContain('Section 56(2)(x)');
      expect(response.reply).toContain('₹50,000');
      // Crucial check: ensures it explains 50,000 and explicitly confirms NOT ₹50
      expect(response.reply).toContain('NOT ₹50');
      expect(response.reply).toContain('100% EXEMPT FROM INCOME TAX');
      expect(response.reply).toContain('**Impact on Gross Turnover**: **₹0**');
      // Ensure it does not increase gross receipts
      expect(response.suggestedUpdates).toBeUndefined();
      // Ensure preprocessedEntities are returned
      expect(response.preprocessedEntities).toBeDefined();
      expect(response.preprocessedEntities?.[0].normalizedInteger).toBe(50000);
      expect(response.preprocessedEntities?.[0].formattedINR).toBe('₹50,000');
    });

    it('handles What-If analysis for Section 80CCD(1B) NPS contribution using "50k"', () => {
      const baseline = computeBaselineTax(mockTaxData);
      const response = generateDeterministicChatResponse(
        'What if I invest 50k in NPS Tier-1 under Section 80CCD(1B)?',
        mockTaxData,
        baseline
      );

      expect(response.intent).toBe('WHAT_IF_ANALYSIS');
      expect(response.suggestedUpdates).toBeDefined();
      expect(response.suggestedUpdates?.sec80CCD1B).toBe(50000);
      expect(response.whatIf).toBeDefined();
      expect(response.whatIf?.scenarioTitle).toContain('NPS');
      expect(response.whatIf?.baselineTax).toBe(baseline.minTax);
      expect(response.preprocessedEntities?.[0].normalizedInteger).toBe(50000);
    });

    it('assists user in adding a new client invoice of "5 lakhs"', () => {
      const baseline = computeBaselineTax(mockTaxData);
      const response = generateDeterministicChatResponse(
        'Add new invoice of 5 lakhs received via bank transfer',
        mockTaxData,
        baseline
      );

      expect(response.intent).toBe('ASSIST_ENTRY');
      expect(response.suggestedUpdates).toBeDefined();
      expect(response.suggestedUpdates?.grossReceipts).toBe(4800000 + 500000);
      expect(response.whatIf).toBeDefined();
      expect(response.reply).toContain('Updated Gross Turnover');
      expect(response.preprocessedEntities?.[0].normalizedInteger).toBe(500000);
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

    it('runs processAIChatCopilot end-to-end and returns complete copilot response with preprocessedEntities', async () => {
      const result = await processAIChatCopilot({
        message: 'i received 50k from my mother, is it taxable?',
        profile: {
          user: { name: 'Rahul Sharma', identifier: 'rahul@taxpro.in' },
          taxData: mockTaxData,
        },
      });

      expect(result).toBeDefined();
      expect(result.reply).toBeDefined();
      expect(result.reply.length).toBeGreaterThan(50);
      expect(result.preprocessedEntities).toBeDefined();
      expect(result.preprocessedEntities?.[0].normalizedInteger).toBe(50000);
    });
  });
});
