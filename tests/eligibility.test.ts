import { describe, expect, it } from 'vitest';
import { evaluateEligibility } from '../src/engine/eligibility.js';

describe('Module 1: Eligibility & Routing Engine', () => {
  it('should qualify an Individual IT consultant with 10% cash under Section 44ADA', () => {
    const result = evaluateEligibility({
      entityType: 'INDIVIDUAL',
      activityType: 'PROFESSION',
      professionCategory: 'IT_SOFTWARE',
      grossReceipts: 4500000, // ₹45 Lakhs (< ₹50L standard limit)
      cashReceipts: 450000, // 10% cash (exceeds 5% so limit is ₹50L, but 45L <= 50L)
    });

    expect(result.isEligible).toBe(true);
    expect(result.workflowRoute).toBe('SECTION_44ADA');
    expect(result.applicableSection).toBe('44ADA');
    expect(result.applicableTurnoverLimit).toBe(5000000); // Standard limit ₹50L
    expect(result.isExtendedLimitApplied).toBe(false);
  });

  it('should grant extended ₹75L limit for Section 44ADA when cash <= 5%', () => {
    const result = evaluateEligibility({
      entityType: 'INDIVIDUAL',
      activityType: 'PROFESSION',
      professionCategory: 'IT_SOFTWARE',
      grossReceipts: 6500000, // ₹65 Lakhs
      cashReceipts: 100000, // ~1.53% cash (<= 5%)
    });

    expect(result.isEligible).toBe(true);
    expect(result.workflowRoute).toBe('SECTION_44ADA');
    expect(result.applicableTurnoverLimit).toBe(7500000); // Extended limit ₹75L
    expect(result.isExtendedLimitApplied).toBe(true);
  });

  it('should disqualify LLPs and Private Limited companies from presumptive tax', () => {
    const llpResult = evaluateEligibility({
      entityType: 'LLP',
      activityType: 'PROFESSION',
      professionCategory: 'LEGAL',
      grossReceipts: 3000000,
      cashReceipts: 0,
    });

    expect(llpResult.isEligible).toBe(false);
    expect(llpResult.workflowRoute).toBe('STANDARD_AUDIT_REQUIRED');
    expect(llpResult.disqualificationReasons.some((r) => r.includes('LLP'))).toBe(true);
  });

  it('should disqualify Commission / Brokerage business under Section 44AD', () => {
    const result = evaluateEligibility({
      entityType: 'INDIVIDUAL',
      activityType: 'BUSINESS',
      businessCategory: 'COMMISSION_OR_BROKERAGE',
      grossReceipts: 5000000,
      cashReceipts: 100000,
    });

    expect(result.isEligible).toBe(false);
    expect(result.workflowRoute).toBe('STANDARD_AUDIT_REQUIRED');
    expect(result.disqualificationReasons.some((r) => r.includes('Commission'))).toBe(true);
  });

  it('should trigger Section 44AB tax audit if gross receipts exceed statutory limits', () => {
    const result = evaluateEligibility({
      entityType: 'INDIVIDUAL',
      activityType: 'BUSINESS',
      businessCategory: 'RETAIL_TRADING',
      grossReceipts: 35000000, // ₹3.5 Crore (exceeds ₹3Cr extended limit)
      cashReceipts: 1000000, // 2.8%
    });

    expect(result.isEligible).toBe(false);
    expect(result.workflowRoute).toBe('STANDARD_AUDIT_REQUIRED');
    expect(result.applicableSection).toBe('44AB_AUDIT');
  });

  it('should trigger Section 44AB tax audit if user claims profit lower than statutory minimum', () => {
    const result = evaluateEligibility({
      entityType: 'INDIVIDUAL',
      activityType: 'PROFESSION',
      professionCategory: 'ENGINEERING',
      grossReceipts: 4000000, // ₹40 Lakhs (minimum profit 50% = 20L)
      cashReceipts: 0,
      declaredProfit: 1000000, // ₹10 Lakhs (25% < 50%)
    });

    expect(result.isEligible).toBe(false);
    expect(result.workflowRoute).toBe('STANDARD_AUDIT_REQUIRED');
    expect(result.disqualificationReasons.some((r) => r.includes('lower profit'))).toBe(true);
  });
});
