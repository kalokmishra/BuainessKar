/**
 * Day 1 Core Engine - Module 4: Advance Tax & Penalty Engine
 * Calculates quarterly advance tax schedules (June 15, Sept 15, Dec 15, March 15),
 * evaluates shortfalls, and computes Section 234C and Section 234B interest penalties.
 */

import { getTaxSchema } from './schemaLoader.js';
import {
  AdvanceTaxInput,
  AdvanceTaxResult,
  QuarterScheduleResult,
} from './types.js';

/**
 * Calculates advance tax quarterly schedule and penalties
 */
export function calculateAdvanceTax(input: AdvanceTaxInput): AdvanceTaxResult {
  const schema = getTaxSchema();

  const totalEstimatedTax = Math.max(0, input.estimatedAnnualTaxLiability || 0);
  const tdsCredit = Math.max(0, input.tdsTcsCredit || 0);
  const netTaxLiabilityAfterTDS = Math.max(0, totalEstimatedTax - tdsCredit);

  const isPresumptive = input.isPresumptiveTaxpayer !== false; // Default true for 44AD/44ADA utility
  const quarters = schema.advanceTaxSchedule.quarters;

  // Map user payments by quarter
  const paymentsByQuarter: Record<'Q1' | 'Q2' | 'Q3' | 'Q4', number> = {
    Q1: 0,
    Q2: 0,
    Q3: 0,
    Q4: 0,
  };

  if (input.paymentsMade && Array.isArray(input.paymentsMade)) {
    for (const payment of input.paymentsMade) {
      if (payment.quarter && paymentsByQuarter[payment.quarter] !== undefined) {
        paymentsByQuarter[payment.quarter] += Math.max(0, payment.paidAmount || 0);
      }
    }
  }

  let cumulativePaid = 0;
  let totalShortfall = 0;
  let totalInterest234C = 0;
  const scheduleResults: QuarterScheduleResult[] = [];

  for (const q of quarters) {
    const quarterPaid = paymentsByQuarter[q.quarter];
    cumulativePaid += quarterPaid;

    const minPercent = q.minCumulativePercent;
    const targetAmount = Math.round((netTaxLiabilityAfterTDS * minPercent) / 100);
    const shortfall = Math.max(0, targetAmount - cumulativePaid);

    let status: 'COMPLIANT' | 'SHORTFALL' | 'UPCOMING' = 'COMPLIANT';
    let penalty234C = 0;

    if (shortfall > 0) {
      status = 'SHORTFALL';
      totalShortfall += shortfall;

      // Section 234C Interest Penalty calculation:
      // Presumptive taxpayers under 44AD/44ADA receive Section 211 exemption from Q1-Q3 installment penalties
      // provided they pay 100% on or before March 15.
      if (isPresumptive) {
        if (q.quarter === 'Q4') {
          // If March 15 deadline is missed or paid less than 100%, 1% interest applies for 1 month on shortfall
          penalty234C = Math.round(shortfall * 0.01 * 1);
        } else {
          // Exempt for Q1, Q2, Q3 under Section 211(1)(b)
          penalty234C = 0;
        }
      } else {
        // Regular Non-Presumptive Taxpayer Rules
        // Q1 (15%): 1% per month for 3 months if paid < 12%
        // Q2 (45%): 1% per month for 3 months if paid < 36%
        // Q3 (75%): 1% per month for 3 months if paid < 75%
        // Q4 (100%): 1% per month for 1 month if paid < 100%
        const monthsMultiplier = q.quarter === 'Q4' ? 1 : 3;
        penalty234C = Math.round(shortfall * 0.01 * monthsMultiplier);
      }
    }

    totalInterest234C += penalty234C;

    scheduleResults.push({
      quarter: q.quarter,
      dueDate: q.dueDate,
      minPercent,
      targetAmount,
      cumulativePaid,
      shortfall,
      status,
      penalty234C,
    });
  }

  // Section 234B Check: If total advance tax paid before March 31 is less than 90% of net tax liability
  const ninetyPercentTarget = Math.round(netTaxLiabilityAfterTDS * 0.9);
  const isInterest234BApplicable = cumulativePaid < ninetyPercentTarget;

  const presumptiveNote = isPresumptive
    ? 'Special Statutory Privilege (Section 211(1)(b)): As a presumptive taxpayer under Section 44AD / 44ADA, you are exempt from Q1, Q2, and Q3 quarterly advance tax installments without incurring Section 234C interest penalties, provided 100% of your advance tax is deposited on or before March 15.'
    : 'Standard Advance Tax Rules apply: Installments due on June 15 (15%), Sept 15 (45%), Dec 15 (75%), and March 15 (100%).';

  return {
    netTaxLiabilityAfterTDS,
    totalPaidToDate: cumulativePaid,
    schedule: scheduleResults,
    totalShortfall,
    totalInterest234C,
    isInterest234BApplicable,
    presumptiveSpecialBenefitNote: presumptiveNote,
  };
}
