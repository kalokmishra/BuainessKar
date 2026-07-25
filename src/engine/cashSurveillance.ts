/**
 * Day 1 Core Engine - Module 2: Cash Surveillance Engine
 * Monitors cash-to-gross receipts percentage for Section 44AD / 44ADA 5% threshold compliance.
 */

import { getTaxSchema } from './schemaLoader.js';
import {
  CashSurveillanceInput,
  CashSurveillanceResult,
  SurveillanceStatus,
} from './types.js';

/**
 * Calculates cash percentage and surveillance alert status
 */
export function evaluateCashSurveillance(input: CashSurveillanceInput): CashSurveillanceResult {
  const schema = getTaxSchema();

  const grossReceipts = Math.max(0, input.grossReceipts || 0);
  const cashReceipts = Math.max(0, input.cashReceipts || 0);
  const digitalReceipts = Math.max(0, grossReceipts - cashReceipts);

  const cashPercentage = grossReceipts > 0 ? (cashReceipts / grossReceipts) * 100 : 0;
  const roundedPercentage = Number(cashPercentage.toFixed(2));

  const normalThreshold = schema.cashSurveillance.normalUpperThreshold; // 4.5%
  const warningThreshold = schema.cashSurveillance.warningUpperThreshold; // 5.0%

  let status: SurveillanceStatus = 'NORMAL';
  let alertTitle = 'Cash Collections Within Safe Limits';
  let alertMessage = `Cash receipts are ${roundedPercentage}%, well within the statutory 5.0% cap. You qualify for extended digital limits (₹75L for 44ADA / ₹3Cr for 44AD).`;
  let localizedHindiAlert = `कैश प्राप्तियां ${roundedPercentage}% हैं, जो कि 5% की वैधानिक सीमा के सुरक्षित दायरे में हैं। आप विस्तारित सीमा का लाभ लेने के पात्र हैं।`;
  let actionRequired = 'No immediate action required. Maintain current digital collection ratio.';

  if (roundedPercentage > warningThreshold) {
    status = 'TIER_2_VIOLATION';
    alertTitle = '🚨 TIER 2 VIOLATION: Statutory Cash Limit Exceeded (>5.0%)';
    alertMessage = schema.cashSurveillance.tier2ViolationMessage;
    localizedHindiAlert = `चेतावनी! कैश प्राप्तियां ${roundedPercentage}% हो गई हैं जो कि 5% की वैधानिक सीमा से अधिक है। आपकी विस्तारित टर्नओवर सीमा (₹75 लाख/₹3 करोड़) समाप्त हो गई है और मानक सीमा (₹50 लाख/₹2 करोड़) लागू होगी।`;
    actionRequired =
      'Immediate Action Required: Shift all future collections to digital modes (UPI, NEFT, RTGS, Cheque). If turnover exceeds standard limit, arrange for Section 44AB Tax Audit.';
  } else if (roundedPercentage >= normalThreshold) {
    status = 'TIER_1_WARNING';
    alertTitle = '⚠️ TIER 1 WARNING: Cash Level Approaching 5.0% Cap';
    alertMessage = schema.cashSurveillance.tier1WarningMessage;
    localizedHindiAlert = `सावधान! कैश प्राप्तियां ${roundedPercentage}% तक पहुंच गई हैं। 5% की सीमा पार होने पर विस्तारित टर्नओवर छूट समाप्त हो जाएगी। आगामी भुगतानों को डिजिटल रूप में स्वीकार करें।`;
    actionRequired =
      'Action Recommended: Pause cash collections. Route all remaining receivables through bank or UPI channels to prevent breaching the 5% barrier.';
  }

  return {
    grossReceipts,
    cashReceipts,
    digitalReceipts,
    cashPercentage: roundedPercentage,
    status,
    alertTitle,
    alertMessage,
    localizedHindiAlert,
    actionRequired,
  };
}
