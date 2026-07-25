import { describe, expect, it } from 'vitest';
import { evaluateCashSurveillance } from '../src/engine/cashSurveillance.js';

describe('Module 2: Cash Surveillance Engine', () => {
  it('should return NORMAL for cash receipts strictly below 4.5%', () => {
    const result = evaluateCashSurveillance({
      grossReceipts: 5000000,
      cashReceipts: 150000, // 3.0%
    });

    expect(result.cashPercentage).toBe(3.0);
    expect(result.status).toBe('NORMAL');
    expect(result.alertTitle).toContain('Safe Limits');
  });

  it('should trigger TIER_1_WARNING when cash receipts are between 4.5% and 5.0%', () => {
    const result = evaluateCashSurveillance({
      grossReceipts: 10000000,
      cashReceipts: 480000, // 4.8%
    });

    expect(result.cashPercentage).toBe(4.8);
    expect(result.status).toBe('TIER_1_WARNING');
    expect(result.alertTitle).toContain('TIER 1 WARNING');
  });

  it('should trigger TIER_2_VIOLATION when cash receipts exceed 5.0%', () => {
    const result = evaluateCashSurveillance({
      grossReceipts: 10000000,
      cashReceipts: 550000, // 5.5%
    });

    expect(result.cashPercentage).toBe(5.5);
    expect(result.status).toBe('TIER_2_VIOLATION');
    expect(result.alertTitle).toContain('TIER 2 VIOLATION');
  });

  it('should correctly handle zero receipts gracefully', () => {
    const result = evaluateCashSurveillance({
      grossReceipts: 0,
      cashReceipts: 0,
    });

    expect(result.cashPercentage).toBe(0);
    expect(result.status).toBe('NORMAL');
  });
});
